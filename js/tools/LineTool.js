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

var Montage =   require("montage/core/core").Montage,
    ShapeTool = require("js/tools/ShapeTool").ShapeTool,
    DrawingToolBase = require("js/tools/drawing-tool-base").DrawingToolBase,
    NJUtils = require("js/lib/NJUtils").NJUtils,
    TagTool = require("js/tools/TagTool").TagTool,
    ShapesController =  require("js/controllers/elements/shapes-controller").ShapesController,
    ShapeModel = require("js/models/shape-model").ShapeModel;

var Line = require("js/lib/geom/line").Line;
var MaterialsModel = require("js/models/materials-model").MaterialsModel;

exports.LineTool = Montage.create(ShapeTool, {
    _toolID: { value: "lineTool" },
    _imageID: { value: "lineToolImg" },
    _toolImageClass: { value: "lineToolUp" },
    _selectedToolImageClass: { value: "lineToolDown" },
    _toolTipText: { value: "Line Tool (L)" },

    _tmpDrawIndex : { value : 1, writable:true},

    _mode: {value: null, writable:true},

    // Need to keep track of current mouse position for KEY modifiers event which do not have mouse coordinates
    _currentX: {value: 0, writable: true},
    _currentY: {value: 0, writable: true},
    _lineView: {value: null, writable:true},
    _ovalView: {value: null, writable:true},

    _strokeSize: { value: 1 },
    _strokeColor: { value: null },

    HandleLeftButtonDown:
    {
        value: function (event)
        {
            if(this._canDraw) {
                this._isDrawing = true;
            }

            this._strokeSize = ShapesController.GetValueInPixels(this.options.strokeSize.value, this.options.strokeSize.units, null);
            if (this.options.stroke.color) {
                if( (this.options.stroke.colorMode === "gradient") || (this.options.stroke.colorMode === "nocolor") ) {
                    this._strokeColor = [0,0,0,1];
                } else {
                    this._strokeColor = this.options.stroke.color.css;
                }
            } else {
                this._strokeColor = [0,0,0,1];
            }

            this.startDraw(event);
        }
    },

    HandleLeftButtonUp: {
        value: function (event) {
            var slope = this._getSlope(),
                canvas,
                xAdj = 0,
                yAdj = 0,
                w,
                h;

            if(slope) {
                this.drawData = this.getDrawingData();
                if(this.drawData) {
                    w = Math.floor(this.drawData.width);
                    h = Math.floor(this.drawData.height);
                    if(!this._useExistingCanvas()) {
                            // set the dimensions
                            if(slope === "horizontal") {
                                h = Math.max(this._strokeSize, 1);
                                w = Math.max(w, 1);
                            } else if(slope === "vertical") {
                                w = Math.max(this._strokeSize, 1);
                                h = Math.max(h, 1);
                            } else {
                                // else make the line's stroke fit inside the canvas by growing the canvas
                                var theta = Math.atan(slope);
                                xAdj = Math.abs((this._strokeSize/2)*Math.sin(theta));
                                yAdj = Math.abs((this._strokeSize/2)*Math.cos(theta));

                                w += ~~(xAdj*2);
                                h += ~~(yAdj*2);
                            }

                            canvas = document.application.njUtils.make("canvas", {"data-RDGE-id": NJUtils.generateRandom()}, this.application.ninja.currentDocument);

                            var styles = document.application.njUtils.stylesFromDraw(canvas, w, h, this.drawData);
                            this.application.ninja.elementMediator.addElements(canvas, styles);
                        } else {
                            canvas = this._targetedElement;
                            canvas.elementModel.controller = ShapesController;
                            if(!canvas.elementModel.shapeModel) {
                                canvas.elementModel.shapeModel = Montage.create(ShapeModel);
                        }
                    }
                }
            }

            this.endDraw(event);

            this._isDrawing = false;
            this._hasDraw=false;

            this.DrawHandles();
        }
    },

    onAddElements: {
        value: function(el) {
            var xAdj = 0, yAdj = 0, w, h, slope = this._getSlope();

            if(this.drawData) {
                // set the dimensions
                w = Math.floor(this.drawData.width);
                h = Math.floor(this.drawData.height);
                if(slope === "horizontal") {
                    h = Math.max(this._strokeSize, 1);
                    w = Math.max(w, 1);
                } else if(slope === "vertical") {
                    w = Math.max(this._strokeSize, 1);
                    h = Math.max(h, 1);
                } else {
                    // else make the line's stroke fit inside the canvas by growing the canvas
                    var theta = Math.atan(slope);
                    xAdj = Math.abs((this._strokeSize/2)*Math.sin(theta));
                    yAdj = Math.abs((this._strokeSize/2)*Math.cos(theta));

                    w += ~~(xAdj*2);
                    h += ~~(yAdj*2);
                }

                this.RenderShape(w, h, this.drawData.planeMat, this.drawData.midPt, el, slope, xAdj, yAdj);
            }
        }
    },

    _getSlope: {
        value: function() {
            var hitRec0 = this._mouseDownHitRec,
                hitRec1 = this._mouseUpHitRec,
                slope,
                dx,
                dy;

            if (hitRec0 && hitRec1) {
                var p0 = hitRec0.getLocalPoint(),
                    p1 = hitRec1.getLocalPoint();

                dx = Math.floor(p0[0] - p1[0]);
                dy = Math.floor(p0[1] - p1[1]);

                if( (dx === 0) && (dy === 0) ) {
                    return null;
                }

                // check for divide by 0 for vertical line:
                if(dx === 0) {
                    // vertical line
                    slope = "vertical";
                } else if (dy === 0) {
                    // horizontal line
                    slope = "horizontal";
                } else {
                    // if slope is positive, draw a line from top-left to bottom-right
                    slope = dy/dx;
                }
            }

            return slope;
        }
    },

    _doDraw: {
        value: function () {
            if (this.mouseDownHitRec !== null) {
                DrawingToolBase.stageComponent = this.application.ninja.stage;
                DrawingToolBase.drawLine(this.mouseDownHitRec, this.mouseUpHitRec, this._strokeSize, this._strokeColor);
            }
        }
    },

    HandleShiftKeyDown: {
        value: function (event) {
            if (this._isDrawing) {
                var slope = Math.abs((this.downPoint.y - this.currentY)/(this.downPoint.x - this.currentX));
                // If slope is less than 0.5, make it a horizontal line
                if(slope < 0.5)
                {
                    this._mouseUpHitRec = DrawingToolBase.getUpdatedSnapPoint(this.currentX, this.downPoint.y, false, this._mouseDownHitRec);
                }
                // If slope is greater than 2, make it a vertical line
                else if(slope > 2)
                {
                    this._mouseUpHitRec = DrawingToolBase.getUpdatedSnapPoint(this.downPoint.x, this.currentY, false, this._mouseDownHitRec);
                }
                // make it a 45 degree line
                else
                {
                    var square = this.toSquare(this.downPoint.x, this.currentX, this.downPoint.y, this.currentY);
                    this._mouseUpHitRec = DrawingToolBase.getUpdatedSnapPoint(square[0] + square[2], square[1] + square[3], false, this._mouseDownHitRec);
                }
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

    RenderShape: {
        value: function (w, h, planeMat, midPt, canvas, slope, xAdj, yAdj)
        {

            var strokeStyleIndex = this.options.strokeStyleIndex;
            var strokeStyle = this.options.strokeStyle;
            var strokeSize = this._strokeSize;

            var left = Math.round(midPt[0] - 0.5*w);
            var top = Math.round(midPt[1] - 0.5*h);

            var strokeColor = this.options.stroke.webGlColor;
            // for default stroke and fill/no materials
            var strokeMaterial = null;
            var strokeM = null;

            if(this.options.use3D)
            {
                strokeM = this.options.strokeMaterial;
                if(strokeM)
                {
                    strokeMaterial = Object.create(MaterialsModel.getMaterial(strokeM));
                }
                if (strokeMaterial && this.options.stroke.color && (strokeMaterial.gradientType === this.options.stroke.color.gradientMode)) {
                    strokeColor = {gradientMode:strokeMaterial.gradientType, color:this.options.stroke.color.stops};
                } else {
                strokeColor = ShapesController.getMaterialColor(strokeM) || strokeColor;
            }
            }

            var world = this.getGLWorld(canvas, this.options.use3D);

            var xOffset = ((left - canvas.offsetLeft + w/2) - canvas.width/2);
            var yOffset = (canvas.height/2 - (top - canvas.offsetTop + h/2));

            var line = Object.create(Line, {});
            line.init(world, xOffset, yOffset, w, h, slope, strokeSize, strokeColor, strokeMaterial, strokeStyle, xAdj, yAdj);

            world.addObject(line);
            world.render();

            canvas.elementModel.shapeModel.shapeCount++;
            if(canvas.elementModel.shapeModel.shapeCount === 1)
            {
//                canvas.elementModel.selection = "Line";
                canvas.elementModel.pi = "LinePi";
                canvas.elementModel.shapeModel.strokeSize = this.options.strokeSize.value + " " + this.options.strokeSize.units;

                canvas.elementModel.shapeModel.strokeStyleIndex = strokeStyleIndex;
                canvas.elementModel.shapeModel.strokeStyle = strokeStyle;

                canvas.elementModel.shapeModel.GLGeomObj = line;
                canvas.elementModel.shapeModel.useWebGl = this.options.use3D;
                canvas.elementModel.shapeModel.slope = slope;
            }
            else
            {
                // TODO - update the shape's info only.  shapeModel will likely need an array of shapes.
            }

            // TODO - This needs to be moved into geom obj's init routine instead of here
            if(!strokeM) {
                this.setColor(canvas, this.options.stroke, false, "lineTool");
            }

            if(canvas.elementModel.isShape)
            {
                this.application.ninja.selectionController.selectElement(canvas);
            }

        }
    }
});


