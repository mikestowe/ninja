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

var Montage = require("montage/core/core").Montage,
    DrawingTool = require("js/tools/drawing-tool").DrawingTool,
    snapManager = require("js/helper-classes/3D/snap-manager").SnapManager,
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils,
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils;
//    Properties3D = ("js/models/properties-3d").Properties3D;

exports.ModifierToolBase = Montage.create(DrawingTool, {

    //-------------------------------------------------------------------------
    // Drawing Mode Info
    drawingFeedback: { value: { mode: "Draw3D", type: "rectangle" } },

    //-------------------------------------------------------------------------
    // Snapping-specific properties
    _canSnap: { value: true },
	_snapParam: { value: null },
	_snapIndex: { value: -1 },
	_useQuadPt: { value: false },
    _shouldUseQuadPt: { value: false },

	// we set snapping capabilities depending on the tool.
	// The following variables are set in a tool's initializeSnapping method called on mouse down.
	_snapToElements: { value: true },
	_snapToGrid: { value: true },

    _clickedObject : {value : null },
    clickedObject:
	{
		get: function () {
			return this._clickedObject;
		},
		set: function (value) {
			if(value === this.application.ninja.currentDocument.model.documentRoot)
			{
				this._clickedObject = this._target;
			}
			else
			{
				this._clickedObject = value;
			}

			if(value)
			{
				this._startMat = viewUtils.getMatrixFromElement(this._clickedObject);
			}
			else
			{
				this._startMat = null;
			}
		}
	},
    
    _getObjectBeingTracked :
    {
        value: function(hitRec)
        {
            var elt = hitRec.getElt();
            if(elt === this.application.ninja.currentDocument.model.documentRoot)
            {
                elt = this._target;
            }

            return elt;
        }
    },

    drawWithoutSnapping:
    {
        value: function(event)
        {
            // override in subclasses
        }
    },
    
    initializeSnapping:
    {
        value: function(event)
        {
            this._mouseDownHitRec = null;
			this._mouseUpHitRec   = null;

			snapManager.clearAvoidList();
			snapManager.clearDragPlane();

			// the translate tool does snap align to the bounds of the object only.
			// turn off snap align to the cursor.  This needs to be re-enabled in the mouse up method
			snapManager.enableSnapAlign( false );

			// snap to element and snap to grid are conditionally enabled based
			// on the snap results of the mouse down.  enable everything for the first snap
			this._snapToElements = snapManager.elementSnapEnabledAppLevel();
			this._snapToGrid = snapManager.gridSnapEnabledAppLevel();

            this._dragPlane = null;
            var do3DSnap = true;

//            if(this._handleMode === null)
//            {
//                if(!this._activateOriginHandle)
//                {
//                    this.doSelection(event);

                    snapManager.enableElementSnap	( true	);
//                    snapManager.enableGridSnap		( true	);
//                }
//            }
//            else
//            {
//                this._matL = this._handles[this._handleMode]._matL.slice(0);
//                this._planeEq = this._handles[this._handleMode]._planeEq.slice(0);
//                this._dirVecL = this._handles[this._handleMode]._dirVecL.slice(0);
//                this.m_startPoint = MathUtils.getLocalPoint(event.layerX, event.layerY, this._planeEq, this._matL);
//                if(!this.m_startPoint)
//                {
//                    this.m_startPoint = [this.m_xStart, this.m_yStart];
//                }
//            }

            if(this.application.ninja.selectedElements.length)
            {
                var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                                new WebKitPoint(event.pageX, event.pageY));
				// do the snap before setting up the avoid list to allow
				// a snap on the mouse down
				var hitRec = snapManager.snap(point.x, point.y, do3DSnap);

                // TODO - Check that hitRec's element matches element that browser says we clicked on
                var elt = this.application.ninja.stage.getElement(event, true);
                if(elt !== hitRec.getElement())
                {
                    hitRec = snapManager.findHitRecordForElement(elt);
                }

                // we don't want to snap to selected objects during the drag
                this.application.ninja.selectedElements.forEach(function(element) {
                    snapManager.addToAvoidList(element);
                });

				if (hitRec)
				{
					// disable snap attributes
					if (hitRec.getType() == hitRec.SNAP_TYPE_ELEMENT)
					{
						this._snapToElements = false;
						this._snapToGrid = false;
					}
					else if (hitRec.getType() == hitRec.SNAP_TYPE_ELEMENT_CENTER)
					{
						snapManager.enableSnapAlign( snapManager.snapAlignEnabledAppLevel() );
					}

					// parameterize the snap point on the target
					this._snapParam = this.parameterizeSnap( hitRec );

                    if(!this._dragPlane)
                    {
                        if((this._handleMode !== null) && (this.application.ninja.toolsData.selectedTool.action === "SelectionTool"))
                        {
                            this._dragPlane = viewUtils.getUnprojectedElementPlane(this.application.ninja.selectedElements[0]);
                            snapManager.setupDragPlaneFromPlane(this._dragPlane);
                        }
                        else
                        {
                            this._dragPlane = snapManager.setupDragPlanes( hitRec, true );
                        }
                    }

                    // only do quadrant snapping if the 4 corners of the element are in the drag plane
                    var sign = MathUtils.fpSign( vecUtils.vecDot(3,this._dragPlane,[0,0,1]) + this._dragPlane[3] - 1.0);
                    this._shouldUseQuadPt = (sign == 0)

					var wpHitRec = hitRec.convertToWorkingPlane( this._dragPlane );
					this._mouseDownHitRec = wpHitRec;
					this._mouseUpHitRec = null;

					var pt = hitRec.getScreenPoint();
					this.downPoint.x = pt[0];
					this.downPoint.y = pt[1];

                    snapManager.drawLastHit();

                    snapManager.enableSnapAlign( snapManager.snapAlignEnabledAppLevel() );
                    snapManager.enableElementSnap( snapManager.elementSnapEnabledAppLevel() );
                    snapManager.enableGridSnap( snapManager.gridSnapEnabledAppLevel() );
				}
            }
            else
            {
                this.target = null;
            }
        }
    },
    
  	/*
	 *  The parameterization is based on the position of the
	 *  snap point in pre-transformed element screen space
	 */
	parameterizeSnap:
	{
		value: function( hitRec )
		{
			var paramPt = [0,0,0];
            var elt = this._getObjectBeingTracked(hitRec);
			if (elt)
			{
                this.clickedObject = elt;

                var worldPt = hitRec.calculateStageWorldPoint();
                MathUtils.makeDimension4( worldPt );
                var mat = viewUtils.getObjToStageWorldMatrix( elt, true );
                if(mat)
                {
                    var invMat = glmat4.inverse(mat, []);
                    var scrPt = MathUtils.transformHomogeneousPoint( worldPt, invMat );
                    scrPt = MathUtils.applyHomogeneousCoordinate( scrPt );

					var bounds = viewUtils.getElementViewBounds3D( elt );
					var x0 = bounds[0][0],  x1 = bounds[3][0],
						y0 = bounds[0][1],  y1 = bounds[1][1];
					var dx = x1 - x0,   dy = y1 - y0;
					var u = 0, v = 0;
					if (MathUtils.fpSign(dx) != 0)
						u = (scrPt[0] - x0) / dx;
					if (MathUtils.fpSign(dy) != 0)
						v = (scrPt[1] - y0) / dy;

					paramPt[0] = u;
					paramPt[1] = v;
					paramPt[2] = scrPt[2];
				}
			}

            //console.log( "ParameterizeSnap: " + paramPt );
			return paramPt;
		}
	},


    GetObjectHitPoint :
	{
		value: function()
		{
			var scrPt;
			var elt = this._clickedObject;
			if (elt)
			{
				var bounds = viewUtils.getElementViewBounds3D( elt );
				var x0 = bounds[0][0],  x1 = bounds[3][0],
					y0 = bounds[0][1],  y1 = bounds[1][1];
				var dx = x1 - x0,   dy = y1 - y0;

				var x = x0 + this._snapParam[0]*dx,
					y = x0 + this._snapParam[1]*dy,
					z = this._snapParam[2];
				scrPt = [x,y,z];
			}

			return scrPt;
		}
	},

	GetQuadrantSnapPoint:
	{
		value: function(xEvent, yEvent)
		{
			var globalPt;
			var elt = this._clickedObject;
			if (elt && this._snapParam)
			{
				var tx = this._snapParam[0] <= 0.5 ? 0.0 : 1.0,
					ty = this._snapParam[1] <= 0.5 ? 0.0 : 1.0;

				var bounds = viewUtils.getElementViewBounds3D( elt );
				var x0 = bounds[0][0],  x1 = bounds[3][0],
					y0 = bounds[0][1],  y1 = bounds[1][1];
				var dx = x1 - x0,   dy = y1 - y0;

				var x = x0 + tx*dx,
					y = x0 + ty*dy,
					z = 0.0;
				var localPt = [x,y,z];

				globalPt = viewUtils.localToGlobal( localPt,  elt );
 
				// add in the delta
				var hitPt = this.GetObjectHitPoint();
				var scrPt = viewUtils.localToGlobal( hitPt, this._clickedObject );
				var delta = [xEvent-scrPt[0], yEvent-scrPt[1], 0-scrPt[2]];
				globalPt[0] += delta[0];
				globalPt[1] += delta[1];
                globalPt[2] += delta[2];
			}

			return globalPt;
		}
	},

	GetQuadrantPoint:
	{
		value: function(useViewPoint)
		{
			var elt = this._clickedObject;
			var tx = this._snapParam[0] <= 0.5 ? 0.0 : 1.0,
				ty = this._snapParam[1] <= 0.5 ? 0.0 : 1.0;

			var bounds = viewUtils.getElementViewBounds3D( elt );
			var x0 = bounds[0][0],  x1 = bounds[3][0],
				y0 = bounds[0][1],  y1 = bounds[1][1];
			var dx = x1 - x0,   dy = y1 - y0;

			var x = x0 + tx*dx,
				y = x0 + ty*dy,
				z = 0.0;
			var scrPt = [x,y,z];

			viewUtils.pushViewportObj( elt );
			var viewPt = viewUtils.screenToView( scrPt[0], scrPt[1], scrPt[2] );
			viewUtils.popViewportObj();

            if(useViewPoint)
			{
				return viewPt;
			}
            else
            {
                return MathUtils.transformPoint( viewPt, this._startMat );
            }
		}
	},

	GetSourcePointFromBoundary :
	{
		value: function( index, useViewPoint )
		{
			var elt = this._clickedObject;
			var bounds = viewUtils.getElementViewBounds3D( elt );

			var x = bounds[index][0],
				y = bounds[index][1],
				z = 0;
			var scrPt = [x,y,z];

			viewUtils.pushViewportObj( elt );
			var viewPt = viewUtils.screenToView( scrPt[0], scrPt[1], scrPt[2] );
			viewUtils.popViewportObj();
            
			if(useViewPoint)
			{
				return viewPt;
			}
            else
            {
                return MathUtils.transformPoint( viewPt, this._startMat );
            }
		}
	},

	GetSourcePointFromParameterizedTarget :
	{
		value: function(useViewPoint)
		{
			var elt = this._clickedObject;
			var bounds = viewUtils.getElementViewBounds3D( elt );
			var x0 = bounds[0][0],  x1 = bounds[3][0],
				y0 = bounds[0][1],  y1 = bounds[1][1];
			var dx = x1 - x0,   dy = y1 - y0;

			var x = x0 + this._snapParam[0]*dx,
				y = x0 + this._snapParam[1]*dy,
				z = this._snapParam[2];
			var scrPt = [x,y,z];

			viewUtils.pushViewportObj( elt );
			var viewPt = viewUtils.screenToView( scrPt[0], scrPt[1], scrPt[2] );
			viewUtils.popViewportObj();
            
			if(useViewPoint)
			{
				return viewPt;
			}
            else
            {
                return MathUtils.transformPoint( viewPt, this._startMat );
            }
		}
	},

    getMousePoints: {
        value: function()
        {
            var elt = this._clickedObject;
            if (elt)
            {
                var index = this._snapIndex;
                var pt0;
                var useViewPoint = this.rotateStage || (this._inLocalMode && (this.application.ninja.selectedElements.length === 1));
                if (this._useQuadPt)
                {
                    pt0 = this.GetQuadrantPoint(useViewPoint);
                }
                else
                {
                    pt0 = (index < 0) ? this.GetSourcePointFromParameterizedTarget(useViewPoint) : this.GetSourcePointFromBoundary( index, useViewPoint );
                }
                var pt1 = this._mouseUpHitRec.calculateStageWorldPoint();
                MathUtils.makeDimension4( pt1 );
                var obj2World = viewUtils.getObjToStageWorldMatrix( elt, true );
                var world2Obj = glmat4.inverse(obj2World, []);
                pt1 = MathUtils.transformHomogeneousPoint( pt1, world2Obj );
                pt1 = MathUtils.applyHomogeneousCoordinate( pt1 );
                viewUtils.pushViewportObj( elt );
                pt1 = viewUtils.screenToView( pt1[0], pt1[1], pt1[2] );
                viewUtils.popViewportObj();
                if(!useViewPoint)
                {
                    pt1 = MathUtils.transformPoint( pt1, this._startMat );
                }

				//console.log( "getMousePoints, useViewPoint: " + useViewPoint + ",  " + pt0 + " => " + pt1 );
                return {pt0:pt0, pt1:pt1};
            }
            else
            {
                return null;
            }
        }
    },

    updateUsingSnappingData: {
        value: function(event) {
            this.getUpdatedSnapPoint(event);
            if (this._mouseDownHitRec && this._mouseUpHitRec)
            {
                var data = this.getMousePoints();
                if(data)
                {
                    this.modifyElements(data, event);
                }
            }
        }
    },

    startDraw: {
        value: function(event) {
            this.drawData = null;

            if(this._target)
            {
                this.isDrawing = true;
                this.application.ninja.stage.showSelectionBounds = false;
                this._updateTargets();

                if(this._canSnap)
                {
                    this.initializeSnapping(event);
                }
                else
                {
                    this.drawWithoutSnapping(event);
                }
            }
        }
    },

    /*
     * Non-snapping mouse move calculation for points
     */
    updateWithoutSnappingData: {
        value: function(event) {
            var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                        new WebKitPoint(event.pageX, event.pageY));

            var data = {pt0:this.downPoint, pt1:point};

            this.modifyElements(data, event);
        }
    },

    doSnap: {
        value: function (event) {
            this.application.ninja.stage.clearDrawingCanvas();
            this.getUpdatedSnapPoint(event);
        }
    },

    /**
     * Used on the Mouse Move to calculate new snap point.
     */
    getUpdatedSnapPoint: {
        value: function(event) {
            var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                            new WebKitPoint(event.pageX, event.pageY));
            var x = point.x, y = point.y;
			this._useQuadPt = false;

			///////////////////////////////////////////////////////////
			// do a 3D snap if the mouse button is not down
			this._snapIndex = -1;
			this._useQuadPt = false;
			var mouseIsDown = (this._mouseDownHitRec !== null);
			var do3DSnap = (!mouseIsDown || event.shiftKey);

			// set the snapping capabilities
			if (mouseIsDown)
			{
				snapManager.enableElementSnap	( this._snapToElements	);
				snapManager.enableGridSnap		( this._snapToGrid		);
			}
//			else
//			{
//				this._showFeedbackOnMouseMove(event);
//			}

			snapManager.enableElementSnap	( snapManager.elementSnapEnabledAppLevel()	);
			snapManager.enableGridSnap		( snapManager.gridSnapEnabledAppLevel()		);
			//snapManager.enableSnapAlign		( snapManager.snapAlignEnabledAppLevel()	);
			snapManager.enableSnapAlign		( false	);	// only snap to element bounds (below)

			// do the snap
			var quadPt;
			if (mouseIsDown && !do3DSnap && this._shouldUseQuadPt && (this._handleMode === null) && (this._mode === 0))
				quadPt = this.GetQuadrantSnapPoint(x,y);
			var hitRec = snapManager.snap(x, y, do3DSnap, quadPt );

			snapManager.enableSnapAlign( snapManager.snapAlignEnabledAppLevel()	);
			if ( snapManager.snapAlignEnabled() && this._clickedObject &&
                (this._clickedObject !== this.application.ninja.currentDocument.model.documentRoot) )
			{
				var alignBounds = !hitRec || (hitRec.getType() == hitRec.SNAP_TYPE_STAGE) || hitRec.isSomeGridTypeSnap();
				if (alignBounds)
				{
					// calculate the delta to offset the points of the element by
					var scrPt = this.GetObjectHitPoint();
					scrPt = viewUtils.localToGlobal( scrPt, this._clickedObject );
					var delta = [x-scrPt[0], y-scrPt[1]];

					var alignArray = new Array();
					snapManager.snapAlignToElementBounds( this._clickedObject, delta, alignArray );
					if (alignArray.length > 0)
						hitRec = alignArray[0];
				}
			}

			if (hitRec)
			{
				if (mouseIsDown && this._clickedObject)
				{
					// make the hit record working plane relative
					this._snapIndex = hitRec.getSnapBoundaryIndex();
					this._useQuadPt = hitRec.getUseQuadPoint();
					var wp = this._dragPlane ? this._dragPlane : workingPlane;
					hitRec = hitRec.convertToWorkingPlane( wp );

                    // update the target
                    this._mouseUpHitRec = hitRec;
                    var pt = hitRec.getScreenPoint();
                    this.upPoint.x = pt[0];
                    this.upPoint.y = pt[1];
                    this.upPoint.z = pt[2];
				}
			}
        }
    },
        
    doDraw: {
        value: function(event)
        {
            this.application.ninja.stage.clearDrawingCanvas();

            if(this._canSnap)
            {
                this.updateUsingSnappingData(event);
            }
            else
            {
                this.updateWithoutSnappingData(event);
            }
        }
    },

    endDraw: {
        value: function (event) {
            this.application.ninja.stage.clearDrawingCanvas();

            this.downPoint.x = null;
            this.downPoint.y = null;
            this.upPoint.x = null;
            this.upPoint.y = null;
//            this.isDrawing = false;

            if(this._canSnap)
            {
                this.cleanupSnap();
            }
            this._mode = 0;
        }
    },
    
    cleanupSnap: {
        value: function() {
            this.mouseDownHitRec = null;
            this.mouseUpHitRec = null;
            
            this._dragPlane = null;
			this._useQuadPt = false;

			snapManager.clearAvoidList();
			snapManager.clearDragPlane();

			// restore the snap settings
			snapManager.enableSnapAlign( snapManager.snapAlignEnabledAppLevel() );
			snapManager.enableElementSnap( snapManager.elementSnapEnabledAppLevel() );
			snapManager.enableGridSnap( snapManager.gridSnapEnabledAppLevel() );
        }
    },
    //-------------------------------------------------------------------------

    //-------------------------------------------------------------------------
    // Info for tool's handles
    _activateOriginHandle: { value: false },
    _startOriginArray : {value : null },
    _origin: { value: null },
    _delta: { value: null },
    _startPoint: { value: [0, 0] },
    _matL : { value: Matrix.I(4) },
    _planeEq: { value: null },
    _dirVecL: { value: null },

    // override in subclasses
    _initializeToolHandles: {
        value: function() {
            if(!this._handles)
            {
            }
            else
            {
            }
        }
    },
    //-------------------------------------------------------------------------

    //-------------------------------------------------------------------------
    // Info about objects being modified by the tool
    // mode === 0 => x/y translation, mode === 1 => z translation
    _mode : {value : 0 },
    _mouseSpeed: { value: 1 },

    _target: { value: null },
    target:
    {
    	get: function () {
    		return this._target;
    	},
    	set: function (value) {
    		this._target = value;
    		if (value === null)
            {
    			return;
    		}

            if (this._target.elementModel && this._target.elementModel.props3D)
            {
				// do nothing
			}
			else
            {
                console.warn("no props3D model");
//                if(!this._target.elementModel)
//                {
//
//                }
//                var p3d = Montage.create(Properties3D).init(el);
//
//                this._target.elementModel = Montage.create(ElementModel, {
//                                    type:       { value: tag},
//                                    selection:  { value: selection},
//                                    controller: { value: ControllerFactory.getController(controller)},
//                                    props3D:    { value: p3d}
//                            });
//				this._target.props3D = Object.create(Properties3D, {});
//				this._target.props3D.Init(this._target);
			}
    	}
    },

    _startMat: { value: Matrix.I(4) },

    _undoArray: { value: [] },

    _initProps3D:
    {
        value: function(elt)
        {
            if (elt.elementModel && elt.elementModel.props3D)
            {
                // do nothing
            }
            else
            {
                console.warn("no props3D model");
//                elt.props3D = Object.create(Properties3D, {});
//                elt.props3D.Init(elt);
            }
        }
    },

    _updateTargets: {
        value: function(addToUndoStack) {
            // override in subclasses
        }
    },
    //-------------------------------------------------------------------------
    
    //-------------------------------------------------------------------------
    // Routines to run when tool is selected/deselected
    Configure: {
        value: function(wasSelected) {
            if(wasSelected) {
                this.eventManager.addEventListener("selectionChange", this, true);
                this.application.ninja.stage._iframeContainer.addEventListener("scroll", this, false);
                this._initializeToolHandles();
                this.captureSelectionDrawn(null);
                this.eventManager.addEventListener( "toolOptionsChange", this, false);
                this.eventManager.addEventListener( "toolDoubleClick", this, false);
                NJevent("enableStageMove");
            } else {
                this.eventManager.removeEventListener("selectionChange", this, true);
                this.application.ninja.stage._iframeContainer.removeEventListener("scroll", this, false);

                // Clean up
                NJevent("disableStageMove");

                // clear the drag plane
                snapManager.clearDragPlane();

                // restore the snap settings
                snapManager.enableSnapAlign( snapManager.snapAlignEnabledAppLevel() );
                snapManager.enableElementSnap( snapManager.elementSnapEnabledAppLevel() );
                snapManager.enableGridSnap( snapManager.gridSnapEnabledAppLevel() );
                this.eventManager.removeEventListener( "toolOptionsChange", this, false);
                this.eventManager.removeEventListener( "toolDoubleClick", this, false);

                if (this._targetedElement) {
                    this._targetedElement.classList.remove("active-element-outline");
                    this._targetedElement = null;
                }
            }
        }
    },

    captureSelectionChange: {
		value: function(event){
			this.eventManager.addEventListener("selectionDrawn", this, true);
		}
	},

	captureSelectionDrawn: {
		value: function(event){
            this._origin = null;
            this._delta = null;

			var len = this.application.ninja.selectedElements.length;
			if(len)
			{
				if(len === 1)
				{
					this.target = this.application.ninja.selectedElements[0];
					drawUtils.addElement(this.target);
				}
				else
				{
					this.target = this.application.ninja.currentDocument.model.documentRoot;
				}
//				this._updateTargets();
			}
			else
			{
				this.target = null;
			}
			this.DrawHandles();

			if(event)
			{
                this.eventManager.removeEventListener("selectionDrawn", this, true);
			}
		}
	},
    //-------------------------------------------------------------------------

    //-------------------------------------------------------------------------
    // User interaction routines
    HandleLeftButtonDown: {
        value: function(event) {

//            console.log( "modifier-tool-base.HandleLeftButtonDown" );

            var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas, new WebKitPoint(event.pageX, event.pageY));
            this.downPoint.x = point.x;
            this.downPoint.y = point.y;

            if(this._handleMode === null)
            {
                // TODO - Special casing the double-click workflow for reseting tool handle's center for now.
                if(!this._activateOriginHandle)
                {
                    this.application.ninja.stage.drawNow = true;
                    var canSnap = this._canSnap;
                    this._canSnap = true;
                    this.doSelection(event);
                    this._canSnap = canSnap;
                }
            }

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
                this._showFeedbackOnMouseMove(event);
                if(this._canSnap)
                {
                    this.doSnap(event);
                }
            }

			if (!this._isDrawing || (this.application.ninja.selectedElements.length == 1))
            this.DrawHandles(this._delta);
            
            if(this._canSnap)
            {
                snapManager.drawLastHit();
            }
        }
    },

    HandleLeftButtonUp: {
        value: function(event) {
            var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                                    new WebKitPoint(event.pageX, event.pageY));

            this.isDrawing = false;
            this.application.ninja.stage.showSelectionBounds = true;
            if(this._escape) {
                this._escape = false;
                return;
            }

            if(this._hasDraw)
            {
                if(this._activateOriginHandle)
                {
                    this._setTransformOrigin(true);
                }
                else if ( ((this.downPoint.x - point.x) !== 0) ||
                            ((this.downPoint.y - point.y) !== 0) )
                {
                    this._updateTargets(true);
                }

                this._hasDraw = false;
            }
            if(this._handleMode !== null)
            {
                this._handleMode = null;
                this._delta = null;
            }
            this.endDraw(event);

			this.application.ninja.stage.draw();
			if (this.application.ninja.selectedElements.length > 1)
			{
				//this._origin = null;
				this._updateHandlesOrigin();
			}
            this.DrawHandles();
        }
    },

	_updateHandlesOrigin: {
		value: function () { }
	},

    handleToolDoubleClick: {
        value: function(event) {
            if(!this._target)
            {
                return;
            }

            this.Reset();
        }
    },

    Reset : {
        value: function () {
            // override in sub-classes
        }
    },

    handleToolOptionsChange: {
        value: function(event) {
            this._handleToolOptionsChange(event);
        }
    },

    _handleToolOptionsChange : {
        value: function (event) {
            // override in sub-classes
        }
    },

    /**
   	 * This function is for specifying custom feedback routine
   	 * upon mouse over.
   	 * For example, the drawing tools will add a glow when mousing
   	 * over existing canvas elements to signal to the user that
   	 * the drawing operation will act on the targeted canvas.
   	 */
   	_showFeedbackOnMouseMove : {
   		value: function (event) {
   			if(this._target && this._handles)
   			{
   				var len = this._handles.length;
   				var i = 0,
   					toolHandle,
   					c,
                    point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                            new WebKitPoint(event.pageX, event.pageY));
   				for (i=0; i<len; i++)
   				{
   					toolHandle = this._handles[i];
   					c = toolHandle.collidesWithPoint(point.x, point.y);
   					if(c === 1)
   					{
   						this.application.ninja.stage.drawingCanvas.style.cursor = "move";
   						this._handleMode = i;
   						return;
   					}
   					else if(c === 2)
   					{
   						this.application.ninja.stage.drawingCanvas.style.cursor = toolHandle._cursor;
   						this._handleMode = i;
   						return;
   					}
   				}
   			}

   			this._handleMode = null;
   //            this.application.ninja.stage.drawingCanvas.style.cursor = this._cursor;
   			this.application.ninja.stage.drawingCanvas.style.cursor = "auto";
   		}
   	},
    //-------------------------------------------------------------------------

    HandleKeyPress: {
        value : function (event) {
            var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                        new WebKitPoint(event.pageX, event.pageY));
            if(event.ctrlKey || event.metaKey)
            {
                // set 'z-translation' mode
                this._mode = 1;

                if(this._mouseDownHitRec && this._target)
                {
                    if ( ((this.downPoint.x - point.x) !== 0) ||
                          ((this.downPoint.y - point.y) !== 0) )
                    {
                        this._updateTargets();

                        this.downPoint.x = point.x;
                        this.downPoint.y = point.y;
                    }
                }
            }
        }
    },

    HandleKeyUp: {
        value: function(event) {
            var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                        new WebKitPoint(event.pageX, event.pageY));
            if(event.keyCode === 93 || event.keyCode === 91 || event.keyCode === 17)
            {
                // set 'x/y-translation' mode
                this._mode = 0;

                if(this._mouseDownHitRec && this._target)
                {
                    if ( ((this.downPoint.x - point.x) !== 0) ||
                          ((this.downPoint.y - point.y) !== 0) )
                    {
                        this._updateTargets();

                        this.downPoint.x = point.x;
                        this.downPoint.y = point.y;
                    }
                }
            }
        }
    },

    modifyElements: {
        value: function(data, event) {
            // override in subclasses.
        }
    }
    //-------------------------------------------------------------------------
});
