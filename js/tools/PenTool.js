/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var ShapeTool = require("js/tools/ShapeTool").ShapeTool;
var DrawingToolBase = require("js/tools/drawing-tool-base").DrawingToolBase;
var defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;
var Montage = require("montage/core/core").Montage;
var NJUtils = require("js/lib/NJUtils").NJUtils;
var ElementMediator = require("js/mediators/element-mediator").ElementMediator;
var TagTool = require("js/tools/TagTool").TagTool;
var ElementController = require("js/controllers/elements/element-controller").ElementController;

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
    _subpaths: { value: [], writable: true },
    _selectedSubpath: { value: null, writable: true },
    _makeMultipleSubpaths: { value: true, writable: true },    //set this to true if you want to keep making subpaths after closing current subpath


    //whether or not to display the guides for debugging
    _showGuides: { value: true, writable: true },

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

    //constants used for picking points --- NOTE: these should be user-settable parameters
    _PICK_POINT_RADIUS: { value: 10, writable: false },
    _DISPLAY_ANCHOR_RADIUS: { value: 5, writable: false },
    _DISPLAY_SELECTED_ANCHOR_RADIUS: { value: 10, writable: false },
    _DISPLAY_SELECTED_ANCHOR_PREV_RADIUS: { value: 5, writable: false },
    _DISPLAY_SELECTED_ANCHOR_NEXT_RADIUS: { value: 5, writable: false },

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
    
    //  ******** Logic for selection  *******
    //  (update if you change functionality!) 
    //      NOTE: this is out of date...needs to be updated
    //
    //  Start by setting edit mode to EDIT_NONE
    //
    //  DOUBLE_CLICK (Left mouse button only):
    //
    //
    //  SINGLE_CLICK (Left mouse button only):
    //  If LeftClick selects an anchor point
    //      append EDIT_ANCHOR mode
    //  If LeftClick selects a previous point of selected anchor
    //      append EDIT_PREV mode
    //  If LeftClick selects a next point of selected anchor
    //      append EDIT_NEXT mode 
    //

    // ********* Logic for editing *******
    //  (update if you change functionality!)
    //      NOTE: this is out of date...needs to be updated
    //
    //  Start by computing mouse disp
    //
    //  If EDIT_PREV_NEXT mode
    //      add disp to next and mirror it to prev
    //  ELSE
    //      If EDIT_ANCHOR (or _PREV, _NEXT)
    //          map displacement to anchor (similarly to prev and next)
    //
    // 


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
            //BEGIN ShapeTool code
            if (this._canDraw) {
                this._isDrawing = true;
            }

            //this._targetedCanvas = stageManagerModule.stageManager.GetObjectFromPoint(event.layerX, event.layerY, this._canOperateOnStage);

            this.startDraw(event);
            //END ShapeTool code

            //assume we are not starting a new path as we will set this to true if we create a new GLSubpath()
            this._isNewPath = false;

            //add an anchor point by computing position of mouse down
            var mouseDownPos = this.getMouseDownPos();
            if (mouseDownPos) {
                //if we had closed the selected subpath previously, or if we have not yet started anything, create a subpath
                if (this._selectedSubpath === null) {
                    this._selectedSubpath = new GLSubpath();
                    this._isNewPath = true;
                    if (this._entryEditMode === this.ENTRY_SELECT_PATH){
                        //this should not happen, as ENTRY_SELECT_PATH implies there was a selected subpath
                        this._entryEditMode = this.ENTRY_SELECT_NONE;
                    }
                } else if (this._selectedSubpath.getIsClosed() && this._entryEditMode !== this.ENTRY_SELECT_PATH) {
                    //since we're not in ENTRY_SELECT_PATH mode, we don't edit the closed path...we start a new path regardless of where we clicked
                    if (this._makeMultipleSubpaths) {
                        this._subpaths.push(this._selectedSubpath);
                        this._penCanvas = null;
                        this._penPlaneMat = null;
                        this._snapTarget = null;
                        this._selectedSubpath = new GLSubpath();
                        this._isNewPath = true;
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
                if (whichPoint === this._selectedSubpath.SEL_NONE) {
                    if (this._entryEditMode !== this.ENTRY_SELECT_PATH) {
                        //add an anchor point to end of the subpath, and make it the selected anchor point
                        if (!this._selectedSubpath.getIsClosed() || this._makeMultipleSubpaths) {
                            this._selectedSubpath.addAnchor(new GLAnchorPoint());
                            var newAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                            newAnchor.setPos(mouseDownPos[0], mouseDownPos[1], mouseDownPos[2]);
                            newAnchor.setPrevPos(mouseDownPos[0], mouseDownPos[1], mouseDownPos[2]);
                            newAnchor.setNextPos(mouseDownPos[0], mouseDownPos[1], mouseDownPos[2]);

                            //set the mode so that dragging will update the next and previous locations
                            this._editMode = this.EDIT_PREV_NEXT;
                        }
                    } else {
                        if (this._isPickedEndPointInSelectPathMode){
                            
                        }
                        //if the edit mode was ENTRY_SELECT_PATH and no anchor point was selected, so we should de-select this path and revert to ENTRY_SELECT_NONE
                        //this._entryEditMode = this.ENTRY_SELECT_NONE; //TODO revisit this after implementing code for adding points to any end of selected path
                    }
                } //if (whichPoint === this._selectedSubpath.SEL_NONE) (i.e. no anchor point was selected)

                //display the curve overlay
                this.DrawSubpathAnchors(this._selectedSubpath);
                this.DrawSubpathsSVG();
            } //if (mouseDownPos) { i.e. if mouse down yielded a valid position


            NJevent("enableStageMove");//stageManagerModule.stageManager.enableMouseMove();
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

            if (this._isDrawing) {
                if (!this._isAltDown)
                    this.doDraw(event); //if Alt was down, doDraw prevents this.mouseUpHitRec from being written to
                else{
                    var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas, new WebKitPoint(event.pageX, event.pageY));
                    this.mouseUpHitRec = DrawingToolBase.getUpdatedSnapPoint(point.x, point.y, false, this.mouseDownHitRec);
                }


                // ******* begin new code *********
                //get the current mouse position from the drawing-tool knowing that the mouse up position is set to current mouse pos in this.doDraw above
                var currMousePos = this.getMouseUpPos();
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
                    //clear the canvas before we draw anything else
                    this.application.ninja.stage.clearDrawingCanvas();//stageManagerModule.stageManager.clearDrawingCanvas();
                    this.DrawSubpathAnchors(this._selectedSubpath);
                }
                // ********* end new code ***********

            } else {
                this.doSnap(event);
                this.DrawHandles();
            } //else of if (this._isDrawing) {

            this.drawLastSnap();        // Required cleanup for both Draw/Feedbacks

            this.DrawSubpathsSVG();
        }//value: function(event)
    },

    //TODO Optimize! This function is probably no longer needed
    TranslateSelectedSubpathPerPenCanvas:{
        value: function() {
            if (this._penCanvas!==null) {
                //obtain the 2D translation of the canvas due to the Selection tool...assuming this is called in Configure
                var penCanvasLeft = parseFloat(ElementMediator.getProperty(this._penCanvas, "left"));//parseFloat(DocumentControllerModule.DocumentController.GetElementStyle(this._penCanvas, "left"));
                var penCanvasTop = parseFloat(ElementMediator.getProperty(this._penCanvas, "top"));//parseFloat(DocumentControllerModule.DocumentController.GetElementStyle(this._penCanvas, "top"));
                var penCanvasWidth = this._penCanvas.width;
                var penCanvasHeight = this._penCanvas.height;
                var penCanvasOldX = penCanvasLeft + 0.5 * penCanvasWidth;
                var penCanvasOldY = penCanvasTop + 0.5 * penCanvasHeight;

                var translateCanvasX = penCanvasOldX - this._selectedSubpath.getCanvasX();
                var translateCanvasY = penCanvasOldY - this._selectedSubpath.getCanvasY();

                //update the canvasX and canvasY parameters for this subpath and also translate the subpath points (since they're stored in stage world space)
                this._selectedSubpath.setCanvasX(translateCanvasX + this._selectedSubpath.getCanvasX());
                this._selectedSubpath.setCanvasY(translateCanvasY + this._selectedSubpath.getCanvasY());
                this._selectedSubpath.translate(translateCanvasX, translateCanvasY, 0);
                this._selectedSubpath.createSamples(); //updates the bounding box
            }
        }
    },

    ShowSelectedSubpath:{
        value: function() {
            var bboxMin = this._selectedSubpath.getBBoxMin();
            var bboxMax = this._selectedSubpath.getBBoxMax();
            var bboxWidth = bboxMax[0] - bboxMin[0];
            var bboxHeight = bboxMax[1] - bboxMin[1];
            var bboxMid = Vector.create([0.5 * (bboxMax[0] + bboxMin[0]), 0.5 * (bboxMax[1] + bboxMin[1]), 0.5 * (bboxMax[2] + bboxMin[2])]);

            this._selectedSubpath.setCanvasX(bboxMid[0]);
            this._selectedSubpath.setCanvasY(bboxMid[1]);

            //call render shape with the bbox width and height
            this.RenderShape(bboxWidth, bboxHeight, this._penPlaneMat, bboxMid, this._penCanvas);
        }
    },

    HandleLeftButtonUp: {
        value: function (event) {
            if (this._isDrawing) {
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
                if (!this._penPlaneMat) {
                    this._penPlaneMat = drawData.planeMat;
                }

                if (this._isNewPath) {
                    var strokeSize = 10.0;
                    if (this.options.strokeSize) {
                        strokeSize = this.GetValueInPixels(this.options.strokeSize.value, this.options.strokeSize.units);
                    }
                    this._selectedSubpath.setStrokeWidth(strokeSize);
                }

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
            if (this._entryEditMode === this.ENTRY_SELECT_PATH || !this._selectedSubpath.getIsClosed()){
                this.DrawSubpathAnchors(this._selectedSubpath);//render the subpath anchors on canvas (not GL)
            }

            NJevent("disableStageMove");//stageManagerModule.stageManager.disableMouseMove();
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
            this._subpaths.push(this._selectedSubpath);
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
                    //TODO this is probably unnecessary since we handle delete and backspace via the delete delegate
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

    RenderShape: {
        value: function (w, h, planeMat, midPt, canvas) {
            if ((Math.floor(w) === 0) || (Math.floor(h) === 0)) {
                return;
            }

            var left = Math.round(midPt[0] - 0.5 * w);
            var top = Math.round(midPt[1] - 0.5 * h);


            var strokeStyle = this.options.strokeStyle;
            var strokeSize = 4.0;
            if (this.options.strokeSize) {
                strokeSize = this.GetValueInPixels(this.options.strokeSize.value, this.options.strokeSize.units, h);
            }
            var strokeColor = [1.0, 0.3, 0.3, 1.0];
            var fillColor = [1, .2, .5, 1.0];
            //var s = ColorPanelModule.ColorPanel.strokeToolbar.webGlColor;
            var s = strokeColor;
            if(s)
            {
                strokeColor = [s.r/255, s.g/255, s.b/255, s.a];
            }


           //var f = ColorPanelModule.ColorPanel.fillToolbar.webGlColor;
            var f = fillColor;
            if(f)
            {
                fillColor = [f.r/255, f.g/255, f.b/255, f.a];
            }

            // for default stroke and fill/no materials
            var strokeMaterial = null;
            var fillMaterial = null;

            var strokeIndex = parseInt(this.options.strokeMaterial);
            if(strokeIndex > 0)
            {
                strokeMaterial = Object.create(MaterialsLibrary.getMaterialAt(strokeIndex-1));
            }

            var fillIndex = parseInt(this.options.fillMaterial);
            if(fillIndex > 0)
            {
                fillMaterial = Object.create(MaterialsLibrary.getMaterialAt(fillIndex-1));
            }

            if (!canvas) {
                var newCanvas = null;
                //if (this._useExistingCanvas()) {
                //    newCanvas = this._targetedCanvas; //TODO...when is this condition true? I would like to reuse canvas when continuing path or when drawing on div tool canvas
                //}else {
                    //newCanvas = this.createCanvas(left, top, w, h,"Subpath");
                //}

                newCanvas = NJUtils.makeNJElement("canvas", "Subpath", "shape", null, true);
                var elementModel = TagTool.makeElement(w, h, planeMat, midPt, newCanvas);
                ElementMediator.addElement(newCanvas, elementModel.data, true);

                // create all the GL stuff
                var world = this.getGLWorld(newCanvas, this._useWebGL);//this.options.use3D);//this.CreateGLWorld(planeMat, midPt, newCanvas, this._useWebGL);//fillMaterial, strokeMaterial);
                //store a reference to this newly created canvas
                this._penCanvas = newCanvas;

                var subpath = this._selectedSubpath; //new GLSubpath();
                subpath.setWorld(world);
                subpath.setStrokeMaterial(strokeMaterial);
                subpath.setFillMaterial(fillMaterial);
                subpath.setFillColor(fillColor);
                subpath.setStrokeColor(strokeColor);
                subpath.setStrokeStyle(strokeStyle);

                subpath.setPlaneMatrix(planeMat);
                var planeMatInv = glmat4.inverse( planeMat, [] );
                subpath.setPlaneMatrixInverse(planeMatInv);
                subpath.setPlaneCenter(midPt);

                world.addObject(subpath);
                world.render();
                newCanvas.elementModel.shapeModel.GLGeomObj = subpath;
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
                    ElementMediator.setProperty(canvasArray, "left", [parseInt(left)+"px"],"Changing", "penTool");//DocumentControllerModule.DocumentController.SetElementStyle(canvas, "left", parseInt(left) + "px");
                    ElementMediator.setProperty(canvasArray, "top", [parseInt(top) + "px"],"Changing", "penTool");//DocumentControllerModule.DocumentController.SetElementStyle(canvas, "top", parseInt(top) + "px");
                    canvas.width = w;
                    canvas.height = h;
                    //update the viewport and projection to reflect the new canvas width and height
                    world.setViewportFromCanvas(canvas);
                    if (this._useWebGL){
                        var cam = world.renderer.cameraManager().getActiveCamera();
                        cam.setPerspective(world.getFOV(), world.getAspect(), world.getZNear(), world.getZFar());
                    }
                }

                var subpath = this._selectedSubpath;

                subpath.setDrawingTool(this);
                subpath.setPlaneMatrix(planeMat);
                var planeMatInv = glmat4.inverse( planeMat, [] );
                subpath.setPlaneMatrixInverse(planeMatInv);
                subpath.setPlaneCenter(midPt);

                subpath.setWorld(world);
                subpath.setStrokeMaterial(strokeMaterial);
                subpath.setStrokeColor(strokeColor);
                subpath.setStrokeStyle(strokeStyle);
                subpath.setFillMaterial(fillMaterial);
                subpath.setFillColor(fillColor);
                
                world.addIfNewObject(subpath);
                //world.addObject(subpath);
                world.render();

                //TODO this will not work if there are multiple shapes in the same canvas
                canvas.elementModel.shapeModel.GLGeomObj = subpath;
            } //else of if (!canvas) {
        } //value: function (w, h, planeMat, midPt, canvas) {
    }, //RenderShape: {

    BuildSecondCtrlPoint:{
        value: function(p0, p2, p3) {
            var baselineOrig = VecUtils.vecSubtract(3, p3, p0);
            var baseline = VecUtils.vecNormalize(3, baselineOrig);
            var delta = VecUtils.vecSubtract(3, p2, p3);
            //component of the delta along baseline
            var deltaB = Vector.create(baseline);
            VecUtils.vecScale(3, deltaB, VecUtils.vecDot(3, baseline, delta));
            //component of the delta orthogonal to baseline
            var deltaO = VecUtils.vecSubtract(3, delta, deltaB);

            var p1 = VecUtils.vecInterpolate(3, p0, p3, 0.3333);
            p1= VecUtils.vecAdd(3, p1,deltaO);

            return p1;
        } //value: function(p0, p2, p3) {
    }, //BuildSecondCtrlPoint:{


    deleteSelection: {
        value: function() {
             //clear the selected subpath...the only new additions to this function w.r.t. ToolBase
            if (this._selectedSubpath){
                if (this._selectedSubpath.getSelectedAnchorIndex()>=0){
                    this._selectedSubpath.removeAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                    //clear the canvas
                    this.application.ninja.stage.clearDrawingCanvas();//stageManagerModule.stageManager.clearDrawingCanvas();
                    this.DrawSubpathAnchors(this._selectedSubpath); 
                    this.ShowSelectedSubpath();
                }
                else {
                    this._selectedSubpath.clearAllAnchors();

                    this._selectedSubpath.createSamples();
                    this._selectedSubpath = null;
                    //clear the canvas
                    this.application.ninja.stage.clearDrawingCanvas();//stageManagerModule.stageManager.clearDrawingCanvas();

                    //TODO begin code block taken from ToolBase...figure out how to override it correctly
                    var item;
                    /*
                    if(!selectionManagerModule.selectionManager.isDocument) {
                        for(var i=0; item = selectionManagerModule.selectionManager.selectedItems[i]; i++) {
                            drawUtils.removeElement(item._element);                         // TODO This was called twice - After the event.
                            window.snapManager.removeElementFrom2DCache( item._element );   // TODO Check with Nivesh about it.
                            DocumentControllerModule.DocumentController.RemoveElement(item._element);
                        }

                        NJevent( "deleteSelection" );
                    }
                    */
                    //end code block taken from ToolBase

                    this._penCanvas = null;
                }
            }
        }
    },

    HandleDoubleClick: {
        value: function () {
            //if there is a selected anchor point
            if (this._selectedSubpath && this._selectedSubpath.getSelectedAnchorIndex() !== -1) {
                var selAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                var pos = Vector.create([selAnchor.getPosX(), selAnchor.getPosY(), selAnchor.getPosZ()]);
                //var prev = Vector.create([selAnchor.getPrevX(), selAnchor.getPrevY(), selAnchor.getPrevZ()]);
                //var next = Vector.create([selAnchor.getNextX(), selAnchor.getNextY(), selAnchor.getNextZ()]);

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
                        var nextAnchorPrev = Vector.create([nextAnchor.getPrevX(), nextAnchor.getPrevY(), nextAnchor.getPrevZ()]);
                        var nextAnchorPos = Vector.create([nextAnchor.getPosX(), nextAnchor.getPosY(), nextAnchor.getPosZ()])
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
                        var prevAnchorNext = Vector.create([prevAnchor.getNextX(), prevAnchor.getNextY(), prevAnchor.getNextZ()]);
                        var prevAnchorPos = Vector.create([prevAnchor.getPosX(), prevAnchor.getPosY(), prevAnchor.getPosZ()])
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

            var horizontalOffset = this.application.ninja.stage.userContentLeft;//stageManagerModule.stageManager.userContentLeft;
            var verticalOffset = this.application.ninja.stage.userContentTop;//stageManagerModule.stageManager.userContentTop;


            if (this._showGuides) {
                var leftOffsetSamples = subpath.getLeftOffsetPoints();
                var rightOffsetSamples = subpath.getRightOffsetPoints();
                /*
                //display the subpath samples as a sequence of circles
                ctx.lineWidth = 2;
                ctx.fillStyle = "pink";
                ctx.strokeStyle = "black";
                for (var i = 0; i < samples.length; i += 3) {
                ctx.beginPath();
                ctx.arc(samples[i], samples[i + 1], this._DISPLAY_ANCHOR_RADIUS, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.stroke();
                }
                */

                /*
                //display circles near all offset sample points
                ctx.fillStyle = "#44FF44";
                ctx.lineWidth = 2;
                ctx.strokeStyle = "black";
                for (var i = 0; i < leftOffsetSamples.length; i++) {
                    var px = leftOffsetSamples[i].Pos[0]+ horizontalOffset;
                    var py = leftOffsetSamples[i].Pos[1]+ verticalOffset;
                    ctx.beginPath();
                    ctx.arc(px, py, this._DISPLAY_ANCHOR_RADIUS * 0.75, 0, 2 * Math.PI, false);
                    ctx.fill();
                    ctx.stroke();
                }
                */

                /*
                //display mapping of subpath samples to offset samples

                ctx.strokeStyle = "black";
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (var i = 0; i < leftOffsetSamples.length; i++) {
                    var px = leftOffsetSamples[i].Pos[0]+ horizontalOffset;
                    var py = leftOffsetSamples[i].Pos[1]+ verticalOffset;
                    var ox = leftOffsetSamples[i].CurveMapPos[0] + horizontalOffset;
                    var oy = leftOffsetSamples[i].CurveMapPos[1] + verticalOffset;

                    ctx.moveTo(px, py);
                    ctx.lineTo(ox,oy);
                }
                ctx.stroke();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (var i = 0; i < rightOffsetSamples.length; i++) {
                    var px = rightOffsetSamples[i].Pos[0]+ horizontalOffset;
                    var py = rightOffsetSamples[i].Pos[1]+ verticalOffset;
                    var ox = rightOffsetSamples[i].CurveMapPos[0] + horizontalOffset;
                    var oy = rightOffsetSamples[i].CurveMapPos[1] + verticalOffset;

                    ctx.moveTo(px, py);
                    ctx.lineTo(ox,oy);
                }
                ctx.stroke();
                 */

                /*
                //display triangles generated
                var leftOffsetTriangles = subpath.getLeftOffsetTriangles();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (var i = 0; i < leftOffsetTriangles.length; i++) {
                    ctx.moveTo(leftOffsetTriangles[i].v0[0] + horizontalOffset, leftOffsetTriangles[i].v0[1] + verticalOffset);
                    ctx.lineTo(leftOffsetTriangles[i].v1[0] + horizontalOffset, leftOffsetTriangles[i].v1[1] + verticalOffset);
                    ctx.lineTo(leftOffsetTriangles[i].v2[0] + horizontalOffset, leftOffsetTriangles[i].v2[1] + verticalOffset);
                }
                ctx.stroke();

                var rightOffsetTriangles = subpath.getRightOffsetTriangles();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (var i = 0; i < rightOffsetTriangles.length; i++) {
                    ctx.moveTo(rightOffsetTriangles[i].v0[0] + horizontalOffset, rightOffsetTriangles[i].v0[1] + verticalOffset);
                    ctx.lineTo(rightOffsetTriangles[i].v1[0] + horizontalOffset, rightOffsetTriangles[i].v1[1] + verticalOffset);
                    ctx.lineTo(rightOffsetTriangles[i].v2[0] + horizontalOffset, rightOffsetTriangles[i].v2[1] + verticalOffset);
                }
                ctx.stroke();
                */
            } //if this._showGuides



            //display the subpath as a sequence of cubic beziers
            ctx.lineWidth = 1;//subpath.getStrokeWidth(); //TODO replace hardcoded stroke width with some programmatically set value (should not be same as stroke width)
            if (ctx.lineWidth == subpath.getStrokeWidth())
                ctx.lineWidth = 3;
            ctx.strokeStyle = "black";
            if (subpath.getStrokeColor())
			    ctx.strokeStyle = MathUtils.colorToHex( subpath.getStrokeColor() );
            ctx.beginPath();
            var p0x = subpath.getAnchor(0).getPosX()+ horizontalOffset;
            var p0y = subpath.getAnchor(0).getPosY()+ verticalOffset;
            ctx.moveTo(p0x, p0y);
            for (var i = 1; i < numAnchors; i++) {
                var p1x = subpath.getAnchor(i - 1).getNextX()+ horizontalOffset;
                var p1y = subpath.getAnchor(i - 1).getNextY()+ verticalOffset;
                var p2x = subpath.getAnchor(i).getPrevX()+ horizontalOffset;
                var p2y = subpath.getAnchor(i).getPrevY()+ verticalOffset;
                var p3x = subpath.getAnchor(i).getPosX()+ horizontalOffset;
                var p3y = subpath.getAnchor(i).getPosY()+ verticalOffset;
                ctx.bezierCurveTo(p1x, p1y, p2x, p2y, p3x, p3y);
            }
            if (subpath.getIsClosed()) {
                var i = numAnchors - 1;
                var p1x = subpath.getAnchor(i).getNextX()+ horizontalOffset;
                var p1y = subpath.getAnchor(i).getNextY()+ verticalOffset;
                var p2x = subpath.getAnchor(0).getPrevX()+ horizontalOffset;
                var p2y = subpath.getAnchor(0).getPrevY()+ verticalOffset;
                var p3x = subpath.getAnchor(0).getPosX()+ horizontalOffset;
                var p3y = subpath.getAnchor(0).getPosY()+ verticalOffset;
                ctx.bezierCurveTo(p1x, p1y, p2x, p2y, p3x, p3y);
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

            var horizontalOffset = this.application.ninja.stage.userContentLeft;//stageManagerModule.stageManager.userContentLeft;
            var verticalOffset = this.application.ninja.stage.userContentTop;//stageManagerModule.stageManager.userContentTop;

            /*
            //display the sampled left offset of subpath as a sequence of line segments
            var leftOffsetSamples = subpath.getLeftOffsetPoints();
            if (leftOffsetSamples.length) {
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(leftOffsetSamples[0].Pos[0] + horizontalOffset, leftOffsetSamples[0].Pos[1] + verticalOffset);
                for (var i = 0; i < leftOffsetSamples.length; i++) {
                    ctx.lineTo(leftOffsetSamples[i].Pos[0] + horizontalOffset, leftOffsetSamples[i].Pos[1] + verticalOffset);
                }
                ctx.stroke();
            }


            //display the sampled right offset of subpath as a sequence of line segments
            var rightOffsetSamples = subpath.getRightOffsetPoints();
            if (rightOffsetSamples.length) {
                ctx.strokeStyle = "red";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(rightOffsetSamples[0].Pos[0] + horizontalOffset, rightOffsetSamples[0].Pos[1] + verticalOffset);
                for (var i = 0; i < rightOffsetSamples.length; i++) {
                    ctx.lineTo(rightOffsetSamples[i].Pos[0] + horizontalOffset, rightOffsetSamples[i].Pos[1] + verticalOffset);
                }
                ctx.stroke();
            }
            */

            //display circles and squares near all control points 
            ctx.fillStyle = "#FF4444";
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            for (var i = 0; i < numAnchors; i++) {
                //display the anchor point with its prev. and next
                var px = subpath.getAnchor(i).getPosX();
                var py = subpath.getAnchor(i).getPosY();
                var prevx = subpath.getAnchor(i).getPrevX();
                var prevy = subpath.getAnchor(i).getPrevY();
                var nextx = subpath.getAnchor(i).getNextX();
                var nexty = subpath.getAnchor(i).getNextY();

                //anchor point
                ctx.beginPath();
                ctx.arc(px + horizontalOffset, py + verticalOffset, this._DISPLAY_ANCHOR_RADIUS, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.stroke();
            }
            

            //display selected anchor and its prev. and next points
            if (this._selectedSubpath && subpath === this._selectedSubpath && this._selectedSubpath.getSelectedAnchorIndex()!== -1) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = "black";
                var selAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());

                //line from prev to anchor
                ctx.beginPath();
                ctx.moveTo(selAnchor.getPrevX() + horizontalOffset, selAnchor.getPrevY() + verticalOffset);
                ctx.lineTo(selAnchor.getPosX() + horizontalOffset, selAnchor.getPosY() + verticalOffset);
                ctx.stroke();

                //selected anchor prev
                ctx.fillStyle = "#AAAAAA";
                ctx.beginPath();
                ctx.arc(selAnchor.getPrevX() + horizontalOffset, selAnchor.getPrevY() + verticalOffset, this._DISPLAY_SELECTED_ANCHOR_PREV_RADIUS, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.stroke();

                //line from next to anchor
                ctx.beginPath();
                ctx.moveTo(selAnchor.getNextX() + horizontalOffset, selAnchor.getNextY() + verticalOffset);
                ctx.lineTo(selAnchor.getPosX() + horizontalOffset, selAnchor.getPosY() + verticalOffset);
                ctx.stroke();

                //selected anchor next
                ctx.fillStyle = "#666666";
                ctx.beginPath();
                ctx.arc(selAnchor.getNextX() + horizontalOffset, selAnchor.getNextY() + verticalOffset, this._DISPLAY_SELECTED_ANCHOR_NEXT_RADIUS, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.stroke();

                //selected anchor point
                ctx.fillStyle = "#8ED6FF";
                ctx.beginPath();
                ctx.arc(selAnchor.getPosX() + horizontalOffset, selAnchor.getPosY() + verticalOffset, this._DISPLAY_SELECTED_ANCHOR_RADIUS, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.stroke();

                //display the snap target if it isn't null
                if (this._snapTarget) {
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "red";
                    ctx.beginPath();
                    ctx.arc(this._snapTarget.getPosX() + horizontalOffset, this._snapTarget.getPosY() + verticalOffset, this._DISPLAY_SELECTED_ANCHOR_RADIUS * 2, 0, 2 * Math.PI, false);
                    ctx.stroke();
                }
            } //if this._selectedSubpath && subpath === this._selectedSubpath && this._selectedSubpath.getSelectedAnchorIndex()!== -1
            ctx.restore();
        } //value: function() {
    }, //DrawSubpathAnchors {

    // DrawSubpathsSVG
    //  Draw all the subpaths using the SVG drawing capability (i.e. not WebGL)
    //  NOTE: testing only...in final version, we do not need this function
    DrawSubpathsSVG:
    {
        value: function () {
            if (!this._useWebGL){
                //display the selected subpath (which is not yet in the list of finished subpaths)
                if (this._selectedSubpath) {
                    this.DrawSubpathSVG(this._selectedSubpath);
                }
                return;
            }



            if (this._subpaths === null) {
                return;
            }
            //clear the canvas before we draw anything else
            this.application.ninja.stage.clearDrawingCanvas();//stageManagerModule.stageManager.clearDrawingCanvas();

            //display the subpaths currently in the list of finished subpaths
            for (var i = 0; i < this._subpaths.length; i++) {
                this.DrawSubpathSVG(this._subpaths[i]);
            } //for (var i = 0; i < this._subpaths.length; i++) {

            //display the selected subpath (which is not yet in the list of finished subpaths)
            if (this._selectedSubpath) {
                this.DrawSubpathSVG(this._selectedSubpath);
            }

        } // function() {
    }, //DrawSubpathsSVG 





    Configure: {
        value: function (wasSelected) {
            if (wasSelected) {
                defaultEventManager.addEventListener("resetPenTool", this, false);
                //stageManagerModule.stageManager._iframeContainer.addEventListener("scroll", this, false);
                /*if (this._selectedSubpath){
                    //todo this if block is probably unnecessary because the subpath rendering now happens independent of canvas position
                    this.TranslateSelectedSubpathPerPenCanvas();
                    this.DrawSubpathAnchors(this._selectedSubpath);
                }*/

                this.application.ninja.elementMediator.deleteDelegate = this;

                if (this.application.ninja.selectedElements.length === 0){
                    this._entryEditMode = this.ENTRY_SELECT_NONE;
                }
                else{
                    for (var i=0;i<this.application.ninja.selectedElements.length;i++){
                        var element = this.application.ninja.selectedElements[i]._element;
                        console.log("Entered pen tool, had selected: " + element.elementModel.selection);
                        if (element.elementModel.selection === 'Subpath'){ //TODO what to do if the canvas is drawn by tag tool?
                            //set the pen canvas to be the selected canvas
                            this._penCanvas = this.application.ninja.selectedElements[i]._element;

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
            }
            else {
                this._selectedSubpath = null;
                this._penCanvas = null;
                this._penPlaneMat = null;
                this._snapTarget = null;
                defaultEventManager.removeEventListener("resetPenTool", this, false);
                //stageManagerModule.stageManager._iframeContainer.removeEventListener("scroll", this, false);
                //ElementMediator.deleteDelegate = "";
                this.application.ninja.elementMediator.deleteDelegate = null;
                //this._entryEditMode = this.ENTRY_SELECT_NONE;
            }
        }
    },

    handleDelete:{
        value: function(event){
             //clear the selected subpath...the only new additions to this function w.r.t. ToolBase
            if (this._selectedSubpath){
                if (this._selectedSubpath.getSelectedAnchorIndex()>=0){
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

                    //TODO is this the correct way to remove the pen canvas? Undo/Redo, etc.?
                    //    see handleDeleteSelection in selected-controller.js
                    // Add the Undo/Redo -- taken from element-mediator.js
                    var els = [];
                    ElementController.removeElement(this._penCanvas);
                    els.push(this._penCanvas);
                    NJevent( "deleteSelection", els );
                    this._penCanvas = null;
                }
            }
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