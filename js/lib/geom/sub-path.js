/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


var VecUtils =      require("js/helper-classes/3D/vec-utils").VecUtils;
var CanvasController = require("js/controllers/elements/canvas-controller").CanvasController;
var GeomObj =       require("js/lib/geom/geom-obj").GeomObj;
var AnchorPoint =   require("js/lib/geom/anchor-point").AnchorPoint;
var MaterialsModel = require("js/models/materials-model").MaterialsModel;

///////////////////////////////////////////////////////////////////////
// Class GLSubpath
//      representation a sequence of cubic bezier curves.
//      Derived from class GeomObj
///////////////////////////////////////////////////////////////////////

var GLSubpath = function GLSubpath() {
    ///////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////

    // NOTE:
    //  This class contains functionality to store piecewise cubic bezier paths.
    //  The coordinates of the paths are always in local, canvas space.
    //  That is, the Z coordinate can be ignored (for now), and the paths are essentially in 2D.
    //  All coordinates of the '_Samples' should lie within [0,0] and [width, height],
    //      where width and height refer to the dimensions of the canvas for this path.
    //  Whenever the the canvas dimensions change, the coordinates of the anchor points
    //      and _Samples must be re-computed.

    this._Anchors = [];
    this._BBoxMin = [0, 0, 0];
    this._BBoxMax = [0, 0, 0];
    this._isClosed = false;

    this._Samples = [];                 //polyline representation of this curve in canvas space
    this._sampleParam = [];             //parametric distance of samples, within [0, N], where N is # of Bezier curves (=# of anchor points if closed, =#anchor pts -1 if open)
    this._anchorSampleIndex = [];       //index within _Samples corresponding to anchor points

    //initially set the _dirty bit so we will re-construct _Anchors and _Samples
    this._dirty = true;

    //the top left location of this subpath's canvas in screen space (used to identify cases when location changes)
    this._canvasLeft = 0;
    this._canvasTop = 0;

    //stroke information
    this._strokeWidth = 1.0;
    this._strokeColor = [0.4, 0.4, 0.4, 1.0];
    this._fillColor = [1.0, 1.0, 1.0, 0.0];
    this._DISPLAY_ANCHOR_RADIUS = 5;

    //drawing context
    this._world = null;
    this._canvas = null; //todo this might be unnecessary (but faster) since we can get it from the world

    //tool that owns this subpath
    this._drawingTool = null;

    //used to query what the user selected, OR-able for future extensions
    this.SEL_NONE = 0;          //nothing was selected
    this.SEL_ANCHOR = 1;        //anchor point was selected
    this.SEL_PREV = 2;          //previous handle of anchor point was selected
    this.SEL_NEXT = 4;          //next handle of anchor point was selected
    this.SEL_PATH = 8;          //the path itself was selected
    this._selectMode = this.SEL_NONE;
    this._selectedAnchorIndex = -1;

    this._SAMPLING_EPSILON = 0.5; //epsilon used for sampling the curve

    // (current GeomObj complains if buildBuffers/render is added to GLSubpath prototype)
    //buildBuffers
    //  Build the stroke vertices, normals, textures and colors
    //  Add that array data to the GPU using OpenGL data binding
    this.buildBuffers = function () {
        // return; //no need to do anything for now
    };

    //render
    //  specify how to render the subpath in Canvas2D
    this.render = function () {
        // get the world
        var world = this.getWorld();
        if (!world)  throw( "null world in subpath render" );
        if (!this._canvas){
            //set the canvas by querying the world
            this._canvas = this.getWorld().getCanvas();
        }
        // get the context
        var ctx = world.get2DContext();
        if (!ctx)  throw ("null context in subpath render");

        var numAnchors = this.getNumAnchors();
        if (numAnchors === 0) {
            return; //nothing to do for empty paths
        }
        this.createSamples(); //dirty bit checked in this function...will generate a polyline representation

        //figure the size of the area we will draw into
        var bboxWidth=0, bboxHeight=0;
        bboxWidth = this._BBoxMax[0] - this._BBoxMin[0];
        bboxHeight = this._BBoxMax[1] - this._BBoxMin[1];

        ctx.save();
        ctx.clearRect(0, 0, bboxWidth, bboxHeight);

        ctx.lineWidth = this._strokeWidth;
        ctx.strokeStyle = "black";
        if (this._strokeColor) {
            //ctx.strokeStyle = MathUtils.colorToHex( this._strokeColor );
            var strokeColorStr = "rgba("+parseInt(255*this._strokeColor[0])+","+parseInt(255*this._strokeColor[1])+","+parseInt(255*this._strokeColor[2])+","+this._strokeColor[3]+")";
            ctx.strokeStyle = strokeColorStr;
        }

        ctx.fillStyle = "white";
        if (this._fillColor){
            //ctx.fillStyle = MathUtils.colorToHex( this._fillColor );
            var fillColorStr = "rgba("+parseInt(255*this._fillColor[0])+","+parseInt(255*this._fillColor[1])+","+parseInt(255*this._fillColor[2])+","+this._fillColor[3]+")";
            ctx.fillStyle = fillColorStr;
        }
        var lineCap = ['butt','round','square'];
        ctx.lineCap = lineCap[1];

        /*
        commenting this out for now because of Chrome bug where coincident endpoints of bezier curve cause the curve to not be rendered
        ctx.beginPath();
        var prevAnchor = this.getAnchor(0);
        ctx.moveTo(prevAnchor.getPosX()-bboxMin[0],prevAnchor.getPosY()-bboxMin[1]);
        for (var i = 1; i < numAnchors; i++) {
            var currAnchor = this.getAnchor(i);
            ctx.bezierCurveTo(prevAnchor.getNextX()-bboxMin[0],prevAnchor.getNextY()-bboxMin[1], currAnchor.getPrevX()-bboxMin[0], currAnchor.getPrevY()-bboxMin[1], currAnchor.getPosX()-bboxMin[0], currAnchor.getPosY()-bboxMin[1]);
            prevAnchor = currAnchor;
        }
        if (this._isClosed === true) {
            var currAnchor = this.getAnchor(0);
            ctx.bezierCurveTo(prevAnchor.getNextX()-bboxMin[0],prevAnchor.getNextY()-bboxMin[1], currAnchor.getPrevX()-bboxMin[0], currAnchor.getPrevY()-bboxMin[1], currAnchor.getPosX()-bboxMin[0], currAnchor.getPosY()-bboxMin[1]);
            prevAnchor = currAnchor;
            ctx.fill();
        }
        */


        ctx.beginPath();
        var numPoints = this._Samples.length;
        ctx.moveTo(this._Samples[0][0],this._Samples[0][1]);
        for (var i=0;i<numPoints;i++){
            ctx.lineTo(this._Samples[i][0],this._Samples[i][1]);
        }
        if (this._isClosed === true) {
            ctx.lineTo(this._Samples[0][0],this._Samples[0][1]);
        }
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }; //render()

    this.geomType = function () {
        return this.GEOM_TYPE_CUBIC_BEZIER;
    };

    this.setWidth = function (newW) {
        if (newW<1) {
            newW=1; //clamp minimum width to 1
        }

        //scale the contents of this subpath to lie within this width
        //determine the scale factor by comparing with the old width
        var oldWidth = this._BBoxMax[0]-this._BBoxMin[0];
        if (oldWidth<1) {
            oldWidth=1;
        }

        var scaleX = newW/oldWidth;
        if (scaleX===1) {
            return; //no need to do anything
        }

        //scale the anchor point positions such that the width of the bbox is the newW
        var origX = this._BBoxMin[0];
        var numAnchors = this._Anchors.length;
        for (var i=0;i<numAnchors;i++){
            //compute the distance from the bboxMin
            var oldW = this._Anchors[i].getPosX() - origX;
            var prevW = this._Anchors[i].getPrevX() - origX;
            var nextW = this._Anchors[i].getNextX() - origX;

            this._Anchors[i].setPos(origX + oldW*scaleX,this._Anchors[i].getPosY(),this._Anchors[i].getPosZ());
            this._Anchors[i].setPrevPos(origX + prevW*scaleX,this._Anchors[i].getPrevY(),this._Anchors[i].getPrevZ());
            this._Anchors[i].setNextPos(origX + nextW*scaleX,this._Anchors[i].getNextY(),this._Anchors[i].getNextZ());
        }
        this.makeDirty();
    };

    this.setHeight = function (newH) {
        if (newH<1) {
            newH=1; //clamp minimum width to 1
        }
        //scale the contents of this subpath to lie within this height
        //determine the scale factor by comparing with the old height
        var oldHeight = this._BBoxMax[1]-this._BBoxMin[1];
        if (oldHeight<1){
            oldHeight=1;
        }

        var scaleY = newH/oldHeight;
        if (scaleY===1){
            return; //no need to do anything
        }

        //scale the anchor point positions such that the height of the bbox is the newH
        var origY = this._BBoxMin[1];
        var numAnchors = this._Anchors.length;
        for (var i=0;i<numAnchors;i++){
            //compute the distance from the bboxMin
            var oldW = this._Anchors[i].getPosY() - origY;
            var prevW = this._Anchors[i].getPrevY() - origY;
            var nextW = this._Anchors[i].getNextY() - origY;

            this._Anchors[i].setPos(this._Anchors[i].getPosX(), origY + oldW*scaleY,this._Anchors[i].getPosZ());
            this._Anchors[i].setPrevPos(this._Anchors[i].getPrevX(), origY + prevW*scaleY,this._Anchors[i].getPrevZ());
            this._Anchors[i].setNextPos(this._Anchors[i].getNextX(), origY + nextW*scaleY,this._Anchors[i].getNextZ());
        }
        this.makeDirty();
    }

}; //function GLSubpath ...class definition

