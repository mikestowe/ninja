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

var VecUtils = require("js/helper-classes/3D/vec-utils").VecUtils;
var GeomObj = require("js/lib/geom/geom-obj").GeomObj;
var CanvasController = require("js/controllers/elements/canvas-controller").CanvasController;
var ViewUtils = require("js/helper-classes/3D/view-utils").ViewUtils;

// Todo: This entire class should be converted to a module

///////////////////////////////////////////////////////////////////////
// Class GLBrushStroke
//      representation a sequence points (polyline) created by brush tool.
//      Derived from class GLGeomObj
///////////////////////////////////////////////////////////////////////
var BrushStroke = function GLBrushStroke() {
    ///////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////
    this._Points = [];                      //current state of points in stage-world space (may be different from input)
    this._LocalPoints = [];                 //_Points in local coordinates...do this before rendering the points in the canvas
    this._OrigLocalPoints = [];             //copy of input points without any smoothing
    this._stageWorldCenter  = [0,0,0];      //coordinate for the canvas midPoint: a 3D vector in stage world space
    this._BBoxMin = [0, 0, 0];
    this._BBoxMax = [0, 0, 0];
    this._isDirty = true;
    this._isInit = false;

    //the HTML5 canvas that holds this brush stroke
    this._canvas = null;
    //flag indicating whether or not to freeze the size and position of canvas
    this._freezeCanvas = false;

    //stroke information
    this._strokeWidth = 1.0;
    this._strokeColor = [0.4, 0.4, 0.4, 1.0];
    this._secondStrokeColor = [1, 0.4, 0.4, 1.0];
    this._strokeHardness = 100;
    this._strokeMaterial = null;
    this._strokeStyle = "Solid";
    this._strokeDoSmoothing = false;
    this._strokeUseCalligraphic = false;
    this._strokeAngle = 0;
    this._strokeAmountSmoothing = 0;

    // currently, brush does not support a fill region
    this.canFill = true;

    //threshold that tells us whether two samples are too far apart
    this._MAX_SAMPLE_DISTANCE_THRESHOLD = 5;

    //threshold that tells us whether two samples are too close
    this._MIN_SAMPLE_DISTANCE_THRESHOLD = 2;

    //prevent extremely long paths that can take a long time to render
    this._MAX_ALLOWED_SAMPLES = 5000;

    //drawing context
    this._world = null;

    //tool that owns this brushstroke
    this._drawingTool = null;
    this._planeMat = null;
    this._planeMatInv = null;
    this._planeCenter = null;
    this._dragPlane = null;
}; //BrushStroke class defition

BrushStroke.prototype = Object.create(GeomObj, {});

/////////////////////////////////////////////////////////
// Property Accessors/Setters
/////////////////////////////////////////////////////////
BrushStroke.prototype.setCanvas = function(c) {
    this._canvas = c;
};

BrushStroke.prototype.setWorld = function (world) {
    this._world = world;
};

BrushStroke.prototype.getWorld = function () {
    return this._world;
};

BrushStroke.prototype.geomType = function () {
    return this.GEOM_TYPE_BRUSH_STROKE;
};

BrushStroke.prototype.setDrawingTool = function (tool) {
    this._drawingTool = tool;
};

BrushStroke.prototype.getDrawingTool = function () {
    return this._drawingTool;
};

BrushStroke.prototype.setPlaneMatrix = function(planeMat){
    this._planeMat = planeMat;
};

BrushStroke.prototype.setPlaneMatrixInverse = function(planeMatInv){
    this._planeMatInv = planeMatInv;
};

BrushStroke.prototype.setPlaneCenter = function(pc){
    this._planeCenter = pc;
};

BrushStroke.prototype.setDragPlane = function(p){
    this._dragPlane = p;
};

BrushStroke.prototype.getNumPoints = function () {
    if (this._LocalPoints.length)
        return this._LocalPoints.length;
    else
        return this._Points.length;
};

BrushStroke.prototype.getPoint = function (index) {
    return this._Points[index].slice(0);
};

BrushStroke.prototype.addPoint = function (pt) {
    //add the point only if it is some epsilon away from the previous point
    var numPoints = this._Points.length;
    if (numPoints>0) {
        var threshold = this._MIN_SAMPLE_DISTANCE_THRESHOLD;
        var prevPt = this._Points[numPoints-1];
        var diffPt = [prevPt[0]-pt[0], prevPt[1]-pt[1]];
        var diffPtMag = Math.sqrt(diffPt[0]*diffPt[0] + diffPt[1]*diffPt[1]);
        if (diffPtMag>threshold){
            this._Points.push(pt);
            this._isDirty=true;
            this._isInit = false;
        }
    } else {
        this._Points.push(pt);
        this._isDirty=true;
        this._isInit = false;
    }
};

