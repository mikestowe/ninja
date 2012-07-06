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
* This library contains functions for operating on 4x4 matrices. Any JS array 
* containing at least 16 numeric components can represent a 4x4 matrix. 
*
* For example, all of these are valid matrix construction methods:
*		...
*		var a = mat4.identity();
*		var b = mat4.perspective(90, aspectRatio, 0.1, 100.00);
*		var c = mat4.lookAt( [0, 0, 0], [1, 0, 0], [ 0, 1, 0 ] );
*		var d = mat4.basis( [1, 0, 0], [0, 1, 0], [ 0, 0, 1 ] );
*
* This library is implemented assuming components are arranged 
* contiguously in memory as such: 
*		M = [ x0, x1, x2, x3,
*			  y0, y1, y2, y3,
*			  z0, z1, z2, z3,
*			  w0, w1, w2, w3 ];
* The translation components of a transformation matrix would be stored in 
* w0, w1, w2, or at indices 12, 13, and 14 of the array, as is consistent 
* with OpenGL.			  
*/
// RDGE namespaces
var RDGE = RDGE || {};
RDGE.mat4 = {};

/**
* RDGE.mat4.string
*/
RDGE.mat4.string = function (m) {
    var out = "{ ";
    out += m[0] + ", " + m[1] + ", " + m[2] + ", " + m[3] + ", ";
    out += m[4] + ", " + m[5] + ", " + m[6] + ", " + m[7] + ", ";
    out += m[8] + ", " + m[9] + ", " + m[10] + ", " + m[11] + ", ";
    out += m[12] + ", " + m[13] + ", " + m[14] + ", " + m[15] + " }";
    return out;
};

RDGE.mat4.toCSSString = function (m, conversionConstant) {
    var cc = 10.0;

    if (conversionConstant)
        cc = conversionConstant;

    var out = "matrix3d(";
    out += m[0].toFixed(10) + ", " + m[1].toFixed(10) + ", " + m[2].toFixed(10) + ", " + m[3].toFixed(10) + ", ";
    out += m[4].toFixed(10) + ", " + m[5].toFixed(10) + ", " + m[6].toFixed(10) + ", " + m[7].toFixed(10) + ", ";
    out += m[8].toFixed(10) + ", " + m[9].toFixed(10) + ", " + m[10].toFixed(10) + ", " + m[11].toFixed(10) + ", ";
    out += m[12].toFixed(10) * cc + ", " + (600 - m[13].toFixed(10) * cc) + ", " + m[14].toFixed(10) * cc + ", " + m[15].toFixed(10) + ")";
    return out;
};

/**
* RDGE.mat4.verify
* This function is provided for debugging purposes only. It is not recommended 
* to be used in performance critical areas of the code.
*/
RDGE.mat4.verify = function (m) {
    if (m == undefined || m.length == undefined || m.length < 16) {
        return false;
    }
    var i = 16;
    while (i--) {
        if (typeof (m[i]) != "number") {
            return false;
        }
    }
    return true;
};

/**
* RDGE.mat4.copy
*/
RDGE.mat4.copy = function (m) {
    return [m[0], m[1], m[2], m[3],
				m[4], m[5], m[6], m[7],
				m[8], m[9], m[10], m[11],
				m[12], m[13], m[14], m[15]];
};

/**
* RDGE.mat4.inplace_copy
*/
RDGE.mat4.inplace_copy = function (dst, src) {
    dst[0] = src[0];
    dst[1] = src[1];
    dst[2] = src[2];
    dst[3] = src[3];
    dst[4] = src[4];
    dst[5] = src[5];
    dst[6] = src[6];
    dst[7] = src[7];
    dst[8] = src[8];
    dst[9] = src[9];
    dst[10] = src[10];
    dst[11] = src[11];
    dst[12] = src[12];
    dst[13] = src[13];
    dst[14] = src[14];
    dst[15] = src[15];
};

/**
* RDGE.mat4.identity
*/
RDGE.mat4.identity = function () {
    return [1.0, 0.0, 0.0, 0.0,
				0.0, 1.0, 0.0, 0.0,
				0.0, 0.0, 1.0, 0.0,
				0.0, 0.0, 0.0, 1.0];
};

