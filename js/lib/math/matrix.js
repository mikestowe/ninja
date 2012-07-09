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

Matrix.Scale = function( scaleVec ) {
    var mat = Matrix.I(4);
    mat[ 0] = scaleVec[0];
    mat[ 5] = scaleVec[1];
    mat[10] = scaleVec[2];

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