GLSubpath.prototype = new GeomObj();

/////////////////////////////////////////////////////////
// Property Accessors/Setters
/////////////////////////////////////////////////////////
GLSubpath.prototype.setWorld = function (world) {
    this._world = world;
};

GLSubpath.prototype.setCanvas = function (canvas){
    this._canvas = canvas;
};

GLSubpath.prototype.getWorld = function () {
    return this._world;
};

GLSubpath.prototype.getCanvas = function() {
    return this._canvas;
};
GLSubpath.prototype.makeDirty = function () {
    this._dirty = true;
};

GLSubpath.prototype.setDrawingTool = function (tool) {
    this._drawingTool = tool;
};

GLSubpath.prototype.getDrawingTool = function () {
    return this._drawingTool;
};


GLSubpath.prototype.getIsClosed = function () {
    return this._isClosed;
};

GLSubpath.prototype.setIsClosed = function (isClosed) {
    if (this._isClosed !== isClosed) {
        this._isClosed = isClosed;
        this.makeDirty();
    }
};

GLSubpath.prototype.getNumAnchors = function () {
    return this._Anchors.length;
};

GLSubpath.prototype.getAnchor = function (index) {
    return this._Anchors[index];
};

GLSubpath.prototype.addAnchor = function (anchorPt) {
    this._Anchors.push(anchorPt);
    this._selectedAnchorIndex = this._Anchors.length-1;
    this.makeDirty();
};

GLSubpath.prototype.insertAnchor = function(anchorPt, index){
    this._Anchors.splice(index, 0, anchorPt);
    this.makeDirty();
};

//remove and return anchor at specified index, return null on error
GLSubpath.prototype.removeAnchor = function (index) {
    var retAnchor = null;
    if (index < this._Anchors.length) {
        //if this is a closed path and we've removed either endpoint, we simply mark it as open
        if (this._isClosed && (index===this._Anchors.length-1 || index===0)){
            this.setIsClosed(false);
        } else {
            retAnchor = this._Anchors.splice(index, 1);
        }
        this.makeDirty();
        
    }
    //deselect any selected anchor point
    this.deselectAnchorPoint();
    return retAnchor;
};

GLSubpath.prototype.deselectAnchorPoint = function(){
    this._selectedAnchorIndex = -1;
};

