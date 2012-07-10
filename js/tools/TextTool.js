/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
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
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

exports.TextTool = Montage.create(DrawingTool, {
    drawingFeedback: {
        value: { mode: "Draw3D", type: "rectangle" }
    },

    _selectedElement: {
        value : null
    },

    selectedElement: {
        get: function() {
            return this._selectedElement;
        },
        set: function(val) {
            //Set Selected Element
            if (this._selectedElement !== null) {
                this.applyStyle();
            }
            this._selectedElement = val;
            if(this._selectedElement !== null) {
                this.drawTextTool();
                this.handleScroll();
                this.application.ninja.stage._iframeContainer.addEventListener("scroll", this, false);
            } else {
                this.application.ninja.stage._iframeContainer.removeEventListener("scroll", this);
            }

        }
    },

    applyStyle: {
        value: function() {
            this.selectedElement.innerHTML = this.application.ninja.stage.textTool.value;
            this.application.ninja.stage.textTool.value = "";
            this.application.ninja.stage.textTool.element.style.display = "none";
            //ElementsMediator.setProperty([this.selectedElement], "color", [window.getComputedStyle(this.application.ninja.stage.textTool.element)["color"]], "Change", "textTool");
        }

    },

    HandleLeftButtonDown: {
        value: function(event) {
            this.selectedElement = null;
            this.startDraw(event);
        }
    },

    handleScroll: {
        value: function(e) {
            // Set Top & Left Positions
            var textToolCoordinates = this.application.ninja.stage.toViewportCoordinates(this.selectedElement.offsetLeft, this.selectedElement.offsetTop);
            this.application.ninja.stage.textTool.element.style.left = textToolCoordinates[0] + "px";
            this.application.ninja.stage.textTool.element.style.top = textToolCoordinates[1] + "px";
        }
    },

    HandleMouseMove: {
        value: function(event) {
            if(this._escape) {
                this._escape = false;
                this.isDrawing = true;
            }

            if(this.isDrawing) {
                this._hasDraw = true;   // Flag for position of element
                this.doDraw(event);
            } else {
                this.doSnap(event);
            }

            this.drawLastSnap();        // Required cleanup for both Draw/Feedbacks
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
                this.endDraw(event);
            } else {
                this.doSelection(event);
                if (this.application.ninja.selectedElements.length !== 0 ) {
                    this.selectedElement = this.application.ninja.selectedElements[0];
                }
                this._isDrawing = false;
            }
        }
    },

    getSelectedElement: {
        value: function(editor) {
            var element = editor._selectedRange.startContainer;
            if (element.nodeType == 3) {
                element = element.parentNode;
            }
            return element;
        }
    },

    getStyleOfSelectedElement: {
        value: function(editor) {
            return window.getComputedStyle(this.getSelectedElement(editor));
        }
    },

    applyElementStyles : {
        value: function(fromElement, toElement, styles) {
            styles.forEach(function(style) {
                var styleCamelCase = style.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
                toElement.style[styleCamelCase] = window.getComputedStyle(fromElement)[style];
            }, this);
        }
    },

    drawTextTool: {
        value: function() {
            var self = this;
            this.application.ninja.stage.textTool.value = this.selectedElement.innerHTML;
            if(this.application.ninja.stage.textTool.value === "") { this.application.ninja.stage.textTool.value = " "; }
            this.selectedElement.innerHTML = "";


            //Styling Options for text tool to look identical to the text you are manipulating.
            this.application.ninja.stage.textTool.element.style.display = "block";
            this.application.ninja.stage.textTool.element.style.position = "absolute";

            // Set Width, Height
            this.application.ninja.stage.textTool.element.style.width = this.selectedElement.offsetWidth + "px";
            this.application.ninja.stage.textTool.element.style.height = this.selectedElement.offsetHeight + "px";

            // Set font styling (Size, Style, Weight)
            this.application.ninja.stage.textTool.didDraw = function() {
                self.applyElementStyles(self.selectedElement, self.application.ninja.stage.textTool.element, ["overflow"]);
                self.applyElementStyles(self.selectedElement, self.application.ninja.stage.textTool.element, ["font","padding-left","padding-top","padding-right","padding-bottom", "color"]);
                this.selectAll();
                this.didDraw = function() {};
            }

        }
    },

    /*
    HandleDoubleClick: {
        value: function(e) {
            //this.application.ninja.selectedElements[0].setAttribute("contenteditable", true);
        }
    },
    */

    Configure: {
        value: function(wasSelected) {

            if(wasSelected) {
                NJevent("enableStageMove");
                this.application.ninja.stage.stageDeps.snapManager.setupDragPlaneFromPlane( workingPlane );
            } else {
                this.selectedElement = null;
                NJevent("disableStageMove");
            }
        }
    }

});
