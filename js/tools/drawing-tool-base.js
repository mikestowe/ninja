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

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

var snapManager = require("js/helper-classes/3D/snap-manager").SnapManager;
var viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils;
var vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils;
var drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils;

exports.DrawingToolBase = Montage.create(Component, {

   dragPlane:
    {
        get: function () {
            return this.application.ninja.toolsData.selectedToolInstance._dragPlane;
        },
        set: function (value) {
            this.application.ninja.toolsData.selectedToolInstance._dragPlane = value;
        }
    },

    /**
     * Used on the initial MouseDown for Drawing Tools
     *
     * Returns: An array containing:
     *          0 - HitRec point
     *          1 - X value converted to screen point
     *          2 - Y value converted to screen point
     */
    getInitialSnapPoint: {
        value: function(x, y, shapeCanvas)
        {
            // update the snap settings
            snapManager.enableSnapAlign( snapManager.snapAlignEnabledAppLevel() );
            snapManager.enableElementSnap( snapManager.elementSnapEnabledAppLevel() );
            snapManager.enableGridSnap( snapManager.gridSnapEnabledAppLevel() );

            // do the snap
            this.dragPlane = null;
            var hitRec = snapManager.snap(x, y,  true);
            if (hitRec) {
                if (shapeCanvas)
                {
                    this.dragPlane = viewUtils.getUnprojectedElementPlane( shapeCanvas );
                    snapManager.setupDragPlaneFromPlane( this.dragPlane );
                }
                else
                {
                    this.dragPlane = snapManager.setupDragPlanes( hitRec, true );
                }
//              console.log( "drag plane: " + this.dragPlane );

                var wpHitRec = hitRec.convertToWorkingPlane( this.dragPlane );
                var pt = hitRec.getScreenPoint();

                return( [wpHitRec, pt[0], pt[1]] );
            }
        }
    },

    /**
     * Used on the Mouse Move to calculate new snap point.
     */
    getUpdatedSnapPoint: {
        value: function(x,y, snap3d, downHitRec) {
            // update the snap settings
            snapManager.enableSnapAlign( snapManager.snapAlignEnabledAppLevel() );
            snapManager.enableElementSnap( snapManager.elementSnapEnabledAppLevel() );
            snapManager.enableGridSnap( snapManager.gridSnapEnabledAppLevel() );

            var hitRec = snapManager.snap(x, y, snap3d );
            if (hitRec) {
//              if ((hitRec.getType() !== hitRec.SNAP_TYPE_STAGE) && !hitRec.isSomeGridTypeSnap()) {
//                  hitRec = hitRec.convertToWorkingPlane( snapManager.getDragPlane() );
//              }
//
//              if(downHitRec !== null) {
//                  // if we are working off-plane, do a snap to the projected locations of the geometry
//                  var thePlane = workingPlane;
//                  if (snapManager.hasDragPlane())
//                  {
//                      thePlane = snapManager.getDragPlane();
//                  }
//
//                    // Return the up HitRec
//                    return hitRec;
//              } else {
//                    return null;
//                }
                if(downHitRec) {
                    hitRec = hitRec.convertToWorkingPlane(this.dragPlane || downHitRec.getPlane());
                } else if ((hitRec.getType() !== hitRec.SNAP_TYPE_STAGE) && !hitRec.isSomeGridTypeSnap()) {
                    hitRec = hitRec.convertToWorkingPlane( snapManager.getDragPlane() );
                }
            }
            return hitRec;
        }
    },

    getUpdatedSnapPointNoAppLevelEnabling: {
        value: function(x,y, snap3d, downHitRec) {


            // do the first snap
            var hitRec = snapManager.snap(x, y, snap3d );
            if (hitRec) {
                if ((hitRec.getType() !== hitRec.SNAP_TYPE_STAGE) && !hitRec.isSomeGridTypeSnap()) {
                    hitRec = hitRec.convertToWorkingPlane( snapManager.getDragPlane() );
                }

                if(downHitRec !== null) {
                    // if we are working off-plane, do a snap to the projected locations of the geometry
                    var thePlane = workingPlane;
                    if (snapManager.hasDragPlane())
                    {
                        thePlane = snapManager.getDragPlane();
                    }

                    // Return the up HitRec
                    return hitRec;
                } else {
                    return null;
                }
            }
        }
    },


    setDownHitRec: {
        value: function (x, y, do3DSnap) {
            var hitRec = snapManager.snap(x, y, do3DSnap );
            if (hitRec) {
                if ((hitRec.getType() != hitRec.SNAP_TYPE_STAGE) && !hitRec.isSomeGridTypeSnap()) {
                    //hitRec = hitRec.convertToWorkingPlane( workingPlane );
                    snapManager.setupDragPlanes(hitRec);
                    hitRec = hitRec.convertToWorkingPlane( snapManager.getDragPlane() );
                }

            return hitRec;

            }
        }
    },

    drawSnapLastHit: {
        value: function() {
            snapManager.drawLastHit();
        }
    },

    getHitRecPos: {
        value: function (hitRec) {
            if (!hitRec)
                return null;

            // get the hit rec. points in plane space
            var psPos = hitRec.getLocalPoint();

            var stageOffset = viewUtils.getElementOffset(this.application.ninja.currentDocument.model.documentRoot);
            viewUtils.setViewportObj(this.application.ninja.currentDocument.model.documentRoot);

            // get the matrix taking the local hit point in plane space
            // to world space of whatever element it is in.
            var planeMat = hitRec.getPlaneMatrix();

            // get the center of the circle in stage world space
            var swPos = viewUtils.postViewToStageWorld(MathUtils.transformPoint(psPos, hitRec.getPlaneMatrix()), hitRec.getElt());

            //var swPos = hitRec.calculateStageWorldPoint(); todo figure out why we cannot just use this function instead of the above

            // the stage world space point is now relative to the center of the 3D space.  To
            // calculate the left and top offsets, this must be offset by the stage dimensions
            swPos[0] += snapManager.getStageWidth() / 2.0;
            swPos[1] += snapManager.getStageHeight() / 2.0;

            return swPos;
        }
    },

    getCompletePoints: {
        value: function(hitRec0, hitRec1) {
            if (hitRec0 && hitRec1) {

                // get the 2 snap points in plane space
                var p0 = hitRec0.getLocalPoint(),
                    p1 = hitRec1.getLocalPoint();

                var stageOffset = viewUtils.getElementOffset(this.application.ninja.currentDocument.model.documentRoot);
                viewUtils.setViewportObj(this.application.ninja.currentDocument.model.documentRoot);

                // get the matrix taking the local hit point in plane space
                // to world space of whatever element it is in.
                var planeMat = hitRec0.getPlaneMatrix();

                // get the center of the circle in stage world space
                var s0 = viewUtils.postViewToStageWorld( MathUtils.transformPoint(p0,hitRec0.getPlaneMatrix()), hitRec0.getElt() ),
                    s1 = viewUtils.postViewToStageWorld( MathUtils.transformPoint(p1,hitRec1.getPlaneMatrix()), hitRec1.getElt() );

                // apply the projected snap points
                var s0Proj = false,  s1Proj = false;

                // find a "reasonable" plane
                var thePlane = workingPlane.slice(0);
                if (snapManager.hasDragPlane())  {
                    thePlane = snapManager.getDragPlane();
                }

                var d0 = vecUtils.vecDot( 3, thePlane, s0 ) + thePlane[3],
                    d1 = vecUtils.vecDot( 3, thePlane, s1 ) + thePlane[3];
                var sign0 = MathUtils.fpSign( d0 ),  sign1 = MathUtils.fpSign( d1 );
                if ((sign0 !== 0) || (sign1 !== 0)) {
                    // we need to pick a different plane
                    if ( MathUtils.fpCmp(d0,d1) === 0 ) {
                        thePlane[3] = -vecUtils.vecDot(3, thePlane, s0);
                    } else {
                        var vec = vecUtils.vecSubtract(3,  s1, s0 );
                        var yAxis = [0,1,0];
                        var tmp = vecUtils.vecCross( 3,  vec, yAxis  );
                        var mag = vecUtils.vecMag(3, tmp);
                        if (MathUtils.fpSign(mag) === 0) {
                            thePlane = [0,0,1];
                            thePlane[3] = -vecUtils.vecDot(3, thePlane, s0);
                        } else {
                            var xAxis = vecUtils.vecCross( 3,  yAxis, tmp );
                            thePlane  = vecUtils.vecCross( 3,  xAxis, yAxis );
                            vecUtils.vecNormalize(3, thePlane, 1.0 );
                            thePlane[3] = -vecUtils.vecDot(3, thePlane, s0);
                        }
                    }

                    // recompute the plane matrix
                    planeMat = drawUtils.getPlaneToWorldMatrix(thePlane, MathUtils.getPointOnPlane(thePlane));
                }

                // unproject the bounds
                //var planeMatInv = planeMat.inverse();
                var planeMatInv = glmat4.inverse( planeMat, [] );
                //var midPt = this.unprojectPoints( s0, s1, planeMat, planeMatInv, s1Proj );
//              var midPt = this.unprojectPoints( s0, s1, planeMat, planeMatInv, true );

                // get the 4 points of the bounding box in 2D space
                p0 = MathUtils.transformPoint( s0, planeMatInv );
                p1 = MathUtils.transformPoint( s1, planeMatInv );

                // determine the midpoint of the oval
                //midPt = s0.add(s1);
                //midPt = midPt.multiply(0.5);
                //midPt = MathUtils.makeDimension3(midPt);
                var midPt = vec3.add(s0, s1, []);
                midPt = vecUtils.vecScale( 3, midPt, 0.5 );

                // the mid point is now relative to the center of the 3D space.  To
                // calculate the left and top offsets, this must be offset by the stage dimensions
                midPt[0] += snapManager.getStageWidth() / 2.0;
                midPt[1] += snapManager.getStageHeight() / 2.0;

                // calculate the width and height.
                var left  = p0[0];  var top    = p0[1];
                var right = p1[0];  var bottom = p1[1];
                var w = Math.abs(right - left),
                    h = Math.abs(bottom - top);

//                return ({"width":w, "height":h, "planeMat":planeMat, "midPt":midPt});
                var s0Offset = s0.slice(0);
                var s1Offset = s1.slice(0);

                s0Offset[0] += snapManager.getStageWidth() / 2.0;
                s0Offset[1] += snapManager.getStageHeight() / 2.0;
                s1Offset[0] += snapManager.getStageWidth() / 2.0;
                s1Offset[1] += snapManager.getStageHeight() / 2.0;
               return ({ "width": w, "height": h, "planeMat": planeMat, "midPt": midPt, "mouseDownPos": s0Offset, "mouseUpPos": s1Offset });
            } else {
                return null
            }
        }
    },

    cleanupSnap: {
        value: function() {
            // set the drag plane to the working plane
            snapManager.clear2DCache();
            snapManager.setupDragPlaneFromPlane( workingPlane );

            // update the snap settings
            snapManager.enableSnapAlign( snapManager.snapAlignEnabledAppLevel() );
            snapManager.enableElementSnap( snapManager.elementSnapEnabledAppLevel() );
            snapManager.enableGridSnap( snapManager.gridSnapEnabledAppLevel() );

        }
    },

    draw2DRectangle: {
        value: function(x0, y0, x1, y1) {
            var drawingContext = this.application.ninja.stage.drawingContext,
                drawingPrefs = this.application.ninja.stage.drawingContextPreferences;

            this.application.ninja.stage.clearDrawingCanvas();
            //TODO Save and restore state
            drawingContext.strokeStyle = drawingPrefs.color;
            drawingContext.lineWidth = drawingPrefs.thickness;
            drawingContext.strokeRect(x0 - 0.5 ,y0 - 0.5 ,x1 ,y1);
        }
    },

    /**
     * Feedback drawing functions
     */
    drawRectangle: {
        value: function(hitRec0, hitRec1) {
            var p0 = hitRec0.getLocalPoint(),
                p1 = hitRec1.getLocalPoint();

            var stageMat = viewUtils.getMatrixFromElement(this.application.ninja.currentDocument.model.documentRoot);
            var elt = hitRec0.getElt();
            if (!elt) {  elt = hitRec1.getElt();  }
            if (!elt) {  elt = this.application.ninja.currentDocument.model.documentRoot;  }
            if (elt)
            {
                viewUtils.pushViewportObj(elt);
                var offset = viewUtils.getElementOffset(elt);
                offset[2] = 0;

                // check the plane to draw the rectangle on
                var s0 = viewUtils.postViewToStageWorld( MathUtils.transformPoint(p0,hitRec0.getPlaneMatrix()), hitRec0.getElt() ),
                    s1 = viewUtils.postViewToStageWorld( MathUtils.transformPoint(p1,hitRec1.getPlaneMatrix()), hitRec1.getElt() );

                // find a "reasonable" plane
                var planeMat = hitRec0.getPlaneMatrix();
                var planeMatInv;
                var thePlane = workingPlane.slice(0);
                if (snapManager.hasDragPlane())
                {
                    thePlane = snapManager.getDragPlane();
                }
                var d0 = vecUtils.vecDot( 3, thePlane, s0 ) + thePlane[3],
                    d1 = vecUtils.vecDot( 3, thePlane, s1 ) + thePlane[3];
                var sign0 = MathUtils.fpSign( d0 ),  sign1 = MathUtils.fpSign( d1 );
                if ((sign0 !== 0) || (sign1 !== 0))
                {
                    // we need to pick a different plane
                    if ( MathUtils.fpCmp(d0,d1) === 0 ){
                        thePlane[3] = -vecUtils.vecDot(3, thePlane, s0);
                    }
                    else
                    {
                        var vec = vecUtils.vecSubtract(3,  s1, s0 );
                        var yAxis = [0,1,0];
                        var tmp = vecUtils.vecCross( 3,  vec, yAxis  );
                        var mag = vecUtils.vecMag(3, tmp);
                        if (MathUtils.fpSign(mag) === 0)
                        {
                            thePlane = [0,0,1];
                            thePlane[3] = -vecUtils.vecDot(3, thePlane, s0);
                        }
                        else
                        {
                            var xAxis = vecUtils.vecCross( 3,  yAxis, tmp );
                            thePlane  = vecUtils.vecCross( 3,  xAxis, yAxis );
                            vecUtils.vecNormalize(3, thePlane, 1.0 );
                            thePlane[3] = -vecUtils.vecDot(3, thePlane, s0);
                        }
                    }

                    // recompute the plane matrix
                    planeMat = drawUtils.getPlaneToWorldMatrix(thePlane, MathUtils.getPointOnPlane(thePlane));
                    //planeMatInv = planeMat.inverse();
                    planeMatInv = glmat4.inverse( planeMat, [] );

                    p0 = MathUtils.transformPoint(p0,hitRec0.getPlaneMatrix());
                    p0 = MathUtils.transformPoint(p0, planeMatInv);
                    p1 = MathUtils.transformPoint(p1,hitRec1.getPlaneMatrix());
                    p1 = MathUtils.transformPoint(p1, planeMatInv);
                }
                else {
                    //planeMatInv = planeMat.inverse();
                    planeMatInv = glmat4.inverse( planeMat, [] );
                }

                // determine if the geometry is going to be projected.  If so a second projected rectangle is drawn
                var isProjected = ((MathUtils.fpCmp(thePlane[2],1.0) !== 0) || (MathUtils.fpSign(thePlane[3]) !== 0));

                // TODO - We no longer need to project drawing after perspective fix. Need to clean up this code.
                // For now, just setting isProjected to false so rest of the drawing still works.
                isProjected = false;
                // get and draw the unprojected object points
                var projPtArr = [];
                if (isProjected)
                {
                    this.getProjectedObjectPoints( s0, s1, planeMat, planeMatInv, elt, stageMat, offset, projPtArr );

                }

                var localPt = [p0[0], p0[1], 0.0, 1.0];
                s0 = viewUtils.postViewToStageWorld( MathUtils.transformPoint(localPt,planeMat),  elt );
                s0 = vecUtils.vecAdd(3, viewUtils.viewToScreen( MathUtils.transformPoint(s0, stageMat) ), offset );

                localPt[1] = p1[1];
                s1 = viewUtils.postViewToStageWorld( MathUtils.transformPoint(localPt,planeMat),  elt );
                s1 = vecUtils.vecAdd(3, viewUtils.viewToScreen( MathUtils.transformPoint(s1, stageMat) ), offset );

                localPt[0] = p1[0];
                var s2 = viewUtils.postViewToStageWorld( MathUtils.transformPoint(localPt,planeMat),  elt );
                s2 = vecUtils.vecAdd(3, viewUtils.viewToScreen( MathUtils.transformPoint(s2, stageMat) ), offset );

                localPt[1] = p0[1];
                var s3 = viewUtils.postViewToStageWorld( MathUtils.transformPoint(localPt,planeMat),  elt );
                s3 = vecUtils.vecAdd(3, viewUtils.viewToScreen( MathUtils.transformPoint(s3, stageMat) ), offset );

                if ( isProjected)
                {
                    var unprojPtArr = [s0, s1, s2, s3];
                    this.application.ninja.stage.draw3DProjectedAndUnprojectedRectangles( unprojPtArr,  projPtArr );
                }
                else
                {
                    this.application.ninja.stage.draw3DSelectionRectangle(s0[0], s0[1],
                                                                        s1[0], s1[1],
                                                                        s2[0], s2[1],
                                                                        s3[0], s3[1],
                                                                        s0[0], s0[1]);
                }

                viewUtils.popViewportObj();
            }
        }
    },

    drawLine: {
        value: function (hitRec0, hitRec1, strokeSize, strokeColor) {
            var p0 = hitRec0.getScreenPoint(),
                p1 = hitRec1.getScreenPoint();
            this.application.ninja.stage.drawLine(p0[0], p0[1], p1[0], p1[1], strokeSize, strokeColor);
        }
    },

    /**
     *  Draw Helper Functions
     */

    /**
     * Returns a perfect square using the top/left/bottom/right values.
     */
    toSquare: {
        value: function(x0,x1,y0,y1) {
            var dw = 1;
            var dh = 1;

            var w = x1 - x0,
                h = y1 - y0;

            if(w < 0) dw = -1;
            if(h < 0) dh = -1;

            if(Math.abs(w) >= Math.abs(h)) {
                h = (Math.abs(w) * dh);
            } else {
                w = (Math.abs(h) * dw);
            }

            return [x0,y0,w,h];
        }
    },

    toCenterRectangle: {
        value: function(x0,x1,y0,y1) {
            var x,y,w,h = 0;

            x = x0 - (x1 - x0);
            y = y0 - (y1 - y0);
            w = x1 - x;
            h = y1 - y;

            return [x,y,w,h];
        }
    },




    /**
     * Helper Functions
     */

    unprojectPoints:
    {
        value: function( s0In, s1In, planeMat, planeMatInv,  fixedS1 ) {
            var s0 = s0In.slice(0);
            var s2 = s1In.slice(0);


            // calculate the mid point of the rectangle
            var midPt = vecUtils.vecAdd(3, s0, s2);
            vecUtils.vecScale(3, midPt, 0.5);
            s0[0] -= midPt[0];  s0[1] -= midPt[1];
            s2[0] -= midPt[0];  s2[1] -= midPt[1];

            // convert the 2 world space points to plane space
            var p0 = MathUtils.transformPoint( s0, planeMatInv ),
                p2 = MathUtils.transformPoint( s2, planeMatInv );
            var z = p0[2];

            // fill in the other 2 points on the plane to complete the 4 points
            var p1 = [p0[0], p2[1], z],
                p3 = [p2[0], p0[1], z];

            // convert back to 3D space
            s0 = MathUtils.transformPoint( p0, planeMat );
            var s1 = MathUtils.transformPoint( p1, planeMat );
            s2 = MathUtils.transformPoint( p2, planeMat );
            var s3 = MathUtils.transformPoint( p3, planeMat );

            // unproject the 4 points
            var i;
            var p = 1400;
            var ptArr = [ s0, s1, s2, s3 ];
            for (i=0;  i<4;  i++)
            {
                pt = ptArr[i];
                if (MathUtils.fpCmp(p,-pt[2]) !== 0){
                    z = pt[2]*p/(p + pt[2]);
                    var x = pt[0]*(p - z)/p,
                        y = pt[1]*(p - z)/p;


                    pt[0] = x;  pt[1] = y;  pt[2] = z;
                }
            }

            // back to 2D space...
            for (i=0;  i<4;  i++)
                ptArr[i] = MathUtils.transformPoint( ptArr[i], planeMatInv );

            // find the 2 diagonal points to use
            if (fixedS1)
            {
                p0 = ptArr[0];  p1 = ptArr[1];  p2 = ptArr[2];  p3 = ptArr[3];
                pt0 = p0.slice(0);  pt1 = p2.slice(0);
                z = pt0[2];
            }
            else
            {
                p0 = ptArr[0];  p1 = ptArr[1];  p2 = ptArr[2];  p3 = ptArr[3];
                z = p0[2];
                var pt0 = p0.slice(0), pt1 = p2.slice(0);
                if (p0[0] < p2[0]){
                    pt0[0] = Math.max(p0[0],p1[0]);
                    pt1[0] = Math.min(p2[0],p3[0]);
                }
                else {
                    pt0[0] = Math.min(p0[0],p1[0]);
                    pt1[0] = Math.max(p2[0],p3[0]);
                }
                if (p0[1] < p2[1]){
                    pt0[1] = Math.max(p0[1],p3[1]);
                    pt1[1] = Math.min(p1[1],p2[1]);
                }
                else {
                    pt0[1] = Math.min(p0[1],p3[1]);
                    pt1[1] = Math.max(p1[1],p2[1]);
                }
            }
            pt0[2] = z;  pt1[2] = z;

            var ctr = vecUtils.vecAdd(3, pt0, pt1);
            vecUtils.vecScale( 3, ctr, 0.5 );

            // put the diagonal points back in 3D space
            s0  = MathUtils.transformPoint( pt0, planeMat );
            s1  = MathUtils.transformPoint( pt1, planeMat );
            ctr = MathUtils.transformPoint( ctr, planeMat );

            // add the translation back in
             s0[0] += midPt[0];   s0[1] += midPt[1];
             s1[0] += midPt[0];   s1[1] += midPt[1];
            ctr[0] += midPt[0];  ctr[1] += midPt[1];

            // set the returned values
            s0In[0] = s0[0];  s0In[1] = s0[1];  s0In[2] = s0[2];
            s1In[0] = s1[0];  s1In[1] = s1[1];  s1In[2] = s1[2];

            return ctr;
        }
    },

    getProjectedObjectPoints:
    {
        value: function( u0, u1, planeMat, planeMatInv, elt, stageMat, offset, rtnScrPts ){
            var s0 = u0.slice(0);
            var s2 = u1.slice(0);

            var i, z;

            // calculate the mid point of the rectangle
            var midPt = vecUtils.vecAdd(3, s0, s2);
            vecUtils.vecScale(3, midPt, 0.5);
            s0[0] -= midPt[0];  s0[1] -= midPt[1];
            s2[0] -= midPt[0];  s2[1] -= midPt[1];

            // unproject the 2 points
            var p = 1400;
            var ptArr = [ s0, s2 ];
            for (i=0;  i<2;  i++)
            {
                pt = ptArr[i];
                if (MathUtils.fpCmp(p,-pt[2]) !== 0) {
                    z = pt[2]*p/(p + pt[2]);
                    var x = pt[0]*(p - z)/p,
                        y = pt[1]*(p - z)/p;
                        y = pt[1]*(p - z)/p;

                    pt[0] = x;  pt[1] = y;  pt[2] = z;
                }
            }

            // back to 2D space...
            for (i=0;  i<2;  i++)
                ptArr[i] = MathUtils.transformPoint( ptArr[i], planeMatInv );

            // fill in the other 2 points on the plane to complete the 4 points
            var pt0 = ptArr[0],  pt2 = ptArr[1];
            z = pt0[2];
            pt0[2] = z;  pt2[2] = z;
            var pt1 = [pt0[0], pt2[1], z],
                pt3 = [pt2[0], pt0[1], z];

            //
            ptArr = [pt0, pt1, pt2, pt3];
            var pt;
            var dist, scale, pDist = 1400;  // elt.webkitTransform is not always defined.
            for (i=0;  i<4;  i++)
            {
                // put the point back in 3D space
                pt = MathUtils.transformPoint( ptArr[i], planeMat );

                // apply the perspective
                dist = pDist - pt[2];
                if (MathUtils.fpSign(dist) !== 0)
                {
                    scale = pDist / dist;
                    pt[0] *= scale;
                    pt[1] *= scale;
                    pt[2] *= scale;
                }

                // add the translation back in
                pt[0] += midPt[0];  pt[1] += midPt[1];

                // to screen coordinates
                pt = viewUtils.postViewToStageWorld( pt,  elt );
                pt = vecUtils.vecAdd(3, viewUtils.viewToScreen( MathUtils.transformPoint(pt, stageMat) ), offset );

                // save the final result
                rtnScrPts[i] = pt;
            }
        }
    }

});

