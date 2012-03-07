/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Matrix = function Matrix() {

};

Matrix.create = function( rowArray ) {
	var mat = Matrix.I(4);
	var index = 0;
	for(var j=0;  j<4;  j++) {
		for (var i=0;  i<4;  i++) {
			mat[index] = rowArray[i][j];
			index++;
		}
	}

	return mat;
};

Matrix.I = function(dimen) {
	var mat = [];

	for (var i = 0; i<dimen*dimen; i++)  {
        mat.push(0);
    }

	var index = 0;
	for (var j = 0; j<dimen; j++) {
		mat[index] = 1.0;
		index += dimen + 1;
	}
	
	return mat;	
};

Matrix.Translation = function (vec) {
	var mat = Matrix.I(4);
	glmat4.translate(mat, vec);
	return mat;
};

Matrix.RotationX = function( angle ) {
	var mat = Matrix.I(4);
	glmat4.rotateX(mat, angle);
	return mat;
};

Matrix.RotationY = function( angle ) {
	var mat = Matrix.I(4);
	glmat4.rotateY(mat, angle);
	return mat;
};

Matrix.RotationZ = function( angle ) {
	var mat = Matrix.I(4);
	glmat4.rotateZ(mat, angle);
	return mat;
};

Matrix.Rotation = function(angle, axis) {
    var mat = Matrix.I(4);
    glmat4.rotate(mat, angle, axis);
    return mat;
};

Matrix.flatten = function (mat) {
    var result = [];
    if (this.elements.length == 0) {
        return [];
    }

	for (var i=0; i<16; i++) {
        result.push(mat[i]);
    }

    return result;
};

Matrix.makePerspective = function (fovy, aspect, znear, zfar) {
    var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
    var ymin = -ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    //return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);

    var X = 2*znear/(xmax-xmin);
    var Y = 2*znear/(ymax-ymin);
    var A = (xmax+xmin)/(xmax-xmin);
    var B = (ymax+ymin)/(ymax-ymin);
    var C = -(zfar+znear)/(zfar-znear);
    var D = -2*zfar*znear/(zfar-znear);

    return Matrix.create([[X, 0, A, 0], [0, Y, B, 0], [0, 0, C, D], [0, 0, -1, 0]]);

};

// Namepace this class
// TODO
window.Matrix = Matrix;
