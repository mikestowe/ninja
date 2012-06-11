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
    _selectedComponent: {
        value: null
    },

    selectedComponent: {
        get:function() {
            return this._selectedComponent;
        },
        set: function(val) {
            this._selectedComponent = val;
        }
    },

    Configure: {
        value: function (doActivate)
        {
            if (doActivate)
            {
                NJevent("enableStageMove");
                this.application.ninja.workspaceMode = "binding";
            }
            else
            {
                NJevent("disableStageMove");
                this.application.ninja.workspaceMode = "default";
            }
        }
    },

    HandleLeftButtonDown: {
        value: function(event) {
            NJevent("enableStageMove");
            this.application.ninja.stage.bindingView.validateOverHud();
        }
    },

    HandleMouseMove: {
        value: function(event) {
            /*
                In the mouse over event we need to validate if the mouse over is over a hud.
                If it on top of a hud bring that single hud to the top to associate with.

            */
            //this.doDraw(event);
        }
    },

    HandleLeftButtonUp: {
        value: function(event) {

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
                        this.selectedComponent = this.application.ninja.selectedElements[0].controller;
                    }
                } else {
                    this.selectedComponent = null;
                }
                this.application.ninja.stage.bindingView.selectedComponent = this.selectedComponent;
                this._isDrawing = false;
            }
            //this.endDraw(event);
            //NJevent("disableStageMove");
        }
    }
});