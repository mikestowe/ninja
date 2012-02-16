/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


/**
 * vec3 = {}
 * This library contains functions for operating on 3D vectors. Any JS array 
 * containing at least 3 numeric components can represent a 3D vector. 
 *
 * For example, all of these are valid vec3 declarations:
 *		var a = [0, 0, 1];
 *		var b = vec3.zero();
 *		var c = vec3.up();
 *
 */
vec3 = {};

/**
* vec3.string
*/
vec3.string = function(v) {
	return "{ " + v[0] + ", " + v[1] + ", " + v[2] + " }";
}

/**
 * vec3.verify
 * This function is provided for debugging purposes only. It is not recommended 
 * to be used in performance critical areas of the code.
 */
vec3.verify = function(v) {
	if (v == undefined || v.length == undefined || v.length < 3) {
		return false;
	}
	if (typeof (v[0]) != "number" || typeof (v[1]) != "number" || typeof (v[2]) != "number" ) {
		return false;
	}
	return true;
}

/**
* vec3.inplace_copy
*/
vec3.inplace_copy = function(dst, src) {
	dst[0] = src[0];
	dst[1] = src[1];
	dst[2] = src[2];
}

/**
* vec3.copy
*/
vec3.copy = function(v) {
	if( v.length == undefined ) {
		return [ v, v, v ];
	}
	
	return [v[0], v[1], v[2]];
}

/**
* vec3.translation
* description : returns a vector containing the translation vector of m.
*/
vec3.translation = function(m) {
	return [ m[12], m[13], m[14] ];
}

/**
* vec3.basisX = function( m ) 
* description : returns a vector containing the translation vector of m.
*/
vec3.basisX = function(m) {
	return [ m[0], m[1], m[2] ];
}

/**
* vec3.basisY = function( m ) 
* description : returns a vector containing the translation vector of m.
*/
vec3.basisY = function(m) {
	return [ m[4], m[5], m[6] ];
}

/**
* vec3.basisZ = function( m ) 
* description : returns a vector containing the translation vector of m.
*/
vec3.basisZ = function(m) {
	return [ m[8], m[9], m[10] ];
}

/**
* vec3.zero
*/
vec3.zero = function() {
	return [0.0, 0.0, 0.0];
}

/**
* vec3.up
*/
vec3.up = function() {
	return [ 0.0, 1.0, 0.0 ];
}

/**
* vec3.forward
*/
vec3.forward = function() {
	return [ 0.0, 0.0, 1.0 ];
}

/**
* vec3.right
*/
vec3.right = function() {
	return [ 1.0, 0.0, 0.0 ];
}

/**
* vec3.random
*/
vec3.random = function(min, max) {
    return [ min[0] + (max[0] - min[0]) * Math.random(),
             min[1] + (max[1] - min[1]) * Math.random(),
             min[2] + (max[2] - min[2]) * Math.random() ];
}

/**
* vec3.xy 
*/
vec3.xy = function(v) {
	return [v[0], v[1]];
}

/**
* vec3.xz 
*/
vec3.xz = function(v) {
	return [v[0], v[2]];
}

/**
* vec3.add
*/
vec3.add = function(a, b) {
	return [ a[0] + b[0], a[1] + b[1], a[2] + b[2] ];
}

vec3.plusEqual = function(a, b) {

		a[0] += b[0];
		a[1] += b[1];
		a[2] += b[2];
}

/**
* vec3.sub
*/
vec3.sub = function(a, b) {
	return [ a[0] - b[0], a[1] - b[1], a[2] - b[2] ];
}

/**
* vec3.mul
*/
vec3.mul = function(a, b) {
	return [ a[0] * b[0], a[1] * b[1], a[2] * b[2] ];
}

/**
* vec3.addMul
*/
vec3.addMul = function(a, b, s) {
	if (s.length != undefined && s.length >= 3) {
		return [ a[0] + b[0] * s[0], a[1] + b[1] * s[1], a[2] + b[2] * s[2] ];
	} else {
		return [ a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s ];
	}
}