BrushStroke.prototype.insertPoint = function(pt, index){
    this._Points.splice(index, 0, pt);
    this._isDirty=true;
    this._isInit = false;
};

BrushStroke.prototype.isDirty = function(){
    return this._isDirty;
};

BrushStroke.prototype.makeDirty = function(){
    this._isDirty=true;
};

BrushStroke.prototype.getStageWorldCenter = function() {
    return this._stageWorldCenter;
};

BrushStroke.prototype.getBBoxMin = function () {
    return this._BBoxMin;
};

BrushStroke.prototype.getBBoxMax = function () {
    return this._BBoxMax;
};

BrushStroke.prototype.getStrokeWidth = function () {
    return this._strokeWidth;
};

BrushStroke.prototype.setStrokeWidth = function (w) {
    if (this._strokeWidth!==w) {
        this._strokeWidth = w;

        if (this._strokeWidth<1) {
            this._strokeWidth = 1;
        }
        this._isDirty=true;
        this._freezeCanvas=false;
    }
};
/*
BrushStroke.prototype.getStrokeMaterial = function () {
    return this._strokeMaterial;
};

BrushStroke.prototype.setStrokeMaterial = function (m) {
    this._strokeMaterial = m; this._isDirty = true;
};
*/
BrushStroke.prototype.getStrokeColor = function () {
    return null;//return this._strokeColor;
};

BrushStroke.prototype.setStrokeColor = function (c) {
    //this._strokeColor = c; this._isDirty = true;
};

BrushStroke.prototype.setFillColor = function(c){
    this._strokeColor = c; this._isDirty = true;
};
//sets stroke color for now as we have no fill region

BrushStroke.prototype.getFillColor = function() {
    return this._strokeColor;
};
//return strokeColor for now as we have no fill region

BrushStroke.prototype.setSecondStrokeColor = function(c){
    this._secondStrokeColor=c; this._isDirty = true;
};

BrushStroke.prototype.setStrokeHardness = function(h){
    if (this._strokeHardness!==h){
        this._strokeHardness=h;
        this._isDirty = true;
    }
};
BrushStroke.prototype.getStrokeHardness = function(){
    return this._strokeHardness;
};

BrushStroke.prototype.setDoSmoothing = function(s){
    if (this._strokeDoSmoothing!==s) {
        this._strokeDoSmoothing = s;
        this._isDirty = true;
    }
};

BrushStroke.prototype.getDoSmoothing = function(){
    return this._strokeDoSmoothing;
};

BrushStroke.prototype.setSmoothingAmount = function(a){
    if (this._strokeAmountSmoothing!==a) {
        this._strokeAmountSmoothing = a;
        this._isDirty = true;
        this._freezeCanvas=false;
    }
};

BrushStroke.prototype.getSmoothingAmount = function(){
    return this._strokeAmountSmoothing;
};

BrushStroke.prototype.setStrokeUseCalligraphic = function(c){
    if (this._strokeUseCalligraphic!==c){
        this._strokeUseCalligraphic = c;
        this._isDirty = true;
    }
};

BrushStroke.prototype.setStrokeAngle = function(a){
    if (this._strokeAngle!==a){
        this._strokeAngle = a;
        this._isDirty = true;
    };
};

BrushStroke.prototype.getStrokeUseCalligraphic = function(){
    return this._strokeUseCalligraphic;
};

BrushStroke.prototype.getStrokeAngle = function(){
    return this._strokeAngle;
};

BrushStroke.prototype.getStrokeStyle = function () {
    return this._strokeStyle;
};

BrushStroke.prototype.setStrokeStyle = function (s) {
    this._strokeStyle = s;
};

