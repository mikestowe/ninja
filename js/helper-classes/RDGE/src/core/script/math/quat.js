/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */


/**
* RDGE.quat = {}
* This library contains utility functions for operating on quaternions.
* --
* TODO:
*   -need to add more helper functions for generating quaternions from
*    other representations (i.e. - eulers, angle-axis).
*/
var RDGE = RDGE || {};
RDGE.quat = {};

/**
* RDGE.quat.string
*/
RDGE.quat.string = function (q) {
    return "{ " + q[0] + ", " + q[1] + ", " + q[2] + ", " + q[3] + " }";
};

/**
* RDGE.quat.verify
*/
RDGE.quat.verify = function (q) {
    if (q == undefined || q.length == undefined || q.length < 4) {
        return false;
    }

    if (typeof (q[0]) != "number" || typeof (q[1]) != "number" || typeof (q[2]) != "number" || typeof (q[3]) != "number") {
        return false;
    }

    return true;
};

/**
* RDGE.quat.identity
*/
RDGE.quat.identity = function () {
    return [0.0, 0.0, 0.0, 1.0];
};

/**
* RDGE.quat.add
*/
RDGE.quat.add = function (a, b) {
    return [a[0] + b[0],
                a[1] + b[1],
                a[2] + b[2],
                a[3] + b[3]];
};

/**
* RDGE.quat.sub
*/
RDGE.quat.sub = function (a, b) {
    return [a[0] - b[0],
                a[1] - b[1],
                a[2] - b[2],
                a[3] - b[3]];
};

/**
* RDGE.quat.mul
*/
RDGE.quat.mul = function (a, b) {
    return [a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
                a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
                a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
                a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3]];
};

/**
* RDGE.quat.addMul
*/
RDGE.quat.addMul = function (a, b, s) {
    if (s.length != undefined && s.length >= 4) {
        return [a[0] + b[0] * s[0], a[1] + b[1] * s[1], a[2] + b[2] * s[2], a[3] + b[3] * s[3]];
    } else {
        return [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s, a[3] + b[3] * s];
    }
};


/**
* RDGE.quat.scale
*/
RDGE.quat.scale = function (q, s) {
    if (s.length != undefined && s.length >= 4) {
        return [q[0] * s[0], q[1] * q[1], q[2] * s[2], q[3] * s[3]];
    } else {
        return [q[0] * s, q[1] * s, q[2] * s, q[3] * s];
    }
};

/**
* RDGE.quat.lengthSq
*/
RDGE.quat.lengthSq = function (q) {
    return q[0] * q[0] +
            q[1] * q[1] +
            q[2] * q[2] +
            q[3] * q[3];
};

/**
* RDGE.quat.length
*/
RDGE.quat.length = function (q) {
    return Math.sqrt(q[0] * q[0] +
                        q[1] * q[1] +
                        q[2] * q[2] +
                        q[3] * q[3]);
};

/**
* RDGE.quat.normalize
*/
RDGE.quat.normalize = function (q) {
    var l = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
    if (Math.abs(1.0 - l) > 0.0001) {
        var ool = 1.0 / l;
        return [q[0] * ool, q[1] * ool, q[2] * ool, q[3] * ool];
    }
    return q;
};

/**
* RDGE.quat.inverse
*/
RDGE.quat.inverse = function (q) {
    var n = RDGE.vec4.lengthSq(q);
    if (n > 0.00001) {
        n = 1.0 / n;
        return [q[0] * -n, q[1] * -n, q[2] * -n, q[3]];
    } else {
        // error condition
    }
    return q;
};

/**
* RDGE.quat.dot
*/
RDGE.quat.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
* RDGE.quat.applyRotation
*/
RDGE.quat.applyRotation = function (q, v) {
    return RDGE.mat4.transformPoint(RDGE.quat.toMatrix(q), v);
};

/**
* RDGE.quat.lerp
*/
RDGE.quat.lerp = function (q0, q1, t) {
    return RDGE.quat.normalize([q0[0] + (q1[0] - q0[0]) * t, q0[1] + (q1[1] - q0[1]) * t, q0[2] + (q1[2] - q0[2]) * t, q0[3] + (q1[3] - q0[3]) * t]);
};

/**
* RDGE.quat.slerp
*/
RDGE.quat.slerp = function (q0, q1, t) {
    var c = RDGE.quat.dot(q0, q1);                      // cosine of the angle

    // just lerp if the quats are "close" enough
    if (c >= 0.9) {
        return RDGE.quat.lerp(q0, q1, t);
    }

    var s = Math.sqrt(Math.abs(1.0 - c * c));       // sine of the angle
    if (s < 0.001)
        return q0; // too close

    var sign = c < 0.0 ? -1.0 : 1.0;
    var angle = Math.asin(s);

    var invs = 1.0 / s;                                 // sine^-1
    var coef0 = Math.sin((1.0 - t) * angle) * invs;     // interp. coefficients
    var coef1 = Math.sin(t * angle) * invs * sign;

    RDGE.quat.scale(q0, coef0);
    RDGE.quat.scale(q1, coef1);

    return RDGE.quat.normalize(RDGE.quat.add(q0, q1));
};

/**
* RDGE.quat.toMatrix
*/
RDGE.quat.toMatrix = function (q) {
    var tx = 2.0 * q[0];
    var ty = 2.0 * q[1];
    var tz = 2.0 * q[2];
    var twx = tx * q[3];
    var twy = ty * q[3];
    var twz = tz * q[3];
    var txx = tx * q[0];
    var txy = ty * q[0];
    var txz = tz * q[0];
    var tyy = ty * q[1];
    var tyz = tz * q[1];
    var tzz = tz * q[2];

    return [1.0 - (tyy + tzz),
                txy + twz,
                txz - twy,
                0,
                txy - twz,
                1.0 - (txx + tzz),
                tyz + twx,
                0,
                txz + twy,
                tyz - twx,
                1.0 - (txx + tyy),
                0, 0, 0, 0, 1];
};

