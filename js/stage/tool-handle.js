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
    Component = require("montage/ui/component").Component,
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils,
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils;

var ToolHandle = exports.ToolHandle = Montage.create(Component, {
    _x: {
        value: 0,
        writable: true
    },

    _y: {
        value: 0,
        writable: true
    },

    _width: {
        value: 4,
        writable: true
    },

    _height: {
        value: 4,
        writable: true
    },

    VERTEX_HIT_RAD: {
        value: 4,
        writable: true
    },

    _cursor: {
        value: "default",
        writable: true
    },

    _strokeStyle: {
        value: 'rgba(255,255,255,0.6)'
    },

    _fillStyle: {
        value: 'rgba(0,0,0,1)'
    },

    init: {
        value: function (cursorStyle) {
            this._cursor = cursorStyle;
        }
    },

    draw: {
        value: function(x, y) {
            var context = this.application.ninja.stage.drawingContext;
            context.save();

            context.fillStyle = this._fillStyle;
            this._x = x - this._width/2;
            this._y = y - this._height/2;

            context.fillRect(this._x, this._y, this._width, this._height);

            context.strokeStyle = this._strokeStyle;
            this._x = x - this._width/2 - 1;
            this._y = y - this._height/2 - 1;

            context.strokeRect(this._x, this._y, this._width + 2, this._height + 2);

            context.restore();

        }
    },

    collidesWithPoint: {
        value:function (x, y) {
            if(x < (this._x - this.VERTEX_HIT_RAD)) return false;
            if(x > (this._x + this._width + this.VERTEX_HIT_RAD)) return false;
            if(y < this._y - this.VERTEX_HIT_RAD) return false;
            if(y > (this._y + this._height + this.VERTEX_HIT_RAD)) return false;

            return true;
        }
    }

});