/**
* RDGE.mat4.zero
*/
RDGE.mat4.zero = function () {
    return [0.0, 0.0, 0.0, 0.0,
				0.0, 0.0, 0.0, 0.0,
				0.0, 0.0, 0.0, 0.0,
				0.0, 0.0, 0.0, 0.0];
};

/**
* RDGE.mat4.basis
* description - construct a matrix with the given basis vectors.
*/
RDGE.mat4.basis = function (rowx, rowy, rowz, roww) {
    if (roww == null || roww == undefined) {
        return [rowx[0], rowx[1], rowx[2], 0.0,
					rowy[0], rowy[1], rowy[2], 0.0,
					rowz[0], rowz[1], rowz[2], 0.0,
					0, 0, 0, 1.0];
    } else {
        return [rowx[0], rowx[1], rowx[2], rowx.length == 4 ? rowx[3] : 0.0,
					rowy[0], rowy[1], rowy[2], rowy.length == 4 ? rowy[3] : 0.0,
					rowz[0], rowz[1], rowz[2], rowz.length == 4 ? rowz[3] : 0.0,
					roww[0], roww[1], roww[2], roww.length == 4 ? roww[3] : 1.0];
    }
};

/**
* RDGE.mat4.angleAxis
*/
RDGE.mat4.angleAxis = function (angle, axis) {
    // angles are in degrees. Switch to radians
    angle *= (Math.PI / 180.0);

    angle /= 2;
    var sinA = Math.sin(angle);
    var cosA = Math.cos(angle);
    var sinA2 = sinA * sinA;

    // normalize
    RDGE.vec3.normalize(axis);
    if (RDGE.vec3.lengthSq(axis) <= 0.0) {
        axis = [0, 0, 0, 1];
    }

    var matR = RDGE.mat4.identity();

    // optimize case where axis is along major axis
    if (axis[0] == 1 && axis[1] == 0 && axis[2] == 0) {
        matR[5] = 1 - 2 * sinA2;
        matR[6] = 2 * sinA * cosA;
        matR[9] = -2 * sinA * cosA;
        matR[10] = 1 - 2 * sinA2;
    } else if (axis[0] == 0 && axis[1] == 1 && axis[2] == 0) {
        matR[0] = 1 - 2 * sinA2;
        matR[2] = -2 * sinA * cosA;
        matR[8] = 2 * sinA * cosA;
        matR[10] = 1 - 2 * sinA2;
    } else if (axis[0] == 0 && axis[1] == 0 && axis[2] == 1) {
        matR[0] = 1 - 2 * sinA2;
        matR[1] = 2 * sinA * cosA;
        matR[4] = -2 * sinA * cosA;
        matR[5] = 1 - 2 * sinA2;
    } else {
        var x = axis[0];
        var y = axis[1];
        var z = axis[2];
        var x2 = x * x;
        var y2 = y * y;
        var z2 = z * z;

        matR[0] = 1 - 2 * (y2 + z2) * sinA2;
        matR[1] = 2 * (x * y * sinA2 + z * sinA * cosA);
        matR[2] = 2 * (x * z * sinA2 - y * sinA * cosA);
        matR[4] = 2 * (y * x * sinA2 - z * sinA * cosA);
        matR[5] = 1 - 2 * (z2 + x2) * sinA2;
        matR[6] = 2 * (y * z * sinA2 + x * sinA * cosA);
        matR[8] = 2 * (z * x * sinA2 + y * sinA * cosA);
        matR[9] = 2 * (z * y * sinA2 - x * sinA * cosA);
        matR[10] = 1 - 2 * (x2 + y2) * sinA2;
    }

    return matR;
};

/**
* RDGE.mat4.lookAt
*/
RDGE.mat4.lookAt = function (eye, at, up) {
    /*
    var w_axis = new RDGE.vec3(posVec.x, posVec.y, posVec.z);
  
    var z_axis = subVec3(targetVec, w_axis);
    z_axis.normalize();
  
    var x_axis = crossVec3(upVec, z_axis);
    x_axis.normalize();

    var y_axis = crossVec3(z_axis, x_axis);
    y_axis.normalize();
    */

    var z = RDGE.vec3.normalize(RDGE.vec3.sub(eye, at));
    if (RDGE.vec3.length(z) < 0.0001) {
        z = [0, 0, 1];
    }

    var x = RDGE.vec3.normalize(RDGE.vec3.cross(up, z));
    var y = RDGE.vec3.normalize(RDGE.vec3.cross(z, x));
    var m = RDGE.mat4.identity();

    RDGE.mat4.setRow(m, 0, x);
    RDGE.mat4.setRow(m, 1, y);
    RDGE.mat4.setRow(m, 2, z);
    RDGE.mat4.setRow(m, 3, eye);

    return m;
};

