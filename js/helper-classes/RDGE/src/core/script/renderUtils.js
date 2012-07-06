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

var RDGE = RDGE || {};
RDGE.renderUtils = RDGE.renderUtils || {};

/*
*   Creates an indexed box primitive
*  @return a rdge primitive
*/
RDGE.renderUtils.createBox = function () {
    var renderer = RDGE.globals.engine.getContext().renderer;

    var coords =
        [1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1,    // front
                1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1,     // right
                1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, 1,     // top
                -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, // left
                -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, // bottom
                1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1]; // back

    var normals =
        [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,    // front
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // right
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,     // top
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,     // left
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,     // bottom
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1];    // back

    var uvs =
        [1, 1, 0, 1, 0, 0, 1, 0,    // front
            0, 1, 0, 0, 1, 0, 1, 1,    // right
            1, 0, 1, 1, 0, 1, 0, 0,    // top
            1, 1, 0, 1, 0, 0, 1, 0,    // left
            0, 0, 1, 0, 1, 1, 0, 1,    // bottom
            0, 0, 1, 0, 1, 1, 0, 1];   // back

    var indices =
        [0, 1, 2, 0, 2, 3,  // front
            4, 5, 6, 4, 6, 7,   // right
            8, 9, 10, 8, 10, 11,    // top
            12, 13, 14, 12, 14, 15, // left
            16, 17, 18, 16, 18, 19,  // bottom
            20, 21, 22, 20, 22, 23]; // back


    var prim = new RDGE.rdgePrimitiveDefinition();

    prim.vertexDefinition =
            {
                "vert": { 'type': RDGE.rdgeConstants.VS_ELEMENT_POS, 'bufferIndex': 0, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "a_pos": { 'type': RDGE.rdgeConstants.VS_ELEMENT_POS, 'bufferIndex': 0, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },

                "normal": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT3, 'bufferIndex': 1, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "a_nrm": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT3, 'bufferIndex': 1, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },

                "texcoord": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT2, 'bufferIndex': 2, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "a_uv": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT2, 'bufferIndex': 2, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC }
            };

    prim.bufferStreams =
            [
                coords,
                normals,
                uvs
            ];

    prim.streamUsage =
            [
                RDGE.rdgeConstants.BUFFER_STATIC,
                RDGE.rdgeConstants.BUFFER_STATIC,
                RDGE.rdgeConstants.BUFFER_STATIC
            ];

    prim.indexUsage = RDGE.rdgeConstants.BUFFER_STREAM;
    prim.indexBuffer = indices;

    prim.type = RDGE.rdgeConstants.TRIANGLES;

    renderer.createPrimitive(prim);

    return prim;
};

//
// makeSphere
//
// Create a sphere with the passed number of latitude and longitude bands and the passed radius.
// Sphere has vertices, normals and texCoords. Create VBOs for each as well as the index array.
// Return an object with the following properties:
//
//  normalObject        WebGLBuffer object for normals
//  texCoordObject      WebGLBuffer object for texCoords
//  vertexObject        WebGLBuffer object for vertices
//  indexObject         WebGLBuffer object for indices
//  numIndices          The number of indices in the indexObject
//
RDGE.renderUtils.makeSphere = function (ctx, radius, lats, longs) {
    var geometryData = [];
    var normalData = [];
    var texCoordData = [];
    var indexData = [];

    for (var latNumber = 0; latNumber <= lats; ++latNumber) {
        for (var longNumber = 0; longNumber <= longs; ++longNumber) {
            var theta = latNumber * Math.PI / lats;
            var phi = longNumber * 2 * Math.PI / longs;
            var sinTheta = Math.sin(theta);
            var sinPhi = Math.sin(phi);
            var cosTheta = Math.cos(theta);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longs);
            var v = latNumber / lats;

            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            texCoordData.push(u);
            texCoordData.push(v);
            geometryData.push(radius * x);
            geometryData.push(radius * y);
            geometryData.push(radius * z);
        }
    }

    for (var latNumber = 0; latNumber < lats; ++latNumber) {
        for (var longNumber = 0; longNumber < longs; ++longNumber) {
            var first = (latNumber * (longs + 1)) + longNumber;
            var second = first + longs + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    var retval = {};

    retval.normalObject = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.normalObject);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(normalData), ctx.STATIC_DRAW);

    retval.texCoordObject = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.texCoordObject);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(texCoordData), ctx.STATIC_DRAW);

    retval.vertexObject = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.vertexObject);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(geometryData), ctx.STATIC_DRAW);

    retval.numIndices = indexData.length;
    retval.indexObject = ctx.createBuffer();
    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, retval.indexObject);
    ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), ctx.STREAM_DRAW);

    return retval;
};

