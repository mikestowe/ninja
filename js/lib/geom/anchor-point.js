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

/////////////////////////////////////////////
// Class GLAnchorPoint
//      GL representation of a point clicked
//          and dragged during pen tool
//
//
/////////////////////////////////////////////
var GLAnchorPoint = function GLAnchorPoint() {
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
};
    // *********** setters ************
GLAnchorPoint.prototype.setPos = function (x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
};

GLAnchorPoint.prototype.setPrevPos = function (x, y, z) {
    this._prevX = x;
    this._prevY = y;
    this._prevZ = z;
};

GLAnchorPoint.prototype.setNextPos = function (x, y, z) {
    this._nextX = x;
    this._nextY = y;
    this._nextZ = z;
};

GLAnchorPoint.prototype.setPrevFromNext = function () {
    //set the previous control point by reflecting the next control point
    var dispX = this._nextX - this._x;
    var dispY = this._nextY - this._y;
    var dispZ = this._nextZ - this._z;

    this._prevX = this._x - dispX;
    this._prevY = this._y - dispY;
    this._prevZ = this._z - dispZ;
};

GLAnchorPoint.prototype.setNextFromPrev = function () {
    //set the previous control point by reflecting the next control point
    var dispX = this._prevX - this._x;
    var dispY = this._prevY - this._y;
    var dispZ = this._prevZ - this._z;

    this._nextX = this._x - dispX;
    this._nextY = this._y - dispY;
    this._nextZ = this._z - dispZ;
};

//translate the next point from the translation that was applied to the prev. point
GLAnchorPoint.prototype.translateNextFromPrev = function (tx, ty, tz) {
    //do nothing if the total translation is zero
    var totalTransSq = (tx*tx) + (ty*ty) + (tz*tz);
    if (totalTransSq < 0.0000001) {
        return;
    }

    // *** compute the rotation of the prev vector ***
    var oldP = [this._prevX + tx - this._x, this._prevY + ty - this._y, this._prevZ + tz - this._z];
    var newP = [this._prevX - this._x, this._prevY - this._y, this._prevZ - this._z];
    //compute angle between the two vectors
    var axis = [0, 0, 0];
    var angle = MathUtils.getAxisAngleBetween3DVectors(oldP, newP, axis);
    if (angle === 0) {
        return;
    }

    // *** compute the vector from anchor to next
    var oldN = [this._nextX - this._x, this._nextY - this._y, this._nextZ - this._z];
    var rotMat = Matrix.Rotation(-angle, axis);
    var newN = MathUtils.transformVector(oldN, rotMat);

    //TEMP for some situations the axis angle computation returns NaNs
    if (isNaN(newN[0]) || isNaN(newN[1]) || isNaN(newN[2])) {
        console.log("NaN in translateNextFromPrev");
        return;
    }
    //end TEMP
    this._nextX = this._x + newN[0];
    this._nextY = this._y + newN[1];
    this._nextZ = this._z + newN[2];
};

//translate the next point from the translation that was applied to the prev. point
GLAnchorPoint.prototype.translatePrevFromNext = function (tx, ty, tz) {
    //do nothing if the total translation is zero
    var totalTransSq = (tx*tx) + (ty*ty) + (tz*tz);
    if (totalTransSq < 0.0000001) {
        return;
    }

    // *** compute the rotation of the next vector ***
    var oldN = [this._nextX + tx - this._x, this._nextY + ty - this._y, this._nextZ + tz - this._z];
    var newN = [this._nextX - this._x, this._nextY - this._y, this._nextZ - this._z];
    //compute angle between the two vectors
    var axis = [0, 0, 0];
    var angle = MathUtils.getAxisAngleBetween3DVectors(oldN, newN, axis);
    if (angle === 0) {
        return;
    }

    // *** compute the vector from anchor to prev
    var oldP = [this._prevX - this._x, this._prevY - this._y, this._prevZ - this._z];
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
};

// ******* modifiers *******
GLAnchorPoint.prototype.translatePrev = function (x, y, z) {
    this._prevX += x;
    this._prevY += y;
    this._prevZ += z;
};

GLAnchorPoint.prototype.translateNext = function (x, y, z) {
    this._nextX += x;
    this._nextY += y;
    this._nextZ += z;
};

GLAnchorPoint.prototype.translate = function (x, y, z) {
    this._x += x;
    this._y += y;
    this._z += z;
};

GLAnchorPoint.prototype.translateAll = function (x, y, z) {
    this.translate(x, y, z);
    this.translatePrev(x, y, z);
    this.translateNext(x, y, z);
};

GLAnchorPoint.prototype.scaleAll = function(sx,sy,sz){
    this._x *= sx;
    this._prevX *= sx;
    this._nextX *= sx;
    this._y *= sy;
    this._prevY *= sy;
    this._nextY *= sy;
    this._z *= sz;
    this._prevZ *= sz;
    this._nextZ *= sz;
};

// ********* getters **********
GLAnchorPoint.prototype.getPosX = function () {
    return this._x;
};

GLAnchorPoint.prototype.getPosY = function () {
    return this._y;
};

GLAnchorPoint.prototype.getPosZ = function () {
    return this._z;
};

GLAnchorPoint.prototype.getPrevX = function () {
    return this._prevX;
};

GLAnchorPoint.prototype.getPrevY = function () {
    return this._prevY;
};

GLAnchorPoint.prototype.getPrevZ = function () {
    return this._prevZ;
};

GLAnchorPoint.prototype.getNextX = function () {
    return this._nextX;
};

GLAnchorPoint.prototype.getNextY = function () {
    return this._nextY;
};

GLAnchorPoint.prototype.getNextZ = function () {
    return this._nextZ;
};

GLAnchorPoint.prototype.getPos = function() {
    return [this._x, this._y, this._z];
};

GLAnchorPoint.prototype.getPrev = function() {
    return [this._prevX, this._prevY, this._prevZ];
};

GLAnchorPoint.prototype.getNext = function() {
    return [this._nextX, this._nextY, this._nextZ];
};

GLAnchorPoint.prototype.getAllPos = function() {
    return [[this._prevX, this._prevY, this._prevZ],[this._x, this._y, this._z],[this._nextX, this._nextY, this._nextZ]];
};

//return the square of distance from passed in point to the anchor position
GLAnchorPoint.prototype.getDistanceSq = function (x, y, z) {
    return (this._x - x) * (this._x - x) + (this._y - y) * (this._y - y) + (this._z - z) * (this._z - z);
};

//return sq. of distance to prev.
GLAnchorPoint.prototype.getPrevDistanceSq = function (x, y, z) {
    return (this._prevX - x) * (this._prevX - x) + (this._prevY - y) * (this._prevY - y) + (this._prevZ - z) * (this._prevZ - z);
};

//return sq. of distance to next
GLAnchorPoint.prototype.getNextDistanceSq = function (x, y, z) {
    return (this._nextX - x) * (this._nextX - x) + (this._nextY - y) * (this._nextY - y) + (this._nextZ - z) * (this._nextZ - z);
};

if (typeof exports === "object") {
    exports.AnchorPoint = GLAnchorPoint;
}