exports.RotateHandle = Montage.create(ToolHandle, {
    _originL: {
        value: null,
        writable: true
    },

    _origin: {
        value: null,
        writable: true
    },


    _dirVec: {
        value: null,
        writable: true
    },

    _dirVecL: {
        value: null,
        writable: true
    },

    _radius: {
        value: 50,
        writable: true
    },

    _transformCenterRadius: {
        value: 5,
        writable: true
    },

    _cursor: {
        value: "default",
        writable: true
    },

    _strokeStyle: {
        value: 'rgba(255,0,255,1)'
    },

    _axis: {
        value: null,
        writable: true
    },

    _lineWidth: {
        value: 2
    },

    _fillStyle: {
        value: 'rgba(255,0,255,1)'
    },

    _nTriangles: {
        value: 30,
        writable: true
    },

    _rotMat: {
        value: null,
        writable: true
    },

    _rotMatInv: {
        value: null,
        writable: true
    },

    _planeEq: {
        value: null,
        writable: true
    },

    _matW: {
        value: null,
        writable: true
    },

    _matL: {
        value: null,
        writable: true
    },

    _vec: {
        value: null,
        writable: true
    },

    _vec2: {
        value: null,
        writable: true
    },

    _vec3: {
        value: null,
        writable: true
    },

    _dragPlane: {
        value: null,
        writable: true
    },

    init: {
        value: function (cursorStyle, color, axis) {
            this._cursor = cursorStyle;
            this._strokeStyle = color;
            this._fillStyle = color;
            this._axis = axis;
            switch(this._axis)
            {
                case "x":
                    this._vec = [1, 0, 0];
                    this._vec2 = [0, 1, 0];
                    this._vec3 = [0, 0, 1];
                    break;
                case "y":
                    this._vec = [0, 1, 0];
                    this._vec2 = [1, 0, 0];
                    this._vec3 = [0, 0, 1];
                    break;
                case "z":
                    this._vec = [0, 0, 1];
                    this._vec2 = [1, 0, 0];
                    this._vec3 = [0, 1, 0];
                    break;
            }

            // get a matrix to rotate a point around the circle
            var angle = 2.0*Math.PI/Number(this._nTriangles);
            this._rotMat = Matrix.RotationZ( angle );
            this._rotMatInv = glmat4.inverse(this._rotMat, []);
        }
    },

    draw: {
        value: function(base, item, inLocalMode) {
            var context = this.application.ninja.stage.drawingContext;
            context.save();

            context.strokeStyle = this._strokeStyle;
            context.fillStyle = this._fillStyle;
            context.lineWidth = this._lineWidth;
            context.shadowBlur = 2;
            context.shadowColor = "rgba(0, 0, 0, 0.8)";

            var pointOnElt = base.slice(0);
//            this._origin = viewUtils.localToGlobal(pointOnElt, item);
            this._origin = pointOnElt;


            var viewMat = viewUtils.getMatrixFromElement(this.application.ninja.currentDocument.model.documentRoot);

            var transMat = viewMat.slice(0);
            if(inLocalMode)
            {
                var objMat = viewUtils.getMatrixFromElement(item);
                glmat4.multiply(viewMat, objMat, transMat);
            }

            this._planeEq = MathUtils.transformVector(this._vec, transMat);
            this._planeEq2 = MathUtils.transformVector(this._vec2, transMat);
            this._planeEq3 = MathUtils.transformVector(this._vec3, transMat);

            var viewVec = [0, 0, 1];

            var angle2 = MathUtils.getAngleBetweenVectors(this._planeEq2, viewVec);
            var angle3 = MathUtils.getAngleBetweenVectors(this._planeEq3, viewVec);

            if(angle3 < angle2)
            {
                this._dirVec = vecUtils.vecNormalize(3, this._planeEq2, this._radius);
            }
            else
            {
                this._dirVec = vecUtils.vecNormalize(3, this._planeEq3, this._radius);
            }

            this._matW = drawUtils.getPlaneToWorldMatrix(this._planeEq, this._origin);
            this._matL = glmat4.inverse(this._matW, []);

            this._originL = MathUtils.transformPoint(this._origin, this._matL);

            this._planeEq[3] = -vecUtils.vecDot(3, this._planeEq, this._origin);

            this._dirVecL = MathUtils.transformPoint(this._dirVec, this._matL);

            context.beginPath();

            var pt = [this._radius, 0.0, 0.0];
            var pts;

            for (var i=0;  i<this._nTriangles;  i++)
            {
                pt = MathUtils.transformPoint(pt, this._rotMat);
                pts = MathUtils.transformPoint(pt, this._matW);
                context.lineTo(pts[0], pts[1]);
            }

            context.closePath();
            context.stroke();



            // Draw the transform handle
            context.beginPath();

            pt = [this._transformCenterRadius, 0.0, 0.0];

            for (var i=0;  i<this._nTriangles;  i++)
            {
                pt = MathUtils.transformPoint(pt, this._rotMat);
                pts = MathUtils.transformPoint(pt, this._matW);
                context.lineTo(pts[0], pts[1]);
            }

            context.closePath();
            context.stroke();



            context.restore();
        }
    },

    collidesWithPoint: {
        value:function (x, y) {
            var globalPt = [x, y, 0];
            var vec = [0,0,1];

            // if angle between view direction and the handle's plane is within 5 degrees, use line test instead
            var angle = MathUtils.getAngleBetweenVectors(vec, this._planeEq);
            angle = Math.abs(90 - angle * 180 / Math.PI);

            var localPt = MathUtils.vecIntersectPlane(globalPt, vec, this._planeEq);

            // If rotate handle's plane is straight on to the screen, special case and use line test instead.
            // For now, just return false;
            if(!localPt || (angle < 5))
            {
                var nearPt = MathUtils.nearestPointOnLine2D( this._origin, this._dirVec,  globalPt );
                if(!nearPt)
                {
                    return 0;
                }

                var t = MathUtils.parameterizePointOnLine2D( this._origin, this._dirVec, nearPt );
                if(angle !== 0)
                {
                    var theta = MathUtils.getAngleBetweenVectors(this._dirVec, [50, 0, 0]);
                    t = t * Math.cos(theta);
                }

                var dist = vecUtils.vecDist( 2, globalPt, nearPt );
                if (dist <= 5)
                {
                    if( (t <= 0.1) && (t >= -0.1) )
                    {
                        return 1;
                    }
                    else if ( (t <= 1) && (t >= -1) )
                    {
                        return 2;
                    }
                }

                return 0;
            }

            localPt = MathUtils.transformPoint(localPt, this._matL);

            var theta = Math.atan2(localPt[1], localPt[0]);
            var xC = this._transformCenterRadius*Math.cos(theta);
            var yC = this._transformCenterRadius*Math.sin(theta);
            var ptOnCircle = [xC, yC, 0];

            var dist = vecUtils.vecDist( 2, localPt, ptOnCircle );

            if ( dist <= 5 )
            {
                return 1;
            }

            xC = this._radius*Math.cos(theta);
            yC = this._radius*Math.sin(theta);
            ptOnCircle = [xC, yC, 0];

            dist = vecUtils.vecDist( 2, localPt, ptOnCircle );

            if ( dist <= 5 )
            {
                return 2;
            }

            return 0;
        }
    },


    drawShadedAngle: {
        value: function(angle, localPt) {

            var theta = Math.atan2(localPt[1], localPt[0]);
            var xC = this._radius*Math.cos(theta);
            var yC = this._radius*Math.sin(theta);
            var pt = [xC, yC, 0];

            var context = this.application.ninja.stage.drawingContext;
            context.save();

            context.strokeStyle = "rgba(0,0,0,1)";
            context.lineWidth = 2;
            context.fillStyle = this._fillStyle;
            context.globalAlpha = 0.2;

            context.beginPath();

            context.moveTo(this._origin[0], this._origin[1]);

            var pts = MathUtils.transformPoint(pt, this._matW);
            context.lineTo(pts[0], pts[1]);

            var n = Math.ceil(Math.abs( (this._nTriangles*angle) / (2*Math.PI) ) );

            for (var i=0;  i<n;  i++)
            {
                pt = MathUtils.transformVector(pt, this._rotMat);
                pts = MathUtils.transformPoint(pt, this._matW);
                context.lineTo(pts[0], pts[1]);
            }

            context.lineTo(this._origin[0], this._origin[1]);

            context.stroke();
            context.fill();

            context.font = "10px sans-serif"; // TODO - Make this a global app preference
            var dirV = vecUtils.vecSubtract(2, pts, this._origin);
            dirV = vecUtils.vecNormalize(2, dirV, 70);
            dirV = vecUtils.vecAdd(2, this._origin, dirV);
            context.globalAlpha = 1.0;
            context.fillStyle = "rgba(0,0,0,1)";
            var deg = Math.round( (angle*180/Math.PI) % 360 );
            context.fillText(deg + "" + "\u00B0", dirV[0], dirV[1]);

            context.closePath();

            context.restore();
        }
    }
});


