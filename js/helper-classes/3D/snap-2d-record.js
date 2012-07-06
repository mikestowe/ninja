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
// Class HitRecord
//
///////////////////////////////////////////////////////////////////////
var viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils;
var snapManager = require("js/helper-classes/3D/snap-manager");
var Snap2DRecord = exports.Snap2DRecord = Object.create(Object.prototype,
{
    ///////////////////////////////////////////////////////////////////////
    // Constant definitions
    ///////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    _elt : { value: null , writable: true},             // the four boundary points for the element in global screen space
    _screenPtArray : { value: null , writable: true},   // snap point in global screen space
    _alignPtArray : { value: null , writable: true},        // points for snap-align.  Kept in working plane space

    _localToGlobalMat : { value: null, writable: true },
    _globalToLocalMat : { value: null, writable: true },

    // indices to the extremal align points
    _xMinArray : { value: [], writable: true },
    _xMaxArray : { value: [] , writable: true},
    _yMinArray : { value: [] , writable: true},
    _yMaxArray : { value: [] , writable: true},

    ///////////////////////////////////////////////////////////////////////
    // Property accessors
    ///////////////////////////////////////////////////////////////////////
    getElement: { value: function()         {  return this._elt;                    }},
    setElement: { value: function()         {  this._elt = e;                       }},

    getScreenPointArray: { value: function()            {  return this._screenPtArray;          }},
    getAlignPointArray: { value: function()         {  return this._alignPtArray;           }},

    getLocalToGlobalMatrix: { value: function()         {  return this._localToGlobalMat;       }},
    setLocalToGlobalMatrix: { value: function()         {  this._localToGlobalMat = l2g.slice(0);   }},

    getGlobalToLocalMatrix: { value: function()         {  return this._globalToLocalMat;       }},
    setGlobalToLocalMatrix: { value: function()         {  this._globalToLocalMat = g2l.slice(0);   }},

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    init: {
        value: function( elt ) {
            this._elt = elt;
            var bounds = viewUtils.getElementViewBounds3D( elt );

            // get the screen and align points from the bounds
            this._screenPtArray = new Array();
            this._alignPtArray  = new Array();
            this._localToGlobalMat = viewUtils.getLocalToGlobalMatrix( elt );
            //this._globalToLocalMat = this._localToGlobalMat.inverse();
            this._globalToLocalMat = glmat4.inverse( this._localToGlobalMat, []);
            for (var i=0;  i<4;  i++)
            {
                this._screenPtArray[i] = viewUtils.localToGlobal( bounds[i],  elt );
                var worldPt = viewUtils.localToStageWorld( bounds[i], elt );
                this._alignPtArray[i] = MathUtils.transformPoint( worldPt, snapManager.SnapManager._worldToDragPlane );

                //////////////////////////////////////////////////////////////////////
                // DEBUG CODE
                var tmp = MathUtils.transformHomogeneousPoint( bounds[i], this._localToGlobalMat );
                tmp = MathUtils.applyHomogeneousCoordinate( tmp );
                if (!MathUtils.pointsEqual( 3,  tmp, this._screenPtArray[i] ))
                    console.log( "**** Snap2DRecord cache screen points do not agree **** " + tmp + " => " + this._screenPtArray[i] );
                //////////////////////////////////////////////////////////////////////
            }

            // add the center point
            var xCtr = 0.5*(bounds[0][0] + bounds[3][0]),  yCtr = 0.5*(bounds[0][1] + bounds[1][1]);
            var ctr = [xCtr, yCtr, 0];
            this._screenPtArray[4] = viewUtils.localToGlobal( ctr,  elt );
            var worldPt = viewUtils.localToStageWorld( ctr, elt );
            this._alignPtArray[4] = MathUtils.transformPoint( worldPt, snapManager.SnapManager._worldToDragPlane );

            // set up the align points
            this.initAlignExtremalPoints()
        }
    },

    initAlignExtremalPoints: {
        value: function() {
            var xMinArray = [0],  xMaxArray = [0],
                yMinArray = [0],  yMaxArray = [0];
            var alignPts = this._alignPtArray;
            var xMin = alignPts[0][0],  xMax = alignPts[0][0],
                yMin = alignPts[0][1],  yMax = alignPts[0][1];
            var sign;
            for (var i=1;  i<4;  i++)
            {
                var pt = alignPts[i];
                sign = MathUtils.fpCmp(pt[0], xMin);  if (sign < 0)  { xMinArray = [i];  xMin = pt[0]; }  else if (sign == 0)  xMinArray.push(i);
                sign = MathUtils.fpCmp(pt[0], xMax);  if (sign > 0)  { xMaxArray = [i];  xMax = pt[0]; }  else if (sign == 0)  xMaxArray.push(i);
                sign = MathUtils.fpCmp(pt[1], yMin);  if (sign < 0)  { yMinArray = [i];  yMin = pt[1]; }  else if (sign == 0)  yMinArray.push(i);
                sign = MathUtils.fpCmp(pt[1], yMax);  if (sign > 0)  { yMaxArray = [i];  yMax = pt[1]; }  else if (sign == 0)  yMaxArray.push(i);
            }
            this._xMinArray = xMinArray;
            this._xMaxArray = xMaxArray;
            this._yMinArray = yMinArray;
            this._yMaxArray = yMaxArray;
        }
    },

    getScreenPoint: {
        value: function( index ) {
            var rtnPt;
            if ((index >= 0) && (index < 4) && (this._screenPtArray != null))
                rtnPt = this._screenPtArray[index].slice(0);

            return rtnPt;
        }
    },

    addAlignPoint: {
        value: function( pt ) {
            this._alignPtArray.push( pt );
        }
    }
});