BrushStroke.prototype.setWidth = function (newW) {
    //get the old width from the canvas controller if the canvas is frozen, or from bbox if not frozen.
    var oldCanvasWidth = parseInt(CanvasController.getProperty(this._canvas, "width"));
    if (!this._freezeCanvas){
        oldCanvasWidth = Math.round(this._BBoxMax[0]-this._BBoxMin[0]);
    }
    var minWidth = 1+this._strokeWidth;
    if (newW<minWidth) {
        newW=minWidth;
    }

    if (oldCanvasWidth<minWidth) {
        oldCanvasWidth=minWidth;
    }

    //scale the contents of this subpath to lie within this width
    //determine the scale factor by comparing with the old width
    var scaleX = (newW-this._strokeWidth)/(oldCanvasWidth-this._strokeWidth);
    if (scaleX===1) {
        console.log("Ignoring setWidth because scale is "+scaleX);
        return; //no need to do anything
    }
    //scale the local point positions such that the width of the bbox is the newW
    var origX = 0.5*this._strokeWidth;//this._BBoxMin[0]; //this represents the left edge
    var numPoints = this._LocalPoints.length;
    for (var i=0;i<numPoints;i++){
        //compute the distance from the left edge
        var oldW = this._LocalPoints[i][0] - origX;
        this._LocalPoints[i] = [(origX + oldW*scaleX),this._LocalPoints[i][1],this._LocalPoints[i][2]];

        oldW = this._OrigLocalPoints[i][0] - origX;
        this._OrigLocalPoints[i] = [(origX + oldW*scaleX),this._OrigLocalPoints[i][1],this._OrigLocalPoints[i][2]];
    }
    this._isDirty = true;
};

BrushStroke.prototype.setHeight = function (newH) {
    var oldCanvasHeight = parseInt(CanvasController.getProperty(this._canvas, "height"));
    if (!this._freezeCanvas){
        oldCanvasHeight = this._BBoxMax[1]-this._BBoxMin[1];
    }
    var minHeight = 1 + this._strokeWidth;
    if (oldCanvasHeight<minHeight) {
        oldCanvasHeight=minHeight;
    }
    if (newH<minHeight) {
        newH=minHeight;
    }


    //scale the contents of this subpath to lie within this height
    //determine the scale factor by comparing with the old height
    var scaleY = (newH-this._strokeWidth)/(oldCanvasHeight-this._strokeWidth);
    if (scaleY===1) {
        console.log("Ignoring setHeight because scale is 1");
        return; //no need to do anything
    }

    //scale the local point positions such that the width of the bbox is the newW
    var origY = 0.5*this._strokeWidth;//this._BBoxMin[1]; //this represents the top edge
    var numPoints = this._LocalPoints.length;
    for (var i=0;i<numPoints;i++){
        //compute the distance from the bboxMin
        var oldH = this._LocalPoints[i][1] - origY;
        this._LocalPoints[i] = [this._LocalPoints[i][0],(origY + oldH*scaleY),this._LocalPoints[i][2]];

        oldH = this._OrigLocalPoints[i][1] - origY;
        this._OrigLocalPoints[i] = [this._OrigLocalPoints[i][0],(origY + oldH*scaleY),this._OrigLocalPoints[i][2]];
    }
    this._isDirty = true;
};

BrushStroke.prototype.getWidth = function() {
    if (this._isDirty){
        this.update();
    }
    return this._BBoxMax[0]-this._BBoxMin[0];
};

BrushStroke.prototype.getHeight = function() {
    if (this._isDirty){
        this.update();
    }
    return this._BBoxMax[1]-this._BBoxMin[1];
};

//remove all the points
BrushStroke.prototype.clear = function () {
    this._Points = [];
    this._OrigLocalPoints    = [];
    this._isDirty=true;
    this._isInit = false;
};

BrushStroke.prototype._addSamples = function() {
    //**** add samples to the long sections of the path --- Catmull-Rom spline interpolation *****
    // instead of the following, may use 4-point subdivision iterations over continuous regions of 'long' segments
    // look at http://www.gvu.gatech.edu/~jarek/Split&Tweak/ for formula

    var numPoints = this._Points.length;
    var numInsertedPoints = 0;
    var newSampledPoints = [];
    var threshold = this._MAX_SAMPLE_DISTANCE_THRESHOLD;//this determines whether a segment between two sample too long
    var prevPt = this._Points[0];
    newSampledPoints.push(this._Points[0]);
    for (var i=1;i<numPoints;i++) {
        var pt = this._Points[i];
        var diff = [pt[0]-prevPt[0], pt[1]-prevPt[1]];
        var distance = Math.sqrt(diff[0]*diff[0]+diff[1]*diff[1]);
        if (distance>threshold){
            //build the control polygon for the Catmull-Rom spline (prev. 2 points and next 2 points)
            var prev = (i===1) ? i-1 : i-2;
            var next = (i===numPoints-1) ? i : i+1;
            var ctrlPts = [this._Points[prev], this._Points[i-1], this._Points[i], this._Points[next]];
            //insert points along the prev. to current point
            var numNewPoints = Math.floor(distance/threshold);
            for (var j=0;j<numNewPoints;j++){
                var param = (j+1)/(numNewPoints+1);
                var newpt = this._CatmullRomSplineInterpolate(ctrlPts, param);
                newSampledPoints.push(newpt);
                numInsertedPoints++;
            }
        }
        newSampledPoints.push(pt);
        prevPt=pt;

        //end this function if the numPoints has gone above the max. size specified
        if (numPoints> this._MAX_ALLOWED_SAMPLES){
            console.log("leaving the resampling because numPoints is greater than limit:"+this._MAX_ALLOWED_SAMPLES);
            break;
        }
    }
    this._Points = newSampledPoints.slice(0);
    newSampledPoints = [];
};