exports.TranslateHandle = Montage.create(ToolHandle, {
    _originL: {
        value: null,
        writable: true
    },

    _origin: {
        value: null,
        writable: true
    },

    _endPt: {
        value: null,
        writable: true
    },

    _dirVec: {
        value: null,
        writable: true
    },

    _dirVecL: {
        value: null,
        writable: true
    },

    _arrowSize: {
        value: 50,
        writable: true
    },

    _arrowHead: {
        value: 6,
        writable: true
    },

    _cursor: {
        value: "default",
        writable: true
    },

    _strokeStyle: {
        value: 'rgba(255,0,255,1)'
    },

    _axis: {
        value: null,
        writable: true
    },

    _lineWidth: {
        value: 2
    },

    _fillStyle: {
        value: 'rgba(255,0,255,1)'
    },

    _nTriangles: {
        value: 30
    },

    _planeEq: {
        value: null,
        writable: true
    },

    _matW: {
        value: null,
        writable: true
    },

    _matL: {
        value: null,
        writable: true
    },

    _vec: {
        value: null,
        writable: true
    },

    _vec2: {
        value: null,
        writable: true
    },

    _vec3: {
        value: null,
        writable: true
    },

    _dragPlane: {
        value: null,
        writable: true
    },

    init: {
        value: function (cursorStyle, color, axis) {
            this._cursor = cursorStyle;
            this._strokeStyle = color;
            this._fillStyle = color;
            this._axis = axis;
            switch(this._axis)
            {
                case "x":
                    this._vec = [1, 0, 0];
                    this._vec2 = [0, 1, 0];
                    this._vec3 = [0, 0, 1];
                    break;
                case "y":
                    this._vec = [0, -1, 0];
                    this._vec2 = [1, 0, 0];
                    this._vec3 = [0, 0, 1];
                    break;
                case "z":
                    this._vec = [0, 0, 1];
                    this._vec2 = [1, 0, 0];
                    this._vec3 = [0, 1, 0];
                    break;
            }
        }
    },

    draw: {
        value: function(base, item, inLocalMode) {
            var context = this.application.ninja.stage.drawingContext;
            context.save();

            context.strokeStyle = this._strokeStyle;
            context.fillStyle = this._fillStyle;
            context.lineWidth = this._lineWidth;
            context.shadowBlur = 2;
            context.shadowColor = "rgba(0, 0, 0, 0.8)";

            var pointOnElt = base.slice(0);
//            this._origin = viewUtils.localToGlobal(pointOnElt, item);
            this._origin = pointOnElt;


            var stage = this.application.ninja.currentDocument.model.documentRoot;
            var viewMat = viewUtils.getMatrixFromElement(stage);
            // Get viewMat without zoom value
            var zoom = this.application.ninja.documentBar.zoomFactor/100;
            if(zoom !== 1)
            {
                var zoomMatInv = Matrix.create( [
                       [ 1/zoom,    0,    0, 0],
                       [    0, 1/zoom,    0, 0],
                       [    0,    0, 1/zoom, 0],
                       [    0,    0,      0, 1]
                   ] );
                glmat4.multiply( zoomMatInv, viewMat, viewMat );
            }

            var transMat = viewMat.slice(0);
            if(inLocalMode)
            {
                var objMat = viewUtils.getMatrixFromElement(item);
                glmat4.multiply(viewMat, objMat, transMat);
            }

            this._planeEq2 = MathUtils.transformVector(this._vec2, transMat);
            this._planeEq3 = MathUtils.transformVector(this._vec3, transMat);

            var viewVec = [0, 0, 1];

            var angle2 = MathUtils.getAngleBetweenVectors(this._planeEq2, viewVec);
            var angle3 = MathUtils.getAngleBetweenVectors(this._planeEq3, viewVec);

            if(angle3 < angle2)
            {
                this._planeEq = this._planeEq3;
            }
            else
            {
                this._planeEq = this._planeEq2;
            }

            this._matW = drawUtils.getPlaneToWorldMatrix(this._planeEq, this._origin);
            this._matL = glmat4.inverse(this._matW, []);

            this._originL = MathUtils.transformPoint(this._origin, this._matL);

            this._planeEq[3] = -vecUtils.vecDot(3, this._planeEq, this._origin);

            context.beginPath();

            var pt = [0.0, 0.0, 0.0];
            var pts = MathUtils.transformPoint(pt, this._matW);

            context.moveTo(pts[0], pts[1]);

            pt = vecUtils.vecNormalize(3, this._vec, this._arrowSize);
            pts = MathUtils.transformVector(pt, transMat);
            pts = vecUtils.vecAdd(3, pts, this._origin);

            this._endPt = pts.slice(0);
            this._dirVecL = MathUtils.transformPoint(this._endPt, this._matL);
            this._dirVec = vecUtils.vecSubtract(3, this._endPt, this._origin);

            context.lineTo(pts[0], pts[1]);
            context.closePath();
            context.stroke();

            this._drawArrowHead(this._origin, this._endPt, context);

            context.restore();
        }
    },

    _drawArrowHead: {
        value: function(base, onAxis, context) {
            var headWidth = this._arrowHead;

            // draw the arrowhead
            var head = MathUtils.interpolateLine3D( base, onAxis, 0.7 );
            var p0 = head.slice(0);  p0[1] += headWidth;
            var p1 = head.slice(0);  p1[0] += headWidth;
            var p2 = head.slice(0);  p2[1] -= headWidth;
            var p3 = head.slice(0);  p3[0] -= headWidth;


            context.beginPath();

            context.moveTo(base[0], base[1]);
            context.lineTo(onAxis[0], onAxis[1]);

            context.moveTo(onAxis[0], onAxis[1]);
            context.lineTo(p0[0], p0[1]);
            context.moveTo(onAxis[0], onAxis[1]);
            context.lineTo(p1[0], p1[1]);
            context.moveTo(onAxis[0], onAxis[1]);
            context.lineTo(p2[0], p2[1]);
            context.moveTo(onAxis[0], onAxis[1]);
            context.lineTo(p3[0], p3[1]);

            context.moveTo( p0[0], p0[1] );
            context.lineTo( p1[0], p1[1] );
            context.lineTo( p2[0], p2[1] );
            context.lineTo( p3[0], p3[1] );
            context.lineTo( p0[0], p0[1] );

            context.closePath();

            context.stroke();
        }
    },

    drawDelta: {
        value: function(delta) {
            var context = this.application.ninja.stage.drawingContext;
            context.save();

            context.beginPath();

            context.font = "10px sans-serif"; // TODO - Make this a global app preference
            context.fillStyle = "rgba(0,0,0,1)";
            context.fillText(delta + " px", this._endPt[0]+20, this._endPt[1]-20);

            context.closePath();

            context.restore();
        }
    },

    collidesWithPoint:
    {
        value:function (x, y)
        {
            var globalPt = [x, y, this._origin[2]];

            // test for a hit on the origin
            var dist = vecUtils.vecDist( 2, globalPt, this._origin );
            if (dist <= 5)  return 1;

            var nearPt = MathUtils.nearestPointOnLine2D( this._origin, this._dirVec,  globalPt );
            if(!nearPt)
            {
                return 0;
            }

            var t = MathUtils.parameterizePointOnLine2D( this._origin, this._dirVec, nearPt );
            dist = vecUtils.vecDist( 2, globalPt, nearPt );
            if (dist <= 5)
            {
                if ( (t <= 1) && (t >= 0) )
                    return 2;
            }

            return 0;
        }
    }

});
