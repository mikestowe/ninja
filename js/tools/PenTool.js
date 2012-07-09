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

var ShapeTool = require("js/tools/ShapeTool").ShapeTool;
var ShapesController =  require("js/controllers/elements/shapes-controller").ShapesController;
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

    //set this to true if you want to keep making subpaths after closing current subpath (debugging only...should always be true)
    _makeMultipleSubpaths: { value: true, writable: true },

    //set this to false if you don't want the mouse move handler being called when the mouse is not down (debugging only...should always be true)
    _trackMouseMoveWhenUp: {value: true, writable: false},

    //whether the user has held down the Alt key
    _isAltDown: { value: false, writable: true },

    //whether the user has held down the Esc key
    _isEscapeDown: {value: false, writable: true },

    //whether we have just started a new path (may set true in mousedown, and always set false in mouse up
    _isNewPath: {value: false, writable: true},

    //whether we have clicked one of the endpoints after entering the pen tool in ENTRY_SELECT_PATH edit mode
    _isPickedEndPointInSelectPathMode: {value: false, writable: true},

    //when the user wants to place a selected anchor point on top of another point, this is the target where the point will be placed
    _snapTargetIndex: { value: -1, writable: true },

    //index of the anchor point that the user has hovered over
    _hoveredAnchorIndex: {value: -1, writable: true},

    //whether or not we're using webgl for drawing (set to false until we have webgl-ready stroke and fill regions)
    _useWebGL: {value: false, writable: false },

    //the _selectedSubpath is the active subpath currently being edited
    _selectedSubpath: { value: null, writable: true },

    //the canvas for the selected subpath...this is grown or shrunk by the pen tool with the subpath (if the canvas was not already provided)
    _selectedSubpathCanvas: { value: null, writable: true },

    //the plane matrix for the first click...so the entire path is on the same plane
    //  todo this might be unnecessary as we can get this from element mediator (but that may be slow)
    _selectedSubpathPlaneMat: { value: null, writable: true },

    //the center of the subpath center in stageworld space
    _selectedSubpathCanvasCenter: {value: null, writable: true},

    //this flag is set true by the Configure(true) and set false by Configure(false) or handleSelectionChange
    _doesSelectionChangeNeedHandling: {value: false, writable: true},

    //constants used for picking points --- todo: these should be user-settable parameters
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

    //constants used for selection modes on entry to pen tool (mutually exclusive i.e. cannot be OR-ed)
    ENTRY_SELECT_NONE: { value: 0, writable: false},
    ENTRY_SELECT_CANVAS: { value: 1, writable: false},
    ENTRY_SELECT_PATH: { value: 2, writable: false},
    _entryEditMode: {value: this.ENTRY_SELECT_NONE, writable: true},

    //constants used for determining whether a subtool has been selected (mutually exclusive i.e. cannot be OR-ed)
    SUBTOOL_NONE: {value: 0, writable: false},
    SUBTOOL_PENPLUS: {value: 1, writable: false},
    SUBTOOL_PENMINUS: {value: 2, writable: false},
    _subtool: {value: this.SUBTOOL_NONE, writable: true},

    //constants used for limiting size of the subpath canvas
    _MAX_CANVAS_DIMENSION: {value: 3000, writable: false},

    /*
    // get the stage world position corresponding to the (x,y) mouse event position by querying the snap manager
    //  but temporarily turning off all snapping
    _getMouseEventPosition : {
        value: function(x,y, getStageWorld, doSnap){
            var elemSnap = snapManager.elementSnapEnabled();
            var gridSnap = snapManager.gridSnapEnabled();
            var alignSnap = snapManager.snapAlignEnabled();

            if (!doSnap){
                snapManager.enableElementSnap(false);
                snapManager.enableGridSnap(false);
                snapManager.enableSnapAlign(false);
            }

            var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas, new WebKitPoint(x,y));
            var pos;
            if (getStageWorld){
                pos = (snapManager.snap(point.x, point.y, false)).calculateStageWorldPoint();
            } else {
                pos = (snapManager.snap(point.x, point.y, false)).getScreenPoint();
            }
            var dragPlane = snapManager.getDragPlane();

            if (!doSnap){
                snapManager.enableElementSnap(elemSnap);
                snapManager.enableGridSnap(gridSnap);
                snapManager.enableSnapAlign(alignSnap);
            }

            return [pos, dragPlane];
        }
    },
    */

    ShowToolProperties: {
        value: function () {
            this._penView = PenView.create();
            this._penView.element = document.getElementById('topPanelContainer').children[0];
            this._penView.needsDraw = true;

            this._penView.addEventListener(ToolEvents.TOOL_OPTION_CHANGE, this, false);
        }

    },

    //use the snap manager to build a hit record corresponding to the screen X, Y position
    // will use the plane of the selected path as the working plane if available, else use stage
    getHitRecord:{
        value: function(x,y, doSnap){
            var elemSnap = snapManager.elementSnapEnabled();
            var gridSnap = snapManager.gridSnapEnabled();
            var alignSnap = snapManager.snapAlignEnabled();

            if (!doSnap){
                snapManager.enableElementSnap(false);
                snapManager.enableGridSnap(false);
                snapManager.enableSnapAlign(false);
            }

            if (this._selectedSubpathCanvas){
                var drawingCanvas = this._selectedSubpathCanvas;
                var contentPlane = ViewUtils.getUnprojectedElementPlane(drawingCanvas);
                snapManager.pushWorkingPlane(contentPlane);

            }
            var tmpPoint = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas, new WebKitPoint(x,y));
            var hitRec = snapManager.snap(tmpPoint.x, tmpPoint.y, false);
            if (this._selectedSubpathCanvas){
                snapManager.popWorkingPlane();
            }

            if (!doSnap){
                snapManager.enableElementSnap(elemSnap);
                snapManager.enableGridSnap(gridSnap);
                snapManager.enableSnapAlign(alignSnap);
            }
            return hitRec;
        }
    },

    _removeSelectedSubpathAndCanvas:{
        value: function(removeSelectedSubpath){
            if (removeSelectedSubpath){
                this._selectedSubpath.clearAllAnchors(); //perhaps unnecessary
                this._selectedSubpath = null;
                if (this._subtool === this.SUBTOOL_NONE){
                    if (this._entryEditMode === this.ENTRY_SELECT_PATH){
                        this._entryEditMode = this.ENTRY_SELECT_NONE;
                    }
                }
            } else {
                this._selectedSubpath.setCanvas(null);
            }
            //clear the canvas
            this.application.ninja.stage.clearDrawingCanvas();//stageManagerModule.stageManager.clearDrawingCanvas();

            //undo/redo...go through ElementController and NJEvent
            if (this._selectedSubpathCanvas) {
                var els = [];
                ElementController.removeElement(this._selectedSubpathCanvas);
                els.push(this._selectedSubpathCanvas);
                NJevent( "elementsRemoved", els );
            }
            this._selectedSubpathCanvas = null;
        }
    },

    _removeSelectedAnchorPoint:{
        value: function(){
            this._hoveredAnchorIndex=-1;
            this._selectedSubpath.removeAnchor(this._selectedSubpath.getSelectedAnchorIndex());
            if (this._selectedSubpath.getNumAnchors()===1){
                //convert the remaining anchor point to stage world coords
                var xDelta = snapManager.getStageWidth()*0.5;
                var yDelta = snapManager.getStageHeight()*0.5;
                var anchor = this._selectedSubpath.getAnchor(0);
                var swPos = ViewUtils.localToStageWorld([anchor.getPosX(),anchor.getPosY(),anchor.getPosZ()], this._selectedSubpathCanvas);
                anchor.setPos(swPos[0]+xDelta, swPos[1]+yDelta, swPos[2]);
                swPos = ViewUtils.localToStageWorld([anchor.getPrevX(),anchor.getPrevY(),anchor.getPrevZ()], this._selectedSubpathCanvas);
                anchor.setPrevPos(swPos[0]+xDelta, swPos[1]+yDelta, swPos[2]);
                swPos = ViewUtils.localToStageWorld([anchor.getNextX(),anchor.getNextY(),anchor.getNextZ()], this._selectedSubpathCanvas);
                anchor.setNextPos(swPos[0]+xDelta, swPos[1]+yDelta, swPos[2]);
            }
            //clear the canvas
            this.application.ninja.stage.clearDrawingCanvas();//stageManagerModule.stageManager.clearDrawingCanvas();
            var removeSelectedSubpath=true;
            var newNumAnchors = this._selectedSubpath.getNumAnchors();
            if (newNumAnchors>1) {
                this._selectedSubpath.createSamples(false);
                this.PrepareSelectedSubpathForRendering();
                this.ShowSelectedSubpath();
            }
            else {
                //since we have 0 or 1 anchors, we will remove the selected canvas (as the path does not exist)
                if (newNumAnchors===0){
                    removeSelectedSubpath = true;
                } else{
                    removeSelectedSubpath = false; //don't remove the selected subpath if there is still one anchor
                }
                this._removeSelectedSubpathAndCanvas(removeSelectedSubpath);
            }
            if (!removeSelectedSubpath){
                this.DrawSubpathAnchors(this._selectedSubpath);
            }
        }
    },

    // **********************************************************************************************************
    //  Mouse down handler
    //  IF the selected subpath is null, it means we're going to start a new subpath
    //      Create a new subpath
    //  Compute the mouse position in stage world space (lying on stage or selected subpath canvas)
    //  IF selected subpath does not have a canvas yet,
    //      IF this is the first anchor point of the selected subpath
    //          Store the plane mat and drag plane of this hit record (will be used for creating a canvas)
    //      Add the mouse position (in stage world space) as an anchor point
    //  ELSE (we may add to the selected subpath)
    //      Compute the mouse position in local (selected subpath canvas) space
    //      IF we hit the path:
    //          Either select an anchor or insert an anchor and select it
    //          (also set proper flags when select endpoint of open path in ENTRY_SELECT_PATH mode)
    //      ELSE
    //          If selected subpath is closed (and we're not in ENTRY_SELECT_PATH mode)
    //              Create a new subpath
    //          Add the mouse position (in selected subpath's local space) as an anchor point (call global to local)
    //  Draw the selected subpath anchors and the selected subpath itself in the stage's context
    // **********************************************************************************************************
    HandleLeftButtonDown:
    {
        value: function (event) {
            //ignore any right or middle clicks
            if (event.button !== 0) {
                //todo NOTE: this will work on Webkit only...IE has different codes (left: 1, middle: 4, right: 2)
                return;
            }

            //set the drawing flags (see the drawing-tool.js base class)
            if (this._canDraw) {
                this._isDrawing = true;
            }

            //assume we are not starting a new path as we will set this to true if we create a new Subpath()
            this._isNewPath = false;

            if (this._subtool !== this.SUBTOOL_NONE && this._selectedSubpath===null) {
                //do nothing because the pen plus and pen minus subtools need a selected subpath
                return;
            }

            //build the hit record for the current mouse position (on the stage or the plane of the path canvas)
            var hitRec = this.getHitRecord(event.pageX, event.pageY, false);
            var globalMousePos=null, localMousePos=null, stageWorldMousePos = null, drawingCanvas=null;
            if (this._selectedSubpathCanvas){
                globalMousePos = hitRec.getScreenPoint();
                localMousePos = ViewUtils.globalToLocal(globalMousePos, this._selectedSubpathCanvas);
            }

            //if we have a selected subpath and canvas, check if the current click location hits the path
            // todo optimize this...currently pickPath is called twice (see later in this function)
            var hitPath = false;
            if (this._selectedSubpath && this._selectedSubpathCanvas ) {
                var tempSelAnchorAndParamAndCode = this._selectedSubpath.pickPath(localMousePos[0], localMousePos[1], localMousePos[2], this._PICK_POINT_RADIUS, true);
                if (tempSelAnchorAndParamAndCode[2] !== this._selectedSubpath.SEL_NONE){     // ******* if we hit the path anywhere *********
                    hitPath = true;
                }
            }

            //if we had closed the selected subpath previously, or if we have not yet started anything, create a subpath
            if (this._entryEditMode !== this.ENTRY_SELECT_PATH && this._selectedSubpath && this._selectedSubpath.getIsClosed() && this._makeMultipleSubpaths && !hitPath) {
                this._selectedSubpath = null;
            }

            if (this._selectedSubpath === null) {
                this._selectedSubpath = new SubPath();
                this._selectedSubpathCanvas = null;
                this._selectedSubpathPlaneMat = null;
                this._isNewPath = true;

                if (this._entryEditMode === this.ENTRY_SELECT_PATH){
                    //this should not happen, as ENTRY_SELECT_PATH implies there was a selected subpath
                    this._entryEditMode = this.ENTRY_SELECT_NONE;
                    throw("Warning...PenTool handleMouseDown: changing from SELECT_PATH to SELECT_NONE");
                }

                //set display parameters: stroke width, stroke color, and fill color
                var strokeSize = 1.0;//default stroke width
                if (this.options.strokeSize) {
                    strokeSize = ShapesController.GetValueInPixels(this.options.strokeSize.value, this.options.strokeSize.units);
                }
                this._selectedSubpath.setStrokeWidth(strokeSize);

                var colorObj;
                var stroke = this.options.stroke;
                var color = stroke.color;
                if(stroke.colorMode === "gradient") {
                    colorObj = {gradientMode:stroke.color.gradientMode, color:stroke.color.stops};
                } else if (color) {
                    colorObj = [color.r/255, color.g/255, color.b/255, color.a];
                } else {
                    colorObj = [1,1,1,0];
                }
                this._selectedSubpath.setStrokeColor(colorObj);

                var fill = this.options.fill;
                color = fill.color;
                if(fill.colorMode === "gradient") {
                    colorObj = {gradientMode:fill.color.gradientMode, color:fill.color.stops};
                } else if (color) {
                    colorObj = [color.r/255, color.g/255, color.b/255, color.a];
                } else {
                    colorObj = [1,1,1,0];
                }
                this._selectedSubpath.setFillColor(colorObj);
            } //if the selectedSubpath was null and needed to be constructed

            //build the current mouse position in stage world space in case we don't already have a canvas
            if (!this._selectedSubpathCanvas){
                drawingCanvas = this.application.ninja.currentDocument.model.documentRoot;//ViewUtils.getStageElement();
                stageWorldMousePos = hitRec.calculateStageWorldPoint();
                stageWorldMousePos[0]+= snapManager.getStageWidth()*0.5;
                stageWorldMousePos[1]+= snapManager.getStageHeight()*0.5;
                localMousePos = stageWorldMousePos; //since the subpath points are in stage world space, set the 'localMousePos' to be stage world as well
            }


            if (this._selectedSubpathCanvas === null && this._subtool===this.SUBTOOL_NONE){
                //IF this is the first anchor point of the selected subpath
                //          Store the plane mat and drag plane of this hit record (will be used for creating a canvas)
                //      Add the mouse position (in stage world space) as an anchor point

                if (this._selectedSubpath.getNumAnchors()===0) {
                    this._selectedSubpathPlaneMat   = hitRec.getPlaneMatrix();
                }
                //check if the mouse click location is close to the existing anchor
                var indexAndCode = this._selectedSubpath.pickAnchor(stageWorldMousePos[0], stageWorldMousePos[1], stageWorldMousePos[2], this._PICK_POINT_RADIUS);
                if (indexAndCode[0]>=0){
                    //the anchor point was hit, so we do not add another anchor
                    switch(indexAndCode[1]){
                        case this._selectedSubpath.SEL_ANCHOR:
                            this._editMode = this.EDIT_ANCHOR;
                            break;
                        case this._selectedSubpath.SEL_PREV:
                            this._editMode = this.EDIT_PREV;
                            break;
                        case this._selectedSubpath.SEL_NEXT:
                            this._editMode = this.EDIT_NEXT;
                            break;
                        default:
                            this._editMode = this.EDIT_ANCHOR;
                            console.log("WARNING picked anchor point with incorrect mode");
                            break;
                    }

                } else {
                    this._selectedSubpath.addAnchor(new AnchorPoint());
                    var newAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                    newAnchor.setPos(stageWorldMousePos[0], stageWorldMousePos[1], stageWorldMousePos[2]);
                    newAnchor.setPrevPos(stageWorldMousePos[0], stageWorldMousePos[1], stageWorldMousePos[2]);
                    newAnchor.setNextPos(stageWorldMousePos[0], stageWorldMousePos[1], stageWorldMousePos[2]);
                    //set the mode so that dragging will update the next and previous locations
                    this._editMode = this.EDIT_PREV_NEXT;
                }
            } //if we have not yet created a canvas for this path

            //the selected subpath has a canvas, so test within that canvas' space
            else
            {
                //      (we may add to the selected subpath)
                //      Compute the mouse position in local (selected subpath canvas) space
                //      IF we hit the path:
                //          Either select an anchor or insert an anchor and select it
                //          (also set proper flags when select endpoint of open path in ENTRY_SELECT_PATH mode)
                //      ELSE
                //          If selected subpath is closed (and we're not in ENTRY_SELECT_PATH mode)
                //              Create a new subpath
                //          Add the mouse position (in selected subpath's local space) as an anchor point (call global to local)

                //now perform the hit testing
                var prevSelectedAnchorIndex = this._selectedSubpath.getSelectedAnchorIndex();
                var selAnchorAndParamAndCode = this._selectedSubpath.pickPath(localMousePos[0], localMousePos[1], localMousePos[2], this._PICK_POINT_RADIUS, false);
                var selParam = selAnchorAndParamAndCode[1];
                var whichPoint = this._selectedSubpath.getSelectedMode();


                // ******* if we hit the path anywhere *********

                if (whichPoint !== this._selectedSubpath.SEL_NONE){
                    //if we hit the anchor point itself
                    if (whichPoint & this._selectedSubpath.SEL_ANCHOR) {
                        if (this._subtool===this.SUBTOOL_PENMINUS){
                            //remove the selected anchor, similar to HandleDelete
                            this._removeSelectedAnchorPoint();
                            return;
                        }
                        if (this._subtool === this.SUBTOOL_PENPLUS){
                            //nothing to do for the pen plus subtool
                            return;
                        }
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
                            //insert an anchor temporarily that will get removed in the mouse up handler
                            this._selectedSubpath.addAnchor(new AnchorPoint());
                            var newAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                            newAnchor.setPos(localMousePos[0], localMousePos[1], localMousePos[2]);
                            newAnchor.setPrevPos(localMousePos[0], localMousePos[1], localMousePos[2]);
                            newAnchor.setNextPos(localMousePos[0], localMousePos[1], localMousePos[2]);

                            //set the snap target in case the mouse move handler doesn't get called
                            this._snapTargetIndex = 0;
                            this._editMode = this.EDIT_PREV_NEXT;
                        }
                    }

                    //if we hit the prev handle
                    else if (whichPoint & this._selectedSubpath.SEL_PREV && this._subtool===this.SUBTOOL_NONE){
                        this._editMode = this.EDIT_PREV;
                    }

                    //if we hit the next handle
                    else if (whichPoint & this._selectedSubpath.SEL_NEXT && this._subtool===this.SUBTOOL_NONE){
                        this._editMode = this.EDIT_NEXT;
                    }

                    //if no anchor or handles
                    else if (whichPoint & this._selectedSubpath.SEL_PATH) {
                        //the click point is close enough to insert point in bezier segment after selected anchor at selParam
                        if ((selParam > 0 && selParam < 1) && this._subtool!==this.SUBTOOL_PENMINUS) {
                            this._selectedSubpath.insertAnchorAtParameter(this._selectedSubpath.getSelectedAnchorIndex(), selParam);
                            //set the mode so that dragging will update anchor point positions
                            //this._editMode = this.EDIT_ANCHOR;
                        } else {
                            this._selectedSubpath.deselectAnchorPoint(); //set that no anchor is selected since the path was not hit anywhere useful
                        }
                    }

                } //if the path was hit somewhere

                // ************ the path was not hit anywhere ************
                else {
                    //add an anchor point to end of the open selected subpath (in local space), and make it the selected anchor point
                    // ONLY if we were not in SELECT_PATH entry mode or we are in SELECT_PATH entry mode and we have picked one of the endpoints
                    if (this._subtool===this.SUBTOOL_NONE &&
                        (this._entryEditMode !== this.ENTRY_SELECT_PATH ||
                            (this._entryEditMode === this.ENTRY_SELECT_PATH && this._isPickedEndPointInSelectPathMode))
                        ) {
                        if (!this._selectedSubpath.getIsClosed()) { //todo this test is probably unnecessary, but doing it to be safe
                            this._selectedSubpath.addAnchor(new AnchorPoint());
                            var newAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());

                            newAnchor.setPos(localMousePos[0], localMousePos[1], localMousePos[2]);
                            newAnchor.setPrevPos(localMousePos[0], localMousePos[1], localMousePos[2]);
                            newAnchor.setNextPos(localMousePos[0], localMousePos[1], localMousePos[2]);

                            //set the mode so that dragging will update the next and previous locations
                            this._editMode = this.EDIT_PREV_NEXT;
                        }
                    }
                }
            } //end of testing when we have a subpath canvas


            //display the curve overlay
            this.DrawSubpathAnchors(this._selectedSubpath);
            this.DrawSubpathOnStage(this._selectedSubpath);

            if (!this._trackMouseMoveWhenUp){
                NJevent("enableStageMove");
            }

            this._hoveredAnchorIndex = -1;
        } //value: function (event) {
    }, //HandleLeftButtonDown


    HandleMouseMove:
    {
        value: function (event) {
            //ignore any right or middle clicks
            if (event.button !== 0) {
                //NOTE: this will work on Webkit only...IE has different codes (left: 1, middle: 4, right: 2)
                return;
            }

            //set the cursor to be the default cursor (depending on whether the selected subpath has any points yet)
            if (this._subtool===this.SUBTOOL_NONE){
                if ((this._selectedSubpath && this._selectedSubpath.getNumAnchors()>0 && !this._selectedSubpath.getIsClosed())
                    ||
                    this._entryEditMode === this.ENTRY_SELECT_PATH){
                    this.application.ninja.stage.drawingCanvas.style.cursor = //"auto";
                        "url('images/cursors/penCursors/Pen_.png') 5 1, default";
                }
                else {
                    this.application.ninja.stage.drawingCanvas.style.cursor = //"auto";
                        "url('images/cursors/penCursors/Pen_newPath.png') 5 1, default";
                }
            } else {
                //use the standard pen cursor for Pen Plus and Pen Minus
                this.application.ninja.stage.drawingCanvas.style.cursor = //"auto";
                        "url('images/cursors/penCursors/Pen_.png') 5 1, default";
            }

            if (!this._selectedSubpath ){
                return; //nothing to do in case no subpath is selected
            }

            //clear the canvas before we draw anything else
            this.application.ninja.stage.clearDrawingCanvas();
            this._hoveredAnchorIndex = -1;

            var hitRec = this.getHitRecord(event.pageX, event.pageY, false);
            var globalMousePos=null, localMousePos=null, stageWorldMousePos = null;
            var drawingCanvas = this._selectedSubpath.getCanvas();
            if (!drawingCanvas){
                drawingCanvas = this.application.ninja.currentDocument.model.documentRoot; //ViewUtils.getStageElement();
                stageWorldMousePos = hitRec.calculateStageWorldPoint();
                stageWorldMousePos[0]+= snapManager.getStageWidth()*0.5;
                stageWorldMousePos[1]+= snapManager.getStageHeight()*0.5;
                localMousePos = stageWorldMousePos; //since the subpath points are in stage world space, set the 'localMousePos' to be stage world as well
            }
            else {
                globalMousePos = hitRec.getScreenPoint();
                localMousePos = ViewUtils.globalToLocal(globalMousePos, drawingCanvas);
            }


            if (this._isDrawing) {
                //if there is a selected subpath with a selected anchor point
                if (this._selectedSubpath.getSelectedAnchorIndex() >= 0 && this._selectedSubpath.getSelectedAnchorIndex() < this._selectedSubpath.getNumAnchors()) {
                    //compute the translation from the selected anchor
                    var selAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                    var selAnchorPos = selAnchor.getAllPos();
                    var localTranslation = VecUtils.vecSubtract(3, localMousePos, selAnchorPos[1]);

                    if (this._editMode & this.EDIT_ANCHOR) {
                        selAnchor.translateAll(localTranslation[0], localTranslation[1], localTranslation[2]);
                    }
                    else if (this._editMode & this.EDIT_PREV) {
                        localTranslation = VecUtils.vecSubtract(3, localMousePos, selAnchorPos[0]);
                        selAnchor.translatePrev(localTranslation[0], localTranslation[1], localTranslation[2]);
                        if (!this._isAltDown){
                            selAnchor.translateNextFromPrev(localTranslation[0], localTranslation[1], localTranslation[2]);
                            //selAnchor.setNextFromPrev();
                        }
                    }
                    else if (this._editMode & this.EDIT_NEXT) {
                        localTranslation = VecUtils.vecSubtract(3, localMousePos, selAnchorPos[2]);
                        //move the prev point if Alt key is down to ensure relative angle between prev and next
                        selAnchor.translateNext(localTranslation[0], localTranslation[1], localTranslation[2]);
                        if (!this._isAltDown){
                            selAnchor.translatePrevFromNext(localTranslation[0], localTranslation[1], localTranslation[2]);
                            //selAnchor.setPrevFromNext();
                        }
                    }
                    else if (this._editMode & this.EDIT_PREV_NEXT) {
                        localTranslation = VecUtils.vecSubtract(3, localMousePos, selAnchorPos[2]);
                        selAnchor.translateNext(localTranslation[0], localTranslation[1], localTranslation[2]);
                        selAnchor.setPrevFromNext();
                    }

                    //snapping...check if the new location of the anchor point is close to another anchor point
                    var selX = selAnchor.getPosX();
                    var selY = selAnchor.getPosY();
                    var selZ = selAnchor.getPosZ();
                    this._snapTargetIndex = -1;
                    var numAnchors = this._selectedSubpath.getNumAnchors();
                    for (var i = 0; i < numAnchors; i++) {
                        //check if the selected anchor is close to any other anchors
                        if (i === this._selectedSubpath.getSelectedAnchorIndex())
                            continue;
                        var currAnchor = this._selectedSubpath.getAnchor(i);
                        var distSq = currAnchor.getDistanceSq(selX, selY, selZ);
                        if (distSq < this._PICK_POINT_RADIUS * this._PICK_POINT_RADIUS) {
                            //set the snap target to the location of the first close-enough anchor
                            this._snapTargetIndex = i;
                            break;
                        }
                    }

                    //make the subpath dirty so it will get re-drawn
                    this._selectedSubpath.makeDirty();
                    this.DrawSubpathOnStage(this._selectedSubpath);
                }
            } else { //if mouse is not down:
                var selAnchorAndParamAndCode = this._selectedSubpath.pickPath(localMousePos[0], localMousePos[1], localMousePos[2], this._PICK_POINT_RADIUS, true);
                if (selAnchorAndParamAndCode[0] >=0){ //something on the path was hit
                    if ((selAnchorAndParamAndCode[2] & this._selectedSubpath.SEL_ANCHOR)
                        || (selAnchorAndParamAndCode[2] & this._selectedSubpath.SEL_PREV)
                        || (selAnchorAndParamAndCode[2] & this._selectedSubpath.SEL_NEXT))
                    { //the anchor was hit
                        this._hoveredAnchorIndex = selAnchorAndParamAndCode[0];
                        var lastAnchorIndex = this._selectedSubpath.getNumAnchors()-1;
                        var cursor;
                        if (this._subtool===this.SUBTOOL_NONE){
                            cursor = "url('images/cursors/penCursors/Pen_anchorSelect.png') 5 1, default";
                            if (this._selectedSubpath.getIsClosed()===false){
                                if (this._entryEditMode === this.ENTRY_SELECT_PATH && !this._isPickedEndPointInSelectPathMode && (this._hoveredAnchorIndex===0 || this._hoveredAnchorIndex===lastAnchorIndex)){
                                    //if we're in SELECT_PATH mode, have not yet clicked on the end anchors,  AND we hovered over one of the end anchors
                                    cursor = "url('images/cursors/penCursors/Pen_append.png') 5 1, default";
                                } else if ( this._selectedSubpath.getSelectedAnchorIndex()===lastAnchorIndex && this._hoveredAnchorIndex===0)  {
                                    //if we've selected the last anchor and hover over the first anchor
                                    cursor = "url('images/cursors/penCursors/Pen_closePath.png') 5 1, default";
                                }
                            } //if path is not closed
                        } else if (this._subtool === this.SUBTOOL_PENMINUS && selAnchorAndParamAndCode[2] & this._selectedSubpath.SEL_ANCHOR){
                            cursor = "url('images/cursors/penCursors/Pen_minus.png') 5 1, default";
                        }
                        this.application.ninja.stage.drawingCanvas.style.cursor = cursor;
                    } else if (selAnchorAndParamAndCode[2] & this._selectedSubpath.SEL_PATH) {
                        //change the cursor only if we're not in pen-minus subtool
                        if (this._subtool!==this.SUBTOOL_PENMINUS){
                            var cursor = "url('images/cursors/penCursors/Pen_plus.png') 5 1, default";
                            this.application.ninja.stage.drawingCanvas.style.cursor = cursor;
                        }
                    }
                } //something on the path was hit
            } //mouse is not down

            //this.drawLastSnap();        // Required cleanup for both Draw/Feedbacks
            if (this._selectedSubpath){
                this.DrawSubpathAnchors(this._selectedSubpath);
            }

        }//value: function(event)
    },//HandleMouseMove


    ShowSelectedSubpath:{
        value: function() {
            if (this._selectedSubpath){
                //assume that we have already called PrepareSelectedSubpathForRendering on this
                //build the width and height of this canvas by looking at the bounding box
                var bboxMin = this._selectedSubpath.getBBoxMin();
                var bboxMax = this._selectedSubpath.getBBoxMax();
                var bboxWidth = bboxMax[0] - bboxMin[0];
                var bboxHeight = bboxMax[1] - bboxMin[1];

                //call render shape with the bbox width and height
                this.RenderShape(bboxWidth, bboxHeight, this._selectedSubpathCanvasCenter, this._selectedSubpathPlaneMat, this._selectedSubpathCanvas);
            }
        }
    },

    RenderShape: {
        value: function (w, h, midPt, planeMat, canvas) {
            if ((Math.floor(w) === 0) || (Math.floor(h) === 0)) {
                return;
            }

            w = Math.round(w);
            h = Math.round(h);
            var left = Math.round(midPt[0] - 0.5 * w);
            var top = Math.round(midPt[1] - 0.5 * h);

            if (!canvas) {
                this._doesSelectionChangeNeedHandling = false; //this will ignore the selection change event triggered by the new canvas
                var newCanvas = document.application.njUtils.make("canvas", {"data-RDGE-id": NJUtils.generateRandom()}, this.application.ninja.currentDocument);
                var styles = document.application.njUtils.stylesFromDraw(newCanvas, parseInt(w), parseInt(h), {midPt: midPt, planeMat: planeMat});
                this.application.ninja.elementMediator.addElements(newCanvas, styles, false);

                // create all the GL stuff
                var world = this.getGLWorld(newCanvas, this._useWebGL);//this.options.use3D);//this.CreateGLWorld(planeMat, midPt, newCanvas, this._useWebGL);//fillMaterial, strokeMaterial);
                //store a reference to this newly created canvas
                this._selectedSubpathCanvas = newCanvas;
                this._selectedSubpathPlaneMat = ElementMediator.getMatrix(newCanvas);

                var subpath = this._selectedSubpath; //new GLSubpath();
                subpath.setWorld(world);
                subpath.setCanvas(newCanvas);

                world.addObject(subpath);
                world.render();
                //TODO this will not work if there are multiple shapes in the same canvas
                newCanvas.elementModel.shapeModel.GLGeomObj = subpath;
                newCanvas.elementModel.isShape = true;
                newCanvas.elementModel.shapeModel.shapeCount++;
                if(newCanvas.elementModel.shapeModel.shapeCount === 1)
                {
                    newCanvas.elementModel.selection = "Subpath";
                    newCanvas.elementModel.pi = "SubpathPi";
                    newCanvas.elementModel.shapeModel.strokeSize = this.options.strokeSize.value + " " + this.options.strokeSize.units;
                    var strokeColor = subpath.getStrokeColor();
                    newCanvas.elementModel.shapeModel.stroke = strokeColor;
                    if(strokeColor) {
                        newCanvas.elementModel.shapeModel.border = this.options.stroke;
                    }
                    newCanvas.elementModel.shapeModel.GLGeomObj = subpath;
                    newCanvas.elementModel.shapeModel.useWebGl = false;//this.options.use3D;
                }
                else
                {
                    // TODO - update the shape's info only.  shapeModel will likely need an array of shapes.
                }

                //now send the event that will add this canvas to the timeline
                NJevent("elementAdded", newCanvas);

                if(newCanvas.elementModel.isShape)
                {
                    this._doesSelectionChangeNeedHandling = false; //this will ignore the selection change event triggered by the new canvas
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

                    ElementMediator.setProperty(canvasArray, "width", [w+"px"], "Changing", "penTool");//canvas.width = w;
                    ElementMediator.setProperty(canvasArray, "height", [h+"px"], "Changing", "penTool");//canvas.height = h;
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

                if(canvas.elementModel.isShape)
                {
                    this._doesSelectionChangeNeedHandling = false; //this will ignore the selection change event triggered by the canvas
                    this.application.ninja.selectionController.selectElement(canvas);
                }
            } //else of if (!canvas) {
        } //value: function (w, h, planeMat, midPt, canvas) {
    }, //RenderShape: {



    // **********************************************************************************************************
    //  Mouse up handler
    //  Check if the selected anchor point of the selected subpath should be snapped to another anchor point
    //      (also sets open subpaths closed if appropriate)
    //  IF the selected subpath does not have a canvas
    //
    //  Draw the selected subpath anchors and the selected subpath itself in the stage's context
    // **********************************************************************************************************
    HandleLeftButtonUp: {
        value: function (event) {
            this._isDrawing = false;
            //do nothing in case of pen minus tool
            if (this._subtool===this.SUBTOOL_PENMINUS){
                return;
            }

            // ******************** snapping ***********************
            //  if there was a snapTarget and a selected anchor, move the anchor to the snap target
            if (this._snapTargetIndex !== -1 && this._selectedSubpath && this._selectedSubpath.getSelectedAnchorIndex() !== -1) {
                var selAnchor = this._selectedSubpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                var snapAnchor = this._selectedSubpath.getAnchor(this._snapTargetIndex);
                selAnchor.setPos(snapAnchor.getPosX(), snapAnchor.getPosY(), snapAnchor.getPosZ());
                this._selectedSubpath.makeDirty();

                //if the first or last anchor point were snapped for an open path, set the first and last anchor point to the same position
                if (!this._selectedSubpath.getIsClosed()) {
                    var lastAnchorIndex = this._selectedSubpath.getNumAnchors() - 1;
                    var firstAnchor = this._selectedSubpath.getAnchor(0);
                    var lastAnchor = this._selectedSubpath.getAnchor(lastAnchorIndex);
                    if ((this._selectedSubpath.getSelectedAnchorIndex() === 0 && this._snapTargetIndex === lastAnchorIndex)     //if the first anchor was snapped to the last
                        || (this._selectedSubpath.getSelectedAnchorIndex() === lastAnchorIndex && this._snapTargetIndex === 0)) //OR if the last anchor was snapped to the first
                    {
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
                        //mark the path as closed...note that this flag should be set after the removeAnchor call above
                        //  (the removeAnchor call may set the closed flag to be false)
                        this._selectedSubpath.setIsClosed(true);
                    }
                }
            }
            this._snapTargetIndex = -1;

            //if we have some samples to render...
            if (this._selectedSubpath && this._selectedSubpath.getNumAnchors() > 1) {
                //prepare the selected subpath for rendering
                this.PrepareSelectedSubpathForRendering();
                this.ShowSelectedSubpath();
            } //if (this._selectedSubpath.getNumPoints() > 0) {


            //always assume that we're not starting a new path anymore
            this._isNewPath = false;
            this._editMode = this.EDIT_NONE;

            //if we're not in edit_path mode and we closed the selected subpath, then we are going to start a new subpath, so we nullify the selected subpath
            //if (this._selectedSubpath && this._selectedSubpath.getIsClosed() && this._entryEditMode !== this.ENTRY_SELECT_PATH){
            //    this._selectedSubpath = null;
            //}

            if (this._selectedSubpath){
                this.DrawSubpathAnchors(this._selectedSubpath);//render the subpath anchors on canvas
            }else{
                //clear the canvas
                this.application.ninja.stage.clearDrawingCanvas();
            }

            if (!this._trackMouseMoveWhenUp){
                NJevent("disableStageMove");
            }
            this._hoveredAnchorIndex = -1;


        }
    },

    //prepare the selected subpath
    //  compute the center of the future canvas of this subpath in stage world space
    //  compute local coordinates for the subpath (in case it does not have a canvas)
    PrepareSelectedSubpathForRendering: {
        value: function(){
            var i=0,d=0;
            var currAnchor = null;
            var xAdjustment = snapManager.getStageWidth()*0.5;
            var yAdjustment = snapManager.getStageHeight()*0.5;
            var swPos=null, swPrev=null, swNext=null;
            var localPos=null, localPrev=null, localNext=null;

            var numAnchors = this._selectedSubpath.getNumAnchors();
            if (numAnchors<2){
                return;//nothing to do
            }
            this._selectedSubpath.makeDirty();

            var bboxMin=null, bboxMax=null;
            if (this._selectedSubpathCanvas) {
                //if there already is a subpath canvas, it means the anchor points are in local space
                //  so convert them to stage world space
                //compute the bbox in local space
                this._selectedSubpath.createSamples(false);
                bboxMin = this._selectedSubpath.getBBoxMin();
                bboxMax = this._selectedSubpath.getBBoxMax();

                // *********** Test for Too Large Canvas *************
                //check if the last point added made this canvas is now bigger than the max canvas size
                var canvasTooLarge = false;
                for (d=0;d<3;d++){
                    if (bboxMax[d]-bboxMin[d]>this._MAX_CANVAS_DIMENSION){
                        canvasTooLarge = true;
                        break;
                    }
                }
                if (canvasTooLarge){
                    console.log("PEN: Warning! Ignoring last added point because canvas size too large");
                    this._selectedSubpath.removeAnchor(numAnchors-1);
                    numAnchors--;

                    //recompute the bbox of this subpath
                    this._selectedSubpath.createSamples(false);
                    bboxMin = this._selectedSubpath.getBBoxMin();
                    bboxMax = this._selectedSubpath.getBBoxMax();
                }

                //convert the midpoint of this bbox to stage world space
                var bboxMid = VecUtils.vecInterpolate(3, bboxMin, bboxMax, 0.5);

                //sandwich the planeMat between with the translation to the previous center of the canvas in local space and its inverse
                var centerDisp = VecUtils.vecSubtract(3, bboxMid, this._selectedSubpath.getCanvasCenterLocalCoord());
                var tMat = Matrix.Translation([centerDisp[0], centerDisp[1],centerDisp[2]]);
                var tInvMat = Matrix.Translation([-centerDisp[0], -centerDisp[1], -centerDisp[2]]);
                var newMat = Matrix.I(4);
                this._selectedSubpathPlaneMat = ElementMediator.getMatrix(this._selectedSubpathCanvas);
                glmat4.multiply( tInvMat, this._selectedSubpathPlaneMat, newMat);
                glmat4.multiply( newMat, tMat, newMat);
                this._selectedSubpathPlaneMat = newMat;
                ViewUtils.setMatrixForElement(this._selectedSubpathCanvas, newMat, true);

                //now set the center of the canvas as the center of the bounding box expressed in stage world coordinates
                var localToStageWorldMat = ViewUtils.getLocalToStageWorldMatrix(this._selectedSubpathCanvas, false, false);
                this._selectedSubpathCanvasCenter = MathUtils.transformAndDivideHomogeneousPoint(bboxMid, localToStageWorldMat);
                this._selectedSubpathCanvasCenter[0]+= xAdjustment;
                this._selectedSubpathCanvasCenter[1]+= yAdjustment;

            } else {
                //compute the bbox in stage-world space (the points are already in stage world space)
                this._selectedSubpath.createSamples(true);
                bboxMin = this._selectedSubpath.getBBoxMin();
                bboxMax = this._selectedSubpath.getBBoxMax();
                this._selectedSubpathCanvasCenter = VecUtils.vecInterpolate(3, bboxMin, bboxMax, 0.5);

                //convert the path points into local coordinates by multiplying by the inverse of the plane mat
                for (i=0;i<numAnchors;i++) {
                    currAnchor = this._selectedSubpath.getAnchor(i);
                    swPos = [currAnchor.getPosX()-xAdjustment,currAnchor.getPosY()-yAdjustment,currAnchor.getPosZ()];
                    swPrev = [currAnchor.getPrevX()-xAdjustment,currAnchor.getPrevY()-yAdjustment,currAnchor.getPrevZ()];
                    swNext = [currAnchor.getNextX()-xAdjustment,currAnchor.getNextY()-yAdjustment,currAnchor.getNextZ()];
                    var planeMatInv = glmat4.inverse(this._selectedSubpathPlaneMat, []);
                    localPos = MathUtils.transformAndDivideHomogeneousPoint(swPos, planeMatInv);
                    localPrev = MathUtils.transformAndDivideHomogeneousPoint(swPrev, planeMatInv);
                    localNext = MathUtils.transformAndDivideHomogeneousPoint(swNext, planeMatInv);
                    currAnchor.setPos(localPos[0],localPos[1],localPos[2]);
                    currAnchor.setPrevPos(localPrev[0],localPrev[1],localPrev[2]);
                    currAnchor.setNextPos(localNext[0],localNext[1],localNext[2]);
                }
            }

            this._selectedSubpath.makeDirty();
            this._selectedSubpath.createSamples(false);
            this._selectedSubpath.offsetPerBBoxMin();

            //compute and store the center of the bbox in local space
            bboxMin = this._selectedSubpath.getBBoxMin();
            bboxMax = this._selectedSubpath.getBBoxMax();
            this._selectedSubpath.setCanvasCenterLocalCoord(VecUtils.vecInterpolate(3, bboxMin, bboxMax, 0.5));
        }
    },

    //perform the inverse of the perspective scaling performed by the browser
    //  (currently unused function)
    _unprojectPt: {
        value: function(pt, pespectiveDist) {
            var retPt = pt.slice(0);
            if (MathUtils.fpCmp(pespectiveDist,-pt[2]) !== 0){
                z = pt[2]*pespectiveDist/(pespectiveDist + pt[2]);
                var x = pt[0]*(pespectiveDist - z)/pespectiveDist,
                    y = pt[1]*(pespectiveDist - z)/pespectiveDist;
                retPt[0] = x;  retPt[1] = y;  retPt[2] = z;
            }
            return retPt;
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
            this._selectedSubpathCanvas = null;
            this._selectedSubpathPlaneMat = null;
            this._snapTargetIndex = -1;
            this._selectedSubpath = null;
            if (this._entryEditMode === this.ENTRY_SELECT_PATH){
                this._entryEditMode = this.ENTRY_SELECT_NONE;
            }
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
            if (this._selectedSubpath && this._selectedSubpath.getNumAnchors()>1 && this._selectedSubpath.getSelectedAnchorIndex() !== -1) {
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
                this._selectedSubpath.createSamples(false);
                this.PrepareSelectedSubpathForRendering();
                this.ShowSelectedSubpath();

                //clear the canvas before we draw anything else
                this.application.ninja.stage.clearDrawingCanvas();//stageManagerModule.stageManager.clearDrawingCanvas();

                this.DrawSubpathAnchors(this._selectedSubpath);
            } //if (this._selectedSubpath && this._selectedSubpath.getSelectedAnchorIndex() !== -1)

        } //value: function () {
    }, //HandleDoubleClick: {


    // DrawSubpathOnStage
    //  Draw the subpath using the canvas drawing capability
    DrawSubpathOnStage:
    {
        value: function (subpath) {
            if (subpath === null)
                return;

            subpath.createSamples(false); //dirty bit will be checked inside this function
            var numAnchors = subpath.getNumAnchors();
            if (numAnchors < 2)
                return;

            var ctx = this.application.ninja.stage.drawingContext;
            if (ctx === null)
                throw ("null drawing context in Pentool::DrawSubpathOnStage");
            ctx.save();

            var widthAdjustment = 0;
            var heightAdjustment = 0;
            var localToGlobalMat;
            var pathCanvas = this._selectedSubpathCanvas;
            if (pathCanvas){
                //convert from local coord to global (screen) coord
                localToGlobalMat = ViewUtils.getLocalToGlobalMatrix(pathCanvas);
            } else {
                //in case the selected subpath has not been prepared for rendering
                // (i.e. there are only two anchors and no subpath canvas),
                // use the stage to world to transform the anchor points
                widthAdjustment = -snapManager.getStageWidth()*0.5;
                heightAdjustment = -snapManager.getStageHeight()*0.5;
                localToGlobalMat = ViewUtils.getStageWorldToGlobalMatrix();
            }

            var prevAnchor = subpath.getAnchor(0);
            var c0=[0,0,0], c1=[0,0,0],c2=[0,0,0], c3=[0,0,0]; //screen coord of the bezier control points
            c0 =[prevAnchor.getPosX()+widthAdjustment,prevAnchor.getPosY()+heightAdjustment,prevAnchor.getPosZ()];
            c0 = MathUtils.transformAndDivideHomogeneousPoint(c0,localToGlobalMat); //convert from local coord to global (screen) coord

            ctx.lineWidth = 1;
            ctx.strokeStyle = "green";

            ctx.beginPath();
            ctx.moveTo(c0[0],c0[1]);
            var currAnchor = null;
            var numBezierCurves = numAnchors;
            if (subpath.getIsClosed()){
                numBezierCurves+=1;
            }

            for (i = 1; i < numBezierCurves; i++) {
                currAnchor = subpath.getAnchor(i%numAnchors);

                c1 = [prevAnchor.getNextX()+widthAdjustment,prevAnchor.getNextY()+heightAdjustment,prevAnchor.getNextZ()];
                c1 = MathUtils.transformAndDivideHomogeneousPoint(c1,localToGlobalMat);

                c2 = [currAnchor.getPrevX()+widthAdjustment, currAnchor.getPrevY()+heightAdjustment,currAnchor.getPrevZ()];
                c2 = MathUtils.transformAndDivideHomogeneousPoint(c2,localToGlobalMat);

                c3 = [currAnchor.getPosX()+widthAdjustment,currAnchor.getPosY()+heightAdjustment, currAnchor.getPosZ()];
                c3 = MathUtils.transformAndDivideHomogeneousPoint(c3,localToGlobalMat);

                ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], c3[0], c3[1]);
                prevAnchor = currAnchor;
            }
            ctx.stroke();
            ctx.restore();
        } //function (subpath)
    },  //DrawSubpathOnStage

    DrawSubpathAnchors:
    {
        value: function (subpath) {
            if (subpath === null)
                return;
            var numAnchors = subpath.getNumAnchors();
            if (numAnchors === 0)
                return;

            var ctx = this.application.ninja.stage.drawingContext;
            if (ctx === null){
                throw ("null drawing context in Pentool::DrawSelectedSubpathAnchors");
            }
            ctx.save();

            var widthAdjustment = 0;
            var heightAdjustment = 0;
            var localToGlobalMat;
            var pathCanvas = this._selectedSubpathCanvas;
            if (pathCanvas){
                //convert from local coord to global (screen) coord
                localToGlobalMat = ViewUtils.getLocalToGlobalMatrix(pathCanvas);
            } else {
                //in case the selected subpath has not been prepared for rendering
                // (i.e. there are only two anchors and no subpath canvas),
                // use the stage to world to transform the anchor points
                widthAdjustment = -snapManager.getStageWidth()*0.5;
                heightAdjustment = -snapManager.getStageHeight()*0.5;
                localToGlobalMat = ViewUtils.getStageWorldToGlobalMatrix();
            }


            //display circles and squares near all control points
            ctx.fillStyle = "#FFFFFF";
            ctx.lineWidth = 1;
            ctx.strokeStyle = "green";
            var anchorDelta = 2;
            var selAnchorDelta = 4;
            var px=0,py=0;
            var sp=[0,0,0];
            var currAnchor = null, currAnchorPos=null;
            for (var i = 0; i < numAnchors; i++) {
                currAnchor = subpath.getAnchor(i);
                currAnchorPos = currAnchor.getAllPos();
                currAnchorPos[1][0]+=widthAdjustment; currAnchorPos[1][1]+=heightAdjustment;
                sp = MathUtils.transformAndDivideHomogeneousPoint(currAnchorPos[1],localToGlobalMat); //convert from local coord to global (screen) coord
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
                currAnchorPos = currAnchor.getAllPos();
                currAnchorPos[1][0]+=widthAdjustment; currAnchorPos[1][1]+=heightAdjustment;
                sp = MathUtils.transformAndDivideHomogeneousPoint(currAnchorPos[1],localToGlobalMat); //convert from local coord to global (screen) coord
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
            if (subpath === this._selectedSubpath && this._selectedSubpath.getSelectedAnchorIndex()!== -1) {
                ctx.lineWidth = 1;
                var defFill = "#FFFFFF";
                var defStroke = "green";
                var selHandleFill = "#000000"

                ctx.strokeStyle = defStroke;
                ctx.fillStyle = defFill;
                var whichPoint = this._selectedSubpath.getSelectedMode(); //which of the selected handles to highlight

                currAnchor = subpath.getAnchor(this._selectedSubpath.getSelectedAnchorIndex());
                currAnchorPos = currAnchor.getAllPos();
                currAnchorPos[1][0]+=widthAdjustment; currAnchorPos[1][1]+=heightAdjustment;
                currAnchorPos[0][0]+=widthAdjustment; currAnchorPos[0][1]+=heightAdjustment;
                currAnchorPos[2][0]+=widthAdjustment; currAnchorPos[2][1]+=heightAdjustment;
                sp = MathUtils.transformAndDivideHomogeneousPoint(currAnchorPos[1],localToGlobalMat);
                var posX = sp[0]; var posY=sp[1];

                sp = MathUtils.transformAndDivideHomogeneousPoint(currAnchorPos[0],localToGlobalMat);
                var prevX = sp[0]; var prevY=sp[1];

                sp = MathUtils.transformAndDivideHomogeneousPoint(currAnchorPos[2],localToGlobalMat);
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
                px = posX;
                py = posY;
                ctx.beginPath();
                ctx.moveTo(px-selAnchorDelta, py-selAnchorDelta);
                ctx.lineTo(px+selAnchorDelta, py-selAnchorDelta);
                ctx.lineTo(px+selAnchorDelta, py+selAnchorDelta);
                ctx.lineTo(px-selAnchorDelta, py+selAnchorDelta);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                //display the snap target if it isn't null
                if (this._snapTargetIndex>=0) {
                    currAnchor = subpath.getAnchor(this._snapTargetIndex);
                    currAnchorPos = currAnchor.getAllPos();
                    currAnchorPos[1][0]+=widthAdjustment; currAnchorPos[1][1]+=heightAdjustment;
                    sp = MathUtils.transformAndDivideHomogeneousPoint(currAnchorPos[1],localToGlobalMat);
                    px = sp[0]; py=sp[1];

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
            } //if subpath === this._selectedSubpath && this._selectedSubpath.getSelectedAnchorIndex()!== -1

            ctx.restore();
        } //value: function() {
    }, //DrawSubpathAnchors {

    deselectPenTool:{
        value: function() {
            this._selectedSubpath = null;
            this._selectedSubpathCanvas = null;
            this._selectedSubpathPlaneMat = null;
            this._snapTargetIndex = -1;
            //clear the canvas
            this.application.ninja.stage.clearDrawingCanvas();
        }
    },
    //if the document is opened with the pen tool being active, we do the same thing as when configure(false) is called
    handleOpenDocument: {
        value: function() {
            this.deselectPenTool();
            //clear the canvas
            this.application.ninja.stage.clearDrawingCanvas();
        }
    },
    //if the document is switched with the pen tool being active, we do the same thing as when configure(false) is called
    handleSwitchDocument: {
        value: function() {
            this.deselectPenTool();
            //clear the canvas
            this.application.ninja.stage.clearDrawingCanvas();
        }
    },
    //if the document is closed with the pen tool being active, we do the same thing as when configure(false) is called
    handleCloseDocument: {
        value: function() {
            this.deselectPenTool();
            //clear the canvas
            this.application.ninja.stage.clearDrawingCanvas();
        }
    },

    Configure: {
        value: function (wasSelected) {
            if (wasSelected) {
                //first nullify any set values
                this.deselectPenTool();

                defaultEventManager.addEventListener("resetPenTool", this, false);
                this.application.ninja.elementMediator.deleteDelegate = this;
                this.application.ninja.stage.drawingCanvas.style.cursor = //"auto";
                    "url('images/cursors/penCursors/Pen_newPath.png') 5 1, default";

                //TODO in case of switching between docs, this call to setEntryMode may refer to the old document,
                //   which is why we set the _doesSelectionChangeNeedHandling flag next
                this.setEntryMode();
                this._doesSelectionChangeNeedHandling = true; //this will make sure that the setEntry mode gets called by the selectionChange handler
                /*if (this.application.ninja.selectedElements.length === 0){
                    this._entryEditMode = this.ENTRY_SELECT_NONE;
                }

                else{
                    for (var i=0;i<this.application.ninja.selectedElements.length;i++){
                        var element = this.application.ninja.selectedElements[i];
                        //console.log("Entered pen tool, had selected: " + element.elementModel.selection);
                        if (element.elementModel.selection === 'Subpath'){ //TODO what to do if the canvas is drawn by tag tool?
                            //set the pen canvas to be the selected canvas
                            this._selectedSubpathCanvas = this.application.ninja.selectedElements[i];

                            // get the subpath for this world
                            this._selectedSubpath = null;
                            this._entryEditMode = this.ENTRY_SELECT_CANVAS; //by default, we're in this mode...change if we find a subpath contained in this canvas
                            var world = ElementMediator.getShapeProperty(this._selectedSubpathCanvas, "GLWorld");
                            if (world === null){
                                throw("Pen tool configure did not work correctly");
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
                                    this._selectedSubpath.deselectAnchorPoint();
                                    this.DrawSubpathAnchors(this._selectedSubpath);

                                    //get the selected subpath properties
                                    this._selectedSubpathCanvas = element;
                                    this._selectedSubpathPlaneMat = ElementMediator.getMatrix(element);
                                }
                            }
                            break; //assume that we want to edit only the first subpath found in the selected canvases
                        } else {
                            this._entryEditMode = this.ENTRY_SELECT_NONE;
                        }
                    }
                }
                this._isPickedEndPointInSelectPathMode = false; //only applies to the ENTRY_SELECT_PATH mode
                */

                this.handlePenSubToolChange();
                //this._subtool = this.SUBTOOL_NONE; //this.SUBTOOL_PENMINUS;

                if (this._trackMouseMoveWhenUp){
                    NJevent("enableStageMove");
                }
                this.eventManager.addEventListener("openDocument", this, false);
                this.eventManager.addEventListener("switchDocument", this, false);
                this.eventManager.addEventListener("closeDocument", this, false);
                this.eventManager.addEventListener("penSubToolChange", this, false);
                this.eventManager.addEventListener("selectionChange", this, false);

            } //if the pen tool was selected
            else {
                if (this._trackMouseMoveWhenUp){
                    NJevent("disableStageMove");
                }
                this.deselectPenTool();

                defaultEventManager.removeEventListener("resetPenTool", this, false);
                this.application.ninja.elementMediator.deleteDelegate = null;

                this.eventManager.removeEventListener("openDocument", this, false);
                this.eventManager.removeEventListener("switchDocument", this, false);
                this.eventManager.removeEventListener("closeDocument", this, false);
                this.eventManager.removeEventListener("penSubToolChange", this, false);
                this.eventManager.removeEventListener("selectionChange", this, false);
                this._doesSelectionChangeNeedHandling = false;
            } //if the pen tool was de-selected
        }
    },

    handleSelectionChange: {
        value: function(){
            if (this._doesSelectionChangeNeedHandling){
                this.setEntryMode();
            }
            this._doesSelectionChangeNeedHandling = false;
        }
    },
    setEntryMode:{
        value: function(){
            if (this.application.ninja.selectedElements.length === 0){
                this._entryEditMode = this.ENTRY_SELECT_NONE;
                this._selectedSubpath = null;
            }
            else {
                for (var i=0;i<this.application.ninja.selectedElements.length;i++){
                    var element = this.application.ninja.selectedElements[i];
                    //console.log("Entered pen tool, had selected: " + element.elementModel.selection);
                    if (element.elementModel.selection === 'Subpath'){ //TODO what to do if the canvas is drawn by tag tool?
                        //set the pen canvas to be the selected canvas
                        this._selectedSubpathCanvas = this.application.ninja.selectedElements[i];

                        // get the subpath for this world
                        this._selectedSubpath = null;
                        this._entryEditMode = this.ENTRY_SELECT_CANVAS; //by default, we're in this mode...change if we find a subpath contained in this canvas
                        var world = ElementMediator.getShapeProperty(this._selectedSubpathCanvas, "GLWorld");
                        if (world === null){
                            throw("Pen tool handleSelectionChange did not work correctly");
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
                                this._selectedSubpath.deselectAnchorPoint();
                                this.DrawSubpathAnchors(this._selectedSubpath);

                                //get the selected subpath properties
                                this._selectedSubpathCanvas = element;
                                this._selectedSubpathPlaneMat = ElementMediator.getMatrix(element);
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
    },

    handlePenSubToolChange: {
        value: function() {
            switch (this.options.selectedSubtool){
                case "pen":
                    this._subtool = this.SUBTOOL_NONE;
                    break;

                case "penPlus":
                    this._subtool = this.SUBTOOL_PENPLUS;
                    break;

                case "penMinus":
                    this._subtool = this.SUBTOOL_PENMINUS;
                    break;

                default:
                    this._subtool = this.SUBTOOL_NONE;
                    break;
            }
        }
    },
    handleDelete:{
        value: function(event){
             //clear the selected subpath...the only new additions to this function w.r.t. ToolBase
             if (this._selectedSubpath){
                 if (this._selectedSubpath.getSelectedAnchorIndex()>=0){
                     this._removeSelectedAnchorPoint();
                 } else {
                     //remove the entire subpath and its canvas if no anchor was selected
                     this._removeSelectedSubpathAndCanvas(true);
                 }
             }
             else {
                //undo/redo...go through ElementMediator (see ElementMediator.handleDeleting() from where the much of this function is copied)
                //clear the canvas
                this.application.ninja.stage.clearDrawingCanvas();//stageManagerModule.stageManager.clearDrawingCanvas();
                var els = [];
                var len = this.application.ninja.selectedElements.length;
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
                    this._selectedSubpathCanvas = null;
                    this._selectedSubpathPlaneMat = null;
                    if (this._entryEditMode === this.ENTRY_SELECT_PATH){
                        this._entryEditMode = this.ENTRY_SELECT_NONE;
                    }
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

            this.Configure(true);
        }
    }

});
