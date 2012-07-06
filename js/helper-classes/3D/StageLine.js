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

///////////////////////////////////////////////////////////////////////
// Class StageLine
//      The line class represents a line intersected with all planes on the scene
///////////////////////////////////////////////////////////////////////
var vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils;
var LinePlaneIntersectRec = require("js/helper-classes/3D/LinePlaneIntersectRec").LinePlaneIntersectRec;

var StageLine = exports.StageLine = Object.create(Object.prototype, {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////

    // the 2 points of the line
    _pt0: { value: null, writable: true },
    _pt1: { value: null, writable: true },

    // cache the 3D min and max points for the line
    _minPt: { value: null, writable: true },
    _maxPt: { value: null, writable: true },

    // the visibility at the start point (this._pt0).
    _vis: { value: null, writable: true },

    // each line/plane intersection records 2 values:  the parameter along
    // the line from pt0 to pt1, and the change in visibility (+1 or -1).  we
    // keep a doubly-linked list of intersection records
    _intersectionList: { value: null, writable: true },
    _intersectionCount: { value: 0, writable: true },

    ///////////////////////////////////////////////////////////////////////
    // Property accessors
    ///////////////////////////////////////////////////////////////////////
    getMinPoint: { value: function()    {  return this._minPt.slice(0);     } },
    getMaxPoint: { value: function()    {  return this._maxPt.slice(0);        } },

    getPoint0: { value: function()    {  return this._pt0.slice(0);          } },
    getPoint1: { value: function()    {  return this._pt1.slice(0);          } },

    getIntersectionCount: { value: function()    {  return this._intersectionCount;  } },
    getIntersectionList: { value: function()    {  return this._intersectionList;   } },

    getVisibility: { value: function()    { return this._vis;                 } },
    setVisibility: { value: function(v)   {  this._vis = v;                   } },

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////

    intersectWithPlane: {
        value: function( plane )
        {
            // if the plane is edge-on, ignore it
            if ( MathUtils.fpSign( plane.getPlaneEq()[2] ) == 0 )  return;

            // do some quick box tests.
            var minPt = this.getMinPoint(),
                    maxPt = this.getMaxPoint();

            if (maxPt[0] < plane._rect.getLeft())     return;
            if (minPt[0] > plane._rect.getRight())    return;

            if (maxPt[1] < plane._rect.getTop())      return;
            if (minPt[1] > plane._rect.getBottom())   return;

            if (minPt[2] > plane.getZMax())           return;

            // get the boundary points for the plane
            var boundaryPts = plane.getBoundaryPoints();

            // get the points and direction vector for the current line
            var pt0 = this.getPoint0(),  pt1 = this.getPoint1();
            //var lineDir = pt1.subtract( pt0 );
            var lineDir = vecUtils.vecSubtract(3, pt1, pt0);

            // intersect with the front plane
            var planeEq = plane.getPlaneEq();
            var t = MathUtils.vecIntersectPlaneForParam( pt0, lineDir, planeEq );
            if (t != undefined)
            {
                if ((MathUtils.fpSign(t) >= 0) && (MathUtils.fpCmp(t,1.0) <= 0))
                {
                    // get the intersection point
                    var pt = MathUtils.interpolateLine3D( pt0, pt1, t );

                    // see if the intersection point is contained in the bounds
                    //var contains = this.boundaryContainsPoint( boundaryPts, plane.isBackFacing(), pt );
                    var contains = MathUtils.boundaryContainsPoint( boundaryPts, pt, plane.isBackFacing() );
                    if (contains == MathUtils.INSIDE)
                    {
                        // add the intersection
                        var dot = MathUtils.dot3( pt0, planeEq ) + planeEq[3];
                        var deltaVis = (dot > 0) ? 1 : -1;
//					if (plane.isBackFacing())
//                        deltaVis = (dot < 0) ? 1 : -1;

                        this.addIntersection( plane, t, deltaVis );
                    }
                    else if (contains == MathUtils.ON)
                    {
                        if (MathUtils.fpCmp(t,1.0) < 0)
                        {
                            // take the dot product between the line and the normal to the plane
                            // to determine the change in visibility
                            var vec = vecUtils.vecSubtract( 3, pt1, pt0 );
                            var dot = vecUtils.vecDot( 3, vec, plane.getPlaneEq() );
                            var sign = MathUtils.fpSign( dot );
                            if (sign == 0)
                                throw new Error( "coplanar intersection being treated as not coplanar" );
                            if (!plane.isBackFacing())
                            {
                                if (sign < 0)
                                    this.addIntersection( plane, t, 1 );
                            }
                            else
                            {
                                if (sign > 0)
                                    this.addIntersection( plane, t, -1 );
                            }
                        }
                    }
                }
            }
            else
            {
                // the line must be parallel to the plane.  If the line is in the plane,
                // we need to do some special processing
                var d0 = vecUtils.vecDot(3, planeEq, pt0) + planeEq[3],
                        d1 = vecUtils.vecDot(3, planeEq, pt1) + planeEq[3];
                if ((MathUtils.fpSign(d0) == 0) && (MathUtils.fpSign(d1) == 0))
                    this.doCoplanarIntersection( plane );
            }

            // intersect with the 4 planes formed by the edges of the plane, going back in Z
            var bPt1 = boundaryPts[3];
            for (var i=0;  i<4;  i++)
            {
                // get the 2 points that define the front edge of the plane
                var bPt0 = bPt1;
                var bPt1 = boundaryPts[i];

                // calculate the plane equation.  The normal should point towards the OUTSIDE of the boundary
                //var vec = bPt1.subtract( bPt0 );
                var vec = vecUtils.vecSubtract(3, bPt1, bPt0);
                if (plane.isBackFacing())
                    MathUtils.negate( vec );
                planeEq = [-vec[1], vec[0], 0];
                var normal = [planeEq[0], planeEq[1], planeEq[2]];
//			var d = -planeEq.dot(bPt0);
                var d = -vecUtils.vecDot(3, planeEq, bPt0);
                planeEq[3] = d;

                t = MathUtils.vecIntersectPlaneForParam( pt0, lineDir, planeEq );
                if (t)
                {
                    if ((MathUtils.fpSign(t) > 0) && (MathUtils.fpCmp(t,1.0) <= 0))	// the strict vs not-strict inequality comparisons are IMPORTANT!
                    {
                        // get the intersection point
                        var pt = MathUtils.interpolateLine3D( pt0, pt1, t );

                        // we need to get the parameter on the edge of the projection
                        // of the intersection point onto the line.
                        var index = (Math.abs(vec[0]) > Math.abs(vec[1])) ? 0 : 1;
                        var tEdge = (pt[index] - bPt0[index])/(bPt1[index] - bPt0[index]);
                        if ((MathUtils.fpSign(tEdge) > 0) && (MathUtils.fpCmp(tEdge,1.0) <= 0))
                        {
                            var edgePt = MathUtils.interpolateLine3D( bPt0, bPt1, tEdge );
                            if (MathUtils.fpCmp(pt[2],edgePt[2]) < 0)
                            {
                                // add the intersection
                                var deltaVis = MathUtils.dot(lineDir,normal) > 0 ? -1 : 1;
                                this.addIntersection( plane, t, deltaVis );
                            }
                        }
                    }
                }
            }
        }
    },

	doCoplanarIntersection: {
		value: function( plane )
		{
			// get the boundary points for the plane
			var boundaryPts = plane.getBoundaryPoints();
			var planeEq = plane.getPlaneEq();

			if (plane.isBackFacing())
			{
				var tmp;
				tmp = boundaryPts[0];  boundaryPts[0] = boundaryPts[3];  boundaryPts[3] = tmp;
				tmp = boundaryPts[1];  boundaryPts[1] = boundaryPts[2];  boundaryPts[2] = tmp;
			}

			var pt0 = this.getPoint0(),
				pt1 = this.getPoint1();

			// keep a couple flags to prevent counting crossings twice in edge cases
			var gotEnter = false,
					gotExit = false;

			var bp1 = boundaryPts[3];
			for (var i=0;  i<4;  i++)
			{
				var bp0 = bp1;
				bp1 = boundaryPts[i];
				var vec = vecUtils.vecSubtract(3, bp1, bp0);
				var nrm = vecUtils.vecCross(3, vec, planeEq);
				nrm[3] = -vecUtils.vecDot(3, bp0, nrm);

				var d0 = vecUtils.vecDot(3, nrm, pt0) + nrm[3],
						d1 = vecUtils.vecDot(3, nrm, pt1) + nrm[3];

				var s0 = MathUtils.fpSign(d0),
						s1 = MathUtils.fpSign(d1);

				if (s0 != s1)
				{
					var t = Math.abs(d0)/( Math.abs(d0) + Math.abs(d1) );
					if (t == 0)
					{
						if (s1 > 0)	// entering the material from the beginning of the line that is to be drawn
						{
							// see if the start point of the line is at a corner of the bounded plane
							var lineDir = vecUtils.vecSubtract(3, pt1, pt0);
							vecUtils.vecNormalize(3, lineDir);
							var dist = vecUtils.vecDist( 3, pt0, bp1 );
							var bp2, bv0, bv1, cross1, cross2, cross3;
							if ( MathUtils.fpSign(dist) == 0)
							{
								bp2 = boundaryPts[(i+1) % 4];
								bv0 = vecUtils.vecSubtract(3, bp2, bp1);
								bv1 = vecUtils.vecSubtract(3, bp0, bp1);
								cross1 = vecUtils.vecCross(3, bv0, lineDir);
								cross2 = vecUtils.vecCross(3, lineDir, bv1);
								cross3 = vecUtils.vecCross(3, bv0, bv1);
								if ( (MathUtils.fpSign(vecUtils.vecDot(3, cross1, cross3)) == 0) && (MathUtils.fpSign(vecUtils.vecDot(3, cross2, cross3)) == 0))
								{
									gotEnter = true;
									this.addIntersection( plane, t, 1 );
								}
							}
							else if (MathUtils.fpSign( vecUtils.vecDist(3, pt0, bp0)) === 0)
							{
								bp2 = boundaryPts[(i+2) % 4];
								bv0 = vecUtils.vecSubtract(3, bp2, bp0);
								bv1 = vecUtils.vecSubtract(3, bp1, bp0);
								cross1 = vecUtils.vecCross(3, bv0, lineDir);
								cross2 = vecUtils.vecCross(3, lineDir, bv1);
								cross3 = vecUtils.vecCross(3, bv0, bv1);
								if ( (MathUtils.fpSign(vecUtils.vecDot(3, cross1, cross3)) == 0) && (MathUtils.fpSign(vecUtils.vecDot(3, cross2, cross3)) == 0))
								{
									gotEnter = true;
									this.addIntersection( plane, t, 1 );
								}
							}
							else
							{
								// check if the line is on the edge of the boundary or goes to the interior
								gotEnter = true;
								this.addIntersection( plane, t, 1 );
							}
						}
					}
					else if ( (MathUtils.fpSign(t) > 0) && (MathUtils.fpCmp(t,1.0) <= 0))
					{
						// get the point where the line crosses the edge of the element plane
						var pt = MathUtils.interpolateLine3D(pt0, pt1, t );

						// we know that the line crosses the infinite extension of the edge.  Determine
						// if that crossing is within the bounds of the edge
						var dot0 = vecUtils.vecDot(3, vecUtils.vecSubtract(3,pt, bp0),  vec),
								dot1 = vecUtils.vecDot(3, vecUtils.vecSubtract(3,pt, bp1),  vec);
						if ((MathUtils.fpSign(dot0) > 0) && (MathUtils.fpSign(dot1) < 0))
						{
							// determine if the line is entering or exiting
							if (s0 <= 0)		// entering
							{
								if (!gotEnter)
								{
									gotEnter = true;
									this.addIntersection( plane, t, 1 );
								}
							}
							else if (s0 > 0) // exiting
							{
								if (!gotExit)
								{
									gotExit = true;
									this.addIntersection( plane, t, -1 );
								}
							}
							else	// s0 == 0
							{
								// TODO
							}
						}
						else if ((MathUtils.fpSign(dot0) == 0) && (MathUtils.fpSign(dot1) < 0))
						{
							var j = i - 2;
							if (j < 0)  j += 4;
							var bp = boundaryPts[j];

							var v0 = vecUtils.vecSubtract( 3, bp, bp0 ),
									v1 = vec;

							if (s0 <= 0)
							{
								var v = vecUtils.vecSubtract(3, pt1, pt0);
								if ((MathUtils.fpSign(vecUtils.vecCross(3, v0,v)) > 0) && (MathUtils.fpSign(vecUtils.vecCross(3, v,v1)) > 0))
								{
									gotEnter = true;
									this.addIntersection( plane, t, 1 );
								}
							}
							else if (s0 > 0)
							{
								var v = vecUtils.vecSubtract(3, pt0, pt1);	// note the reversed order from the previous case
								if ((MathUtils.fpSign(vecUtils.vecCross(3, v0,v)) > 0) && (MathUtils.fpSign(vecUtils.vecCross(3, v,v1)) > 0))
								{
									gotEnter = true;
									this.addIntersection( plane, t, -1 );
								}
							}
						}
						else if ((MathUtils.fpSign(dot0) > 0) && (MathUtils.fpSign(dot1) == 0))
						{
							var j = (i + 1) % 4;
							var bp = boundaryPts[j];

							var v1 = vec.slice(0),
									v0 = vecUtils.vecSubtract( 3, bp, bp1 ),
									v1 = vecUtils.vecNegate(3, v1);

							if (s0 <= 0)
							{
								var v = vecUtils.vecSubtract(3, pt1, pt0);
								if ((MathUtils.fpSign(vecUtils.vecCross(3, v0,v)) < 0) && (MathUtils.fpSign(vecUtils.vecCross(3, v,v1)) < 0))
								{
									gotEnter = true;
									this.addIntersection( plane, t, 1 );
								}
							}
							else if (s0 > 0)
							{
								var v = vecUtils.vecSubtract(3, pt0, pt1);	// note the reversed order from the previous case
								if ((MathUtils.fpSign(vecUtils.vecCross(3, v0,v)) > 0) && (MathUtils.fpSign(vecUtils.vecCross(3, v,v1)) > 0))
								{
									gotEnter = true;
									this.addIntersection( plane, t, -1 );
								}
							}
						}
					}
				}
			}
		}
	},

    removeIntersections: {
        value: function()
        {
            this._intersectionList = null;
            this._intersectionCount = 0;
        }
    },

    addIntersection: {
        value: function( plane, t,  deltaVis )
        {
            // create the intersection record
            var iRec = Object.create(LinePlaneIntersectRec, {});
            iRec.setStageLine( this );
            iRec.setElementPlanes( plane );
            iRec.setT( t );
            iRec.setDeltaVis( deltaVis );

            // the intersection array needs to be sorted by t
            var ptr = this._intersectionList;
            var last = null;
            while (ptr && (t > ptr.getT()))
            {
                last = ptr;
                ptr = ptr.getNext();
            }
            if (ptr == null)
            {
                if (last == null)
                    this._intersectionList = iRec;
                else
                {
                    last.setNext( iRec );
                    iRec.setPrev( last );
                }
            }
            else
            {
                if (last != null)
                {
                    last.setNext( iRec );
                    iRec.setPrev( last );
                }
                else
                    this._intersectionList = iRec;

                ptr.setPrev( iRec );
                iRec.setNext( ptr );
            }

            this._intersectionCount++;
        }
    },

	boundaryContainsPoint: {
        value: function( boundaryPts, backFacing, pt )
        {
            // the computation is done in 2D.
            // this method returns false if the point is 'on' or outside the boundary

            var pt1 = boundaryPts[3];
            for (var i=0;  i<4;  i++)
            {
                var pt0 = pt1;
                var pt1 = boundaryPts[i];
                //var	vec0 = pt1.subtract( pt0 ),
                //	vec1 =  pt.subtract( pt0 );
                var vec0 = vecUtils.vecSubtract(3, pt1, pt0),
                    vec1 = vecUtils.vecSubtract(pt, pt0);

    //			var cross = vec0.cross( vec1 );
                var cross = vecUtils.vecCross(3, vec0, vec1);
                var inside;
                if (backFacing)
                    inside = (MathUtils.fpSign(cross[2]) > 0);
                else
                    inside = (MathUtils.fpSign(cross[2]) < 0);

                if (!inside)  return false;
            }

            return true;
	    }
    },

    setPoints: {
        value: function( pt0, pt1 )
        {
            this._pt0 = pt0.slice(0);
            this._pt1 = pt1.slice(0);

            // get the 3D bounds
            var  xMin, xMax,  yMin, yMax,  zMin, zMax;
            if (pt0[0] < pt1[0])  {  xMin = pt0[0];  xMax = pt1[0];  }  else  {  xMin = pt1[0];  xMax = pt0[0];  }
            if (pt0[1] < pt1[1])  {  yMin = pt0[1];  yMax = pt1[1];  }  else  {  yMin = pt1[1];  yMax = pt0[1];  }
            if (pt0[2] < pt1[2])  {  zMin = pt0[2];  zMax = pt1[2];  }  else  {  zMin = pt1[2];  zMax = pt0[2];  }

            this._minPt = [xMin, yMin, zMin];
            this._maxPt = [xMax, yMax, zMax];
        }
    }//,

//    getIntersectionParameter: {
//        value: function( index )
//        {
//            var tRtn;
//            if (this._paramArray)
//            {
//                if ((index >= 0) && (index < this._intersectionCount))
//                {
//                    var count = 0;
//                    var iRec = this._intersectionList;
//                    while (count < index)
//                        iRec = iRec.getNext();
//                    tRtn = iRec.getT();
//                }
//            }
//
//            return tRtn;
//        }
//    },
//
//    getVisibilityChange: {
//        value: function( index )
//        {
//            var delta;
//            if ((index >= 0) && (index < this._intersectionCount))
//            {
//                var count = 0;
//                var iRec = this._intersectionList;
//                while (count < index)
//                    iRec = iRec.getNext();
//                delta = iRec.getDeltaVis();
//            }
//
//            return delta;
//        }
//    }

});