BrushStroke.prototype.init = function(){
    if (!this._isInit){
        // **** add samples to the _Points in stageworld space ****
        this._addSamples();

        // **** compute the 2D (canvas space) coord. of the _Points  ****
        this._buildLocalCoordFromStageWorldCoord();

        // **** turn off the init. flag ****
        this._isInit = true;
        this._isDirty= true;
    }

    // **** update the current brush stroke ****
    // smoothing, re-compute bounding box, etc.
    this.update();
};

BrushStroke.prototype._unprojectPt = function(pt, pespectiveDist){
    var retPt = pt.slice(0);
    if (MathUtils.fpCmp(pespectiveDist,-pt[2]) !== 0){
        z = pt[2]*pespectiveDist/(pespectiveDist + pt[2]);
        var x = pt[0]*(pespectiveDist - z)/pespectiveDist,
            y = pt[1]*(pespectiveDist - z)/pespectiveDist;
        retPt[0] = x;  retPt[1] = y;  retPt[2] = z;
    }
    return retPt;
};

BrushStroke.prototype._buildLocalCoordFromStageWorldCoord = function() {
    var stage = ViewUtils.getStage();
    var stageOffset = ViewUtils.getElementOffset(stage);
    ViewUtils.setViewportObj(stage);

    var numPoints = this._Points.length;
    var i;

    // ***** compute center of bbox based on stage world coords *****
    var bboxMin = [Infinity, Infinity, Infinity];
    var bboxMax = [-Infinity, -Infinity, -Infinity];
    for (i=0;i<numPoints;i++){
        var pt = this._Points[i];
        for (var d = 0; d < 3; d++) {
            if (bboxMin[d] > pt[d]) {
                bboxMin[d] = pt[d];
            }
            if (bboxMax[d] < pt[d]) {
                bboxMax[d] = pt[d];
            }
        }
    }
    //save the center of the bbox for later use (while constructing the canvas)
    this._stageWorldCenter = VecUtils.vecInterpolate(3, bboxMin, bboxMax, 0.5);

    // ***** center the input stageworld data about the center of the bbox *****
    this._LocalPoints = [];
    for (i=0;i<numPoints;i++){
        var localPoint = [this._Points[i][0],this._Points[i][1],this._Points[i][2]];
        localPoint[0]-= this._stageWorldCenter[0];
        localPoint[1]-= this._stageWorldCenter[1];

        // ***** unproject all the centered points and convert them to 2D (plane space)*****
        // (undo the projection step performed by the browser)
        //localPoint = this._unprojectPt(localPoint, 1400); //todo get the perspective distance from the canvas
        localPoint = MathUtils.transformPoint(localPoint, this._planeMatInv);

        //add to the list of local points
        this._LocalPoints.push(localPoint);
    }

    // ***** compute width, height, and midpoint position (in stage world position) of the canvas
    this._updateBoundingBox(); //compute the bbox to obtain the width and height used below
    var halfwidth = 0.5*(this._BBoxMax[0]-this._BBoxMin[0]);
    var halfheight = 0.5*(this._BBoxMax[1]-this._BBoxMin[1]);
    this._OrigLocalPoints    = [];
    for (i=0;i<numPoints;i++) {
        this._LocalPoints[i][0]+= halfwidth;
        this._LocalPoints[i][1]+= halfheight;

        //store the original points
        this._OrigLocalPoints.push([this._LocalPoints[i][0],this._LocalPoints[i][1],this._LocalPoints[i][2]]);
    }
    //update the bbox with the same adjustment as was made for the local points above
    this._BBoxMax[0]+= halfwidth;this._BBoxMin[0]+= halfwidth;
    this._BBoxMax[1]+= halfheight;this._BBoxMin[1]+= halfheight;
};

BrushStroke.prototype.update = function() {
    if (this._isDirty){
        // **** do smoothing if necessary ****
        this._doSmoothing();

        // **** recompute the bounding box ****
        this._updateBoundingBox();

        // **** offset the local coords to account for the change in bbox ****
        this._offsetLocalCoord(-this._BBoxMin[0], -this._BBoxMin[1]);

        // **** turn off the dirty flag ****
        this._isDirty = false;
    }
};

