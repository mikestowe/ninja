/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

// Todo: This entire class should be converted to a module
var VecUtils = require("js/helper-classes/3D/vec-utils").VecUtils;

///////////////////////////////////////////////////////////////////////
// Class GLBrushStroke
//      representation a sequence points (polyline) created by brush tool.
//      Derived from class GLGeomObj
///////////////////////////////////////////////////////////////////////
function GLBrushStroke() {
    ///////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////
    this._Points = [];
    this._BBoxMin = [0, 0, 0];
    this._BBoxMax = [0, 0, 0];
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

    //the wetness of the brush (currently this is multiplied to the square of the stroke width, but todo should be changed
    this._WETNESS_FACTOR = 0.010625;//0.0625;

    //drawing context
    this._world = null;

    //tool that owns this brushstroke
    this._drawingTool = null;
    this._planeMat = null;
    this._planeMatInv = null;
    this._planeCenter = null;

    // initialize the inherited members
    this.inheritedFrom = GLGeomObj;
    this.inheritedFrom();

    /////////////////////////////////////////////////////////
    // Property Accessors/Setters
    /////////////////////////////////////////////////////////
    this.setWorld = function (world) { this._world = world; }
    this.getWorld = function () { return this._world; }
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
        

    this.getNumPoints = function () { return this._Points.length; }
    this.getPoint = function (index) { return this._Points[index]; }
    this.addPoint = function (pt)
    {
        //add the point only if it is some epsilon away from the previous point
        var numPoints = this._Points.length;
        if (numPoints>0) {
            var threshold = this._WETNESS_FACTOR*this._strokeWidth*this._strokeWidth;
            var prevPt = this._Points[numPoints-1];
            var diffPt = [prevPt[0]-pt[0], prevPt[1]-pt[1]];
            var diffPtMag = diffPt[0]*diffPt[0] + diffPt[1]*diffPt[1];
            if (diffPtMag>threshold){
                this._Points.push(pt);
                this._dirty=true;
            }
        }else{
            this._Points.push(pt);
            this._dirty=true;
        }
    }
    
    this.insertPoint = function(pt, index){ this._Points.splice(index, 0, pt); this._dirty=true;}
    this.isDirty = function(){return this._dirty;}
    this.makeDirty = function(){this._dirty=true;}

    this.getBBoxMin = function () { return this._BBoxMin; }
    this.getBBoxMax = function () { return this._BBoxMax; }

    this.getStrokeWidth = function () { return this._strokeWidth; }
    this.setStrokeWidth = function (w) { this._strokeWidth = w; this._dirty=true;}
    this.getStrokeMaterial = function () { return this._strokeMaterial; }
    this.setStrokeMaterial = function (m) { this._strokeMaterial = m; }
    this.getStrokeColor = function () { return this._strokeColor; }
    this.setStrokeColor = function (c) { this._strokeColor = c; }
    this.getStrokeStyle = function () { return this._strokeStyle; }
    this.setStrokeStyle = function (s) { this._strokeStyle = s; }

    this.setWidth = function () { }//NO-OP for now
    this.setHeight = function () {}//NO-OP for now


    //remove and return anchor at specified index, return null on error
    this.removePoint = function (index) {
        var retAnchor = null;
        if (index < this._Points.length) {
            retPt = this._Points.splice(index, 1);
            this._dirty=true;
        }
        return retPoint;
    }

    //remove all the points
    this.clear = function () { this._Points = []; this._dirty=true;}

    this.translate = function (tx, ty, tz) {
        for (var i=0;i<this._Points.length;i++){
            this._Points[i][0]+=tx;
            this._Points[i][1]+=ty;
            this._Points[i][2]+=tz;
        }
    }

    this.computeMetaGeometry = function(){
        if (this._dirty){
            var numPoints = this._Points.length;

            //**** add samples to the path if needed...linear interpolation for now
            if (numPoints>1) {
                var threshold = this._WETNESS_FACTOR*this._strokeWidth*this._strokeWidth;
                var prevPt = this._Points[0];
                var prevIndex = 0;
                for (var i=1;i<numPoints;i++){
                    var pt = this._Points[i];
                    var diff = [pt[0]-prevPt[0], pt[1]-prevPt[1]];
                    var distance = Math.sqrt(diff[0]*diff[0]+diff[1]*diff[1]);
                    if (distance>threshold){
                        //insert points along the prev. to current point
                        var numNewPoints = Math.floor(distance/threshold);
                        for (var j=0;j<numNewPoints;j++){
                            var param = (j+1)/(numNewPoints+1);
                            var newpt = [prevPt[0]+ diff[0]*param, prevPt[1]+ diff[1]*param];
                            //insert new point before point i
                            this._Points.splice(i, 0, [newpt[0], newpt[1], 0]);
                            i++;
                        }
                        this._dirty=true;
                    }
                    prevPt=pt;
                    //update numPoints to match the new length
                    numPoints = this._Points.length;
                }
            }

            // *** compute the bounding box *********
            this._BBoxMin = [Infinity, Infinity, Infinity];
            this._BBoxMax = [-Infinity, -Infinity, -Infinity];
            numPoints = this._Points.length;
            if (numPoints === 0) {
                this._BBoxMin = [0, 0, 0];
                this._BBoxMax = [0, 0, 0];
            } else {
                for (var i=0;i<numPoints;i++){
                    var pt = this._Points[i];
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
             //increase the bbox given the stroke width
            for (var d = 0; d < 3; d++) {
                this._BBoxMin[d]-= this._strokeWidth/2;
                this._BBoxMax[d]+= this._strokeWidth/2;
            }//for every dimension d from 0 to 2
        }
        this._dirty = false;
    }

    this.buildBuffers = function () {
        return; //no need to do anything for now
    }//buildBuffers()

    //render
    //  specify how to render the subpath in Canvas2D
    this.render = function () {
        // get the world
        var world = this.getWorld();
        if (!world)  throw( "null world in brushstroke render" );

         // get the context
        var ctx = world.get2DContext();
        if (!ctx)  throw ("null context in brushstroke render")

        var numPoints = this.getNumPoints();
        if (numPoints === 0)
            return; //nothing to do for empty paths

        ctx.save();

        this.computeMetaGeometry();
        var bboxMin = this.getBBoxMin();
        var bboxMax = this.getBBoxMax();
        var bboxWidth = bboxMax[0] - bboxMin[0];
        var bboxHeight = bboxMax[1] - bboxMin[1];
        ctx.clearRect(0, 0, bboxWidth, bboxHeight);

        /*
        ctx.lineWidth = this._strokeWidth;
        ctx.strokeStyle = "black";
        if (this._strokeColor)
            ctx.strokeStyle = MathUtils.colorToHex( this._strokeColor );
        ctx.fillStyle = "blue";
        if (this._fillColor)
            ctx.fillStyle = MathUtils.colorToHex( this._fillColor );
        var lineCap = ['butt','round','square'];
        ctx.lineCap = lineCap[1];
        ctx.beginPath();
        var firstPoint = this._Points[0];
        ctx.moveTo(firstPoint[0]-bboxMin[0], firstPoint[1]-bboxMin[1]);
        for (var i = 1; i < numPoints; i++) {
            var pt = this._Points[i];
            ctx.lineTo(pt[0]-bboxMin[0], pt[1]-bboxMin[1]);
        }
        ctx.stroke();
        */

        /*
        var isDebug = false;
        var prevPt = this._Points[0];
        var prevX = prevPt[0]-bboxMin[0];
        var prevY = prevPt[1]-bboxMin[1];
        prevPt = [prevX,prevY];
        for (var i = 1; i < numPoints; i++) {
            var pt = this._Points[i];
            ctx.globalCompositeOperation = 'source-over';
            var x = pt[0]-bboxMin[0];
            var y = pt[1]-bboxMin[1];
            pt = [x,y];

            //vector from prev to current pt
            var seg = VecUtils.vecSubtract(2, pt, prevPt);
            var segDir = VecUtils.vecNormalize(2, seg, 1.0);

            var segMidPt = VecUtils.vecInterpolate(2, pt, prevPt, 0.5);
            var w2 = this._strokeWidth*0.5;
            var segDirOrtho = [w2*segDir[1], -w2*segDir[0]];
            
            //add half the strokewidth to the segMidPt
            var lgStart = VecUtils.vecAdd(2, segMidPt, segDirOrtho);
            var lgEnd = VecUtils.vecSubtract(2, segMidPt, segDirOrtho);

            ctx.save();
            ctx.beginPath();

            if (isDebug) {
                ctx.strokeStyle="black";
                ctx.lineWidth = 1;

                ctx.moveTo(lgStart[0], lgStart[1]);
                ctx.lineTo(lgEnd[0], lgEnd[1]);
                ctx.stroke();
            }

            var lg = ctx.createLinearGradient(lgStart[0], lgStart[1], lgEnd[0], lgEnd[1]);
            lg.addColorStop(1, 'rgba(0,0,0,0.0)');
            lg.addColorStop(0.5,'rgba(255,0,0,1.0)');
            lg.addColorStop(0, 'rgba(0,0,0,0.0)');
            ctx.fillStyle = lg;

            if (isDebug){
                ctx.strokeStyle="blue";
                ctx.lineWidth=0.5;
            }
            ctx.moveTo(prevX-w2, prevY);
            ctx.lineTo(prevX+w2, prevY);
            ctx.lineTo(x+w2, y);
            ctx.lineTo(x-w2, y);
            ctx.lineTo(prevX-w2, prevY);
            ctx.fill();
            ctx.closePath();

            ctx.restore();

            prevPt = pt;
            prevX = x;
            prevY = y;
        }
        

        if (isDebug)
            ctx.stroke();

        if (isDebug){
            //draw the skeleton of this stroke
            ctx.lineWidth = 1;
            ctx.strokeStyle = "black";
            var pt = this._Points[0];
            ctx.beginPath();
            ctx.moveTo(pt[0]-bboxMin[0],pt[1]-bboxMin[1]);
            for (var i = 1; i < numPoints; i++) {
                pt = this._Points[i];
                var x = pt[0]-bboxMin[0];
                var y = pt[1]-bboxMin[1];
                ctx.lineTo(x,y);
            }
            ctx.stroke();
        }
        */


        var R2 = this._strokeWidth;
        var R = R2*0.5;
        var hardness = 0.25; //for a pencil, this is always 1 //TODO get hardness parameter from user interface
        var innerRadius = (hardness*R)-1;
        if (innerRadius<1)
            innerRadius=1;

        var r = ctx.createRadialGradient(0,0,innerRadius, 0,0,R);
        //r.addColorStop(0, 'rgba(255,0,0,0.5)');
        var midColor = "rgba("+parseInt(255*this._strokeColor[0])+","+parseInt(255*this._strokeColor[1])+","+parseInt(255*this._strokeColor[2])+",0.5)";
        r.addColorStop(0, midColor);
        //r.addColorStop(0.5, 'rgba(255,0,0,0.5)'); // prevent aggregation of semi-opaque pixels
        //r.addColorStop(1, 'rgba(255,0,0,0.0)');
        var endColor = "rgba("+parseInt(255*this._strokeColor[0])+","+parseInt(255*this._strokeColor[1])+","+parseInt(255*this._strokeColor[2])+",0.0)";
        r.addColorStop(1, endColor);
        ctx.fillStyle = r;

        for (var i = 0; i < numPoints; i++) {
            var pt = this._Points[i];
            ctx.globalCompositeOperation = 'source-over';
            var x = pt[0]-bboxMin[0];
            var y = pt[1]-bboxMin[1];
            ctx.save();
            ctx.translate(x,y);
            ctx.arc(0, 0, R, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.restore();
            //ctx.globalCompositeOperation = 'source-in';
            //ctx.rect(x-R, y-R, R2, R2);
        }

        ctx.restore();
    } //render()


    this.export = function()
    {
        var rtnStr = "type: " + this.geomType() + "\n";
        return rtnStr;
    }

    this.import = function( importStr )
    {
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