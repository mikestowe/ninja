/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    DrawingTool = require("js/tools/drawing-tool").DrawingTool;

exports.TextTool = Montage.create(DrawingTool, {
    drawingFeedback: { value: { mode: "Draw3D", type: "rectangle" } },

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

                this._isDrawing = false;
            }
        }
    },

    HandleDoubleClick: {
        value: function(e) {
            console.log(this.application.ninja.selectedElements[0]._element);
            this.application.ninja.selectedElements[0]._element.setAttribute("contenteditable", true);
            this.application.ninja.stage._iframeContainer.style.zIndex = 200;
            this.application.ninja.selectedElements[0]._element.focus();


        }
    },

    Configure: {
        value: function(wasSelected) {
            if(wasSelected) {
                NJevent("enableStageMove");
                this.application.ninja.stage.stageDeps.snapManager.setupDragPlaneFromPlane( workingPlane );
            } else {
                NJevent("disableStageMove");
            }
        }
    }

});