GLSubpath.prototype.reversePath = function() {
    var revAnchors = [];
    var numAnchors = this._Anchors.length;
    var lastIndex = numAnchors-1;
    if (lastIndex<0){
        return; //cannot reverse empty path
    }
    for (var i=lastIndex;i>=0;i--) {
        var newAnchor = new AnchorPoint();
        var oldAnchor = this._Anchors[i];
        newAnchor.setPos(oldAnchor.getPosX(),oldAnchor.getPosY(),oldAnchor.getPosZ());
        newAnchor.setPrevPos(oldAnchor.getNextX(),oldAnchor.getNextY(),oldAnchor.getNextZ());
        newAnchor.setNextPos(oldAnchor.getPrevX(),oldAnchor.getPrevY(),oldAnchor.getPrevZ());
        revAnchors.push(newAnchor);
    }
    if (this._selectedAnchorIndex >= 0){
        this._selectedAnchorIndex = (numAnchors-1) - this._selectedAnchorIndex;
    }
    this._Anchors = revAnchors;
    this.makeDirty();
};

//remove all the anchor points
GLSubpath.prototype.clearAllAnchors = function () {
    this._Anchors = [];
    this.deselectAnchorPoint();
    this.setIsClosed(false);
    this.makeDirty();
};

GLSubpath.prototype.insertAnchorAtParameter = function(index, param) {
    if (index+1 >= this._Anchors.length && !this._isClosed) {
        return;
    }
    //insert an anchor after the specified index using the parameter, using De Casteljau subdivision
    var nextIndex = (index+1)%this._Anchors.length;

    //build the De Casteljau points
    var P0P1 = VecUtils.vecInterpolate(3, this._Anchors[index].getPos(), this._Anchors[index].getNext(), param);
    var P1P2 = VecUtils.vecInterpolate(3, this._Anchors[index].getNext(), this._Anchors[nextIndex].getPrev(), param);
    var P2P3 = VecUtils.vecInterpolate(3, this._Anchors[nextIndex].getPrev(), this._Anchors[nextIndex].getPos(), param);

    var P0P1P2 = VecUtils.vecInterpolate(3, P0P1, P1P2, param);
    var P1P2P3 = VecUtils.vecInterpolate(3, P1P2, P2P3, param);
    var anchorPos = VecUtils.vecInterpolate(3, P0P1P2, P1P2P3, param);


    //update the next of the anchor at index and prev of anchor at nextIndex
    var isPrevCoincident = false;
    var isNextCoincident = false;
    if (VecUtils.vecDist( 3, P0P1, this._Anchors[index].getNext()) < this._SAMPLING_EPSILON) {
        //no change to the next point
        isPrevCoincident = true;
    } else {
        this._Anchors[index].setNextPos(P0P1[0], P0P1[1], P0P1[2]);
    }

    if (VecUtils.vecDist( 3, P2P3, this._Anchors[nextIndex].getPrev()) < this._SAMPLING_EPSILON) {
        //no change to the prev point
        isNextCoincident = true;
    } else {
        this._Anchors[nextIndex].setPrevPos(P2P3[0], P2P3[1], P2P3[2]);
    }

    //create a new anchor point
    var newAnchor = new AnchorPoint();

    if (isPrevCoincident && isNextCoincident){
        anchorPos[0]=P1P2[0];anchorPos[1]=P1P2[1];anchorPos[2]=P1P2[2];
        newAnchor.setPos(anchorPos[0],anchorPos[1],anchorPos[2]);
        newAnchor.setPrevPos(anchorPos[0],anchorPos[1],anchorPos[2]);
        newAnchor.setNextPos(anchorPos[0],anchorPos[1],anchorPos[2]);
    } else {
        newAnchor.setPrevPos(P0P1P2[0], P0P1P2[1], P0P1P2[2]);
        newAnchor.setNextPos(P1P2P3[0], P1P2P3[1], P1P2P3[2]);
        newAnchor.setPos(anchorPos[0], anchorPos[1], anchorPos[2]);
    }

    //insert the new anchor point at the correct index and set it as the selected anchor
    this._Anchors.splice(nextIndex, 0, newAnchor);
    this._selectedAnchorIndex = nextIndex;
    this.makeDirty();
};


GLSubpath.prototype.isWithinPathBBox = function(x,y,z) {
    if (this._BBoxMin[0]>x || this._BBoxMin[1]>y || this._BBoxMin[2]>z){
        return false;
    }
    if (this._BBoxMax[0]<x || this._BBoxMax[1]<y || this._BBoxMax[2]<z){
        return false;
    }
    return true;
}


GLSubpath.prototype._checkIntersectionWithSamples = function(startIndex, endIndex, point, radius){
    //check whether the point is within the radius distance from the curve represented as a polyline in _Samples
    //return the parametric distance along the curve if there is an intersection, else return null
    //will assume that the BBox test is performed outside this function
    if (endIndex<startIndex){
        //go from startIndex to the end of the samples
        endIndex = this._Samples.length;
    }
    for (var i=startIndex; i<endIndex-1; i++){
        var seg0 = this._Samples[i].slice(0);
        var j=i+1;
        var seg1 = this._Samples[j].slice(0);
        var distToSegment = MathUtils.distPointToSegment(point, seg0, seg1);
        if (distToSegment<=radius){
            var paramDistance = MathUtils.paramPointProjectionOnSegment(point, seg0, seg1); //TODO Optimize! this function was called in distPointToSegment above
            return this._sampleParam[i] + (this._sampleParam[j] - this._sampleParam[i])*paramDistance;
        }
    }
    return null;
};

