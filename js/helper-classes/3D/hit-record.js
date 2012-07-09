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

///////////////////////////////////////////////////////////////////////
// Class HitRecord
//
///////////////////////////////////////////////////////////////////////

var viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils;
var vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils;
var drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils;
var snapManagerModule = require("js/helper-classes/3D/snap-manager");

var HitRecord = exports.HitRecord = Object.create(Object.prototype,
{

    ///////////////////////////////////////////////////////////////////////
    // Constant definitions
    ///////////////////////////////////////////////////////////////////////
    SNAP_TYPE_STAGE : { value: 1, writable: true },
    SNAP_TYPE_GRID_VERTEX : { value: 2, writable: true },
    SNAP_TYPE_GRID_HORIZONTAL : { value: 13, writable: true },
    SNAP_TYPE_GRID_VERTICAL: { value: 14, writable: true },
    SNAP_TYPE_ALIGN_MERGED: { value: 15, writable: true },
    SNAP_TYPE_HORIZONTAL_FROM_START: { value: 3, writable: true },
    SNAP_TYPE_VERTICAL_FROM_START: { value: 4, writable: true },
    SNAP_TYPE_ELEMENT: { value: 5, writable: true },
    SNAP_TYPE_ELEMENT_EDGE: { value: 6, writable: true },
    SNAP_TYPE_ELEMENT_VERTEX: { value: 7, writable: true },
    SNAP_TYPE_ALIGN_HORIZONTAL: { value: 8, writable: true },
    SNAP_TYPE_ALIGN_VERTICAL: { value: 9, writable: true },
    SNAP_TYPE_ALIGN_BOTH: { value: 10, writable: true },
    SNAP_TYPE_ELEMENT_CENTER: { value: 11, writable: true },
    SNAP_TYPE_CONTAINED_ELEMENT: { value: 12, writable: true },
    SNAP_TYPE_UNDEFINED: { value: null, writable: -1 },

    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    _type: { value: this.SNAP_TYPE_UNDEFINED, writable: true },
    _elt: { value: null, writable: true },              // this can be null.  example: snapping to the working plane
    _screenPt: { value: null, writable: true },     // snap point in global screen space
    _localPoint: { value: null, writable: true },       // snap point in the local space of the element
    _plane: { value: null, writable: true },        // plane equation at the snap point in local object space
    _planeMat: { value: Matrix.I(4) , writable: true },         // transform to take the point from plane space to the transformed view space of the element
    _assocScrPt: { value: null, writable: true },       // associated screen point
    _assocScrPt2: { value: null, writable: true },      // a second associated point for drawing multiple snap align hits
    _planarHit: { value: false, writable: true },
    _snapBoundaryIndex : { value: -1, writable: true },     // this used for snap align to object boundaries
    _isQuadPt :{ value: false, writable: true },    // used for snapping to an object's quadrant point

    ///////////////////////////////////////////////////////////////////////
    // Property accessors
    ///////////////////////////////////////////////////////////////////////
    getElt : { value: function()            {  return this._elt;                    }},
    setElt : { value: function(e)           {  this._elt = e;                       }},
    getElement : { value: function()            {  return this._elt;                    }},
    setElement : { value: function(e)           {  this._elt = e;                       }},

    getZIndex : { value: function()         {  return this._zIndex; }},
    setZIndex : { value: function(i)            {  this._zIndex = i;                    }},

    setScreenPoint : { value: function(s)           {  this._screenPt = s.slice(0);         }},
    getScreenPoint : { value: function()            {  return this._screenPt.slice(0);      }},

    setLocalPoint : { value: function(s)            {  this._localPt = s.slice(0);          }},
    getLocalPoint : { value:  function()            {  return this._localPt.slice(0);       }},

    setAssociatedScreenPoint : { value: function(s)         {  this._assocScrPt = s.slice(0);       }},
    getAssociatedScreenPoint : { value: function()          {  return this._assocScrPt.slice(0);    }},
    hasAssociatedScreenPoint : { value: function()          {  return this._assocScrPt != null;     }},

    setAssociatedScreenPoint2 : { value: function(s)            {  this._assocScrPt2 = s.slice(0);      }},
    getAssociatedScreenPoint2 : { value: function()         {  return this._assocScrPt2.slice(0);   }},
    hasAssociatedScreenPoint2 : { value: function()         {  return this._assocScrPt2 != null;    }},

    setPlane : { value: function(p)         {  this._plane = p.slice(0);            }},
    getPlane : { value: function()          {  return this._plane.slice(0);         }},

    setPlaneMatrix : { value: function(pm)          {  this._planeMat = pm.slice(0);        }},
    getPlaneMatrix : { value: function()            {  return this._planeMat.slice(0);      }},

    setPlanarHit : { value:  function(p)            {  this._planarHit = p;                 }},
    isPlanarHit : { value: function()           {  return this._planarHit;              }},

    getSnapBoundaryIndex : { value: function()          {  return this._snapBoundaryIndex;      }},
    setSnapBoundaryIndex : { value: function(i)         {  this._snapBoundaryIndex = i;         }},

    getType : { value: function()           {  return this._type;                   }},
    setType : { value: function(t)          {this._type = t;  if (!this.checkType())  { throw new Error("invalid snap type");  return;  }   }},

    getUseQuadPoint : { value: function()           {  return this._isQuadPt;               }},
    setUseQuadPoint : { value: function(q)          {this._isQuadPt = q;                    }},

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////

    checkType :{
        value: function()   {
            var ok = false;
            switch (this._type)
            {
                case this.SNAP_TYPE_STAGE:
                //case this.SNAP_TYPE_GRID:
                case this.SNAP_TYPE_GRID_VERTEX:
                case this.SNAP_TYPE_GRID_HORIZONTAL:
                case this.SNAP_TYPE_GRID_VERTICAL:
                case this.SNAP_TYPE_HORIZONTAL_FROM_START:
                case this.SNAP_TYPE_VERTICAL_FROM_START:
                    ok = true;
                    break;

                case this.SNAP_TYPE_ALIGN_MERGED:
                    ok = true;
                    break;

                case this.SNAP_TYPE_ELEMENT:
                case this.SNAP_TYPE_ELEMENT_EDGE:
                case this.SNAP_TYPE_ELEMENT_VERTEX:
                case this.SNAP_TYPE_ELEMENT_CENTER:
                case this.SNAP_TYPE_CONTAINED_ELEMENT:
                    ok = true;
                    break;

                case this.SNAP_TYPE_ALIGN_HORIZONTAL:
                case this.SNAP_TYPE_ALIGN_VERTICAL:
                case this.SNAP_TYPE_ALIGN_BOTH:
                    ok = true;
                    break;
            }

            return ok;
        }
    },

    isSomeGridTypeSnap : {
        value: function() {
            return ((this._type == this.SNAP_TYPE_GRID_VERTEX) ||
                    (this._type == this.SNAP_TYPE_GRID_HORIZONTAL) ||
                    (this._type == this.SNAP_TYPE_GRID_VERTICAL)
                   );
        }
    },

    convertToWorkingPlane : {
        value: function( wp ) {
            var swp = this.calculateStageWorldPoint();
            var wpMat = drawUtils.getPlaneToWorldMatrix(wp, MathUtils.getPointOnPlane(wp));
            //var wpMatInv = wpMat.inverse();
            var wpMatInv = glmat4.inverse( wpMat, []);
            var localPt = MathUtils.transformPoint( swp, wpMatInv );

            //  create a new hit record
            var hr = Object.create(HitRecord);//new HitRecord();
            hr.setType(  this.SNAP_TYPE_STAGE );
            hr.setScreenPoint(  this.getScreenPoint() );
            hr.setLocalPoint(  localPt );
            hr.setPlane( wp );
            hr.setPlaneMatrix( wpMat );
            hr.setElt( snapManagerModule.SnapManager.getStage() );

            return hr;
        }
    },

    calculateStageWorldPoint : {
        value: function() {
            var wPt;
            var elt = this.getElt();
            if (elt != null)
            {
                var localPt = this.getLocalPoint();
                var planeMat = this.getPlaneMatrix();
                wPt = viewUtils.postViewToStageWorld( MathUtils.transformPoint(localPt,planeMat),  elt );
            }

            return wPt;
        }
    },


    calculateScreenPoint : {
        value: function() {
            var scrPt;

            var stage = snapManagerModule.SnapManager.getStage();
            var stageMat = viewUtils.getMatrixFromElement( stage );
            var offset = viewUtils.getElementOffset( stage );
            offset[2] = 0;
            viewUtils.pushViewportObj( stage );

            var elt = this.getElt();
            if (elt != null)
            {
                var localPt = this.getLocalPoint();
                var planeMat = this.getPlaneMatrix();
                scrPt = viewUtils.postViewToStageWorld( MathUtils.transformPoint(localPt,planeMat),  elt );
                scrPt = vecUtils.vecAdd( 3, viewUtils.viewToScreen( MathUtils.transformPoint(scrPt, stageMat) ), offset);
            }
            viewUtils.popViewportObj();

            return scrPt;
        }
    },

    calculateElementWorldPoint : {
        value: function() {
            var localPt = this.getLocalPoint();
            var worldPt = MathUtils.transformPoint( localPt, this.getPlaneMatrix() );

            return worldPt;
        }
    },

    calculateElementScreenPoint : {
        value: function() {
            var worldPt = this.calculateElementWorldPoint();
            viewUtils.pushViewportObj( this._elt );
            var scrPt = viewUtils.viewToScreen( worldPt );
            viewUtils.popViewportObj();

            return scrPt;
        }
    },

    calculateElementScreenToPlane : {
        value: function( scrPt,  plane ) {
            var elt = this.getElt();
            viewUtils.pushViewportObj( elt );
            var viewPt = viewUtils.screenToView( scrPt[0], scrPt[1], scrPt[2] );
            var eyePt;
            if(viewUtils.getPerspectiveDistFromElement(elt))
            {
                eyePt = viewUtils.getEyePoint();
            }
            else
            {
                eyePt = [viewPt[0], viewPt[1], 1400];
            }
            var projPt = MathUtils.vecIntersectPlane( eyePt, MathUtils.vecSubtract(viewPt,eyePt), plane );

            return projPt;
        }
    },

    calculateElementPreTransformScreenPoint : {
        value: function() {
            var localPt = this.getLocalPoint();

            var worldPt = MathUtils.transformPoint( localPt, this.getPlaneMatrix() );
            var mat = viewUtils.getMatrixFromElement( this._elt );
            glmat4.inverse( mat );
            localPt = MathUtils.transformPoint( worldPt, mat );

            viewUtils.pushViewportObj( this._elt );
            var scrPt = viewUtils.viewToScreen( localPt );
            viewUtils.popViewportObj();

            return scrPt;
        }
    },

    getTypeString :{
        value: function()   {
            var str;
            switch (this.getType())
            {
                case this.SNAP_TYPE_STAGE:                      str = "SNAP_TYPE_STAGE";                    break;
                case this.SNAP_TYPE_GRID_VERTEX:                str = "SNAP_TYPE_GRID_VERTEX";              break;
                case this.SNAP_TYPE_GRID_HORIZONTAL:            str = "SNAP_TYPE_GRID_HORIZONTAL";          break;
                case this.SNAP_TYPE_GRID_VERTICAL:              str = "SNAP_TYPE_GRID_VERTICAL";            break;
                case this.SNAP_TYPE_HORIZONTAL_FROM_START:      str = "SNAP_TYPE_HORIZONTAL_FROM_START";    break;
                case this.SNAP_TYPE_VERTICAL_FROM_START:        str = "SNAP_TYPE_VERTICAL_FROM_START";      break;
                case this.SNAP_TYPE_ELEMENT:                    str = "SNAP_TYPE_ELEMENT";                  break;
                case this.SNAP_TYPE_ELEMENT_EDGE:               str = "SNAP_TYPE_ELEMENT_EDGE";             break;
                case this.SNAP_TYPE_ELEMENT_VERTEX:             str = "SNAP_TYPE_ELEMENT_VERTEX";           break;
                case this.SNAP_TYPE_ELEMENT_CENTER:             str = "SNAP_TYPE_ELEMENT_CENTER";           break;
                case this.SNAP_TYPE_CONTAINED_ELEMENT:          str = "SNAP_TYPE_CONTAINED_ELEMENT";        break;
                case this.SNAP_TYPE_ALIGN_HORIZONTAL:           str = "SNAP_TYPE_ALIGN_HORIZONTAL";         break;
                case this.SNAP_TYPE_ALIGN_VERTICAL:             str = "SNAP_TYPE_ALIGN_VERTICAL";           break;
                case this.SNAP_TYPE_ALIGN_BOTH:                 str = "SNAP_TYPE_ALIGN_BOTH";               break;
                case this.SNAP_TYPE_ALIGN_MERGED:               str = "this.SNAP_TYPE_ALIGN_MERGED";        break;

                default:
                    str = "SNAP_TYPE_UNDEFINED";
                    break;
            }

            return str;
        }
    },

    test:
    {
        value: function()
        {
            var elt = this.getElement();
            var stage = viewUtils.getStage();
            if (elt === stage)  return;

            var localPt = this.calculateElementPreTransformScreenPoint();
            var stageWorldPt = this.calculateStageWorldPoint();
            var globalPt = this.getScreenPoint();
            var err = false;

            var test1 = viewUtils.localToGlobal( localPt, elt );
            var dist = vecUtils.vecDist(3, test1, globalPt);
            if (MathUtils.fpSign(dist) != 0)
            {
                err = true;
                console.log( "**** transform error 1 ***** " + dist + ", localPt: " + localPt );
            }

            var stageWorldToGlobal = viewUtils.getStageWorldToGlobalMatrix();
            var test2 = MathUtils.transformAndDivideHomogeneousPoint( stageWorldPt, stageWorldToGlobal );
            dist = vecUtils.vecDist(3, test2, globalPt);
            if (MathUtils.fpSign(dist) != 0)
            {
                err = true;
                console.log( "**** transform error 2 ***** " + dist + ", localPt: " + localPt );
            }

            var localToGlobal = viewUtils.getLocalToGlobalMatrix( elt );
            var globalToLocal = glmat4.inverse( localToGlobal, [] );
            var test3 = MathUtils.transformAndDivideHomogeneousPoint( globalPt, globalToLocal );
            dist = vecUtils.vecDist(3, test3, localPt);
            if (MathUtils.fpSign(dist) != 0)
            {
                err = true;
                console.log( "**** transform error 3 ***** " + dist + ", localPt: " + localPt );
            }

            var objToStageWorld = viewUtils.getObjToStageWorldMatrix( elt, true );
            var test4 = MathUtils.transformAndDivideHomogeneousPoint( localPt, objToStageWorld );
            dist = vecUtils.vecDist(3, test4, stageWorldPt);
            if (MathUtils.fpSign(dist) != 0)
            {
                err = true;
                console.log( "**** transform error 4 ***** " + dist + ", localPt: " + localPt );
            }

            //if (!err)  console.log( "no hitRecord error" );
        }
    }
});