/**
* RDGE.mat4.frustum
*/
RDGE.mat4.frustum = function (left, right, bottom, top, near, far) {
    var rl = right - left;
    var tb = top - bottom;
    var fn = far - near;
    var n2 = 2.0 * near;

    var m = RDGE.mat4.zero();
    m[0] = n2 / rl;
    m[5] = n2 / tb;
    m[8] = (right + left) / rl;
    m[9] = (top + bottom) / tb;
    m[10] = -(far + near) / fn;
    m[11] = -1.0;
    m[14] = -(n2 * far) / fn;

    return m;
};

/**
* RDGE.mat4.perspective
*/
RDGE.mat4.perspective = function (fov, aspect, near, far) {
    var top = Math.tan(fov * Math.PI / 360.0) * near;
    var bottom = -top;
    var left = aspect * bottom;
    var right = aspect * top;

    return RDGE.mat4.frustum(left, right, bottom, top, near, far);
};

/**
* RDGE.mat4.orthographic
*/
RDGE.mat4.orthographic = function (left, right, top, bottom, near, far) {
    var tx = (left + right) / (left - right);
    var ty = (top + bottom) / (top - bottom);
    var tz = (far + near) / (far - near);

    var m = RDGE.mat4.zero();
    m[0] = 2.0 / (left - right);
    m[5] = 2.0 / (top - bottom);
    m[10] = -2.0 / (far - near);
    m[12] = tx;
    m[13] = ty;
    m[14] = tz;
    m[15] = 1.0;

    return m;
};

/**
* RDGE.mat4.mul
*/
RDGE.mat4.mul = function (a, b) {
    // note: precaching the matrix elements saves 96 additional array lookups.
    // this turns out to be significantly faster.
    var a00 = a[0];
    var a01 = a[1];
    var a02 = a[2];
    var a03 = a[3];
    var a04 = a[4];
    var a05 = a[5];
    var a06 = a[6];
    var a07 = a[7];
    var a08 = a[8];
    var a09 = a[9];
    var a10 = a[10];
    var a11 = a[11];
    var a12 = a[12];
    var a13 = a[13];
    var a14 = a[14];
    var a15 = a[15];

    var b00 = b[0];
    var b01 = b[1];
    var b02 = b[2];
    var b03 = b[3];
    var b04 = b[4];
    var b05 = b[5];
    var b06 = b[6];
    var b07 = b[7];
    var b08 = b[8];
    var b09 = b[9];
    var b10 = b[10];
    var b11 = b[11];
    var b12 = b[12];
    var b13 = b[13];
    var b14 = b[14];
    var b15 = b[15];

    return [a00 * b00 + a01 * b04 + a02 * b08 + a03 * b12,
			a00 * b01 + a01 * b05 + a02 * b09 + a03 * b13,
			a00 * b02 + a01 * b06 + a02 * b10 + a03 * b14,
			a00 * b03 + a01 * b07 + a02 * b11 + a03 * b15,

			a04 * b00 + a05 * b04 + a06 * b08 + a07 * b12,
			a04 * b01 + a05 * b05 + a06 * b09 + a07 * b13,
			a04 * b02 + a05 * b06 + a06 * b10 + a07 * b14,
			a04 * b03 + a05 * b07 + a06 * b11 + a07 * b15,

			a08 * b00 + a09 * b04 + a10 * b08 + a11 * b12,
			a08 * b01 + a09 * b05 + a10 * b09 + a11 * b13,
			a08 * b02 + a09 * b06 + a10 * b10 + a11 * b14,
			a08 * b03 + a09 * b07 + a10 * b11 + a11 * b15,

			a12 * b00 + a13 * b04 + a14 * b08 + a15 * b12,
			a12 * b01 + a13 * b05 + a14 * b09 + a15 * b13,
			a12 * b02 + a13 * b06 + a14 * b10 + a15 * b14,
			a12 * b03 + a13 * b07 + a14 * b11 + a15 * b15];
};

