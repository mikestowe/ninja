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

if (typeof exports === "object") {
    exports.ShapePrimitive = ShapePrimitive;
}