GLSubpath.prototype._checkIntersection = function(controlPts, beginParam, endParam, point, radius) {
    //check whether the point is within radius distance from the curve
    // if there is an intersection, return the parameter value (between beginParam and endParam) of the intersection point, else return null
    var bboxMin = [Infinity, Infinity, Infinity];
    var bboxMax = [-Infinity,-Infinity,-Infinity];
    for (var i=0;i<controlPts.length;i++) {
        for (var d=0;d<3;d++){
            if (controlPts[i][d] < bboxMin[d]){
                bboxMin[d] = controlPts[i][d];
            }
            if (controlPts[i][d] > bboxMax[d]){
                bboxMax[d] = controlPts[i][d];
            }
        }
    }
    //check whether the bbox of the control points contains the point within the specified radius
    for (var d=0;d<3;d++){
        if (point[d] < (bboxMin[d]-radius)){
            return null;
        }
        if (point[d] > (bboxMax[d]+radius)){
            return null;
        }
    }

    //check if the curve is already flat, and if so, check the distance from the segment C0C3 to the point
    //measure distance of C1 and C2 to segment C0-C3
    var distC1 = MathUtils.distPointToSegment(controlPts[1], controlPts[0], controlPts[3]);
    var distC2 = MathUtils.distPointToSegment(controlPts[2], controlPts[0], controlPts[3]);
    var maxDist = Math.max(distC1, distC2);
    var threshold = this._SAMPLING_EPSILON; //this should be set outside this function //TODO
    if (maxDist < threshold) { //if the curve is flat
        var distP = MathUtils.distPointToSegment(point, controlPts[0], controlPts[3]); //TODO we may need to neglect cases where the non-perpendicular distance is used...
        if (distP>radius) {
            return null;
        } else {
            var param = MathUtils.paramPointProjectionOnSegment(point, controlPts[0], controlPts[3]); //TODO this function is already called in distPointToSegment...optimize by removing redundant call
            //var param = VecUtils.vecDist(3, point, controlPts[0])/VecUtils.vecDist(3, controlPts[3], controlPts[0]);
            if (param<0)
                param=0;
            if (param>1)
                param=1;

            return beginParam + (endParam-beginParam)*param;
        }
    }

    //subdivide this curve using De Casteljau interpolation
    var C0_ = VecUtils.vecInterpolate(3, controlPts[0], controlPts[1], 0.5);
    var C1_ = VecUtils.vecInterpolate(3, controlPts[1], controlPts[2], 0.5);
    var C2_ = VecUtils.vecInterpolate(3, controlPts[2], controlPts[3], 0.5);

    var C0__ = VecUtils.vecInterpolate(3, C0_, C1_, 0.5);
    var C1__ = VecUtils.vecInterpolate(3, C1_, C2_, 0.5);

    var C0___ = VecUtils.vecInterpolate(3, C0__, C1__, 0.5);

    //recursively sample the first half of the curve
    var midParam = (endParam+beginParam)*0.5;
    var param1 = this._checkIntersection([controlPts[0],C0_,C0__,C0___], beginParam, midParam, point, radius);
    if (param1!==null){
        return param1;
    }

    //recursively sample the second half of the curve
    var param2 = this._checkIntersection([C0___,C1__,C2_,controlPts[3]], midParam, endParam, point, radius);
    if (param2!==null){
        return param2;
    }

    //no intersection, so return null
    return null;
};

//whether the point lies within the bbox given by the four control points
GLSubpath.prototype._isWithinGivenBoundingBox = function(point, ctrlPts, radius) {
    var bboxMin = [Infinity, Infinity, Infinity];
    var bboxMax = [-Infinity,-Infinity,-Infinity];
    for (var i=0;i<ctrlPts.length;i++) {
        for (var d=0;d<3;d++){
            if (ctrlPts[i][d] < bboxMin[d]){
                bboxMin[d] = ctrlPts[i][d];
            }
            if (ctrlPts[i][d] > bboxMax[d]){
                bboxMax[d] = ctrlPts[i][d];
            }
        }
    }
    //check whether the bbox of the control points contains the point within the specified radius
    for (var d=0;d<3;d++){
        if (point[d] < (bboxMin[d]-radius)){
            return false;
        }
        if (point[d] > (bboxMax[d]+radius)){
            return false;
        }
    }
    return true;
};

GLSubpath.prototype._checkAnchorIntersection = function(pickX, pickY, pickZ, radSq, anchorIndex, minDistance) {
    if ( anchorIndex >= this._Anchors.length) {
        return this.SEL_NONE;
    }

    var distSq = this._Anchors[anchorIndex].getDistanceSq(pickX, pickY, pickZ);
    //check the anchor point
    if (distSq < radSq && distSq<minDistance) {
        return this.SEL_ANCHOR;
    }
    //check the prev. and next of the selected anchor point
    distSq = this._Anchors[anchorIndex].getPrevDistanceSq(pickX, pickY, pickZ);
    if (distSq<radSq && distSq<minDistance){
        return this.SEL_PREV;
    }
    distSq = this._Anchors[anchorIndex].getNextDistanceSq(pickX, pickY, pickZ);
    if (distSq<radSq && distSq<minDistance){
        return this.SEL_NEXT;
    }
    return this.SEL_NONE;
};

GLSubpath.prototype.pickAnchor = function (pickX, pickY, pickZ, radius) {
    var numAnchors = this._Anchors.length;
    var selAnchorIndex = -1;
    var retCode = this.SEL_NONE;
    var minDistance = Infinity;
    var radSq = radius * radius;
    //check if the clicked location is close to the currently selected anchor position
    if (this._selectedAnchorIndex>=0 && this._selectedAnchorIndex<this._Anchors.length){
        retCode = this._checkAnchorIntersection(pickX, pickY, pickZ, radSq, this._selectedAnchorIndex, minDistance);
        if (retCode!==this.SEL_NONE){
            return [this._selectedAnchorIndex, retCode];
        }
    }
    //now check if the click location is close to any anchor position
    for (var i = 0; i < numAnchors; i++) {
        retCode = this._checkAnchorIntersection(pickX, pickY, pickZ, radSq, i, minDistance);
        if (retCode===this.SEL_ANCHOR){
            //we only care if the anchor was hit for the non-selected anchors (not the prev. or next handles)
            selAnchorIndex=i;
            break;
        }
    }//for every anchor i

    return [selAnchorIndex, retCode];
};