/**
* RDGE.mat4.mul4x3
* This version cuts 28 multiplies and 21 adds.
*/
RDGE.mat4.mul4x3 = function (a, b) {
    // note: precaching the matrix elements cuts redundant array lookups.
    var a00 = a[0];
    var a01 = a[1];
    var a02 = a[2];

    var a04 = a[4];
    var a05 = a[5];
    var a06 = a[6];

    var a08 = a[8];
    var a09 = a[9];
    var a10 = a[10];

    var a12 = a[12];
    var a13 = a[13];
    var a14 = a[14];

    var b00 = b[0];
    var b01 = b[1];
    var b02 = b[2];
    var b04 = b[4];
    var b05 = b[5];
    var b06 = b[6];
    var b08 = b[8];
    var b09 = b[9];
    var b10 = b[10];
    var b12 = b[12];
    var b13 = b[13];
    var b14 = b[14];

    return [a00 * b00 + a01 * b04 + a02 * b08,
			a00 * b01 + a01 * b05 + a02 * b09,
			a00 * b02 + a01 * b06 + a02 * b10,
			0,

			a04 * b00 + a05 * b04 + a06 * b08,
			a04 * b01 + a05 * b05 + a06 * b09,
			a04 * b02 + a05 * b06 + a06 * b10,
			0,

			a08 * b00 + a09 * b04 + a10 * b08,
			a08 * b01 + a09 * b05 + a10 * b09,
			a08 * b02 + a09 * b06 + a10 * b10,
			0,

			a12 * b00 + a13 * b04 + a14 * b08 + b12,
			a12 * b01 + a13 * b05 + a14 * b09 + b13,
			a12 * b02 + a13 * b06 + a14 * b10 + b14,
			1.0];
};

/**
* RDGE.mat4._det2x2
*/
RDGE.mat4._det2x2 = function (a, b, c, d) {
    return a * d - b * c;
};

/**
* RDGE.mat4._det3x3
*/
RDGE.mat4._det3x3 = function (a1, a2, a3, b1, b2, b3, c1, c2, c3) {
    return a1 * RDGE.mat4._det2x2(b2, b3, c2, c3)
			- b1 * RDGE.mat4._det2x2(a2, a3, c2, c3)
			+ c1 * RDGE.mat4._det2x2(a2, a3, b2, b3);
};

/**
* RDGE.mat4._det4x4
*/
RDGE.mat4._det4x4 = function (m) {
    var a1 = m[0];
    var b1 = m[1];
    var c1 = m[2];
    var d1 = m[3];

    var a2 = m[4];
    var b2 = m[5];
    var c2 = m[6];
    var d2 = m[7];

    var a3 = m[8];
    var b3 = m[9];
    var c3 = m[10];
    var d3 = m[11];

    var a4 = m[12];
    var b4 = m[13];
    var c4 = m[14];
    var d4 = m[15];

    return a1 * RDGE.mat4._det3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4)
		   - b1 * RDGE.mat4._det3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4)
		   + c1 * RDGE.mat4._det3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4)
		   - d1 * RDGE.mat4._det3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
};

/**
* RDGE.mat4._adjoint
*/
RDGE.mat4._adjoint = function (m) {
    var a1 = m[0];
    var b1 = m[1];
    var c1 = m[2];
    var d1 = m[3];

    var a2 = m[4];
    var b2 = m[5];
    var c2 = m[6];
    var d2 = m[7];

    var a3 = m[8];
    var b3 = m[9];
    var c3 = m[10];
    var d3 = m[11];

    var a4 = m[12];
    var b4 = m[13];
    var c4 = m[14];
    var d4 = m[15];

    return [RDGE.mat4._det3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4),
				-RDGE.mat4._det3x3(b1, b3, b4, c1, c3, c4, d1, d3, d4),
				RDGE.mat4._det3x3(b1, b2, b4, c1, c2, c4, d1, d2, d4),
				-RDGE.mat4._det3x3(b1, b2, b3, c1, c2, c3, d1, d2, d3),
				-RDGE.mat4._det3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4),
				RDGE.mat4._det3x3(a1, a3, a4, c1, c3, c4, d1, d3, d4),
				-RDGE.mat4._det3x3(a1, a2, a4, c1, c2, c4, d1, d2, d4),
				RDGE.mat4._det3x3(a1, a2, a3, c1, c2, c3, d1, d2, d3),
				RDGE.mat4._det3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4),
				-RDGE.mat4._det3x3(a1, a3, a4, b1, b3, b4, d1, d3, d4),
				RDGE.mat4._det3x3(a1, a2, a4, b1, b2, b4, d1, d2, d4),
				-RDGE.mat4._det3x3(a1, a2, a3, b1, b2, b3, d1, d2, d3),
				-RDGE.mat4._det3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4),
				RDGE.mat4._det3x3(a1, a3, a4, b1, b3, b4, c1, c3, c4),
				-RDGE.mat4._det3x3(a1, a2, a4, b1, b2, b4, c1, c2, c4),
				RDGE.mat4._det3x3(a1, a2, a3, b1, b2, b3, c1, c2, c3)];
};

