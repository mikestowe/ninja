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
    ToolBase = require("js/tools/ToolBase").toolBase,
    DrawingToolBase = require("js/tools/drawing-tool-base").DrawingToolBase,
    Keyboard = require("js/mediators/keyboard-mediator").Keyboard;

exports.DrawingTool = Montage.create(ToolBase, {
    drawingFeedback: { value: { mode: "Draw2D", type: "" } },    // Default Value
    _canOperateOnStage: { value: true },

    _canDraw: { value: true },
    _isDrawing: { value: false },
    _hasDraw: { value: false },
    _isSpace: { value: false },

    _downPoint: { value: { "x": null, "y": null} },
    _upPoint: { value: { "x": null, "y": null} },

    _mouseDownHitRec: { value: null },
    _mouseUpHitRec: { value: null },

    _currentX: { value: null },
    _currentY: { value: null },
    _currentDX: { value: 0 },
    _currentDY: { value: 0 },

    isDrawing: {
        get: function () { return this._isDrawing; },
        set: function (value) { this._isDrawing = value; }
    },

    downPoint: {
        get: function () { return this._downPoint; },
        set: function (value) { this._downPoint = value; }
    },

    upPoint: {
        get: function () { return this._upPoint; },
        set: function (value) { this._upPoint = value; }
    },

    mouseDownHitRec: {
        get: function () { return this._mouseDownHitRec; },
        set: function (value) { this._mouseDownHitRec = value; }
    },

    mouseUpHitRec: {
        get: function () { return this._mouseUpHitRec; },
        set: function (value) { this._mouseUpHitRec = value; }
    },

    currentX: {
        get: function () { return this._currentX; },
        set: function (value) { this._currentX = value; }
    },

    currentY: {
        get: function () { return this._currentY; },
        set: function (value) { this._currentY = value; }
    },

    drawData: { value: null },

    /**
    * PUBLIC METHODS
    */
    startDraw: {
        value: function (event) {
            var snapData, point;

            this._isDrawing = true;
            this.mouseDownHitRec = null;
            this.mouseUpHitRec = null;
            this.drawData = null;

            point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas, new WebKitPoint(event.pageX, event.pageY));
            snapData = DrawingToolBase.getInitialSnapPoint(point.x, point.y, this._targetedElement); //event.layerX, event.layerY);
            this.mouseDownHitRec = snapData[0];
            this.downPoint.x = snapData[1];
            this.downPoint.y = snapData[2];
        }
    },

    /**
    * This base method will perform stage feedback drawing if the mouse is down.
    * Otherwise it will only perform the snapping feedback
    */
    doDraw: {
        value: function (event) {
            var point;
            point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas, new WebKitPoint(event.pageX, event.pageY));

            if (this.drawingFeedback.mode === "Draw3D") {
                var do3DSnap;
                this.application.ninja.stage.clearDrawingCanvas();

                do3DSnap = false;

                if (this._isSpace) {
                    this._currentDX = point.x - this._currentX;
                    this._currentDY = point.y - this._currentY;
                    this.HandleSpaceKeyDown();
                } else {
                    this._currentX = point.x;
                    this._currentY = point.y;
                }

                if (event.shiftKey) {
                    this.HandleShiftKeyDown();
                } else if (event.altKey) {
                    this.HandleAltKeyDown();
                } else {
                    do3DSnap = event.ctrlKey || event.metaKey;
                    this.mouseUpHitRec = DrawingToolBase.getUpdatedSnapPoint(point.x, point.y, do3DSnap, this.mouseDownHitRec);
                    this._doDraw();
                }

                DrawingToolBase.drawSnapLastHit();
            } else if (this.drawingFeedback.mode === "Draw2D") {
                if(this._isSpace) {
                    this._currentDX = point.x - this._currentX;
                    this._currentDY = point.y - this._currentY;

                    this.downPoint.x += this._currentDX;
                    this.downPoint.y += this._currentDY;
                    this.currentX += this._currentDX;
                    this.currentY += this._currentDY;

                    DrawingToolBase.draw2DRectangle(this.downPoint.x,this.downPoint.y,this.currentX - this.downPoint.x,this.currentY - this.downPoint.y);
                } else {
                    this._currentX = point.x;
                    this._currentY = point.y;

                    DrawingToolBase.draw2DRectangle(this.downPoint.x,this.downPoint.y,point.x - this.downPoint.x,point.y - this.downPoint.y);
                }

            }

        }
    },

    _doDraw: {
        value: function () {
            if (this.mouseDownHitRec !== null) {
                DrawingToolBase.stageComponent = this.application.ninja.stage;
                DrawingToolBase.drawRectangle(this.mouseDownHitRec, this.mouseUpHitRec);
            }
        }
    },

    endDraw: {
        value: function (event) {
            this.application.ninja.stage.clearDrawingCanvas();

            this.mouseDownHitRec = null;
            this.mouseUpHitRec = null;
            this.downPoint.x = null;
            this.downPoint.y = null;
            this.upPoint.x = null;
            this.upPoint.y = null;
            this._isDrawing = false;

            if (this.drawingFeedback.mode === "Draw3D") {
                DrawingToolBase.cleanupSnap();
            }
        }
    },

    // Used when ESC is hit to cancel the current drawing.
    cancelDraw: {
        value: function() {
            this.application.ninja.stage.clearDrawingCanvas();

            if(this.drawingFeedback.mode === "Draw3D") {
                this._isDrawing = false;
                DrawingToolBase.cleanupSnap();
            }
        }
    },

    doSnap: {
        value: function (event) {
            var point;
            point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas, new WebKitPoint(event.pageX, event.pageY));
            this.application.ninja.stage.clearDrawingCanvas();
            this.mouseUpHitRec = DrawingToolBase.getUpdatedSnapPoint(point.x, point.y, true, this.mouseDownHitRec);
        }
    },

    drawLastSnap: {
        value: function () {
            DrawingToolBase.drawSnapLastHit();
        }
    },

    getMouseDownPos: {
        value: function () {
            return DrawingToolBase.getHitRecPos(this.mouseDownHitRec);
        }
    },

    getMouseUpPos: {
        value: function () {
            return DrawingToolBase.getHitRecPos(this.mouseUpHitRec);
        }
    },

    getDrawingData: {
        value: function (event) {
            return DrawingToolBase.getCompletePoints(this.mouseDownHitRec, this.mouseUpHitRec);
        }
    },

    /**
    * SHIFT/ALT/SPACE Key Handlers
    */
    HandleKeyPress: {
        value: function(event) {
            if(event.shiftKey) {
                this.HandleShiftKeyDown(event);
            } else if(event.altKey) {
                this.HandleAltKeyDown(event);
            } else if (event.keyCode === Keyboard.SPACE) {
                event.preventDefault();
                this.HandleSpaceKeyDown(event);
            }
        }
    },

    HandleKeyUp: {
        value: function(event) {
            if(event.keyCode === 16) {
                this.HandleShiftKeyUp(event);
            } else if(event.keyCode === 18) {
                this.HandleAltKeyUp(event);
            } else if (event.keyCode === Keyboard.SPACE) {
                event.preventDefault();
                this.HandleSpaceUp(event);
            }
        }
    },

    HandleShiftKeyDown: {
        value: function (event) {
            if (this._isDrawing) {
                var square = this.toSquare(this.downPoint.x, this.currentX, this.downPoint.y, this.currentY);
                this.mouseUpHitRec = DrawingToolBase.getUpdatedSnapPoint(square[0] + square[2], square[1] + square[3], false, this.mouseDownHitRec);
                this._doDraw();
            }
        }
    },

    HandleShiftKeyUp: {
        value: function () {
            if (this._isDrawing) {
                this.mouseUpHitRec = DrawingToolBase.getUpdatedSnapPoint(this.currentX, this.currentY, false, this.mouseDownHitRec);
                this._doDraw();
            }
        }
    },

    HandleAltKeyDown: {
        value: function (event) {
            if (this._isDrawing) {
                var square = DrawingToolBase.toCenterRectangle(this.downPoint.x, this.currentX, this.downPoint.y, this.currentY);
                var x = (square[0] - 0.5);
                var y = (square[1] - 0.5);
                this.mouseDownHitRec = DrawingToolBase.setDownHitRec(x, y, false);
                this.mouseUpHitRec = DrawingToolBase.getUpdatedSnapPoint(x + square[2], y + square[3], false, this.mouseDownHitRec);
                this._doDraw();
            }
        }
    },

    HandleAltKeyUp: {
        value: function () {
            if (this._isDrawing) {
                this.mouseDownHitRec = DrawingToolBase.setDownHitRec(this.downPoint.x,this.downPoint.y, false);
                this.mouseUpHitRec = DrawingToolBase.getUpdatedSnapPoint(this.currentX, this.currentY, false, this.mouseDownHitRec);
                this._doDraw();
            }
        }
    },

    HandleSpaceKeyDown: {
        value: function () {
            this._isSpace = true;
            if (this._isDrawing) {
                this.downPoint.x += this._currentDX;
                this.downPoint.y += this._currentDY;
                this.currentX += this._currentDX;
                this.currentY += this._currentDY;

                this.mouseDownHitRec = DrawingToolBase.setDownHitRec(this.downPoint.x + 0.5, this.downPoint.y + 0.5, false);
                this.mouseUpHitRec = DrawingToolBase.getUpdatedSnapPoint(this.currentX, this.currentY, false, this.mouseDownHitRec);
                this._doDraw();
            }
        }
    },


    HandleSpaceUp: {
        value: function () {
            this._isSpace = false;
            this._currentDX = 0;
            this._currentDY = 0;
            if (this._isDrawing) {
                this._doDraw();
            }
        }
    },

    HandleEscape: {
        value: function(event) {
            if(this.drawingFeedback) {
                this.cancelDraw();
            }

            this._escape = true;
        }
    },

    /**
    * Returns a perfect square using the top/left/bottom/right values.
    */
    toSquare: {
        value: function (x0, x1, y0, y1) {
            var dw = 1;
            var dh = 1;

            var w = x1 - x0,
                h = y1 - y0;

            if (w < 0) dw = -1;
            if (h < 0) dh = -1;

            if (Math.abs(w) >= Math.abs(h)) {
                h = (Math.abs(w) * dh);
            } else {
                w = (Math.abs(h) * dw);
            }

            return [x0, y0, w, h];
        }
    },

    absoluteRectangle: {
        value: function(x0, y0, x1, y1){
            var x,y,w,h = 0;

            if(x1 < x0) {
                x = x1;
                w = x0;
            } else {
                x = x0;
                w = x1;
            }

            if(y1 < y0) {
                y = y1;
                h = y0;
            } else {
                y = y0;
                h = y1;
            }

            return [x,y,w,h];
        }
    }

});
