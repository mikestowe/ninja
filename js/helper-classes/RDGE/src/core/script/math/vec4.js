/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/**
* vec4 = {}
* This library contains functions for operating on 4D vectors. Any JS array 
* containing at least 4 numeric components can represent a 4D vector. 
*
* For example, all of these are valid vec4 declarations:
*		var a = [0, 0, 0, 1];
*		var b = vec3.identity();
*		var c = vec3.zero();
*
*/
vec4 = {};

/**
* vec4.string
*/
vec4.string = function(v) {
	return "{ " + v[0] + ", " + v[1] + ", " + v[2] + ", " + v[3] + " }";
}

/**
* vec4.verify
*/
vec4.verify = function(v) {
	if (v == undefined || v.length == undefined || v.length < 4) {
		return false;
	}

	if (typeof (v[0]) != "number" || typeof (v[1]) != "number" || typeof (v[2]) != "number" || typeof (v[3]) != "number") {
		return false;
	}
		
	return true;
}

/**
* vec4.inplace_copy
*/
vec4.inplace_copy = function(dst, src) {
	dst[0] = src[0];
	dst[1] = src[1];
	dst[2] = src[2];
	dst[3] = src[3];
}

/**
* vec4.copy
*/
vec4.copy = function(v) {
	if( v.length == undefined ) {
		return [ v, v, v, v ];
	}
	
	if( v.length == 3 ) {
		return [ v[0], v[1], v[2], 1.0 ];
	}
	
	return [ v[0], v[1], v[2], v[3] ];
}

/**
* vec4.zero
*/
vec4.zero = function() {
	return [ 0.0, 0.0, 0.0, 0.0 ];
}

/**
* vec4.identity
*/
vec4.identity = function() {
	return [ 0.0, 0.0, 0.0, 1.0 ];
}

/**
* vec4.up
*/
vec4.up = function() {
	return [ 0.0, 1.0, 0.0, 0.0 ];
}

/**
* vec4.forward
*/
vec4.forward = function() {
	return [ 0.0, 0.0, 1.0, 0.0 ];
}

/**
* vec4.right
*/
vec4.right = function() {
	return [ 1.0, 0.0, 0.0, 0.0 ];
}

/**
* vec4.random
*/
vec4.random = function(min, max) {
    return [ min[0] + (max[0] - min[0]) * Math.random(),
             min[1] + (max[1] - min[1]) * Math.random(),
             min[2] + (max[2] - min[2]) * Math.random(),
             min[3] + (max[3] - min[3]) * Math.random()];
}

/**
* vec4.add
*/
vec4.add = function(a, b) {
	return	[	a[0] + b[0], 
				a[1] + b[1], 
				a[2] + b[2], 
				a[3] + b[3] ];
}

/**
* vec4.sub
*/
vec4.sub = function(a, b) {
	return	[	a[0] - b[0], 
				a[1] - b[1], 
				a[2] - b[2], 
				a[3] - b[3] ];
}

/**
* vec4.mul
*/
vec4.mul = function(a, b) {
	return	[	a[0] * b[0], 
				a[1] * b[1], 
				a[2] * b[2], 
				a[3] * b[3]	];
}

/**
* vec4.addMul
*/
vec4.addMul = function(a, b, s) {
	if (s.length != undefined && s.length >= 4) {
		return [a[0] + b[0] * s[0], a[1] + b[1] * s[1], a[2] + b[2] * s[2], a[3] + b[3] * s[3]];
	} else {
		return [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s, a[3] + b[3] * s];
	}
}

/**
* vec4.scale
*/
vec4.scale = function(v, s) {
	if (s.length != undefined && s.length >= 4) {
		return [v[0] * s[0], v[1] * s[1], v[2] * s[2], v[3] * s[3]];
	} else {
		return [v[0] * s, v[1] * s, v[2] * s, v[3] * s];
	}
}

/**
* vec4.negate
*/
vec4.negate = function(v) {
	return	[ -v[0], -v[1], -v[2], -v[3] ];
}

/**
* vec4.dot
*/
vec4.dot = function(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

/**
* vec4.normalize
*/
vec4.normalize = function(v) {
	var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2] + v[3] * v[3]);
	if (Math.abs(1.0 - l) > 0.0001) {
		var ool = 1.0 / l;
		return [v[0] * ool, v[1] * ool, v[2] * ool, v[3] * ool];
	}
	return v;
}

/**
* vec4.lengthSq
*/
vec4.lengthSq = function( v ) {
	return	v[0] * v[0] + 
			v[1] * v[1] + 
			v[2] * v[2] + 
			v[3] * v[3];
}

/**
* vec4.length
*/
vec4.length = function( v ) {
	return Math.sqrt(	v[0] * v[0] + 
						v[1] * v[1] + 
						v[2] * v[2] + 
						v[3] * v[3] );
}

/**
* vec4.abs
*/
vec4.abs = function(v) {
	return [Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2]), Math.abs(v[3])];
}

/**
* vec4.min
*/
vec4.min = function(a, b) {
	return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2]), Math.min(a[3], b[3])];
}

/**
* vec4.max
*/
vec4.max = function(a, b) {
	return [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2]), Math.min(a[3], b[3])];
}

/**
* vec4.clamp
*/
vec4.clamp = function(v, vmin, vmax) {
	return vec4.min(vmax, vec4.max(v, vmin));
}

/**
* vec4.equal
*/
vec4.equal = function(a, b, t) {
	if (!t) {
		t = 0.001;
	}
	return ( vec4.distanceSq(a, b) < (t * t) );
}

/**
* vec4.lerp
*/
vec4.lerp = function(a, b, t) {
	return [
		a[0] + (b[0] - a[0]) * t,
		a[1] + (b[1] - a[1]) * t,
		a[2] + (b[2] - a[2]) * t,
		a[3] + (b[3] - a[3]) * t
	];
}