/**
* RDGE.mat4.inverse
*/
RDGE.mat4.inverse = function (m) {
    // Calculate the 4x4 determinant
    // If the determinant is zero, 
    // then the inverse matrix is not unique.
    var det = RDGE.mat4._det4x4(m);

    if (Math.abs(det) < 1e-8) {
        // this is an error condition.
        return null;
    }

    var adj = RDGE.mat4._adjoint(m);
    var ood = 1.0 / det;

    return [adj[0] * ood, adj[1] * ood, adj[2] * ood, adj[3] * ood,
				adj[4] * ood, adj[5] * ood, adj[6] * ood, adj[7] * ood,
				adj[8] * ood, adj[9] * ood, adj[10] * ood, adj[11] * ood,
				adj[12] * ood, adj[13] * ood, adj[14] * ood, adj[15] * ood];
};

/**
* RDGE.mat4.rigidinverse
*/
RDGE.mat4.rigidInverse = function (m) {
    out = RDGE.mat4.transpose3x3(m);
    out[12] = -RDGE.vec3.dot([out[0], out[4], out[8]], [m[12], m[13], m[14]]);
    out[13] = -RDGE.vec3.dot([out[1], out[5], out[9]], [m[12], m[13], m[14]]);
    out[14] = -RDGE.vec3.dot([out[2], out[6], out[10]], [m[12], m[13], m[14]]);
    return out;
};

/**
* RDGE.mat4.transpose
*/
RDGE.mat4.transpose = function (m) {
    return [m[0], m[4], m[8], m[12],
				m[1], m[5], m[9], m[13],
				m[2], m[6], m[10], m[14],
				m[3], m[7], m[11], m[15]];
};

/**
* RDGE.mat4.transpose3x3
*/
RDGE.mat4.transpose3x3 = function (m) {
    return [m[0], m[4], m[8], m[3],
				m[1], m[5], m[9], m[7],
				m[2], m[6], m[10], m[11],
				m[12], m[13], m[14], m[15]];
};

/**
* RDGE.mat4.transformPoint
*/
RDGE.mat4.transformPoint = function (m, v) {
    var x = v[0], y = v[1], z = v[2], w = v.length >= 4 ? v[3] : 1.0;
    return [m[0] * x + m[4] * y + m[8] * z + m[12] * w,
			m[1] * x + m[5] * y + m[9] * z + m[13] * w,
			m[2] * x + m[6] * y + m[10] * z + m[14] * w,
			m[3] * x + m[7] * y + m[11] * z + m[15] * w];
    // 12 adds, 16 multiplies, 16 lookups. 
};

/**
* RDGE.mat4.transformVector
*/
RDGE.mat4.transformVector = function (m, v) {
    m = RDGE.mat4.inverse(m);
    var x = v[0], y = v[1], z = v[2], w = v.length >= 4 ? v[3] : 0.0;
    // 12 adds, 16 multiplies, 16 lookups. 
    // transpose multiply
    return [m[0] * x + m[1] * y + m[2] * z + m[3] * w,
				m[4] * x + m[5] * y + m[6] * z + m[7] * w,
				m[8] * x + m[9] * y + m[10] * z + m[11] * w,
				m[12] * x + m[13] * y + m[14] * z + m[15] * w];
};

/**
* RDGE.mat4.transformVector4x3
*/
RDGE.mat4.transformPoint4x3 = function (m, v) {
    // assumes m[3], m[7], m[11], m[15] equal 0, 0, 0, 1
    var x = v[0], y = v[1], z = v[2];
    // 9 adds, 9 multiplies, 16 lookups.
    return [m[0] * x + m[4] * y + m[8] * z + m[12],
				m[1] * x + m[5] * y + m[9] * z + m[13],
				m[2] * x + m[6] * y + m[10] * z + m[14],
				1.0];
};

