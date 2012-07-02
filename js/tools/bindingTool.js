/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    DrawingTool = require("js/tools/drawing-tool").DrawingTool,
ModifierToolBase = require("js/tools/modifier-tool-base").ModifierToolBase;
SelectionTool = require("js/tools/SelectionTool").SelectionTool;


exports.BindingTool = Montage.create(ModifierToolBase, {
    drawingFeedback: { value: { mode: "Draw2D", type: "" } },
    _selectedElement: {
        value: null
    },

    selectedElement: {
        get:function() {
            return this._selectedElement;
        },
        set: function(val) {
            this._selectedElement = val;
            this.application.ninja.stage.bindingView.selectedElement = val;
        }
    },

    Configure: {
        value: function (doActivate)
        {
            if (doActivate)
            {
                NJevent("enableStageMove");
                this.application.ninja.workspaceMode = "binding";
                this.application.ninja.stage.bindingView.hide = false;
                if (this.application.ninja.selectedElements.length !== 0 ) {
                    if(typeof(this.application.ninja.selectedElements[0].controller) !== "undefined") {
                        this.selectedElement = this.application.ninja.selectedElements[0];
                    } else {
                        this.selectedComponent = null;
                    }

                }
            }
            else
            {
                NJevent("disableStageMove");
                this.application.ninja.workspaceMode = "default";
                this.selectedComponent = null;
                this.application.ninja.stage.bindingView.hide = true;
            }

        }
    },

    HandleLeftButtonDown: {
        value: function(event) {
            NJevent("enableStageMove");
        }
    },

    HandleMouseMove: {
        value: function(event) {
            /*
                In the mouse over event we need to validate if the mouse over is over a hud.
                If it on top of a hud bring that single hud to the top to associate with.
            */

            this.application.ninja.stage.bindingView.handleMousemove(event);
            //this.doDraw(event);
        }
    },

    HandleLeftButtonUp: {
        value: function(event) {
            if(!this.application.ninja.stage.bindingView._isDrawingConnection) {
                if(this._escape) {
                    this._escape = false;
                    return;
                }

                if(this._hasDraw) {
                    this._hasDraw = false;
                    //this.endDraw(event);
                } else {
                    this.doSelection(event);
                    if (this.application.ninja.selectedElements.length !== 0 ) {
                        if(this.application.ninja.selectedElements[0].controller) {
                            this.selectedElement = this.application.ninja.selectedElements[0];
                        } else {
                            this.selectedElement = null;
                        }
                    } else {
                        this.selectedElement = null;
                    }
                    this._isDrawing = false;
                }
            }
            //this.endDraw(event);
            //NJevent("disableStageMove");
        }
    }
});