GLSubpath.prototype.pickPath = function (pickX, pickY, pickZ, radius, testOnly) {
    var numAnchors = this._Anchors.length;
    var selAnchorIndex = -1;
    var retParam = null;
    var retCode = this.SEL_NONE;

    //check if the location is close to any of the anchors
    var anchorAndRetCode = this.pickAnchor(pickX, pickY, pickZ, radius);
    selAnchorIndex = anchorAndRetCode[0];
    retCode = anchorAndRetCode[1];

    //if the location is not close any of the anchors, check if it is close to the curve itself
    if (selAnchorIndex===-1) {
        //first check if the input location is within the bounding box
        if (this.isWithinPathBBox(pickX,pickY,pickZ)){
            var numSegments = this._isClosed ? numAnchors : numAnchors-1;
            for (var i = 0; i < numSegments; i++) {
                var nextIndex = (i+1)%numAnchors;
                //check if the point is close to the bezier segment between anchor i and anchor nextIndex
                var controlPoints = [[this._Anchors[i].getPosX(),this._Anchors[i].getPosY(),this._Anchors[i].getPosZ()],
                    [this._Anchors[i].getNextX(),this._Anchors[i].getNextY(),this._Anchors[i].getNextZ()],
                    [this._Anchors[nextIndex].getPrevX(),this._Anchors[nextIndex].getPrevY(),this._Anchors[nextIndex].getPrevZ()],
                    [this._Anchors[nextIndex].getPosX(),this._Anchors[nextIndex].getPosY(),this._Anchors[nextIndex].getPosZ()]];
                var point = [pickX, pickY, pickZ];
                if (this._isWithinGivenBoundingBox(point, controlPoints, radius)) {
                    var intersectParam = this._checkIntersectionWithSamples(this._anchorSampleIndex[i], this._anchorSampleIndex[nextIndex], point, radius);
                    if (intersectParam){
                        selAnchorIndex=i;
                        retParam = intersectParam-i; //make the retParam go from 0 to 1
                        break;
                    }
                }
            }//for every anchor i
        }//if is within bbox
    }

    if (!testOnly){
        if (retCode!== this.SEL_NONE)
            retCode = retCode | this.SEL_PATH; //ensure that path is also selected if anything else is selected
        this._selectMode = retCode;
        this._selectedAnchorIndex = selAnchorIndex;
    }
    return [selAnchorIndex,retParam];
}; //GLSubpath.pickPath function

GLSubpath.prototype.getSelectedAnchorIndex = function () {
    return this._selectedAnchorIndex;
};

GLSubpath.prototype.getSelectedMode = function () {
    return this._selectMode;
};

GLSubpath.prototype.getNumPoints = function () {
    return this._Samples.length;
};

GLSubpath.prototype.getBBoxMin = function () {
    return this._BBoxMin;
};

GLSubpath.prototype.getBBoxMax = function () {
    return this._BBoxMax;
};

GLSubpath.prototype.getStrokeWidth = function () {
    return this._strokeWidth;
};

GLSubpath.prototype.setCanvasLeft = function(cl){
    this._canvasLeft = cl;
};
GLSubpath.prototype.setCanvasTop = function(ct){
    this._canvasTop = ct;
};
GLSubpath.prototype.setCanvasLeftTopPerElementMediator = function(elemMediator){
    if (!this._canvas){
        if (!this.getWorld())
            return; //cannot do anything if there is no world
        //set the canvas by querying the world
        this._canvas = this.getWorld().getCanvas();
    }
    //check if the canvas was translated
    var penCanvasCurrentLeft = parseInt(elemMediator.getProperty(this._canvas, "left"));//parseFloat(DocumentControllerModule.DocumentController.GetElementStyle(this._penCanvas, "left"));
    var penCanvasCurrentTop = parseInt(elemMediator.getProperty(this._canvas, "top"));//parseFloat(DocumentControllerModule.DocumentController.GetElementStyle(this._penCanvas, "top"));

    var translateCanvasX = Math.round(penCanvasCurrentLeft - this._canvasLeft);
    var translateCanvasY = Math.round(penCanvasCurrentTop - this._canvasTop);

    //update the left and top parameters for this subpath and also translate the subpath points (since they're stored in stage world space)
    if (Math.abs(translateCanvasX)>=1 || Math.abs(translateCanvasY)>=1){
        this.setCanvasLeft(penCanvasCurrentLeft);
        this.setCanvasTop(penCanvasCurrentTop);
    }
    this._dirty=true;
};

GLSubpath.prototype.computeLeftTopWidthHeight = function() {
    //build the width and height of this canvas by looking at local coordinates
    var bboxMin = this.getLocalBBoxMin();
    var bboxMax = this.getLocalBBoxMax();
    var bboxWidth = bboxMax[0] - bboxMin[0];
    var bboxHeight = bboxMax[1] - bboxMin[1];

    //build the 3D position of the plane center of this canvas by looking at midpoint of the bounding box in stage world coords
    bboxMin = this.getBBoxMin();
    bboxMax = this.getBBoxMax();
    //var bboxMid = [0.5 * (bboxMax[0] + bboxMin[0]), 0.5 * (bboxMax[1] + bboxMin[1]), 0.5 * (bboxMax[2] + bboxMin[2])];
    //var left = Math.round(bboxMid[0] - 0.5 * bboxWidth);
    //var top = Math.round(bboxMid[1] - 0.5 * bboxHeight);
    var left = this._canvasLeft;
    var top = this._canvasTop;
    return [left, top, bboxWidth, bboxHeight];
};

GLSubpath.prototype.setStrokeWidth = function (w) {
    var diffStrokeWidth = w-Math.floor(this._strokeWidth);//if positive, then stroke width grew, else shrunk
    if (diffStrokeWidth === 0)
        return;//nothing to do

    this._strokeWidth = w;
    this._dirty=true;

    var ElementMediator = require("js/mediators/element-mediator").ElementMediator;

    //translate the subpath in case the actual canvas location does not match where subpath thinks the canvas should be
    this.setCanvasLeftTopPerElementMediator(ElementMediator);

    // **** adjust the left, top, width, and height to adjust for the change in stroke width ****
    this.createSamples(); //dirty bit is checked here
    var ltwh = this.computeLeftTopWidthHeight();
    var canvasArray=[this._canvas];
    ElementMediator.setProperty(canvasArray, "width", [ltwh[2]+"px"], "Changing", "penTool");//canvas.width = w;
    ElementMediator.setProperty(canvasArray, "height", [ltwh[3]+"px"], "Changing", "penTool");//canvas.height = h;
    ElementMediator.setProperty(canvasArray, "left", [ltwh[0]+"px"],"Changing", "penTool");//DocumentControllerModule.DocumentController.SetElementStyle(canvas, "left", parseInt(left) + "px");
    ElementMediator.setProperty(canvasArray, "top", [ltwh[1]+ "px"],"Changing", "penTool");//DocumentControllerModule.DocumentController.SetElementStyle(canvas, "top", parseInt(top) + "px");
};

