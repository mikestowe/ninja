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

// RDGE namespaces
var RDGE = RDGE || {};

RDGE.box = function () {
    this.MAX_VAL = 1e+38;
    this.min = [this.MAX_VAL, this.MAX_VAL, this.MAX_VAL];
    this.max = [-this.MAX_VAL, -this.MAX_VAL, -this.MAX_VAL];
};

RDGE.box.prototype.addBox = function (a) {
    this.min = RDGE.vec3.min(this.min, a.min);
    this.max = RDGE.vec3.max(this.max, a.max);
    //  this.min = RDGE.vec3.min( this.min, a.min );
    //  this.max = RDGE.vec3.max( this.max, a.max );
};

RDGE.box.prototype.addVec3 = function (a) {
    this.min = RDGE.vec3.min(this.min, a);
    this.max = RDGE.vec3.max(this.max, a);
};

RDGE.box.prototype.set = function (min, max) {
    this.min[0] = min[0];
    this.min[1] = min[1];
    this.min[2] = min[2];
    this.max[0] = max[0];
    this.max[1] = max[1];
    this.max[2] = max[2];
};

RDGE.box.prototype.reset = function () {
    this.min[0] = this.MAX_VAL;
    this.min[1] = this.MAX_VAL;
    this.min[2] = this.MAX_VAL;
    this.max[0] = -this.MAX_VAL;
    this.max[1] = -this.MAX_VAL;
    this.max[2] = -this.MAX_VAL;
};

RDGE.box.prototype.getCenter = function () {
    return [0.5 * (this.min[0] + this.max[0]), 0.5 * (this.min[1] + this.max[1]), 0.5 * (this.min[2] + this.max[2])];
};

RDGE.box.prototype.isVisible = function (frustum) {
    var center = this.getCenter();
    var radius = RDGE.vec3.distance(this.max, center);
    //  var diag = RDGE.vec3.sub( this.max, center );

    var i = 0;
    while (i < frustum.length) {
        var plane = frustum[i];
        var dist = RDGE.vec3.dot(plane, center) + plane[3];
        if (dist < -radius) {
            return false;
        }
        i++;
    }

    return true;
};

RDGE.box.prototype.isValid = function () {
    return !(this.min[0] > this.max[0] || this.min[1] > this.max[1] || this.min[2] > this.max[2]);
};

RDGE.box.prototype.transform = function (mat) {
    var out = new RDGE.box();
    var pts = [];
    pts.push([this.min[0], this.min[1], this.min[2]]);
    pts.push([this.min[0], this.max[1], this.min[2]]);
    pts.push([this.max[0], this.max[1], this.min[2]]);
    pts.push([this.max[0], this.min[1], this.min[2]]);
    pts.push([this.min[0], this.min[1], this.max[2]]);
    pts.push([this.min[0], this.max[1], this.max[2]]);
    pts.push([this.max[0], this.max[1], this.max[2]]);
    pts.push([this.max[0], this.min[1], this.max[2]]);

    var i = pts.length - 1;
    do {
        out.addVec3(RDGE.mat4.transformPoint(mat, pts[i]));
    } while (i--);

    return out;
};

/*
RDGE.box.prototype.transform = function(mat) {
    var newBox = new RDGE.box();
    var e, f;

    newBox.b[0] = mat[12]; newBox.b[1] = mat[13]; newBox.b[2] = mat[14];
    newBox.t[0] = mat[12]; newBox.t[1] = mat[13]; newBox.t[2] = mat[14];

    e = mat[0] * this.min[0]; f = mat[0] * this.max[0];
    newBox.b[0] += (e < f) ? e : f;
    newBox.t[0] += (e < f) ? f : e;

    e = mat[4] * this.min[1]; f = mat[4] * this.max[1];
    newBox.b[0] += (e < f) ? e : f;
    newBox.t[0] += (e < f) ? f : e;

    e = mat[8] * this.min[2]; f = mat[8] * this.max[2];
    newBox.b[0] += (e < f) ? e : f;
    newBox.t[0] += (e < f) ? f : e;

    e = mat[1] * this.min[0]; f = mat[1] * this.max[0];
    newBox.b[1] += (e < f) ? e : f;
    newBox.t[1] += (e < f) ? f : e;

    e = mat[5] * this.min[1]; f = mat[5] * this.max[1];
    newBox.b[1] += (e < f) ? e : f;
    newBox.t[1] += (e < f) ? f : e;

    e = mat[9] * this.min[2]; f = mat[9] * this.max[2];
    newBox.b[1] += (e < f) ? e : f;
    newBox.t[1] += (e < f) ? f : e;

    e = mat[2] * this.min[0]; f = mat[2] * this.max[0];
    newBox.b[2] += (e < f) ? e : f;
    newBox.t[2] += (e < f) ? f : e;

    e = mat[6] * this.min[1]; f = mat[6] * this.max[1];
    newBox.b[2] += (e < f) ? e : f;
    newBox.t[2] += (e < f) ? f : e;

    e = mat[10] * this.min[2]; f = mat[10] * this.max[2];
    newBox.b[2] += (e < f) ? e : f;
    newBox.t[2] += (e < f) ? f : e;

    return newBox;
};
*/
