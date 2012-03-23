/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var ShapeTool = require("js/tools/ShapeTool").ShapeTool;
var ShapesController = 	require("js/controllers/elements/shapes-controller").ShapesController;
var DrawingToolBase = require("js/tools/drawing-tool-base").DrawingToolBase;
var defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;
var Montage = require("montage/core/core").Montage;
var NJUtils = require("js/lib/NJUtils").NJUtils;
var ElementMediator = require("js/mediators/element-mediator").ElementMediator;
var TagTool = require("js/tools/TagTool").TagTool;
var snapManager = require("js/helper-classes/3D/snap-manager").SnapManager;

var BrushStroke = require("js/lib/geom/brush-stroke").BrushStroke;

//whether or not we want the mouse move to be handled all the time (not just while drawing) inside the brush tool
var g_DoBrushToolMouseMove = true;

exports.BrushTool = Montage.create(ShapeTool, {
    hasReel: { value: false },
        _toolID: { value: "brushTool" },
        _imageID: { value: "brushToolImg" },
        _toolImageClass: { value: "brushToolUp" },
        _selectedToolImageClass: { value: "brushToolDown" },
        _toolTipText: { value: "Brush Tool" },
        _brushView: { value: null, writable: true },

        _selectedToolClass: { value: "brushToolSpecificProperties" },
        _penToolProperties: { enumerable: false, value: null, writable: true },
        _parentNode: { enumerable: false, value: null, writable: true },
        _toolsPropertiesContainer: { enumerable: false, value: null, writable: true },

        //config options
        _useWebGL: {value: false, writable: false},

        //view options
        _brushStrokeCanvas: {value: null, writable: true},
        _brushStrokePlaneMat: {value: null, writable: true},
        _draggingPlane: {value: null, writable: true},

        //the current brush stroke
        _selectedBrushStroke: {value: null, writable: true},

        ShowToolProperties: {
            value: function () {
                this._brushView = PenView.create();
                this._brushView.element = document.getElementById('topPanelContainer').children[0];
                this._brushView.needsDraw = true;
                this._brushView.addEventListener(ToolEvents.TOOL_OPTION_CHANGE, this, false);
            }
        },

        HandleLeftButtonDown: {
            value: function (event) {
                //ignore any right or middle clicks
                if (event.button !== 0) {
                   //NOTE: this will work on Webkit only...IE has different codes (left: 1, middle: 4, right: 2)
                   return;
                }
                if (this._canDraw) {
                   this._isDrawing = true;
                }

                this.startDraw(event);
                this._brushStrokePlaneMat = this.mouseDownHitRec.getPlaneMatrix();

                //start a new brush stroke
                if (this._selectedBrushStroke === null){
                    this._selectedBrushStroke = new BrushStroke();
                    if (this.application.ninja.colorController.colorToolbar.stroke.webGlColor){
                        this._selectedBrushStroke.setStrokeColor(this.application.ninja.colorController.colorToolbar.stroke.webGlColor);
                    }
                    if (this.application.ninja.colorController.colorToolbar.fill.webGlColor){
                        this._selectedBrushStroke.setSecondStrokeColor(this.application.ninja.colorController.colorToolbar.fill.webGlColor);
                    }
                    
                    //add this point to the brush stroke in case the user does a mouse up before doing a mouse move
                    var currMousePos = this._getUnsnappedPosition(event.pageX, event.pageY);
                    this._selectedBrushStroke.addPoint(currMousePos);

                    var strokeSize = 1;
                    if (this.options.strokeSize) {
                        strokeSize = ShapesController.GetValueInPixels(this.options.strokeSize.value, this.options.strokeSize.units);
                    }
                    this._selectedBrushStroke.setStrokeWidth(strokeSize);

                    var strokeHardness = 100;
                    if (this.options.strokeHardness){
                        strokeHardness = this.options.strokeHardness.value;
                    }
                    this._selectedBrushStroke.setStrokeHardness(strokeHardness);

                    var doSmoothing = false;
                    if (this.options.doSmoothing){
                        doSmoothing = this.options.doSmoothing;
                    }
                    this._selectedBrushStroke.setDoSmoothing(doSmoothing);
                    if (doSmoothing){
                        this._selectedBrushStroke.setSmoothingAmount(this.options.smoothingAmount.value);
                    }
                    
                    var useCalligraphic = false;
                    if (this.options.useCalligraphic){
                        useCalligraphic = this.options.useCalligraphic;
                    }
                    if (useCalligraphic) {
                        this._selectedBrushStroke.setStrokeUseCalligraphic(true);
                        var strokeAngle = 0;
                        if (this.options.strokeAngle){
                            strokeAngle= this.options.strokeAngle.value;
                        }
                        this._selectedBrushStroke.setStrokeAngle(Math.PI * strokeAngle/180);
                    } else {
                        this._selectedBrushStroke.setStrokeUseCalligraphic(false);
                    }
                    
                }
                if (!g_DoBrushToolMouseMove)
                    NJevent("enableStageMove");//stageManagerModule.stageManager.enableMouseMove();
            } //value: function (event) {
        }, //HandleLeftButtonDown

        _getUnsnappedPosition: {
            value: function(x,y){
                var elemSnap = snapManager.elementSnapEnabled();
                var gridSnap = snapManager.gridSnapEnabled();
                var alignSnap = snapManager.snapAlignEnabled();

                snapManager.enableElementSnap(false);
                snapManager.enableGridSnap(false);
                snapManager.enableSnapAlign(false);

                var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas, new WebKitPoint(x,y));
                //todo fix this function to allow us to get the correct location (in 3D) for the mouse position
                var unsnappedpos = DrawingToolBase.getHitRecPos(snapManager.snap(point.x, point.y, false));
                this._draggingPlane = snapManager.getDragPlane();

                snapManager.enableElementSnap(elemSnap);
                snapManager.enableGridSnap(gridSnap);
                snapManager.enableSnapAlign(alignSnap);

                return unsnappedpos;
            }
        },
        //need to override this function because the ShapeTool's definition contains a clearDrawingCanvas call  - Pushkar
        //  might not need to override once we draw using OpenGL instead of SVG
        // Also took out all the snapping code for now...need to add that back
        HandleMouseMove:
        {
            value: function (event) {
                //ignore any right or middle clicks
                if (event.button !== 0) {
                   //NOTE: this will work on Webkit only...IE has different codes (left: 1, middle: 4, right: 2)
                   return;
                }

                var currMousePos = this._getUnsnappedPosition(event.pageX, event.pageY);
                if (this._isDrawing) {
                    if (this._selectedBrushStroke && this._selectedBrushStroke.getNumPoints()<1000){
                       this._selectedBrushStroke.addPoint(currMousePos);
                    }
                    this.ShowCurrentBrushStrokeOnStage();
                } else {
                    this.ShowCurrentBrushIconOnStage(currMousePos);
                }

                //this.drawLastSnap();        //TODO.. is this line necessary if we're not snapping? // Required cleanup for both Draw/Feedbacks

           }//value: function(event)
        },



        HandleLeftButtonUp: {
            value: function (event) {
                this.endDraw(event);

                this._isDrawing = false;
                this._hasDraw = false;

                //finish giving enough info. to the brush stroke
                this._selectedBrushStroke.setPlaneMatrix(this._brushStrokePlaneMat);
                this._selectedBrushStroke.setPlaneMatrixInverse(glmat4.inverse(this._brushStrokePlaneMat,[]));
                this._selectedBrushStroke.setDragPlane(this._draggingPlane);
                
                //display the previously drawn stroke in a separate canvas
                this.RenderCurrentBrushStroke();

                this._selectedBrushStroke = null;
                this._brushStrokeCanvas = null;
                if (!g_DoBrushToolMouseMove)
                    NJevent("disableStageMove");
            }
        },

        ShowCurrentBrushIconOnStage:{
            value: function(currMousePos) {
                //clear the canvas before we draw anything else
                this.application.ninja.stage.clearDrawingCanvas();
                //display the brush icon of proper size (query the options bar)
                var strokeSize = 1;
                if (this.options.strokeSize) {
                    strokeSize = ShapesController.GetValueInPixels(this.options.strokeSize.value, this.options.strokeSize.units);
                }
                var useCalligraphic = false;
                if (this.options.useCalligraphic){
                    useCalligraphic = this.options.useCalligraphic;
                }
                var ctx = this.application.ninja.stage.drawingContext;//stageManagerModule.stageManager.drawingContext;
                if (ctx === null)
                    throw ("null drawing context in Brushtool::ShowCurrentBrushStrokeOnStage");
                ctx.save();

                var horizontalOffset = this.application.ninja.stage.userContentLeft;
                var verticalOffset = this.application.ninja.stage.userContentTop;
                var halfStrokeWidth = 0.5*strokeSize;
                ctx.beginPath();
                if (!useCalligraphic) {
                    //for round brushes, draw a circle at the current mouse position
                    ctx.arc(currMousePos[0] + horizontalOffset, currMousePos[1]+ verticalOffset, halfStrokeWidth, 0, 2 * Math.PI, false);
                } else {
                    //draw an angled stroke to represent the brush tip
                    var strokeAngle = 0;
                    if (this.options.strokeAngle){
                        strokeAngle= this.options.strokeAngle.value;
                    }
                    strokeAngle = Math.PI * strokeAngle/180;
                    var deltaDisplacement = [Math.cos(strokeAngle),Math.sin(strokeAngle)];
                    deltaDisplacement = VecUtils.vecNormalize(2, deltaDisplacement, 1);
                    var startPos = VecUtils.vecSubtract(2, currMousePos, [-horizontalOffset+halfStrokeWidth*deltaDisplacement[0],-verticalOffset+halfStrokeWidth*deltaDisplacement[1]]);
                    ctx.moveTo(startPos[0], startPos[1]);
                    var endPos = VecUtils.vecAdd(2, startPos, [strokeSize*deltaDisplacement[0], strokeSize*deltaDisplacement[1]]);
                    ctx.lineTo(endPos[0], endPos[1]);
                    ctx.lineWidth = 2;
                }
                ctx.strokeStyle = "black";
                ctx.stroke();
                ctx.restore();
            }
        },

        ShowCurrentBrushStrokeOnStage:{
            value: function() {
                //clear the canvas before we draw anything else
                this.application.ninja.stage.clearDrawingCanvas();
                if (this._selectedBrushStroke && this._selectedBrushStroke.getNumPoints()>0){
                    var ctx = this.application.ninja.stage.drawingContext;//stageManagerModule.stageManager.drawingContext;
                    if (ctx === null)
                        throw ("null drawing context in Brushtool::ShowCurrentBrushStrokeOnStage");
                    ctx.save();
                    var horizontalOffset = this.application.ninja.stage.userContentLeft;
                    var verticalOffset = this.application.ninja.stage.userContentTop;
                    var origX = -horizontalOffset;
                    var origY = -verticalOffset;
                    this._selectedBrushStroke.drawToContext(ctx, origX, origY, true);
                    ctx.restore();
                }
            }
        },

        RenderCurrentBrushStroke:{
            value: function() {
                if (this._selectedBrushStroke){
                    //DEBUGGING
                    /*var localData = this._selectedBrushStroke.buildLocalDataFromStageWorldCoord();
                    var bboxWidth = localData[1];
                    var bboxHeight = localData[2];
                    var bboxMid = localData[0];*/
                    this._selectedBrushStroke.init();
                    var bboxWidth = this._selectedBrushStroke.getWidth();
                    var bboxHeight = this._selectedBrushStroke.getHeight();
                    var bboxMid = this._selectedBrushStroke.getStageWorldCenter();
                    //end DEBUGGING
                    //call render shape with the bbox width and height
                    this.RenderShape(bboxWidth, bboxHeight, this._brushStrokePlaneMat, bboxMid, this._brushStrokeCanvas);

                    /*this._selectedBrushStroke.computeMetaGeometry();
                    var bboxMin = this._selectedBrushStroke.getBBoxMin();
                    var bboxMax = this._selectedBrushStroke.getBBoxMax();
                    var bboxWidth = bboxMax[0] - bboxMin[0];
                    var bboxHeight = bboxMax[1] - bboxMin[1];
                    var bboxMid = [0.5 * (bboxMax[0] + bboxMin[0]), 0.5 * (bboxMax[1] + bboxMin[1]), 0.5 * (bboxMax[2] + bboxMin[2])];

                    this._selectedBrushStroke.setCanvasX(bboxMid[0]);
                    this._selectedBrushStroke.setCanvasY(bboxMid[1]);
                    //call render shape with the bbox width and height
                    this.RenderShape(bboxWidth, bboxHeight, this._brushStrokePlaneMat, bboxMid, this._brushStrokeCanvas);
                    */
                }
            }
        },


        RenderShape: {
            value: function (w, h, planeMat, midPt, canvas) {
                if ((Math.floor(w) === 0) || (Math.floor(h) === 0)) {
                    return;
                }

                var left = Math.round(midPt[0] - 0.5 * w);
                var top = Math.round(midPt[1] - 0.5 * h);

                if (!canvas) {
                    var newCanvas = NJUtils.makeNJElement("canvas", "Brushstroke", "shape", {"data-RDGE-id": NJUtils.generateRandom()}, true);
                    var elementModel = TagTool.makeElement(w, h, planeMat, midPt, newCanvas);
                    ElementMediator.addElement(newCanvas, elementModel.data, true);

                    // create all the GL stuff
                    var world = this.getGLWorld(newCanvas, this._useWebGL);
                    //store a reference to this newly created canvas
                    this._brushStrokeCanvas = newCanvas;

                    var brushStroke = this._selectedBrushStroke;
                    if (brushStroke){
                        brushStroke.setWorld(world);
                        brushStroke.setCanvas(newCanvas);

                        brushStroke.setPlaneMatrix(planeMat);
                        var planeMatInv = glmat4.inverse( planeMat, [] );
                        brushStroke.setPlaneMatrixInverse(planeMatInv);
                        brushStroke.setPlaneCenter(midPt);

                        world.addObject(brushStroke);
                        world.render();
                        //TODO this will not work if there are multiple shapes in the same canvas
                        newCanvas.elementModel.shapeModel.GLGeomObj = brushStroke;

                        newCanvas.elementModel.shapeModel.shapeCount++;
                        if(newCanvas.elementModel.shapeModel.shapeCount === 1)
                        {
                            newCanvas.elementModel.selection = "BrushStroke";
                            newCanvas.elementModel.pi = "BrushStrokePi";
                            newCanvas.elementModel.shapeModel.strokeSize = this.options.strokeSize.value + " " + this.options.strokeSize.units;
                            var strokeColor = this._selectedBrushStroke.getStrokeColor();
                            newCanvas.elementModel.shapeModel.stroke = strokeColor;
                            if(strokeColor) {
                                newCanvas.elementModel.shapeModel.border = this.application.ninja.colorController.colorToolbar.stroke;
                            }
                            newCanvas.elementModel.shapeModel.strokeMaterial = this._selectedBrushStroke.getStrokeMaterial();

                            newCanvas.elementModel.shapeModel.GLGeomObj = brushStroke;
                            newCanvas.elementModel.shapeModel.useWebGl = this.options.use3D;
                        }
                        else
                        {
                            // TODO - update the shape's info only.  shapeModel will likely need an array of shapes.
                        }

                        if(newCanvas.elementModel.isShape)
                        {
                            this.application.ninja.selectionController.selectElement(canvas);
                        }
                    }
                } //if (!canvas) {
                else {

                    /*
                    var world = null;
                    if (canvas.elementModel.shapeModel && canvas.elementModel.shapeModel.GLWorld) {
                        world = canvas.elementModel.shapeModel.GLWorld;
                    } else {
                        world = this.getGLWorld(canvas, this._useWebGL);
                    }


                    if (this._entryEditMode !== this.ENTRY_SELECT_CANVAS){
                        //update the left and top of the canvas element
                        var canvasArray=[canvas];
                        ElementMediator.setProperty(canvasArray, "left", [parseInt(left)+"px"],"Changing", "brushTool");
                        ElementMediator.setProperty(canvasArray, "top", [parseInt(top) + "px"],"Changing", "brushTool");
                        canvas.width = w;
                        canvas.height = h;
                        //update the viewport and projection to reflect the new canvas width and height
                        world.setViewportFromCanvas(canvas);
                        if (this._useWebGL){
                            var cam = world.renderer.cameraManager().getActiveCamera();
                            cam.setPerspective(world.getFOV(), world.getAspect(), world.getZNear(), world.getZFar());
                        }
                    }

                    var brushStroke = this._selectedBrushStroke;

                    if (brushStroke){
                        brushStroke.setDrawingTool(this);

                        brushStroke.setPlaneMatrix(planeMat);
                        var planeMatInv = glmat4.inverse( planeMat, [] );
                        brushStroke.setPlaneMatrixInverse(planeMatInv);
                        brushStroke.setPlaneCenter(midPt);

                        brushStroke.setWorld(world);
                        world.addIfNewObject(brushStroke);
                        //world.addObject(subpath);
                        world.render();
                        //TODO this will not work if there are multiple shapes in the same canvas
                        canvas.elementModel.shapeModel.GLGeomObj = brushStroke;
                    }
                    */
                    alert("BrushStroke cannot edit existing canvas");
                } //else of if (!canvas) {
            } //value: function (w, h, planeMat, midPt, canvas) {
        }, //RenderShape: {
    
        Configure: {
            value: function (wasSelected) {
                if (wasSelected) {
                    if (g_DoBrushToolMouseMove){
                        NJevent("enableStageMove");
                    }
                }
                else {
                    if (g_DoBrushToolMouseMove){
                        NJevent("disbleStageMove");
                    }
                }
            }
        }

});