vec3.plusEqualMul = function(a, b, s) {

	if(s.length !== undefined && s.length >= 3)
	{
		a[0] += b[0] * s[0];
		a[1] += b[1] * s[1];
		a[2] += b[2] * s[2];
	}
	else
	{
		a[0] += b[0] * s;
		a[1] += b[1] * s;
		a[2] += b[2] * s;
	}
}

/**
* vec3.scale 
*/
vec3.scale = function(v, s) {
	if (s.length !== undefined && s.length >= 3) {
		return [v[0] * s[0], v[1] * s[1], v[2] * s[2]];
	} else {
		return [v[0] * s, v[1] * s, v[2] * s];
	}
}

vec3.inplace_scale = function(v, s) {
	if (s.length !== undefined && s.length >= 3) {
		v[0] *= s[0], v[1] *= s[1], v[2] *= s[2];
	} else {
		v[0] *= s, v[1] *= s, v[2] *= s;
	}
}

/**
* vec3.negate
*/
vec3.negate = function(v) {
	return [ -v[0], -v[1], -v[2] ];
}

vec3.inplace_negate = function(v) {
	v[0] = -v[0], v[1] = -v[1], v[2] = -v[2];
}

/**
* vec3.normalize
*/
vec3.normalize = function(v) {
	var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	if ( Math.abs( 1.0 - l ) > 0.0001 ) {
		var ool = 1.0 / l;
		return [ v[0] * ool, v[1] * ool, v[2] * ool ];
	}
	return v;
}

/**
* vec3.cross 
*/
vec3.cross = function(a, b) {
	return	[	a[1] * b[2] - b[1] * a[2],
				a[2] * b[0] - b[2] * a[0], 
				a[0] * b[1] - b[0] * a[1]	];
}

/**
* vec3.dot 
*/
vec3.dot = function(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
* vec3.lengthSq
*/
vec3.lengthSq = function( v ) {
	return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
}

/**
* vec3.length
*/
vec3.length = function( v ) {
	return Math.sqrt( v[0] * v[0] + v[1] * v[1] + v[2] * v[2] );
}

/**
* vec3.distanceSq
*/
vec3.distanceSq = function(a, b) {
	var diff = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	return diff[0] * diff[0] + diff[1] * diff[1] + diff[2] * diff[2];
}

/**
* vec3.distance
*/
vec3.distance = function( a, b ) {
	var diff = [ a[0] - b[0], a[1] - b[1], a[2] - b[2] ];
	return Math.sqrt( diff[0] * diff[0] + diff[1] * diff[1] + diff[2] * diff[2] );
}

/**
* vec3.angle
*/
vec3.angle = function(a, b) {
	// return angle in radians.
	return Math.acos( vec3.dot( a, b ) ) / ( vec3.length(a) * vec3.length(b) );
}

/**
* vec3.direction
*/
vec3.direction = function(from, to) {
	return vec3.normalize( vec3.sub( to, from ) );
}

/**
* vec3.abs
*/
vec3.abs = function(v) {
	return [ Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2]) ];
}

/**
* vec3.min
*/
vec3.min = function(a, b) {
	return [ Math.min( a[0], b[0] ), Math.min( a[1], b[1] ), Math.min( a[2], b[2] ) ];  
}

/**
* vec3.max
*/
vec3.max = function(a, b) {
	return [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])];
}

/**
* vec3.clamp
*/
vec3.clamp = function(v, vmin, vmax) {
	return vec3.min(vmax, vec3.max(v, vmin));
}

/**
* vec3.equal
*/
vec3.equal = function(a, b, t) {
	if (!t) {
		t = 0.001;
	}
	return ( vec3.distanceSq(a, b) < (t * t) );
}

/**
* vec3.lerp
*/
vec3.lerp = function(a, b, t) {
	return [
		a[0] + (b[0] - a[0]) * t,
		a[1] + (b[1] - a[1]) * t,
		a[2] + (b[2] - a[2]) * t
	];
}