/*
*   Creates a plane as a grid of triangles/quads, orients the plane according the the plane normal
*   note: the center of the plane is always assumed to be the origin.
*/
RDGE.renderUtils.createPlane = function (numCols, numRows, width, height, uTileCount, vTileCount, planeNormal) {
    var renderer = RDGE.globals.engine.getContext().renderer;

    var pn = [0, 1, 0];
    if (!planeNormal)
        pn = planeNormal;

    var coords = new Array(numCols * numRows * 3);
    var normals = new Array(numCols * numRows * 3);
    var uvs = new Array(numCols * numRows * 2);
    var indices = new Array(numCols * numRows);

    // setup the vertices's in a grid and on the plane
    var coordIdx = 0;
    var uvIdx = 0;

    for (var row = 0; row < numRows; ++row) {
        for (var col = 0; col < numCols; ++col) {
            coords[coordIdx] = col * width - (numCols - 1) * width * 0.5;
            coords[coordIdx + 1] = 0;
            coords[coordIdx + 2] = row * height - (numRows - 1) * height * 0.5;

            normals[coordIdx] = planeNormal[0];
            normals[coordIdx + 1] = planeNormal[1];
            normals[coordIdx + 2] = planeNormal[2];

            uvs[uvIdx] = col / numCols * uTileCount;
            uvs[uvIdx + 1] = row / numRows * vTileCount;

            coordIdx += 3;
            uvIdx += 2;
        }
    }

    // take the grid of vertices's and create triangles
    var k = 0;
    for (var row = 0; row < numRows; ++row) {
        for (var col = 0; col < numCols; ++col) {
            // layout both triangles of the quad
            indices[k + 2] = row * numCols + col;
            indices[k + 1] = row * numCols + (col + 1);
            indices[k] = (row + 1) * numCols + col;

            indices[k + 5] = (row + 1) * numCols + col;
            indices[k + 4] = row * numCols + (col + 1);
            indices[k + 3] = (row + 1) * numCols + (col + 1);

            k += 6;
        }
    }

    // reorient to plane normal

    var prim = new RDGE.rdgePrimitiveDefinition();

    prim.vertexDefinition =
            {
                "vert": { 'type': RDGE.rdgeConstants.VS_ELEMENT_POS, 'bufferIndex': 0, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "a_pos": { 'type': RDGE.rdgeConstants.VS_ELEMENT_POS, 'bufferIndex': 0, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },

                "normal": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT3, 'bufferIndex': 1, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "a_nrm": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT3, 'bufferIndex': 1, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },

                "texcoord": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT2, 'bufferIndex': 2, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "a_uv": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT2, 'bufferIndex': 2, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC }
            };

    prim.bufferStreams =
            [
                coords,
                normals,
                uvs
            ];

    prim.streamUsage =
            [
                RDGE.rdgeConstants.BUFFER_STATIC,
                RDGE.rdgeConstants.BUFFER_STATIC,
                RDGE.rdgeConstants.BUFFER_STATIC
            ];

    prim.indexUsage = RDGE.rdgeConstants.BUFFER_STREAM;
    prim.indexBuffer = indices;

    prim.type = RDGE.rdgeConstants.TRIANGLES;

    renderer.createPrimitive(prim);

    return prim;
};

// creates a cubic volume of points
RDGE.renderUtils.createCubeVolume = function (numCols_x, numLayers_y, numRows_z, x_interval, y_interval, z_interval, optPointsOut) {
    var renderer = RDGE.globals.engine.getContext().renderer;

    var coords = new Array(numCols_x * numRows_z * numLayers_y * 3);
    var indices = new Array(numCols_x * numRows_z * numLayers_y);

    var layerSize = numCols_x * numRows_z * 3;

    var coordIdx = 0;
    var idx = 0;

    for (var layer = 0; layer < numLayers_y; ++layer) {
        for (var row = 0; row < numRows_z; ++row) {
            for (var col = 0; col < numCols_x; ++col) {
                coords[coordIdx] = col * x_interval - (numCols_x - 1) * x_interval * 0.5;
                coords[coordIdx + 1] = layer * y_interval - (numLayers_y - 1) * y_interval * 0.5;
                coords[coordIdx + 2] = row * z_interval - (numRows_z - 1) * z_interval * 0.5;

                coordIdx += 3;

                indices.push(idx++);
            }
        }
    }

    if (optPointsOut) {
        optPointsOut = coords.slice();
    }

    var prim = new RDGE.rdgePrimitiveDefinition();

    prim.vertexDefinition =
            {
                "a_pos": { 'type': RDGE.rdgeConstants.VS_ELEMENT_POS, 'bufferIndex': 0, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC }
            };

    prim.bufferStreams =
            [
                coords
            ];

    prim.streamUsage =
            [
                RDGE.rdgeConstants.BUFFER_DYNAMIC
            ];

    prim.indexUsage = RDGE.rdgeConstants.BUFFER_STREAM;
    prim.indexBuffer = indices;

    prim.type = RDGE.rdgeConstants.POINTS;

    prim.useDoubleBuffer = true;

    renderer.createPrimitive(prim);

    return prim;
};

RDGE.renderUtils.createScreenAlignedQuad = function () {
    var renderer = RDGE.globals.engine.getContext().renderer;

    //  Screen aligned quad
    var coords = [
                  -1.0, 1.0, 0.0,
                  1.0, 1.0, 0.0,
                  -1.0, -1.0, 0.0,

                  -1.0, -1.0, 0.0,
                  1.0, 1.0, 0.0,
                  1.0, -1.0, 0.0
                  ];

    var uvs = [0.0, 0.0,
                0.0, 1.0,
                1.0, 1.0,
                1.0, 1.0,
                1.0, 0.0,
                0.0, 0.0];

    var prim = new RDGE.rdgePrimitiveDefinition();

    prim.vertexDefinition =
            {
                "vert": { 'type': RDGE.rdgeConstants.VS_ELEMENT_POS, 'bufferIndex': 0, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "a_pos": { 'type': RDGE.rdgeConstants.VS_ELEMENT_POS, 'bufferIndex': 0, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },

                "texcoord": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT2, 'bufferIndex': 1, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "a_uv": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT2, 'bufferIndex': 1, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC }
            };

    prim.bufferStreams =
            [
                coords,
                uvs
            ];

    prim.streamUsage =
            [
                RDGE.rdgeConstants.BUFFER_STATIC,
                RDGE.rdgeConstants.BUFFER_STATIC
            ];

    prim.type = RDGE.rdgeConstants.TRIANGLES;

    renderer.createPrimitive(prim);

    return prim;
};
