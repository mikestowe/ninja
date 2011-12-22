/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

// Constructor function
function Vector() {}
Vector.create = function(elements)
{
	var rtn;
  if (elements)
	rtn = elements.slice( 0 );
  else
	rtn = [];

  return rtn;
};

Vector.dup = function(srcPt)
{
	return srcPt.slice(0);
}



function Matrix() {}

Matrix.create = function( rowArray )
{
	var mat = Matrix.I(4);
	var index = 0;
	for(var j=0;  j<4;  j++)
	{
		for (var i=0;  i<4;  i++)
		{
			mat[index] = rowArray[i][j];
			index++;
		}
	}

	return mat;
}
Matrix.I = function(dimen)
{
	var mat = [];
	for (var i=0;  i<dimen*dimen;  i++)  mat.push(0);

	var index = 0;
	for (var i=0;  i<dimen;  i++)
	{
		mat[index] = 1.0;
		index += dimen + 1;
	}
	
	return mat;	
}

Matrix.Translation = function (vec)
{
	var mat = Matrix.I(4);
	glmat4.translate(mat, vec);
	return mat;
}

Matrix.RotationX = function( angle )
{
	var mat = Matrix.I(4);
	glmat4.rotateX(mat, angle);
	return mat;
}

Matrix.RotationY = function( angle )
{
	var mat = Matrix.I(4);
	glmat4.rotateY(mat, angle);
	return mat;
}

Matrix.RotationZ = function( angle )
{
	var mat = Matrix.I(4);
	glmat4.rotateZ(mat, angle);
	return mat;
}

Matrix.Rotation = function(angle, axis)
{
    var mat = Matrix.I(4);
    glmat4.rotate(mat, angle, axis);
    return mat;
}
Matrix.flatten = function (mat)
{
    var result = [];
    if (this.elements.length == 0)
        return [];

	for (var i=0;  i<16;  i++)  result.push(mat[i]);
//    for (var j = 0; j < this.elements[0].length; j++)
//        for (var i = 0; i < this.elements.length; i++)
//            result.push(this.elements[i][j]);

    return result;
}

/*
Matrix.ensure4x4 = function()
{
    if (this.elements.length == 4 &&
        this.elements[0].length == 4)
        return this;

    if (this.elements.length > 4 ||
        this.elements[0].length > 4)
        return null;

    for (var i = 0; i < this.elements.length; i++) {
        for (var j = this.elements[i].length; j < 4; j++) {
            if (i == j)
                this.elements[i].push(1);
            else
                this.elements[i].push(0);
        }
    }

    for (var i = this.elements.length; i < 4; i++) {
        if (i == 0)
            this.elements.push([1, 0, 0, 0]);
        else if (i == 1)
            this.elements.push([0, 1, 0, 0]);
        else if (i == 2)
            this.elements.push([0, 0, 1, 0]);
        else if (i == 3)
            this.elements.push([0, 0, 0, 1]);
    }

    return this;
};

Matrix.prototype.make3x3 = function()
{
    if (this.elements.length != 4 ||
        this.elements[0].length != 4)
        return null;

    return Matrix.create([[this.elements[0][0], this.elements[0][1], this.elements[0][2]],
                          [this.elements[1][0], this.elements[1][1], this.elements[1][2]],
                          [this.elements[2][0], this.elements[2][1], this.elements[2][2]]]);
};
*/

