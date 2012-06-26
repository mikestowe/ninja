/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    DrawingTool = require("js/tools/drawing-tool").DrawingTool,
    NJUtils = require("js/lib/NJUtils").NJUtils;

var DrawingToolBase = require("js/tools/drawing-tool-base").DrawingToolBase;

exports.TagTool = Montage.create(DrawingTool, {
    drawingFeedback: { value: { mode: "Draw3D", type: "rectangle" } },

    Configure: {
        value: function(wasSelected) {
            if(wasSelected) {
                NJevent("enableStageMove");
                this.application.ninja.stage.stageDeps.snapManager.setupDragPlaneFromPlane( workingPlane );
            } else {
                NJevent("disableStageMove");
            }
        }
    },

    HandleLeftButtonDown: {
        value: function(event) {
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
            var w, h;
            if(this._escape) {
                this._escape = false;
                return;
            }

            if(this._hasDraw) {
                this.drawData = this.getDrawingData();
                if(this.drawData) {
                    w = Math.floor(this.drawData.width);
                    h = Math.floor(this.drawData.height);
                    if( (w > 0) && (h > 0) ) {
                        this.insertElement(this.drawData);
                    }
                }

                this._hasDraw = false;
                this.endDraw(event);
            } else {
                this.doSelection(event);
            }

            this._isDrawing = false;
        }
    },

    // TODO: Fix Classname
    // TODO: Add position support
    insertElement: {
        value: function(drawData) {
            var element, styles, color;

            // Create the element
            if(this.options.selectedElement === "custom") {
                element = document.application.njUtils.make(this.options.customName.value, null, this.application.ninja.currentDocument);

            } else {
                element = document.application.njUtils.make(this.options.selectedElement, null, this.application.ninja.currentDocument);
            }

            // Create the styles
            styles = document.application.njUtils.stylesFromDraw(element, ~~drawData.width, ~~drawData.height, drawData);

            // Add color
            color = this.options.fill;
            switch(color.colorMode) {
                case "nocolor":
                    break;
                case "gradient":
                    styles['background-image'] = color.color.css;
                    break;
                default:
                    styles['background-color'] = color.color.css;
            }

            // Add the element and styles
            this.application.ninja.elementMediator.addElements(element, styles);
        }
    }
});