BrushStroke.prototype._offsetLocalCoord = function(deltaW, deltaH){
    var numPoints = this._LocalPoints.length;
    for (var i=0;i<numPoints;i++) {
        this._LocalPoints[i][0]+= deltaW;
        this._LocalPoints[i][1]+= deltaH;
    }
};

//I had to write this function to do a deep copy because I think slice(0) creates a copy by reference
BrushStroke.prototype._copyCoordinates3D = function(srcCoord, destCoord){
    var i=0;
    var numPoints = srcCoord.length;
    for (i=0;i<numPoints;i++){
        destCoord[i] = [srcCoord[i][0],srcCoord[i][1],srcCoord[i][2]];
    }
};
BrushStroke.prototype._doSmoothing = function() {
    var numPoints = this._LocalPoints.length;
    if (this._strokeDoSmoothing && numPoints>1) {
        this._copyCoordinates3D(this._OrigLocalPoints   , this._LocalPoints);
        //iterations of Laplacian smoothing (setting the points to the average of their neighbors)
        var numLaplacianIterations = this._strokeAmountSmoothing;
        for (var n=0;n<numLaplacianIterations;n++){
            var newPoints = this._LocalPoints.slice(0); //I think this performs a copy by reference, which would make the following a SOR step
            for (var i=1;i<numPoints-1;i++) {
                var avgPos = [  0.5*(this._LocalPoints[i-1][0] + this._LocalPoints[i+1][0]),
                                0.5*(this._LocalPoints[i-1][1] + this._LocalPoints[i+1][1]),
                                0.5*(this._LocalPoints[i-1][2] + this._LocalPoints[i+1][2])] ;
                newPoints[i] = avgPos;
            }
            this._LocalPoints = newPoints.slice(0);
        }
    }
};