/*
/////////////////////////////////////////////////////////////////////////////////////////////
// SMatrix

SMatrix.Translation = function (vec)
{
	var mat = SMatrix.I(4);
	mat.elements[0][3] = vec[0];
	mat.elements[1][3] = vec[1];
	mat.elements[2][3] = vec[2];
	return mat;
}

SMatrix.RotationX = function( angle )
{
	var mat = SMatrix.I(4);
	mat.rotateX(angle);
	return mat;
}

SMatrix.RotationY = function( angle )
{
	var mat = SMatrix.I(4);
	mat.rotateX(angle);
	return mat;
}

SMatrix.RotationZ = function( angle )
{
	var mat = SMatrix.I(4);
	mat.rotateZ(angle);
	return mat;
}

SMatrix.MatrixtoSMatrix = function( mat )
{
	var smat = SMatrix.I(4);
	var index = 0;
	for (var j=0;  j<4;  j++)
	{
		for (var i=0;  i<4;  i++)
		{
			smat.elements[i][j] = mat[index];
			index++;
		}
	}

	return smat;
}

SMatrix.MatEqSMat = function( mat, sMat )
{
	var index = 0;
	for (var j=0;  j<4;  j++)
	{
		for (var i=0;  i<4;  i++)
		{
			var m = mat[index];
			var s = smat.elements[i][j];
			if ( MathUtils.fpCmp(m,s) != 0)
				throw new Error( "mat != smat" );
			index++;
		}
	}
}

// Matrix
/////////////////////////////////////////////////////////////////////////////////////////////
*/

Vector.prototype.flatten = function ()
{
    return this.elements;
};

function mht(m) {
    var s = "";
    if (m.length == 16) {
        for (var i = 0; i < 4; i++) {
            s += "<span style='font-family: monospace'>[" + m[i*4+0].toFixed(4) + "," + m[i*4+1].toFixed(4) + "," + m[i*4+2].toFixed(4) + "," + m[i*4+3].toFixed(4) + "]</span><br>";
        }
    } else if (m.length == 9) {
        for (var i = 0; i < 3; i++) {
            s += "<span style='font-family: monospace'>[" + m[i*3+0].toFixed(4) + "," + m[i*3+1].toFixed(4) + "," + m[i*3+2].toFixed(4) + "]</font><br>";
        }
    } else {
        return m.toString();
    }
    return s;
}

//
// gluLookAt
//
function makeLookAt(ex, ey, ez,
                    cx, cy, cz,
                    ux, uy, uz)
{
    var eye = $V([ex, ey, ez]);
    var center = $V([cx, cy, cz]);
    var up = $V([ux, uy, uz]);

    var mag;

    var z = eye.subtract(center).toUnitVector();
    var x = up.cross(z).toUnitVector();
    var y = z.cross(x).toUnitVector();

    var m = $M([[x.e(1), x.e(2), x.e(3), 0],
                [y.e(1), y.e(2), y.e(3), 0],
                [z.e(1), z.e(2), z.e(3), 0],
                [0, 0, 0, 1]]);

    var t = $M([[1, 0, 0, -ex],
                [0, 1, 0, -ey],
                [0, 0, 1, -ez],
                [0, 0, 0, 1]]);
    return m.x(t);
}

//
// gluPerspective
//
function makePerspective(fovy, aspect, znear, zfar)
{
    var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
    var ymin = -ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
}

//
// glFrustum
//
function makeFrustum(left, right,
                     bottom, top,
                     znear, zfar)
{
    var X = 2*znear/(right-left);
    var Y = 2*znear/(top-bottom);
    var A = (right+left)/(right-left);
    var B = (top+bottom)/(top-bottom);
    var C = -(zfar+znear)/(zfar-znear);
    var D = -2*zfar*znear/(zfar-znear);

    return Matrix.create([[X, 0, A, 0],
               [0, Y, B, 0],
               [0, 0, C, D],
               [0, 0, -1, 0]]);
}

//
// glOrtho
//
function makeOrtho(left, right, bottom, top, znear, zfar)
{
    var tx = - (right + left) / (right - left);
    var ty = - (top + bottom) / (top - bottom);
    var tz = - (zfar + znear) / (zfar - znear);

    return $M([[2 / (right - left), 0, 0, tx],
           [0, 2 / (top - bottom), 0, ty],
           [0, 0, -2 / (zfar - znear), tz],
           [0, 0, 0, 1]]);
}
