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
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

exports.Rotate3DToolBase = Montage.create(ModifierToolBase, {
    _canSnap: { value: false },

    _inLocalMode: { value: true, enumerable: true },

    rotateStage: {
        value: false
    },

    initializeSnapping : {
        value : function(event)
        {
//            console.log( "initializeSnapping" );

            var selectedElements = this.application.ninja.selectedElements;
            if(this.rotateStage) {
                selectedElements = [this.application.ninja.currentDocument.model.documentRoot];
            }

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
            this._clickedOnStage = false;
            var do3DSnap = true;

            if(this._handleMode === null)
            {
                snapManager.enableElementSnap   ( true  );
                snapManager.enableGridSnap      ( true  );
            }
//            else
//            {
//                this._delta = null;
                // special case for z-translation
//                if(this._handleMode === 0)
//                {
//                    this._dragPlane = viewUtils.getNormalToUnprojectedElementPlane(this._target);
//                    snapManager.setupDragPlaneFromPlane(this._dragPlane);
//                    do3DSnap = false;

//                    snapManager.enableElementSnap ( false );
//                    snapManager.enableGridSnap        ( false );
//                }
//            }

            if (selectedElements.length)
            {
                var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                                new WebKitPoint(event.pageX, event.pageY));

                // do the snap before setting up the avoid list to allow
                // a snap on the mouse down
                var hitRec = snapManager.snap(point.x, point.y, do3DSnap);

//                if(this._handleMode === 2)
//                {
//                    // translate z doesn't snap to element so hitRec's element will always be different
//                    // from what the browser says we clicked on. So, skip this check.
//                }
//                else
//                {
//                    // Check that hitRec's element matches element that browser says we clicked on
//                    // TODO - This is still not working when using a handle that is on top of an
//                    // element that is not currently selected
//                    var elt = this.application.ninja.stage.GetSelectableElement(event);
//                    if(elt && (elt !== hitRec.getElement()))
//                    {
//                        hitRec = snapManager.findHitRecordForElement(elt);
//                    }
//                    if(elt === this.application.ninja.currentDocument.model.domContainer)
//                    {
//                        this._clickedOnStage = true;
//                    }
//                }

                // we don't want to snap to selected objects during the drag
//                var len = this._targets.length;
//                for(var i=0; i<len; i++)
//                {
//                    snapManager.addToAvoidList( this._targets[i].elt );
//                }
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

                    if(this._handleMode === 0)
                        this.clickedObject = this._target;

                    // parameterize the snap point on the target
                    this._snapParam = this.parameterizeSnap( hitRec );

                    if(!this._dragPlane)
                    {
                        if (selectedElements.length === 1)
                        {
                            this._dragPlane = viewUtils.getUnprojectedElementPlane(this._clickedObject);
                            snapManager.setupDragPlaneFromPlane(this._dragPlane);
                        }
                        else
                        {
                            this._dragPlane = snapManager.setupDragPlanes( hitRec, true );
                        }

                    }

                    // no quadrant snapping for the rotate tool
                    this._shouldUseQuadPt = false;

                    var wpHitRec = hitRec.convertToWorkingPlane( this._dragPlane );
                    this._mouseDownHitRec = wpHitRec;
                    this._mouseUpHitRec = null;

                    var pt = hitRec.getScreenPoint();
                    this.downPoint.x = pt[0];
                    this.downPoint.y = pt[1];
                    this.downPoint.z = pt[2];

                    // TODO - need to figure out snapManager dependency by drawUtils.
                    // For now, bypassing by calling snapManager.drawLastHit();
//                  drawUtils.refreshDisplay();
//                    snapManager.drawLastHit();
                }
            }
            else
            {
                this.target = null;
            }
        }
    },

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

            var selectedElements = this.application.ninja.selectedElements;
            if(this.rotateStage) {
                selectedElements = [this.application.ninja.currentDocument.model.documentRoot];
            }

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

                    var len = selectedElements.length;
                    if(len === 1)
                    {
                        var elt = selectedElements[0];
                        var g2lMat = elt.elementModel.getProperty("g2l");
                        var localOrigin = MathUtils.transformAndDivideHomogeneousPoint( this._origin, g2lMat );

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

            if(this._inLocalMode && (this.application.ninja.selectedElements.length === 1 || this.rotateStage) )
            {
//              console.log( "modifyElements: rotateLocally " );
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
            var selectedElements = this.application.ninja.selectedElements;

            if(this.rotateStage) {
                selectedElements = [this.application.ninja.currentDocument.model.documentRoot];
            }
            var len = selectedElements.length;
            for(var i = 0; i < len; i++) {
                var elt = selectedElements[i];
                var curMat = elt.elementModel.getProperty("mat");

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
            var len = this.application.ninja.selectedElements.length;
            for(var i = 0; i < len; i++) {
                var elt = this.application.ninja.selectedElements[i].elementModel.getProperty("elt");
                var curMat = this.application.ninja.selectedElements[i].elementModel.getProperty("mat");

                // pre-translate by the transformation center
                var tMat = Matrix.I(4);

                var transformCtr = this._startOriginArray[i].slice(0);
                transformCtr = MathUtils.transformPoint(transformCtr, curMat);

//              console.log( "modifyElements: rotateGlobally, ctr: " + transformCtr );

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

                viewUtils.setMatrixForElement(this.application.ninja.selectedElements[i], mat, true );
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
                    //console.log( "Rotate3DToolBase.captureSelectionDrawn _origin: " + this._origin );
                    this._updateTargets();
                    this._setTransformOrigin(false);
                }
                else
                {
                    this.target = this.application.ninja.currentDocument.model.documentRoot;
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
        value: function(addToUndo) {
            var mod3dObject = [],
                self = this;

            this.application.ninja.selectedElements.forEach(function(element) {
                var curMat = viewUtils.getMatrixFromElement(element);
                var curMatInv = glmat4.inverse(curMat, []);

                viewUtils.pushViewportObj( element );
                var eltCtr = viewUtils.getCenterOfProjection();
                viewUtils.popViewportObj();

                // cache the local to global and global to local matrices
                var l2gMat = viewUtils.getLocalToGlobalMatrix( element );
                var g2lMat = glmat4.inverse( l2gMat, [] );
                eltCtr = MathUtils.transformAndDivideHomogeneousPoint( eltCtr, l2gMat );

                element.elementModel.setProperty("ctr", eltCtr);
                element.elementModel.setProperty("mat", curMat);
                element.elementModel.setProperty("matInv", curMatInv);
                element.elementModel.setProperty("l2g", l2gMat);
                element.elementModel.setProperty("g2l", g2lMat);

                if(addToUndo) {
                    var previousMat = element.elementModel.getProperty("mat").slice(0);
                    var previousStyleStr = {dist:element.elementModel.getProperty("dist"), mat:MathUtils.scientificToDecimal(previousMat, 5)};
                    var newStyleStr = {dist:viewUtils.getPerspectiveDistFromElement(element), mat:MathUtils.scientificToDecimal(viewUtils.getMatrixFromElement(element), 5)};

                    mod3dObject.push({element:element, properties:newStyleStr, previousProperties: previousStyleStr});
                }

            });

            if(addToUndo) {
                ElementsMediator.set3DProperties(mod3dObject, "Change", "rotateTool");
            }

            this.application.ninja.selectedElements.forEach(function(element) {
                element.elementModel.setProperty("mat", viewUtils.getMatrixFromElement(element));
                element.elementModel.setProperty("matInv", glmat4.inverse(element.elementModel.getProperty("mat"), []));
                element.elementModel.setProperty("dist", viewUtils.getPerspectiveDistFromElement(element));
            });
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
                var elt = this.application.ninja.selectedElements[i];
                var l2g = elt.elementModel.getProperty("l2g");

                // get the element bounds in 'plane' space
                var bounds = viewUtils.getElementViewBounds3D( elt );
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
//          console.log( "resetting _origin to: " + this._origin );

            return globalCtr;
        }
    },

    _setTransformOrigin: {
        value: function(shouldUpdateCenter) {
            if(!this._origin) {
                return;
            }

            var elt,
                element,
                eltCtr,
                ctrOffset,
                matInv;

            if(this.rotateStage || (this.application.ninja.selectedElements.length === 1)) {
                if(this.rotateStage) {
                    element = this.application.ninja.currentDocument.model.documentRoot;
                } else {
                    element = this.application.ninja.selectedElements[0];
                }

                if(shouldUpdateCenter) {

//                    eltCtr = element.elementModel.getProperty("ctr");
//                    ctrOffset = vecUtils.vecSubtract(3, this._origin, eltCtr);

//                    matInv = element.elementModel.getProperty("matInv");
//                    ctrOffset = MathUtils.transformVector(ctrOffset, matInv);

                    element.elementModel.props3D.m_transformCtr = this._startOriginArray[0].slice();
                } else {
                    this._startOriginArray = [];
                    ctrOffset = element.elementModel.props3D.m_transformCtr;
                    if(!ctrOffset) {
                        ctrOffset = [0,0,0];
                    }
                    this._startOriginArray[0] = ctrOffset;
                }
            } else {
               /*
                this._startOriginArray = [];
                var len = this.application.ninja.selectedElements.length;
                for (var i = 0; i < len; i++) {
                    eltCtr = this.application.ninja.selectedElements[i].elementModel.getProperty("ctr");
                    ctrOffset = vecUtils.vecSubtract(3, this._origin, eltCtr);
                    matInv = this.application.ninja.selectedElements[i].elementModel.getProperty("matInv");
                    ctrOffset = MathUtils.transformVector(ctrOffset, matInv);
                    this._startOriginArray[i] = ctrOffset;
                }
                */

                // Update transform ctr for all elements if transform origin was modified
                if (!this._origin)  this._origin = this.calculateMultiSelOrigin();
                var globalCtr = this._origin;
                var len = this.application.ninja.selectedElements.length;
                for (var i=0;  i<len;  i++)
                {
                    // get the next element and localToGlobal matrix
                    elt = this.application.ninja.selectedElements[i];
                    var l2g = viewUtils.getLocalToGlobalMatrix( elt );
                    var g2l = glmat4.inverse( l2g, [] );
                    elt.elementModel.setProperty("g2l", g2l);
                    elt.elementModel.setProperty("l2g", l2g);

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

    Reset: {
        value: function() {
            var mat,
                iMat,
                dist,
                mod3dObject = [],
                self = this;

            this.application.ninja.selectedElements.forEach(function(element) {
                // Reset to the identity matrix
                iMat = Matrix.I(4);
                mat = ElementsMediator.getMatrix(element);
//                iMat[12] = mat[12];
//                iMat[13] = mat[13];
//                iMat[14] = mat[14];

                dist = ElementsMediator.getPerspectiveDist(element);

                var previousStyleStr = {dist:dist, mat:mat};
                var newStyleStr = {dist:dist, mat:iMat};

                mod3dObject.push({element:element, properties:newStyleStr, previousProperties: previousStyleStr});
            });

            ElementsMediator.set3DProperties(mod3dObject, "Change", "rotateTool");

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
                viewUtils.pushViewportObj( this.application.ninja.currentDocument.model.documentRoot );
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