GLSubpath.prototype.getStrokeColor = function () {
    return this._strokeColor;
};

GLSubpath.prototype.setStrokeColor = function (c) {
    this._strokeColor = c;
};

GLSubpath.prototype.getFillColor = function() {
    return this._fillColor;
};

GLSubpath.prototype.setFillColor = function(c){
    this._fillColor = c;
};

GLSubpath.prototype.translateAnchors = function (tx, ty, tz) {
    for (var i=0;i<this._Anchors.length;i++){
        this._Anchors[i].translateAll(tx,ty,tz);
    }
    this._dirty = true;
};

GLSubpath.prototype.translateSamples = function (tx, ty, tz) {
    for (var i=0;i<this._Samples.length;i++){
        this._Samples[i][0]+=tx;
        this._Samples[i][1]+=ty;
        this._Samples[i][2]+=tz;
    }
};

GLSubpath.prototype._getCubicBezierPoint = function(C0X, C0Y, C0Z, C1X, C1Y, C1Z, C2X, C2Y, C2Z, C3X, C3Y, C3Z, param) {
    var t = param;
    var t2 = t * t;
    var t3 = t * t2;
    var s = 1 - t;
    var s2 = s * s;
    var s3 = s * s2;
    var Px = s3 * C0X + 3 * s2 * t * C1X + 3 * s * t2 * C2X + t3 * C3X;
    var Py = s3 * C0Y + 3 * s2 * t * C1Y + 3 * s * t2 * C2Y + t3 * C3Y;
    var Pz = s3 * C0Z + 3 * s2 * t * C1Z + 3 * s * t2 * C2Z + t3 * C3Z;
    return [Px,Py, Pz];
};

GLSubpath.prototype.getCubicBezierPoint = function(startIndex, param){
    var C0X = this._Anchors[startIndex].getPosX();
    var C0Y = this._Anchors[startIndex].getPosY();
    var C0Z = this._Anchors[startIndex].getPosZ();
    var C1X = this._Anchors[startIndex].getNextX();
    var C1Y = this._Anchors[startIndex].getNextY();
    var C1Z = this._Anchors[startIndex].getNextZ();
    var nextIndex = (startIndex +1)% this._Anchors.length;
    var C2X = this._Anchors[nextIndex].getPrevX();
    var C2Y = this._Anchors[nextIndex].getPrevY();
    var C2Z = this._Anchors[nextIndex].getPrevZ();
    var C3X = this._Anchors[nextIndex].getPosX();
    var C3Y = this._Anchors[nextIndex].getPosY();
    var C3Z = this._Anchors[nextIndex].getPosZ();
    return this._getCubicBezierPoint(C0X, C0Y, C0Z, C1X, C1Y, C1Z, C2X, C2Y, C2Z, C3X, C3Y, C3Z, param);
};

GLSubpath.prototype._sampleCubicBezierUniform = function (C0X, C0Y, C0Z, C1X, C1Y, C1Z, C2X, C2Y, C2Z, C3X, C3Y, C3Z, beginParam, endParam) {
    //for now, sample using regularly spaced parameter values
    var numSteps = 11; //hard-coded for now
    var stepSize = 0.1; // = 1/(numSteps-1)
    for (var i = 0; i < numSteps; i++) {
        var t = i * stepSize;
        var t2 = t * t;
        var t3 = t * t2;
        var s = 1 - t;
        var s2 = s * s;
        var s3 = s * s2;
        var Px = s3 * C0X + 3 * s2 * t * C1X + 3 * s * t2 * C2X + t3 * C3X;
        var Py = s3 * C0Y + 3 * s2 * t * C1Y + 3 * s * t2 * C2Y + t3 * C3Y;
        var Pz = s3 * C0Z + 3 * s2 * t * C1Z + 3 * s * t2 * C2Z + t3 * C3Z;
        this._Samples.push([Px, Py, Pz]);

        if (beginParam && endParam) {
            this._sampleParam.push(beginParam + (endParam-beginParam)*t);
        }
    }
};

// _sampleCubicBezier
//  queries the Bezier curve and adaptively samples it, adds samples in this._samples
GLSubpath.prototype._sampleCubicBezier = function (C0X, C0Y, C0Z, C1X, C1Y, C1Z, C2X, C2Y, C2Z, C3X, C3Y, C3Z, beginParam, endParam) {
    var C0 = [C0X, C0Y, C0Z];
    var C1 = [C1X, C1Y, C1Z];
    var C2 = [C2X, C2Y, C2Z];
    var C3 = [C3X, C3Y, C3Z];

    //measure distance of C1 and C2 to segment C0-C3
    var distC1 = MathUtils.distPointToSegment(C1, C0, C3);
    var distC2 = MathUtils.distPointToSegment(C2, C0, C3);
    var maxDist = Math.max(distC1, distC2);

    //if max. distance is smaller than threshold, early exit
    var threshold = this._SAMPLING_EPSILON; //this should be set outside this function
    if (maxDist < threshold) {
        //push the endpoints and return
        this._Samples.push([C0X, C0Y, C0Z]);
        this._Samples.push([C3X, C3Y, C3Z]);
        this._sampleParam.push(beginParam);
        this._sampleParam.push(endParam);
        return;
    }

    //subdivide this curve
    var C0_ = VecUtils.vecAdd(3, C0, C1); C0_ = VecUtils.vecScale(3, C0_, 0.5);
    var C1_ = VecUtils.vecAdd(3, C1, C2); C1_ = VecUtils.vecScale(3, C1_, 0.5);
    var C2_ = VecUtils.vecAdd(3, C2, C3); C2_ = VecUtils.vecScale(3, C2_, 0.5);

    var C0__ = VecUtils.vecAdd(3, C0_, C1_); C0__ = VecUtils.vecScale(3, C0__, 0.5);
    var C1__ = VecUtils.vecAdd(3, C1_, C2_); C1__ = VecUtils.vecScale(3, C1__, 0.5);

    var C0___ = VecUtils.vecAdd(3, C0__, C1__); C0___ = VecUtils.vecScale(3, C0___, 0.5);

    var midParam = beginParam + (endParam-beginParam)*0.5;
    //recursively sample the first half of the curve
    this._sampleCubicBezier(C0X, C0Y, C0Z,
                    C0_[0], C0_[1], C0_[2],
                    C0__[0], C0__[1], C0__[2],
                    C0___[0], C0___[1], C0___[2], beginParam, midParam);

    //recursively sample the second half of the curve
    this._sampleCubicBezier(C0___[0], C0___[1], C0___[2],
                    C1__[0], C1__[1], C1__[2],
                    C2_[0], C2_[1], C2_[2],
                    C3X, C3Y, C3Z, midParam, endParam);
};

