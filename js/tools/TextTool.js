/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    DrawingTool = require("js/tools/drawing-tool").DrawingTool;
    RichTextEditor = require("montage/ui/rich-text-editor.reel").RichTextEditor;

exports.TextTool = Montage.create(DrawingTool, {

    _selectedElement: { value : null },

    selectedElement: {
        get: function() {
            return this._selectedElement;
        },
        set: function(val) {
            if(this._selectedElement !== null) {
                
            }
            this._selectedElement = val;
        }
    },
    

    drawingFeedback: { value: { mode: "Draw3D", type: "rectangle" } },

    HandleLeftButtonDown: {
        value: function(event) {
            this.deselectText();
            this.startDraw(event);
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

            var drawData, selectedItem;

            if(this._hasDraw) {
                drawData =  this.getDrawingData();

                if(drawData) {
                    //this.insertElement(drawData);
                }
                
                this._hasDraw = false;
                this.endDraw(event);
            } else {
                this.doSelection(event);
                console.log("im here");
                if (this.application.ninja.selectedElements.length !== 0 ) {
                    this.selectedElement = this.application.ninja.selectedElements[0]._element;
                    this.drawTextTool();
                }

                this._isDrawing = false;
            }
        }
    },

    applyElementStyles : {
        value: function(fromElement, toElement, styles) {
            styles.forEach(function(style) {
                var styleCamelCase = style.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
                console.log(styleCamelCase, style, window.getComputedStyle(fromElement)[style]);
                toElement.style[styleCamelCase] = window.getComputedStyle(fromElement)[style];
            }, this);
        }
    },

    drawTextTool: {
        value: function() {
            console.log(" now im here");
            this.application.ninja.stage.textTool.value = this.selectedElement.innerHTML;
            if(this.application.ninja.stage.textTool.value === "") { this.application.ninja.stage.textTool.value = " "; }
            this.selectedElement.innerHTML = "";

            //Styling Options for text tool to look identical to the text you are manipulating.
            this.application.ninja.stage.textTool.element.style.display = "block";
            this.application.ninja.stage.textTool.element.style.position = "absolute";

            // Set Top & Left Positions
            var textToolCoordinates = this.application.ninja.stage.toViewportCoordinates(this.selectedElement.offsetLeft, this.selectedElement.offsetTop);
            this.application.ninja.stage.textTool.element.style.left = textToolCoordinates[0] + "px";
            this.application.ninja.stage.textTool.element.style.top = textToolCoordinates[1] + "px";

            // Set Width, Height
            this.application.ninja.stage.textTool.element.style.width = this.selectedElement.offsetWidth + "px";
            this.application.ninja.stage.textTool.element.style.height = this.selectedElement.offsetHeight + "px";


            // Set font styling (Size, Style, Weight)

            me = this;
            this.application.ninja.stage.textTool.didDraw = function() {
                me.applyElementStyles(me.selectedElement, me.application.ninja.stage.textTool.element, ["overflow"]);
                me.applyElementStyles(me.selectedElement, me.application.ninja.stage.textTool.element.firstChild, ["font","padding-left","padding-top","padding-right","padding-bottom", "color"]);
                var range = document.createRange(),
                sel   = window.getSelection();
                sel.removeAllRanges();
                range.selectNodeContents(this.application.ninja.stage.textTool.element.firstChild);
                sel.addRange(range);
                this.didDraw = function() {};
                console.log("im drew here");
            }
            console.log("i end here");
        }
    },


    deselectText: {
        value: function() {
            this.application.ninja.stage.textTool.element.style.display = "none";
            this.selectedElement.innerHTML = this.application.ninja.stage.textTool.value;
            this.application.ninja.stage.textTool.value = "";
        }
    },

    HandleDoubleClick: {
        value: function(e) {
            //this.application.ninja.selectedElements[0]._element.setAttribute("contenteditable", true);

            //if (!this.application.ninja.textTool) {

            //}



        }
    },

    Configure: {
        value: function(wasSelected) {
            
            if(wasSelected) {
                NJevent("enableStageMove");
                this.application.ninja.stage.stageDeps.snapManager.setupDragPlaneFromPlane( workingPlane );
            } else {
                this.deselectText();
                NJevent("disableStageMove");
            }
        }
    }

});