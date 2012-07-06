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

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

//var snapManager = ("js/helper-classes/3D/snap-manager").SnapManager;

exports.toolBase = Montage.create(Component, {
    options: { value: null },

    /**
     * This property will make the stageManager return null when false
     * or the Stage / PasteBoard when true
     */
    _canOperateOnStage: { value: false },

    _downPoint: { value: { "x": null, "y": null } },
    _upPoint:   { value: { "x": null, "y": null } },

    downPoint: {
        get: function() { return this._downPoint; },
        set: function(value) { this._downPoint = value; }
    },

    upPoint: {
        get: function() { return this._upPoint; },
        set: function(value) { this._upPoint = value; }
    },

    // Need to keep track of current mouse position for KEY modifiers event which do not have mouse coordinates.
    _currentX: {value: 0, writable: true},
    _currentY: {value: 0, writable: true},

    _dragPlane: { value: null },

    /**
     * This function is for specifying custom feedback routine
     * upon mouse over.
     * For example, the drawing tools will add a glow when mousing
     * over existing canvas elements to signal to the user that
     * the drawing operation will act on the targeted canvas.
     */
    _showFeedbackOnMouseMove : { value: null },

    _canDraw:   { value: true },
    _isDrawing: { value: false },
    _hasDraw:   { value: false },
    _isSpace:   { value: false },
    _escape:    { value: false },


    HandleLeftButtonUp:     { value : function () {} },
    HandleRightButtonDown:  { value : function () {} },
    HandleRightButtonUp:    { value : function () {} },
    HandleMouseMove:        { value : function () {} },

    HandleKeyPress:     { value : function () {} },
    HandleKeyUp:        { value : function () {} },
    HandleDoubleClick:  { value : function () {} },
    HandleShiftKeyDown: { value : function () {} },
    HandleShiftKeyUp:   { value : function () {} },
    HandleAltKeyDown:   { value : function () {} },
    HandleAltKeyUp:     { value : function () {} },
    
    HandleSpaceDown:    { value: function() { this._isSpace = true; } },
    HandleSpaceUp:      { value: function() { this._isSpace = false; } },

    HandleEscape:       { value: function(event) {} },

    /**
     *  If wasSelected, configure the tool by:
     *  2) adding custom feedback
     *  3) drawing handles
     *  If wasSelected is false, clean up after the tool by:
     *  1) removing custom feedback
     */
    _configure: {
        value: function(selected) {
            this.Configure(selected);
        }
    },

    Configure: { value: function (wasSelected) {} },

    doSelection: {
        value: function(event) {

            if(this._canOperateOnStage) {
                if(event.shiftKey) {
                    this.application.ninja.selectionController.shiftSelectElement(this.application.ninja.stage.getElement(event));
                } else {
                    this.application.ninja.selectionController.selectElement(this.application.ninja.stage.getElement(event));
                }
            }

            // TODO - Code used to know if this is a GL Canvas container --> Move this to the selectionManager?
            /*
            if(selectedObject.Ninja && selectedObject.Ninja.GLWorld) {
                selectedObject.Ninja.GLWorld.getShapeFromPoint(event.layerX - selectedObject.left, event.layerY - selectedObject.top);
            }
            */

        }
    },

    zoomIn:{
        value:function(event){
            var upperBoundary ,previousZoomValue;

            previousZoomValue = this.application.ninja.documentBar.zoomFactor;
            upperBoundary = previousZoomValue *1.2 ;
            
            if(upperBoundary > 2000)
                this.application.ninja.documentBar.zoomFactor = 2000;
            else
                this.application.ninja.documentBar.zoomFactor*= 1.2;

        }
    },

    zoomOut:{
        value:function(){
            var lowerBoundary ,previousZoomValue;
            
            previousZoomValue = this.application.ninja.documentBar.zoomFactor ;
            lowerBoundary = previousZoomValue/1.2 ;

            if(lowerBoundary < 25)
                this.application.ninja.documentBar.zoomFactor = 25;
            else
                this.application.ninja.documentBar.zoomFactor/= 1.2;
        }
    },

    UpdateSelection: {
        value : function (shouldDispatchEvent) {
            if(shouldDispatchEvent) {
//                documentControllerModule.DocumentController.DispatchElementChangedEvent(selectionManagerModule.selectionManager.selectedItems, []);
            } else {
//                if(!selectionManagerModule.selectionManager.isDocument) {
//                    stageManagerModule.stageManager.drawSelectionRec(true);
//                    drawLayoutModule.drawLayout.redrawDocument();
//                }
//                else
//                {
//                    stageManagerModule.stageManager.drawSelectionRec(true);
//                    drawLayoutModule.drawLayout.redrawDocument();
//                }
            }

//            if (drawUtils.isDrawingGrid())
//            {
//			    snapManager.updateWorkingPlaneFromView();
//            }
        }
    },

    // Should be an array of handles for each tool.
    // The array should contain ToolHandle objects that define
    // dimensions, cursor, functionality
    // For example, the Selection Tool holds the 8 resize handles in this order because this
    // is the order we retrieve a rectangle's points using viewUtils:
    // 0  7  6
    // 1     5
    // 2  3  4
    _handles: {
        value:null,
        writable: true
    },

//    InitHandles: {
//        value: function () {
//            this.DrawHandles();
//        }
//    },

    // Used for figuring what the tool should do.
    // For example, if the handle mode is 5, the tool should resize the element to the right
    _handleMode: {
        value:null,
        writable: true
    },

    DrawHandles: {
        value: function () {
            // Tool should override this method if it implements handles
        }
    }

});
