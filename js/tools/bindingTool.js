/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
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
