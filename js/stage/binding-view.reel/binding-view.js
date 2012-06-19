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

    hudRepeater: {
        value: null
    },
    _selectedComponent: {
        value: null
    },

    //Move variables
    _translateX : {
        value: 0
    },

    _translateY: {
        value: 0
    },

    translateX : {
        get: function() {
            return this._translateX;
        },
        set: function(val) {
            this._translateX = val;
        }
    },

    translateY: {
        get: function() {
            return this._translateY;
        },
        set: function(val) {
            this._translateY = val;
        }
    },

    _width :{  value: 0 },
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

    validateOverHud: {
        value: function() {

        }
    },

    componentsList: {
        value: {}
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

    _bindables: {
        value: []
    },

    _nonVisualComponents: {
        value:[]
    },

    _bindingViewCanvas: {
        value:null
    },
    _canvas: {
        value:null
    },
    _context : {
        value: null
    },

    startConnector: {
        value: null
    },

    //Public Objects
    hudRepeater: { value: null },


    //Public Properties
    selectedComponent: {
        get: function() {
            return this._selectedComponent;
        },
        set: function(val) {
            if(this._selectedComponent !== val) {
                this.bindables = [];
                this.clearCanvas();
            this._selectedComponent = val;
            if(this._selectedComponent !== null) {
                this.application.ninja.objectsController.currentObject = this.selectedComponent;
                var arrBindings = this.application.ninja.objectsController.currentObjectBindings;
                var arrProperties = this.application.ninja.objectsController.getPropertyList(this.selectedComponent, true);

                //Add the first component which is the selected one to have a hud

                this.componentsList[this.selectedComponent.identifier] = {"component":  this.selectedComponent, properties:[] };
                this.application.ninja.objectsController.getPropertiesFromObject(this.selectedComponent, true).forEach(function(obj) {
                    this.componentsList[this.selectedComponent.identifier].properties.push({"title":obj})
                }.bind(this));
                //Go through the loop and find every interacted object by bindings
                arrBindings.forEach(function(obj) {
                    if(typeof (this.componentsList[obj.boundObject.identifier]) === "undefined") {
                        var componentListItem = {}
                        componentListItem.component = obj.boundObject;
                        componentListItem.properties = [];
                        this.application.ninja.objectsController.getPropertiesFromObject(obj.boundObject, true).forEach(function(obj) {
                            componentListItem.properties.push({"title":obj})
                        }.bind(this));
                        this.componentsList[obj.boundObject.identifier] = componentListItem;
                    }
                }.bind(this));
                for(var key in this.componentsList){
                    this.bindables.push(this.componentsList[key]);
                }
                // Get Bindings that exist;


                //Get Properties of Elements in bindings;
            }
                this.needsDraw = true;
            }
        }
    },

    handleResizeMove: {
        value: function(e) {
            console.log(e);
        }
    },

    bindables: {
        get: function() {
            return this._bindables;
        },
        set: function(val) {
            this._bindables = val;
        }
    },
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
        }
    },

    draw: {
        value: function() {

            this.element.style.width = this.width + "px";
            this.element.style.height = this.height + "px";
            if(this.selectedComponent !== null) {
                this.canvas.width  = this.application.ninja.stage.drawingCanvas.offsetWidth;
                this.canvas.height = this.application.ninja.stage.drawingCanvas.offsetHeight;
                this.clearCanvas();
                for(var i= 0; i < this.hudRepeater.childComponents.length; i++) {
                    this.drawLine(this.hudRepeater.objects[i].component.element.offsetLeft,this.hudRepeater.objects[i].component.element.offsetTop, this.hudRepeater.childComponents[i].element.offsetLeft +3, this.hudRepeater.childComponents[i].element.offsetTop +3);

                }

                if(this._isDrawingConnection) {
                    if (this.hudRepeater.childComponents.length > 1) {
                        //this.object
                    }
                    this.drawLine(this._currentMousePosition.x,this._currentMousePosition.y,this._connectionPositionStart.x,this._connectionPositionStart.y,"#3333FF", 4);
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
    },

    didDraw: {
        value: function() {

        }
    },

    drawLine: {
        value: function(fromX,fromY,toX,toY, color, width) {
            if(width === null) width = 1;
            if (color === null) color = "#CCC";
            this._context.lineWidth = width; // Set Line Thickness
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
                    }
                }
            }.bind(this));
            if(typeof (this.objectsTray.element) !== "undefined") {
                if (this.objectsTray.element.offsetLeft < mousePoint.x && (this.objectsTray.element.offsetLeft + this.objectsTray.element.offsetWidth) > mousePoint.x ) {
                    //console.log(this.objectsTray.element.offsetTop, (this.objectsTray.element.parentElement.offsetTop + this.objectsTray.element.offsetHeight) );
                    if(this.objectsTray.element.parentElement.offsetTop < mousePoint.y && (this.objectsTray.element.parentElement.offsetTop + this.objectsTray.element.offsetHeight) > mousePoint.y) {
                        overHud = true;
                    }
                }
            }
            this.mouseOverHud = overHud;

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
                debugger;
            this.connectionElementEnd = nodeEl.parentElement.controller.parentComponent.parentComponent.userComponent;
            this.connectionPropertyEnd = nodeEl.parentElement.controller.title;
            console.log(this.connectionElementStart, this.connectionPropertyStart, this.connectionElementEnd, this.connectionPropertyEnd);
                this.application.ninja.objectsController.addBinding({
                    sourceObject: this.connectionElementStart,
                    sourceObjectPropertyPath: this.connectionPropertyStart,
                    boundObject: this.connectionElementEnd,
                    boundObjectPropertyPath: this.connectionPropertyEnd
                });
            }
            this._isDrawingConnection = false;
            this.needsDraw = true;
        }
    },

    handleMousedown: {
        value: function(e) {
            // We are looking for a mouse down on an option to start the connection visual
            if(e._event.target.classList.contains("connectorBubble")) {
                //console.log(e._event.target.parentElement.controller.parentComponent.parentComponent.userComponent);
                this.connectionElementStart = e._event.target.parentElement.controller.parentComponent.parentComponent.userComponent;
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