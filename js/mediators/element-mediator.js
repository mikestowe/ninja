/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    NJComponent = require("js/lib/nj-base").NJComponent;

var ElementController = require("js/controllers/elements/element-controller").ElementController,
    Command     =   require("js/controllers/undo-controller").Command,
    GroupCommand = require("js/controllers/undo-controller").GroupCommand,
    NJUtils = require("js/lib/NJUtils").NJUtils;

exports.ElementMediator = Montage.create(NJComponent, {

    deleteDelegate: {
        value: null
    },

    deserializedFromTemplate: {
        value: function () {
            this.eventManager.addEventListener("elementAdding", this, false);
            this.eventManager.addEventListener("deleting", this, false);
        }
    },

    // TODO use the specific controller to be able to subclass the functionality
    handleElementAdding: {
        value: function(event) {
            /*
            var cmd = ElementControllerCommands.addElementCommand(event.detail.el, event.detail.data);
            NJevent("sendToUndo", cmd);
            cmd.execute();
            */
            this.addElement(event.detail.el, event.detail.data);

        }
    },

    handleDeleting: {
        value: function(event) {
            if(this.deleteDelegate && (typeof this.deleteDelegate.handleDelete === 'function')) {
                this.deleteDelegate.handleDelete();
            } else {
                // Add the Undo/Redo
                var els = [],
                    len = this.application.ninja.selectedElements.length;

                if(len) {
                    for(var i = 0; i<len; i++) {
                        els.push(this.application.ninja.selectedElements[i]);
                    }
                    
                    for(i=0; i<len; i++) {
                        this._removeElement(els[i]._element);
                    }

                    NJevent( "deleteSelection", els );
                }
            }
        }
    },

    addElement: {
        value: function(el, rules, noEvent) {
            var command = Montage.create(Command, {
                _el:            { value: el },
                _rules:         { value: rules },
                _noEvent:       { value: noEvent },

                description: { value: "Adding Element"},

                receiver: { value: this},

                execute: {
                    value: function() {
                        this.receiver._addElement(this._el, this._rules, this._noEvent);
                        return this._el;
                    }
                },

                unexecute: {
                    value: function() {
                        this.receiver._removeElement(this._el, this._rules, this._noEvent);
                        return this._el;
                    }
                }
            });

            NJevent("sendToUndo", command);
            command.execute();
        }
    },

    _addElement: {
        value: function(el, rules, noEvent) {
            ElementController.addElement(el, rules);
            var p3d = this.get3DProperties(el);
            if(p3d)
            {
                el.elementModel.controller["set3DProperties"](el, [p3d], 0, true);
            }
            if(!noEvent) {
                this.application.ninja.documentController.activeDocument.dirtyFlag = true;
                NJevent("elementAdded", el);
            }
        }
    },

    deleteElements: {
         value: function(items) {
            // Add the Undo/Redo
            var len, el;

            len = items.length;

            if(len) {

                for(var i = len - 1; i >= 0; i--) {
                    el = items[i]._element || items[i];
                    this._removeElement(el);
                }

                NJevent( "deleteSelection", items );
            }
         }
    },

    _removeElement: {
        value: function(el, rules) {
            ElementController.removeElement(el, rules);
            this.application.ninja.documentController.activeDocument.dirtyFlag = true;
            NJevent("elementDeleted", el);
        }
    },

    replaceElement: {
        value: function(el, el2) {
            el2.elementModel = el.elementModel;
            this.application.ninja.currentDocument.documentRoot.replaceChild(el2, el);
        }
    },

    getNJProperty: {
        value: function(el, p) {
            if(el.elementModel) {
                if(el.elementModel.hasOwnProperty(p)) {
                    return el.elementModel[p];
                } else {
                    console.log("Element Model does not have ", p);
                }
            } else {
                console.log("Element has no Model -- Create one");
            }
        }
    },

    getProperty: {
        value: function(el, prop, valueMutator) {
            if(!el.elementModel) {
                console.log("Element has no Model -> One should have been created");
                NJUtils.makeElementModel(el, "Div", "block");
            }

            if(valueMutator && typeof valueMutator === "function") {
                return valueMutator(el.elementModel.controller["getProperty"](el, prop));
            } else {
                return el.elementModel.controller["getProperty"](el, prop, valueMutator);
            }
        }
    },

    getShapeProperty: {
        value: function(el, prop) {
            if(!el.elementModel) {
                console.log("Element has no Model -> One should have been created");
                NJUtils.makeElementModel(el, "Canvas", "block", true);
            }

            return el.elementModel.controller["getShapeProperty"](el, prop);
        }
    },

    setShapeProperty: {
        value: function(el, prop, value) {
            if(!el.elementModel) {
                console.log("Element has no Model -> One should have been created");
                NJUtils.makeElementModel(el, "Canvas", "block", true);
            }

            this.application.ninja.documentController.activeDocument.dirtyFlag = true;

            return el.elementModel.controller["setShapeProperty"](el, prop, value);
        }
    },

    /**
     Set a property change command for an element or array of elements
     @param els: Array of elements. Can contain 1 or more elements
     @param p: Property to set
     @param value: Value to be set. This is an array of values corresponding to the array of elements
     @param eventType: Change/Changing. Will be passed to the dispatched event
     @param source: String for the source object making the call
     @param currentValue *OPTIONAL*: current value array. If not found the current value is calculated
     @param stageRedraw: *OPTIONAL*: True. If set to false the stage will not redraw the selection/outline
     */
    setAttribute: {
        value: function(el, att, value, eventType, source, currentValue) {

            if(eventType === "Changing") {
                this._setAttribute(el, att, value, eventType, source);
            } else {
                // Calculate currentValue if not found for each element
                if(currentValue === null) {
                    console.log("Here");
                    var item = el._element || el;
                    currentValue = item.getAttribute(att);
                }

                var command = Montage.create(Command, {
                    _el:                { value: el },
                    _att:               { value: att },
                    _value:             { value: value },
                    _previous:          { value: currentValue },
                    _eventType:         { value: eventType},
                    _source:            { value: "undo-redo"},
                    description:        { value: "Set Attribute"},
                    receiver:           { value: this},

                    execute: {
                        value: function(senderObject) {
                            if(senderObject) this._source = senderObject;
                            this.receiver._setAttribute(this._el, this._att, this._value, this._eventType, this._source);
                            this._source = "undo-redo";
                            return "";
                        }
                    },

                    unexecute: {
                        value: function() {
                            this.receiver._setAttribute(this._el, this._att, this._previous, this._eventType, this._source);
                            return "";
                        }
                    }
                });

                NJevent("sendToUndo", command);
                command.execute(source);
            }

        }
    },

    _setAttribute: {
        value: function(el, att, value, eventType, source) {
            var item = el._element || el;

            item.elementModel.controller["setAttribute"](item, att, value);

            this.application.ninja.documentController.activeDocument.dirtyFlag = true;

            NJevent("attribute" + eventType, {type : "setAttribute", source: source, data: {"els": el, "prop": att, "value": value}, redraw: null});
        }
    },



    /**
     Set a property change command for an element or array of elements
     @param els: Array of elements. Can contain 1 or more elements
     @param p: Property to set
     @param value: Value to be set. This is an array of values corresponding to the array of elements
     @param eventType: Change/Changing. Will be passed to the dispatched event
     @param source: String for the source object making the call
     @param currentValue *OPTIONAL*: current value array. If not found the current value is calculated
     @param stageRedraw: *OPTIONAL*: True. If set to false the stage will not redraw the selection/outline
     */
    setProperty: {
        value: function(els, p, value, eventType, source, currentValue, stageRedraw) {
            if(eventType === "Changing") {
                this._setProperty(els, p, value, eventType, source);
            } else {
                // Calculate currentValue if not found for each element
                if(!currentValue) {
                    var that = this;
                    currentValue = els.map(function(item) {
                        return that.getProperty((item._element || item), p);
                    });
                }

                var command = Montage.create(Command, {
                    _els:               { value: els },
                    _p:                 { value: p },
                    _value:             { value: value },
                    _previous:          { value: currentValue },
                    _eventType:         { value: eventType},
                    _source:            { value: "undo-redo"},
                    description:        { value: "Set Property"},
                    receiver:           { value: this},

                    execute: {
                        value: function(senderObject) {
                            if(senderObject) this._source = senderObject;
                            this.receiver._setProperty(this._els, this._p, this._value, this._eventType, this._source);
                            this._source = "undo-redo";
                            return "";
                        }
                    },

                    unexecute: {
                        value: function() {
                            this.receiver._setProperty(this._els, this._p, this._previous, this._eventType, this._source);
                            return "";
                        }
                    }
                });

                NJevent("sendToUndo", command);
                command.execute(source);
            }

        }
    },

    _setProperty: {
        value: function(els, p, value, eventType, source) {
            var el;

            for(var i=0, item; item = els[i]; i++) {
                el = item._element || item;
                el.elementModel.controller["setProperty"](el, p, value[i]);
            }

            this.application.ninja.documentController.activeDocument.dirtyFlag = true;

            NJevent("element" + eventType, {type : "setProperty", source: source, data: {"els": els, "prop": p, "value": value}, redraw: null});
        }
    },

    /**
     Set a property change command for an element or array of elements
     @param els: Array of elements. Can contain 1 or more elements
     @param props: Property/ies object containing both the value and property
     @param eventType: Change/Changing. Will be passed to the dispatched event
     @param source: String for the source object making the call
     @param currentProps *OPTIONAL*: current properties objects array. If not found it will be calculated
     @param stageRedraw: *OPTIONAL*: True. If set to false the stage will not redraw the selection/outline
     */
    setProperties: {
        value: function(els, props, eventType, source, currentProps, stageRedraw) {
            if(eventType === "Changing") {
                this._setProperties(els, props, eventType, source);
            } else {
                var command = Montage.create(Command, {
                    _els:               { value: els },
                    _props:             { value: props },
                    _previous:          { value: currentProps },
                    _eventType:         { value: eventType},
                    _source:            { value: "undo-redo"},
                    description:        { value: "Set Properties"},
                    receiver:           { value: this},

                    execute: {
                        value: function(senderObject) {
                            if(senderObject) this._source = senderObject;
                            this.receiver._setProperties(this._els, this._props, this._eventType, this._source);
                            this._source = "undo-redo";
                            return "";
                        }
                    },

                    unexecute: {
                        value: function() {
                            this.receiver._setProperties(this._els, this._previous, this._eventType, this._source);
                            return "";
                        }
                    }
                });

                NJevent("sendToUndo", command);
                command.execute(source);
            }
        }
    },

    _setProperties: {
        value: function(els, props, eventType, source) {
            var el, propsArray;

            for(var i=0, item; item = els[i]; i++) {
                el = item._element || item;
                el.elementModel.controller["setProperties"](el, props, i);
            }

            this.application.ninja.documentController.activeDocument.dirtyFlag = true;

            NJevent("element" + eventType, {type : "setProperties", source: source, data: {"els": els, "prop": props, "value": props}, redraw: null});
        }
    },

    /**
     Set a property change command for an element or array of elements
     @param els: Array of elements. Can contain 1 or more elements
     @param props: Property/ies object containing both the value and property
     @param eventType: Change/Changing. Will be passed to the dispatched event
     @param source: String for the source object making the call
     @param currentProps *OPTIONAL*: current properties objects array. If not found it will be calculated
     @param stageRedraw: *OPTIONAL*: True. If set to false the stage will not redraw the selection/outline
     */
    set3DProperties: {
        value: function(els, props, eventType, source, currentProps, stageRedraw) {
            if(eventType === "Changing") {
                this._set3DProperties(els, props, eventType, source);
            } else {
                // Calculate currentProps if not found for each element
                if(!currentProps) {
                    var that = this;
                    currentProps = els.map(function(item) {
                        return that.get3DProperties(item);
                    });
                }

                var command = Montage.create(Command, {
                    _els:               { value: els },
                    _props:             { value: props },
                    _previous:          { value: currentProps },
                    _eventType:         { value: eventType},
                    _source:            { value: "undo-redo"},
                    description:        { value: "Set 3D Properties"},
                    receiver:           { value: this},

                    execute: {
                        value: function(senderObject) {
                            if(senderObject) this._source = senderObject;
                            this.receiver._set3DProperties(this._els, this._props, this._eventType, this._source);
                            this._source = "undo-redo";
                            return "";
                        }
                    },

                    unexecute: {
                        value: function() {
                            this.receiver._set3DProperties(this._els, this._previous, this._eventType, this._source);
                            return "";
                        }
                    }
                });

                NJevent("sendToUndo", command);
                command.execute(source);
            }
        }
    },

    _set3DProperties: {
        value: function(els, props, eventType, source) {
            var el,
                update3DModel = false;

            if(eventType === "Change")
            {
                update3DModel = true;
            }
            for(var i=0, item; item = els[i]; i++) {
                el = item._element || item;
                el.elementModel.controller["set3DProperties"](el, props, i, update3DModel);
            }

            this.application.ninja.documentController.activeDocument.dirtyFlag = true;

            NJevent("element" + eventType, {type : "set3DProperties", source: source, data: {"els": els, "prop": "matrix", "value": props}, redraw: null});
        }
    },


    //--------------------------------------------------------------------------------------------------------
    // Routines to get/set color
    // for now just return the bg/fill color
    getColor: {
        value: function(el, isFill) {
            if(!el.elementModel) {
                NJUtils.makeElementModel2(el);
            }
            return el.elementModel.controller["getColor"](el, isFill);
        }
    },

    /**
     Set a property change command for an element or array of elements
     @param els: Array of elements. Can contain 1 or more elements
     @param value: Value to be set. This is the color
     @param isFill: Specifies if setting fill (background) or stroke (border)
     @param eventType: Change/Changing. Will be passed to the dispatched event
     @param source: String for the source object making the call
     @param currentValue *OPTIONAL*: current value array. If not found the current value is calculated
     @param stageRedraw: *OPTIONAL*: True. If set to false the stage will not redraw the selection/outline
     */
    setColor: {
        value: function(els, value, isFill, eventType, source, currentValue, stageRedraw) {

            if(eventType === "Changing") {
                this._setColor(els, value, isFill, eventType, source);
            } else {
                // Calculate currentValue if not found for each element
                if(!currentValue) {
                    var that = this;
                    currentValue = els.map(function(item) {
                        return that.getColor(item._element, isFill);
                    });
                }

                var command = Montage.create(Command, {
                    _els:               { value: els },
                    _value:             { value: value },
                    _isFill:            { value: isFill },
                    _previous:          { value: currentValue },
                    _eventType:         { value: eventType},
                    _source:            { value: "undo-redo"},
                    description:        { value: "Set Color"},
                    receiver:           { value: this},

                    execute: {
                        value: function(senderObject) {
                            if(senderObject) this._source = senderObject;
                            this.receiver._setColor(this._els, this._value, this._isFill, this._eventType, this._source);
                            this._source = "undo-redo";
                            return "";
                        }
                    },

                    unexecute: {
                        value: function() {
                            this.receiver._setColor(this._els, this._previous, this._isFill, this._eventType, this._source);
                            return "";
                        }
                    }
                });

                NJevent("sendToUndo", command);
                command.execute(source);
            }

        }
    },

    _setColor: {
        value: function(els, value, isFill, eventType, source) {
            var el;

            for(var i=0, item; item = els[i]; i++) {
                el = item._element || item;
                el.elementModel.controller["setColor"](el, value, isFill);
            }

            this.application.ninja.documentController.activeDocument.dirtyFlag = true;

            NJevent("element" + eventType, {type : "setColor", source: source, data: {"els": els, "prop": "color", "value": value, "isFill": isFill}, redraw: null});
        }
    },



    getStroke: {
        value: function(el) {
            if(!el.elementModel) {
                NJUtils.makeElementModel(el, "Div", "block");
            }
            return el.elementModel.controller["getStroke"](el);
        }
    },


    /**
     Set a property change command for an element or array of elements
     @param els: Array of elements. Can contain 1 or more elements
     @param value: Value to be set. This is the stroke info
     @param eventType: Change/Changing. Will be passed to the dispatched event
     @param source: String for the source object making the call
     @param currentValue *OPTIONAL*: current value array. If not found the current value is calculated
     @param stageRedraw: *OPTIONAL*: True. If set to false the stage will not redraw the selection/outline
     */
    setStroke: {
        value: function(els, value, eventType, source, currentValue, stageRedraw) {

            if(eventType === "Changing") {
                this._setStroke(els, value, isFill, eventType, source);
            } else {
                // Calculate currentValue if not found for each element
                if(!currentValue) {
                    var that = this;
                    currentValue = els.map(function(item) {
                        return that.getStroke(item._element);
                    });
                }

                var command = Montage.create(Command, {
                    _els:               { value: els },
                    _value:             { value: value },
                    _previous:          { value: currentValue },
                    _eventType:         { value: eventType},
                    _source:            { value: "undo-redo"},
                    description:        { value: "Set Color"},
                    receiver:           { value: this},

                    execute: {
                        value: function(senderObject) {
                            if(senderObject) this._source = senderObject;
                            this.receiver._setStroke(this._els, this._value, this._eventType, this._source);
                            this._source = "undo-redo";
                            return "";
                        }
                    },

                    unexecute: {
                        value: function() {
                            this.receiver._setStroke(this._els, this._previous, this._eventType, this._source);
                            return "";
                        }
                    }
                });

                NJevent("sendToUndo", command);
                command.execute(source);
            }

        }
    },

    _setStroke: {
        value: function(els, value, eventType, source) {
            var el;

            for(var i=0, item; item = els[i]; i++) {
                el = item._element || item;
                el.elementModel.controller["setStroke"](el, value);
            }

            this.application.ninja.documentController.activeDocument.dirtyFlag = true;

            NJevent("element" + eventType, {type : "setStroke", source: source, data: {"els": els, "prop": "stroke", "value": value}, redraw: null});
        }
    },

    getColor2: {
        value: function(el, prop, mutator) {
            if(!el.elementModel) {
                NJUtils.makeElementModel2(el);
            }

            return this.getColor(el, (prop === "background"));
        }
    },

    //--------------------------------------------------------------------------------------------------------
    // Routines to get/set 3D properties
    get3DProperty: {
        value: function(el, prop) {
            if(!el.elementModel) {
                NJUtils.makeElementModel2(el);
            }
            return el.elementModel.controller["get3DProperty"](el, prop);
        }
    },

    get3DProperties: {
        value: function(el) {
            if(!el.elementModel) {
                NJUtils.makeElementModel2(el);
            }
//            var mat = this.getMatrix(el);
//            var dist = this.getPerspectiveDist(el);
            var mat = el.elementModel.controller["getMatrix"](el);
            var dist = el.elementModel.controller["getPerspectiveDist"](el);
            return {mat:mat, dist:dist};
        }
    },

    getMatrix: {
        value: function(el) {
            if(!el.elementModel) {
                NJUtils.makeElementModel2(el);
            }
            return el.elementModel.controller["getMatrix"](el);
        }
    },

    getPerspectiveDist: {
        value: function(el) {
            if(!el.elementModel) {
                NJUtils.makeElementModel2(el);
            }
            return el.elementModel.controller["getPerspectiveDist"](el);
        }
    },

    getPerspectiveMode: {
        value: function(el)
        {
            return this.getProperty(el, "-webkit-transform-style");
        }
    },

    setMatrix: {
        value: function(el, mat, isChanging) {
            var dist = el.elementModel.controller["getPerspectiveDist"](el);
            el.elementModel.controller["set3DProperties"](el, [{mat:mat, dist:dist}], 0, !isChanging);

            if(isChanging)
            {
                NJevent("elementChanging", {type : "setMatrix", source: null, data: {"els": [el], "prop": "matrix", "value": mat}, redraw: null});
            }
            else
            {
                this.application.ninja.documentController.activeDocument.dirtyFlag = true;

                NJevent("elementChange", {type : "setMatrix", source: null, data: {"els": [el], "prop": "matrix", "value": mat}, redraw: null});
            }
        }
    },

    has3D: {
        value: function(el) {
            var str = this.getProperty(el, "-webkit-transform");
            if (str && str.length)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }




    //--------------------------------------------------------------------------------------------------------

});