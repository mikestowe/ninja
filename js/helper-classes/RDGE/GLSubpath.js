/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var VecUtils = require("js/helper-classes/3D/vec-utils").VecUtils;


function SubpathOffsetPoint(pos, mapPos) {
    this.Pos = Vector.create([pos[0],pos[1],pos[2]]);
    this.CurveMapPos = Vector.create([mapPos[0], mapPos[1], mapPos[2]]);
}

function SubpathOffsetTriangle(v0, v1, v2) {
    this.v0 = v0;
    this.v1 = v1;
    this.v2 = v2;
    this.n = Vector.create([0,0,1]); //replace with the actual cross product later
}

function sortNumberAscending(a,b){
    return a-b;
}
function sortNumberDescending(a,b){
    return b-a;
}
function SegmentIntersections(){
    this.paramArray = [];
}

///////////////////////////////////////////////////////////////////////
// Class GLSubpath
//      representation a sequence of cubic bezier curves.
//      Derived from class GLGeomObj
///////////////////////////////////////////////////////////////////////
function GLSubpath() {
    ///////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////
    this._Anchors = [];
    this._BBoxMin = [0, 0, 0];
    this._BBoxMax = [0, 0, 0];
    this._isClosed = false;

    this._samples = [];                 //polyline representation of this curve
    this._sampleParam = [];            //parametric distance of samples, within [0, N], where N is # of Bezier curves (=# of anchor points if closed, =#anchor pts -1 if open)
    this._anchorSampleIndex = [];       //index within _samples corresponding to anchor points
    
    this._UnprojectedAnchors = [];

    //offset path samples and the points on the input path they map to
    this._offsetPointsLeft = [];
    this._offsetPointsRight = [];

    //triangles determined by the offset points
    this._offsetTrianglesLeft = [];
    this._offsetTrianglesRight = [];

    //initially set the _dirty bit so we will construct samples
    this._dirty = true;

    //whether or not to use the canvas drawing to stroke/fill
    this._useCanvasDrawing = true;

    //the X and Y location of this subpath's canvas in stage world space of Ninja
    this._canvasX = 0;
    this._canvasY = 0;

    //stroke information
    this._strokeWidth = 0.0;
    this._strokeColor = [0.4, 0.4, 0.4, 1.0];
    this._strokeMaterial;
    this._strokeStyle = "Solid";
    this._materialAmbient = [0.2, 0.2, 0.2, 1.0];
    this._materialDiffuse = [0.4, 0.4, 0.4, 1.0];
    this._materialSpecular = [0.4, 0.4, 0.4, 1.0];
    this._fillColor = [0.4, 0.4, 0.4, 1.0];
    this._fillMaterial;
    this._DISPLAY_ANCHOR_RADIUS = 5;
    //drawing context
    this._world = null;

    //tool that owns this subpath
    this._drawingTool = null;
    this._planeMat = null;
    this._planeMatInv = null;
    this._planeCenter = null;

    // initialize the inherited members
    this.inheritedFrom = GLGeomObj;
    this.inheritedFrom();

    //used to query what the user selected, OR-able for future extensions
    this.SEL_NONE = 0;          //nothing was selected
    this.SEL_ANCHOR = 1;        //anchor point was selected
    this.SEL_PREV = 2;          //previous handle of anchor point was selected
    this.SEL_NEXT = 4;          //next handle of anchor point was selected
    this.SEL_PATH = 8;          //the path itself was selected
    this._selectMode = this.SEL_NONE;
    this._selectedAnchorIndex = -1;

    this._SAMPLING_EPSILON = 0.5; //epsilon used for sampling the curve
    this._DEFAULT_STROKE_WIDTH = 20; //use only if stroke width not specified
    this._MAX_OFFSET_ANGLE = 10; //max angle (in degrees) between consecutive vectors from curve to offset path

    /////////////////////////////////////////////////////////
    // Property Accessors/Setters
    /////////////////////////////////////////////////////////
    this.setWorld = function (world) { this._world = world; }
    this.getWorld = function () { return this._world; }
    this.makeDirty = function () {this._dirty = true;}
    this.geomType = function () { return this.GEOM_TYPE_CUBIC_BEZIER; }
    this.setDrawingTool = function (tool) {this._drawingTool = tool;}
    this.getDrawingTool = function () {return this._drawingTool;}
    this.setPlaneMatrix = function(planeMat){this._planeMat = planeMat;}
    this.setPlaneMatrixInverse = function(planeMatInv){this._planeMatInv = planeMatInv;}
    this.setPlaneCenter = function(pc){this._planeCenter = pc;}

    this.getCanvasX = function(){return this._canvasX;}
    this.getCanvasY = function(){return this._canvasY;}
    this.setCanvasX = function(cx){this._canvasX=cx;}
    this.setCanvasY = function(cy){this._canvasY=cy;}
        
    this.getIsClosed = function () {return this._isClosed;}
    this.setIsClosed = function (isClosed) { 
        if (this._isClosed !== isClosed) {
            this._isClosed = isClosed;  
            this._dirty = true;
        }
    }
    this.getNumAnchors = function () { return this._Anchors.length; }
    this.getAnchor = function (index) { return this._Anchors[index]; } 
    this.addAnchor = function (anchorPt) { 
        this._Anchors.push(anchorPt);
        this._selectedAnchorIndex = this._Anchors.length-1;
        this._dirty = true;
    }

    this.insertAnchor = function(anchorPt, index){
        this._Anchors.splice(index, 0, anchorPt);
    }

    //remove and return anchor at specified index, return null on error
    this.removeAnchor = function (index) { 
        var retAnchor = null;
        if (index < this._Anchors.length) {
            retAnchor = this._Anchors.splice(index, 1);
            this._dirty = true;
        }
        //deselect the removed anchor if necessary
        if (this._selectedAnchorIndex === index){
            this._selectedAnchorIndex = -1;
        }
        return retAnchor;
    }

    this.deselectAnchorPoint = function(){
        this._selectedAnchorIndex = -1;
    }
    
    this.reversePath = function() {
        var revAnchors = [];
        var numAnchors = this._Anchors.length;
        var lastIndex = numAnchors-1;
        if (lastIndex<0){
            return; //cannot reverse empty path
        }
        for (var i=lastIndex;i>=0;i--) {
            var newAnchor = new GLAnchorPoint();
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
        this._dirty=true;
    }

    //remove all the anchor points
    this.clearAllAnchors = function () {
        this._Anchors = [];
        this._isClosed = false; 
        this._dirty = true;
    }

    this.insertAnchorAtParameter = function(index, param) {
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
        var newAnchor = new GLAnchorPoint();

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
        this._dirty = true;
    }

    this._checkIntersectionWithSamples = function(startIndex, endIndex, point, radius){
        //check whether the point is within the radius distance from the curve represented as a polyline in _samples
        //return the parametric distance along the curve if there is an intersection, else return null
        //will assume that the BBox test is performed outside this function
        if (endIndex<startIndex){
            //go from startIndex to the end of the samples
            endIndex = this._samples.length/3;
        }
        for (var i=startIndex; i<endIndex; i++){
            var seg0 = Vector.create([this._samples[3*i], this._samples[3*i + 1], this._samples[3*i + 2]]);
            var j=i+1;
            var seg1 = Vector.create([this._samples[3*j], this._samples[3*j + 1], this._samples[3*j + 2]]);
            var distToSegment = MathUtils.distPointToSegment(point, seg0, seg1);
            if (distToSegment<=radius){
                var paramDistance = MathUtils.paramPointProjectionOnSegment(point, seg0, seg1); //TODO Optimize! this function was called in distPointToSegment above
                var retParam = this._sampleParam[i] + (this._sampleParam[j] - this._sampleParam[i])*paramDistance;
                return retParam;
            }
        }
        return null;
    }
    this._checkIntersection = function(controlPts, beginParam, endParam, point, radius) {
        //check whether the point is within radius distance from the curve
        // if there is an intersection, return the parameter value (between beginParam and endParam) of the intersection point, else return null
        var bboxMin = Vector.create([Infinity, Infinity, Infinity]);
        var bboxMax = Vector.create([-Infinity,-Infinity,-Infinity]);
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
            if (distP>radius)
                return null;
            else {
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
        var param1 = this._checkIntersection(Vector.create([controlPts[0],C0_,C0__,C0___]), beginParam, midParam, point, radius);
        if (param1!==null){
            return param1;
        }

        //recursively sample the second half of the curve
        var param2 = this._checkIntersection(Vector.create([C0___,C1__,C2_,controlPts[3]]), midParam, endParam, point, radius);
        if (param2!==null){
            return param2;
        }

        //no intersection, so return null
        return null;
    }

    //whether the point lies within the bbox given by the four control points
    this._isWithinBoundingBox = function(point, ctrlPts, radius) {
        var bboxMin = Vector.create([Infinity, Infinity, Infinity]);
        var bboxMax = Vector.create([-Infinity,-Infinity,-Infinity]);
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
    }

    //pick the path point closest to the specified location, return null if some anchor point (or its handles) is within radius, else return the parameter distance
    this.pickPath = function (pickX, pickY, pickZ, radius) {
        var numAnchors = this._Anchors.length;
        var selAnchorIndex = -1;
        var retCode = this.SEL_NONE;
        var radSq = radius * radius;
        var minDistance = Infinity;
        for (var i = 0; i < numAnchors; i++) {
            var distSq = this._Anchors[i].getDistanceSq(pickX, pickY, pickZ);
            //check the anchor point
            if (distSq < minDistance && distSq < radSq) {
                selAnchorIndex = i;
                minDistance = distSq;
                retCode = retCode | this.SEL_ANCHOR;
            }
        }//for every anchor i

        //check the prev and next of the selected anchor if the above did not register a hit
        if (this._selectedAnchorIndex>=0 && selAnchorIndex === -1) {
            var distSq = this._Anchors[this._selectedAnchorIndex].getPrevDistanceSq(pickX, pickY, pickZ);
            if (distSq < minDistance && distSq < radSq){
                selAnchorIndex = this._selectedAnchorIndex;
                minDistance = distSq;
                retCode = retCode | this.SEL_PREV;
            } else {
                //check the next for this anchor point
                distSq = this._Anchors[this._selectedAnchorIndex].getNextDistanceSq(pickX, pickY, pickZ);
                if (distSq<minDistance && distSq<radSq){
                    selAnchorIndex = this._selectedAnchorIndex;
                    minDistance = distSq;
                    retCode = retCode | this.SEL_NEXT;
                }
            }
        }
        var retParam = null;
        if (retCode !== this.SEL_NONE) {
            retCode = retCode | this.SEL_PATH; //ensure that path is also selected if anything else is selected
            this._selectedAnchorIndex = selAnchorIndex;
        } else {
            this._selectedAnchorIndex = -1;
            var numSegments = this._isClosed ? numAnchors : numAnchors-1;
            for (var i = 0; i < numSegments; i++) {
                var nextIndex = (i+1)%numAnchors;
                //check if the point is close to the bezier segment between anchor i and anchor nextIndex
                var controlPoints = Vector.create([Vector.create([this._Anchors[i].getPosX(),this._Anchors[i].getPosY(),this._Anchors[i].getPosZ()]),
                    Vector.create([this._Anchors[i].getNextX(),this._Anchors[i].getNextY(),this._Anchors[i].getNextZ()]),
                    Vector.create([this._Anchors[nextIndex].getPrevX(),this._Anchors[nextIndex].getPrevY(),this._Anchors[nextIndex].getPrevZ()]),
                    Vector.create([this._Anchors[nextIndex].getPosX(),this._Anchors[nextIndex].getPosY(),this._Anchors[nextIndex].getPosZ()])]);
                var point = Vector.create([pickX, pickY, pickZ]);
                if (this._isWithinBoundingBox(point, controlPoints, radius)) {
                    //var intersectParam = this._checkIntersection(controlPoints, 0.0, 1.0, point, radius);
                    var intersectParam = this._checkIntersectionWithSamples(this._anchorSampleIndex[i], this._anchorSampleIndex[nextIndex], point, radius);
                    console.log("intersectParam:"+intersectParam);
                    if (intersectParam){
                        retCode = retCode | this.SEL_PATH;
                        retParam = intersectParam-i; //make the retParam go from 0 to 1
                        this._selectedAnchorIndex = i;
                        break;
                    }
                }
            }//for every anchor i
        }
        this._selectMode = retCode;
        return retParam;
    }     //this.pickPath function

    this.getSelectedAnchorIndex = function () { return this._selectedAnchorIndex; }
    this.getSelectedMode = function () { return this._selectMode; }

    this.getNumPoints = function () { return this._samples.length; }
    this.getPoints = function () { this.createSamples(); return this._samples; }

    this.getLeftOffsetPoints = function () { this.createSamples(); return this._offsetPointsLeft; }
    this.getRightOffsetPoints = function () { this.createSamples(); return this._offsetPointsRight; }

    this.getLeftOffsetTriangles = function () { return this._offsetTrianglesLeft; }
    this.getRightOffsetTriangles = function () { return this._offsetTrianglesRight; }

    this.getBBoxMin = function () { return this._BBoxMin; }
    this.getBBoxMax = function () { return this._BBoxMax; }

    this.getStrokeWidth = function () { return this._strokeWidth; }
    this.setStrokeWidth = function (w) { this._strokeWidth = w; }
    this.getStrokeMaterial = function () { return this._strokeMaterial; }
    this.setStrokeMaterial = function (m) { this._strokeMaterial = m; }
    this.getStrokeColor = function () { return this._strokeColor; }
    this.setStrokeColor = function (c) { this._strokeColor = c; }
    this.getStrokeStyle = function () { return this._strokeStyle; }
    this.setStrokeStyle = function (s) { this._strokeStyle = s; }
    this.getFillMaterial = function() {return this._fillMaterial;}
    this.setFillMaterial = function(m){ this._fillMaterial = m;}
    this.getFillColor = function() {return this._fillColor;}
    this.setFillColor = function(c){this._fillColor = c;}

    this.setWidth = function () {//NO-OP for now
    }
    this.setHeight = function () {//NO-OP for now
    }

    this.copyFromSubpath = function (subpath) {
        this.clearAllAnchors();
        for (var i = 0; i < subpath.getNumAnchors(); i++) {
            var oldAnchor = subpath.getAnchor(i);
            var newAnchor = new GLAnchorPoint();
            newAnchor.setPos(oldAnchor.getPosX(), oldAnchor.getPosY(), oldAnchor.getPosZ());
            newAnchor.setPrevPos(oldAnchor.getPrevX(), oldAnchor.getPrevY(), oldAnchor.getPrevZ());
            newAnchor.setNextPos(oldAnchor.getNextX(), oldAnchor.getNextY(), oldAnchor.getNextZ());
            this.addAnchor(newAnchor);
        }
        this.setIsClosed(subpath.getIsClosed());
        this.setStrokeWidth(subpath.getStrokeWidth());
    }

    this.translate = function (tx, ty, tz) {
        for (var i=0;i<this._Anchors.length;i++){
            this._Anchors[i].translateAll(tx,ty,tz);
        }
        this._dirty = true;
    }

    //  _cleanupOffsetSamples (offSamples)
    //  removes retrograde segments of the offset path samples
    //  returns the cleaned up offset samples
    this._cleanupOffsetSamples = function (offSamples, width) {
        var retOffSamples = [];
        var numSamples = offSamples.length;
        var keepOffSample = [];
        for (var i = 0; i < numSamples; i++) {
            keepOffSample.push(true);
        }


        //NOTE: this is very slow O(n^2) for now...testing only
        //remove any sample that's less than 'width' far from any other boundary segment
        for (var i = 0; i < numSamples; i++) {
            //build the current offset point
            var O = Vector.create([offSamples[i].Pos[0], offSamples[i].Pos[1], offSamples[i].Pos[2]]);

            //iterate over all the path segments
            var numPoints = this._samples.length / 3;
            for (var j = 0; j < numPoints - 1; j++) {
                var C0 = Vector.create([this._samples[3 * j], this._samples[3 * j + 1], this._samples[3 * j + 2]]);                 //segment startpoint
                var C1 = Vector.create([this._samples[3 * (j + 1)], this._samples[3 * (j + 1) + 1], this._samples[3 * (j + 1) + 2]]); //segment endpoint
                var distToSeg = MathUtils.distPointToSegment(O, C0, C1);
                if (width - distToSeg > 1) { //if the distance is smaller than the width
                    keepOffSample[i] = false;
                    break;
                } //if (width - distToC > 1 ) { //if the distance is substantially smaller than the width
            } //for (var j=0;j<numPoints;j++) {

        } //for (var i = 0; i < numSamples; i++) {


        for (var i = 0; i < numSamples; i++) {
            if (keepOffSample[i]) {
                retOffSamples.push(offSamples[i]);
                continue;
            }

            //do nothing if we have not yet seen any valid offset samples
            if (retOffSamples.length === 0)
                continue;

            //assume this is the first invalid sample
            var startIndex = i - 1;
            //find the end index of this range of invalid samples
            while (keepOffSample[i] === false && (i < numSamples - 1)) {
                i++;
            }
            var endIndex = i;

            //check whether the segment from startIndex->startIndex+1 intersects the segment from endIndex-1->endIndex
            var seg0Start = Vector.create([offSamples[startIndex].Pos[0],offSamples[startIndex].Pos[1],offSamples[startIndex].Pos[2]]);
            var seg0End = Vector.create([offSamples[startIndex + 1].Pos[0],offSamples[startIndex + 1].Pos[1],offSamples[startIndex + 1].Pos[2]]);
            var seg1Start = Vector.create([offSamples[endIndex - 1].Pos[0],offSamples[endIndex - 1].Pos[1],offSamples[endIndex - 1].Pos[2]]);
            var seg1End = Vector.create([offSamples[endIndex].Pos[0],offSamples[endIndex].Pos[1],offSamples[endIndex].Pos[2]]);


            if (seg0Start.length===0 || seg0End.length ===0 || seg1Start.length===0 ||seg1End.length ===0){
                alert("empty offset point");
            }

            var intersection = MathUtils.segSegIntersection2D(seg0Start, seg0End, seg1Start, seg1End, 0);


            if (intersection) {
                intersection = MathUtils.makeDimension3(intersection);
                //add two points for the intersection (one after to the startIndex, another before the endIndex)
                var newOffsetPoint1 = new SubpathOffsetPoint(intersection, Vector.create([offSamples[startIndex + 1].CurveMapPos[0],offSamples[startIndex + 1].CurveMapPos[1],offSamples[startIndex + 1].CurveMapPos[2]]));
                retOffSamples.push(newOffsetPoint1);
                var newOffsetPoint2 = new SubpathOffsetPoint(intersection, Vector.create([offSamples[endIndex - 1].CurveMapPos[0], offSamples[endIndex - 1].CurveMapPos[1], offSamples[endIndex - 1].CurveMapPos[2]]));
                retOffSamples.push(newOffsetPoint2);
                 //also add the end point
                retOffSamples.push(offSamples[endIndex]);
            }

        } //for (var i = 0; i < numSamples; i++) {



        return retOffSamples;
    }

    // _triangulateOffset
    // generate triangles from offset points and add them to the offsetTriangles array
    this._triangulateOffset = function (offsetPoints, offsetTriangles) {
        if (offsetPoints.length === 0)
            return;

        //  triangulate using the fan method (trivial) for every consecutive pair of offset points
        for (var i = 1; i < offsetPoints.length; i++) {
            var tri1 = new SubpathOffsetTriangle(offsetPoints[i - 1].CurveMapPos, offsetPoints[i - 1].Pos, offsetPoints[i].CurveMapPos);
            var tri2 = new SubpathOffsetTriangle(offsetPoints[i].CurveMapPos, offsetPoints[i - 1].Pos, offsetPoints[i].Pos);
            offsetTriangles.push(tri1);
            offsetTriangles.push(tri2);
        }
    }

    //  _addOffsetSamples
    //  Adds samples to the offset path in places it is not sampled densely enough
    //TODO: as an optimization, don't add any samples at a concave corners, since those extra points will be removed anyway
    this._addOffsetSamples = function (offsetPoints) {
        if (offsetPoints.length === 0)
            return;

        var retOffsetPoints = [];
        retOffsetPoints.push(offsetPoints[0]);
        //compute angle between consecutive vectors from curve to offset
        for (var i = 1; i < offsetPoints.length; i++) {
            var prev = offsetPoints[i - 1];
            var curr = offsetPoints[i];
            var vec1 = VecUtils.vecSubtract(3, prev.Pos, prev.CurveMapPos);
            var vec2 = VecUtils.vecSubtract(3, curr.Pos, curr.CurveMapPos);
            var width = VecUtils.vecMag(3, vec1);
            //NOTE: the following angle computation works only in 2D
            var angle = Math.atan2(vec2[1], vec2[0]) - Math.atan2(vec1[1], vec1[0]);
            //if (angle < 0) angle = angle + Math.PI + Math.PI;
            angle = angle * 180 / Math.PI;
            if (angle > 180) {
                angle = angle - 360;
            }
            if (angle < -180) {
                angle = 360 + angle;
            }
            var numNewSamples = Math.floor(Math.abs(angle) / this._MAX_OFFSET_ANGLE);
            if (numNewSamples > 0) {
                numNewSamples -= 1; //decrementing gives the correct number of new samples
            }
            if (numNewSamples > 10) {
                numNewSamples = 10; //limit the number of inserted offset samples to 10
            }

            //build the rotation matrix 
            var rotAngle = angle / (numNewSamples + 1) * Math.PI / 180; //angle to rotate (in radians)
            var rotMat = Matrix.RotationZ(rotAngle);

            //build the vector to be transformed
            var rotVec = VecUtils.vecNormalize(3, vec1, 1);

            for (var s = 0; s < numNewSamples; s++) {
                //build curve position as a linear combination of prev. and curr
                var weight = (s + 1) / (numNewSamples + 1);
                var scaledPos1 = Vector.create([prev.CurveMapPos[0], prev.CurveMapPos[1], prev.CurveMapPos[2]]);
                VecUtils.vecScale(3, scaledPos1, 1 - weight);
                var scaledPos2 = Vector.create([curr.CurveMapPos[0], curr.CurveMapPos[1], curr.CurveMapPos[2]]);
                VecUtils.vecScale(3, scaledPos2, weight);
                var curvePos = VecUtils.vecAdd(3, scaledPos1, scaledPos2);

                rotVec = MathUtils.transformVector(rotVec, rotMat);
                var offsetPos = VecUtils.vecAdd(3, curvePos, VecUtils.vecNormalize(3, rotVec, width));
                var newOffsetPoint = new SubpathOffsetPoint(offsetPos, curvePos);
                retOffsetPoints.push(newOffsetPoint);
            }
            retOffsetPoints.push(offsetPoints[i]);
        } //for (var i = 1; i < offsetPoints.length; i++) {

        return retOffsetPoints;
    }


    this._addOffsetIntersectionPoints = function (offSamples, isClosed)
    {
        if (offSamples.length === 0)
            return;

        //TODO: implement the O(nlogn) algorithm from the Dutch book instead of the O(n^2) algorithm below
        var numOrigPoints = offSamples.length;
        var numOrigSegments = numOrigPoints;
        if (!isClosed)
            numOrigSegments--;

         //make an empty list of intersection points for every segment (assuming the segment id is the index of its start point)
        var segmentIntersectionArray = [];
        for (var i=0;i<numOrigSegments;i++){
            var si = new SegmentIntersections();
            segmentIntersectionArray.push(si);
        }

        for (var i=0;i<numOrigSegments;i++) {
            //check whether the segment from startIndex->startIndex+1 intersects the segment from endIndex-1->endIndex
            var seg0Start = Vector.create([offSamples[i].Pos[0],offSamples[i].Pos[1],offSamples[i].Pos[2]]);
            var nextI = (i+1)%numOrigPoints;
            var seg0End = Vector.create([offSamples[nextI].Pos[0],offSamples[nextI].Pos[1],offSamples[nextI].Pos[2]]);

            for (var j=0;j<numOrigSegments;j++) {
                if (i===j)
                    continue;
                var seg1Start = Vector.create([offSamples[j].Pos[0],offSamples[j].Pos[1],offSamples[j].Pos[2]]);
                var nextJ = (j+1)%numOrigPoints;
                var seg1End = Vector.create([offSamples[nextJ].Pos[0],offSamples[nextJ].Pos[1],offSamples[nextJ].Pos[2]]);

                var intersection = MathUtils.segSegIntersection2D(seg0Start, seg0End, seg1Start, seg1End, 0);

                if (intersection) {
                    //insert a point between i and i+1, mapped to the curve point in between the curve points
                    var param = 0;
                    var delta = seg0End[0]-seg0Start[0];
                    if (delta===0) {
                        delta = seg0End[1]-seg0Start[1];
                        if (delta===0){
                            param=0; //cannot say anything about parameter...should not happen!
                        } else {
                            param = (intersection[1]-seg0Start[1])/delta;
                        }
                    } else {
                        param = (intersection[0]-seg0Start[0])/delta;
                    }
                    if (Math.abs(param-1) > 0.01 && Math.abs(param) > 0.01) //if the intersection is not at the endpoint
                        segmentIntersectionArray[i].paramArray.push(param);
                }
            }//for every point j
        }//for every point i

        var retOffSamples = [] ;//what is built and returned
        //sort all the intersection points based on the parameter value
        //AND add the intersection points to the new offset samples

        for (var i=0;i<numOrigSegments;i++){
            //two existing points 
            var cmp0 = offSamples[i].CurveMapPos;
            var cmp1 = offSamples[(i+1)%numOrigPoints].CurveMapPos;
            var pos0 = offSamples[i].Pos;
            var pos1 = offSamples[(i+1)%numOrigPoints].Pos;
            retOffSamples.push(offSamples[i]);
            segmentIntersectionArray[i].paramArray.sort(sortNumberAscending);
            for (var j=0;j<segmentIntersectionArray[i].paramArray.length;j++){
                var param = segmentIntersectionArray[i].paramArray[j];
                var newIntersection = Vector.create([pos0[0] + param*(pos1[0]-pos0[0]), pos0[1] + param*(pos1[1]-pos0[1]), 0]);
                var newOffsetPointCurveMapPos = Vector.create([cmp0[0] + param*(cmp1[0]-cmp0[0]), cmp0[1] + param*(cmp1[1]-cmp0[1]), 0]);
                var newOffsetPoint = new SubpathOffsetPoint(newIntersection, newOffsetPointCurveMapPos);
                retOffSamples.push(newOffsetPoint);
            }
            retOffSamples.push(offSamples[(i+1)%numOrigPoints]);
        }
        return retOffSamples;
    }


    //  _offsetFromSamples
    //  generates the offset curves (left and right) of width w from the samples (polyline) currently in this._samples
    this._offsetFromSamples = function (width) {
        this._offsetPointsLeft = [];
        this._offsetPointsRight = [];
        this._offsetTrianglesLeft = [];
        this._offsetTrianglesRight = [];

        var numPoints = this._samples.length / 3;
        if (numPoints < 2) {
            return; //do nothing for 
        }

        for (var i = 0; i < numPoints; i++) {
            var C = Vector.create([this._samples[3 * i], this._samples[3 * i + 1], this._samples[3 * i + 2]]); //current point
            var N = null; //next point
            if (i < (numPoints - 1)) {
                N = Vector.create([this._samples[3 * (i + 1)], this._samples[3 * (i + 1) + 1], this._samples[3 * (i + 1) + 2]]);
            }
            var P = null; //previous point
            if (i > 0) {
                P = Vector.create([this._samples[3 * (i - 1)], this._samples[3 * (i - 1) + 1], this._samples[3 * (i - 1) + 2]]);
            }

            //compute the direction at C (based on averaging across prev. and next if available)
            var D = null;
            if (N) {
                D = VecUtils.vecSubtract(3, N, C);
                if (P) {
                    var Dprev = VecUtils.vecSubtract(3, C, P);
                    D = VecUtils.vecAdd(3, D, Dprev);
                    D = VecUtils.vecScale(3, D, 0.5);
                }
            }
            else {
                D = VecUtils.vecSubtract(3, C, P);
            }

            if (!D) {
                throw ("null direction in _offsetFromSamples");
                return;
            }
            //ignore this point if the D is not significant 
            var dirLen = VecUtils.vecMag(3, D);
            if (dirLen < this._SAMPLING_EPSILON) {
                continue;
            }

            D = VecUtils.vecNormalize(3, D, 1.0);

            //compute the perpendicular to D to the left
            //TODO: for now assume we're only considering D in XY plane
            var OL = Vector.create([D[1], -1*D[0], D[2]]);
            OL = VecUtils.vecNormalize(3, OL, width);
            var OR = Vector.create([-1 * OL[0], -1 * OL[1], -1 * OL[2]]);
            OR = VecUtils.vecNormalize(3, OR, width);
            var leftC = VecUtils.vecAdd(3, C, OL);
            var rightC = VecUtils.vecAdd(3, C, OR);

            var sopl = new SubpathOffsetPoint(leftC, C);
            this._offsetPointsLeft.push(sopl);
            if (sopl.Pos.length===0 || sopl.CurveMapPos.length ===0){
                alert("empty offset point");
            }
            var sopr = new SubpathOffsetPoint(rightC, C);
            this._offsetPointsRight.push(sopr);
        } //for (var i = 0; i < numPoints; i++) {


        //add offset samples near cusps or corners
        this._offsetPointsLeft = this._addOffsetSamples(this._offsetPointsLeft);
        this._offsetPointsRight = this._addOffsetSamples(this._offsetPointsRight);

        //break up the offset samples at intersections
        //this._offsetPointsLeft = this._addOffsetIntersectionPoints(this._offsetPointsLeft, this._isClosed);
        //this._offsetPointsRight = this._addOffsetIntersectionPoints(this._offsetPointsRight , this._isClosed);

        //cleanup of the offset path
        //this._offsetPointsLeft = this._cleanupOffsetSamples(this._offsetPointsLeft, width);
        //this._offsetPointsRight = this._cleanupOffsetSamples(this._offsetPointsRight, width);

        //triangulate the offset path
        //this._triangulateOffset(this._offsetPointsLeft, this._offsetTrianglesLeft);
        //this._triangulateOffset(this._offsetPointsRight, this._offsetTrianglesRight);
    }

    this._getCubicBezierPoint = function(C0X, C0Y, C0Z, C1X, C1Y, C1Z, C2X, C2Y, C2Z, C3X, C3Y, C3Z, param) {
        var t = param;
        var t2 = t * t;
        var t3 = t * t2;
        var s = 1 - t;
        var s2 = s * s;
        var s3 = s * s2;
        var Px = s3 * C0X + 3 * s2 * t * C1X + 3 * s * t2 * C2X + t3 * C3X;
        var Py = s3 * C0Y + 3 * s2 * t * C1Y + 3 * s * t2 * C2Y + t3 * C3Y;
        var Pz = s3 * C0Z + 3 * s2 * t * C1Z + 3 * s * t2 * C2Z + t3 * C3Z;
        return Vector.create([Px,Py, Pz]);
    }

    this.getCubicBezierPoint = function(startIndex, param){
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
    }

    this._sampleCubicBezierUniform = function (C0X, C0Y, C0Z, C1X, C1Y, C1Z, C2X, C2Y, C2Z, C3X, C3Y, C3Z, beginParam, endParam) {
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
            this._samples.push(Px);
            this._samples.push(Py);
            this._samples.push(Pz);

            if (beginParam && endParam) {
                this._sampleParam.push(beginParam + (endParam-beginParam)*t);
            }
        }
    }

    // _sampleCubicBezier 
    //  queries the Bezier curve and adaptively samples it, adds samples in this._samples
    this._sampleCubicBezier = function (C0X, C0Y, C0Z, C1X, C1Y, C1Z, C2X, C2Y, C2Z, C3X, C3Y, C3Z, beginParam, endParam) {
        var C0 = Vector.create([C0X, C0Y, C0Z]);
        var C1 = Vector.create([C1X, C1Y, C1Z]);
        var C2 = Vector.create([C2X, C2Y, C2Z]);
        var C3 = Vector.create([C3X, C3Y, C3Z]);

        //measure distance of C1 and C2 to segment C0-C3  
        var distC1 = MathUtils.distPointToSegment(C1, C0, C3);
        var distC2 = MathUtils.distPointToSegment(C2, C0, C3);
        var maxDist = Math.max(distC1, distC2);

        //if max. distance is smaller than threshold, early exit
        var threshold = this._SAMPLING_EPSILON; //this should be set outside this function
        if (maxDist < threshold) {
            //push the endpoints and return
            this._samples.push(C0X);
            this._samples.push(C0Y);
            this._samples.push(C0Z);

            this._samples.push(C3X);
            this._samples.push(C3Y);
            this._samples.push(C3Z);

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
    }

    ///////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////
    //  createSamples
    //  stores samples of the subpath in _samples
    this.createSamples = function () {
        if (this._dirty) {
            //clear any previously computed samples
            this._samples = [];
            this._sampleParam = [];
            this._anchorSampleIndex = [];

            var numAnchors = this._Anchors.length;
            if (numAnchors > 1) {
                //start with the first anchor position (since the Bezier curve start point is not added in the sample function below)
                //this._samples.push(this._Anchors[0].getPosX());
                //this._samples.push(this._Anchors[0].getPosY());
                //this._samples.push(this._Anchors[0].getPosZ());

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
                    this._anchorSampleIndex.push(this._samples.length/3); //index of sample corresponding to anchor i
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
                    this._anchorSampleIndex.push(this._samples.length/3); //index of sample corresponding to anchor i
                    this._sampleCubicBezier(C0X, C0Y, C0Z, C1X, C1Y, C1Z, C2X, C2Y, C2Z, C3X, C3Y, C3Z, beginParam, endParam);
                } else {
                    this._anchorSampleIndex.push((this._samples.length/3) - 1); //index of sample corresponding to last anchor
                }
            } //if (numAnchors >== 2) {


            //also create the offset path samples
            if (this._strokeWidth === 0) {
                this._strokeWidth = this._DEFAULT_STROKE_WIDTH;
            }
            //generate offset stroke if we're not using canvas drawing
            if (!this._useCanvasDrawing) {
                this._offsetFromSamples(this._strokeWidth/2);
            }

            //re-compute the bounding box (this also accounts for stroke width, so assume the stroke width is set)
            this.computeBoundingBox(true);

        } //if (this._dirty)
        this._dirty = false;
    }

    this.computeBoundingBox = function(useSamples){
        this._BBoxMin = [Infinity, Infinity, Infinity];
        this._BBoxMax = [-Infinity, -Infinity, -Infinity];
        if (useSamples) {
            var numPoints = this._samples.length/3;
            if (numPoints === 0) {
                this._BBoxMin = [0, 0, 0];
                this._BBoxMax = [0, 0, 0];
            } else {
                for (var i=0;i<numPoints;i++){
                    var pt = Vector.create([this._samples[3*i],this._samples[3*i + 1],this._samples[3*i + 2]]);
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
            var numAnchors = this._Anchors.length;
            var anchorPts = [Vector.create([0,0,0]), Vector.create([0,0,0]), Vector.create([0,0,0])];
            if (numAnchors === 0) {
                this._BBoxMin = [0, 0, 0];
                this._BBoxMax = [0, 0, 0];
            } else {
                for (var i = 0; i < numAnchors; i++) {
                    anchorPts[0] = (Vector.create([this._Anchors[i].getPosX(),this._Anchors[i].getPosY(),this._Anchors[i].getPosZ()]));
                    anchorPts[1] = (Vector.create([this._Anchors[i].getPrevX(),this._Anchors[i].getPrevY(),this._Anchors[i].getPrevZ()]));
                    anchorPts[2] = (Vector.create([this._Anchors[i].getNextX(),this._Anchors[i].getNextY(),this._Anchors[i].getNextZ()]));

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
        }//for every dimension d from 0 to 2
    }

    //returns v such that it is in [min,max]
    this._clamp = function (v, min, max) {
        if (v < min)
            return min;
        if (v > max)
            return max;
        return v;
    },

        //input: point sIn in stage-world space, planeMidPt in stage-world space, matrix planeMat that rotates plane into XY (parallel to view plane), inverse of planeMat
    //returns: sIn 'unprojected'
    this.unprojectPoint = function ( sIn, planeMidPt, planeMat, planeMatInv)
    {
        var s = sIn.slice(0);
        s[0] -= planeMidPt[0];  s[1] -= planeMidPt[1]; //bring s to the center of the plane

        // unproject the point s
        var i;
        var viewZ = 1400;
        if (MathUtils.fpCmp(viewZ,-s[2]) !== 0){
            z = s[2]*viewZ/(viewZ + s[2]);
            var x = s[0]*(viewZ - z)/viewZ,
                y = s[1]*(viewZ - z)/viewZ;
            s[0] = x;  s[1] = y;  s[2] = z;
        }

        // add the translation back in
         s[0] += planeMidPt[0];   s[1] += planeMidPt[1];

        return s;
    },

    this.computeUnprojectedNDC = function (pos, bboxMid, bboxDim, r, l, t, b, z, zn) {
        //unproject pos from stageworld to unprojected state
        var ppos = this.unprojectPoint(pos, this._planeCenter, this._planeMat, this._planeMatInv);

        //make the coordinates lie in [-1,1]
        var x = (ppos[0] - bboxMid[0]) / bboxDim[0];
        var y = -(ppos[1] - bboxMid[1]) / bboxDim[1];

        //x and y should never be outside the [-1,1] range
        x = this._clamp(x, -1, 1);
        y = this._clamp(y, -1, 1);

        //apply the perspective transform
        x *= -z * (r - l) / (2.0 * zn);
        y *= -z * (t - b) / (2.0 * zn);

        ppos[0] = x;
        ppos[1] = y;
        ppos[2] = 0; //z;
        return ppos;
    }


    this.makeStrokeMaterial = function()
    {
        var strokeMaterial;
        if (this.getStrokeMaterial())
            strokeMaterial = this.getStrokeMaterial().dup();
        else
            strokeMaterial = new FlatMaterial();

        if (strokeMaterial)
        {
            strokeMaterial.init();
            //if(!this.getStrokeMaterial() && this._strokeColor)
            if(this._strokeColor)
             {
                strokeMaterial.setProperty("color", this._strokeColor);
            }
        }

        this._materialArray.push( strokeMaterial );
        this._materialTypeArray.push( "stroke" );

        return strokeMaterial;
    }

    this.makeFillMaterial = function()
    {
        var fillMaterial;
        if (this.getFillMaterial())
            fillMaterial = this.getFillMaterial().dup();
        else
            fillMaterial = new FlatMaterial();

        if (fillMaterial)
        {
            fillMaterial.init();
            //if(!this.getFillMaterial() && this._fillColor)
            if (this._fillColor)
            {
                fillMaterial.setProperty("color", this._fillColor);
            }
        }

        this._materialArray.push( fillMaterial );
        this._materialTypeArray.push( "fill" );

        return fillMaterial;
    }

    //buildBuffers
    //  Build the stroke vertices, normals, textures and colors
    //  Add that array data to the GPU using OpenGL data binding
    this.buildBuffers = function () {
        if (this._useCanvasDrawing)
            return;

        // get the world
        var world = this.getWorld();
        if (!world) throw ("null world in GLSubpath buildBuffers");

        // create the gl buffer
        var gl = world.getGLContext();
        if (!gl) throw ("null GL context in GLSubpath buildBuffers");

        var scaleMat = Matrix.I(3);

        this._primArray = [];
        this._materialNodeArray = [];

        //unproject the anchor points
        // COMMENTED THIS OUT FOR NOW...CURRENTLY UNPROJECTING ALL POINTS OF THE TRIANGLES BELOW
        //for (var a = 0;a<this._Anchors.length;a++) {
        //    var aPos = Vector.create([this._Anchors[a].GetPosX(), this._Anchors[a].GetPosY(), this._Anchors[a].GetPosZ()]);
        //    var pPos = this._drawingTool.unprojectPoint(aPos, this._planeCenter, this._planeMat, this._planeMatInv);
        //}
        //this._dirty = true;

        //sample this curve (if necessary...dirty bit checked in createSamples())
        this.createSamples();

        //these arrays get populated and passed to the GPU as buffers
        var strokeVertices = [];
        var strokeTextures = [];
        var strokeNormals = [];
        var strokeColors = [];

        //TODO: the step of unprojecting points at this stage is unnecessarily inefficient. Instead, we should perform unproject on the anchor points 
        try
        {
            //add the triangles on the left side
            for (var i = 0; i < this._offsetTrianglesLeft.length; i++) {
                // push the 3 vertices for the next triangle
                /*
                strokeVertices.push(this._offsetTrianglesLeft[i].v0[0]); strokeVertices.push(this._offsetTrianglesLeft[i].v0[1]); strokeVertices.push(this._offsetTrianglesLeft[i].v0[2]);
                strokeVertices.push(this._offsetTrianglesLeft[i].v1[0]); strokeVertices.push(this._offsetTrianglesLeft[i].v1[1]); strokeVertices.push(this._offsetTrianglesLeft[i].v1[2]);
                strokeVertices.push(this._offsetTrianglesLeft[i].v2[0]); strokeVertices.push(this._offsetTrianglesLeft[i].v2[1]); strokeVertices.push(this._offsetTrianglesLeft[i].v2[2]);
                 */

                var pPos = this.unprojectPoint(this._offsetTrianglesLeft[i].v0, this._planeCenter, this._planeMat, this._planeMatInv);
                strokeVertices.push(pPos[0]); strokeVertices.push(pPos[1]); strokeVertices.push(pPos[2]);
                pPos = this.unprojectPoint(this._offsetTrianglesLeft[i].v1, this._planeCenter, this._planeMat, this._planeMatInv);
                strokeVertices.push(pPos[0]); strokeVertices.push(pPos[1]); strokeVertices.push(pPos[2]);
                pPos = this.unprojectPoint(this._offsetTrianglesLeft[i].v2, this._planeCenter, this._planeMat, this._planeMatInv);
                strokeVertices.push(pPos[0]); strokeVertices.push(pPos[1]); strokeVertices.push(pPos[2]);
            }

            //add the triangles on the right side
            for (var i = 0; i < this._offsetTrianglesRight.length; i++) {
                // push the 3 vertices for the next triangle
                //strokeVertices.push(this._offsetTrianglesRight[i].v0[0]); strokeVertices.push(this._offsetTrianglesRight[i].v0[1]); strokeVertices.push(this._offsetTrianglesRight[i].v0[2]);
                //strokeVertices.push(this._offsetTrianglesRight[i].v1[0]); strokeVertices.push(this._offsetTrianglesRight[i].v1[1]); strokeVertices.push(this._offsetTrianglesRight[i].v1[2]);
                //strokeVertices.push(this._offsetTrianglesRight[i].v2[0]); strokeVertices.push(this._offsetTrianglesRight[i].v2[1]); strokeVertices.push(this._offsetTrianglesRight[i].v2[2]);
                var pPos = this.unprojectPoint(this._offsetTrianglesRight[i].v0, this._planeCenter, this._planeMat, this._planeMatInv);
                strokeVertices.push(pPos[0]); strokeVertices.push(pPos[1]); strokeVertices.push(pPos[2]);
                pPos = this.unprojectPoint(this._offsetTrianglesRight[i].v1, this._planeCenter, this._planeMat, this._planeMatInv);
                strokeVertices.push(pPos[0]); strokeVertices.push(pPos[1]); strokeVertices.push(pPos[2]);
                pPos = this.unprojectPoint(this._offsetTrianglesRight[i].v2, this._planeCenter, this._planeMat, this._planeMatInv);
                strokeVertices.push(pPos[0]); strokeVertices.push(pPos[1]); strokeVertices.push(pPos[2]);
            }
        }
        catch(e){
            alert( "Exception in GlSubpath.buildBuffers " + e );
        }

        var numSamples = strokeVertices.length / 3;
        var bboxDim = [];
        var bboxMid = [];
        for (var d = 0; d < 3; d++) {
            bboxDim[d] = 0.5 * (this._BBoxMax[d] - this._BBoxMin[d]);
            bboxMid[d] = 0.5 * (this._BBoxMax[d] + this._BBoxMin[d]);
        }

        // convert the stroke vertices into normalized device coordinates
        var aspect = world.getAspect();
        var zn = world.getZNear(), zf = world.getZFar();
        var t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),    //top of the
            b = -t,                                                 //bottom
            r = aspect * t,                                         //right
            l = -r;                                                 //left

        // calculate the object coordinates from their NDC coordinates
        var z = -world.getViewDistance();

        for (var i = 0; i < numSamples; i++) {
            //make the coordinates lie in [-1,1]
            var x = (strokeVertices[3 * i] - bboxMid[0]) / bboxDim[0];
            var y = -(strokeVertices[3 * i + 1] - bboxMid[1]) / bboxDim[1];

            //x and y should never be outside the [-1,1] range
            x = this._clamp(x, -1, 1);
            y = this._clamp(y, -1, 1);

            //apply the perspective transform 
            x *= -z * (r - l) / (2.0 * zn);
            y *= -z * (t - b) / (2.0 * zn);

            strokeVertices[3 * i] = x;
            strokeVertices[3 * i + 1] = y;
            strokeVertices[3 * i + 2] = 0; //z;
        }

        var len = strokeVertices.length;
        for (var i = 0; i < len; i += 3) {
            //enter some dummy tex. coords for now...shouldn't matter anyway
            strokeTextures.push(0.1);
            strokeTextures.push(0.1);
        }

        // stroke normals
        var indices = [];
        var index = 0;
        for (var i = 0; i < len; i += 3) {
            // push a normal for each vertex in the stroke
            strokeNormals.push(0.0); strokeNormals.push(0.0); strokeNormals.push(1);
            indices.push(index); index++;
        }

        var prim = ShapePrimitive.create(strokeVertices, strokeNormals, strokeTextures, indices, g_Engine.getContext().renderer.TRIANGLES, //LINE_STRIP, 
                                            indices.length);
        this._primArray.push(prim);

        this._materialNodeArray.push(this.makeStrokeMaterial().getMaterialNode());


        world.updateObject(this);
    }               //buildBuffers()


    this.getNearVertex = function( eyePt, dir ){
        //get the parameters used for computing perspective transformation
        var bboxDim = [];
        var bboxMid = [];
        bboxDim[0] = 0.5 * (this._BBoxMax[0] - this._BBoxMin[0]);
        bboxMid[0] = 0.5 * (this._BBoxMax[0] + this._BBoxMin[0]);
        bboxDim[1] = 0.5 * (this._BBoxMax[1] - this._BBoxMin[1]);
        bboxMid[1] = 0.5 * (this._BBoxMax[1] + this._BBoxMin[1]);
        bboxDim[2] = 0.5 * (this._BBoxMax[2] - this._BBoxMin[2]);
        bboxMid[3] = 0.5 * (this._BBoxMax[2] + this._BBoxMin[2]);

        // convert the stroke vertices into normalized device coordinates
        var world = this.getWorld();
        if (!world) return null;
        var aspect = world.getAspect();
        var zn = world.getZNear(), zf = world.getZFar();
        var t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),    //top of the frustum
            b = -t,                                                 //bottom
            r = aspect * t,                                         //right
            l = -r;                                                 //left

        // calculate the object coordinates from their NDC coordinates
        var z = -world.getViewDistance();

        // the eyePt and dir are in WebGL space...we need to convert each anchor point into the WebGL space
        var numAnchors = this._Anchors.length;
        var selAnchorPpos = null;
        var minDistance = Infinity;
        for (var i = 0; i < numAnchors; i++) {
            var anchorPos = Vector.create([this._Anchors[i].getPosX(), this._Anchors[i].getPosY(), this._Anchors[i].getPosZ()]);
            var ppos = this.computeUnprojectedNDC(anchorPos, bboxMid, bboxDim, r, l, t, b, z, zn);
            var dist = MathUtils.distPointToRay(ppos, eyePt, dir);
            if (dist < minDistance) {
                selAnchorPpos = ppos;
                minDistance = dist;
            }
        }
        return selAnchorPpos;
    }

    this.getNearPoint = function( eyePt, dir ){
        return null;
    }

    //returns true if P is left of line through l0 and l1 or on it
    this.isLeft = function(l0, l1, P){
        var signedArea = (l1[0]-l0[0])*(P[1] - l0[1]) - (P[0]-l0[0])*(l1[1]-l0[1]);
        if (signedArea>=0)
            return true;
        else
            return false;
    }
    //returns true if 2D point p is contained within 2D quad given by r0,r1,r2,r3 (need not be axis-aligned)
    this.isPointInQuad2D = function(r0,r1,r2,r3,p){
        //returns true if the point is on the same side of the segments r0r1, r1r2, r2r3, r3r0
        var isLeft0 = this.isLeft(r0,r1,p);
        var isLeft1 = this.isLeft(r1,r2,p);
        var isLeft2 = this.isLeft(r2,r3,p);
        var isLeft3 = this.isLeft(r3,r0,p);
        var andAll = isLeft0 & isLeft1 & isLeft2 & isLeft3;
        if (andAll)
            return true;
        var orAll = isLeft0 | isLeft1 | isLeft2 | isLeft3;
        if (!orAll)
            return true;
        return false;
    }

    //render
    //  specify how to render the subpath in Canvas2D
    this.render = function () {
        // get the world
        var world = this.getWorld();
        if (!world)  throw( "null world in subpath render" );

         // get the context
        var ctx = world.get2DContext();
        if (!ctx)  throw ("null context in subpath render")

        var numAnchors = this.getNumAnchors();
        if (numAnchors === 0)
            return; //nothing to do for empty paths

        ctx.save();

        this.createSamples(); //dirty bit checked in this function...will generate a polyline representation
        var bboxMin = this.getBBoxMin();
        var bboxMax = this.getBBoxMax();
        var bboxWidth = bboxMax[0] - bboxMin[0];
        var bboxHeight = bboxMax[1] - bboxMin[1];
        var bboxMid = Vector.create([0.5 * (bboxMax[0] + bboxMin[0]), 0.5 * (bboxMax[1] + bboxMin[1]), 0.5 * (bboxMax[2] + bboxMin[2])]);

        ctx.clearRect(0, 0, bboxWidth, bboxHeight);


        ctx.lineWidth = this._strokeWidth;
        ctx.strokeStyle = "black";
        if (this._strokeColor)
            ctx.strokeStyle = MathUtils.colorToHex( this._strokeColor );
        ctx.fillStyle = "white";
        if (this._fillColor)
            ctx.fillStyle = MathUtils.colorToHex( this._fillColor );
        var lineCap = ['butt','round','square'];
        ctx.lineCap = lineCap[1];
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
        }
        ctx.stroke();
        if (this._isClosed){
            ctx.fill();
        }




        

        //TODO...testing only
        /*
        var myImageData = ctx.getImageData(0,0,bboxWidth, bboxHeight);
        var pix = myImageData.data;

        var prevAnchor = this.getAnchor(0);
        ctx.moveTo(prevAnchor.getPosX()-bboxMin[0],prevAnchor.getPosY()-bboxMin[1]);
        for (var i = 1; i < numAnchors; i++) {
            var currAnchor = this.getAnchor(i);
            var leftOffsetStart = Vector.create([prevAnchor.getPosX()-this._strokeWidth/2-bboxMin[0], prevAnchor.getPosY()-bboxMin[1]]);
            var rightOffsetStart = Vector.create([prevAnchor.getPosX()+this._strokeWidth/2-bboxMin[0], prevAnchor.getPosY()-bboxMin[1]]);
            var leftOffsetEnd = Vector.create([currAnchor.getPosX()-this._strokeWidth/2-bboxMin[0], currAnchor.getPosY()-bboxMin[1]]);
            var rightOffsetEnd = Vector.create([currAnchor.getPosX()+this._strokeWidth/2-bboxMin[0], currAnchor.getPosY()-bboxMin[1]]);
            var middleStart = Vector.create([prevAnchor.getPosX()-bboxMin[0], prevAnchor.getPosY()-bboxMin[1]]);
            var middleEnd = Vector.create([currAnchor.getPosX()-bboxMin[0], currAnchor.getPosY()-bboxMin[1]]);

            //loop over all the pixels of the canvas
            for (var p = 0; n = pix.length/4, p < n; p ++) {
                //compute the location of this pixel relative to the canvas
                var loc = Vector.create([p%bboxWidth, p/bboxWidth]);
                //if (this.isPointInQuad2D(leftOffsetStart,rightOffsetStart,rightOffsetEnd,leftOffsetEnd,loc)) {
                if (this.isPointInQuad2D(middleStart, middleEnd, leftOffsetEnd, leftOffsetStart, loc)){
                    pix[p*4 + 0] = 255; //red channel
                    pix[p*4 + 1] = 0; //green channel
                    pix[p*4 + 2] = 0; //blue channel
                    pix[p*4 + 3] = 255; //alpha channel
                }
                else if (this.isPointInQuad2D(middleStart, middleEnd, rightOffsetEnd, rightOffsetStart, loc)){
                    pix[p*4 + 0] = 0; //red channel
                    pix[p*4 + 1] = 0; //green channel
                    pix[p*4 + 2] = 255; //blue channel
                    pix[p*4 + 3] = 255; // alpha channel
                }
            }
            prevAnchor = currAnchor;
        }
        // Draw the ImageData object at the given (x,y) coordinates.
        ctx.putImageData(myImageData, 0,0);
        */


        /*
        var numSamples = this._samples.length/3;
        var numSegments = numSamples;
        if (!this._isClosed){
            numSegments = numSegments-1;
        }
        ctx.lineWidth = this._strokeWidth;
        ctx.strokeStyle = "black";
        if (this._strokeColor)
            ctx.strokeStyle = MathUtils.colorToHex( this._strokeColor );
        ctx.fillStyle = "blue";
        if (this._fillColor)
            ctx.fillStyle = MathUtils.colorToHex( this._fillColor );
        var lineCap = ['butt','round','square'];
        ctx.lineCap = lineCap[2];

        //TODO temp. override
        var leftAngle = Math.PI/2.0;
        var rightAngle = -leftAngle;
        var leftWidth = 10;
        var rightWidth = 30;
        //TODO end temp override


        var prevLeftOffset=null;
        var prevRightOffset=null;
        var prevS1 = null;

        var doRotateOffset = true;

        for (var s=0;s<numSegments; s++){
            //compute the direction of this segment
            var s0= Vector.create([this._samples[3*s], this._samples[3*s+1], this._samples[3*s+2]]);
            var next = (s+1)%numSamples;
            var s1= Vector.create([this._samples[3*next], this._samples[3*next+1], this._samples[3*next+2]]);
            var segDirection = VecUtils.vecSubtract(3, s1, s0);
            if (VecUtils.vecMagSq(3, segDirection)<0.01){
                continue; //do nothing for degenerate segments
            }
            segDirection = VecUtils.vecNormalize(3, segDirection);

            //TODO figure out how to remove the borders between polygons
            //pad s0 and s1 by a small amount (assuming we're in pixel space and segDirection is of unit magnitude)
            s0[0]-= segDirection[0]; s0[1]-=segDirection[1];
            s1[0]+= segDirection[0]; s1[1]+=segDirection[1];
            
            //compute the left and right offset vectors using the angle and width
            var rotMat = Matrix.Rotation(leftAngle, Vector.create([0,0,1]));
            var leftOffset = VecUtils.vecNormalize(3, MathUtils.transformVector(segDirection, rotMat), leftWidth);
            rotMat = Matrix.Rotation(rightAngle, Vector.create([0,0,1]));
            var rightOffset = VecUtils.vecNormalize(3, MathUtils.transformVector(segDirection, rotMat), rightWidth);
            if (!doRotateOffset){
                leftOffset = Vector.create([-leftWidth, 0, 0]);
                rightOffset = Vector.create([rightWidth, 0, 0]);
            }

            // ******* draw the left filled path *******
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.moveTo(s0[0]-bboxMin[0],s0[1]-bboxMin[1]);
            ctx.lineTo(s0[0]+leftOffset[0] - bboxMin[0], s0[1]+leftOffset[1] - bboxMin[1]);
            ctx.lineTo(s1[0]+leftOffset[0] - bboxMin[0], s1[1]+leftOffset[1] - bboxMin[1]);
            ctx.lineTo(s1[0] - bboxMin[0],s1[1] - bboxMin[1]);
            ctx.lineTo(s0[0]-bboxMin[0],s0[1]-bboxMin[1]);
            ctx.fill();

            //draw the path connecting to the previous polygon
            if (prevLeftOffset) {
            //if (0){
                ctx.beginPath();
                ctx.moveTo(s0[0]-bboxMin[0],s0[1]-bboxMin[1]);

                //ctx.lineTo(prevS1[0]+prevLeftOffset[0] - bboxMin[0],prevS1[1]+prevLeftOffset[1] - bboxMin[1]);
                ctx.lineTo(s0[0]+prevLeftOffset[0] - bboxMin[0],s0[1]+prevLeftOffset[1] - bboxMin[1]);

                ctx.lineTo(s0[0]+leftOffset[0] - bboxMin[0], s0[1]+leftOffset[1] - bboxMin[1]);
                ctx.lineTo(s0[0]-bboxMin[0],s0[1]-bboxMin[1]);
                ctx.fill();
            }


            //draw the right filled path
            // ******* draw the left filled path *******
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.moveTo(s0[0]-bboxMin[0],s0[1]-bboxMin[1]);
            ctx.lineTo(s0[0]+rightOffset[0] - bboxMin[0], s0[1]+rightOffset[1] - bboxMin[1]);
            ctx.lineTo(s1[0]+rightOffset[0] - bboxMin[0], s1[1]+rightOffset[1] - bboxMin[1]);
            ctx.lineTo(s1[0] - bboxMin[0],s1[1] - bboxMin[1]);
            ctx.lineTo(s0[0]-bboxMin[0],s0[1]-bboxMin[1]);
            ctx.fill();

            //draw the path connecting to the previous polygon
            if (prevRightOffset) {
            //if (0){
                ctx.beginPath();
                ctx.moveTo(s0[0]-bboxMin[0],s0[1]-bboxMin[1]);

                //ctx.lineTo(prevS1[0]+prevRightOffset[0] - bboxMin[0],prevS1[1]+prevRightOffset[1] - bboxMin[1]);
                ctx.lineTo(s0[0]+prevRightOffset[0] - bboxMin[0],s0[1]+prevRightOffset[1] - bboxMin[1]);

                ctx.lineTo(s0[0]+rightOffset[0] - bboxMin[0], s0[1]+rightOffset[1] - bboxMin[1]);
                ctx.lineTo(s0[0]-bboxMin[0],s0[1]-bboxMin[1]);
                ctx.fill();
            }


           
            prevLeftOffset = leftOffset;
            prevRightOffset = rightOffset;
            prevS1 = s1;
        }

        */
        //TODO end testing only

        ctx.restore();
    } //render()


    this.export = function()
    {
        var rtnStr = "type: " + this.geomType() + "\n";

        rtnStr += "strokeWidth: "	+ this._strokeWidth	+ "\n";
        rtnStr += "strokeStyle: "	+ this._strokeStyle	+ "\n";

        rtnStr += "strokeMat: ";
        if (this._strokeMaterial)
            rtnStr += this._strokeMaterial.getName();
        else
            rtnStr += "flatMaterial";
        rtnStr += "\n";

        rtnStr += "fillMat: ";
        if (this._fillMaterial)
            rtnStr += this._fillMaterial.getName();
        else
            rtnStr += "flatMaterial";
        rtnStr += "\n";

        var isClosedStr = "false";
        if (this._isClosed)
            isClosedStr = "true";
        rtnStr += "isClosed: "      + isClosedStr + "\n";

        //add the anchor points
        var numAnchors = this._Anchors.length;
        rtnStr += "numAnchors: "    + numAnchors        + "\n";
        for (var i=0;i<numAnchors;i++){
            rtnStr += "anchor"+i+"x: " + this._Anchors[i].getPosX() + "\n";
            rtnStr += "anchor"+i+"y: " + this._Anchors[i].getPosY() + "\n";
            rtnStr += "anchor"+i+"z: " + this._Anchors[i].getPosZ() + "\n";

            rtnStr += "anchor"+i+"prevx: " + this._Anchors[i].getPrevX() + "\n";
            rtnStr += "anchor"+i+"prevy: " + this._Anchors[i].getPrevY() + "\n";
            rtnStr += "anchor"+i+"prevz: " + this._Anchors[i].getPrevZ() + "\n";

            rtnStr += "anchor"+i+"nextx: " + this._Anchors[i].getNextX() + "\n";
            rtnStr += "anchor"+i+"nexty: " + this._Anchors[i].getNextY() + "\n";
            rtnStr += "anchor"+i+"nextz: " + this._Anchors[i].getNextZ() + "\n";
        }
        return rtnStr;
    }

    this.import = function( importStr )
    {
        this._strokeWidth		= this.getPropertyFromString( "strokeWidth: ",	importStr );
        this._strokeStyle		= this.getPropertyFromString( "strokeStyle: ",	importStr );
        var strokeMaterialName	= this.getPropertyFromString( "strokeMat: ",	importStr );
        var fillMaterialName	= this.getPropertyFromString( "fillMat: ",		importStr );

        var strokeMat = MaterialsLibrary.getMaterial( strokeMaterialName );
        if (!strokeMat)
        {
            console.log( "object material not found in library: " + strokeMaterialName );
            strokeMat = new FlatMaterial();
        }
        this._strokeMaterial = strokeMat;

        var fillMat = MaterialsLibrary.getMaterial( fillMaterialName );
        if (!fillMat)
        {
            console.log( "object material not found in library: " + fillMaterialName );
            fillMat = new FlatMaterial();
        }
        this._fillMaterial = fillMat;

        var isClosedStr = this.getPropertyFromString( "isClosed: ", importStr);
        this._isClosed = isClosedStr === "true";

        var numAnchors = this.getPropertyFromString("numAnchors: ", importStr);
        for (var i=0;i<numAnchors;i++) {
            var posX = this.getPropertyFromString("anchor"+i+"x", importStr);
            var posY = this.getPropertyFromString("anchor"+i+"y", importStr);
            var posZ = this.getPropertyFromString("anchor"+i+"z", importStr);

            var prevX = this.getPropertyFromString("anchor"+i+"prevx", importStr);
            var prevY = this.getPropertyFromString("anchor"+i+"prevy", importStr);
            var prevZ = this.getPropertyFromString("anchor"+i+"prevz", importStr);

            var nextX = this.getPropertyFromString("anchor"+i+"nextx", importStr);
            var nextY = this.getPropertyFromString("anchor"+i+"nexty", importStr);
            var nextZ = this.getPropertyFromString("anchor"+i+"nextz", importStr);

            var newAnchor = new GLAnchorPoint();
            newAnchor.setPos(posX, posY, posZ);
            newAnchor.setPrevPos(prevX, prevY, prevZ);
            newAnchor.setNextPos(nextX, nextY, nextZ);
            this._selectedSubpath.addAnchor(newAnchor);
        }
    }

    this.collidesWithPoint = function (x, y, z) {
        if (x < this._BBoxMin[0]) return false;
        if (x > this._BBoxMax[0]) return false;
        if (y < this._BBoxMin[1]) return false;
        if (y > this._BBoxMax[1]) return false;
        if (z < this._BBoxMin[2]) return false;
        if (z > this._BBoxMax[2]) return false;

        return true;
    }

    this.collidesWithPoint = function (x, y) {
        if (x < this._BBoxMin[0]) return false;
        if (x > this._BBoxMax[0]) return false;
        if (y < this._BBoxMin[1]) return false;
        if (y > this._BBoxMax[1]) return false;

        return true;
    }

} //function GLSubpath ...class definition