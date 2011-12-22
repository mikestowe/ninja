/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


/**
* quat = {}
* This library contains utility functions for operating on quaternions.
* --
* TODO: 
*	-need to add more helper functions for generating quaternions from 
*	 other representations (i.e. - eulers, angle-axis). 
*/
quat = {}

/**
* vec4.string
*/
quat.string = function(q) {
	return "{ " + q[0] + ", " + q[1] + ", " + q[2] + ", " + q[3] + " }";
}

/**
* quat.verify
*/
quat.verify = function(q) {
	if (q == undefined || q.length == undefined || q.length < 4) {
		return false;
	}

	if (typeof (q[0]) != "number" || typeof (q[1]) != "number" || typeof (q[2]) != "number" || typeof (q[3]) != "number") {
		return false;
	}

	return true;
}

/**
* quat.identity
*/
quat.identity = function() {
	return [0.0, 0.0, 0.0, 1.0];
}

/**
* quat.add
*/
quat.add = function(a, b) {
	return [	a[0] + b[0],
				a[1] + b[1],
				a[2] + b[2],
				a[3] + b[3]];
}

/**
* quat.sub
*/
quat.sub = function(a, b) {
	return	[	a[0] - b[0],
				a[1] - b[1],
				a[2] - b[2],
				a[3] - b[3]];
}

/**
* quat.mul
*/
quat.mul = function( a, b ) {
	return [	a[3]*b[3] - a[0]*b[0] - a[1]*b[1] - a[2]*b[2],
				a[3]*b[0] + a[0]*b[3] + a[1]*b[2] - a[2]*b[1],
				a[3]*b[1] - a[0]*b[2] + a[1]*b[3] + a[2]*b[0],
				a[3]*b[2] + a[0]*b[1] - a[1]*b[0] + a[2]*b[3] ];
}

/**
* quat.addMul
*/
quat.addMul = function(a, b, s) {
	if (s.length != undefined && s.length >= 4) {
		return [a[0] + b[0] * s[0], a[1] + b[1] * s[1], a[2] + b[2] * s[2], a[3] + b[3] * s[3]];
	} else {
		return [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s, a[3] + b[3] * s];
	}
}


/**
* quat.scale
*/
quat.scale = function(q, s) {
	if (s.length != undefined && s.length >= 4) {
		return [q[0] * s[0], q[1] * q[1], q[2] * s[2], q[3] * s[3]];
	} else {
		return [q[0] * s, q[1] * s, q[2] * s, q[3] * s];
	}
}

/**
* quat.lengthSq
*/
quat.lengthSq = function(q) {
	return	q[0] * q[0] +
			q[1] * q[1] +
			q[2] * q[2] +
			q[3] * q[3];
}

/**
* quat.length
*/
quat.length = function(q) {
	return Math.sqrt(	q[0] * q[0] +
						q[1] * q[1] +
						q[2] * q[2] +
						q[3] * q[3]);
}

/**
* quat.normalize
*/
quat.normalize = function(q) {
	var l = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
	if (Math.abs(1.0 - l) > 0.0001) {
		var ool = 1.0 / l;
		return [q[0] * ool, q[1] * ool, q[2] * ool, q[3] * ool];
	}
	return q;
}

/**
* quat.inverse
*/
quat.inverse = function(q) {
	var	n = vec4.lengthSq( q );
    if( n > 0.00001 ) {
        n		= 1.0 / n;
        return [ q[0] * -n, q[1] * -n, q[2] * -n, q[3] ];
	} else {
		// error condition
	}
	return q;
}

/**
* quat.dot
*/
quat.dot = function(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

/**
* quat.applyRotation
*/
quat.applyRotation = function(q, v) {
	return mat4.transformPoint(quat.toMatrix(q), v);  
}

/**
* quat.lerp
*/
quat.lerp = function(q0, q1, t) {
    return quat.normalize( [ q0[0] + (q1[0] - q0[0]) * t, q0[1] + (q1[1] - q0[1]) * t, q0[2] + (q1[2] - q0[2]) * t, q0[3] + (q1[3] - q0[3]) * t ] );
}

/**
* quat.slerp
*/
quat.slerp = function(q0, q1, t) {
    var c = quat.dot(q0, q1);							// cosine of the angle

    // just lerp if the quats are "close" enough
    if (c >= 0.9) {
        return quat.lerp(q0, q1, t);
    }

    var s = Math.sqrt(Math.abs(1.0 - c * c));			// sine of the angle
    if (s < 0.001)
        return q0; // too close

    var sign = c < 0.0 ? -1.0 : 1.0;
    var angle = Math.asin(s);

    var invs = 1.0 / s;									// sine^-1
    var coef0 = Math.sin((1.0 - t) * angle) * invs;		// interp. coefficients
    var coef1 = Math.sin(t * angle) * invs * sign;

    quat.scale(q0, coef0);
    quat.scale(q1, coef1);

    return quat.normalize( quat.add(q0, q1) );
}

/**
* quat.toMatrix
*/
quat.toMatrix = function(q) {
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

	return [	1.0 - (tyy + tzz),
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
}

