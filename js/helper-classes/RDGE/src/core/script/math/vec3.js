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


/**
 * RDGE.vec3 = {}
 * This library contains functions for operating on 3D vectors. Any JS array 
 * containing at least 3 numeric components can represent a 3D vector. 
 *
 * For example, all of these are valid RDGE.vec3 declarations:
 *		var a = [0, 0, 1];
 *		var b = RDGE.vec3.zero();
 *		var c = RDGE.vec3.up();
 *
 */
var RDGE = RDGE || {};
RDGE.vec3 = {};

/**
* RDGE.vec3.string
*/
RDGE.vec3.string = function (v) {
    return "{ " + v[0] + ", " + v[1] + ", " + v[2] + " }";
};

/**
 * RDGE.vec3.verify
 * This function is provided for debugging purposes only. It is not recommended 
 * to be used in performance critical areas of the code.
 */
RDGE.vec3.verify = function (v) {
    if (v == undefined || v.length == undefined || v.length < 3) {
        return false;
    }
    if (typeof (v[0]) != "number" || typeof (v[1]) != "number" || typeof (v[2]) != "number") {
        return false;
    }
    return true;
};

/**
* RDGE.vec3.inplace_copy
*/
RDGE.vec3.inplace_copy = function (dst, src) {
    dst[0] = src[0];
    dst[1] = src[1];
    dst[2] = src[2];
};

/**
* RDGE.vec3.copy
*/
RDGE.vec3.copy = function (v) {
    if (v.length == undefined) {
        return [v, v, v];
    }

    return [v[0], v[1], v[2]];
};

/**
* RDGE.vec3.translation
* description : returns a vector containing the translation vector of m.
*/
RDGE.vec3.translation = function (m) {
    return [m[12], m[13], m[14]];
};

/**
* RDGE.vec3.basisX = function( m ) 
* description : returns a vector containing the translation vector of m.
*/
RDGE.vec3.basisX = function (m) {
    return [m[0], m[1], m[2]];
};

/**
* RDGE.vec3.basisY = function( m ) 
* description : returns a vector containing the translation vector of m.
*/
RDGE.vec3.basisY = function (m) {
    return [m[4], m[5], m[6]];
};

/**
* RDGE.vec3.basisZ = function( m ) 
* description : returns a vector containing the translation vector of m.
*/
RDGE.vec3.basisZ = function (m) {
    return [m[8], m[9], m[10]];
};

/**
* RDGE.vec3.zero
*/
RDGE.vec3.zero = function () {
    return [0.0, 0.0, 0.0];
};

/**
* RDGE.vec3.up
*/
RDGE.vec3.up = function () {
    return [0.0, 1.0, 0.0];
};

/**
* RDGE.vec3.forward
*/
RDGE.vec3.forward = function () {
    return [0.0, 0.0, 1.0];
};

/**
* RDGE.vec3.right
*/
RDGE.vec3.right = function () {
    return [1.0, 0.0, 0.0];
};

/**
* RDGE.vec3.random
*/
RDGE.vec3.random = function (min, max) {
    return [min[0] + (max[0] - min[0]) * Math.random(),
             min[1] + (max[1] - min[1]) * Math.random(),
             min[2] + (max[2] - min[2]) * Math.random()];
};

/**
* RDGE.vec3.xy 
*/
RDGE.vec3.xy = function (v) {
    return [v[0], v[1]];
};

/**
* RDGE.vec3.xz 
*/
RDGE.vec3.xz = function (v) {
    return [v[0], v[2]];
};

/**
* RDGE.vec3.add
*/
RDGE.vec3.add = function (a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
};

RDGE.vec3.plusEqual = function (a, b) {

    a[0] += b[0];
    a[1] += b[1];
    a[2] += b[2];
};

/**
* RDGE.vec3.sub
*/
RDGE.vec3.sub = function (a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
};

/**
* RDGE.vec3.mul
*/
RDGE.vec3.mul = function (a, b) {
    return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
};

