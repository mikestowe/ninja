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
    _selectedElement: {
        value: null
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
    selectedElement: {
        get: function() {
            return this._selectedElement;
        },
        set: function(val) {
            this._selectedElement = val;
            this.needsDraw = true;
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



    //Montage Draw Cycle
    prepareForDraw: {
        value: function() {
            this._canvas = this.application.ninja.stage.drawingCanvas;
            this._context = this._canvas.getContext('2d');
            this.application.ninja.stage._iframeContainer.addEventListener("scroll", this, false);
        }
    },

    draw: {
        value: function() {
            if(this.selectedElement !== null) {
                this.bindables = [
                    {
                        "title": "Input1",
                        "properties": [
                            {"title":"Value",
                                "bindings": [
                                    {"direction": "<-", "boundObject":"Checkbox1", "boundProperty": "Value"}
                                ]
                            },
                            {"title": "Width", "bindings": []}
                        ],
                        "x": 20,
                        "y": 20
                    },
                    {
                        "title": "Checkbox1",
                        "properties": [
                            {"title":"Group" , "bindings": []},
                            {"title":"Value",
                                "bindings": [
                                    {"direction": "->", "boundObject":"Input1", "boundProperty": "Value"}
                                ]
                            }
                        ],
                        "x": 120,
                        "y": 120
                    }
                ];
                this.drawBlueLine(100,100,200,200)

            } else {
                this.bindables = [];
            }

        }
    },

    drawBlueLine: {
        value: function(fromX,fromY,toX,toY) {
            this._context.lineWidth = 4; // Set Line Thickness
            this._context.strokeStyle = "#00F"

            this._context.beginPath(); // Start Drawing Line
            this._context.moveTo(fromX, fromY);
            this._context.lineTo(toX, toY);
            this._context.stroke();
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