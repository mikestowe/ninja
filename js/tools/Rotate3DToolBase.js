/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/* Base class for the 3D rotation tools
Subclass RotateObject3DTool will rotate the object that was clicked.
Subclass RotateStage3DTool will rotate the stage.
 */
var Montage = require("montage/core/core").Montage,
    ModifierToolBase = require("js/tools/modifier-tool-base").ModifierToolBase,
    snapManager = require("js/helper-classes/3D/snap-manager").SnapManager,
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils,
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils,
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator,
	Rectangle = require("js/helper-classes/3D/rectangle").Rectangle;

exports.Rotate3DToolBase = Montage.create(ModifierToolBase, {
	_canSnap: { value: false },

    _inLocalMode: { value: true, enumerable: true },

    drawWithoutSnapping:
    {
        value: function(event)
        {
            if(this._handleMode !== null)
            {
                this._matL = this._handles[this._handleMode]._matL.slice(0);
                this._planeEq = this._handles[this._handleMode]._planeEq.slice(0);
                this._dirVecL = this._handles[this._handleMode]._dirVecL.slice(0);
                this._startPoint = MathUtils.getLocalPoint(this.downPoint.x,
                                                            this.downPoint.y,
                                                            this._planeEq,
                                                            this._matL);
                if(!this._startPoint)
                {
                    this._startPoint = [this.downPoint.x, this.downPoint.y];
                }
            }
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

			this.DrawHandles(this._delta);
            
			if(this._canSnap)
            {
                snapManager.drawLastHit();
            }
        }
    },

    modifyElements: {
        value: function(data, event) {
            var mat,
                angle,
                pt0 = data.pt0,
                pt1 = data.pt1;

            if(this._handleMode !== null)
            {
                if(this._activateOriginHandle)
                {
                    // move the transform origin handle directly to the snap point (pt1)
                    this._origin[0] = pt1.x;
                    this._origin[1] = pt1.y;
                    this._origin[2] = pt1.z;

					var sw2gMat = viewUtils.getStageWorldToGlobalMatrix();
					var g2swMat = glmat4.inverse( sw2gMat, [] );
					var swOrigin = MathUtils.transformAndDivideHomogeneousPoint( this._origin, g2swMat );
					//console.log( "modifyElements, _origin: " + this._origin + ", in stageWorld: " + swOrigin );

                    var len = this._targets.length;
                    if(len === 1)
                    {
						var g2lMat = this._targets[0].g2l;
						var localOrigin = MathUtils.transformAndDivideHomogeneousPoint( this._origin, g2lMat );
						var elt = this._targets[0].elt;
						viewUtils.pushViewportObj( elt );
						var viewOrigin = viewUtils.screenToView( localOrigin[0], localOrigin[1], localOrigin[2] );
						viewUtils.popViewportObj();
						this._startOriginArray[0] = viewOrigin;
						//console.log( "Rotate3DToolBase.modifyElements, _startOriginArray[0]: " + this._startOriginArray[0] );
                    }
                    this.downPoint.x = pt1.x;
                    this.downPoint.y = pt1.y;
                    this.downPoint.z = pt1.z;
                    this.DrawHandles();
                    return;
                }

                angle = this._getAngleToRotate(pt1.x, pt1.y);
                if(event.shiftKey)
                {
                    var f = Math.floor(angle/(Math.PI/4));
                    angle = f*Math.PI/4;
                }
                this._delta = angle;
                switch(this._handleMode)
                {
                    case 0:
                        // Rotate X;
                        mat = Matrix.RotationX(angle);
                        break;
                    case 1:
                        // Rotate Y
                        mat = Matrix.RotationY(angle);
                        break;
                    case 2:
                        // Rotate Z
                        mat = Matrix.RotationZ(angle);
                        break;
                    default:
                        break;
                }
            }
            else
            {
                if (event.ctrlKey || event.metaKey)
                {
                    var zAngle = this._mouseSpeed * (pt1.y - this.downPoint.y) * Math.PI / 180.0;
                    if (zAngle === 0)
                    {
                        zAngle = 0.01 * Math.PI / 180.0;
                    }
                    if(event.shiftKey)
                    {
                        var f = Math.floor(zAngle/(Math.PI/4));
                        zAngle = f*Math.PI/4;
                    }
                    mat = Matrix.RotationZ(zAngle);
                }
                else
                {
                    var yAngle = this._mouseSpeed * (pt1.x - this.downPoint.x) * Math.PI / 180.0;
                    var xAngle = -this._mouseSpeed * (pt1.y - this.downPoint.y) * Math.PI / 180.0;
                    if(event.shiftKey)
                    {
                        var f = Math.floor(yAngle/(Math.PI/4));
                        yAngle = f*Math.PI/4;
                        f = Math.floor(xAngle/(Math.PI/4));
                        xAngle = f*Math.PI/4;
                    }

                    // check the orientation of the X axis
                    //if (drawUtils.drawYZ)  xAngle = -xAngle;
                    var yMat  = Matrix.RotationY( yAngle ),
                        xMat  = Matrix.RotationX( xAngle );

                    mat = glmat4.multiply(yMat, xMat, []);
                }
            }


            if(this._inLocalMode && (this._targets.length === 1) )
            {
				console.log( "modifyElements: rotateLocally " );
                this._rotateLocally(mat);
            }
            else
            {
                this._rotateGlobally(mat);
            }

//            this.UpdateSelection();
            NJevent("elementChanging", {type : "Changing", redraw: false});
        }
    },

    _rotateLocally: {
        value: function (rotMat) {
            var len = this._targets.length;
            for(var i = 0; i < len; i++)
            {
                var item = this._targets[i];
                var elt = item.elt;
                var curMat = item.mat;

                // pre-translate by the transformation center
                var tMat = Matrix.I(4);

				// _startOriginArray is the location of the center of rotation
				// in view space of the element.  
                var transformCtr = this._startOriginArray[i];

                tMat[12] = transformCtr[0];
                tMat[13] = transformCtr[1];
                tMat[14] = transformCtr[2];

                var mat = glmat4.multiply(curMat, tMat, []);

                // translate back
                tMat[12] = -transformCtr[0];
                tMat[13] = -transformCtr[1];
                tMat[14] = -transformCtr[2];

                glmat4.multiply(mat, rotMat, mat);


                glmat4.multiply(mat, tMat, mat);

                // while moving, set inline style to improve performance
                viewUtils.setMatrixForElement( elt, mat, true );
            }
        }
    },

    _rotateGlobally: {
        value: function (rotMat) {
            var len = this._targets.length;
            for(var i = 0; i < len; i++)
            {
                var item = this._targets[i];
                var elt = item.elt;
                var curMat = item.mat;

                // pre-translate by the transformation center
                var tMat = Matrix.I(4);

                var transformCtr = this._startOriginArray[i].slice(0);
                transformCtr = MathUtils.transformPoint(transformCtr, curMat);

				console.log( "modifyElements: rotateGlobally, ctr: " + transformCtr );

                tMat[12] = transformCtr[0];
                tMat[13] = transformCtr[1];
                tMat[14] = transformCtr[2];

                var mat = glmat4.multiply(tMat, rotMat, []);

                // translate back
                tMat[12] = -transformCtr[0];
                tMat[13] = -transformCtr[1];
                tMat[14] = -transformCtr[2];

                glmat4.multiply(mat, tMat, mat);

                glmat4.multiply(mat, curMat, mat);

                viewUtils.setMatrixForElement( elt, mat, true );
            }
        }
    },

    _getAngleToRotate: {
        value: function (x, y) {
            var angle;
            var pt = MathUtils.getLocalPoint(x, y, this._planeEq, this._matL);
            if(!pt)
            {
                //TODO - should this be _startPoint.x/y instead of downPoint.x/y?
                var st = [this.downPoint.x, this.downPoint.y];
                pt = [x, y];
                var sub = vecUtils.vecSubtract(2, pt, st);
                var dot = vecUtils.vecDot(2, sub, this._dirVecL);

                angle = vecUtils.vecDist(2, pt, st) * 0.1;

                if (dot < 0)
                {
                    angle = -angle;
                }
            }
            else
            {
                angle = MathUtils.getAngleBetweenPoints(this._startPoint, pt);
            }
            return angle;
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
            this._targets = [];
            this._startOriginArray = null;

            var len = this.application.ninja.selectedElements.length;
            if(len)
            {
                if(len === 1)
                {
                    this.target = this.application.ninja.selectedElements[0];
                    drawUtils.addElement(this.target);

                    viewUtils.pushViewportObj( this.target );
                    var eltCtr = viewUtils.getCenterOfProjection();
					eltCtr[2] = 0;
                    viewUtils.popViewportObj();

                    var ctrOffset = this.target.elementModel.props3D.m_transformCtr;
                    if(ctrOffset)
                    {
                        eltCtr[2] = 0;
                        eltCtr = vecUtils.vecAdd(3, eltCtr, ctrOffset);
                    }
                    
                    this._origin = viewUtils.localToGlobal(eltCtr, this.target);
					console.log( "Rotate3DToolBase.captureSelectionDrawn _origin: " + this._origin );
                    this._updateTargets();
                    this._setTransformOrigin(false);
                }
                else
                {
                    this.target = this.application.ninja.currentDocument.documentRoot;
                    //this._origin = drawUtils._selectionCtr.slice(0);
                    //this._origin[0] += this.application.ninja.stage.userContentLeft;
                    //this._origin[1] += this.application.ninja.stage.userContentTop;
                    this._updateTargets();
 					this._origin = this.calculateMultiSelOrigin();
					this._setTransformOrigin(true);
                }
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

	/*
	_updateHandlesOrigin: {
		value: function () { }
	},
	*/

    _updateTargets: {
        value: function(addToUndoStack) {
			console.log( "Rotate3DToolBase._updateTargets" );
            var newStyles = [],
                previousStyles = [],
                len = this.application.ninja.selectedElements.length;
            this._targets = [];
            for(var i = 0; i < len; i++)
            {
                var elt = this.application.ninja.selectedElements[i];
//                this._initProps3D(elt);


                var curMat = viewUtils.getMatrixFromElement(elt);
                var curMatInv = glmat4.inverse(curMat, []);

                viewUtils.pushViewportObj( elt );
                var eltCtr = viewUtils.getCenterOfProjection();
                viewUtils.popViewportObj();

				// cache the local to global and global to local matrices
				var l2gMat = viewUtils.getLocalToGlobalMatrix( elt );
				var g2lMat = glmat4.inverse( l2gMat, [] );
				eltCtr = MathUtils.transformAndDivideHomogeneousPoint( eltCtr, l2gMat );

                this._targets.push({elt:elt, mat:curMat, matInv:curMatInv, ctr:eltCtr,  l2g:l2gMat,  g2l:g2lMat});
                
				if(addToUndoStack)
                {
                    var previousStyleStr = {dist:this._undoArray[i].dist, mat:MathUtils.scientificToDecimal(this._undoArray[i].mat.slice(0), 5)};

                    var newStyleStr = {dist:viewUtils.getPerspectiveDistFromElement(elt), mat:MathUtils.scientificToDecimal(curMat, 5)};

                    previousStyles.push(previousStyleStr);
                    newStyles.push(newStyleStr);
                }
            }
            if(addToUndoStack)
            {
                ElementsMediator.set3DProperties(this.application.ninja.selectedElements,
                                                newStyles,
                                                "Change",
                                                "rotateTool",
                                                previousStyles
                                              );
            }
            // Save previous value for undo/redo
            this._undoArray = [];
            for(i = 0, len = this._targets.length; i < len; i++)
            {
                var elt = this._targets[i].elt;
                var _mat = viewUtils.getMatrixFromElement(elt);
                var _dist = viewUtils.getPerspectiveDistFromElement(elt);
                this._undoArray.push({mat:_mat, dist:_dist});
            }
        }
    },

	calculateMultiSelOrigin: 
	{
		value: function()
		{
			var minPt,  maxPt, i,j;
			this._startOriginArray = [];
			var len = this.application.ninja.selectedElements.length;
			for (i = 0; i < len; i++)
			{
				// get the next element and localToGlobal matrix
				elt = this._targets[i].elt;
				var l2g = this._targets[i].l2g;

				// get the element bounds in 'plane' space
				bounds = viewUtils.getElementViewBounds3D( elt );
				for (j=0;  j<4;  j++)
				{
					var localPt = bounds[j];
					//var pt = MathUtils.transformAndDivideHomogeneousPoint( localPt, l2g );
					var pt = viewUtils.localToStageWorld( localPt, elt );
					if (!minPt)
					{
						minPt = pt.slice();
						maxPt = pt.slice();
					}
					else
					{
						minPt[0] = Math.min(minPt[0],pt[0]);  minPt[1] = Math.min(minPt[1],pt[1]);  minPt[2] = Math.min(minPt[2],pt[2]);
						maxPt[0] = Math.max(maxPt[0],pt[0]);  maxPt[1] = Math.max(maxPt[1],pt[1]);  maxPt[2] = Math.max(maxPt[2],pt[2]);
					}
				}
			}
			var stageWorldCtr = [ 0.5*(minPt[0] + maxPt[0]),  0.5*(minPt[1] + maxPt[1]), 0.5*(minPt[2] + maxPt[2]) ];
			var globalCtr = MathUtils.transformAndDivideHomogeneousPoint( stageWorldCtr, viewUtils.getStageWorldToGlobalMatrix() );
			console.log( "resetting _origin to: " + this._origin );

			return globalCtr;
		}
	},

    _setTransformOrigin: {
        value: function(shouldUpdateCenter) {
            if(!this._origin)
            {
                return;
            }
			console.log( "_setTransformOrigin, _activateOriginHandle: " +  this._activateOriginHandle );

            var len = this._targets.length;
            var elt,
                eltCtr,
                ctrOffset,
                matInv;
            if( len === 1)
            {
                elt = this._target;

                if(shouldUpdateCenter)
                {
//                    eltCtr = this._targets[0].ctr;
//                    ctrOffset = vecUtils.vecSubtract(3, this._origin, eltCtr);

//                    matInv = this._targets[0].matInv;
//                    ctrOffset = MathUtils.transformVector(ctrOffset, matInv);

//                    elt.elementModel.props3D.m_transformCtr = ctrOffset;
					elt.elementModel.props3D.m_transformCtr = this._startOriginArray[0].slice();
                }
                else
                {
                    this._startOriginArray = [];
                    var ctrOffset = this._target.elementModel.props3D.m_transformCtr;
                    if(!ctrOffset)
                    {
                        ctrOffset = [0,0,0];
                    }
					this._startOriginArray[0] = ctrOffset;
                }
            }
            else
            {
				/*
               this._startOriginArray = [];
               for (var i = 0; i < len; i++) {
                   elt = this._targets[i].elt;
                   eltCtr = this._targets[i].ctr;
                   ctrOffset = vecUtils.vecSubtract(3, this._origin, eltCtr);
                   matInv = this._targets[i].matInv;
                   ctrOffset = MathUtils.transformVector(ctrOffset, matInv);
                    this._startOriginArray[i] = ctrOffset;
				}
				*/
				
				// Update transform ctr for all elements if transform origin was modified
				if (!this._origin)  this._origin = this.calculateMultiSelOrigin();
				var globalCtr = this._origin;
				for (i=0;  i<len;  i++)
				{
					// get the next element and localToGlobal matrix
                    elt = this._targets[i].elt;
					var l2g = viewUtils.getLocalToGlobalMatrix( elt );
					var g2l = glmat4.inverse( l2g, [] );
					this._targets[i].g2l = g2l;
					this._targets[i].l2g = l2g;

					var localCtr = MathUtils.transformAndDivideHomogeneousPoint(globalCtr,  g2l);
					viewUtils.pushViewportObj( elt );
					localCtr = viewUtils.screenToView( localCtr[0],  localCtr[1],  localCtr[2] );
					viewUtils.popViewportObj();

                    this._startOriginArray[i] = localCtr;
                }
            }
        }
    },

	HandleDoubleClick: {
		value: function () {

            if(!this._target)
            {
                return;
            }

            if(this._activateOriginHandle)
            {
                var len = this.application.ninja.selectedElements.length;
                if( (len === 1) || (this._toolID === "rotateStage3DTool") )
                {
                    this._target.elementModel.props3D.m_transformCtr = null;
                }

                this._handleMode = null;
                this._activateOriginHandle = false;
                this.application.ninja.stage.drawingCanvas.style.cursor = this._cursor;

                this.captureSelectionDrawn(null);
            }
		}
	},

    Reset : {
        value : function()
        {
            var item,
                mat,
                dist,
                newStyles = [],
                previousStyles = [],
                len = this.application.ninja.selectedElements.length,
                iMat;
            for(var i = 0; i < len; i++)
            {
                // Reset to the identity matrix
                item = this.application.ninja.selectedElements[i];
                iMat = Matrix.I(4);
                mat = ElementsMediator.getMatrix(item);
//                iMat[12] = mat[12];
//                iMat[13] = mat[13];
//                iMat[14] = mat[14];

                dist = ElementsMediator.getPerspectiveDist(item);

                var previousStyleStr = {dist:dist, mat:mat};

                var newStyleStr = {dist:dist, mat:iMat};

                previousStyles.push(previousStyleStr);
                newStyles.push(newStyleStr);

            }

            ElementsMediator.set3DProperties(this.application.ninja.selectedElements,
                                            newStyles,
                                            "Change",
                                            "rotateTool",
                                            previousStyles
                                          );

            this.isDrawing = false;
            this.endDraw(event);

            // Need to force stage to draw immediately so the new selection center is calculated
            this.application.ninja.stage.draw();
            // And captureSelectionDrawn to draw the transform handles
            this.captureSelectionDrawn(null);
        }
    },

        /**
    * SHIFT/ALT/SPACE Key Handlers
    */
    HandleShiftKeyDown: {
        value: function (event) {
        }
    },

    HandleShiftKeyUp: {
        value: function () {
        }
    },

    HandleSpaceKeyDown: {
        value: function () {
        }
    },

    HandleSpaceUp: {
        value: function () {
        }
    },

    HandleAltKeyDown: {
		value: function(event) {
            this._inLocalMode = !this._inLocalMode;
            this.DrawHandles();
		}
	},

	HandleAltKeyUp: {
		value: function(event) {
			this._inLocalMode = !this._inLocalMode;
            this.DrawHandles();
		}
	},

    handleScroll: {
        value: function(event) {
            this.captureSelectionDrawn(null);
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
			this._canSnap = false;
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
                        this._activateOriginHandle = true;
                        this._canSnap = true;
						return;
                    }
                    else if(c === 2)
                    {
                        this.application.ninja.stage.drawingCanvas.style.cursor = toolHandle._cursor;
                        this._handleMode = i;
                        this._activateOriginHandle = false;
                        return;
                    }
                }
            }

            this._handleMode = null;
            this._activateOriginHandle = false;
   //            this.application.ninja.stage.drawingCanvas.style.cursor = this._cursor;
            this.application.ninja.stage.drawingCanvas.style.cursor = "auto";
        }
    },

    getMousePoints: {
        value: function()
        {
            var pt0 = { x:this.downPoint.x, y:this.downPoint.y, z:this.downPoint.z };
            var pt1 = { x:this.upPoint.x, y:this.upPoint.y, z:this.upPoint.z };

            return {pt0:pt0, pt1:pt1};
        }
    },

    DrawHandles: {
        value: function (angle) {
            this.application.ninja.stage.clearDrawingCanvas();

            var item = this._target;
            if(!item)
            {
                return;
            }

            // Draw tool handles

            // set the element to be the viewport object - temporarily
            var lMode = this._inLocalMode;
            if( (this._toolID !== "rotateStage3DTool") &&
                    (this.application.ninja.selectedElements.length === 1) )
            {
                viewUtils.pushViewportObj( item );
            }
            else
            {
                lMode = false;
                viewUtils.pushViewportObj( this.application.ninja.currentDocument.documentRoot );
            }
            var base = this._origin;
			//console.log( "Rotate3DToolBase.DrawHandles, base: " + base );

            if( (this._handleMode !== null) && !this._activateOriginHandle )
            {
                switch(this._handleMode)
                {
                    case 0:
                        this._handles[1]._strokeStyle = 'rgba(0, 255, 0, 0.2)';
                        this._handles[2]._strokeStyle = 'rgba(0, 0, 255, 0.2)';
                        break;
                    case 1:
                        this._handles[0]._strokeStyle = 'rgba(255, 0, 0, 0.2)';
                        this._handles[2]._strokeStyle = 'rgba(0, 0, 255, 0.2)';
                        break;
                    case 2:
                        this._handles[0]._strokeStyle = 'rgba(255, 0, 0, 0.2)';
                        this._handles[1]._strokeStyle = 'rgba(0, 255, 0, 0.2)';
                        break;
                }
            }
            this._handles[0].draw(base, item, lMode);
            this._handles[1].draw(base, item, lMode);
            this._handles[2].draw(base, item, lMode);

            if(angle && (this._handleMode !== null))
            {
                this._handles[this._handleMode].drawShadedAngle(angle, this._startPoint);
            }


            this._handles[0]._strokeStyle = 'rgba(255, 0, 0, 1)';
            this._handles[1]._strokeStyle = 'rgba(0, 255, 0, 1)';
            this._handles[2]._strokeStyle = 'rgba(0, 0, 255, 1)';

            viewUtils.popViewportObj();
        }
    }

});