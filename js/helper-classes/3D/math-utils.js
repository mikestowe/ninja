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
// Class Utils
//      Math Utility functions
///////////////////////////////////////////////////////////////////////
var VecUtils = require("js/helper-classes/3D/vec-utils").VecUtils,
	ViewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
	Rectangle = require("js/helper-classes/3D/rectangle").Rectangle;

var MathUtilsClass = exports.MathUtilsClass = Object.create(Object.prototype, {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
//    VecUtils: { value: null, writable: true },
    
    EPSILON: { value: 1.e-5, writable: true },

    // these are used in containment tests
    INSIDE: { value: -1, writable: true },
    ON: { value: 0, writable: true },
    OUTSIDE: { value: 1, writable: true },

    PI2: { value: 2*Math.PI, writable: true },
    RAD_TO_DEG: { value: 180/Math.PI, writable: true },
    DEG_TO_RAD: { value: Math.PI/180, writable: true },

    ///////////////////////////////////////////////////////////////////////
    // Property accessors
    ///////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////
    // Vector Methods
    ///////////////////////////////////////////////////////////////////////

	vecIntersectPlaneForParam: {
        value: function( pt0, vec, plane )
        {
            // declare the variable to return - undefined when there is no solution
            var param;

            var     a = plane[0],  b = plane[1], c = plane[2], d = plane[3];
            var     dx = vec[0],  dy = vec[1],  dz = vec[2];
            var     x0 = pt0[0],  y0 = pt0[1],  z0 = pt0[2];

            var numerator = -(a*x0 + b*y0 + c*z0 + d);
            var denominator = a*dx + b*dy + c*dz;

            var rtnPt;
            if (this.fpSign(denominator) != 0)
                param = numerator / denominator;

            return param;
        }
    },

	vecMag3: {
        value: function( vec )
        {
            if (vec.length < 3)  return;
            var mag = vec[0]*vec[0] + vec[1]*vec[1] + vec[2]*vec[2];
            mag = Math.sqrt( mag );
            return mag;
        }
    },

	vecMag: {
        value: function( dimen, vec )
        {
            var sum = 0.0;
            for (var i=0;  i<dimen;  i++)
                sum += vec[i]*vec[i];
            return Math.sqrt( sum );
        }
    },

	vecSubtract: {
        value: function( a, b )
        {
            var rtnVec;
            var n = a.length;
            if (b.length < n)  n = b.length;
            if (n > 0)
            {
                rtnVec = [0];
                for (var i=0;  i<n;  i++)
                    rtnVec[i] = a[i] - b[i];
            }

            return rtnVec;
        }
    },

	vecAdd: {
        value: function( a, b )
        {
            var rtnVec;
            var n = a.length;
            if (b.length < n)  n = b.length;
            if (n > 0)
            {
                rtnVec = [0];
                for (var i=0;  i<n;  i++)
                    rtnVec[i] = a[i] + b[i];
            }

            return rtnVec;
        }
    },

	vecDist: {
        value: function( a, b )
        {
            var sum;
            var n = a.length;
            if (b.length < n)  n = b.length;
            if (n > 0)
            {
                var sum = 0.0;
                for (var i=0;  i<n;  i++)
                {
                    var d = a[i] - b[i];
                    sum += d*d;
                }

                sum = Math.sqrt( sum );
            }

            return sum;
        }
    },

    vecIntersectPlane: {
        value: function( pt0, vec, plane )
        {
            // declare the return point.  May be undefined in ill-conditioned cases.
            var rtnPt;

            var t = this.vecIntersectPlaneForParam( pt0, vec, plane );
            if (t != undefined)
            {
                var     x0 = pt0[0],  y0 = pt0[1],  z0 = pt0[2];
                var     dx = vec[0],  dy = vec[1],  dz = vec[2];
                rtnPt = [x0 + t*dx, y0 + t*dy, z0 + t*dz] ;
            }

            return rtnPt;
        }
    },

	getPointOnPlane: {
        value: function( plane )
        {
            // abreviate the plane equation
            var a = plane[0],  b = plane[1],  c = plane[2],  d = plane[3];

            var x = 0.0,  y = 0.0,  z = 0.0;
            if ( Math.abs(plane[0]) > Math.abs(plane[1]) )
            {
                if ( Math.abs(plane[0]) > Math.abs(plane[2]) )
                    x = -d/a;
                else
                    z = -d/c;
            }
            else
            {
                if (Math.abs(plane[1]) > Math.abs(plane[2]) )
                    y = -d/b;
                else
                    z = -d/c;
            }

            // get the point on the plane
            return [x, y, z];
        }
    },

	transformPlane: {
        value: function( plane,  mat )
        {
            // we will project a point down one of the coordinate axes to find a point on the plane
            // that point and the normal to the plane will be transformed by the matrix, and the 'd'
            // component of the plane equation will be reset using the new normal and point.

            // find a point on the plane
            var ptOnPlane = this.getPointOnPlane(plane);

            ptOnPlane[3] = 1.0;	// 4 dimen so we can transform it

            // transform the point
            //ptOnPlane = mat.multiply( ptOnPlane );
            ptOnPlane = glmat4.multiplyVec3(mat, ptOnPlane, []);
            plane = this.transformVector( plane, mat );
            plane[3] = -this.dot3(plane, ptOnPlane );

            return plane;
        }
    },

	transformHomogeneousPoint: {
        value: function( srcPt, mat )
        {
            var pt = srcPt.slice(0);
            this.makeDimension4( pt );
            var	x = VecUtils.vecDot(4,  pt, [mat[0], mat[4], mat[ 8], mat[12]] ),
                    y = VecUtils.vecDot(4,  pt, [mat[1], mat[5], mat[ 9], mat[13]] ),
                    z = VecUtils.vecDot(4,  pt, [mat[2], mat[6], mat[10], mat[14]] ),
                    w = VecUtils.vecDot(4,  pt, [mat[3], mat[7], mat[11], mat[15]] );

            return [x, y, z, w];
        }
    },

	applyHomogeneousCoordinate: {
        value: function( hPt )
        {
            var w = hPt[3];
            hPt[0] /= w;
            hPt[1] /= w;
            hPt[2] /= w;
            hPt[3]  = 1;

            return hPt;
        }
    },

	transformAndDivideHomogeneousPoint: {
        value: function( pt, mat )
        {
            return this.applyHomogeneousCoordinate( this.transformHomogeneousPoint(pt, mat) );
        }
    },

	transformPoint: {
        value: function( srcPt, mat )
        {
            var pt = srcPt.slice(0);
            this.makeDimension3( pt );
            var	x = VecUtils.vecDot(3,  pt, [mat[0], mat[4], mat[ 8]] ) + mat[12],
                    y = VecUtils.vecDot(3,  pt, [mat[1], mat[5], mat[ 9]] ) + mat[13],
                    z = VecUtils.vecDot(3,  pt, [mat[2], mat[6], mat[10]] ) + mat[14];

            return [x, y, z];
        }
    },

	transformVector: {
        value: function( vec, mat )
        {
            this.makeDimension3( vec );
            var	x = VecUtils.vecDot(3,  vec, [mat[0], mat[4], mat[ 8]] ),
                    y = VecUtils.vecDot(3,  vec, [mat[1], mat[5], mat[ 9]] ),
                    z = VecUtils.vecDot(3,  vec, [mat[2], mat[6], mat[10]] );

            return [x, y, z];
        }
    },

	interpolateLine3D: {
        value: function( pt0, pt1, t )
        {
            var x0 = pt0[0],  y0 = pt0[1],  z0 = pt0[2],
                    x1 = pt1[0],  y1 = pt1[1],  z1 = pt1[2];
            var pt = [ x0 + t*(x1 - x0), y0 + t*(y1 - y0), z0 + t*(z1 - z0) ];

            return pt;
        }
    },


    dot: {
        value: function( v0, v1 )
        {
            var dimen = v0.length;
            if (v1.length < v0.length)  dimen = v1.length;

            var sum = 0.0;
            for (var i=0;  i<dimen;  i++)
                sum += v0[i] * v1[i];

            return sum;
        }
    },

    dot3: {
        value: function( v0, v1 )
        {
            var sum = 0.0;
            if ((v0.length < 3) || (v1.length < 3))  return;
            for (var i=0;  i<3;  i++)
                sum += v0[i] * v1[i];

            return sum;
        }
    },

    dot2: {
        value: function( v0, v1 )
        {
            if ((v0.length < 2) || (v1.length < 2))  return;
            var sum  = v0[0]*v1[0] + v0[1]*v1[1];
            return sum;
        }
    },

    cross: {
        value: function( v0, v1 )
        {
            var rtnVal;
            if ((v0.length == 2) && (v1.length == 2))
                rtnVal = v0[0]*v1[1] - v0[1]*v1[0];
            else if ((v0.length == 3) && (v1.length == 3))
                rtnVal = VecUtils.vecCross(3, v0, v1 );

            return rtnVal;
        }
    },

    negate: {
        value: function( v )
        {
            var dimen = v.length;
            for (var i=0;  i<dimen;  i++)
                v[i] = -v[i];

            return v;
        }
    },

    //returns the intersection point between the two segments (null if no intersection)
    segSegIntersection2D: {
        value: function (seg0Start, seg0End, seg1Start, seg1End, epsilon, mustLieInSegements) {
            //check for parallel segments
            var denom = (seg1End[1] - seg1Start[1]) * (seg0End[0] - seg0Start[0]) - (seg1End[0] - seg1Start[0]) * (seg0End[1] - seg0Start[1]);
            if (Math.abs(denom) <= epsilon) {
                return null; //no intersection reported for segments that are close to parallel or parallel
            }

            //the parameter value of intersection point on seg0
            var paramSeg0 = (seg1End[0] - seg1Start[0]) * (seg0Start[1] - seg1Start[1]) - (seg1End[1] - seg1Start[1]) * (seg0Start[0] - seg1Start[0]);
            paramSeg0 /= denom;

            //the parameter value of intersection point on seg1
            var paramSeg1 = (seg0End[0] - seg0Start[0]) * (seg0Start[1] - seg1Start[1]) - (seg0End[1] - seg0Start[1]) * (seg0Start[0] - seg1Start[0]);
            paramSeg1 /= denom;

            //check whether the parameters are both between 0 and 1
            if (mustLieInSegements && (Math.abs(paramSeg0) > 1.0 || Math.abs(paramSeg1) > 1.0)) {
                return null; //no intersection unless the the intersection point lies on both segments
            }

            var intPt = [seg0Start[0] + paramSeg0 * (seg0End[0] - seg0Start[0]), seg0Start[1] + paramSeg0 * (seg0End[1] - seg0Start[1])];

            return intPt;
        }
    }, //this.segSegIntersection = function (seg0, seg1)

    distPointToRay: {
        value: function (pt, rayOrig, rayDir)
        {
            var rayMagSq = rayDir[0]*rayDir[0] + rayDir[1]*rayDir[1] + rayDir[2]*rayDir[2]; //sq. of the ray direction magnitude (need not be 1)
            //find the projection of pt on ray
            var U = (
                    ( (pt[0] - rayOrig[0] ) * ( rayDir[0]) ) +
                            ( (pt[1] - rayOrig[1] ) * ( rayDir[1]) ) +
                            ( (pt[2] - rayOrig[2] ) * ( rayDir[2]) )
                    ) / ( rayMagSq );

            if( U < 0.0 ) {
                // closest point falls behind rayOrig
                // so return the min. of distance to rayOrig
                return this.vecDist(rayOrig, pt);
            }//if( U < 0.0) {

            var intersection = [ rayOrig[0] + U * (rayDir[0]), rayOrig[1] + U * (rayDir[1]), rayOrig[2] + U * (rayDir[2])];

            return this.vecDist(intersection, pt);
        }
    },

    //returns the parameter value of projection of pt on SegP0P1 (param. at P0 is 0, param at P1 is 1)
    paramPointProjectionOnSegment: {
        value: function(pt, segP0, segP1){
            var segMag = this.vecDist(segP0, segP1);

            return (
                    ( (pt[0] - segP0[0] ) * ( segP1[0] - segP0[0]) ) +
                            ( (pt[1] - segP0[1] ) * ( segP1[1] - segP0[1]) ) +
                            ( (pt[2] - segP0[2] ) * ( segP1[2] - segP0[2]) )
            ) / ( segMag * segMag );
        }
    },

    //returns the distance of pt to segment P0P1
    // note the distance is to segment, not to line
    distPointToSegment: {
        value: function (pt, segP0, segP1)
        {
            var U = this.paramPointProjectionOnSegment(pt, segP0, segP1);
            if( U < 0.0 || U > 1.0 ) {
                // closest point does not fall within the segment
                // so return the min. of distance to segment endpoints
                var distToP0 = this.vecDist(segP0, pt);
                var distToP1 = this.vecDist(segP1, pt);

                if (distToP0 < distToP1) {
                    return distToP0;
                } else {
                    return distToP1;
                }
            }//if( U < 0.0 || U > 1.0 ) {

            var intersection = [ segP0[0] + U * (segP1[0] - segP0[0]), segP0[1] + U * (segP1[1] - segP0[1]), segP0[2] + U * (segP1[2] - segP0[2])];

            return this.vecDist(intersection, pt);
        }
    },

	nearestPointOnLine2D: {
        value: function( linePt,  lineDir,  pt )
        {
            var vec = this.vecSubtract( pt, linePt );
            var dot = this.dot( lineDir, vec );

            var mag = this.vecMag(2,lineDir);
            if (this.fpSign(mag) == 0)  return;
            var d = dot/mag;
            var dVec = VecUtils.vecNormalize( 2, lineDir, d );
            return this.vecAdd( linePt, dVec );
        }
    },

	parameterizePointOnLine2D: {
        value: function( linePt, lineDir, ptOnLine )
        {
            var t;
            if (Math.abs(lineDir[0]) > Math.abs(lineDir[1]))
            {
                var x1 = linePt[0] + lineDir[0];
                if (this.fpCmp(ptOnLine[0],x1) == 0)
                    t = 1.0;
                else
                    t = (ptOnLine[0] - linePt[0]) / (linePt[0]+lineDir[0] - linePt[0]);
            }
            else
            {
                var y1 = linePt[1] + lineDir[1];
                if (this.fpCmp(ptOnLine[1],y1) == 0)
                    t = 1.0;
                else
                    t = (ptOnLine[1] - linePt[1]) / (linePt[1]+lineDir[1] - linePt[1]);
            }

            return t;
        }
    },

	pointsEqual: {
        value: function( dimen,  a, b )
        {
            if ((a.length < dimen) || (b.length < dimen))
                throw new Error( "dimension error in VecUtils.vecAdd" );

            for (var i=0;  i<dimen;  i++)
            {
                if (this.fpCmp(a[i],b[i]) != 0)  return false;
            }

            return true;
        }
    },

    makeDimension4: {
        value: function( vec )
        {
            var dimen = vec.length;
            if (dimen < 4)
            {
                for (var i=0;  i<3-dimen;  i++)
                    vec.push(0);
                vec.push(1);
            }
            else if (dimen > 4)
            {
                for (var i=0;  i<dimen-4;  i++)
                    vec.pop();
            }

            return vec;
        }
    },

    makeDimension3: {
        value: function( vec )
        {
            var dimen = vec.length;
            if (dimen < 3)
            {
                for (var i=0;  i<3-dimen;  i++)
                    vec.push(0);
            }
            else if (dimen > 3)
            {
                for (var i=0;  i<dimen-3;  i++)
                    vec.pop();
            }

            return vec;
        }
    },

    styleToNumber: {
        value: function( str )
        {
            var index = str.indexOf( "px" );
            if (index >= 0)
                str = str.substr( 0, index );

            var n = Number( str );
            return n;
        }
    },

    isIdentityMatrix: {
        value: function( mat )
        {
            if(!mat)
            {
                return false;
            }
            else
            {
                if(mat[0] !== 1) return false;
                if(mat[1] !== 0) return false;
                if(mat[2] !== 0) return false;
                if(mat[3] !== 0) return false;

                if(mat[4] !== 0) return false;
                if(mat[5] !== 1) return false;
                if(mat[6] !== 0) return false;
                if(mat[7] !== 0) return false;

                if(mat[8] !== 0) return false;
                if(mat[9] !== 0) return false;
                if(mat[10] !== 1) return false;
                if(mat[11] !== 0) return false;

                if(mat[12] !== 0) return false;
                if(mat[13] !== 0) return false;
                if(mat[14] !== 0) return false;
                if(mat[15] !== 1) return false;
            }
            return true;
        }
    },

	rectsOverlap:
	{
		value: function( pt, width, height,  elt )
		{
			// only consider rectangles with non-zero area
			if ((width == 0) || (height == 0))  return false;

			// get the mins/maxs of the onput rectangle
			var xMin, xMax, yMin, yMax;
			if (width > 0)  {  xMin = pt[0];   xMax = pt[0] + width;  }
			else  {  xMax = pt[0];  xMin = pt[0] + width;  }
			if (height > 0)  {  yMin = pt[1];   yMax = pt[1] + height;  }
			else  {  yMax = pt[1];  yMin = pt[1] + height;  }

			// get the bounds of the element in global screen space
			var bounds = ViewUtils.getElementViewBounds3D( elt );
			var bounds3D = [];
			for (var i=0;  i<4;  i++)
				bounds3D[i] = ViewUtils.localToGlobal( bounds[i],  elt );

			// get the min/maxs for the element
			var xMinElt = bounds3D[0][0],  xMaxElt = bounds3D[0][0],
				yMinElt = bounds3D[0][1],  yMaxElt = bounds3D[0][1];
			for (var i=1;  i<4;  i++)
			{
				if (bounds3D[i][0] < xMinElt)  xMinElt = bounds3D[i][0];
				else if  (bounds3D[i][0] > xMaxElt)  xMaxElt = bounds3D[i][0];
				if (bounds3D[i][1] < yMinElt)  yMinElt = bounds3D[i][1];
				else if  (bounds3D[i][1] > yMaxElt)  yMaxElt = bounds3D[i][1];
			}

			// test 1.  Overall bounding box test
			if ((xMaxElt < xMin) || (xMinElt > xMax) || (yMaxElt < yMin) || (yMinElt > yMax))
				return false;
			
			// test 2.  See if any of the corners of the element are contained in the rectangle
			var rect = Object.create(Rectangle, {});
			rect.set( pt[0], pt[1], width, height );
			for (var i=0;  i<4;  i++)
			{
				if (rect.contains( bounds3D[i][0], bounds3D[i][1] ))  return true;
			}

			// test 3.  Bounding box tests on individual edges of the element
			for (var i=0;  i<4;  i++)
			{
				var pt0 = bounds3D[i],
					pt1 = bounds3D[(i+1)%4];

				// get the extremes of the edge
				if (pt0[0] < pt1[0])  {  xMinElt = pt0[0];  xMaxElt = pt1[0];  }
				else {  xMaxElt = pt0[0];  xMinElt = pt1[0]; }
				if (pt0[1] < pt1[1])  {  yMinElt = pt0[1];  yMaxElt = pt1[1];  }
				else {  yMaxElt = pt0[1];  yMinElt = pt1[1]; }

				if ((xMaxElt < xMin) || (xMinElt > xMax) || (yMaxElt < yMin) || (yMinElt > yMax))
					continue;
				else
				{
					// intersect the element edge with the 4 sides of the rectangle
					// vertical edges
					var xRect = xMin;
					for (var j=0;  j<2;  j++)
					{
						if ((xMinElt < xRect) && (xMaxElt > xRect))
						{
							var t = (xRect - pt0[0])/(pt1[0] - pt0[0]);
							var y = pt0[1] + t*(pt1[1] - pt0[1]);
							if ((y >= yMin) && (y <= yMax))  return true;
						}
						xRect = xMax;
					}

					// horizontal edges
					var yRect = yMin;
					for (var j=0;  j<2;  j++)
					{
						if ((yMinElt < yRect) && (yMaxElt > yRect))
						{
							var t = (yRect - pt0[1])/(pt1[1] - pt0[1]);
							var x = pt0[0] + t*(pt1[0] - pt0[0]);
							if ((x >= xMin) && (x <= xMax))  return true;
						}
						yRect = yMax;
					}
				}
			}

			// if we get here there is no overlap
			return false;
		}
	},

    ///////////////////////////////////////////////////////////////////////
    // Bezier Methods
    ///////////////////////////////////////////////////////////////////////
	// this function returns the quadratic Bezier approximation to the specified
	// circular arc.  The input can be 2D or 3D, determined by the minimum dimension
	// of the center and start point.
	// includedAngle is in radians, can be positiveor negative
	circularArcToBezier: {
        value: function( ctr_, startPt_, includedAngle )
        {
            var dimen = 3;
            var ctr = ctr_.slice();  MathUtils.makeDimension3( ctr );
            var startPt = startPt_.slice();  MathUtils.makeDimension3( startPt );

            // make sure the start point is good
            var pt = VecUtils.vecSubtract(dimen, startPt, ctr);
            var rad = VecUtils.vecMag(dimen, pt);

            if ((dimen != 3) || (MathUtils.fpSign(rad) <= 0) || (MathUtils.fpSign(includedAngle) == 0))
            {
                if (dimen != 3)  console.log( "MathUtils.circularArcToBezier works for 3 dimensional points only.  Was " + dimen );
                return [ startPt.slice(0), startPt.slice(0), startPt.slice(0) ];
            }

            // determine the number of segments.  45 degree span maximum.
            var nSegs = Math.ceil( Math.abs(includedAngle)/(0.25*Math.PI) );
            if (nSegs <= 0)  return [ startPt.slice(0), startPt.slice(0), startPt.slice(0) ];
            var dAngle = includedAngle/nSegs;

            // determine the length of the center control point from the circle center
            var cs = Math.cos( 0.5*Math.abs(dAngle) ),  sn = Math.sin( 0.5*Math.abs(dAngle) );
            var  c = rad*sn;
            var  h = c*sn/cs;
            var  d = rad*cs + h;

            var rtnPts = [ VecUtils.vecAdd(dimen, pt, ctr) ];
            var rotMat = Matrix.RotationZ( dAngle );
            for ( var i=0;  i<nSegs;  i++)
            {
                // get the next end point
                var pt2 = MathUtils.transformPoint( pt, rotMat );

                // get the next center control point
                var midPt = vec3.add(pt, pt2, []);
                VecUtils.vecScale(dimen, midPt, 0.5);
                midPt = VecUtils.vecNormalize( dimen, midPt, d );

                // save the next segment
                rtnPts.push( VecUtils.vecAdd(dimen, midPt, ctr) );
                rtnPts.push( VecUtils.vecAdd(dimen,   pt2, ctr) );

                // advance for the next segment
                pt = pt2;
            }
            return rtnPts;
        }
    },

    ///////////////////////////////////////////////////////////////////////
    // Polygon Methods
    ///////////////////////////////////////////////////////////////////////
    getPolygonNormal: {
        value: function( n, xPts, yPts, zPts )
        {
            var xNrm = 0.0,  yNrm = 0.0,  zNrm = 0.0;
            for (var i=0;  i<n;  i++)
            {
                var j = (i+1) % n;

                xNrm += (yPts[i] - yPts[j]) * (zPts[i] + zPts[j]);
                yNrm += (zPts[i] - zPts[j]) * (xPts[i] + xPts[j]);
                zNrm += (xPts[i] - xPts[j]) * (yPts[i] + yPts[j]);
            }
            var normal = [xNrm, yNrm, zNrm];

            // the area of the polygon is the length of the normal
            var area = VecUtils.vecMag(3, normal );
            if (this.fpSign(area) != 0)
			{
                //vec3.scale(normal, 1.0/area);
				normal = VecUtils.vecNormalize(3, normal, 1.0);
			}

            return normal;
        }
    },

	getNormalFromBounds3D: {
        value: function( b )
        {
            var xNrm = 0.0,  yNrm = 0.0,  zNrm = 0.0;
            for (var i=0;  i<4;  i++)
            {
                var j = (i+1) % 4;

                xNrm += (b[i][1] - b[j][1]) * (b[i][2] + b[j][2]);
                yNrm += (b[i][2] - b[j][2]) * (b[i][0] + b[j][0]);
                zNrm += (b[i][0] - b[j][0]) * (b[i][1] + b[j][1]);
            }
            var normal = [xNrm, yNrm, zNrm];

            // the area of the polygon is the length of the normal
            var area = VecUtils.vecMag(3, normal );
            if (this.fpSign(area) != 0)
                vec3.scale( normal, 1.0/area );

            return normal;
        }
    },

	getCenterFromBounds: {
        value: function( dimen, bounds )
        {
            var minVals = bounds[0].slice(0),
                    maxVals = bounds[0].slice(0);

            for (var iPt=1;  iPt<4;  iPt++)
            {
                for (var i=0;  i<dimen;  i++)
                {
                    if (bounds[iPt][i] < minVals[i])  minVals[i] = bounds[iPt][i];
                    if (bounds[iPt][i] > maxVals[i])  maxVals[i] = bounds[iPt][i];
                }
            }

            var ctr = VecUtils.vecAdd(dimen, minVals, maxVals);
            VecUtils.vecScale( dimen, ctr, 0.5 );

            return ctr;
        }
    },

    boundaryContainsPoint: {
        value: function( bounds,  targetPt,  backFacing )
        {
            var pt = targetPt.slice(0);
            while (pt.length > 2)  pt.pop();

            // this function returns -1 for inside, 0 for on and 1 for outside.
            // values defined as instance variables above
            var nPts = bounds.length;
            var pt1 = bounds[nPts-1].slice(0);
            while (pt1.length > 2)  pt1.pop();
            for (var i=0;  i<nPts;  i++)
            {
                // get the vector along the edge of the boundary
                var pt0 = pt1;
                pt1 = bounds[i].slice(0);
                while (pt1.length > 2)  pt1.pop();
                var vec0 = VecUtils.vecSubtract(2, pt1, pt0 );
                if (vec0.length == 3)  vec0.pop();

                // get a vector from the target point to pt0
                //var vec1 = pt.subtract( pt0 );
                var vec1 = VecUtils.vecSubtract(2, pt, pt0 );
                if (vec1.length == 3)  vec1.pop();

                // look at the cross product of the 2 vectors
                var cross = VecUtils.vecCross(2, vec0, vec1 );
                var sign = this.fpSign( cross );
                if (sign == 0)
                {
                    //var t = vec1.modulus() / vec0.modulus();
                    var t = VecUtils.vecMag(2, vec1)/VecUtils.vecMag(2, vec0);
                    if ((this.fpSign(t) >= 0) && (this.fpCmp(t,1.0) <= 0))
                        return this.ON;
                    else
                        return this.OUTSIDE;
                }

                if (backFacing)
                {
                    if (this.fpSign(cross) < 0)  return this.OUTSIDE;
                }
                else
                {
                    if (this.fpSign(cross) > 0)  return this.OUTSIDE;
                }
            }

            return this.INSIDE;
        }
    },


    ///////////////////////////////////////////////////////////////////////
    // floating point Methods
    ///////////////////////////////////////////////////////////////////////
    fpSign: {
        value: function( d )
        {
            var sign = 0;
            if (d < -this.EPSILON)      sign = -1;
            else if (d > this.EPSILON)  sign =  1;
            return sign;
        }
    },

    fpCmp: {
        value: function(x,y)
        {
            return this.fpSign( x-y );
        }
    },

    ///////////////////////////////////////////////////////////////////////
    // Utility method to convert numbers in scientific notation to decimal.
    // This is needed for matrix3d which does not support values in
    // scientific notation (that are often returned by Matrix calculations).
    // You pass in the flattened Array value of the Matrix (arr) and the
    // desired number of significant digits after the decimal (sigDig).
    ///////////////////////////////////////////////////////////////////////
    scientificToDecimal: {
        value: function(arr, sigDig)
        {
            if(!sigDig)
            {
                sigDig = 10;
            }

            var arrLen = arr.length;
            for(var k=0; k<arrLen; k++)
            {
                arr[k] = Number(arr[k].toFixed(sigDig));
            }

            return arr;
        }
    },

    ///////////////////////////////////////////////////////////////////////
    // Utility method to calculate angle between two points
    ///////////////////////////////////////////////////////////////////////
    getAngleBetweenPoints: {
        value: function(pt0, pt1, origin)
        {
//        var v0 = pt0.slice(0);
//        var v1 = pt1.slice(0);
//
//        var origin = [0, 0];
//
//        if(origin)
//        {
//            v0 = VecUtils.vecSubtract(2, pt0, origin);
//            v1 = VecUtils.vecSubtract(2, pt1, origin);
//        }
//
//        var cross = VecUtils.vecCross(2, v0, v1);
//        console.log("cross is " + cross);
//
//        var angle = Math.asin(cross / (VecUtils.vecMag(2, v0) * VecUtils.vecMag(2, v1)));

            var angle = (Math.atan2(pt1[1], pt1[0]) - Math.atan2(pt0[1], pt0[0]));

            if(angle < 0)
            {
                angle = angle + this.PI2;
            }

            return angle;
        }
    },

     ///////////////////////////////////////////////////////////////////////
     // Utility method to calculate angle between two 3D vectors 
     ///////////////////////////////////////////////////////////////////////
    getAxisAngleBetween3DVectors: {
        value: function (vec1, vec2, axis) {
            //compute magnitudes of the vectors
            var v1n = VecUtils.vecNormalize(3, vec1, 1.0);
            var v2n = VecUtils.vecNormalize(3, vec2, 1.0);
            //angle between the vectors (acos for now...)
            var angle = Math.acos(VecUtils.vecDot(3, v1n, v2n));
            if (Math.abs(angle) < this.EPSILON) {
                return 0;
            }
            //TODO testing...remove this block
            if (isNaN(angle)){
                console.log("Warning! getAxisAngleBetween3DVectors Angle is NaN");
            }
            //TODO end testing block
            //optionally, if axis is provided, create the axis of rotation as well
            var rotAxis = VecUtils.vecCross(3, v1n, v2n);
            rotAxis = VecUtils.vecNormalize(3, rotAxis, 1);
            if (axis){
                axis[0] = rotAxis[0];
                axis[1] = rotAxis[1];
                axis[2] = rotAxis[2];
            }
            return angle;
        }
    },

    getLocalPoint: {
        value: function (x, y, planeEq, matL)
        {
            var globalPt = [x, y, 0];
            var vec = [0,0,1];

            var localPt = this.vecIntersectPlane(globalPt, vec, planeEq);

            if(!localPt)
            {
                return null;
//                return [1, 1];
            }
            localPt = this.transformPoint(localPt, matL);

            return localPt;
        }
    },

	colorToHex: {
        value: function( colorArray )
        {
            if (colorArray.length < 3)  return "#000000";

            var str = "#";
            for (var i=0;  i<3;  i++)
            {
                var c = colorArray[i];
                if (c < 0)  c = 0;
                else if (c > 1)  c = 1.0;
                c *= 255;
                var h = c.toString(16);
                if (h.length < 2)  h = "0" + h;
                if (h.length < 2)  h = "0" + h;
                str = str + h;
            }

            return str;
        }
    },

    ///////////////////////////////////////////////////////////////////////
    // Utility method to calculate angle between two vectors from origin
    ///////////////////////////////////////////////////////////////////////
    getAngleBetweenVectors: {
        value: function(v0, v1)
        {
            var dot = this.dot3(v0, v1);
            var v0Mag = this.vecMag3(v0);
            var v1Mag = this.vecMag3(v1);
            var angle = Math.acos(dot / (v0Mag*v1Mag));
            return angle;
        }
    },

    // Simple decomposition that does not take scale or perspective into account
    decomposeMatrix: {
        value: function(m)
        {
            var rY = Math.atan2(-m[2], m[10]) * this.RAD_TO_DEG;
            var rX = Math.asin(m[6]) * this.RAD_TO_DEG;
            var rZ = Math.atan2(-m[4], m[5]) * this.RAD_TO_DEG;

            return {rotX: rX, rotY: rY, rotZ: rZ};
        }
    },

/**
* decompose matrix in javascript found at https://github.com/joelambert/morf/blob/master/js/src/WebkitCSSMatrix.ext.js
* used with permission from Joe Lambert: "as long as the original licence text and attribution is left in then you're
* good to use it as you see fit."
*
* WebKitCSSMatrix Extensions
*
* Copyright 2011, Joe Lambert (http://www.joelambert.co.uk)
* Free to use under the MIT license.
* http://joelambert.mit-license.org/
*/

/**
* Decomposes the matrix into its component parts.
* A Javascript implementation of the pseudo code available from http://www.w3.org/TR/css3-2d-transforms/#matrix-decomposition
* @author Joe Lambert
* @returns {Object} An object with each of the components of the matrix (perspective, translate, skew, scale, rotate) or identity matrix on failure
*/

//      Input: matrix       ; a 4x4 matrix
//      Output: translation ; a 3 component vector
//              rotation    ; Euler angles, represented as a 3 component vector
//              scale       ; a 3 component vector
//              skew        ; skew factors XY,XZ,YZ represented as a 3 component vector
//              perspective ; a 4 component vector
//      Returns false if the matrix cannot be decomposed. An object with the above output values if it can.
    decomposeMatrix2: {
        value: function(m)
        {
            var matrix = glmat4.transpose(m, []),
                    i = 0,
                    j = 0,
                    perspectiveMatrix,
                    inversePerspectiveMatrix,
                    transposedInversePerspectiveMatrix,
                    perspective = [0,0,0,0],
                    translate = [0,0,0],
                    scale = [0,0,0],
                    skew = [0,0,0],
                    rotate = [0,0,0],
                    rightHandSide = [0,0,0,0];
            // Normalize the matrix.
            if (matrix[15] === 0)
            {
                return false;
            }

            for (i = 0; i < 4; i++)
            {
                var index = i;
                for (j = 0; j < 4; j++)
                {
                    matrix[index] /= matrix[15];
                    index += 4;
                }
            }

            // perspectiveMatrix is used to solve for perspective, but it also provides
            // an easy way to test for singularity of the upper 3x3 component.
            perspectiveMatrix = matrix.slice(0);

            for (i = 0; i < 3; i++)
            {
                perspectiveMatrix[i+12] = 0;
            }

            perspectiveMatrix[15] = 1;

            if (glmat4.determinant(perspectiveMatrix) === 0)
            {
                return false;
            }

            // First, isolate perspective.
            if (matrix[12] !== 0 || matrix[13] !== 0 || matrix[14] !== 0)
            {
                // rightHandSide is the right hand side of the equation.
                rightHandSide[0] = matrix[12];
                rightHandSide[1] = matrix[13];
                rightHandSide[2] = matrix[14];
                rightHandSide[3] = matrix[15];

                // Solve the equation by inverting perspectiveMatrix and multiplying
                // rightHandSide by the inverse.
                //inversePerspectiveMatrix = perspectiveMatrix.inverse();
                inversePerspectiveMatrix = glmat4.inverse( perspectiveMatrix, []);
                transposedInversePerspectiveMatrix = glmat4.transpose(inversePerspectiveMatrix, []);
                perspective = MathUtils.transformPoint(rightHandSide, transposedInversePerspectiveMatrix);

                // Clear the perspective partition
                matrix[12] = matrix[13] = matrix[14] = 0;
                matrix[15] = 1;
            }
            else
            {
                // No perspective.
                perspective[0] = perspective[1] = perspective[2] = 0;
                perspective[3] = 1;
            }

            // Next take care of translation
            translate[0] = matrix[3];
            matrix[3] = 0;
            translate[1] = matrix[7];
            matrix[7] = 0;
            translate[2] = matrix[11];
            matrix[11] = 0;

            // Now get scale and shear. 'row' is a 3 element array of 3 component vectors
            var row = Matrix.I(4);
            for (i = 0; i < 3; i++)
            {
                row[i  ] = matrix[i  ];
                row[i+4] = matrix[i+4];
                row[i+8] = matrix[i+8];
            }

            // Compute X scale factor and normalize first row.
            var rowX = [row[0], row[0+4], row[0+8]];
            var rowY = [row[1], row[1+4], row[1+8]];
            var rowZ = [row[2], row[2+4], row[2+8]];
            scale[0] = VecUtils.vecMag(3, rowX);
            rowX = VecUtils.vecNormalize(3, rowX);
            row[0] = rowX[0];
            row[4] = rowX[1];
            row[8] = rowX[2];

            // Compute XY shear factor and make 2nd row orthogonal to 1st.
            skew[0] = VecUtils.vecDot(3, rowX, rowY);
            rowY = this.combine(rowY, rowX, 1.0, -skew[0]);

            // Now, compute Y scale and normalize 2nd row.
            scale[1] = VecUtils.vecMag(3, rowY);
            rowY = VecUtils.vecNormalize(3, rowY);
            skew[0] /= scale[1];
            row[1] = rowY[0];
            row[5] = rowY[1];
            row[9] = rowY[2];

            // Compute XZ and YZ shears, orthogonalize 3rd row
            skew[1] = VecUtils.vecDot(3, rowX, rowZ);
            rowZ = this.combine(rowZ, rowX, 1.0, -skew[1]);
            skew[2] = VecUtils.vecDot(3, rowY, rowZ);
            rowZ = this.combine(rowZ, rowY, 1.0, -skew[2]);

            // Next, get Z scale and normalize 3rd row.
            scale[2] = VecUtils.vecMag(3, rowZ);
            rowZ = VecUtils.vecNormalize(3, rowZ);
            skew[1] /= scale[2];
            skew[2] /= scale[2];
            row[ 2] = rowZ[0];
            row[ 6] = rowZ[1];
            row[10] = rowZ[2];

            // At this point, the matrix (in rows) is orthonormal.
            // Check for a coordinate system flip.  If the determinant
            // is -1, then negate the matrix and the scaling factors.
            var pdum3 = VecUtils.vecCross(3, rowY, rowZ);
            if (VecUtils.vecDot(3, rowX, pdum3) < 0)
            {
                for (i = 0; i < 3; i++)
                {
                    scale[0] *= -1;
                    row[i  ] *= -1
                    row[i+4] *= -1
                    row[i+8] *= -1
                }
            }

            // Now, get the rotations out
            rotate[1] = Math.asin(-row[8]);
            if (Math.cos(rotate[1]) !== 0)
            {
                rotate[0] = Math.atan2(row[9], row[10]);
                rotate[2] = Math.atan2(row[4], row[ 0]);
            }
            else
            {
                rotate[0] = Math.atan2(-row[2], row[5]);
                rotate[2] = 0;
            }

            return {translation: translate,
                rotation: rotate,
                scale: scale,
                skew: skew,
                perspective: perspective};

        }
    },

/**
* Helper function required for matrix decomposition
* A Javascript implementation of pseudo code available from http://www.w3.org/TR/css3-2d-transforms/#matrix-decomposition
* @param {Vector4} aPoint A 3D point
* @param {float} ascl
* @param {float} bscl
* @author Joe Lambert
* @returns {Vector4}
*/
    combine: {
        value: function(a, b, ascl, bscl)
        {
            var result = [0,0,0];
            result[0] = (ascl * a[0]) + (bscl * b[0])
            result[1] = (ascl * a[1]) + (bscl * b[1])
            result[2] = (ascl * a[2]) + (bscl * b[2])
            return result
        }
    }

});



