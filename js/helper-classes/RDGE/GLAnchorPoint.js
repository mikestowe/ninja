/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/////////////////////////////////////////////
// Class GLAnchorPoint
//      GL representation of a point clicked 
//          and dragged during pen tool
//      
//    
/////////////////////////////////////////////
function GLAnchorPoint() {
    /////////////////////////////////////////
    // Instance variables 
    /////////////////////////////////////////
    this._x = 0.0;
    this._y = 0.0;
    this._z = 0.0;

    this._prevX = 0.0;
    this._prevY = 0.0;
    this._prevZ = 0.0;

    this._nextX = 0.0;
    this._nextY = 0.0;
    this._nextZ = 0.0;

    // *********** setters ************
    this.setPos = function (x, y, z) { this._x = x; this._y = y; this._z = z; }
    this.setPrevPos = function (x, y, z) { this._prevX = x; this._prevY = y; this._prevZ = z; }
    this.setNextPos = function (x, y, z) { this._nextX = x; this._nextY = y; this._nextZ = z; }

    this.setPrevFromNext = function () {
        //set the previous control point by reflecting the next control point
        var dispX = this._nextX - this._x;
        var dispY = this._nextY - this._y;
        var dispZ = this._nextZ - this._z;

        this._prevX = this._x - dispX;
        this._prevY = this._y - dispY;
        this._prevZ = this._z - dispZ;
    }
    this.setNextFromPrev = function () {
        //set the previous control point by reflecting the next control point
        var dispX = this._prevX - this._x;
        var dispY = this._prevY - this._y;
        var dispZ = this._prevZ - this._z;

        this._nextX = this._x - dispX;
        this._nextY = this._y - dispY;
        this._nextZ = this._z - dispZ;
    }

    //translate the next point from the translation that was applied to the prev. point
    this.translateNextFromPrev = function (tx, ty, tz) {
        // *** compute the rotation of the prev vector ***
        var oldP = Vector.create([this._prevX + tx - this._x, this._prevY + ty - this._y, this._prevZ + tz - this._z]);
        var newP = Vector.create([this._prevX - this._x, this._prevY - this._y, this._prevZ - this._z]);
        //compute angle between the two vectors
        var axis = Vector.create([0, 0, 0]);
        var angle = MathUtils.getAxisAngleBetween3DVectors(oldP, newP, axis);
        if (angle === 0)
            return;

        // *** compute the vector from anchor to next
        var oldN = Vector.create([this._nextX - this._x, this._nextY - this._y, this._nextZ - this._z]);
        var rotMat = Matrix.Rotation(-angle, axis);
        var newN = MathUtils.transformVector(oldN, rotMat);

        //TEMP for some situations the axis angle computation returns NaNs
        if (isNaN(newN[0]) || isNaN(newN[1]) || isNaN(newN[2])) {
            return;
        }
        //end TEMP
        this._nextX = this._x + newN[0];
        this._nextY = this._y + newN[1];
        this._nextZ = this._z + newN[2];
    }
    //translate the next point from the translation that was applied to the prev. point
    this.translatePrevFromNext = function (tx, ty, tz) {
        // *** compute the rotation of the next vector ***
        var oldN = Vector.create([this._nextX + tx - this._x, this._nextY + ty - this._y, this._nextZ + tz - this._z]);
        var newN = Vector.create([this._nextX - this._x, this._nextY - this._y, this._nextZ - this._z]);
        //compute angle between the two vectors
        var axis = Vector.create([0, 0, 0]);
        var angle = MathUtils.getAxisAngleBetween3DVectors(oldN, newN, axis);
        if (angle === 0)
            return;

        // *** compute the vector from anchor to prev
        var oldP = Vector.create([this._prevX - this._x, this._prevY - this._y, this._prevZ - this._z]);
        var rotMat = Matrix.Rotation(-angle, axis);
        var newP = MathUtils.transformVector(oldP, rotMat);

        //TEMP for some situations the axis angle computation returns NaNs
        if (isNaN(newP[0]) || isNaN(newP[1]) || isNaN(newP[2])) {
            return;
        }
        //end TEMP
        this._prevX = this._x + newP[0];
        this._prevY = this._y + newP[1];
        this._prevZ = this._z + newP[2];
    }


    // ******* modifiers *******
    this.translatePrev = function (x, y, z) {
        this._prevX += x; this._prevY += y; this._prevZ += z; 
    }
    this.translateNext = function (x, y, z) {
        this._nextX += x; this._nextY += y; this._nextZ += z;
    }
    this.translate = function (x, y, z) {
        this._x += x; this._y += y; this._z += z;
    }
    this.translateAll = function (x, y, z) {
        this.translate(x, y, z);
        this.translatePrev(x, y, z);
        this.translateNext(x, y, z);
    }
    
    
    // ********* getters **********
    this.getPosX = function () { return this._x; }
    this.getPosY = function () { return this._y; }
    this.getPosZ = function () { return this._z; }
    this.getPrevX = function () { return this._prevX; }
    this.getPrevY = function () { return this._prevY; }
    this.getPrevZ = function () { return this._prevZ; }
    this.getNextX = function () { return this._nextX; }
    this.getNextY = function () { return this._nextY; }
    this.getNextZ = function () { return this._nextZ; }
    this.getPos = function() { return Vector.create([this._x, this._y, this._z]);}
    this.getPrev = function() { return Vector.create([this._prevX, this._prevY, this._prevZ]);}
    this.getNext = function() { return Vector.create([this._nextX, this._nextY, this._nextZ]);}
    //return the square of distance from passed in point to the anchor position
    this.getDistanceSq = function (x, y, z) {
        return (this._x - x) * (this._x - x) + (this._y - y) * (this._y - y) + (this._z - z) * (this._z - z);
    }
    //return sq. of distance to prev. 
    this.getPrevDistanceSq = function (x, y, z) {
        return (this._prevX - x) * (this._prevX - x) + (this._prevY - y) * (this._prevY - y) + (this._prevZ - z) * (this._prevZ - z);
    }
    //return sq. of distance to next 
    this.getNextDistanceSq = function (x, y, z) {
        return (this._nextX - x) * (this._nextX - x) + (this._nextY - y) * (this._nextY - y) + (this._nextZ - z) * (this._nextZ - z);
    }
}
