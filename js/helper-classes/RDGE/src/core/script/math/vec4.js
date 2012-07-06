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
* RDGE.vec4 = {}
* This library contains functions for operating on 4D vectors. Any JS array
* containing at least 4 numeric components can represent a 4D vector.
*
* For example, all of these are valid RDGE.vec4 declarations:
*       var a = [0, 0, 0, 1];
*       var b = RDGE.RDGE.vec4.identity();
*       var c = RDGE.RDGE.vec4.zero();
*
*/
var RDGE = RDGE || {};
RDGE.vec4 = {};

/**
* RDGE.vec4.string
*/
RDGE.vec4.string = function (v) {
    return "{ " + v[0] + ", " + v[1] + ", " + v[2] + ", " + v[3] + " }";
};

/**
* RDGE.vec4.verify
*/
RDGE.vec4.verify = function (v) {
    if (v == undefined || v.length == undefined || v.length < 4) {
        return false;
    }

    if (typeof (v[0]) != "number" || typeof (v[1]) != "number" || typeof (v[2]) != "number" || typeof (v[3]) != "number") {
        return false;
    }

    return true;
};

/**
* RDGE.vec4.inplace_copy
*/
RDGE.vec4.inplace_copy = function (dst, src) {
    dst[0] = src[0];
    dst[1] = src[1];
    dst[2] = src[2];
    dst[3] = src[3];
};

/**
* RDGE.vec4.copy
*/
RDGE.vec4.copy = function (v) {
    if (v.length == undefined) {
        return [v, v, v, v];
    }

    if (v.length == 3) {
        return [v[0], v[1], v[2], 1.0];
    }

    return [v[0], v[1], v[2], v[3]];
};

/**
* RDGE.vec4.zero
*/
RDGE.vec4.zero = function () {
    return [0.0, 0.0, 0.0, 0.0];
};

/**
* RDGE.vec4.identity
*/
RDGE.vec4.identity = function () {
    return [0.0, 0.0, 0.0, 1.0];
};

/**
* RDGE.vec4.up
*/
RDGE.vec4.up = function () {
    return [0.0, 1.0, 0.0, 0.0];
};

/**
* RDGE.vec4.forward
*/
RDGE.vec4.forward = function () {
    return [0.0, 0.0, 1.0, 0.0];
};

/**
* RDGE.vec4.right
*/
RDGE.vec4.right = function () {
    return [1.0, 0.0, 0.0, 0.0];
};

/**
* RDGE.vec4.random
*/
RDGE.vec4.random = function (min, max) {
    return [min[0] + (max[0] - min[0]) * Math.random(),
             min[1] + (max[1] - min[1]) * Math.random(),
             min[2] + (max[2] - min[2]) * Math.random(),
             min[3] + (max[3] - min[3]) * Math.random()];
};

/**
* RDGE.vec4.add
*/
RDGE.vec4.add = function (a, b) {
    return [a[0] + b[0],
                a[1] + b[1],
                a[2] + b[2],
                a[3] + b[3]];
};

/**
* RDGE.vec4.sub
*/
RDGE.vec4.sub = function (a, b) {
    return [a[0] - b[0],
                a[1] - b[1],
                a[2] - b[2],
                a[3] - b[3]];
};

/**
* RDGE.vec4.mul
*/
RDGE.vec4.mul = function (a, b) {
    return [a[0] * b[0],
                a[1] * b[1],
                a[2] * b[2],
                a[3] * b[3]];
};

/**
* RDGE.vec4.addMul
*/
RDGE.vec4.addMul = function (a, b, s) {
    if (s.length != undefined && s.length >= 4) {
        return [a[0] + b[0] * s[0], a[1] + b[1] * s[1], a[2] + b[2] * s[2], a[3] + b[3] * s[3]];
    } else {
        return [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s, a[3] + b[3] * s];
    }
};

/**
* RDGE.vec4.scale
*/
RDGE.vec4.scale = function (v, s) {
    if (s.length != undefined && s.length >= 4) {
        return [v[0] * s[0], v[1] * s[1], v[2] * s[2], v[3] * s[3]];
    } else {
        return [v[0] * s, v[1] * s, v[2] * s, v[3] * s];
    }
};

/**
* RDGE.vec4.negate
*/
RDGE.vec4.negate = function (v) {
    return [-v[0], -v[1], -v[2], -v[3]];
};

/**
* RDGE.vec4.dot
*/
RDGE.vec4.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
* RDGE.vec4.normalize
*/
RDGE.vec4.normalize = function (v) {
    var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2] + v[3] * v[3]);
    if (Math.abs(1.0 - l) > 0.0001) {
        var ool = 1.0 / l;
        return [v[0] * ool, v[1] * ool, v[2] * ool, v[3] * ool];
    }
    return v;
};

/**
* RDGE.vec4.lengthSq
*/
RDGE.vec4.lengthSq = function (v) {
    return v[0] * v[0] +
            v[1] * v[1] +
            v[2] * v[2] +
            v[3] * v[3];
};

/**
* RDGE.vec4.length
*/
RDGE.vec4.length = function (v) {
    return Math.sqrt(v[0] * v[0] +
                        v[1] * v[1] +
                        v[2] * v[2] +
                        v[3] * v[3]);
};

/**
* RDGE.vec4.abs
*/
RDGE.vec4.abs = function (v) {
    return [Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2]), Math.abs(v[3])];
};

/**
* RDGE.vec4.min
*/
RDGE.vec4.min = function (a, b) {
    return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2]), Math.min(a[3], b[3])];
};

/**
* RDGE.vec4.max
*/
RDGE.vec4.max = function (a, b) {
    return [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2]), Math.min(a[3], b[3])];
};

/**
* RDGE.vec4.clamp
*/
RDGE.vec4.clamp = function (v, vmin, vmax) {
    return RDGE.vec4.min(vmax, RDGE.vec4.max(v, vmin));
};

/**
* RDGE.vec4.equal
*/
RDGE.vec4.equal = function (a, b, t) {
    if (!t) {
        t = 0.001;
    }
    return (RDGE.vec4.distanceSq(a, b) < (t * t));
};

/**
* RDGE.vec4.lerp
*/
RDGE.vec4.lerp = function (a, b, t) {
    return [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
        a[3] + (b[3] - a[3]) * t
    ];
};
