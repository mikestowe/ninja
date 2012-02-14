/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

MAX_VAL = 1e+38;

function box()
{
  this.min = [MAX_VAL, MAX_VAL, MAX_VAL];
  this.max = [-MAX_VAL, -MAX_VAL, -MAX_VAL];
}

box.prototype.addBox = function(a)
{
  this.min = vec3.min( this.min, a.min );
  this.max = vec3.max( this.max, a.max );
//  this.min = vec3.min( this.min, a.min );
//  this.max = vec3.max( this.max, a.max );
}

box.prototype.addVec3 = function(a)
{
  this.min = vec3.min( this.min, a );
  this.max = vec3.max( this.max, a );
}

box.prototype.set = function(min, max)
{
  this.min[0] = min[0];
  this.min[1] = min[1];
  this.min[2] = min[2];
  this.max[0] = max[0];
  this.max[1] = max[1];
  this.max[2] = max[2];
}

box.prototype.reset = function()
{
  this.min[0] = MAX_VAL;
  this.min[1] = MAX_VAL;
  this.min[2] = MAX_VAL;
  this.max[0] = -MAX_VAL;
  this.max[1] = -MAX_VAL;
  this.max[2] = -MAX_VAL;
}

box.prototype.getCenter = function()
{
  return [0.5*(this.min[0]+this.max[0]), 0.5*(this.min[1]+this.max[1]), 0.5*(this.min[2]+this.max[2])];
}

box.prototype.isVisible = function(frustum)
{
	var center = this.getCenter();
	var radius = vec3.distance( this.max, center );
	//  var diag = vec3.sub( this.max, center );
	
	var i = 0;
	while(i < frustum.length) {
	    var plane = frustum[i];
		var dist = vec3.dot( plane, center ) + plane[3];
		if( dist < -radius ) {
			return false;
		}
		i++;
	}

	return true;
}

box.prototype.isValid = function()
{
  return !(this.min[0] > this.max[0] || this.min[1] > this.max[1] || this.min[2] > this.max[2]);
}

box.prototype.transform = function(mat) {
	var out = new box();
	var pts = [];
	pts.push( [ this.min[0], this.min[1], this.min[2] ] );
	pts.push( [ this.min[0], this.max[1], this.min[2] ] );
	pts.push( [ this.max[0], this.max[1], this.min[2] ] );
	pts.push( [ this.max[0], this.min[1], this.min[2] ] );
	pts.push( [ this.min[0], this.min[1], this.max[2] ] );
	pts.push( [ this.min[0], this.max[1], this.max[2] ] );
	pts.push( [ this.max[0], this.max[1], this.max[2] ] );
	pts.push( [ this.max[0], this.min[1], this.max[2] ] );
	
	var i = pts.length - 1;
	do {
		out.addVec3( mat4.transformPoint( mat, pts[i] ) );
	} while(i--);
	
	return out;
}
/*
box.prototype.transform = function(mat) {
	var newBox = new box();
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
}
*/