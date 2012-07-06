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
// Class SnapManager
//      Class to do hit testing of objects in the html page
///////////////////////////////////////////////////////////////////////
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils,
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils,
    HitRecord = require("js/helper-classes/3D/hit-record").HitRecord,
    Snap2DRecord = require("js/helper-classes/3D/snap-2d-record").Snap2DRecord,
    NJUtils = require("js/lib/NJUtils").NJUtils;

var SnapManager = exports.SnapManager = Montage.create(Component, {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////

    currentStage: { value: null },

    // we keep a stack of working planes to facilitate working on other planes temporarily
    _workingPlaneStack : { value: [], writable: true },

    // snapping radii relative to a 25 pixel grid
    GRID_VERTEX_HIT_RAD : { value: 10, writable: true },
    GRID_EDGE_HIT_RAD : { value: 6, writable: true},

    // these are the grid snapping tolerances scaled to the current grid spacing
    _gridVertexHitRad : { value: this.GRID_VERTEX_HIT_RAD, writable: true },
    _gridEdgeHitRad : { value: this.GRID_EDGE_HIT_RAD, writable: true },

    ELEMENT_VERTEX_HIT_RAD : { value: 18, writable: true },
    ELEMENT_EDGE_HIT_RAD : { value: 14, writable: true },

    // keep a reference to the most recent hitRecord.  Used for drawing feedback on the stage
    _lastHit : { value: null, writable: true },
    _hitRecords : { value: [], writable: true },

    // keep a list of objects to avoid snapping to
    _avoidList : { value: [], writable: true },

    // keep a cache of 2D elements to snap to
    _elementCache : { value: null, writable: true },
    _isCacheInvalid : { value: false, writable: true },

    // the snap manager can handle a 2D plane for dragging.
    // A call to initDragPlane sets these variables.
    // a call to clearDragPlane MUST be called on the completion of a drag
    _hasDragPlane : {value: false, writable: true },
    _dragPlane : { value: null, writable: true },
    _dragPlaneToWorld : { value: Matrix.I(4), writable: true },
    _worldToDragPlane : { value: Matrix.I(4), writable: true },
    _dragPlaneActive : {value: false, writable: true },

    // cache the matrix linking stage world and global spaces
    _stageWorldToGlobalMat : { value: Matrix.I(4), writable: true },
    _globalToStageWorldMat : { value: Matrix.I(4), writable: true },

    // various flags to enable snapping
    _snapAlignEnabled : {value: true, writable: true },
    _elementSnapEnabled : {value: true, writable: true },
    _gridSnapEnabled : {value: true, writable: true },

    // these represent the app level snap settings as set by the end user through
    // the menus.  These should be stored somewhere else and serialized.  Putting them here for now...
    _snapAlignEnabledAppLevel : {value: true, writable: true },
    _elementSnapEnabledAppLevel : {value: true, writable: true },
    _gridSnapEnabledAppLevel : {value: true, writable: true },

    // App Model pointer
    appModel: { value: null },


    ///////////////////////////////////////////////////////////////////////
    // Property accessors
    ///////////////////////////////////////////////////////////////////////
    pushWorkingPlane : { value: function (p)        { this._workingPlaneStack.push(workingPlane.slice(0)); workingPlane = p.slice(0); }},
    popWorkingPlane : { value: function ()      { workingPlane = this._workingPlaneStack.pop(); return workingPlane; }},

    getStageWidth : { value: function ()        {
        return parseInt(this.currentStage.offsetWidth);
    }},

    getStageHeight : { value: function ()       {
        return parseInt(this.currentStage.offsetHeight);
    }},

    getStage : { value: function()      {        return this.currentStage;    }},

    getGridVertexHitRad : { value: function()       {  return this._gridVertexHitRad;               }},
    getGridEdgeHitRad : { value: function()     {  return this._gridEdgeHitRad;                 }},

    getLastHit : { value: function()        {  return this._lastHit;                        }},
    setLastHit : { value: function(h)       {  this._lastHit = h;                           }},

    hasDragPlane : { value: function()      {  return this._hasDragPlane;                   }},
    getDragPlane : { value: function()      {  return this._dragPlane.slice(0);             }},

    has2DCache : { value: function()        {  return (this._elementCache && !this._isCacheInvalid);        }},

    enableSnapAlign : { value: function(e)      {  this._snapAlignEnabled = e;                  }},
    snapAlignEnabled : { value: function()      {  return this._snapAlignEnabled;               }},
    enableElementSnap : { value: function(e)        {  this._elementSnapEnabled = e;                }},
    elementSnapEnabled : { value: function()        {  return this._elementSnapEnabled;             }},
    enableGridSnap : { value: function(e)       {  this._gridSnapEnabled = e;                   }},
    gridSnapEnabled : { value: function()       {  return this._gridSnapEnabled;                }},

    enableSnapAlignAppLevel : { value: function(e)      {  this._snapAlignEnabledAppLevel = e;          }},
    snapAlignEnabledAppLevel : { value: function()      {  return this._snapAlignEnabledAppLevel;       }},
    enableElementSnapAppLevel : { value: function(e)        {  this._elementSnapEnabledAppLevel = e;        }},
    elementSnapEnabledAppLevel : { value: function()        {  return this._elementSnapEnabledAppLevel;     }},
    enableGridSnapAppLevel : { value: function(e)       {  this._gridSnapEnabledAppLevel = e;           }},
    gridSnapEnabledAppLevel : { value: function()       {  return this._gridSnapEnabledAppLevel;        }},

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    initialize: {
        value: function() {
            this.eventManager.addEventListener("elementsRemoved", this, false);
            this.eventManager.addEventListener("elementReplaced", this, false);
        }
    },

    bindSnap: {
        value: function() {
            this.addPropertyChangeListener("appModel.snap", this.toggleSnap, false);
            this.addPropertyChangeListener("appModel.snapGrid", this.toggleSnapGrid, false);
            this.addPropertyChangeListener("appModel.snapObjects", this.toggleSnapObjects, false);
            this.addPropertyChangeListener("appModel.snapAlign", this.toggleSnapAlign, false);
        }
    },

    toggleSnap: {
        value: function() {
            this.enableSnapAlignAppLevel(this.appModel.snap);
            this.enableElementSnapAppLevel(this.appModel.snap);
            this.enableGridSnapAppLevel(this.appModel.snap);
        }
    },

    toggleSnapGrid: {
        value: function() {
            this.enableGridSnapAppLevel(this.appModel.snapGrid);
        }
    },

    toggleSnapObjects: {
        value: function() {
            this.enableElementSnapAppLevel(this.appModel.snapObjects);
        }
    },

    toggleSnapAlign: {
        value: function() {
            this.enableSnapAlignAppLevel(this.appModel.snapAlign);
        }
    },


    handleElementsRemoved: {
        value: function(event) {
            var self = this, elements = event.detail;

            if(Array.isArray(elements)) {
                elements = Array.prototype.slice.call(elements, 0);
                elements.forEach(function(element) {
                    self.removeElementFrom2DCache(element);
                });
            } else {
                this.removeElementFrom2DCache(elements);
            }
        }
    },

    handleElementReplaced: {
        value: function(event) {
            this._isCacheInvalid = true;
        }
    },

    snap : {
        value: function (xScreen, yScreen, snap3D,  quadPt)
        {
            // force a 3D snap if a 2D snap is requested but the 2D cache has not been initialized
            if (!snap3D && !this._elementCache)  snap3D = true;

            // clear out the last hit record
            this.setLastHit( null );

            // snap to elements first, then the working plane
            var screenPt = [xScreen, yScreen];
            var hitRecArray = new Array();
            if (this.elementSnapEnabled())
            {
                if (snap3D)
                    this.snapToElements( screenPt, hitRecArray );

                // now always doing a 2D snap
                this.snapToCached2DElements( screenPt, hitRecArray );
            }

            // if we did not hit anything, and we are in 2D mode, try a snap align
            if (this.snapAlignEnabled())
            {
                //if (hitRecArray.length == 0)
                    this.snapAlign( screenPt, hitRecArray );
            }


            // if we did not find any objects to snap to, snap to the working plane and/or grid
            //if (hitRecArray.length == 0)
            {
                var stage = this.getStage();
                var parentPt;
                if (quadPt)
                    parentPt = [quadPt[0], quadPt[1], 0.0];
                else
                    parentPt = [xScreen, yScreen, 0.0];

                if (!snap3D && this._hasDragPlane)
                    this.activateDragPlane();

                var hitRec = this.snapToStage( parentPt,  quadPt );

                // try snapping to the 3D grid, or to the stage boundaries if the grid is not displayed
                if (this.gridSnapEnabled())
                    this.snapToGrid( hitRec );

                // save the hit record
                hitRecArray.push( hitRec );

                // restore the original working plane
                if (!snap3D && this.hasDragPlane())
                    this.deactivateDragPlane();

            }   //if (hitRecArray.length == 0)

            var rtnHit;

            // Save reference to hit records to verify last hit record's element matches browser's elementFromPoint
            this._hitRecords.length = 0;
            this._hitRecords = hitRecArray;

            if (hitRecArray.length > 0)
            {
                this.sortHitRecords( hitRecArray );
                rtnHit = hitRecArray[0];
            }

            // catch-all to turn off drag plane snapping
            this.deactivateDragPlane();

            this.setLastHit( rtnHit );

            //rtnHit.test();        // DEBUG CODE.  REMOVE THIS
            return rtnHit;
        }
    },

    snapToStage:
    {
        value: function( scrPt,  quadPt )
        {
            var stage = this.getStage();
            var l2g = viewUtils.getLocalToGlobalMatrix( stage );
            var g2l = glmat4.inverse( l2g, [] );

            var pt0 = scrPt.slice(),  pt1 = scrPt.slice();
            pt0[2] = 0.0;   pt1[2] = 10;

            var localPt0 = MathUtils.transformAndDivideHomogeneousPoint( pt0, g2l ),
                localPt1 = MathUtils.transformAndDivideHomogeneousPoint( pt1, g2l );

            var stageWorldPt0 = viewUtils.localToStageWorld( localPt0, stage ),
                stageWorldPt1 = viewUtils.localToStageWorld( localPt1, stage );
            var vec = vecUtils.vecSubtract( 3,  stageWorldPt1, stageWorldPt0 );

            var ptOnWorkingPlane = MathUtils.vecIntersectPlane(stageWorldPt0, vec, workingPlane);

            var wpMat = drawUtils.getPlaneToWorldMatrix(workingPlane, MathUtils.getPointOnPlane(workingPlane)),
                wpMatInv = glmat4.inverse( wpMat, [] );
            var localPt = MathUtils.transformPoint( ptOnWorkingPlane, wpMatInv );

            // create the hit record
            var hitRec = Object.create(HitRecord);
            hitRec.setLocalPoint( localPt );
            hitRec.setPlaneMatrix( wpMat );
            hitRec.setScreenPoint(scrPt);
            hitRec.setPlane(workingPlane);
            hitRec.setType( hitRec.SNAP_TYPE_STAGE );
            hitRec.setElt( stage );
            if (quadPt)  hitRec.setUseQuadPoint( true );

            // DEBUG CODE
            // check that the point is on the working plane
            var tmpStageWorldPt = hitRec.calculateStageWorldPoint();
            var err = vecUtils.vecDot(3, tmpStageWorldPt, workingPlane) + workingPlane[3];
            if (MathUtils.fpSign(err) !== 0)
                console.log( "snapToStage (function) not on working plane: " + err );
            //////////////////////////////////////////////////////////////////////

            var calculatedScreenPt = hitRec.calculateScreenPoint();
            hitRec.setScreenPoint(calculatedScreenPt);

            // DEBUG CODE
            // check that the point is on the working plane
            var err2 = vecUtils.vecDist(2,  calculatedScreenPt, scrPt );
            if (MathUtils.fpSign(err2) !== 0)
                console.log( "snapToStage (function) error in screen point: " + err2 );
            //////////////////////////////////////////////////////////////////////

            return hitRec;
        }
    },

    snapToGrid : {
        value: function( hitRec )
        {
            this.calculateGridHitRadii();

            var stage = this.getStage();
            var stageMat = viewUtils.getMatrixFromElement( stage );
            var offset = viewUtils.getElementOffset( stage );
            MathUtils.makeDimension3( offset );
            viewUtils.setViewportObj( stage );
            var scrPt = hitRec.getScreenPoint();

            // get the grid spacing
            var dx = drawUtils.getGridVerticalSpacing(),
                dy = drawUtils.getGridHorizontalSpacing();
            var verticalLineCount = drawUtils.getGridVerticalLineCount(),
                horizontalLineCount = drawUtils.getGridHorizontalLineCount();
            if (!drawUtils.isDrawingGrid())
            {
                dx = this.getStageWidth();
                dy = this.getStageHeight();
                verticalLineCount = 2;
                horizontalLineCount = 2;
            }

            // get the point to the lower left of the plane point and
            // see if it falls within the snap distance
            var origin = [-0.5*this.getStageWidth(), -0.5*this.getStageHeight()];
            var planePt = hitRec.getLocalPoint();
            var dToOrigin = MathUtils.vecSubtract(planePt, origin);
            var nx = Math.floor( dToOrigin[0]/dx),
                ny = Math.floor( dToOrigin[1]/dy );

            if ((nx < 0) || (nx >= (verticalLineCount-1)))
            {
                //console.log( "off the vertical end" );
                return false;
            }
            if ((ny < 0) || (ny >= (horizontalLineCount-1)))
            {
                //console.log( "off the horizontal end" );
                return false;
            }

            var pt00 = [ origin[0] + nx*dx, origin[1] + ny*dy, 0.0 ];
            var planeMat = hitRec.getPlaneMatrix();
            var scrPt2 = viewUtils.postViewToStageWorld( MathUtils.transformPoint(pt00,planeMat),  stage );
            scrPt2 = MathUtils.makeDimension3( scrPt2 );
            scrPt2 = vecUtils.vecAdd(3, viewUtils.viewToScreen( MathUtils.transformPoint(scrPt2, stageMat) ), offset );

            var dist = MathUtils.vecDist( scrPt, scrPt2 );
            if (dist <= this.getGridVertexHitRad() )
            {
                hitRec.setLocalPoint( pt00 );
                hitRec.setScreenPoint( scrPt2 );
                hitRec.setType( hitRec.SNAP_TYPE_GRID_VERTEX );
                return true;
            }

            // check the next point and the edge connecting them
            if (this.snapToGridEdge( planePt, scrPt, pt00, scrPt2,  origin, nx+1, ny,  hitRec, hitRec.SNAP_TYPE_GRID_HORIZONTAL ))
                return true;

            // check the other edge
            if (this.snapToGridEdge( planePt, scrPt, pt00, scrPt2,  origin, nx, ny+1,  hitRec, hitRec.SNAP_TYPE_GRID_VERTICAL ))
                return true;

            // check the far corner point and 2 edges out from it
            var pt11 = [ origin[0] + (nx+1)*dx, origin[1] + (ny+1)*dy, 0.0 ];
            var scrPt4 = viewUtils.postViewToStageWorld( MathUtils.transformPoint(pt11,planeMat),  stage );
            scrPt4 = MathUtils.makeDimension3( scrPt4 );
            scrPt4 = vecUtils.vecAdd(3, viewUtils.viewToScreen( MathUtils.transformPoint(scrPt4, stageMat) ), offset );
            var dist = MathUtils.vecDist( scrPt, scrPt4 );
            nx++;  ny++;
            if (dist <= this.getGridVertexHitRad() )
            {
                hitRec.setLocalPoint( pt11 );
                hitRec.setScreenPoint( scrPt4 );
                hitRec.setType( hitRec.SNAP_TYPE_GRID_VERTEX );
                return true;
            }

            // check the next point and the edge connecting them
            if (this.snapToGridEdge( planePt, scrPt, pt11, scrPt4,  origin, nx-1, ny,  hitRec, hitRec.SNAP_TYPE_GRID_HORIZONTAL ))
                return true;

            // check the other edge
            if (this.snapToGridEdge( planePt, scrPt, pt11, scrPt4,  origin, nx, ny-1,  hitRec, hitRec.SNAP_TYPE_GRID_VERTICAL ))
                return true;

            return false;
        }
    },


    snapToGridEdge :
    {
        value : function( pt, scrPt,  gridPt, gridPtScr,  gridOrigin, nx, ny,  hitRec, hitType )
        {
            var stage      = this.getStage();
            var stageMat   = viewUtils.getMatrixFromElement( stage );
            var offset     = viewUtils.getElementOffset( stage );
            MathUtils.makeDimension3( offset );
            var planePt    = hitRec.getLocalPoint();
            var planeMat   = hitRec.getPlaneMatrix();

            var dx = drawUtils.getGridVerticalSpacing(),
                dy = drawUtils.getGridHorizontalSpacing();
            var verticalLineCount = drawUtils.getGridVerticalLineCount(),
                horizontalLineCount = drawUtils.getGridHorizontalLineCount();
            if (!drawUtils.isDrawingGrid())
            {
                dx = this.getStageWidth();
                dy = this.getStageHeight();
                verticalLineCount = 2;
                horizontalLineCount = 2;
            }

            var edgePt = [ gridOrigin[0] + nx*dx, gridOrigin[1] + ny*dy, 0.0 ];
            var scrPt2 = viewUtils.postViewToStageWorld( MathUtils.transformPoint(edgePt,planeMat),  stage );
            scrPt2 = MathUtils.makeDimension3( scrPt2 );
            scrPt2 = vecUtils.vecAdd(3, viewUtils.viewToScreen( MathUtils.transformPoint(scrPt2, stageMat) ), offset );
            var dist = MathUtils.vecDist( scrPt, scrPt2 );
            if (dist <= this.getGridVertexHitRad() )
            {
                hitRec.setLocalPoint( edgePt );
                hitRec.setScreenPoint( scrPt2 );
                hitRec.setType( hitRec.SNAP_TYPE_GRID_VERTEX );
                return true;
            }

            // check the line between the 2 previous points
            var nearPt = MathUtils.nearestPointOnLine2D( gridPt,  MathUtils.vecSubtract(edgePt,gridPt),  pt );
            MathUtils.makeDimension3( nearPt );
            var tmpPt = MathUtils.transformPoint(nearPt,planeMat);
            var scrPt3 = viewUtils.postViewToStageWorld( tmpPt,  stage );
            scrPt3 = MathUtils.makeDimension3( scrPt3 );
            scrPt3 = vecUtils.vecAdd(3, viewUtils.viewToScreen( MathUtils.transformPoint(scrPt3, stageMat) ), offset );
            var edgeDist = MathUtils.vecDist( scrPt, scrPt3 );
            if (edgeDist <= this.getGridEdgeHitRad() )
            {
                hitRec.setLocalPoint( nearPt );
                hitRec.setScreenPoint( scrPt3 );
                hitRec.setType( hitType );
                return true;
            }

            return false;
        }
    },

    clear2DCache : {
        value : function() {
            // clear the 2D cache flags in the objects
            if (this._elementCache)
            {
                var n = this._elementCache.length;
                for (var i=0;  i<n;  i++)
                {
                    var snapRec = this._elementCache[i];
                    var elt = snapRec.getElement();
                    elt.elementModel.isIn2DSnapCache = false;

                }

                this._elementCache = null;
            }
            //console.log( "clear 2D cache" );
        }
    },

    load2DCache : {
        value: function( plane ) {
            this._elementCache = new Array;

//          var stage = this.getStage();
            var stage = this.application.ninja.currentDocument.model.domContainer || this.getStage();
            this.hLoadElementCache( stage,  plane, 0 );
            this._isCacheInvalid = false;

            //console.log( "2D cache loaded with " + this._elementCache.length + " elements" );
        }
    },

    removeElementFrom2DCache : {
        value: function( target ) {
            var found = false;
            var index = this.findElementIn2DCache( target );
            if (index >= 0)
            {
                var n = this._elementCache.length;
                this._elementCache[index] = this._elementCache[n-1];
                this._elementCache.pop();
                target.elementModel.isIn2DSnapCache = false;
                found = true;
            }

            return found;
        }
    },

    addElementTo2DCache : {
        value: function( elt ) {
            var added = false;
            if (this.hasDragPlane())
            {
                // make sure the element is not already in there
                if (this.findElementIn2DCache( elt ) == -1)
                {
                    var plane = this.getDragPlane();
                    var onPlane = this.elementIsOnPlane( elt, plane );
                    if (onPlane)
                    {
                        added = true;

                        var snapRec = new Snap2DRecord();
                        snapRec.init( elt );
                        this._elementCache.push( snapRec );

                        elt.elementModel.isIn2DSnapCache = true;
                    }
                    else if (elt.elementModel)
                        elt.elementModel.isIn2DSnapCache = false;
                }
            }

            return added;
        }
    },

    elementIsIn2DCache : {
        value: function( target ) {
            var found = false;
            var index = this.findElementIn2DCache( target );
            if (index >= 0)
                found = true;

            return found;
        }
    },

    findElementIn2DCache : {
        value: function( target ) {
            var rtnIndex = -1;
            if (this._elementCache)
            {
                var n = this._elementCache.length;
                for (var i=0;  i<n;  i++)
                {
                    var snap2DRec = this._elementCache[i];
                    var elt = snap2DRec.getElement();
                    if (elt == target)
                    {
                        rtnIndex = i;
                        break;
                    }
                }
            }

            return rtnIndex;
        }
    },

    clearDragPlane : {
        value: function() {
            this._hasDragPlane = false;
            this.clear2DCache();
        }
    },

    hLoadElementCache : {
        value: function( elt, plane, depth ) {
            if(depth > 1)
            {
                return;
            }

            if (depth > 0)
            {
                // check if the element is on the specified plane
                var onPlane = this.elementIsOnPlane( elt, plane );
                if (onPlane)
                {
                    var snapRec = Object.create(Snap2DRecord);//new Snap2DRecord();
                    snapRec.init( elt );
                    this._elementCache.push( snapRec );

                    elt.elementModel.isIn2DSnapCache = true;
                }
                else if (elt.elementModel)
                    elt.elementModel.isIn2DSnapCache = false;
            }

            // TODO - Don't traverse svg and components' children
            if(elt.nodeName.toLowerCase() === "svg" || (elt.elementModel && (elt.elementModel.isComponent || (elt.elementModel.selection === "SVG"))))
            {
                return;
            }
            var n = elt.childElementCount;
            if (n > 0)
            {
                for (var i=0;  i<n;  i++)
                {
                    var child = elt.children[i];
                    this.hLoadElementCache( child,  plane, (depth+1) );
                }
            }
        }
    },

    snapAlignToElementBounds : {
        value: function( elt, delta, hitRecArray ) {
            var bounds = viewUtils.getElementViewBounds3D( elt );
            var nHits = hitRecArray.length;
            for (var i=0;  i<4;  i++)
            {
                var pt = bounds[i];
                var scrPt = viewUtils.localToGlobal( pt, elt );
                scrPt[0] += delta[0];
                scrPt[1] += delta[1];
                this.snapAlign( scrPt, hitRecArray );
                while (nHits < hitRecArray.length)
                {
                    hitRecArray[nHits].setSnapBoundaryIndex( i );
                    nHits++;
                }
            }

            // choose the one to use.  favor 'both' to horizontal or vertical
            if (nHits > 1)
            {
                var tmpArray = new Array;
                var both;
                for (var i=0;  i<nHits;  i++)
                {
                    var hRec = hitRecArray.pop();
                    if (hRec.getType() == hRec.SNAP_TYPE_ALIGN_BOTH)
                        both = hRec;
                    else
                        tmpArray.push( hRec );
                }
                var theHit;
                if (both)
                    theHit = both;
                else
                    theHit = tmpArray.pop();
                hitRecArray.push( theHit );
            }

            if (nHits > 0)
                this.setLastHit( hitRecArray[hitRecArray.length-1] );
        }
    },

    getPlaneToViewMat :
    {
        value : function()
        {
            var wasActive = this._dragPlaneActive;
            if (!wasActive)  this.activateDragPlane();
            var stage = this.getStage();
            var wp = workingPlane.slice(0);
            var mat = viewUtils.getMatrixFromElement(stage);
            var wpMat = drawUtils.getPlaneToWorldMatrix(wp, MathUtils.getPointOnPlane(wp));
            //var planeToViewMat = mat.multiply(wpMat);
            var planeToViewMat = glmat4.multiply( mat, wpMat, []);
            if (!wasActive)  this.deactivateDragPlane();

            return planeToViewMat;
        }
    },

    snapAlign : {
        value: function( scrPt, hitRecArray ) {
            var didHit = false;

            if (!this._elementCache)  return false;
            var n = this._elementCache.length;
            if (n > 0)
            {
                // project the screen point to the working plane
                this.activateDragPlane();
                var gPt = scrPt.slice(0);
                var stage = this.getStage();
                //var stageOffset = viewUtils.getElementOffset( stage );
                //MathUtils.makeDimension3( stageOffset );
                var currentWorkingPlane = workingPlane.slice(0);
                var wp = currentWorkingPlane.slice(0);
                var mat = viewUtils.getMatrixFromElement(stage);
                wp = MathUtils.transformPlane(wp, mat);
                var eyePt = [];
                var vec = viewUtils.parentToChildVec(gPt, stage, eyePt);
                var projPt = MathUtils.vecIntersectPlane(eyePt, vec, wp);
                var wpMat = drawUtils.getPlaneToWorldMatrix(currentWorkingPlane, MathUtils.getPointOnPlane(currentWorkingPlane));
                projPt[3] = 1.0;
                //var planeToViewMat = mat.multiply(wpMat);
                var planeToViewMat = glmat4.multiply( mat, wpMat, []);
                //var viewToPlaneMat = planeToViewMat.inverse();
                var viewToPlaneMat = glmat4.inverse( planeToViewMat, [] );
                var planePt = projPt.slice(0);
                planePt[3] = 1.0;
                planePt = MathUtils.transformPoint( planePt, viewToPlaneMat );
                this.deactivateDragPlane();

                var hitRec;
                var nHits = hitRecArray.length;
                var hr = Object.create(HitRecord);//new HitRecord();
                for (var i=0;  i<n;  i++)
                {
                    // get the next snap record
                    var snap2DRec = this._elementCache[i];
                    var elt = snap2DRec.getElement();
                    if (!this.isAvoidedElement(elt) )
                    {
                        hitRec = this.doAlignSnap( snap2DRec, snap2DRec._xMaxArray,  0, 100.0,  scrPt, planePt, planeToViewMat, wpMat, hr.SNAP_TYPE_ALIGN_VERTICAL );
                        if (hitRec)  hitRecArray.push( hitRec );
                        hitRec = this.doAlignSnap( snap2DRec, snap2DRec._xMinArray,  0, 100.0,  scrPt, planePt, planeToViewMat, wpMat, hr.SNAP_TYPE_ALIGN_VERTICAL );
                        if (hitRec)  hitRecArray.push( hitRec );

                        hitRec = this.doAlignSnap( snap2DRec, snap2DRec._yMaxArray,  100.0, 0,  scrPt, planePt, planeToViewMat, wpMat, hr.SNAP_TYPE_ALIGN_HORIZONTAL );
                        if (hitRec)  hitRecArray.push( hitRec );
                        hitRec = this.doAlignSnap( snap2DRec, snap2DRec._yMinArray,  100.0, 0,  scrPt, planePt, planeToViewMat, wpMat, hr.SNAP_TYPE_ALIGN_HORIZONTAL );
                        if (hitRec)  hitRecArray.push( hitRec );

                        // snap to the center
                        hitRec = this.doAlignSnap( snap2DRec, [4],  100.0, 0,  scrPt, planePt, planeToViewMat, wpMat, hr.SNAP_TYPE_ALIGN_HORIZONTAL );
                        if (hitRec)  hitRecArray.push( hitRec );
                        hitRec = this.doAlignSnap( snap2DRec, [4],  0, 100.0,  scrPt, planePt, planeToViewMat, wpMat, hr.SNAP_TYPE_ALIGN_VERTICAL );
                        if (hitRec)  hitRecArray.push( hitRec );
                    }
                }
                nHits = hitRecArray.length - nHits;
                didHit = (nHits > 0);

                if (nHits > 1)
                {
                    var tmpArray = new Array;
                    for (var i=0;  i<nHits;  i++)
                    {
                        var hRec = hitRecArray.pop();
                        tmpArray.push( hRec );
                    }
                    this.coalesceSnapAlignHits( tmpArray, planeToViewMat );
                    hitRecArray.push( tmpArray.pop() );
                }
            }

            return didHit;
        }
    },

    doAlignSnap : {
        value: function( snap2DRec, indexArray,  dx, dy, scrPt, planePt,  planeToViewMat, wpMat,  type ) {
            if (!indexArray || (indexArray.length == 0))  return;
            var index = indexArray[0];

            var hitRec;
            var elt = snap2DRec.getElement();
            if (!this.isAvoidedElement(elt) )
            {
                var stage = this.getStage();
                var stageOffset = viewUtils.getElementOffset( stage );
                MathUtils.makeDimension3( stageOffset );

                var alignPts = snap2DRec.getAlignPointArray();

                // snap to the maximum vertical line
                var pt0 = snap2DRec._alignPtArray[index],  scrPt0 = snap2DRec._screenPtArray[index].slice(0);
                var pt1 = pt0.slice(0);  pt1[0] += dx;  pt1[1] += dy;
                var planeVec =  vecUtils.vecSubtract(3, pt1, pt0);
                var nearPt = MathUtils.nearestPointOnLine2D( pt0, planeVec,  planePt );
                MathUtils.makeDimension3( nearPt );
                var localPt = nearPt.slice(0);
                nearPt = MathUtils.transformPoint( nearPt, planeToViewMat );
                var scrPt1 = vecUtils.vecAdd(3, viewUtils.viewToScreen( nearPt ), stageOffset );

                var dist = vecUtils.vecDist( 2,  scrPt, scrPt1 );
                if (dist <= this.ELEMENT_EDGE_HIT_RAD)
                {
                    hitRec = Object.create(HitRecord);//new HitRecord();
                    hitRec.setLocalPoint( localPt );
                    hitRec.setPlaneMatrix( wpMat );
                    hitRec.setScreenPoint( scrPt1 );
                    hitRec.setPlane(workingPlane);
                    hitRec.setType( type );
                    hitRec.setElt( stage );

                    // find the farthest point to draw the line from
                    var assocPt = scrPt0.slice(0);
                    dist = vecUtils.vecDist( 2,  assocPt, scrPt1 );
                    for (var i=1;  i<indexArray.length;  i++)
                    {
                        var i2 = indexArray[i];
                        var ap2 = snap2DRec._screenPtArray[i2].slice(0);
                        var d2 = vecUtils.vecDist(2, ap2, scrPt1);
                        if (d2 > dist)  assocPt = ap2;
                    }
                    hitRec.setAssociatedScreenPoint( assocPt );
                }
            }

            return hitRec;
        }
    },

    coalesceSnapAlignHits : {
        value: function( hitArray,  planeToViewMat ) {
            var nHits = hitArray.length;
            if (nHits < 2)  return;

            var hSnap,  vSnap, hitRec;
            for (var i=0;  i<nHits;  i++)
            {
                hitRec = hitArray.pop();
                switch (hitRec.getType())
                {
                    case hitRec.SNAP_TYPE_ALIGN_HORIZONTAL:     hSnap = hitRec;     break;
                    case hitRec.SNAP_TYPE_ALIGN_VERTICAL:       vSnap = hitRec;     break;

                    case hitRec.SNAP_TYPE_ALIGN_BOTH:
                        break;

                    default:
                        console.log( "unrecognized snap type in coalesceSnapAlignHits: " + hitRec.getType() );
                        break;
                }
            }

            if (hSnap && vSnap)
            {
                // intersect the 2 lines on the plane
                var hPt = hSnap.getLocalPoint(),
                    vPt = vSnap.getLocalPoint();

                var stage = this.getStage();
                var stageOffset = viewUtils.getElementOffset( stage );
                MathUtils.makeDimension3( stageOffset );

                var x = vPt[0],  y = hPt[1];
                var localPt = [x,y,0,1];
                var viewPt = MathUtils.transformPoint( localPt, planeToViewMat );
                var scrPt = vecUtils.vecAdd(3, viewUtils.viewToScreen( viewPt ), stageOffset );

                hSnap.setLocalPoint( localPt );
                hSnap.setScreenPoint( scrPt );
                hSnap.setType( hSnap.SNAP_TYPE_ALIGN_BOTH );
                hSnap.setAssociatedScreenPoint2( vSnap.getAssociatedScreenPoint() );
                hitArray.push( hSnap );
            }
            else
                hitArray.push( hitRec );
        }
    },

    elementIsOnPlane : {
        value: function( elt, plane ) {
            // make a copy of the input plane and normalize to 1
            var planeNrm = vecUtils.vecNormalize(3, plane, 1 );

            // calculate the plane for the elements
            // by getting the points in stage pre-world space.
            var bounds = viewUtils.getElementViewBounds3D( elt );

            // Snapping is done in screen space, so convert the bounds from
            // local element space to global screen space
            var bounds3D = new Array();
            for (var i=0;  i<3;  i++)
                bounds3D[i] = viewUtils.localToStageWorld( bounds[i],  elt );

            var vec0 = vecUtils.vecSubtract(3, bounds3D[0], bounds3D[1] ),
                vec1 = vecUtils.vecSubtract(3, bounds3D[2], bounds3D[1] );
            var nrm = MathUtils.cross( vec1, vec0 );
            var mag = vecUtils.vecMag(3, nrm);
            if (MathUtils.fpSign(mag) == 0)  return false;
            //nrm = nrm.multiply( 1.0/mag );
            vec3.scale( nrm, 1.0/mag );
            var cross = MathUtils.cross( nrm, planeNrm );
            var crossMag = vecUtils.vecMag(3, cross);
            if ( MathUtils.fpSign(crossMag) != 0 )  return false;

            // at this point the normals line up.  now we need to check that
            // that a point is on the plane
            var dist = vecUtils.vecDot(3, bounds3D[0], plane ) + plane[3];
            var rtnVal = (MathUtils.fpSign(dist) == 0);
            return rtnVal;
        }
    },

    snapToCached2DElements :
    {
        value: function( scrPt,  hitRecs )
        {
            if (!this._elementCache)  return;

            if(this._isCacheInvalid)
            {
                this.load2DCache(workingPlane);
                if(this._elementCache)  return;
            }

            var n = this._elementCache.length;
            for (var i=0;  i<n;  i++)
            {
                var snapRec = this._elementCache[i];
                var elt = snapRec.getElement();
                if (elt)
                {
                    if (!this.isAvoidedElement(elt) )
                    {
                        // get the point in the local space of the element
                        var localScrPt = viewUtils.globalToLocal( scrPt, elt );

                        var bounds = viewUtils.getElementViewBounds3D( elt );
                        var scrPtArr = snapRec.getScreenPointArray();
                        var hitRec = this.snapToScreenBounds( elt, scrPt,  bounds, scrPtArr );
                        if (hitRec)
                        {
                            if (!hitRec.checkType())
                            {
                                console.log( "invalid hit record: " + hitRec.getTypeString() );
                                hitRec.checkType();
                            }
                            else
                            {

                                // see if we can snap to a contained geometry object
                                if (hitRec && this.getGLWorld(elt)) // && !this.isARectangle(elt))
                                {
                                    var localPt = hitRec.calculateElementWorldPoint();
                                    if (hitRec.getType() != hitRec.SNAP_TYPE_ELEMENT)
                                    {
                                        //localPt = viewUtils.globalScreenToLocalWorld( scrPt, elt );
                                        localPt = viewUtils.localScreenToLocalWorld( localScrPt, elt );
                                    }
                                    var mat = viewUtils.getMatrixFromElement( elt );
                                    //var inv = mat.inverse();
                                    var inv = glmat4.inverse(mat, []);
                                    localPt = MathUtils.transformPoint( localPt, inv );
                                    var hitContained = this.snapToContainedElements( hitRec, localPt,  scrPt );

                                    // disable snapping to element bounds when the object is not selected
                                    if (!hitContained && !this.application.ninja.selectionController.isObjectSelected(elt))
                                    {
                                        if ((hitRec.getType() == hitRec.SNAP_TYPE_ELEMENT_EDGE) ||
                                            (hitRec.getType() == hitRec.SNAP_TYPE_ELEMENT_VERTEX) ||
                                            (hitRec.getType() == hitRec.SNAP_TYPE_ELEMENT))
                                            hitRec = null;
                                    }
                                }

                                if (hitRec)
                                {
                                    hitRec.setPlanarHit( true );
                                    hitRecs.push( hitRec );
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    snapToElements : {
        value: function( screenPt,  hitRecs ) {
            // start at the stage.
//          var stage = this.getStage();
            var stage = this.application.ninja.currentDocument.model.domContainer || this.getStage();

            // the root should be the 'view' canvas, so the first matrix is the camera
            viewUtils.setViewportObj( stage );

            MathUtils.makeDimension3( screenPt );
            this.hSnapToElements( stage,  hitRecs, 0, screenPt );

            return;
        }
    },

    hSnapToElements :
    {
        value: function( elt, hitRecs, depth, globalScrPt )
        {
            if(depth > 1)
            {
                return;
            }
            // hit test the current object
            var hit;
            var snapToStage = ((depth === 0) && (elt === this.application.ninja.currentDocument.model.domContainer) && (elt.nodeName === 'CANVAS'));
            if ((depth > 0) || snapToStage) // don't snap to the root unles we are working inside a canvas
            {
                // if the element is in the 2D cache snapping is done there
                if (elt.elementModel && !elt.elementModel.isIn2DSnapCache)
                {
                    hit = this.snapToElement( elt, globalScrPt );
                    if (hit)
                    {
                        if (!hit.checkType())
                        {
                            console.log( "invalid hit record: " + hit.getTypeString() );
                            hit.checkType()
                        }
                        else
                            hitRecs.push( hit );
                    }
                }
            }

            // TODO - Don't traverse svg and components' children
            if(elt.nodeName.toLowerCase() === "svg" || (elt.elementModel && (elt.elementModel.isComponent || (elt.elementModel.selection === "SVG"))))
            {
                return;
            }
            // test the rest of the tree
            var n = elt.childElementCount;
            if (n > 0)
            {
                for (var i=0;  i<n;  i++)
                {
                    var child = elt.children[i];
                    hit = this.hSnapToElements( child,  hitRecs, (depth+1), globalScrPt );
                    if (hit)
                    {
                        if (!hit.checkType())
                        {
                            console.log( "invalid hit record: " + hit.getTypeString() );
                            hit.checkType();
                        }
                        else
                            hitRecs.push( hit );
                    }
                }
            }
        }
    },

    snapToElement :
    {
        value: function( elt, globalScrPt )
        {
            if (this.isAvoidedElement(elt) )  return null;

            // get the local 3D points in the space of the element
            var bounds = viewUtils.getElementViewBounds3D( elt );

            // Snapping is done in screen space, so convert the bounds from
            // local element space to global screen space
            var bounds3D = new Array();
            var eltMat = viewUtils.getLocalToGlobalMatrix( elt );
            for (var i=0;  i<4;  i++)
                bounds3D[i] = viewUtils.localToGlobal2(bounds[i], eltMat);

            var hitRec = this.snapToScreenBounds( elt, globalScrPt, bounds, bounds3D );

            // see if we can snap to a contained geometry object
            if (hitRec && this.getGLWorld(elt)) // && !this.isARectangle(elt))
            {
                var localPt = hitRec.calculateElementWorldPoint();
                if (hitRec.getType() != hitRec.SNAP_TYPE_ELEMENT)
                    localPt = viewUtils.globalScreenToLocalWorld( globalScrPt, elt );
                var mat = viewUtils.getMatrixFromElement( elt );
                //var inv = mat.inverse();
                var inv = glmat4.inverse(mat, []);
                localPt = MathUtils.transformPoint( localPt, inv );
                var hitContained = false;
                hitContained = this.snapToContainedElements( hitRec, localPt,  globalScrPt );
            }

            return hitRec;
        }
    },

    snapToScreenBounds :
    {
        value: function( elt, scrPt,  bounds, bounds3D )
        {
            // push the element as the current viewport element
            viewUtils.pushViewportObj( elt );

            // we need to check the orientation of the bounds
            var nrm = MathUtils.getNormalFromBounds3D( bounds3D );
            if (MathUtils.fpSign(nrm[2]) == 0)  return null;
            var zNrm = nrm[2];
            var dist;

            try
            {
                var globalPt = scrPt.slice(0);

                // see if the screen point is inside the final bounds
                var hit = true;
                var pt0 = bounds3D[3];
                var hitRec = Object.create(HitRecord);//new HitRecord();
                var hitType = hitRec.SNAP_TYPE_ELEMENT;
                //var scrPt = globalPt;
                var localPt = null;
                var iLast = 3;
                var edgeIndex = -1;
                for (var i=0;  i<4;  i++)
                {
                    var pt1 = bounds3D[i];

                    // check if we are with the hit radius of pt0
                    dist = vecUtils.vecDist( 2, globalPt, pt0 );
                    if ( dist <= this.ELEMENT_VERTEX_HIT_RAD)
                    {
                        globalPt = pt0;
                        localPt = bounds[iLast];
                        hitType = hitRec.SNAP_TYPE_ELEMENT_VERTEX;
                        break;
                    }

                    // check the endpoint
                    dist = vecUtils.vecDist( 2, globalPt, pt1 );
                    if ( dist <= this.ELEMENT_VERTEX_HIT_RAD)
                    {
                        globalPt = pt1;
                        localPt = bounds[i];
                        hitType = hitRec.SNAP_TYPE_ELEMENT_VERTEX;
                        break;
                    }

                    // create a vector from pt0 to pt1
                    var vec0 = vecUtils.vecSubtract(2, pt1, pt0);

                    // test for a snap to the current edge
                    var nearPt = MathUtils.nearestPointOnLine2D( pt0, vec0,  globalPt );
                    var t = MathUtils.parameterizePointOnLine2D( pt0, vec0, nearPt );
                    dist = vecUtils.vecDist( 2, globalPt, nearPt );
                    if ((dist <= this.ELEMENT_EDGE_HIT_RAD) && (MathUtils.fpCmp(t,1.0) <= 0) && (MathUtils.fpSign(t) >= 0))
                    {
                        localPt = vecUtils.vecInterpolate( 3,  bounds[iLast], bounds[i], t );
                        hitType = hitRec.SNAP_TYPE_ELEMENT_EDGE;
                        globalPt = vecUtils.vecInterpolate( 3,  pt0, pt1, t );
                        break;
                    }

                    // create a vector from pt0 to the screen point
                    var vec1 = vecUtils.vecSubtract(2, globalPt, pt0);

                    // take the cross product of the 2 vectors.  positive sign indicates the
                    // point is outside the bounds.
                    var cross = vec0[0]*vec1[1] - vec0[1]*vec1[0];
                    if (((zNrm < 0) && (MathUtils.fpSign(cross) > 0)) ||
                        ((zNrm > 0) && (MathUtils.fpSign(cross) < 0)))
                    {
                        hit = false;
                        break;
                    }

                    // advance to the next edge
                    pt0 = pt1;
                    iLast = i;
                }


                if (hit && (hitType == hitRec.SNAP_TYPE_ELEMENT))
                {
                    // check the center point
                    var ctr2D = MathUtils.getCenterFromBounds( 2, bounds );
                    var ctr3D = viewUtils.localToGlobal( ctr2D, elt );
                    dist = vecUtils.vecDist( 2, globalPt, ctr3D );
                    if ( dist <= this.ELEMENT_VERTEX_HIT_RAD)
                    {
                        MathUtils.makeDimension3( ctr2D );
                        globalPt = ctr3D;
                        localPt  = ctr2D;
                        hitType  = hitRec.SNAP_TYPE_ELEMENT_CENTER;
                    }
                }

                if (hit)
                {
                    // if the interior of the element was hit, the local point is null at this point.
                    // Calculate the local point
                    var planeMat;
                    var mat = viewUtils.getMatrixFromElement( elt );
                    var wp = [0,0,1,0];
                    wp = MathUtils.transformPlane( wp, mat );
                    var wpMat = drawUtils.getPlaneToWorldMatrix(wp, MathUtils.getPointOnPlane(wp));
                    //var wpMatInv = wpMat.inverse();
                    var wpMatInv = glmat4.inverse(wpMat, []);
                    var recalcGlobalPt = false;
                    if (!localPt)
                    {
                        localPt = viewUtils.globalScreenToLocalWorld( globalPt,  elt );
                        if (!localPt)  return null;
                        recalcGlobalPt = true;
                    }
                    else
                    {
                        MathUtils.makeDimension3( localPt );
                        viewUtils.setViewportObj( elt );
                        localPt = viewUtils.screenToView( localPt[0], localPt[1], localPt[2] );
                        localPt = MathUtils.transformPoint( localPt, mat );
                    }

                    // transform the point from local world space to working plane space
                    localPt = MathUtils.transformPoint( localPt, wpMatInv );

                    // fill out the hit record
                    hitRec.setElt( elt );
                    hitRec.setLocalPoint( localPt );
                    hitRec.setPlaneMatrix( wpMat );
                    hitRec.setScreenPoint(globalPt);
                    hitRec.setPlane(wp);
                    hitRec.setType( hitType );
                    hitRec.setZIndex( viewUtils.getZIndex(elt) );
                    if (recalcGlobalPt)
                    {
                        globalPt = hitRec.calculateScreenPoint();
                        hitRec.setScreenPoint(globalPt);
                    }
                }
                else
                    hitRec = null;
            }
            catch(e)
            {
                //console.trace();
                console.log( "***** Exception in snapToElement: " + e + " *****" );
            }

            viewUtils.popViewportObj();

            return hitRec;
        }
    },

    isARectangle:
    {
        value: function( elt )
        {
            var rtnVal = false;
            var world = this.getGLWorld(elt);
            if (world)
            {
                var obj = world.getGeomRoot();
                if (!obj.getChild() && !obj.getNext())  // just a single object
                {
                    if (obj.geomType() == obj.GEOM_TYPE_RECTANGLE)
                    {
                        // FIXME - need to check that the rectangle fits the element bounds
                        //if ((obj.getWidth() == elt.
                        rtnVal = true;
                    }
                }
            }

            return rtnVal;
        }
    },


    snapToContainedElements :
    {
        value: function( hitRec, viewPt, targetScrPt )
        {
            var rtnVal = false;
             var elt = hitRec.getElement();
             if (elt)
             {
                if (elt.elementModel && elt.elementModel.shapeModel)
                {
                     var world = elt.elementModel.shapeModel.GLWorld;
                     if ( world )
                     {
                        // convert to GL coordinates
                        var glPt = this.globalScreenToWebGL( targetScrPt,  elt );
                        var eyePt = [0, 0, world.getViewDistance()];
                        var dir = vecUtils.vecSubtract(3, glPt, eyePt);

                        // recursively go through the tree testing all objects
                        var root = world.getGeomRoot();
                        rtnVal = this.hSnapToContainedElements( eyePt, dir,  root, hitRec, targetScrPt );
                    }
                }
            }

            return rtnVal;
        }
    },

    hSnapToContainedElements :
    {
        value: function( eyePt,  dir,  glObj,  hitRec, targetScrPt )
        {
            if (!glObj)  return false;

            var rtnVal = this.snapToContainedElement( eyePt,  dir,  glObj, hitRec, targetScrPt );

            rtnVal |= this.hSnapToContainedElements( eyePt,  dir,  glObj.getChild(), hitRec, targetScrPt );
            rtnVal |= this.hSnapToContainedElements( eyePt,  dir,  glObj.getNext(),  hitRec, targetScrPt );

            return rtnVal;
        }
    },

    doSnapToContainedElement:
    {
        value: function( eyePt,  dir,  glObj,  hitRec, targetScrPt )
        {
            var rtnVal = false;

            var elt = hitRec.getElt();
            var world = glObj.getWorld();

            var nearVrt = glObj.getNearVertex( eyePt, dir );
            if (nearVrt)
            {
                var viewPt = this.GLToView(nearVrt, world );
                var mat = viewUtils.getMatrixFromElement( elt );
                var worldPt = MathUtils.transformPoint( viewPt, mat );

                viewUtils.pushViewportObj( elt );
                var scrPt = viewUtils.viewToScreen( worldPt );
                var offset = viewUtils.getElementOffset( elt );
                MathUtils.makeDimension3( offset );
                var parentPt = vecUtils.vecAdd(3, scrPt, offset );
                var globalPt = viewUtils.localToGlobal( parentPt, elt.offsetParent );

                var dist = vecUtils.vecDist(2, globalPt, targetScrPt );
                if (dist < this.ELEMENT_VERTEX_HIT_RAD)
                {
                    //console.log( "hit a vertex" );

                    // check if the distance is less than
                    // the distance on the current hit record
                    //if (dist <= vecUtils.vecDist(2, targetScrPt, hitRec.getScreenPoint() ))
                    {
                        //console.log( "rejected - further than existing snap" );

                        hitRec.setScreenPoint( globalPt );
                        //var localMatInv = hitRec.getPlaneMatrix().inverse();
                        var localMatInv = glmat4.inverse( hitRec.getPlaneMatrix(), []);
                        viewUtils.pushViewportObj( hitRec.getElement() );
                        var localPt = viewUtils.screenToView( scrPt[0], scrPt[1], scrPt[2] );
                        viewUtils.popViewportObj();
                        localPt = MathUtils.transformPoint( localPt, localMatInv );
                        hitRec.setLocalPoint( localPt );
                        hitRec.setType( hitRec.SNAP_TYPE_CONTAINED_ELEMENT );

                        rtnVal = true;
                    }
                }
            }

            if (!rtnVal)
            {
                var nearPt = glObj.getNearPoint( eyePt,  dir );
                if (nearPt)
                {
                    var viewPt = this.GLToView(nearPt, world );
                    var mat = viewUtils.getMatrixFromElement( elt );
                    var worldPt = MathUtils.transformPoint( viewPt, mat );

                    viewUtils.pushViewportObj( elt );
                    var scrPt = viewUtils.viewToScreen( worldPt );
                    var offset = viewUtils.getElementOffset( elt );
                    MathUtils.makeDimension3( offset );
                    var parentPt = vecUtils.vecAdd(3, scrPt, offset );
                    var globalPt = viewUtils.localToGlobal( parentPt, elt.offsetParent );

                    var dist = vecUtils.vecDist(2, globalPt, targetScrPt );
                    if (dist < this.ELEMENT_EDGE_HIT_RAD)
                    {
                        //console.log( "hit an edge" );

                        // check if the distance is less than
                        // the distance on the current hit record
                        //var dist2 = vecUtils.vecDist(2, targetScrPt, hitRec.getScreenPoint() );
                        //if (dist <= dist2+1 )
                        {
                            hitRec.setScreenPoint( globalPt );
                            //var localMatInv = hitRec.getPlaneMatrix().inverse();
                            var localMatInv = glmat4.inverse( hitRec.getPlaneMatrix(), []);
                            viewUtils.pushViewportObj( hitRec.getElement() );
                            var localPt = viewUtils.screenToView( scrPt[0], scrPt[1], scrPt[2] );
                            viewUtils.popViewportObj();
                            localPt = MathUtils.transformPoint( localPt, localMatInv );
                            hitRec.setLocalPoint( localPt );
                            hitRec.setType( hitRec.SNAP_TYPE_CONTAINED_ELEMENT );

                            rtnVal = true;
                        }
                    }
                }
            }   // if (!rtnVal)

            if (!rtnVal && glObj.containsPoint( eyePt,  dir ))
            {
                rtnVal = true;
            }

            return rtnVal;
        }
    },

    snapToContainedElement :
    {
        value: function( eyePt,  dir,  glObj,  hitRec, targetScrPt )
        {
            var rtnVal = false;
            var elt = hitRec.getElement();

            var world = glObj.getWorld();
            switch (glObj.geomType())
            {
                case glObj.GEOM_TYPE_RECTANGLE:
                    if ((glObj.getWidth() != world.getViewportWidth()) || (glObj.getHeight() != world.getViewportHeight()))
                        rtnVal = this.doSnapToContainedElement( eyePt,  dir,  glObj,  hitRec, targetScrPt );
                    break;

                case glObj.GEOM_TYPE_CIRCLE:
                    rtnVal = this.doSnapToContainedElement( eyePt,  dir,  glObj,  hitRec, targetScrPt );
                    break;

                case glObj.GEOM_TYPE_LINE:
                case glObj.GEOM_TYPE_PATH:
                    // Snapping not implemented for these type, but don't throw an error...
                    break;

                case glObj.GEOM_TYPE_BRUSH_STROKE:
                    break; //don't throw error because snapping not yet implemented

                case glObj.GEOM_TYPE_CUBIC_BEZIER:
                    rtnVal = this.doSnapToContainedElement( eyePt,  dir,  glObj,  hitRec, targetScrPt );
                    break;
                default:
                        throw new Error( "invalid GL geometry type: " + glObj.geomType() );
                    break;
            }

            return rtnVal;
        }
    },

    getGLWorld : {
        value: function( elt ) {
            var world;
            if (elt.elementModel && elt.elementModel.shapeModel)
                world = elt.elementModel.shapeModel.GLWorld;

            return world;
        }
    },

    globalScreenToWebGL :
    {
        value: function( targetScrPt,  elt )
        {
            var glPt;
            if (elt.elementModel && elt.elementModel.shapeModel)
            {
                var world = elt.elementModel.shapeModel.GLWorld;
                if ( world )
                {
                    // create a matrix going all the way from GL space to screen space
                    var o2w = viewUtils.getLocalToGlobalMatrix( elt );
                    //var w2o = o2w.inverse();
                    var w2o = glmat4.inverse(o2w, []);
                    viewUtils.pushViewportObj( elt );
                    var cop = viewUtils.getCenterOfProjection();
                    viewUtils.popViewportObj();
                    var s2v = Matrix.Translation([-cop[0], -cop[1], 0]);
                    var vToNDC = Matrix.I(4);
                    vToNDC[0] = 1.0/(0.5*world.getViewportWidth());
                    vToNDC[5] = 1.0/(0.5*world.getViewportHeight());
                    //var sToNDC = vToNDC.multiply( s2v );
                    var sToNDC = glmat4.multiply( vToNDC, s2v, [] );

                    // add the projection matrix
                    var projMat = world.makePerspectiveMatrix();
                    //var projInv = projMat.inverse();
                    var projInv = glmat4.inverse(projMat, []);
                    var camInv = world.getCameraMatInverse();
                    //var glToNDC = projMat.multiply( camInv );
                    var glToNDC = glmat4.multiply( projMat, camInv, [] );
                    //var ndcToGL = glToNDC.inverse();
                    var ndcToGL = glmat4.inverse(glToNDC, []);
                    //var sToGL = projInv.multiply( sToNDC );
                    var sToGL = glmat4.multiply( projInv, sToNDC, [] );

                    // add the camera matrix to produce the matrix going from
                    // object local screen space to GL space
                    var camMat = world.getCameraMat();
                    //sToGL = camMat.multiply( sToGL );
                    sToGL = glmat4.multiply( camMat, sToGL,  [] );

                    // transform the input point in screen space to object space
                    var tmpInPt = targetScrPt.slice(0);
                    tmpInPt = MathUtils.makeDimension4( tmpInPt );
                    tmpInPt[2] = 0.0;   // z == 0
                    var tmpPt1 = MathUtils.transformHomogeneousPoint( tmpInPt, w2o);
                    tmpPt1 = MathUtils.applyHomogeneousCoordinate( tmpPt1 );

                    // get a second point in object space starting from the input point plus an (arbitrary) z offset
                    tmpInPt[2] = 100.0;
                    var tmpPt2 = MathUtils.transformHomogeneousPoint( tmpInPt, w2o);
                    tmpPt2 = MathUtils.applyHomogeneousCoordinate( tmpPt2 );

                    // project the 2 object space points onto the original plane of the object
                    var tmpPt3 = MathUtils.vecIntersectPlane( tmpPt1, vecUtils.vecSubtract(3, tmpPt2, tmpPt1), [0,0,1,0]);
                    //console.log( "object space pt: " + tmpPt3 );

                    // get the z value in NDC space of the projection plane
                    var ndcPt = MathUtils.transformHomogeneousPoint( [0, 0, 0], glToNDC );
                    ndcPt = MathUtils.applyHomogeneousCoordinate( ndcPt );
                    var zNDC = ndcPt[2];

                    // transform the  ndc point into gl space
                    ndcPt = tmpPt3.slice(0);
                    ndcPt[2] = zNDC;
                    glPt = MathUtils.transformHomogeneousPoint( ndcPt, sToGL );
                    glPt = MathUtils.applyHomogeneousCoordinate( glPt );
                    glPt[1] = -glPt[1];

                    //console.log( "object space pt: " + tmpPt3.elements + ", GL pt: " + glPt.elements );
                }
            }
            return glPt;
        }
    },

    GLToView :
    {
        value: function( glPt, world )
        {
            var projMat = world.makePerspectiveMatrix();
            //var mat = projMat.multiply( world.getCameraMatInverse() );
            var mat = glmat4.multiply( projMat, world.getCameraMatInverse(), [] );
            var viewPt = MathUtils.transformHomogeneousPoint( glPt, mat );
            viewPt = MathUtils.applyHomogeneousCoordinate( viewPt );
            viewPt[0] *=  0.5*world.getViewportWidth();
            viewPt[1] *= -0.5*world.getViewportHeight();
            viewPt[2]  =  0.0;

            return viewPt;
        }
    },


    addToAvoidList : {
        value: function( elt ) {
            this._avoidList.push( elt );
        }
    },

    clearAvoidList : {
        value: function() {
            this._avoidList = new Array;
        }
    },

    isAvoidedElement : {
        value: function( elt ) {
            var n = this._avoidList.length;
            for (var i=0;  i<n;  i++)
            {
                if (this._avoidList[i] == elt)  return true;
            }

            return false;
        }
    },

    updateWorkingPlaneFromView : {
        value: function () {
            var stage = this.getStage();
            if (stage)
            {
                var mat = viewUtils.getMatrixFromElement(stage);
                if (mat)
                {
                    // see if we are currently displaying the grid
                    var drawingGrid = drawUtils.isDrawingGrid();

                    // get the Z axis of the matrix
                    var dir = [mat[8], mat[9], mat[10]];
                    dir = vecUtils.vecNormalize(3, dir, 1.0);
                    var x = Math.abs(dir[0]),
                        y = Math.abs(dir[1]),
                        z = Math.abs(dir[2]);

                    // fix the grid to an orientation
                    //x = 1;  y = 0;  z = 0;    // Y/Z plane
                    //x = 0;  y = 0;  z = 1;        // X/Y plane

                    var id;
                    var plane = [0, 0, 0, 0];
                    var change = false;
                    if (x > y) {
                        if (x > z) {
                            plane[0] = 1;
                            plane[3] = this.getStageWidth() / 2.0;
                            if (dir[0] > 0) plane[3] = -plane[3];
                            change = !drawUtils.drawYZ;
                            drawUtils.drawXY = drawUtils.drawXZ = false;
                            if (drawingGrid)  drawUtils.drawYZ = true;
                            id = "showSide";
                        }
                        else {
                            plane[2] = 1;
                            change = !drawUtils.drawXY;
                            drawUtils.drawYZ = drawUtils.drawXZ = false;
                            if (drawingGrid)  drawUtils.drawXY = true;
                            id = "showFront";
                        }
                    }
                    else {
                        if (y > z) {
                            plane[1] = 1;
                            plane[3] = this.getStageHeight() / 2.0;
                            if (dir[1] > 0) plane[3] = -plane[3];
                            change = !drawUtils.drawXZ;
                            drawUtils.drawXY = drawUtils.drawYZ = false;
                            if (drawingGrid)  drawUtils.drawXZ = true;
                            id = "showTop";
                        }
                        else {
                            plane[2] = 1;
                            change = !drawUtils.drawXY;
                            drawUtils.drawYZ = drawUtils.drawXZ = false;
                            if (drawingGrid)  drawUtils.drawXY = true;
                            id = "showFront";
                        }
                    }

                    if (change) {
                        //console.log( "change working plane: " + drawUtils.drawXY + ", " + drawUtils.drawYZ + ", " + drawUtils.drawXZ );
                        workingPlane = plane;
                        drawUtils.setWorkingPlane(plane);
                        //window.stageManager.drawSelectionRec(true);
                        //window.stageManager.layoutModule.redrawDocument();
                        this.application.ninja.stage.updateStage = true;
                    }
                }
            }
        }
    },

    sortHitRecords : {
        value: function( hitRecs ) {
            if (!hitRecs)  return;
            var nHits = hitRecs.length;
            if (nHits < 2)
            {
        //          if (nHits > 0)
        //              console.log( "single hit, type: " + hitRecs[0].getTypeString() + ", screen point z: " + hitRecs[0].getScreenPoint()[2] );
                return;
            }

            // find the hit record with the largest Z value in global screen space
            for (var i=0;  i<nHits;  i++)
            {
                var hi = hitRecs[i];
                var pi = hi.getScreenPoint();
                for (var j=i+1;  j<nHits;  j++)
                {
                    var hj = hitRecs[j];
                    var pj = hj.getScreenPoint();
                    if (pj[2] > pi[2])
                    {
                        var tmp = hitRecs[i];
                        hitRecs[i] = null;
                        hi = null;
                        hitRecs[i] = hj;
                        hitRecs[j] = tmp;
                        hi = hj;
                    }
                }
            }

            // stage hits are lowest priority.  Move them to the end of the array
            var nm1 = nHits - 1;
            var flag = false;
            for (var i=nHits-1;  i>=0;  i--)
            {
                var pi = hitRecs[i];

                // we favor snapping to object vertices.
                // if we find one, put it first and return
                if (pi.getType() == pi.SNAP_TYPE_ELEMENT_VERTEX)
                {
                    if (i != 0)
                    {
                        var tmp = hitRecs[0];
                        hitRecs[0] = pi;
                        hitRecs[i] = tmp;
                    }
                    return;
                }

                if (pi.getType() == pi.SNAP_TYPE_STAGE)
                {
                    if (flag)   // don't start moving until we find something other than a stage snap
                    {
                        var pn = hitRecs[nm1];
                        hitRecs[nm1] = pi;
                        hitRecs[i] = pn;
                        flag = true;
                    }
                    nm1--;
                }
                else
                    flag = true;
            }

            var mergedSnap = this.mergeHitRecords( hitRecs );
            if (mergedSnap)
            {
                while (hitRecs.length > 0) hitRecs.pop();
                hitRecs.push( mergedSnap );
                //console.log( "merged snaps" );
            }

            //this.checkZValues( hitRecs );
        }
    },

    mergeHitRecords :
    {
        value: function( hitRecs )
        {
            var nHits = hitRecs.length;
            //console.log( "merging " + nHits + " hits" );
            var i = 0;
            for (i=0;  i<nHits;  i++)
            {
                var hi = hitRecs[i];
                var iType = hi.getType();
                for (var j=(i+1);  j<nHits;  j++)
                {
                    var hj = hitRecs[j];
                    var jType = hj.getType();

                    var hSnap,  vSnap, hRec;
                    if ((iType == hi.SNAP_TYPE_ALIGN_HORIZONTAL) && (jType == hj.SNAP_TYPE_GRID_VERTICAL))
                    {
                        hSnap = hi;  vSnap= hj;
                    }
                    else if ((iType == hi.SNAP_TYPE_ALIGN_VERTICAL) && (jType == hj.SNAP_TYPE_GRID_HORIZONTAL))
                    {
                        hSnap = hj;  vSnap = hi;
                    }

                    if (hSnap && vSnap)
                    {
                        //console.log( "\tmerge 1" );

                        // intersect the 2 lines on the plane
                        var hPt = hSnap.getLocalPoint(),
                            vPt = vSnap.getLocalPoint();

                        var stage = this.getStage();
                        var stageOffset = viewUtils.getElementOffset( stage );
                        MathUtils.makeDimension3( stageOffset );

                        var x = vPt[0],  y = hPt[1];
                        var localPt = [x,y,0,1];
                        var planeToViewMat = this.getPlaneToViewMat();
                        var viewPt = MathUtils.transformPoint( localPt, planeToViewMat );
                        var scrPt = vecUtils.vecAdd(3, viewUtils.viewToScreen( viewPt ), stageOffset );

                        hSnap.setLocalPoint( localPt );
                        hSnap.setScreenPoint( scrPt );
                        hSnap.setType( hSnap.SNAP_TYPE_ALIGN_MERGED );
                        hSnap.setElement( stage );
                        //hSnap.setPlane( [0,0,1,0] );
                        //hSnap.setPlaneMatrix( Matrix.I(4) );
                        if (vSnap.hasAssociatedScreenPoint() )
                            hSnap.setAssociatedScreenPoint( vSnap.getAssociatedScreenPoint() );
                        if (vSnap.hasAssociatedScreenPoint2() )
                            hSnap.setAssociatedScreenPoint2( vSnap.getAssociatedScreenPoint2() );
                        return hSnap;
                    }

                    hSnap = null;  vSnap = null;
                    if ((iType == hi.SNAP_TYPE_ALIGN_HORIZONTAL) && (jType == hj.SNAP_TYPE_GRID_VERTEX))
                    {
                        hSnap = hi;  vSnap = hj;
                    }
                    else if ((jType == hi.SNAP_TYPE_ALIGN_HORIZONTAL) && (iType == hj.SNAP_TYPE_GRID_VERTEX))
                    {
                        hSnap = hj;  vSnap = hi;
                    }
                    else if ((iType == hi.SNAP_TYPE_ALIGN_VERTICAL) && (jType == hj.SNAP_TYPE_GRID_VERTEX))
                    {
                        vSnap = hi;  hSnap = hj;
                    }
                    else if ((jType == hi.SNAP_TYPE_ALIGN_VERTICAL) && (iType == hj.SNAP_TYPE_GRID_VERTEX))
                    {
                        vSnap = hj;  hSnap = hi;
                    }

                    if (hSnap && vSnap)
                    {
                        //console.log( "\tmerge 2" );

                        // intersect the 2 lines on the plane
                        var hPt = hSnap.getLocalPoint(),
                            vPt = vSnap.getLocalPoint();

                        var stage = this.getStage();
                        var stageOffset = viewUtils.getElementOffset( stage );
                        MathUtils.makeDimension3( stageOffset );

                        var y = hPt[1],  x = vPt[0];
                        var localPt = [x,y,0,1];
                        var planeToViewMat = this.getPlaneToViewMat();
                        var viewPt = MathUtils.transformPoint( localPt, planeToViewMat );
                        var scrPt = vecUtils.vecAdd(3, viewUtils.viewToScreen( viewPt ), stageOffset );

                        hSnap.setLocalPoint( localPt );
                        hSnap.setScreenPoint( scrPt );
                        hSnap.setType( hSnap.SNAP_TYPE_ALIGN_MERGED );
                        hSnap.setElement( stage );
                        //hSnap.setPlane( [0,0,1,0] );
                        //hSnap.setPlaneMatrix( Matrix.I(4) );
                        if (vSnap.hasAssociatedScreenPoint() )
                            hSnap.setAssociatedScreenPoint( vSnap.getAssociatedScreenPoint() );
                        if (vSnap.hasAssociatedScreenPoint2() )
                            hSnap.setAssociatedScreenPoint2( vSnap.getAssociatedScreenPoint2() );
                        return hSnap;
                    }

                    hSnap = null;  vSnap = null;
                    if (iType == hi.SNAP_TYPE_ELEMENT_EDGE)
                    {
                        var eltScrPt = hi.calculateElementScreenPoint();
                        var bounds = viewUtils.getElementViewBounds3D( hi.getElement() );
                        var xMax = bounds[2][0],  yMax = bounds[2][1];
                        var x = eltScrPt[0],  y = eltScrPt[1];
                        if ((MathUtils.fpCmp(x,0) == 0) || (MathUtils.fpCmp(x,xMax) == 0))
                        {
                            vSnap = hi;
                            if ((jType == hj.SNAP_TYPE_ALIGN_HORIZONTAL) || (jType == hj.SNAP_TYPE_GRID_HORIZONTAL) ||
                                                (jType == hj.SNAP_TYPE_ALIGN_BOTH) || (jType == hj.SNAP_TYPE_GRID_VERTEX))
                                hSnap = hj;
                        }
                        else if ((MathUtils.fpCmp(y,0) == 0) || (MathUtils.fpCmp(y,yMax) == 0))
                        {
                            hSnap = hi;
                            if ((jType == hj.SNAP_TYPE_ALIGN_VERTICAL) || (jType == hj.SNAP_TYPE_GRID_VERTICAL) ||
                                                (jType == hj.SNAP_TYPE_ALIGN_BOTH) || (jType == hj.SNAP_TYPE_GRID_VERTEX))
                                vSnap = hj;
                        }

                        if (hSnap && vSnap)
                        {
                            //console.log( "merge edge" );

                            var hPt = hSnap.getLocalPoint(),
                                vPt = vSnap.getLocalPoint();

                            if (hSnap == hi)  hPt = hSnap.calculateStageWorldPoint();
                            else  vPt = vSnap.calculateStageWorldPoint();

                            var stage = this.getStage();
                            var stageOffset = viewUtils.getElementOffset( stage );
                            MathUtils.makeDimension3( stageOffset );

                            var y = hPt[1],  x = vPt[0];
                            var localPt = [x,y,0,1];
                            var planeToViewMat = this.getPlaneToViewMat();
                            var viewPt = MathUtils.transformPoint( localPt, planeToViewMat );
                            var scrPt = vecUtils.vecAdd(3, viewUtils.viewToScreen( viewPt ), stageOffset );

                            hSnap.setLocalPoint( localPt );
                            hSnap.setScreenPoint( scrPt );
                            hSnap.setType( hSnap.SNAP_TYPE_ALIGN_MERGED );
                            hSnap.setElement( stage );
                            //hSnap.setPlane( [0,0,1,0] );
                            //hSnap.setPlaneMatrix( Matrix.I(4) );
                            if (vSnap.hasAssociatedScreenPoint() )
                                hSnap.setAssociatedScreenPoint( vSnap.getAssociatedScreenPoint() );
                            if (vSnap.hasAssociatedScreenPoint2() )
                                hSnap.setAssociatedScreenPoint2( vSnap.getAssociatedScreenPoint2() );
                            return hSnap;
                        }
                    }
                }
            }
        }
    },

    offsetWorkingPlaneToHit : {
        value: function( hitRec ) {
            // get the location of the point in stage world space
            var elt = hitRec.getElt();
            var localPt = hitRec.getLocalPoint();
            var planeMat = hitRec.getPlaneMatrix();
            var stageWorldPt = viewUtils.postViewToStageWorld( MathUtils.transformPoint(localPt,planeMat),  elt );

            workingPlane[3] = -( vecUtils.vecDot(3, workingPlane, stageWorldPt) );
        }
    },

    setupDragPlaneFromPlane : {
        value: function( plane ) {
            this._dragPlane = plane.slice(0);
            this._hasDragPlane = true;

            // cache a matrix to/from the drag plane
            var ptOnPlane = MathUtils.getPointOnPlane(this._dragPlane);
            this._dragPlaneToWorld = drawUtils.getPlaneToWorldMatrix(this._dragPlane, ptOnPlane)
            //this._worldToDragPlane = this._dragPlaneToWorld.inverse();
            this._worldToDragPlane = glmat4.inverse( this._dragPlaneToWorld, [] );

            // cache the matrices between stage world and global spaces
            this._stageWorldToGlobalMat = viewUtils.getStageWorldToGlobalMatrix();
            //this._globalToStageWorldMat = this._stageWorldToGlobalMat.inverse();
            this._globalToStageWorldMat = glmat4.inverse( this._stageWorldToGlobalMat, [] );

            //console.log( "setupDragPlane: " + this._dragPlane );

            // load the 2D elements
            this.load2DCache( this._dragPlane );
        }
    },

    setupDragPlanes : {
        value: function( hitRec, inGlobalMode ) {
            // get the location of the point in stage world space
            var elt = hitRec.getElt();
            var localPt = hitRec.getLocalPoint();
            var planeMat = hitRec.getPlaneMatrix();
            var stageWorldPt;

            /*
            if(inGlobalMode)
            {
                stageWorldPt = MathUtils.transformPoint(localPt,planeMat);
            }
            else
            {
                stageWorldPt = viewUtils.postViewToStageWorld( MathUtils.transformPoint(localPt,planeMat),  elt );
            }
            */
            stageWorldPt = viewUtils.postViewToStageWorld( MathUtils.transformPoint(localPt,planeMat),  elt );

            /*
             // get a working plane parallel to the current working plane through the stage world point
             this._dragPlane = workingPlane.slice(0);
             this._dragPlane[3] = -( vecUtils.vecDot(3, workingPlane, stageWorldPt) );
             this._hasDragPlane = true;

             // cache a matrix to/from the drag plane
             var ptOnPlane = MathUtils.getPointOnPlane(this._dragPlane);
             this._dragPlaneToWorld = drawUtils.getPlaneToWorldMatrix(this._dragPlane, ptOnPlane)
             this._worldToDragPlane = this._dragPlaneToWorld.inverse();

             // cache the matrices between stage world and global spaces
             this._stageWorldToGlobalMat = viewUtils.getStageWorldToGlobalMatrix();
             this._globalToStageWorldMat = this._stageWorldToGlobalMat.inverse();

             // load the 2D elements
             this.load2DCache( this._dragPlane );
             */

            this._dragPlane = workingPlane.slice(0);
            this._dragPlane[3] = -( vecUtils.vecDot(3, workingPlane, stageWorldPt) );
            this.setupDragPlaneFromPlane( this._dragPlane );

            return this._dragPlane;
        }
    },

    activateDragPlane : {
        value: function() {
            if (!this._dragPlaneActive)
            {
                this.pushWorkingPlane( this._dragPlane );
                this._dragPlaneActive = true;
            }
        }
    },

    deactivateDragPlane : {
        value: function() {
            if (this._dragPlaneActive)
            {
                this.popWorkingPlane();
                this._dragPlaneActive = false;
            }
        }
    },

    checkZValues : {
        value: function( hitRecs ) {
            var stage = this.getStage();
            var stageMat = viewUtils.getMatrixFromElement( stage );

            var n = hitRecs.length;
            for (var i=0;  i<n;  i++)
            {
                var hitRec = hitRecs[i];
                var elt = hitRec.getElt();
                if (elt != null)
                {
                    var localPt = hitRec.getLocalPoint();
                    var planeMat = hitRec.getPlaneMatrix();
                    var s0 = viewUtils.postViewToStageWorld( MathUtils.transformPoint(localPt,planeMat),  elt );
                    s0 = viewUtils.viewToScreen( MathUtils.transformPoint(s0, stageMat) );
                    var z = s0[2];

                    var typeStr = hitRec.getTypeString();
                    //console.log( "\ttype: " + typeStr + ", screen point z: " + hitRec.getScreenPoint()[2] + ", calculated z: " + z );
                }
            }
        }
    },

    drawDashedLine : {
        value: function( pt0, pt1, context ) {
            var p0 = pt0.slice(0),   p1 = pt1.slice(0);

            context.beginPath();
            context.strokeStyle = "gray";
            var dist = vecUtils.vecDist( 2, p0, p1 );
            var dashLen = 4;
            var n = Math.floor( dist/dashLen );
            var dt = 1.0/(2*n);
            var t0 = 0;
            for (var i=0;  i<n;  i++)
            {
                var t1 = t0 + dt;
                var pa = vecUtils.vecInterpolate( 2,  p0, p1, t0 );
                var pb = vecUtils.vecInterpolate( 2,  p0, p1, t1 );
                context.moveTo( pa[0],  pa[1] );
                context.lineTo( pb[0],  pb[1] );

                t0 = t1 + dt;
            }
            context.closePath();
            context.stroke();

            context.beginPath();
            context.strokeStyle = "white";
            t0 = dt;
            for (var j=0;  j<n;  j++)
            {
                var t1 = t0 + dt;
                var pa = vecUtils.vecInterpolate( 2,  p0, p1, t0 );
                var pb = vecUtils.vecInterpolate( 2,  p0, p1, t1 );
                context.moveTo( pa[0],  pa[1] );
                context.lineTo( pb[0],  pb[1] );

                t0 = t1 + dt;
            }
            context.closePath();
            context.stroke();
        }
    },

    calculateGridHitRadii : {
        value: function() {
            // horizontal and vertical grid spacing are independant.
            // use the minimum value.
            var dx = drawUtils.getGridHorizontalSpacing(),
                dy = drawUtils.getGridVerticalSpacing();
            var delta = Math.min(dx,dy);

            // calculate the relative vertex hit radius
            var vhr = ( delta * this.GRID_VERTEX_HIT_RAD)/25.0;
            if (vhr < 2)  vhr = 2;
            else if (vhr > this.GRID_VERTEX_HIT_RAD)  vhr = this.GRID_VERTEX_HIT_RAD;
            this._gridVertexHitRad = vhr;

            // calculate the relative edge hit radius
            vhr = (delta  * this.GRID_EDGE_HIT_RAD)/25.0;
            if (vhr < 2)  vhr = 2;
            else if (vhr > this.GRID_EDGE_HIT_RAD)  vhr = this.GRID_EDGE_HIT_RAD;

            this._gridEdgeHitRad = vhr;
        }
    },

    drawLastHit : {
        value: function() {
            if (this._lastHit)
            {
                this.drawHit( this._lastHit );
            }
        }
    },

    drawHit :
    {
        value: function( hitRec )
        {
            if (hitRec)
            {
                var saveContext = drawUtils.getDrawingSurfaceElement();
                drawUtils.setDrawingSurfaceElement(this.application.ninja.stage.drawingCanvas);
                var context = drawUtils.getDrawingContext();
                if (context)
                {
                    drawUtils.pushState();
                    context.strokeStyle = "0xffff00";
                    context.lineWidth = 1;
                    var s = 4;

                    var stage = this.getStage();
                    var offset = viewUtils.getElementOffset( stage );
                    offset[2] = 0;

                    switch (hitRec.getType())
                    {
                        case hitRec.SNAP_TYPE_STAGE:
                            break;

                        case hitRec.SNAP_TYPE_GRID_VERTEX:
                        case hitRec.SNAP_TYPE_GRID_HORIZONTAL:
                        case hitRec.SNAP_TYPE_GRID_VERTICAL:
                        case hitRec.SNAP_TYPE_ELEMENT:
                        case hitRec.SNAP_TYPE_ELEMENT_EDGE:
                        case hitRec.SNAP_TYPE_ELEMENT_VERTEX:
                        case hitRec.SNAP_TYPE_ELEMENT_CENTER:
                        case hitRec.SNAP_TYPE_CONTAINED_ELEMENT:
                        case hitRec.SNAP_TYPE_ALIGN_MERGED:
                            var pt = hitRec.getScreenPoint();
                            context.beginPath();
                            if (hitRec.isPlanarHit())
                                context.strokeStyle = "black";
                            else
                                context.strokeStyle = "purple";
                            context.moveTo( pt[0],  pt[1] - s );
                            context.lineTo( pt[0],    pt[1] + s );
                            context.moveTo( pt[0]-s,  pt[1] );
                            context.lineTo( pt[0]+s,  pt[1] );
                            context.closePath();
                            context.stroke();

                            if (hitRec.hasAssociatedScreenPoint())
                            {
                                var pt0 = hitRec.getAssociatedScreenPoint();
                                this.drawDashedLine( pt0, pt, context );
                            }
                            if (hitRec.hasAssociatedScreenPoint2())
                            {
                                pt2 = hitRec.getAssociatedScreenPoint2();
                                this.drawDashedLine( pt2, pt, context );
                            }
                            break;

                        case hitRec.SNAP_TYPE_ALIGN_VERTICAL:
                        case hitRec.SNAP_TYPE_ALIGN_HORIZONTAL:
                            var pt = hitRec.getScreenPoint();
                            context.beginPath();
                            context.strokeStyle = "black";
                            context.lineWidth = 1;

                            context.moveTo( pt[0],  pt[1] - s );
                            context.lineTo( pt[0],    pt[1] + s );
                            context.moveTo( pt[0]-s,  pt[1] );
                            context.lineTo( pt[0]+s,  pt[1] );

                            var pt0 = hitRec.getAssociatedScreenPoint();
                            this.drawDashedLine( pt0, pt, context );

                            context.closePath();
                            context.stroke();
                            break;

                        case hitRec.SNAP_TYPE_ALIGN_BOTH:
                            var pt = hitRec.getScreenPoint();
                            var pt0 = hitRec.getAssociatedScreenPoint();
                            this.drawDashedLine( pt0, pt, context );
                            pt0 = hitRec.getAssociatedScreenPoint2();
                            this.drawDashedLine( pt0, pt, context );

                            context.beginPath();
                            context.strokeStyle = "black";
                            context.lineWidth = 1;

                            context.moveTo( pt[0],  pt[1] - s );
                            context.lineTo( pt[0],    pt[1] + s );
                            context.moveTo( pt[0]-s,  pt[1] );
                            context.lineTo( pt[0]+s,  pt[1] );

                            context.closePath();
                            context.stroke();

                            break;

                        default:
                            throw new Error( "SnapManager.drawLastHit case not handled" );
                            break;
                    }

                    drawUtils.popState();
                }
                drawUtils.setDrawingSurfaceElement(saveContext);
            }
        }
    },

    findHitRecordForElement: {
        value: function(elt) {
            var rtnHit;

            if (!this._hitRecords)  return;
            var nHits = this._hitRecords.length;

            for (var i=0;  i<nHits;  i++)
            {
                var hi = this._hitRecords[i];
                if(hi.getElement() === elt)
                {
                    rtnHit = hi;
                    break;
                }
            }
            // catch-all to turn off drag plane snapping
            this.deactivateDragPlane();

            this.setLastHit( rtnHit );
            return rtnHit;
        }
    }

});
