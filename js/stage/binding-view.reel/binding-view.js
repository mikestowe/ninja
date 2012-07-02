/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/**
@requires montage/core/core
@requires montage/ui/component
*/
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.BindingView = Montage.create(Component, {
    //private Properties
    _canvas: { value:null },
    _context : { value: null },
    _targetedElement: {value: null},
    componentsList: { value: {} },

    hudRepeater: { value: null },

    //Public Properties
    _width :{ value: 0 },
    width: {
        get:function() {
            return this._width;
        },
        set: function(val) {
            if(this._width !== val) {
                this._width = val;
                this.needsDraw = true;
            }
        }
    },

    _height :{  value: 0 },
    height: {
        get:function() {
            return this._height;
        },
        set: function(val) {
            if(this._height !== val) {
                this._height = val;
                this.needsDraw = true;
            }
        }
    },

    _connectionElementStart: { value: null },
    connectionElementStart: {
        get: function() {
            return this._connectionElementStart;
        },
        set: function(val) {
            this._connectionElementStart = val;
        }
    },

    _connectionElementEnd: { value: null },
    connectionElementEnd: {
        get: function() {
            return this._connectionElementEnd;
        },
        set: function(val) {
            this._connectionElementEnd = val;
        }
    },

    _connectionPropertyStart: { value: null },
    connectionPropertyStart: {
        get: function() {
            return this._connectionPropertyStart;
        },
        set: function(val) {
            this._connectionPropertyStart = val;
        }
    },

    _connectionPropertyEnd: { value: null },
    connectionPropertyEnd: {
        get: function() {
            return this._connectionPropertyEnd;
        },
        set: function(val) {
            this._connectionPropertyEnd = val;
        }
    },

    _boundComponents: { value: [] },
    boundComponents: {
        get: function() {
            return this._boundComponents;
        },
        set: function(val) {
            this._boundComponents = val;
        }
    },

    _selectedElement: { value: null },
    selectedElement: {
        get: function() {
            return this._selectedElement;
        },
        set: function(val) {
            this.boundComponents = [];
            if(this._selectedElement !== val) {
                this.clearCanvas();
                this._selectedElement = val;
            if(this._selectedElement !== null) {
                this.application.ninja.objectsController.currentObject = this._selectedElement.controller;
                if (this._selectedElement !== null) {
                    this.boundComponents.push(this._selectedElement);
                }
            }
                this.needsDraw = true;
            }
        }
    },

    handleShowBinding: {
        value: function(bindingMeta) {
            if(bindingMeta === null) return;
            for(var j=0; j< bindingMeta.length; j++) {
                var bindingExists = false;
                for(var i =0; i < this.boundComponents; i++) {
                    if(this.boundComponents[i] === bindingMeta[j].boundObject) {
                        bindingExists = true;
                    }
                }
                if(!bindingExists) {
                    //this.boundComponents.push(bindingMeta[j].boundObject);
                }
            }
        }
    },

    _nonVisualComponents: { value:[] },
    nonVisualComponents: {
        get: function() {
            return this._nonVisualComponents;
        },
        set: function(val) {
            this._nonVisualComponents = val;
        }
    },

    bindingViewCanvas: {
        get: function() {
            return this._bindingViewCanvas;
        },
        set: function(val) {
            this._bindingViewCanvas = val;
        }
    },

    //Methods
    canvas: {
        get: function() {
            return this._canvas;
        },
        set: function(val) {
            this._canvas = val;
        }
    },

    //Montage Draw Cycle
    prepareForDraw: {
        value: function() {
            this._canvas = this.application.ninja.stage.drawingCanvas;
            this._context = this.application.ninja.stage.drawingCanvas.getContext('2d');
            this.application.ninja.stage._iframeContainer.addEventListener("scroll", this, false);
            this.element.addEventListener("mousedown", this, false);
            this.element.addEventListener("mousemove", this, false);

            Object.defineBinding(this, 'currentDocument', {
                boundObject : this.application.ninja,
                boundObjectPropertyPath : "documentList.selectedObjects.0",
                oneway: true
            });

        }
    },

    _currentDocument : { value: null },
    currentDocument : {
        get : function() { return this._currentDocument; },
        set : function(value) {
            if(value === this._currentDocument) { return; }


            this._currentDocument = value;
            if(value) {
                this.hide = (value.currentView === 'code');
            }

            this.needsDraw = true;
        }
    },

    _hide : { value: true },
    hide : {
        get : function() { return this._hide; },
        set : function(value) {
            if(value === this._hide) { return; }

            this._hide = value;

            this.needsDraw = true;
        }
    },

    draw: {
        value: function() {

            if(this.hide) {
                this.element.style.setProperty('display', 'none');
            } else {
                this.element.style.removeProperty('display');
                this.element.style.width = this.width + "px";
                this.element.style.height = this.height + "px";
                if(this._selectedElement !== null && typeof(this._selectedElement) !== "undefined") {
                    this.canvas.width  = this.application.ninja.stage.drawingCanvas.offsetWidth;
                    this.canvas.height = this.application.ninja.stage.drawingCanvas.offsetHeight;
                    this.clearCanvas();
                    for(var i= 0; i < this.hudRepeater.childComponents.length; i++) {
                        this.drawLine(this.hudRepeater.objects[i].offsetLeft,this.hudRepeater.objects[i].offsetTop, this.hudRepeater.childComponents[i].element.offsetLeft +1, this.hudRepeater.childComponents[i].element.offsetTop +1, "#CCC", 2);
                    }
                    if(this._isDrawingConnection) {
                        if (this.hudRepeater.childComponents.length > 1) {
                            // Make things disappear
                        }
                        this.drawLine(this._currentMousePosition.x,this._currentMousePosition.y,this._connectionPositionStart.x,this._connectionPositionStart.y,"#5e9eff", 4);
                    }
                } else {
                    this.bindables = [];
                    this.clearCanvas();
                }

                if(this.mouseOverHud && !this._isDrawingConnection) {
                    if(!this.element.classList.contains("mousedOverHud")) { this.element.classList.add("mousedOverHud"); }
                } else {
                    if(this.element.classList.contains("mousedOverHud")) { this.element.classList.remove("mousedOverHud"); }
                }
            }

        }
    },

    drawLine: {
        value: function(fromX,fromY,toX,toY, color, width) {
            if(width === null) width = 1;
            if (color === null) color = "#CCC";
            this._context.lineWidth = width; // Set Line Thickness
            this._context.lineCap = "round";
            this._context.strokeStyle = color; // Set Color
            this._context.beginPath(); // Start Drawing Line
            this._context.moveTo(fromX, fromY);
            this._context.lineTo(toX, toY);
            this._context.stroke();
        }
    },

    clearCanvas: {
        value: function() {
            this._context.clearRect(0,0,this._canvas.offsetWidth,this._canvas.offsetHeight);
        }
    },

    ///////////////////////////////////////////////////////
    // Events & Functions to draw user selected options //
    /////////////////////////////////////////////////////

    // When a user selects a valid option this value will be switched to true and canvas
    // will draw a line following the mouse and the start position
    _isDrawingConnection: {
        value: false
    },

    // When isDrawingConnection is set true this is the beginning position for the draw line
    _connectionPositionStart: {
        value: {x: 0, y:0}
    },

    // When isDrawingConnection is set true this is the end point for the draw line
    _currentMousePosition: {
        value: {x: 0, y:0}
    },

    objectsTray: {
        value:null
    },

    getOffStageIcon : {
        value: function(object) {
            var index = this.objectsTray.offStageObjectsController.organizedObjects.indexOf(object);

            return this.objectsTray.iconsRepetition.childComponents[index];
        }
    },


    // When mouse pointer is on a hud this value will be set to true
    _mouseOverHud: { value: false },
    mouseOverHud: {
        get: function() {
            return this._mouseOverHud;
        },
        set: function(val) {
            if(this._mouseOverHud !== val) {
                this._mouseOverHud = val;
                this.needsDraw = true;
            }
        }
    },



    handleMousemove: {
        value: function(e) {
            var mousePoint = webkitConvertPointFromPageToNode(this.element, new WebKitPoint(e.pageX, e.pageY));
            var overHud = false;
            this.hudRepeater.childComponents.forEach(function(obj) {
                if(obj.x < mousePoint.x && (obj.x + obj.element.offsetWidth) > mousePoint.x) {
                    if(obj.y < mousePoint.y && (obj.y + obj.element.offsetHeight) > mousePoint.y) {
                        overHud = true;
                        if(this._isDrawingConnection) {
                            obj.isOverScroller(e);
                        }
                    }
                }
            }.bind(this));
            if(typeof (this.objectsTray.element) !== "undefined") {
                if (this.objectsTray.element.offsetLeft < mousePoint.x && (this.objectsTray.element.offsetLeft + this.objectsTray.element.offsetWidth) > mousePoint.x ) {
                    if(this.objectsTray.element.parentElement.offsetTop < mousePoint.y && (this.objectsTray.element.parentElement.offsetTop + this.objectsTray.element.offsetHeight) > mousePoint.y) {
                        overHud = true;
                    }
                }
            }
            this.mouseOverHud = overHud;
            if(this._isDrawingConnection && !overHud) {
                //NOTE : Continue This content. mouse over select
                var obj = this.application.ninja.stage.getElement(event, true);
                if (obj && obj !== this.selectedElement)
                {
                    if (!obj.controller || obj === null)
                    {
                        if(this._targetedElement)
                        {
                            this._targetedElement.classList.remove("active-element-outline");
                            this.boundComponents.pop();
                            this._targetedElement = null;
                        }
                    }
                    else
                    {
                        if (obj !== this._targetedElement)
                        {
                            if(this._targetedElement)
                            {
                                this._targetedElement.classList.remove("active-element-outline");
                                this.boundComponents.pop();
                            }
                            this._targetedElement = obj;
                            this._targetedElement.classList.add("active-element-outline");
                            this.boundComponents.push(this._targetedElement);
                        }
                    }
                }
            }
            if(this._isDrawingConnection) {
                this._currentMousePosition = mousePoint;
                this.needsDraw = true;
            }
        }
    },


    handleMouseup: {
        value: function(e) {
            window.removeEventListener("mouseup", this);
            this.element.style.zIndex = "12";
            var nodeEl = document.elementFromPoint(e.pageX, e.pageY);
            this.element.style.zIndex = null;
            if(nodeEl.classList.contains("connectorBubble")) {
//            var mouseUpPoint = new WebKitPoint(e.pageX, e.pageY);
//            var nodeEl = new webkitConvertPointFromPageToNode(this.element, mouseUpPoint);
                //debugger;
            this.connectionElementEnd = nodeEl.parentElement.controller.parentComponent.parentComponent.userElement.controller;
            this.connectionPropertyEnd = nodeEl.parentElement.controller.title;
                this.application.ninja.objectsController.addBinding({
                    sourceObject: this.connectionElementStart,
                    sourceObjectPropertyPath: this.connectionPropertyStart,
                    boundObject: this.connectionElementEnd,
                    boundObjectPropertyPath: this.connectionPropertyEnd
                });
            }
            if(this._targetedElement !==null) {
                this.boundComponents.pop();
                this._targetedElement.classList.remove("active-element-outline");
                this._targetedElement = null;
            }
            this._isDrawingConnection = false;
            this.needsDraw = true;
        }
    },

    handleMousedown: {
        value: function(e) {
            // We are looking for a mouse down on an option to start the connection visual
            if(e._event.target.classList.contains("connectorBubble")) {
                this.connectionElementStart = e._event.target.parentElement.controller.parentComponent.parentComponent.userElement.controller;
                this.connectionPropertyStart = e._event.target.parentElement.controller.title;
                this._isDrawingConnection = true;
                this._connectionPositionStart = webkitConvertPointFromPageToNode(this.element, new WebKitPoint(e.pageX, e.pageY));

                window.addEventListener("mouseup", this);
            }
        }
    },

    handleScroll: {
        value: function() {
            this.needsDraw = true;
        }
    },

    didDraw: {
        value: function() {

        }
    }

});