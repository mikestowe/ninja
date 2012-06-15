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
            console.log("x", this._translateX);
        }
    },

    translateY: {
        get: function() {
            return this._translateY;
        },
        set: function(val) {
            this._translateY = val;
            console.log("y", this._translateY);
        }
    },

    handleMousedown: {
        value: function(e) {
            validateOverHud(e.clientX, e.clientY);
        }
    },

    validateOverHud: {
        value: function() {

        }
    },

    componentsList: {
        value: {}
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
                console.log("components:",this.componentsList);
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
                console.log(this.bindables);
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
        }
    },

    draw: {
        value: function() {
            if(this.selectedComponent !== null) {
                this.canvas.width  = this.application.ninja.stage.drawingCanvas.offsetWidth;
                this.canvas.height = this.application.ninja.stage.drawingCanvas.offsetHeight;
                this.clearCanvas();
                for(var i= 0; i < this.hudRepeater.childComponents.length; i++) {
                    this.drawBlueLine(this.hudRepeater.objects[i].component.element.offsetLeft,this.hudRepeater.objects[i].component.element.offsetTop, this.hudRepeater.childComponents[i].element.offsetLeft, this.hudRepeater.childComponents[i].element.offsetTop);
                }
            } else {
                this.bindables = [];
                this.clearCanvas();
            }

        }
    },

    didDraw: {
        value: function() {

        }
    },

    drawBlueLine: {
        value: function(fromX,fromY,toX,toY) {
            this._context.lineWidth = 4; // Set Line Thickness
            //this._context.strokeStyle = "#5e9eff";

            this._context.beginPath(); // Start Drawing Line
            this._context.moveTo(fromX, fromY);
            this._context.lineTo(toX, toY);
            this._context.stroke();
        }
    },

    clearCanvas: {
        value: function() {
            debugger;
            this._context.clearRect(0,0,this._canvas.offsetWidth,this._canvas.offsetHeight);
        }
    },

    handleMousemove: {
        value: function() {

        }
    },

    handleMousedown: {
        value: function(event) {

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