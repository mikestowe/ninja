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
}
    // *********** setters ************
GLAnchorPoint.prototype.setPos = function (x, y, z) { this._x = x; this._y = y; this._z = z; }
GLAnchorPoint.prototype.setPrevPos = function (x, y, z) { this._prevX = x; this._prevY = y; this._prevZ = z; }
GLAnchorPoint.prototype.setNextPos = function (x, y, z) { this._nextX = x; this._nextY = y; this._nextZ = z; }

GLAnchorPoint.prototype.setPrevFromNext = function () {
    //set the previous control point by reflecting the next control point
    var dispX = this._nextX - this._x;
    var dispY = this._nextY - this._y;
    var dispZ = this._nextZ - this._z;

    this._prevX = this._x - dispX;
    this._prevY = this._y - dispY;
    this._prevZ = this._z - dispZ;
}
GLAnchorPoint.prototype.setNextFromPrev = function () {
    //set the previous control point by reflecting the next control point
    var dispX = this._prevX - this._x;
    var dispY = this._prevY - this._y;
    var dispZ = this._prevZ - this._z;

    this._nextX = this._x - dispX;
    this._nextY = this._y - dispY;
    this._nextZ = this._z - dispZ;
}

//translate the next point from the translation that was applied to the prev. point
GLAnchorPoint.prototype.translateNextFromPrev = function (tx, ty, tz) {
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
GLAnchorPoint.prototype.translatePrevFromNext = function (tx, ty, tz) {
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
GLAnchorPoint.prototype.translatePrev = function (x, y, z) {
    this._prevX += x; this._prevY += y; this._prevZ += z;
}
GLAnchorPoint.prototype.translateNext = function (x, y, z) {
    this._nextX += x; this._nextY += y; this._nextZ += z;
}
GLAnchorPoint.prototype.translate = function (x, y, z) {
    this._x += x; this._y += y; this._z += z;
}
GLAnchorPoint.prototype.translateAll = function (x, y, z) {
    this.translate(x, y, z);
    this.translatePrev(x, y, z);
    this.translateNext(x, y, z);
}


// ********* getters **********
GLAnchorPoint.prototype.getPosX = function () { return this._x; }
GLAnchorPoint.prototype.getPosY = function () { return this._y; }
GLAnchorPoint.prototype.getPosZ = function () { return this._z; }
GLAnchorPoint.prototype.getPrevX = function () { return this._prevX; }
GLAnchorPoint.prototype.getPrevY = function () { return this._prevY; }
GLAnchorPoint.prototype.getPrevZ = function () { return this._prevZ; }
GLAnchorPoint.prototype.getNextX = function () { return this._nextX; }
GLAnchorPoint.prototype.getNextY = function () { return this._nextY; }
GLAnchorPoint.prototype.getNextZ = function () { return this._nextZ; }
GLAnchorPoint.prototype.getPos = function() { return Vector.create([this._x, this._y, this._z]);}
GLAnchorPoint.prototype.getPrev = function() { return Vector.create([this._prevX, this._prevY, this._prevZ]);}
GLAnchorPoint.prototype.getNext = function() { return Vector.create([this._nextX, this._nextY, this._nextZ]);}
//return the square of distance from passed in point to the anchor position
GLAnchorPoint.prototype.getDistanceSq = function (x, y, z) {
    return (this._x - x) * (this._x - x) + (this._y - y) * (this._y - y) + (this._z - z) * (this._z - z);
}
//return sq. of distance to prev.
GLAnchorPoint.prototype.getPrevDistanceSq = function (x, y, z) {
    return (this._prevX - x) * (this._prevX - x) + (this._prevY - y) * (this._prevY - y) + (this._prevZ - z) * (this._prevZ - z);
}
//return sq. of distance to next
GLAnchorPoint.prototype.getNextDistanceSq = function (x, y, z) {
    return (this._nextX - x) * (this._nextX - x) + (this._nextY - y) * (this._nextY - y) + (this._nextZ - z) * (this._nextZ - z);
}

