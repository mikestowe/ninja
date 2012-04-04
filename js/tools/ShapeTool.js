/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    DrawingTool = require("js/tools/drawing-tool").DrawingTool,
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils,
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

	HandleLeftButtonUp:
	{
		value: function (event)
		{
            var drawData;

            drawData = this.getDrawingData();

            if(drawData) {
                var canvas;
                if(!this._useExistingCanvas()) {
                    canvas = NJUtils.makeNJElement("canvas", "Canvas", "shape", {"data-RDGE-id": NJUtils.generateRandom()}, true);
                    var elementModel = TagTool.makeElement(~~drawData.width, ~~drawData.height, drawData.planeMat, drawData.midPt, canvas);

                    canvas.elementModel.isShape = true;
                    this.application.ninja.elementMediator.addElements(canvas, elementModel.data);
                } else {
                    canvas = this._targetedElement;
                    canvas.elementModel.controller = ShapesController;
                    if(!canvas.elementModel.shapeModel) {
                        canvas.elementModel.shapeModel = Montage.create(ShapeModel);
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
            var drawData;

            if(drawData = this.getDrawingData()) {
                this.RenderShape(drawData.width, drawData.height, drawData.planeMat, drawData.midPt, el);
            }
        }
    },

    Configure: {
        value: function(wasSelected) {
            if(wasSelected) {
                this.AddCustomFeedback();
                this.application.ninja.elementMediator.addDelegate = this;
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
                this._targetedElement.classList.remove("elem-red-outline");
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
			var targetedObject = this.application.ninja.stage.GetElement(event);

			if (targetedObject) {
				// TODO - Clean this up
				if((targetedObject.nodeName === "CANVAS") && !ShapesController.isElementAShape(targetedObject))
				{
					if (targetedObject !== this._targetedElement) {
						if(this._targetedElement)
						{
                            this._targetedElement.classList.remove("elem-red-outline");
						}
						this._targetedElement = targetedObject;
                        this._targetedElement.classList.add("elem-red-outline");
					}
				}
				else if (this._targetedElement) {
					this._targetedElement.classList.remove("elem-red-outline");
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

    createCanvas: {
        value: function (left, top, w, h)
        {
            //var tmpDiv = document.createElement("canvas");
            var tmpDiv = NJUtils.makeNJElement("canvas", "Canvas", "block");
            var rules = {
                            'position': 'absolute',
                            'top' : top + 'px',
                            'left' : left + 'px',
                            '-webkit-transform-style' : 'preserve-3d',
                            '-webkit-transform' : 'perspective(1400) matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
                        };

            tmpDiv.width = w;
            tmpDiv.height = h;

            return {el: tmpDiv, rules: rules};
        }
    },



	// We can draw on an existing canvas unless it has only a single shape object
	_useExistingCanvas: {
		value: function()
		{
			return (this._targetedElement && !ShapesController.isElementAShape(this._targetedElement));
		}
	}

});

