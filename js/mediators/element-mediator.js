/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

var ElementController = require("js/controllers/elements/element-controller").ElementController,
    Command     =   require("js/controllers/undo-controller").Command,
    NJUtils = require("js/lib/NJUtils").NJUtils;

exports.ElementMediator = Montage.create(Component, {


    addDelegate: {
        enumerable: false,
        value: null
    },

    deleteDelegate: {
        enumerable: false,
        value: null
    },

    addElements: {
        value: function(elements, rules, notify) {
            if(Array.isArray(elements)) {
                elements.forEach(function(element) {
                    element = element;
                    ElementController.addElement(element, rules);
                });
            } else {
                ElementController.addElement(elements, rules);

                // TODO - Check with webgl branch - Props seem to be already there.
                var prop3d = this.get3DProperties(elements);
                if(prop3d) {
                    elements.elementModel.controller["set3DProperties"](elements, [prop3d], 0, true);
                    }
                    }

            if(this.addDelegate && typeof (this.addDelegate['onAddElements']) === "function") {
                this.addDelegate['onAddElements'].call(this.addDelegate, elements);
                }

            var undoLabel = "add element";

            document.application.undoManager.add(undoLabel, this.removeElements, this, elements, notify);

            this.application.ninja.documentController.activeDocument.needsSave = true;

            if(notify || notify === undefined) {
                NJevent("elementAdded", elements);
                    }
        }
                },

    removeElements: {
        value: function(elements, notify /* Used for the add undo */) {

            if(this.deleteDelegate && (typeof this.deleteDelegate.handleDelete === 'function')) {
                return this.deleteDelegate.handleDelete();
                // this.handleDelete.call(deleteDelegate);
        }

            if(Array.isArray(elements)) {
                elements = Array.prototype.slice.call(elements, 0);
                elements.forEach(function(element) {
                    ElementController.removeElement(element);
                });
            } else {
                ElementController.removeElement(elements);
            }

            var undoLabel = "add element";

            document.application.undoManager.add(undoLabel, this.addElements, this, elements, null, notify);

                this.application.ninja.documentController.activeDocument.needsSave = true;

            NJevent("elementsRemoved", elements);
            }
    },

    replaceElement: {
        value: function(newChild, oldChild, notify) {

            this.application.ninja.currentDocument.documentRoot.replaceChild(newChild, oldChild);

            var undoLabel = "replace element";

            document.application.undoManager.add(undoLabel, this.replaceElement, this, oldChild, newChild);

            this.application.ninja.documentController.activeDocument.needsSave = true;

            if(notify || notify === undefined) {
                NJevent("elementReplaced", {type : "replaceElement", data: {"newChild": newChild, "oldChild": oldChild}});
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
                    currentValue = el.getAttribute(att);
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
            el.elementModel.controller["setAttribute"](el, att, value);

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
                        return that.getProperty((item), p);
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
                item.elementModel.controller["setProperty"](item, p, value[i], eventType, source);
            }

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
            var propsArray;

            for(var i=0, item; item = els[i]; i++) {
                item.elementModel.controller["setProperties"](item, props, i);
            }

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
            var update3DModel = false;

            if(eventType === "Change") {
                update3DModel = true;
            }

            for(var i=0, item; item = els[i]; i++) {
                item.elementModel.controller["set3DProperties"](item, props, i, update3DModel);
            }

            NJevent("element" + eventType, {type : "set3DProperties", source: source, data: {"els": els, "prop": "matrix", "value": props}, redraw: null});
        }
    },


    //--------------------------------------------------------------------------------------------------------
    // Routines to get/set color
    getColor: {
        value: function(el, isFill, borderSide) {
            if(!el.elementModel) {
                NJUtils.makeModelFromElement(el);
            }
            return el.elementModel.controller["getColor"](el, isFill, borderSide);
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
                        return that.getColor(item, isFill);
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
            for(var i=0, item; item = els[i]; i++) {
                item.elementModel.controller["setColor"](item, value, isFill);
            }

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
                        return that.getStroke(item);
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
            for(var i=0, item; item = els[i]; i++) {
                item.elementModel.controller["setStroke"](item, value);
            }

            NJevent("element" + eventType, {type : "setStroke", source: source, data: {"els": els, "prop": "stroke", "value": value}, redraw: null});
        }
    },

    //--------------------------------------------------------------------------------------------------------
    // Routines to get/set 3D properties
    get3DProperty: {
        value: function(el, prop) {
            if(!el.elementModel) {
                NJUtils.makeModelFromElement(el);
            }
            return el.elementModel.controller["get3DProperty"](el, prop);
        }
    },

    get3DProperties: {
        value: function(el) {
            if(!el.elementModel) {
                NJUtils.makeModelFromElement(el);
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
                NJUtils.makeModelFromElement(el);
            }
            return el.elementModel.controller["getMatrix"](el);
        }
    },

    getPerspectiveDist: {
        value: function(el) {
            if(!el.elementModel) {
                NJUtils.makeModelFromElement(el);
            }
            return el.elementModel.controller["getPerspectiveDist"](el);
        }
    },

    getPerspectiveMode: {
        value: function(el) {
            return this.getProperty(el, "-webkit-transform-style");
        }
    },

    setMatrix: {
        value: function(el, mat, isChanging, source) {
            var dist = el.elementModel.controller["getPerspectiveDist"](el);
            el.elementModel.controller["set3DProperties"](el, [{mat:mat, dist:dist}], 0, !isChanging);

            if(isChanging) {
                NJevent("elementChanging", {type : "setMatrix", source: source, data: {"els": [el], "prop": "matrix", "value": mat}, redraw: null});
            } else {
                NJevent("elementChange", {type : "setMatrix", source: source, data: {"els": [el], "prop": "matrix", "value": mat}, redraw: null});
            }
        }
    },

    has3D: {
        value: function(el) {
            var str = this.getProperty(el, "-webkit-transform");
            return str && str.length;
            }
            }




    //--------------------------------------------------------------------------------------------------------

});