BrushStroke.prototype._updateBoundingBox = function() {
    // *** compute the bounding box *********
    var points = this._LocalPoints;
    var numPoints = points.length;

    this._BBoxMin = [Infinity, Infinity, Infinity];
    this._BBoxMax = [-Infinity, -Infinity, -Infinity];
    if (numPoints === 0) {
        this._BBoxMin = [0, 0, 0];
        this._BBoxMax = [0, 0, 0];
    } else {
        for (var i=0;i<numPoints;i++){
            var pt = points[i];
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

    //increase the bbox given the stroke width and the angle (in case of calligraphic brush)
    var bboxPadding = this._strokeWidth/2;
    //todo TEMP!
    //bboxPadding = 0; //for now, ignore the effect of stroke width on bounding box
    //end todo TEMP
    //if (this._strokeUseCalligraphic) {
    //todo re-enable this if check once we are able to change the left and top of the brush canvas
    if (false){
        this._BBoxMin[0]-= bboxPadding*Math.cos(this._strokeAngle);
        this._BBoxMin[1]-= bboxPadding*Math.sin(this._strokeAngle);
        this._BBoxMax[0]+= bboxPadding*Math.cos(this._strokeAngle);
        this._BBoxMax[1]+= bboxPadding*Math.sin(this._strokeAngle);
    } else {
        for (var d = 0; d < 3; d++) {
            this._BBoxMin[d]-= bboxPadding;
            this._BBoxMax[d]+= bboxPadding;
        }//for every dimension d from 0 to 2
    }
};

BrushStroke.prototype.buildBuffers = function () {
    //return; //no need to do anything for now
};//buildBuffers()

//render
//  specify how to render the subpath in Canvas2D
BrushStroke.prototype.render = function () {
    // get the world
    var world = this.getWorld();
    if (!world){
        throw( "null world in brushstroke render" );
    }

    var numPoints = this.getNumPoints();
    if (numPoints === 0) {
        return; //nothing to do for empty paths
    }

    if (this._isDirty){
        this.update();
    }
    var bboxMin = this.getBBoxMin();
    var bboxMax = this.getBBoxMax();
    var bboxWidth = bboxMax[0] - bboxMin[0];
    var bboxHeight = bboxMax[1] - bboxMin[1];

    if (!this._canvas){
        //set the canvas by querying the world
        this._canvas = this.getWorld().getCanvas();
    }
    if (this._canvas && !this._freezeCanvas) {
        var newLeft = Math.round(this._stageWorldCenter[0] - 0.5 * bboxWidth);
        var newTop = Math.round(this._stageWorldCenter[1] - 0.5 * bboxHeight);
        //assign the new position, width, and height as the canvas dimensions through the canvas controller
        //CanvasController.setProperty(this._canvas, "left", newLeft+"px");
        //CanvasController.setProperty(this._canvas, "top", newTop+"px");

        CanvasController.setProperty(this._canvas, "width", bboxWidth+"px");
        CanvasController.setProperty(this._canvas, "height", bboxHeight+"px");
        //this._canvas.elementModel.shapeModel.GLWorld.setViewportFromCanvas(this._canvas);
    }
    this._freezeCanvas=true; //unless this is set to false, we will not update the canvas width and height anymore in the render function

    //get the context
    var ctx = world.get2DContext();
    if (!ctx) {
        throw ("null context in brushstroke render");
    }
    ctx.save();
    ctx.clearRect(0, 0, bboxWidth, bboxHeight);
    this.drawToContext(ctx, false);
    ctx.restore();
}; //this.render()



//buildColor returns the fillStyle or strokeStyle for the Canvas 2D context
BrushStroke.prototype.buildColor = function(ctx,          //the 2D rendering context (for creating gradients if necessary)
                                          ipColor,      //color string, also encodes whether there's a gradient and of what type
                                          w,            //width of the region of color
                                          h,            //height of the region of color
                                          lw,           //linewidth (i.e. stroke width/size)
                                          alphaVal)     //alpha value for this color (usually computed by the rendering code separately)
{
    if (ipColor.gradientMode){
        var position, gradient, cs, inset; //vars used in gradient calculations
        inset = Math.ceil( lw ) - 0.5;
        inset = 0;

        if(ipColor.gradientMode === "radial") {
            var ww = w - 2*lw,  hh = h - 2*lw;
            gradient = ctx.createRadialGradient(w*0.5, h*0.5, 0, w*0.5, h*0.5, Math.max(ww, hh)*0.5);
        } else {
            gradient = ctx.createLinearGradient(inset, h*0.5, w-inset, h*0.5);
        }
        var colors = ipColor.color;

        var len = colors.length;
        for(n=0; n<len; n++) {
            position = colors[n].position*0.01;
            cs = colors[n].value;
            gradient.addColorStop(position, "rgba(" + cs.r + "," + cs.g + "," + cs.b + "," + alphaVal + ")");
        }
        return gradient;
    } else {
        var c = "rgba(" + 255*ipColor[0] + "," + 255*ipColor[1] + "," + 255*ipColor[2] + "," + alphaVal + ")";
        return c;
    }
};


BrushStroke.prototype.drawToContext = function(ctx, drawStageWorldPts, stageWorldDeltaX, stageWorldDeltaY, stageWorldToScreenMat){
    var points = this._LocalPoints;
    if (drawStageWorldPts){ //this is usually true when we're drawing the brush stroke on the stage (no canvas yet)
        points = this._Points;
    }
    var numPoints = points.length;
    var tempP, p, w, h;

    var world = this.getWorld();
    var useBuildColor = false;
    if (world){
        if (this._strokeColor.gradientMode){
            useBuildColor = true;
        }
        //vars used for the gradient computation in buildColor
        w = world.getViewportWidth();
        h = world.getViewportHeight();
    }

    if (this._strokeUseCalligraphic) {
        //build the stamp for the brush stroke
        var t=0;
        var numTraces = this._strokeWidth;
        var halfNumTraces = numTraces*0.5;
        var opaqueRegionHalfWidth = 0.5*this._strokeHardness*numTraces*0.01; //the 0.01 is to convert the strokeHardness from [0,100] to [0,1]
        var maxTransparentRegionHalfWidth = halfNumTraces-opaqueRegionHalfWidth;

        //todo this brush stamp should be created outside of this function
        //build an angled (calligraphic) brush stamp
        var deltaDisplacement = [Math.cos(this._strokeAngle),Math.sin(this._strokeAngle)];
        deltaDisplacement = VecUtils.vecNormalize(2, deltaDisplacement, 1);
        var startPos = [-halfNumTraces*deltaDisplacement[0],-halfNumTraces*deltaDisplacement[1]];

        var brushStamp = [];
        for (t=0;t<numTraces;t++){
            var brushPt = [startPos[0]+t*deltaDisplacement[0], startPos[1]+t*deltaDisplacement[1]];
            brushStamp.push(brushPt);
        }

        ctx.lineJoin="bevel";
        ctx.lineCap="butt";
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = this._strokeColor[3];

        for (t=0;t<numTraces;t++){
            var disp = [brushStamp[t][0], brushStamp[t][1]];
            var alphaVal = 1.0;
            var distFromOpaqueRegion = Math.abs(t-halfNumTraces) - opaqueRegionHalfWidth;
            if (numTraces === 1){
                distFromOpaqueRegion = 0;
            }
            else if (distFromOpaqueRegion>0) {
                var transparencyFactor = distFromOpaqueRegion/maxTransparentRegionHalfWidth;
                alphaVal = 1.0 - transparencyFactor;//(transparencyFactor*transparencyFactor);//the square term produces nonlinearly varying alpha values
                alphaVal *= 0.5; //factor that accounts for lineWidth == 2
            }
            ctx.save();
            if (t === (numTraces-1) || t === 0){
                ctx.lineWidth = 1;
            } else {
                 //todo figure out the correct formula for the line width
                ctx.lineWidth=2;
            }

            if (!useBuildColor){
                ctx.strokeStyle="rgba("+parseInt(255*this._strokeColor[0])+","+parseInt(255*this._strokeColor[1])+","+parseInt(255*this._strokeColor[2])+","+alphaVal+")";
            } else {
                ctx.strokeStyle = this.buildColor(ctx, this._strokeColor, w, h, this._strokeWidth, alphaVal);
            }
            //linearly interpolate between the two stroke colors
            //var currStrokeColor = VecUtils.vecInterpolate(4, this._strokeColor, this._secondStrokeColor, t/numTraces);
            ctx.translate(disp[0],disp[1]);
            ctx.beginPath();
            if (drawStageWorldPts) {
                tempP = points[0].slice(0);
                tempP[0]+=stageWorldDeltaX; tempP[1]+=stageWorldDeltaY;
                p = MathUtils.transformAndDivideHomogeneousPoint(tempP, stageWorldToScreenMat);
            } else {
                p = points[0];
            }
            ctx.moveTo(p[0],p[1]);
            for (var i=0;i<numPoints;i++){
                if (drawStageWorldPts) {
                    tempP = points[i].slice(0);
                    tempP[0]+=stageWorldDeltaX; tempP[1]+=stageWorldDeltaY;
                    p = MathUtils.transformAndDivideHomogeneousPoint(tempP, stageWorldToScreenMat);
                } else {
                    p = points[i];
                }
                ctx.lineTo(p[0],p[1]);
            }
            ctx.stroke();
            ctx.restore();
        }
    } else {
        ctx.globalCompositeOperation = 'lighter'; //we wish to add up the colors
        ctx.globalAlpha = this._strokeColor[3];
        ctx.lineCap = "round";
        ctx.lineJoin="round";
        var minStrokeWidth = (this._strokeHardness*this._strokeWidth)/100; //the hardness is the percentage of the stroke width that's fully opaque
        var numlayers = 1 + Math.ceil((this._strokeWidth-minStrokeWidth)*0.5);
        var alphaVal = 1.0/(numlayers); //this way the alpha at the first path will be 1

        if (!useBuildColor){
            ctx.strokeStyle="rgba("+parseInt(255*this._strokeColor[0])+","+parseInt(255*this._strokeColor[1])+","+parseInt(255*this._strokeColor[2])+","+alphaVal+")";
        } else {
            ctx.strokeStyle = this.buildColor(ctx, this._strokeColor, w,h, this._strokeWidth, alphaVal);
        }

        for (var l=0;l<numlayers;l++){
            ctx.beginPath();
            if (drawStageWorldPts) {
                tempP = points[0].slice(0);
                tempP[0]+=stageWorldDeltaX; tempP[1]+=stageWorldDeltaY;
                p = MathUtils.transformAndDivideHomogeneousPoint(tempP, stageWorldToScreenMat);
            } else {
                p = points[0];
            }
            ctx.moveTo(p[0],p[1]);
            if (numPoints===1){
                //display a tiny segment as a single point
               ctx.lineTo(p[0],p[1]+0.01);
            }
            for (var i=1;i<numPoints;i++){
                if (drawStageWorldPts) {
                    tempP = points[i].slice(0);
                    tempP[0]+=stageWorldDeltaX; tempP[1]+=stageWorldDeltaY;
                    p = MathUtils.transformAndDivideHomogeneousPoint(tempP, stageWorldToScreenMat);
                } else {
                    p = points[i];
                }
                ctx.lineTo(p[0],p[1]);
            }
            ctx.lineWidth=2*l+minStrokeWidth;


            //experiments with shadows
            /*
            ctx.shadowOffsetX = 10;
            ctx.shadowOffsetY = 10;
            ctx.shadowBlur    = 10;
            ctx.shadowColor   = //"rgb("+parseInt(255*this._strokeColor[0])+","+parseInt(255*this._strokeColor[1])+","+parseInt(255*this._strokeColor[2])+")";
                "#FF6666";  //or use rgb(red, green, blue)
             */
            ctx.stroke();
        }//for every layer l
    } //if there is no calligraphic stroke
}; //this.drawToCanvas()


BrushStroke.prototype.exportJSON = function(){
    var retObject= new Object();
    //the type of this object
    retObject.type = this.geomType();
    retObject.geomType = retObject.type;

    //the geometry for this object
    retObject.localPoints = this._LocalPoints.slice(0);
    this._copyCoordinates3D(this._LocalPoints, retObject.localPoints); //todo is this necessary in addition to the slice(0) above?
    retObject.origLocalPoints = this._OrigLocalPoints.slice(0);
    this._copyCoordinates3D(this._OrigLocalPoints, retObject.origLocalPoints); //todo <ditto>

    retObject.stageWorldCenter = [this._stageWorldCenter[0],this._stageWorldCenter[1],this._stageWorldCenter[2]];
    retObject.planeMat = this._planeMat;
    retObject.planeMatInv = this._planeMatInv;
    retObject.dragPlane = [this._dragPlane[0],this._dragPlane[1],this._dragPlane[2],this._dragPlane[3]];

    //stroke appearance properties
    retObject.strokeWidth = this._strokeWidth;
    retObject.strokeColor = this._strokeColor;
    retObject.strokeHardness = this._strokeHardness;
    retObject.strokeUseCalligraphic = this._strokeUseCalligraphic;
    retObject.strokeAngle = this._strokeAngle;

    //stroke smoothing properties
    retObject.strokeDoSmoothing = this._strokeDoSmoothing;
    retObject.strokeAmountSmoothing = this._strokeAmountSmoothing;

    return retObject;
};

BrushStroke.prototype.importJSON = function(jo){
    if (this.geomType()!== jo.geomType){
        return;
    }
    //the geometry for this object
    this._LocalPoints = jo.localPoints.slice(0);
    this._copyCoordinates3D(jo.localPoints, this._LocalPoints); //todo is this necessary in addition to the slice(0) above?
    this._OrigLocalPoints = jo.origLocalPoints.slice(0);
    this._copyCoordinates3D(jo.origLocalPoints, this._OrigLocalPoints); //todo <ditto>

    this._stageWorldCenter = [jo.stageWorldCenter[0],jo.stageWorldCenter[1],jo.stageWorldCenter[2]];
    this._planeMat = jo.planeMat;
    this._planeMatInv = jo.planeMatInv;
    this._dragPlane = [jo.dragPlane[0],jo.dragPlane[1],jo.dragPlane[2],jo.dragPlane[3]];

    //stroke appearance properties
    this._strokeWidth = jo.strokeWidth;
    this._strokeColor = jo.strokeColor;
    this._strokeHardness = jo.strokeHardness;
    this._strokeUseCalligraphic = jo.strokeUseCalligraphic;
    this._strokeAngle = jo.strokeAngle;

    //stroke smoothing properties
    this._strokeDoSmoothing = jo.strokeDoSmoothing;
    this._strokeAmountSmoothing = jo.strokeAmountSmoothing;

    this._isInit = true; //do not re-initialize this brush stroke
    this._isDirty = true;  //force a re-computation of meta-geometry before rendering
    this.update();      //after this, the stroke is ready to be rendered
};

BrushStroke.prototype.collidesWithPoint = function (x, y, z) {
    if (x < this._BBoxMin[0]) return false;
    if (x > this._BBoxMax[0]) return false;
    if (y < this._BBoxMin[1]) return false;
    if (y > this._BBoxMax[1]) return false;
    if (z < this._BBoxMin[2]) return false;
    if (z > this._BBoxMax[2]) return false;

    return true;
};

BrushStroke.prototype.collidesWithPoint = function (x, y) {
    if (x < this._BBoxMin[0]) return false;
    if (x > this._BBoxMax[0]) return false;
    if (y < this._BBoxMin[1]) return false;
    if (y > this._BBoxMax[1]) return false;

    return true;
};

BrushStroke.prototype._CatmullRomSplineInterpolate = function(ctrlPts, t)
{
    //perform CatmullRom interpolation on the spline...assume t is in [0,1]
    var t2 = t*t;
    var t3 = t2*t;
    var retPoint = [0,0,0];
    for (var i=0;i<3;i++){
        retPoint[i] = 0.5 *(
            (2*ctrlPts[1][i]) +
            (-ctrlPts[0][i] + ctrlPts[2][i]) * t +
            (2*ctrlPts[0][i] - 5*ctrlPts[1][i] + 4*ctrlPts[2][i] - ctrlPts[3][i]) * t2 +
            (-ctrlPts[0][i] + 3*ctrlPts[1][i]- 3*ctrlPts[2][i] + ctrlPts[3][i]) * t3);
    }
    return retPoint;
}
if (typeof exports === "object") {
    exports.BrushStroke = BrushStroke;
}