/**
* RDGE.mat4.transformVector4x3
* this implementation saves 3 adds and 7 multiplies
*/
RDGE.mat4.transformVector4x3 = function (m, v) {
    m = RDGE.mat4.inverse(m);
    var x = v[0], y = v[1], z = v[2];
    return [m[0] * x + m[1] * y + m[2] * z,
				m[4] * x + m[5] * y + m[6] * z,
				m[8] * x + m[9] * y + m[10] * z,
				0.0];
};

/**
* RDGE.mat4.getRow
*/
RDGE.mat4.getRow = function (m, i) {
    i *= 4;
    return [m[i], m[i + 1], m[i + 2], m[i + 3]];
};

/**
* RDGE.mat4.getCol
*/
RDGE.mat4.getCol = function (m, i) {
    return [m[i], m[i + 4], m[i + 8], m[i + 12]];
};

/**
* RDGE.mat4.setRow
*/
RDGE.mat4.setRow = function (m, i, v) {
    i *= 4;
    m[i + 0] = v[0];
    m[i + 1] = v[1];
    m[i + 2] = v[2];

    if (v.length >= 4) {
        m[i + 3] = v[3];
    }

    return m;
};

/**
* RDGE.mat4.setCol
*/
RDGE.mat4.setCol = function (m, i, v) {
    m[i + 0] = v[0];
    m[i + 4] = v[1];
    m[i + 8] = v[2];
    if (v.length >= 4) {
        m[i + 12] = v[3];
    }

    return m;
};

/**
* RDGE.mat4.rotate
*/
RDGE.mat4.rotate = function (m, angle, axis) {
    return RDGE.mat4.mul(m, RDGE.mat4.angleAxis(angle, axis));
};

/**
* RDGE.mat4.rotateX
*/
RDGE.mat4.rotateX = function (m, angle) {
    return RDGE.mat4.mul(m, RDGE.mat4.angleAxis(angle, RDGE.vec3.basisX(m)));
};

/**
* RDGE.mat4.rotateY
*/
RDGE.mat4.rotateY = function (m, angle) {
    return RDGE.mat4.mul(m, RDGE.mat4.angleAxis(angle, RDGE.vec3.basisY(m)));
};

/**
* RDGE.mat4.rotateZ
*/
RDGE.mat4.rotateZ = function (m, angle) {
    return RDGE.mat4.mul(m, RDGE.mat4.angleAxis(angle, RDGE.vec3.basisZ(m)));
};

/**
* RDGE.mat4.scale
*/
RDGE.mat4.scale = function (m, s) {
    var sMat = RDGE.mat4.identity();

    if (s.length == undefined) {
        s = [s, s, s];
    }

    sMat[0] = s[0];
    sMat[5] = s[1];
    sMat[10] = s[2];

    return RDGE.mat4.mul(m, sMat);
};

/**
* RDGE.mat4.scaleX
*/
RDGE.mat4.scaleX = function (m, s) {
    return RDGE.mat4.scale(m, [s, 1.0, 1.0]);
};

/**
* RDGE.mat4.scaleY
*/
RDGE.mat4.scaleY = function (m, s) {
    return RDGE.mat4.scale(m, [1.0, s, 1.0]);
};

/**
* RDGE.mat4.scaleZ
*/
RDGE.mat4.scaleZ = function (m, s) {
    return RDGE.mat4.scale(m, [1.0, 1.0, s]);
};

/**
* RDGE.mat4.translate
*/
RDGE.mat4.translate = function (m, t) {
    matT = RDGE.mat4.identity();

    matT[12] = t[0];
    matT[13] = t[1];
    matT[14] = t[2];

    return RDGE.mat4.mul(m, matT);
};

/**
* RDGE.mat4.translateX
*/
RDGE.mat4.translateX = function (m, t) {
    return RDGE.mat4.translate(m, [t, 0, 0]);
};

/**
* RDGE.mat4.translateY
*/
RDGE.mat4.translateY = function (m, t) {
    return RDGE.mat4.translate(m, [0, t, 0]);
};

/**
* RDGE.mat4.translateZ
*/
RDGE.mat4.translateZ = function (m, t) {
    return RDGE.mat4.translate(m, [0, 0, t]);
};