///////////////////////////////////////////////////////////
// Methods
///////////////////////////////////////////////////////////

GLSubpath.prototype._unprojectPt = function(pt, pespectiveDist) {
    var retPt = pt.slice(0);
    if (MathUtils.fpCmp(pespectiveDist,-pt[2]) !== 0){
        z = pt[2]*pespectiveDist/(pespectiveDist + pt[2]);
        var x = pt[0]*(pespectiveDist - z)/pespectiveDist,
            y = pt[1]*(pespectiveDist - z)/pespectiveDist;
        retPt[0] = x;  retPt[1] = y;  retPt[2] = z;
    }
    return retPt;
};

//  createSamples
//  stores samples of the subpath in _samples
GLSubpath.prototype.createSamples = function () {
    if (this._dirty) {
        //clear any previously computed samples
        this._Samples = [];
        this._sampleParam = [];
        this._anchorSampleIndex = [];

        var numAnchors = this._Anchors.length;
        if (numAnchors > 1) {
            for (var i = 0; i < numAnchors - 1; i++) {
                //get the control points
                var C0X = this._Anchors[i].getPosX();
                var C0Y = this._Anchors[i].getPosY();
                var C0Z = this._Anchors[i].getPosZ();

                var C1X = this._Anchors[i].getNextX();
                var C1Y = this._Anchors[i].getNextY();
                var C1Z = this._Anchors[i].getNextZ();

                var C2X = this._Anchors[i + 1].getPrevX();
                var C2Y = this._Anchors[i + 1].getPrevY();
                var C2Z = this._Anchors[i + 1].getPrevZ();

                var C3X = this._Anchors[i + 1].getPosX();
                var C3Y = this._Anchors[i + 1].getPosY();
                var C3Z = this._Anchors[i + 1].getPosZ();

                var beginParam = i;
                var endParam = i+1;
                this._anchorSampleIndex.push(this._Samples.length); //index of sample corresponding to anchor i
                this._sampleCubicBezier(C0X, C0Y, C0Z, C1X, C1Y, C1Z, C2X, C2Y, C2Z, C3X, C3Y, C3Z, beginParam, endParam);
            } //for every anchor point i, except last

            if (this._isClosed) {
                var i = numAnchors - 1;
                //get the control points
                var C0X = this._Anchors[i].getPosX();
                var C0Y = this._Anchors[i].getPosY();
                var C0Z = this._Anchors[i].getPosZ();

                var C1X = this._Anchors[i].getNextX();
                var C1Y = this._Anchors[i].getNextY();
                var C1Z = this._Anchors[i].getNextZ();

                var C2X = this._Anchors[0].getPrevX();
                var C2Y = this._Anchors[0].getPrevY();
                var C2Z = this._Anchors[0].getPrevZ();

                var C3X = this._Anchors[0].getPosX();
                var C3Y = this._Anchors[0].getPosY();
                var C3Z = this._Anchors[0].getPosZ();

                var beginParam = i;
                var endParam = i+1;
                this._anchorSampleIndex.push(this._Samples.length); //index of sample corresponding to anchor i
                this._sampleCubicBezier(C0X, C0Y, C0Z, C1X, C1Y, C1Z, C2X, C2Y, C2Z, C3X, C3Y, C3Z, beginParam, endParam);
            } else {
                this._anchorSampleIndex.push((this._Samples.length) - 1); //index of sample corresponding to last anchor
            }
        } //if (numAnchors >== 2) {

        //re-compute the bounding box (this also accounts for stroke width, so assume the stroke width is set)
        this.computeBoundingBox(true);
    } //if (this._dirty)
    this._dirty = false;
};

GLSubpath.prototype.offsetPerBBoxMin = function()
{
    //offset the anchor and sample coordinates such that the min point of the bbox is at [0,0,0]
    this.translateAnchors(-this._BBoxMin[0], -this._BBoxMin[1], -this._BBoxMin[2]);
    this.translateSamples(-this._BBoxMin[0], -this._BBoxMin[1], -this._BBoxMin[2]);
    this._BBoxMax[0]-= this._BBoxMin[0];
    this._BBoxMax[1]-= this._BBoxMin[1];
    this._BBoxMax[2]-= this._BBoxMin[2];
    this._BBoxMin[0] = this._BBoxMin[1] = this._BBoxMin[2] = 0;
};

