/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

// Helper function for generating a RDGE primitive
var ShapePrimitive = {};

ShapePrimitive.create = function(coords,  normals,  uvs,  indices, primType, vertexCount) {
	var renderer = RDGE.globals.engine.getContext().renderer;

	// to setup a primitive you must define it
	// create a new primitive definition here to then fill out
	var prim = new RDGE.rdgePrimitiveDefinition();

	// the vertex definition declares how the data will be delivered to the shader
	// the position of an element in array determines which attribute in a shader the
	// data is bound to
	prim.vertexDefinition = {
		// this shows two ways to map this data to an attribute
		"vert":{'type':renderer.VS_ELEMENT_POS, 'bufferIndex':0, 'bufferUsage': renderer.BUFFER_STATIC},
		"a_pos":{'type':renderer.VS_ELEMENT_POS, 'bufferIndex':0, 'bufferUsage': renderer.BUFFER_STATIC},

		"normal":{'type':renderer.VS_ELEMENT_FLOAT3, 'bufferIndex':1, 'bufferUsage': renderer.BUFFER_STATIC},
		"a_nrm":{'type':renderer.VS_ELEMENT_FLOAT3, 'bufferIndex':1, 'bufferUsage': renderer.BUFFER_STATIC},
		"a_normal":{'type':renderer.VS_ELEMENT_FLOAT3, 'bufferIndex':1, 'bufferUsage': renderer.BUFFER_STATIC},

		"texcoord":{'type':renderer.VS_ELEMENT_FLOAT2, 'bufferIndex':2, 'bufferUsage': renderer.BUFFER_STATIC},
		"a_texcoord":{'type':renderer.VS_ELEMENT_FLOAT2, 'bufferIndex':2, 'bufferUsage': renderer.BUFFER_STATIC}
	};

	// the actual data that correlates to the vertex definition
	prim.bufferStreams = [ coords, normals, uvs ];

	// what type of buffers the data resides in, static is the most common case
	prim.streamUsage = [ renderer.BUFFER_STATIC, renderer.BUFFER_STATIC, renderer.BUFFER_STATIC ];

	// this tells the renderer to draw the primitive as a list of triangles
	prim.type = primType;

	prim.indexUsage = renderer.BUFFER_STREAM;
	prim.indexBuffer = indices;

	// finally the primitive is created, buffers are generated and the system determines
	// the data it needs to draw this primitive according to the previous definition
	renderer.createPrimitive(prim, vertexCount);

	return prim;
};

ShapePrimitive.getBounds = function( prim )
{
	var verts = prim.bufferStreams[0];
	var nVerts = verts.length;
	var xMin = verts[0],  xMax = verts[0],
		yMin = verts[1],  yMax = verts[1],
		zMin = verts[2],  zMax = verts[2];

	for (var index=3;  index<verts.length;  )
	{
		if (verts[index] < xMin)  xMin = verts[index];
		else if (verts[index] > xMax)  xMax = verts[index];

		index++;
		if (verts[index] < yMin)  yMin = verts[index];
		else if (verts[index] > yMax)  yMax = verts[index];

		index++;
		if (verts[index] < zMin)  zMin = verts[index];
		else if (verts[index] > zMax)  zMax = verts[index];

		index++;
	}

	return [xMin, yMin, zMin,  xMax, yMax, zMax];
};

if (typeof exports === "object") {
    exports.ShapePrimitive = ShapePrimitive;
}