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
var ElementController = require("js/controllers/elements/element-controller").ElementController;
var snapManager = require("js/helper-classes/3D/snap-manager").SnapManager;
var ViewUtils = require("js/helper-classes/3D/view-utils").ViewUtils;
var AnchorPoint = require("js/lib/geom/anchor-point").AnchorPoint;
var SubPath = require("js/lib/geom/sub-path").SubPath;

//todo remove this global var
var g_DoPenToolMouseMove = true;

exports.PenTool = Montage.create(ShapeTool, {

    _toolID: { value: "penTool" },
    _imageID: { value: "penToolImg" },
    _toolImageClass: { value: "penToolUp" },
    _selectedToolImageClass: { value: "penToolDown" },
    _toolTipText: { value: "Pen Tool" },
    _penView: { value: null, writable: true },

    _selectedToolClass: { value: "penToolSpecificProperties" },
    _penToolProperties: { enumerable: false, value: null, writable: true },
    _parentNode: { enumerable: false, value: null, writable: true },
    _toolsPropertiesContainer: { enumerable: false, value: null, writable: true },

    // Need to keep track of current mouse position for KEY modifiers event which do not have mouse coordinates
    _currentX: { value: 0, writable: true },
    _currentY: { value: 0, writable: true },

    //the subpaths are what is displayed on the screen currently, with _selectedSubpath being the active one currently being edited
    _selectedSubpath: { value: null, writable: true },
    _makeMultipleSubpaths: { value: true, writable: true },    //set this to true if you want to keep making subpaths after closing current subpath


    //whether the user has held down the Alt key
    _isAltDown: { value: false, writable: true },

    //whether the user has held down the Esc key
    _isEscapeDown: {value: false, writable: true },

    //whether we have just started a new path (set true in mousedown, and set false in mouse up
    _isNewPath: {value: false, writable: true},

    //whether we have clicked one of the endpoints after entering the pen tool in ENTRY_SELECT_PATH edit mode
    _isPickedEndPointInSelectPathMode: {value: false, writable: true},

    //when the user wants to place a selected anchor point on top of another point, this is the target where the point will be placed
    _snapTarget: { value: null, writable: true },

    //whether or not we're using webgl for drawing
    _useWebGL: {value: false, writable: false },

    //the canvas created by the pen tool...this is grown or shrunk with the path (if the canvas was not already provided)
    _penCanvas: { value: null, writable: true },

    //the plane matrix for the first click...so the entire path is on the same plane
    _penPlaneMat: { value: null, writable: true },

    //the plane equation (in stage world space) for the current path being drawn
    _dragPlane: {value: null, writable: true},

    //index of the anchor point that the user has hovered over
    _hoveredAnchorIndex: {value: -1, writable: true},

    //constants used for picking points --- NOTE: these should be user-settable parameters
    _PICK_POINT_RADIUS: { value: 4, writable: false },
    _DISPLAY_ANCHOR_RADIUS: { value: 5, writable: false },
    _DISPLAY_SELECTED_ANCHOR_RADIUS: { value: 10, writable: false },
    _DISPLAY_SELECTED_ANCHOR_PREV_RADIUS: { value: 2, writable: false },
    _DISPLAY_SELECTED_ANCHOR_NEXT_RADIUS: { value: 2, writable: false },

    //constants used for editing modes (can be OR-ed)
    EDIT_NONE: { value: 0, writable: false },
    EDIT_ANCHOR: { value: 1, writable: false },
    EDIT_PREV: { value: 2, writable: false },
    EDIT_NEXT: { value: 4, writable: false },
    EDIT_PREV_NEXT: { value: 8, writable: false },
    _editMode: { value: this.EDIT_NONE, writable: true },

    //constants used for selection modes on entry to pen tool (mutually exclusive)
    ENTRY_SELECT_NONE: { value: 0, writable: false},
    ENTRY_SELECT_CANVAS: { value: 1, writable: false},
    ENTRY_SELECT_PATH: { value: 2, writable: false},
    _entryEditMode: {value: this.ENTRY_SELECT_NONE, writable: true},
    


    _getUnsnappedPosition: {
        value: function(x,y){
            var elemSnap = snapManager.elementSnapEnabled();
            var gridSnap = snapManager.gridSnapEnabled();
            var alignSnap = snapManager.snapAlignEnabled();

            snapManager.enableElementSnap(false);
            snapManager.enableGridSnap(false);
            snapManager.enableSnapAlign(false);

            var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas, new WebKitPoint(x,y));
            var unsnappedpos = DrawingToolBase.getHitRecPos(snapManager.snap(point.x, point.y, false));
            this._dragPlane = snapManager.getDragPlane();

            snapManager.enableElementSnap(elemSnap);
            snapManager.enableGridSnap(gridSnap);
            snapManager.enableSnapAlign(alignSnap);

            return unsnappedpos;
        }
    },

    ShowToolProperties: {
        value: function () {
            this._penView = PenView.create();
            this._penView.element = document.getElementById('topPanelContainer').children[0];
            this._penView.needsDraw = true;

            this._penView.addEventListener(ToolEvents.TOOL_OPTION_CHANGE, this, false);
        }

    },

    HandleLeftButtonDown:
    {
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

            //assume we are not starting a new path as we will set this to true if we create a new GLSubpath()
            this._isNewPath = false;

            //add an anchor point by computing position of mouse down
            var mouseDownPos = this._getUnsnappedPosition(event.pageX, event.pageY); //this.getMouseDownPos();
            if (mouseDownPos) {
                //if we had closed the selected subpath previously, or if we have not yet started anything, create a subpath
                if (this._selectedSubpath === null) {
                    this._selectedSubpath = new SubPath();
                    this._isNewPath = true;
                    if (this._entryEditMode === this.ENTRY_SELECT_PATH){
                        //this should not happen, as ENTRY_SELECT_PATH implies there was a selected subpath
                        this._entryEditMode = this.ENTRY_SELECT_NONE;
                        console.log("Warning...PenTool handleMouseDown: changing from SELECT_PATH to SELECT_NONE");
                    }
                }
                
                var prevSelectedAnchorIndex = this._selectedSubpath.getSelectedAnchorIndex();
                // ************* Add/Select Anchor Point *************
                //check if the clicked location is close to an anchor point...if so, make that anchor the selected point and do nothing else
                // BUT if the anchor point selected is the first anchor point, check if the previous selected anchor was the last anchor point...in that case, close the path
                var selParam = this._selectedSubpath.pickPath(mouseDownPos[0], mouseDownPos[1], mouseDownPos[2], this._PICK_POINT_RADIUS);
                var whichPoint = this._selectedSubpath.getSelectedMode();
                if (whichPoint & this._selectedSubpath.SEL_ANCHOR) {
                    //if we're in ENTRY_SELECT_PATH mode AND we have not yet clicked on the endpoint AND if we have now clicked on the endpoint
                    if (this._entryEditMode === this.ENTRY_SELECT_PATH && this._isPickedEndPointInSelectPathMode === false){
                        var selAnchorIndex = this._selectedSubpath.getSelectedAnchorIndex();
                        if (selAnchorIndex===0 || selAnchorIndex===this._selectedSubpath.getNumAnchors()-1){
                            //we have picked the endpoint of this path...reverse the path if necessary
                            if (selAnchorIndex ===0){
                                //reverse this path
                                this._selectedSubpath.reversePath();
                                selAnchorIndex = this._selectedSubpath.getSelectedAnchorIndex();
                            }
                            this._isPickedEndPointInSelectPathMode = true;
                        }
                    }
                    this._editMode = this.EDIT_ANCHOR;
                    //if we have selected the first anchor point, and previously had selected the last anchor point, close the path
                    var numAnchors = this._selectedSubpath.getNumAnchors();
                    if (numAnchors>1 && !this._selectedSubpath.getIsClosed() && this._selectedSubpath.getSelectedAnchorIndex()===0 && prevSelectedAnchorIndex === numAnchors-1){
                        //setting the selection mode to NONE will effectively add a new anchor point at the click location and also give us snapping
                        whichPoint = this._selectedSubpath.SEL_NONE;
                        //set the snap target in case the mouse move handler doesn't get called
                        this._snapTarget = this._selectedSubpath.getAnchor(0);
                    }
                }
                //check if the clicked location is close to prev and next of the selected anchor point..if so select that anchor, set mode to PREV or NEXT and do nothing else
                // but if the selectedAnchor index is not -1 and neither prev nor next are selected, it means click selected a point selParam along bezier segment starting at selectedAnchor
                else if (this._selectedSubpath.getSelectedAnchorIndex() !== -1) {
                    if (whichPoint & this._selectedSubpath.SEL_PREV){
                        this._editMode = this.EDIT_PREV;
                    }
                    else if (whichPoint & this._selectedSubpath.SEL_NEXT){
                        this._editMode = this.EDIT_NEXT;
                    }
                    else if (whichPoint & this._selectedSubpath.SEL_PATH) {
                        //the click point is close enough to insert point in bezier segment after selected anchor at selParam
                        if (selParam > 0 && selParam < 1) {
                            this._selectedSubpath.insertAnchorAtParameter(this._selectedSubpath.getSelectedAnchorIndex(), selParam);
                            //set the mode so that dragging will update anchor point positions
                            //this._editMode = this.EDIT_ANCHOR;
                        }
                    }
                }

                //the clicked location is not close to the path or any anchor point
                if (whichPoint === this._selectedSubpath.SEL_NONE) {
                    if (this._entryEditMode !== this.ENTRY_SELECT_PATH) {
                        //since we're not in ENTRY_SELECT_PATH mode, we don't edit the closed path...we start a new path if we clicked far away from selected path
                        if (this._selectedSubpath.getIsClosed() && this._makeMultipleSubpaths) {
                            this._penCanvas = null;
                            this._penPlaneMat = null;
                            this._dragPlane = null;
                            this._snapTarget = null;
                            this._selectedSubpath = new SubPath();
                            this._isNewPath = true;
                        }

                        //add an anchor point to end of the subpath, and make it the selected anchor point
                        if (!this._selectedSubpath.getIsClosed() || this._makeMultipleSubpaths) {
                            this._selectedSubpath.addAnchor(new AnchorPoint());
                            var newAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                            newAnchor.setPos(mouseDownPos[0], mouseDownPos[1], mouseDownPos[2]);
                            newAnchor.setPrevPos(mouseDownPos[0], mouseDownPos[1], mouseDownPos[2]);
                            newAnchor.setNextPos(mouseDownPos[0], mouseDownPos[1], mouseDownPos[2]);

                            //set the mode so that dragging will update the next and previous locations
                            this._editMode = this.EDIT_PREV_NEXT;
                        }
                    } else {
                        if (this._isPickedEndPointInSelectPathMode){
                            //TODO clean up this code...very similar to the code block above
                            if (!this._selectedSubpath.getIsClosed()) {
                                this._selectedSubpath.addAnchor(new AnchorPoint());
                                var newAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                                newAnchor.setPos(mouseDownPos[0], mouseDownPos[1], mouseDownPos[2]);
                                newAnchor.setPrevPos(mouseDownPos[0], mouseDownPos[1], mouseDownPos[2]);
                                newAnchor.setNextPos(mouseDownPos[0], mouseDownPos[1], mouseDownPos[2]);

                                //set the mode so that dragging will update the next and previous locations
                                this._editMode = this.EDIT_PREV_NEXT;
                            }
                        }
                    }
                } //if (whichPoint === this._selectedSubpath.SEL_NONE) (i.e. no anchor point was selected)

                //display the curve overlay
                this.DrawSubpathAnchors(this._selectedSubpath);
                this.DrawSubpathSVG(this._selectedSubpath);
            } //if (mouseDownPos) { i.e. if mouse down yielded a valid position


            if (!g_DoPenToolMouseMove){
                NJevent("enableStageMove");
            }

            this._hoveredAnchorIndex = -1;
        } //value: function (event) {
    }, //HandleLeftButtonDown


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

            //clear the canvas before we draw anything else
            this.application.ninja.stage.clearDrawingCanvas();
            this._hoveredAnchorIndex = -1;

            //set the cursor to be the default cursor (depending on whether the selected subpath has any points yet)
            if (this._selectedSubpath && this._selectedSubpath.getNumAnchors()>0){
                this.application.ninja.stage.drawingCanvas.style.cursor = //"auto";
                    "url('images/cursors/penCursors/Pen_.png') 5 1, default";
            }
            else {
                this.application.ninja.stage.drawingCanvas.style.cursor = //"auto";
                    "url('images/cursors/penCursors/Pen_newPath.png') 5 1, default";
            }

            if (this._isDrawing) {
                var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas, new WebKitPoint(event.pageX, event.pageY));
                //go through the drawing toolbase to get the position of the mouse 
                var currMousePos = DrawingToolBase.getHitRecPos(DrawingToolBase.getUpdatedSnapPoint(point.x, point.y, false, this.mouseDownHitRec));
                if (currMousePos && this._selectedSubpath && (this._selectedSubpath.getSelectedAnchorIndex() >= 0 && this._selectedSubpath.getSelectedAnchorIndex() < this._selectedSubpath.getNumAnchors())) {
                    //var scoord = this._getScreenCoord(this._mouseUpHitRec);
                    var selAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                    var selX = selAnchor.getPosX();
                    var selY = selAnchor.getPosY();
                    var selZ = selAnchor.getPosZ();
                    if (this._editMode & this.EDIT_ANCHOR) {
                        selAnchor.translateAll(currMousePos[0] - selX, currMousePos[1] - selY, currMousePos[2] - selZ);
                    }
                    else if (this._editMode & this.EDIT_PREV) {
                        var oldPX = selAnchor.getPrevX();
                        var oldPY = selAnchor.getPrevY();
                        var oldPZ = selAnchor.getPrevZ();
                        selAnchor.translatePrev(currMousePos[0] - oldPX, currMousePos[1] - oldPY, currMousePos[2] - oldPZ);

                        //move the next point if Alt key is down to ensure relative angle between prev and next
                        if (this._isAltDown) {
                            selAnchor.translateNextFromPrev(currMousePos[0] - oldPX, currMousePos[1] - oldPY, currMousePos[2] - oldPZ);
                        }
                    }
                    else if (this._editMode & this.EDIT_NEXT) {
                        var oldNX = selAnchor.getNextX();
                        var oldNY = selAnchor.getNextY();
                        var oldNZ = selAnchor.getNextZ();
                        selAnchor.translateNext(currMousePos[0] - oldNX, currMousePos[1] - oldNY, currMousePos[2] - oldNZ);

                        //move the prev point if Alt key is down to ensure relative angle between prev and next
                        if (this._isAltDown) {
                            selAnchor.translatePrevFromNext(currMousePos[0] - oldNX, currMousePos[1] - oldNY, currMousePos[2] - oldNZ);
                        }
                    }
                    else if (this._editMode & this.EDIT_PREV_NEXT) {
                        selAnchor.setNextPos(currMousePos[0], currMousePos[1], currMousePos[2]);
                        selAnchor.setPrevFromNext();
                    }

                    //snapping...check if the new location of the anchor point is close to another anchor point
                    this._snapTarget = null;
                    var numAnchors = this._selectedSubpath.getNumAnchors();
                    for (var i = 0; i < numAnchors; i++) {
                        //check if the selected anchor is close to any other anchors
                        if (i === this._selectedSubpath.getSelectedAnchorIndex())
                            continue;
                        var currAnchor = this._selectedSubpath.getAnchor(i);
                        var distSq = currAnchor.getDistanceSq(selX, selY, selZ);
                        if (distSq < this._PICK_POINT_RADIUS * this._PICK_POINT_RADIUS) {
                            //set the snap target to the location of the first close-enough anchor
                            this._snapTarget = currAnchor;
                            break;
                        }
                    }

                    //make the subpath dirty so it will get re-drawn
                    this._selectedSubpath.makeDirty();
                    //this.DrawSubpathSVG(this._selectedSubpath);
                }
                //todo temp code only...remove this and uncomment the DrawSubpathSVG above
                if (this._selectedSubpath){
                    this.DrawSubpathSVG(this._selectedSubpath);
                }

            } else { //if mouse is not down:
                //this.doSnap(event);
                //this.DrawHandles();

                var currMousePos = this._getUnsnappedPosition(event.pageX, event.pageY);
                if (currMousePos && this._selectedSubpath ){
                    var selAnchorRetCode = this._selectedSubpath.pickAnchor(currMousePos[0], currMousePos[1], currMousePos[2], this._PICK_POINT_RADIUS);
                    if (selAnchorRetCode[0] >=0) {
                        this._hoveredAnchorIndex = selAnchorRetCode[0];
                        var lastAnchorIndex = this._selectedSubpath.getNumAnchors()-1;
                        var cursor = "url('images/cursors/penCursors/Pen_anchorSelect.png') 5 1, default";
                        if (this._selectedSubpath.getIsClosed()===false){
                            if (this._entryEditMode === this.ENTRY_SELECT_PATH && !this._isPickedEndPointInSelectPathMode && (this._hoveredAnchorIndex===0 || this._hoveredAnchorIndex===lastAnchorIndex)){
                                //if we're in SELECT_PATH mode, have not yet clicked on the end anchors,  AND we hovered over one of the end anchors
                                cursor = "url('images/cursors/penCursors/Pen_append.png') 5 1, default";
                            } else if ( this._selectedSubpath.getSelectedAnchorIndex()===lastAnchorIndex && this._hoveredAnchorIndex===0)  {
                                //if we've selected the last anchor and hover over the first anchor
                                cursor = "url('images/cursors/penCursors/Pen_closePath.png') 5 1, default";
                            }
                        } //if path is not closed
                        this.application.ninja.stage.drawingCanvas.style.cursor = cursor;
                    } else {
                        //detect if the current mouse position will hit the path (such that clicking here will insert a new anchor)
                        var pathHitTestData = this._selectedSubpath.pathHitTest(currMousePos[0], currMousePos[1], currMousePos[2], this._PICK_POINT_RADIUS*0.5);
                        if (pathHitTestData[0]!==-1){
                            //change the cursor
                            var cursor = "url('images/cursors/penCursors/Pen_plus.png') 5 1, default";
                            this.application.ninja.stage.drawingCanvas.style.cursor = cursor;
                        }
                    }
                }
            } //else of if (this._isDrawing) {

            //this.drawLastSnap();        // Required cleanup for both Draw/Feedbacks
            if (this._selectedSubpath){
                this.DrawSubpathAnchors(this._selectedSubpath);
            }
        }//value: function(event)
    },//HandleMouseMove

    
    TranslateSelectedSubpathPerPenCanvas:{
        value: function() {
            if (this._penCanvas!==null) {
                this._selectedSubpath.translateSubpathPerCanvas(ElementMediator); 
            }
        }
    },

    ShowSelectedSubpath:{
        value: function() {
            if (this._selectedSubpath){
                if (!this._selectedSubpath.getPlaneMatrix()) {
                    this._selectedSubpath.setPlaneMatrix(this._penPlaneMat);
                    var planeMatInv = glmat4.inverse( this._penPlaneMat, [] );
                    this._selectedSubpath.setPlaneMatrixInverse(planeMatInv);
                    this._selectedSubpath.setDragPlane(this._dragPlane);
                }
                
                this._selectedSubpath.createSamples(); //dirty bit is checked here
                this._selectedSubpath.buildLocalCoord(); //local dirty bit is checked here

                //build the width and height of this canvas by looking at local coordinates (X and Y needed only)
                var bboxMin = this._selectedSubpath.getLocalBBoxMin();
                var bboxMax = this._selectedSubpath.getLocalBBoxMax();
                var bboxWidth = bboxMax[0] - bboxMin[0];
                var bboxHeight = bboxMax[1] - bboxMin[1];

                //build the 3D position of the plane center of this canvas by looking at midpoint of the bounding box in stage world coords
                bboxMin = this._selectedSubpath.getBBoxMin();
                bboxMax = this._selectedSubpath.getBBoxMax();
                var bboxMid = [0.5 * (bboxMax[0] + bboxMin[0]), 0.5 * (bboxMax[1] + bboxMin[1]), 0.5 * (bboxMax[2] + bboxMin[2])];

                //call render shape with the bbox width and height
                this.RenderShape(bboxWidth, bboxHeight, bboxMid, this._penPlaneMat, this._penCanvas);
            }
        }
    },

    RenderShape: {
        value: function (w, h, midPt, planeMat, canvas) {
            if ((Math.floor(w) === 0) || (Math.floor(h) === 0)) {
                return;
            }

            var left = Math.round(midPt[0] - 0.5 * w);
            var top = Math.round(midPt[1] - 0.5 * h);
            this._selectedSubpath.setPlaneCenter(midPt);
            this._selectedSubpath.setCanvasLeft(left);
            this._selectedSubpath.setCanvasTop(top);

            if (!canvas) {
                var newCanvas = null;
                newCanvas = NJUtils.makeNJElement("canvas", "Subpath", "shape", {"data-RDGE-id": NJUtils.generateRandom()}, true);
                var elementModel = TagTool.makeElement(parseInt(w), parseInt(h), planeMat, midPt, newCanvas);
                ElementMediator.addElements(newCanvas, elementModel.data, false);

                // create all the GL stuff
                var world = this.getGLWorld(newCanvas, this._useWebGL);//this.options.use3D);//this.CreateGLWorld(planeMat, midPt, newCanvas, this._useWebGL);//fillMaterial, strokeMaterial);
                //store a reference to this newly created canvas
                this._penCanvas = newCanvas;

                var subpath = this._selectedSubpath; //new GLSubpath();
                subpath.setWorld(world);
                subpath.setCanvas(newCanvas);

                world.addObject(subpath);
                world.render();
                //TODO this will not work if there are multiple shapes in the same canvas
                newCanvas.elementModel.shapeModel.GLGeomObj = subpath;
                newCanvas.elementModel.shapeModel.shapeCount++;
                if(newCanvas.elementModel.shapeModel.shapeCount === 1)
                {
                    newCanvas.elementModel.selection = "Subpath";
                    newCanvas.elementModel.pi = "SubpathPi";
                    newCanvas.elementModel.shapeModel.strokeSize = this.options.strokeSize.value + " " + this.options.strokeSize.units;
                    var strokeColor = subpath.getStrokeColor();
                    newCanvas.elementModel.shapeModel.stroke = strokeColor;
                    if(strokeColor) {
                        newCanvas.elementModel.shapeModel.border = this.application.ninja.colorController.colorToolbar.stroke;
                    }
                    newCanvas.elementModel.shapeModel.strokeMaterial = subpath.getStrokeMaterial();

                    newCanvas.elementModel.shapeModel.GLGeomObj = subpath;
                    newCanvas.elementModel.shapeModel.useWebGl = this.options.use3D;
                }
                else
                {
                    // TODO - update the shape's info only.  shapeModel will likely need an array of shapes.
                }

                //if(newCanvas.elementModel.isShape)
                if (true)
                {
                    this.application.ninja.selectionController.selectElement(newCanvas);
                }
            } //if (!canvas) {
            else {

                var world = null;
                if (canvas.elementModel.shapeModel && canvas.elementModel.shapeModel.GLWorld) {
                    world = canvas.elementModel.shapeModel.GLWorld;
                } else {
                    world = this.getGLWorld(canvas, this._useWebGL);//this.options.use3D);//this.CreateGLWorld(planeMat, midPt, canvas, this._useWebGL);//fillMaterial, strokeMaterial);
                }

                if (this._entryEditMode !== this.ENTRY_SELECT_CANVAS){
                    //update the left and top of the canvas element
                    var canvasArray=[canvas];
                    w= Math.round(w);
                    h = Math.round(h);
                    ElementMediator.setProperty(canvasArray, "width", [w+"px"], "Changing", "penTool");//canvas.width = w;
                    ElementMediator.setProperty(canvasArray, "height", [h+"px"], "Changing", "penTool");//canvas.height = h;

                    //var bboxMid = this._selectedSubpath.getLocalBBoxMidInStageWorld();
                    //left = Math.round(bboxMid[0] - 0.5 * w);
                    //top = Math.round(bboxMid[1] - 0.5 * h);

                    ElementMediator.setProperty(canvasArray, "left", [left+"px"],"Changing", "penTool");//DocumentControllerModule.DocumentController.SetElementStyle(canvas, "left", parseInt(left) + "px");
                    ElementMediator.setProperty(canvasArray, "top", [top + "px"],"Changing", "penTool");//DocumentControllerModule.DocumentController.SetElementStyle(canvas, "top", parseInt(top) + "px");

                    //update the viewport and projection to reflect the new canvas width and height (todo might be unnecessary since we don't use RDGE for now)
                    world.setViewportFromCanvas(canvas);
                    if (this._useWebGL){
                        var cam = world.renderer.cameraManager().getActiveCamera();
                        cam.setPerspective(world.getFOV(), world.getAspect(), world.getZNear(), world.getZFar());
                    }
                }

                var subpath = this._selectedSubpath;

                subpath.setDrawingTool(this);
                subpath.setWorld(world);

                world.addIfNewObject(subpath);
                world.render();

                //TODO this will not work if there are multiple shapes in the same canvas
                canvas.elementModel.shapeModel.GLGeomObj = subpath;

                //if(newCanvas.elementModel.isShape)
                if (true)
                {
                    this.application.ninja.selectionController.selectElement(canvas);
                }
            } //else of if (!canvas) {
        } //value: function (w, h, planeMat, midPt, canvas) {
    }, //RenderShape: {

    HandleLeftButtonUp: {
        value: function (event) {
            if (this._isAltDown) {
                var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas, new WebKitPoint(event.pageX, event.pageY));
                this.mouseUpHitRec = DrawingToolBase.getUpdatedSnapPoint(point.x, point.y, false, this.mouseDownHitRec);
            }
            else if (this._isDrawing) {
                this.doDraw(event); //needed to get the mouse up point in case there was no mouse move
            }

            //snapping...if there was a snapTarget and a selected anchor, move the anchor to the snap target
            if (this._snapTarget !== null && this._selectedSubpath && this._selectedSubpath.getSelectedAnchorIndex() !== -1) {
                var selAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                selAnchor.setPos(this._snapTarget.getPosX(), this._snapTarget.getPosY(), this._snapTarget.getPosZ());
                this._selectedSubpath.makeDirty();

                //if the first or last anchor point were snapped for an open path, check if the first and last anchor point are at the same position
                if (!this._selectedSubpath.getIsClosed()) {
                    var lastAnchorIndex = this._selectedSubpath.getNumAnchors() - 1;
                    var firstAnchor = this._selectedSubpath.getAnchor(0);
                    var lastAnchor = this._selectedSubpath.getAnchor(lastAnchorIndex);
                    if ((this._selectedSubpath.getSelectedAnchorIndex() === 0 && this._snapTarget === lastAnchor) || (this._selectedSubpath.getSelectedAnchorIndex() === lastAnchorIndex && this._snapTarget === firstAnchor)) {
                        this._selectedSubpath.setIsClosed(true);
                        //set the prev of the first anchor to the be prev of the last anchor
                        firstAnchor.setPrevPos(lastAnchor.getPrevX(), lastAnchor.getPrevY(), lastAnchor.getPrevZ());

                        //only if we have more than two anchor points, remove the last point
                        if (lastAnchorIndex > 1) {
                            //remove the last anchor from the subpath
                            this._selectedSubpath.removeAnchor(lastAnchorIndex);
                        } else {
                            //set the next of the last anchor to the be next of the first anchor
                            lastAnchor.setPrevPos(firstAnchor.getNextX(), firstAnchor.getNextY(), firstAnchor.getNextZ());
                        }
                    }
                }
            }
            this._snapTarget = null;

            var drawData = this.getDrawingData();
            if (drawData) {
                //todo handle the case when the user does not click a point on the path canvas
                // (we don't want to set the plane mat. to be set to some plane not on the canvas of the path)
                if (!this._penPlaneMat) {
                    this._penPlaneMat = drawData.planeMat;
                }

                if (this._isNewPath) {
                    var strokeSize = 1.0;//default stroke width
                    if (this.options.strokeSize) {
                        strokeSize = ShapesController.GetValueInPixels(this.options.strokeSize.value, this.options.strokeSize.units);
                    }
                    this._selectedSubpath.setStrokeWidth(strokeSize);
                    if (this.application.ninja.colorController.colorToolbar.stroke.webGlColor){
                        this._selectedSubpath.setStrokeColor(this.application.ninja.colorController.colorToolbar.stroke.webGlColor);
                    }
                    if (this.application.ninja.colorController.colorToolbar.fill.webGlColor){
                        this._selectedSubpath.setFillColor(this.application.ninja.colorController.colorToolbar.fill.webGlColor);
                    }
                } //if this is a new path being rendered

                this._selectedSubpath.makeDirty();

                this._selectedSubpath.createSamples();
                //if we have some samples to render...
                if (this._selectedSubpath.getNumAnchors() > 1) {
                    this.ShowSelectedSubpath();
                } //if (this._selectedSubpath.getNumPoints() > 0) {
            } //if drawData

            //always assume that we're not starting a new path anymore
            this._isNewPath = false;
            this.endDraw(event);

            this._isDrawing = false;
            this._hasDraw = false;
            this._editMode = this.EDIT_NONE;

            this.DrawHandles();
            //if (this._entryEditMode === this.ENTRY_SELECT_PATH || !this._selectedSubpath.getIsClosed()){
            if (this._selectedSubpath){
                this.DrawSubpathAnchors(this._selectedSubpath);//render the subpath anchors on canvas (not GL)
            }
            //}

            if (!g_DoPenToolMouseMove){
                NJevent("disableStageMove");
            }
            this._hoveredAnchorIndex = -1;
        }
    },

    //override the Alt key handlers from drawing-tool.js
    HandleAltKeyDown: {
        value: function (event) {
            this._isAltDown = true;
        }
    },
    HandleAltKeyUp: {
        value: function (event) {
            this._isAltDown = false;
        }
    },

    HandleEscape: {
        value: function(event) {
            this._isEscapeDown = true;
            //close the current subpath and reset the pen tool
            this._penCanvas = null;
            this._penPlaneMat = null;
            this._snapTarget = null;
            this._selectedSubpath = null;
            this.application.ninja.stage.clearDrawingCanvas();
        }
    },

    HandleKeyUp: {
        value: function(event){
            if (!(event.target instanceof HTMLInputElement)) {
                if(event.altKey || event.keyCode === 18) { //for key up, the event.altKey is false when it should be true, so I also check keyCode
                    this.HandleAltKeyUp(event);
                } else {
                    console.log("Pen tool Unhandled key up:", event.keyCode);
                }
            }
        }
    },
    HandleKeyPress: {
        value: function(event){
            var inc, currentValue, moveCommand;

            if (!(event.target instanceof HTMLInputElement)) {
                if(event.shiftKey) {
                    this.HandleShiftKeyDown(event);
                } else if(event.altKey) {
                    this.HandleAltKeyDown(event);
                } else if (event.keyCode === Keyboard.SPACE) {
                    event.preventDefault();
                    this.HandleSpaceKeyDown(event);
                } else if (event.keyCode == Keyboard.BACKSPACE || event.keyCode === Keyboard.DELETE) {
                    //this is probably unnecessary since we handle delete and backspace via the delete delegate
                    event.stopImmediatePropagation();
                    event.preventDefault();
                } else if (event.keyCode === Keyboard.ESCAPE){
                    this.HandleEscape(event);
                } else {
                    console.log("Pen tool Unhandled key press:", event.keyCode);
                }
            }


        }
    },

    handleScroll: {
        value: function(event) {
            this.application.ninja.stage.clearDrawingCanvas();//stageManagerModule.stageManager.clearDrawingCanvas();
            this.DrawSubpathAnchors(this._selectedSubpath); 
        }
    },

               
    BuildSecondCtrlPoint:{
        value: function(p0, p2, p3) {
            var baselineOrig = VecUtils.vecSubtract(3, p3, p0);
            var baseline = VecUtils.vecNormalize(3, baselineOrig);
            var delta = VecUtils.vecSubtract(3, p2, p3);
            //component of the delta along baseline
            var deltaB = baseline;
            VecUtils.vecScale(3, deltaB, VecUtils.vecDot(3, baseline, delta));
            //component of the delta orthogonal to baseline
            var deltaO = VecUtils.vecSubtract(3, delta, deltaB);

            var p1 = VecUtils.vecInterpolate(3, p0, p3, 0.3333);
            p1= VecUtils.vecAdd(3, p1,deltaO);

            return p1;
        } //value: function(p0, p2, p3) {
    }, //BuildSecondCtrlPoint:{

    HandleDoubleClick: {
        value: function () {
            //if there is a selected anchor point
            if (this._selectedSubpath && this._selectedSubpath.getSelectedAnchorIndex() !== -1) {
                var selAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                var pos = [selAnchor.getPosX(), selAnchor.getPosY(), selAnchor.getPosZ()];
                var distToPrev = selAnchor.getPrevDistanceSq(pos[0], pos[1], pos[2]);
                var distToNext = selAnchor.getNextDistanceSq(pos[0], pos[1], pos[2]);
                var threshSq = 0; // 4 * this._PICK_POINT_RADIUS * this._PICK_POINT_RADIUS;
                //if either prev or next are within threshold distance to anchor position
                if (distToPrev <= threshSq || distToNext <= threshSq) {
                    var haveNext = false;
                    var havePrev = false;
                    var numAnchors = this._selectedSubpath.getNumAnchors();
                    if (numAnchors>1 && (this._selectedSubpath.getSelectedAnchorIndex() < (numAnchors-1) || this._selectedSubpath.getIsClosed())){
                        //there is an anchor point after this one
                        var nextAnchor = null;
                        if (this._selectedSubpath.getSelectedAnchorIndex() < (numAnchors-1))
                            nextAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex()+1);
                        else
                            nextAnchor = this._selectedSubpath.getAnchor(0);
                        var nextAnchorPrev = [nextAnchor.getPrevX(), nextAnchor.getPrevY(), nextAnchor.getPrevZ()];
                        var nextAnchorPos = [nextAnchor.getPosX(), nextAnchor.getPosY(), nextAnchor.getPosZ()];
                        var newNext = this.BuildSecondCtrlPoint(pos, nextAnchorPrev, nextAnchorPos);
                        selAnchor.setNextPos(newNext[0], newNext[1], newNext[2]);
                        //check if the next is still not over the threshSq..if so, add a constant horizontal amount
                        if (selAnchor.getNextDistanceSq(pos[0], pos[1], pos[2]) <= threshSq) {
                            selAnchor.setNextPos(newNext[0]+ (3 * this._PICK_POINT_RADIUS), newNext[1], newNext[2]);
                        }
                        haveNext = true;
                    }
                    if (numAnchors>1 && (this._selectedSubpath.getSelectedAnchorIndex() > 0 || this._selectedSubpath.getIsClosed())){
                        //there is an anchor point before this one
                        var prevAnchor = null;
                        if (this._selectedSubpath.getSelectedAnchorIndex() > 0)
                            prevAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex()-1);
                        else
                            prevAnchor = this._selectedSubpath.getAnchor(numAnchors-1);
                        var prevAnchorNext = [prevAnchor.getNextX(), prevAnchor.getNextY(), prevAnchor.getNextZ()];
                        var prevAnchorPos = [prevAnchor.getPosX(), prevAnchor.getPosY(), prevAnchor.getPosZ()];
                        var newPrev = this.BuildSecondCtrlPoint(pos, prevAnchorNext, prevAnchorPos);
                        selAnchor.setPrevPos(newPrev[0], newPrev[1], newPrev[2]);
                        //check if the prev is still not over the threshSq..if so, add a constant horizontal amount
                        if (selAnchor.getPrevDistanceSq(pos[0], pos[1], pos[2]) <= threshSq) {
                            selAnchor.setPrevPos(newPrev[0]+ (3 * this._PICK_POINT_RADIUS), newPrev[1], newPrev[2]);
                        }
                        havePrev = true;
                    }

                    if (haveNext && !havePrev){
                        selAnchor.setPrevFromNext();
                    } else if (havePrev && !haveNext){
                        selAnchor.setNextFromPrev();
                    } else if (!haveNext && !havePrev){
                        selAnchor.setNextPos(pos[0]+ (3 * this._PICK_POINT_RADIUS), pos[1], pos[2]);
                        selAnchor.setPrevFromNext();
                    }
                } // if (distToPrev < threshSq) {
                else {
                    //bring points close (to exactly same position)
                    selAnchor.setNextPos(pos[0], pos[1], pos[2]);
                    selAnchor.setPrevPos(pos[0], pos[1], pos[2]);
                } // else of if (distToPrev < threshSq) {

                this._selectedSubpath.makeDirty();
                this._selectedSubpath.createSamples();
                this.ShowSelectedSubpath();

                //clear the canvas before we draw anything else
                this.application.ninja.stage.clearDrawingCanvas();//stageManagerModule.stageManager.clearDrawingCanvas();

                this.DrawSubpathAnchors(this._selectedSubpath);
            } //if (this._selectedSubpath && this._selectedSubpath.getSelectedAnchorIndex() !== -1) 

        } //value: function () {
    }, //HandleDoubleClick: {


    _getScreenCoord:
    {
        value: function (hitRec) {
            var sRet = hitRec.getScreenPoint();
            sRet[2] = 0;
            return sRet;
        }
    }, //_getScreenCoord:


    // DrawSubpathSVG
    //  Draw the subpath using the SVG drawing capability (i.e. not WebGL)
    DrawSubpathSVG:
    {
        value: function (subpath) {
            if (subpath === null)
                return;

            subpath.createSamples(); //dirty bit will be checked inside this function
            var numAnchors = subpath.getNumAnchors();
            if (numAnchors === 0)
                return;

            var ctx = this.application.ninja.stage.drawingContext;//stageManagerModule.stageManager.drawingContext;
            if (ctx === null)
                throw ("null drawing context in Pentool::DrawSubpathSVG");
            ctx.save();

            var drawingCanvas = subpath.getCanvas();
            if (!drawingCanvas){
                drawingCanvas = ViewUtils.getStageElement();
            }
            //draw the stage world points by projecting them to screen space
            //get the screen coords of this anchor from its stage world coord
            ctx.lineWidth = 1;//TODO replace hardcoded stroke width with some programmatically set value (should not be same as stroke width)
            ctx.strokeStyle = "green";
            var localToGlobalMat = ViewUtils.getLocalToGlobalMatrix(drawingCanvas);
            var widthAdjustment = -snapManager.getStageWidth()*0.5;
            var heightAdjustment = -snapManager.getStageHeight()*0.5;
            var localToStageWorldMat = ViewUtils.getLocalToStageWorldMatrix(drawingCanvas, true, false);
            var stageWorldToLocalMat = glmat4.inverse(localToStageWorldMat, []);

            var c0=[0,0,0], c1=[0,0,0],c2=[0,0,0], c3=[0,0,0]; //screen coord of the bezier control points
            c0 = MathUtils.transformAndDivideHomogeneousPoint(
                [subpath.getAnchor(0).getPosX()+widthAdjustment,
                subpath.getAnchor(0).getPosY()+heightAdjustment,
                subpath.getAnchor(0).getPosZ()],
                stageWorldToLocalMat);
            c0 = MathUtils.transformAndDivideHomogeneousPoint(c0,localToGlobalMat); //convert from local coord to global (screen) coord
            ctx.beginPath();
            ctx.moveTo(c0[0],c0[1]);
            var prevAnchor = subpath.getAnchor(0);
            var currAnchor = null;
            var numBezierCurves = numAnchors;
            if (subpath.getIsClosed()){
                numBezierCurves+=1;
            }

            for (i = 1; i < numBezierCurves; i++) {
                currAnchor = subpath.getAnchor(i%numAnchors);

                c1 = MathUtils.transformAndDivideHomogeneousPoint(
                                    [prevAnchor.getNextX()+widthAdjustment,
                                    prevAnchor.getNextY()+heightAdjustment,
                                    prevAnchor.getNextZ()],
                                    stageWorldToLocalMat);
                c1 = MathUtils.transformAndDivideHomogeneousPoint(c1,localToGlobalMat); //convert from local coord to global (screen) coord

                c2 = MathUtils.transformAndDivideHomogeneousPoint(
                                    [currAnchor.getPrevX()+widthAdjustment,
                                    currAnchor.getPrevY()+heightAdjustment,
                                    currAnchor.getPrevZ()],
                                    stageWorldToLocalMat);
                c2 = MathUtils.transformAndDivideHomogeneousPoint(c2,localToGlobalMat); //convert from local coord to global (screen) coord

                c3 = MathUtils.transformAndDivideHomogeneousPoint(
                                    [currAnchor.getPosX()+widthAdjustment,
                                    currAnchor.getPosY()+heightAdjustment,
                                    currAnchor.getPosZ()],
                                    stageWorldToLocalMat);
                c3 = MathUtils.transformAndDivideHomogeneousPoint(c3,localToGlobalMat); //convert from local coord to global (screen) coord

                ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], c3[0], c3[1]);
                prevAnchor = currAnchor;
            }


            ctx.stroke();

            ctx.restore();
        } //function (subpath)
    },  //DrawSubpathSVG

    DrawSubpathAnchors:
    {
        value: function (subpath) {
            if (subpath === null)
                return;
            var numAnchors = subpath.getNumAnchors();
            if (numAnchors === 0)
                return;

            var ctx = this.application.ninja.stage.drawingContext;//stageManagerModule.stageManager.drawingContext;
            if (ctx === null)
                throw ("null drawing context in Pentool::DrawSelectedSubpathAnchors");
            ctx.save();

            var widthAdjustment = -snapManager.getStageWidth()*0.5;
            var heightAdjustment = -snapManager.getStageHeight()*0.5;

            var drawingCanvas = subpath.getCanvas();
            if (!drawingCanvas){
                drawingCanvas = ViewUtils.getStageElement();
            }
            var localToGlobalMat = ViewUtils.getLocalToGlobalMatrix(drawingCanvas);
            var localToStageWorldMat = ViewUtils.getLocalToStageWorldMatrix(drawingCanvas, true, false);
            var stageWorldToLocalMat = glmat4.inverse(localToStageWorldMat, []);

            
            //display circles and squares near all control points
            ctx.fillStyle = "#FFFFFF";
            ctx.lineWidth = 1;
            ctx.strokeStyle = "green";
            var anchorDelta = 2;
            var selAnchorDelta = 4;
            var px=0,py=0;
            var localCoord = null;
            var sp=[0,0,0];
            var currAnchor = null;
            for (var i = 0; i < numAnchors; i++) {
                currAnchor = subpath.getAnchor(i);
                localCoord = MathUtils.transformAndDivideHomogeneousPoint([currAnchor.getPosX()+widthAdjustment, currAnchor.getPosY()+heightAdjustment, currAnchor.getPosZ()], stageWorldToLocalMat); //convert from stage world to local coord
                sp = MathUtils.transformAndDivideHomogeneousPoint(localCoord,localToGlobalMat); //convert from local coord to global (screen) coord
                px = sp[0]; py=sp[1];

                ctx.beginPath();
                ctx.moveTo(px-anchorDelta, py-anchorDelta);
                ctx.lineTo(px+anchorDelta, py-anchorDelta);
                ctx.lineTo(px+anchorDelta, py+anchorDelta);
                ctx.lineTo(px-anchorDelta, py+anchorDelta);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            //display the hovered over anchor point
            ctx.lineWidth = 2;
            if (this._hoveredAnchorIndex>=0 && this._hoveredAnchorIndex<numAnchors) {
                currAnchor = subpath.getAnchor(this._hoveredAnchorIndex);
                localCoord = MathUtils.transformAndDivideHomogeneousPoint([currAnchor.getPosX()+widthAdjustment, currAnchor.getPosY()+heightAdjustment, currAnchor.getPosZ()], stageWorldToLocalMat); //convert from stage world to local coord
                sp = MathUtils.transformAndDivideHomogeneousPoint(localCoord,localToGlobalMat);
                px = sp[0]; py=sp[1];

                ctx.beginPath();
                ctx.moveTo(px-selAnchorDelta, py-selAnchorDelta);
                ctx.lineTo(px+selAnchorDelta, py-selAnchorDelta);
                ctx.lineTo(px+selAnchorDelta, py+selAnchorDelta);
                ctx.lineTo(px-selAnchorDelta, py+selAnchorDelta);
                ctx.closePath();
                ctx.stroke();
            }


            //display selected anchor and its prev. and next points
            if (this._selectedSubpath && subpath === this._selectedSubpath && this._selectedSubpath.getSelectedAnchorIndex()!== -1) {
                ctx.lineWidth = 1;
                var defFill = "#FFFFFF";
                var defStroke = "green";
                var selHandleFill = "#000000"

                ctx.strokeStyle = defStroke;
                ctx.fillStyle = defFill;
                var selAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                var whichPoint = this._selectedSubpath.getSelectedMode(); //which of the selected handles to highlight

                //compute the screen (global) coord. of the selected anchor
                localCoord = MathUtils.transformAndDivideHomogeneousPoint([selAnchor.getPosX()+widthAdjustment, selAnchor.getPosY()+heightAdjustment, selAnchor.getPosZ()], stageWorldToLocalMat); //convert from stage world to local coord
                sp = MathUtils.transformAndDivideHomogeneousPoint(localCoord,localToGlobalMat);
                var posX = sp[0]; var posY=sp[1];

                //compute the screen (global) coord. of the selected anchor prev and next points
                var prevLocalCoord = MathUtils.transformAndDivideHomogeneousPoint([selAnchor.getPrevX()+widthAdjustment, selAnchor.getPrevY()+heightAdjustment, selAnchor.getPrevZ()], stageWorldToLocalMat);
                sp = MathUtils.transformAndDivideHomogeneousPoint(prevLocalCoord, localToGlobalMat);
                var prevX = sp[0]; var prevY=sp[1];
                var nextLocalCoord = MathUtils.transformAndDivideHomogeneousPoint([selAnchor.getNextX()+widthAdjustment, selAnchor.getNextY()+heightAdjustment, selAnchor.getNextZ()], stageWorldToLocalMat);
                sp = MathUtils.transformAndDivideHomogeneousPoint(nextLocalCoord, localToGlobalMat);
                var nextX = sp[0]; var nextY=sp[1];

                //line from prev to anchor
                ctx.beginPath();
                ctx.moveTo(prevX,prevY);
                ctx.lineTo(posX, posY);
                ctx.stroke();

                //selected anchor prev
                ctx.beginPath();
                ctx.arc(prevX, prevY, this._DISPLAY_SELECTED_ANCHOR_PREV_RADIUS, 0, 2 * Math.PI, false);
                ctx.closePath();
                if (whichPoint & this._selectedSubpath.SEL_PREV){
                    ctx.fillStyle = selHandleFill;
                    ctx.fill();
                    ctx.fillStyle = defFill;
                }else {
                    ctx.fill();
                }
                ctx.stroke();



                //line from next to anchor
                ctx.beginPath();
                ctx.moveTo(nextX, nextY);
                ctx.lineTo(posX, posY);
                ctx.stroke();

                //selected anchor next
                ctx.beginPath();
                ctx.arc(nextX, nextY, this._DISPLAY_SELECTED_ANCHOR_NEXT_RADIUS, 0, 2 * Math.PI, false);
                if (whichPoint & this._selectedSubpath.SEL_NEXT){
                    ctx.fillStyle = selHandleFill;
                    ctx.fill();
                    ctx.fillStyle = defFill;
                }else {
                    ctx.fill();
                }
                ctx.stroke();

                //selected anchor point
                var px = posX;
                var py = posY;
                ctx.beginPath();
                ctx.moveTo(px-selAnchorDelta, py-selAnchorDelta);
                ctx.lineTo(px+selAnchorDelta, py-selAnchorDelta);
                ctx.lineTo(px+selAnchorDelta, py+selAnchorDelta);
                ctx.lineTo(px-selAnchorDelta, py+selAnchorDelta);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                //display the snap target if it isn't null
                if (this._snapTarget) {
                    localCoord = MathUtils.transformAndDivideHomogeneousPoint([this._snapTarget.getPosX()+widthAdjustment, this._snapTarget.getPosY()+heightAdjustment, this._snapTarget.getPosZ()], stageWorldToLocalMat); //convert from stage world to local coord
                    sp = MathUtils.transformAndDivideHomogeneousPoint(localCoord,localToGlobalMat);
                    px = sp[0]; py =sp[1];

                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "red";
                    ctx.beginPath();
                    ctx.moveTo(px-selAnchorDelta, py-selAnchorDelta);
                    ctx.lineTo(px+selAnchorDelta, py-selAnchorDelta);
                    ctx.lineTo(px+selAnchorDelta, py+selAnchorDelta);
                    ctx.lineTo(px-selAnchorDelta, py+selAnchorDelta);
                    ctx.closePath();
                    ctx.stroke();
                }
            } //if this._selectedSubpath && subpath === this._selectedSubpath && this._selectedSubpath.getSelectedAnchorIndex()!== -1
            ctx.restore();
        } //value: function() {
    }, //DrawSubpathAnchors {


    Configure: {
        value: function (wasSelected) {
            if (wasSelected) {
                defaultEventManager.addEventListener("resetPenTool", this, false);
                this.application.ninja.elementMediator.deleteDelegate = this;

                if (this.application.ninja.selectedElements.length === 0){
                    this._entryEditMode = this.ENTRY_SELECT_NONE;
                }
                else{
                    for (var i=0;i<this.application.ninja.selectedElements.length;i++){
                        var element = this.application.ninja.selectedElements[i]
                        console.log("Entered pen tool, had selected: " + element.elementModel.selection);
                        if (element.elementModel.selection === 'Subpath'){ //TODO what to do if the canvas is drawn by tag tool?
                            //set the pen canvas to be the selected canvas
                            this._penCanvas = this.application.ninja.selectedElements[i];

                            // get the subpath for this world
                            this._selectedSubpath = null;
                            this._entryEditMode = this.ENTRY_SELECT_CANVAS; //by default, we're in this mode...change if we find a subpath contained in this canvas
                            var world = ElementMediator.getShapeProperty(this._penCanvas, "GLWorld");
                            if (world === null){
                                break; //something bad happened //TODO handle this better
                            }

                            //TODO assuming that we want the first subpath in this world...fix this!
                            var go = world.getGeomRoot();
                            if (go !== null){
                                while (go.geomType() !== go.GEOM_TYPE_CUBIC_BEZIER && go.getNext()) {
                                    go = go.getNext(); //find the first subpath in this world
                                }
                                if (go.geomType() === go.GEOM_TYPE_CUBIC_BEZIER){
                                    this._entryEditMode = this.ENTRY_SELECT_PATH;
                                    this._selectedSubpath = go;
                                    this.TranslateSelectedSubpathPerPenCanvas();
                                    this._selectedSubpath.deselectAnchorPoint();
                                    this.DrawSubpathAnchors(this._selectedSubpath);
                                }
                            }
                            break; //assume that we want to edit only the first subpath found in the selected canvases
                        } else {
                            this._entryEditMode = this.ENTRY_SELECT_NONE;
                        }
                    }
                }
                this._isPickedEndPointInSelectPathMode = false; //only applies to the ENTRY_SELECT_PATH mode

                if (g_DoPenToolMouseMove){
                    NJevent("enableStageMove");
                }
            } //if the pen tool was selected
            else {
                if (g_DoPenToolMouseMove){
                    NJevent("disableStageMove");
                }
                this._selectedSubpath = null;
                this._penCanvas = null;
                this._penPlaneMat = null;
                this._snapTarget = null;
                defaultEventManager.removeEventListener("resetPenTool", this, false);
                this.application.ninja.elementMediator.deleteDelegate = null;
            } //if the pen tool was de-selected
        }
    },

    handleDelete:{
        value: function(event){
             //clear the selected subpath...the only new additions to this function w.r.t. ToolBase
             if (this._selectedSubpath){
                 if (this._selectedSubpath.getSelectedAnchorIndex()>=0){
                     this._hoveredAnchorIndex=-1;
                     this._selectedSubpath.removeAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                     this._selectedSubpath.createSamples();
                     //clear the canvas
                     this.application.ninja.stage.clearDrawingCanvas();//stageManagerModule.stageManager.clearDrawingCanvas();
                     this.DrawSubpathAnchors(this._selectedSubpath);
                     this.ShowSelectedSubpath();
                 }
                 else {
                    this._selectedSubpath.clearAllAnchors(); //perhaps unnecessary
                    this._selectedSubpath = null;
                    //clear the canvas
                    this.application.ninja.stage.clearDrawingCanvas();//stageManagerModule.stageManager.clearDrawingCanvas();

                    //undo/redo...go through ElementController and NJEvent
                    var els = [];
                    ElementController.removeElement(this._penCanvas);
                    els.push(this._penCanvas);
                    NJevent( "elementsRemoved", els );
                    this._penCanvas = null;
               }
             }
             else {
                //undo/redo...go through ElementMediator (see ElementMediator.handleDeleting() from where the much of this function is copied)
                //clear the canvas
                this.application.ninja.stage.clearDrawingCanvas();//stageManagerModule.stageManager.clearDrawingCanvas();
                var els = [];
                for(var i = 0; i<len; i++) {
                    els.push(this.application.ninja.selectedElements[i]);
                }
                for(i=0; i<len; i++) {
                    ElementController.removeElement(els[i]);
                }
                NJevent( "elementsRemoved", els );

                //clear out the selected path if it exists
                if (this._selectedSubpath) {
                    this._selectedSubpath.clearAllAnchors();
                    this._selectedSubpath = null;
                    if (this._entryEditMode === this.ENTRY_SELECT_PATH){
                        this._entryEditMode = this.ENTRY_SELECT_NONE;
                    }
                    this._penCanvas = null;
                }
             }
            //redraw the stage to update it
            this.application.ninja.stage.draw();
        }
    },

    handleResetPenTool: {
        value: function (event) {
            this.Reset();
            this.DrawHandles();
        }
    },

    handleToolOptionChange: {
        value: function (event) {
            if (event._event.type === ToolEvents.TOOL_OPTION_CHANGE) {
                this.Reset();
                this.DrawHandles();
            }
        }
    },

    Reset: {
        value: function () {
            this._isDrawing = false;

            this._selectedSubpath = null;
            this.DrawHandles();
            this.Configure(true);
        }
    }

});