GLSubpath.prototype.computeBoundingBox = function(useSamples){
    this._BBoxMin = [Infinity, Infinity, Infinity];
    this._BBoxMax = [-Infinity, -Infinity, -Infinity];
    if (useSamples) {
        var numPoints = this._Samples.length;
        if (numPoints === 0) {
            this._BBoxMin = [0, 0, 0];
            this._BBoxMax = [0, 0, 0];
        } else {
            for (var i=0;i<numPoints;i++){
                var pt = this._Samples[i];
                for (var d = 0; d < 3; d++) {
                    if (this._BBoxMin[d] > pt[d]) {
                        this._BBoxMin[d] = pt[d];
                    }
                    if (this._BBoxMax[d] < pt[d]) {
                        this._BBoxMax[d] = pt[d];
                    }
                }//for every dimension d from 0 to 2
            }
        }
    }
    else{
        //build a bbox of the anchor points, not the path itself
        var numAnchors = this._Anchors.length;
        var anchorPts = [[0,0,0], [0,0,0], [0,0,0]];
        if (numAnchors === 0) {
            this._BBoxMin = [0, 0, 0];
            this._BBoxMax = [0, 0, 0];
        } else {
            for (var i = 0; i < numAnchors; i++) {
                anchorPts[0] = ([this._Anchors[i].getPosX(),this._Anchors[i].getPosY(),this._Anchors[i].getPosZ()]);
                anchorPts[1] = ([this._Anchors[i].getPrevX(),this._Anchors[i].getPrevY(),this._Anchors[i].getPrevZ()]);
                anchorPts[2] = ([this._Anchors[i].getNextX(),this._Anchors[i].getNextY(),this._Anchors[i].getNextZ()]);

                for (var p=0;p<3;p++){
                    for (var d = 0; d < 3; d++) {
                        if (this._BBoxMin[d] > anchorPts[p][d]) {
                            this._BBoxMin[d] = anchorPts[p][d];
                        }
                        if (this._BBoxMax[d] < anchorPts[p][d]) {
                            this._BBoxMax[d] = anchorPts[p][d];
                        }
                    }//for every dimension d from 0 to 2
                } //for every anchorPts p from 0 to 2
            } //for every anchor point i
        } //else of if (numSamples === 0) {
    }//else of if useSamples

    //increase the bbox given the stroke width
    for (var d = 0; d < 3; d++) {
        this._BBoxMin[d]-= this._strokeWidth/2;
        this._BBoxMax[d]+= this._strokeWidth/2;
    }//for every dimension d from 0 to 3
};

//returns v such that it is in [min,max]
GLSubpath.prototype._clamp = function (v, min, max) {
    if (v < min) {
        return min;
    }

    if (v > max) {
        return max;
    }

    return v;
};


GLSubpath.prototype.getNearVertex = function( eyePt, dir ){
    //todo fill in this function
    return null;
};

GLSubpath.prototype.getNearPoint = function( eyePt, dir ){
    return null;
};

//returns true if P is left of line through l0 and l1 or on it
GLSubpath.prototype.isLeft = function(l0, l1, P){
    var signedArea = (l1[0]-l0[0])*(P[1] - l0[1]) - (P[0]-l0[0])*(l1[1]-l0[1]);

    if (signedArea>=0) {
        return true;
    } else {
        return false;
    }
};

//returns true if 2D point p is contained within 2D quad given by r0,r1,r2,r3 (need not be axis-aligned)
GLSubpath.prototype.isPointInQuad2D = function(r0,r1,r2,r3,p){
    //returns true if the point is on the same side of the segments r0r1, r1r2, r2r3, r3r0
    var isLeft0 = this.isLeft(r0,r1,p);
    var isLeft1 = this.isLeft(r1,r2,p);
    var isLeft2 = this.isLeft(r2,r3,p);
    var isLeft3 = this.isLeft(r3,r0,p);
    var andAll = isLeft0 & isLeft1 & isLeft2 & isLeft3;
    if (andAll)
        return true;
    var orAll = isLeft0 | isLeft1 | isLeft2 | isLeft3;
    if (!orAll) {
        return true;
    }

    return false;
};

GLSubpath.prototype.exportJSON = function() {
    var retObject= new Object();
    //the type of this object
    retObject.type = this.geomType();
    retObject.geomType = retObject.type;

    //the geometry for this object (anchor points in stage world space)
    retObject.anchors = this._Anchors.slice(0);
    retObject.isClosed = this._isClosed;

    //location of the canvas of this object
    retObject.canvasLeft = this._canvasLeft;
    retObject.canvasTop = this._canvasTop;

    //stroke appearance properties
    retObject.strokeWidth = this._strokeWidth;
    retObject.strokeColor = this._strokeColor;
    retObject.fillColor = this._fillColor;
    return retObject;
};

GLSubpath.prototype.export = function() {
    var jsonObject = this.exportJSON();
    var stringified = JSON.stringify(jsonObject);
    return "type: " + this.geomType() + "\n" + stringified;
};

GLSubpath.prototype.importJSON = function(jo) {
    if (this.geomType()!== jo.geomType){
        return;
    }
    //the geometry for this object
    this._Anchors = [];
    var i=0;
    for (i=0;i<jo.anchors.length;i++){
        this.addAnchor(new AnchorPoint());
        var newAnchor = this.getAnchor(this.getSelectedAnchorIndex());
        var ipAnchor = jo.anchors[i];
        newAnchor.setPos(ipAnchor._x, ipAnchor._y, ipAnchor._z);
        newAnchor.setPrevPos(ipAnchor._prevX, ipAnchor._prevY, ipAnchor._prevZ);
        newAnchor.setNextPos(ipAnchor._nextX, ipAnchor._nextY, ipAnchor._nextZ);
    }
    this._isClosed = jo.isClosed;

    //location of the canvas for this object
    this._canvasLeft = jo.canvasLeft;
    this._canvasTop = jo.canvasTop;

    //stroke appearance properties
    this._strokeWidth = jo.strokeWidth;
    this._strokeColor = jo.strokeColor;
    this._fillColor = jo.fillColor;

    this._dirty = true;
};

GLSubpath.prototype.import = function( importStr ) {
    var jsonObject = JSON.parse(importStr);
    this.importJSON(jsonObject);
};

GLSubpath.prototype.collidesWithPoint = function (x, y, z) {
    if (x < this._BBoxMin[0]) return false;
    if (x > this._BBoxMax[0]) return false;
    if (y < this._BBoxMin[1]) return false;
    if (y > this._BBoxMax[1]) return false;
    if (z < this._BBoxMin[2]) return false;
    if (z > this._BBoxMax[2]) return false;

    return true;
};

GLSubpath.prototype.collidesWithPoint = function (x, y) {
    if (x < this._BBoxMin[0]) return false;
    if (x > this._BBoxMax[0]) return false;
    if (y < this._BBoxMin[1]) return false;
    if (y > this._BBoxMax[1]) return false;

    return true;
};

//GLSubpath.prototype = new GeomObj();

if (typeof exports === "object") {
    exports.SubPath = GLSubpath;
}

