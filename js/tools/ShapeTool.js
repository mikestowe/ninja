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
    NJUtils = require("js/lib/NJUtils").NJUtils,
    ShapesController = require("js/controllers/elements/shapes-controller").ShapesController,
    ShapeModel    = require("js/models/shape-model").ShapeModel,
    TagTool = require("js/tools/TagTool").TagTool;

var World = require("js/lib/drawing/world").World;

exports.ShapeTool = Montage.create(DrawingTool, {
    drawingFeedback: { value: { mode: "Draw3D", type: "rectangle" } },

    _targetedElement: { value: null, writable: true },

    _mouseDownHitRec: { value: null, writable: true, enumerable: true, configurable: true },
    _mouseUpHitRec: { value: null, writable: true, enumerable: true, configurable: true },

    _canvasCounter: {value: 0,  writable: true,  enumerable: true, configurable: true },

    HandleLeftButtonDown:
    {
        value: function (event)
        {
            if(this._canDraw) {
                this._isDrawing = true;
            }

            this.startDraw(event);
        }
    },

    HandleMouseMove:
    {
        value: function (event)
        {

            /* TAG */
            if(this.isDrawing) {
                this.doDraw(event);
            } else {
                this.doSnap(event);
                this._showFeedbackOnMouseMove(event);
            }

            this.drawLastSnap();        // Required cleanup for both Draw/Feedbacks

        }
    },

    HandleLeftButtonUp: {
        value: function (event) {
            var canvas, w, h;
            this.drawData = this.getDrawingData();

            if(this.drawData) {
                w = Math.floor(this.drawData.width);
                h = Math.floor(this.drawData.height);

                if( (w > 0) && (h > 0) ) {
                    if(!this._useExistingCanvas()) {
                        canvas = document.application.njUtils.make("canvas", {"data-RDGE-id": NJUtils.generateRandom()}, this.application.ninja.currentDocument);

                        var styles = document.application.njUtils.stylesFromDraw(canvas, w, h, this.drawData);
                        this.application.ninja.elementMediator.addElements(canvas, styles);
                    } else {
                        canvas = this._targetedElement;
                        if (!canvas.getAttribute( "data-RDGE-id" ))
                            canvas.setAttribute( "data-RDGE-id", NJUtils.generateRandom() );
                        canvas.elementModel.controller = ShapesController;
                        if(!canvas.elementModel.shapeModel) {
                            canvas.elementModel.shapeModel = Montage.create(ShapeModel);
                        }
                        this.RenderShape(w, h, this.drawData.planeMat, this.drawData.midPt, canvas);
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
            if(this.drawData) {
                this.RenderShape(this.drawData.width, this.drawData.height, this.drawData.planeMat, this.drawData.midPt, el);
            }
        }
    },

    Configure: {
        value: function(wasSelected) {
            if(wasSelected) {
                this.AddCustomFeedback();
                this.application.ninja.elementMediator.addDelegate = this;
                if(this.application.ninja.currentDocument.model.domContainer.nodeName === "CANVAS") {
                    this._targetedElement = this.application.ninja.currentDocument.model.domContainer;
                }
            } else {
                this.RemoveCustomFeedback();
                this.application.ninja.elementMediator.addDelegate = null;
            }
        }
    },

    AddCustomFeedback: {
        value: function (event) {
            NJevent("enableStageMove");

            this.application.ninja.stage.stageDeps.snapManager.setupDragPlaneFromPlane( workingPlane );
        }
    },

    RemoveCustomFeedback: {
        value: function (event) {
            if (this._targetedElement) {
                this._targetedElement.classList.remove("active-element-outline");
                this._targetedElement = null;
            }

            NJevent("disableStageMove");

            this.application.ninja.stage.stageDeps.snapManager.clearDragPlane();
        }
    },

    /** Show a border when mousing
     * over existing canvas elements to signal to the user that
     * the drawing operation will act on the targeted canvas.
    **/
    _showFeedbackOnMouseMove: {
        value: function (event) {
            // TODO - This call is causing the canvas to redraw 3 times per mouse move
            var targetedObject = this.application.ninja.stage.getElement(event, true);

            if (targetedObject) {
                if((targetedObject.nodeName === "CANVAS") && !ShapesController.isElementAShape(targetedObject))
                {
                    if (targetedObject !== this._targetedElement) {
                        if(this._targetedElement)
                        {
                            this._targetedElement.classList.remove("active-element-outline");
                        }
                        this._targetedElement = targetedObject;
                        this._targetedElement.classList.add("active-element-outline");
                    }
                }
                else if (this._targetedElement) {
                    this._targetedElement.classList.remove("active-element-outline");
                    this._targetedElement = null;
                }
            }
            else if (this._targetedElement) {
                this._targetedElement.classList.remove("elem-red-outline");
                this._targetedElement = null;
            }
        }
    },

    RenderShape:
    {
        value: function (w, h, planeMat, midPt)
        {
            // Override in subclasses
        }
    },

    getGLWorld: {
        value: function (canvas, use3D)
        {
            var world = this.application.ninja.elementMediator.getShapeProperty(canvas, "GLWorld");
            if(!world)
            {
                // create all the GL stuff
                var world = new World(canvas, use3D);
                this.application.ninja.elementMediator.setShapeProperty(canvas, "GLWorld", world);
            }

            return world;
        }
    },

    // We can draw on an existing canvas unless it has only a single shape object
    _useExistingCanvas: {
        value: function()
        {
            var target;
            if (this._targetedElement && (this._targetedElement.nodeName === "CANVAS") && !ShapesController.isElementAShape(this._targetedElement))
                target = this._targetedElement;
            else
            {
                var container = this.application.ninja.currentDocument.model.domContainer;
                if (container && (container.nodeName === "CANVAS"))
                {
                    target = container;
                    this._targetedElement = target;
                }
            }

            return target;
        }
    },

    setColor: {
        value: function(canvas, color, isFill, toolId)
        {
            if(color && color.color)
            {
                this.application.ninja.elementMediator.setColor([canvas], {mode:color.colorMode, color:color.color}, isFill, "Change", toolId);
            }
            else
            {
                this.application.ninja.elementMediator.setColor([canvas], {mode:"nocolor", color:null}, isFill, "Change", toolId);
            }
        }
    }

});