/**
* RDGE.vec3.addMul
*/
RDGE.vec3.addMul = function (a, b, s) {
    if (s.length != undefined && s.length >= 3) {
        return [a[0] + b[0] * s[0], a[1] + b[1] * s[1], a[2] + b[2] * s[2]];
    } else {
        return [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
    }
};

RDGE.vec3.plusEqualMul = function (a, b, s) {

    if (s.length !== undefined && s.length >= 3) {
        a[0] += b[0] * s[0];
        a[1] += b[1] * s[1];
        a[2] += b[2] * s[2];
    }
    else {
        a[0] += b[0] * s;
        a[1] += b[1] * s;
        a[2] += b[2] * s;
    }
};

/**
* RDGE.vec3.scale 
*/
RDGE.vec3.scale = function (v, s) {
    if (s.length !== undefined && s.length >= 3) {
        return [v[0] * s[0], v[1] * s[1], v[2] * s[2]];
    } else {
        return [v[0] * s, v[1] * s, v[2] * s];
    }
};

RDGE.vec3.inplace_scale = function (v, s) {
    if (s.length !== undefined && s.length >= 3) {
        v[0] *= s[0], v[1] *= s[1], v[2] *= s[2];
    } else {
        v[0] *= s, v[1] *= s, v[2] *= s;
    }
};

/**
* RDGE.vec3.negate
*/
RDGE.vec3.negate = function (v) {
    return [-v[0], -v[1], -v[2]];
};

RDGE.vec3.inplace_negate = function (v) {
    v[0] = -v[0], v[1] = -v[1], v[2] = -v[2];
};

/**
* RDGE.vec3.normalize
*/
RDGE.vec3.normalize = function (v) {
    var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (Math.abs(1.0 - l) > 0.0001) {
        var ool = 1.0 / l;
        return [v[0] * ool, v[1] * ool, v[2] * ool];
    }
    return v;
};

/**
* RDGE.vec3.cross 
*/
RDGE.vec3.cross = function (a, b) {
    return [a[1] * b[2] - b[1] * a[2],
				a[2] * b[0] - b[2] * a[0],
				a[0] * b[1] - b[0] * a[1]];
};

/**
* RDGE.vec3.dot 
*/
RDGE.vec3.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
* RDGE.vec3.lengthSq
*/
RDGE.vec3.lengthSq = function (v) {
    return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
};

/**
* RDGE.vec3.length
*/
RDGE.vec3.length = function (v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
};

/**
* RDGE.vec3.distanceSq
*/
RDGE.vec3.distanceSq = function (a, b) {
    var diff = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    return diff[0] * diff[0] + diff[1] * diff[1] + diff[2] * diff[2];
};

/**
* RDGE.vec3.distance
*/
RDGE.vec3.distance = function (a, b) {
    var diff = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1] + diff[2] * diff[2]);
};

/**
* RDGE.vec3.angle
*/
RDGE.vec3.angle = function (a, b) {
    // return angle in radians.
    return Math.acos(RDGE.vec3.dot(a, b)) / (RDGE.vec3.length(a) * RDGE.vec3.length(b));
};

/**
* RDGE.vec3.direction
*/
RDGE.vec3.direction = function (from, to) {
    return RDGE.vec3.normalize(RDGE.vec3.sub(to, from));
};

/**
* RDGE.vec3.abs
*/
RDGE.vec3.abs = function (v) {
    return [Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2])];
};

/**
* RDGE.vec3.min
*/
RDGE.vec3.min = function (a, b) {
    return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2])];
};

/**
* RDGE.vec3.max
*/
RDGE.vec3.max = function (a, b) {
    return [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])];
};

/**
* RDGE.vec3.clamp
*/
RDGE.vec3.clamp = function (v, vmin, vmax) {
    return RDGE.vec3.min(vmax, RDGE.vec3.max(v, vmin));
};

/**
* RDGE.vec3.equal
*/
RDGE.vec3.equal = function (a, b, t) {
    if (!t) {
        t = 0.001;
    }
    return (RDGE.vec3.distanceSq(a, b) < (t * t));
};

/**
* RDGE.vec3.lerp
*/
RDGE.vec3.lerp = function (a, b, t) {
    return [
		a[0] + (b[0] - a[0]) * t,
		a[1] + (b[1] - a[1]) * t,
		a[2] + (b[2] - a[2]) * t
	];
};
