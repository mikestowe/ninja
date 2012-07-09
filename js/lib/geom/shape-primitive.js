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

ShapePrimitive.getMeshBounds = function( verts,  nVerts )
{
    if (!verts || (nVerts <= 0))  return null;

    var bounds = [verts[0], verts[1], verts[2],  verts[0], verts[1], verts[2]];
    var index = 3;
    for (var i=1;  i<nVerts;  i++)
    {
        var x = verts[index],  y = verts[index+1],  z = verts[index+2];
        index += 3;

        if      (x < bounds[0])  bounds[0] = x;
        else if (x > bounds[3])  bounds[3] = x;
        if      (y < bounds[1])  bounds[1] = y;
        else if (y > bounds[4])  bounds[4] = y;
        if      (z < bounds[2])  bounds[2] = z;
        else if (z > bounds[5])  bounds[5] = z;
    }

    return bounds;
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

ShapePrimitive.refineMesh = function( verts, norms, uvs, indices, nVertices,  paramRange,  tolerance )
{
    var oldVrtCount = nVertices;

    // get the param range
    var pUMin = paramRange[0],  pVMin = paramRange[1],
        pUMax = paramRange[2],  pVMax = paramRange[3];
    var iTriangle = 0;
    var nTriangles = indices.length/3;
    var index = 0;
    while (iTriangle < nTriangles)
    {
        // get the indices of the 3 vertices
        var i0 = indices[index],
            i1 = indices[index+1],
            i2 = indices[index+2];

        // get the uv values
        //var vrtIndex = 3*iTriangle;
        var iuv0 = 2 * i0,
            iuv1 = 2 * i1,
            iuv2 = 2 * i2;
        var u0 = uvs[iuv0],  v0 = uvs[iuv0+1],
            u1 = uvs[iuv1],  v1 = uvs[iuv1+1],
            u2 = uvs[iuv2],  v2 = uvs[iuv2+1];

        // find the u and v range
        var uMin = u0,  vMin = v0;
        if (u1 < uMin)  uMin = u1;  if (v1 < vMin)  vMin = v1;
        if (u2 < uMin)  uMin = u2;  if (v2 < vMin)  vMin = v2;
        var uMax = u0,  vMax = v0;
        if (u1 > uMax)  uMax = u1;  if (v1 > vMax)  vMax = v1;
        if (u2 > uMax)  uMax = u2;  if (v2 > vMax)  vMax = v2;

        // if the parameter range of the triangle is outside the
        // desired parameter range, advance to the next polygon and continue
        if ((uMin > pUMax) || (uMax < pUMin) || (vMin > pVMax) || (vMax < pVMin))
        {
            // go to the next triangle
            iTriangle++;
            index += 3;
        }
        else
        {
            // check thesize of the triangle in uv space.  If small enough, advance
            // to the next triangle.  If not small enough, split the triangle into 3;
			var du = Math.abs(uMax) - uMin,  dv = Math.abs(vMax - vMin);
            if ((du < tolerance) && (dv < tolerance))
            {
                iTriangle++;
                index += 3;
            }
            else    // split the triangle into 4 parts
            {
                //calculate the position of the new vertex
                var iPt0 = 3 * i0,
                    iPt1 = 3 * i1,
                    iPt2 = 3 * i2;
                var x0 = verts[iPt0],  y0 = verts[iPt0+1],  z0 = verts[iPt0+2],
                    x1 = verts[iPt1],  y1 = verts[iPt1+1],  z1 = verts[iPt1+2],
                    x2 = verts[iPt2],  y2 = verts[iPt2+1],  z2 = verts[iPt2+2];

                // calculate the midpoints of the edges
                var xA = (x0 + x1)/2.0,  yA = (y0 + y1)/2.0,  zA = (z0 + z1)/2.0,
                    xB = (x1 + x2)/2.0,  yB = (y1 + y2)/2.0,  zB = (z1 + z2)/2.0,
                    xC = (x2 + x0)/2.0,  yC = (y2 + y0)/2.0,  zC = (z2 + z0)/2.0;

                // calculate the uv values of the new coordinates
                var uA = (u0 + u1)/2.0,  vA = (v0 + v1)/2.0,
                    uB = (u1 + u2)/2.0,  vB = (v1 + v2)/2.0,
                    uC = (u2 + u0)/2.0,  vC = (v2 + v0)/2.0;

                // calculate the normals for the new points
                var nx0 = norms[iPt0],  ny0 = norms[iPt0+1],  nz0 = norms[iPt0+2],
                    nx1 = norms[iPt1],  ny1 = norms[iPt1+1],  nz1 = norms[iPt1+2],
                    nx2 = norms[iPt2],  ny2 = norms[iPt2+1],  nz2 = norms[iPt2+2];
                var nxA = (nx0 + nx1),  nyA = (ny0 + ny1),  nzA = (nz0 + nz1);  var nrmA = VecUtils.vecNormalize(3, [nxA, nyA, nzA], 1.0 ),
                    nxB = (nx1 + nx2),  nyB = (ny1 + ny2),  nzB = (nz1 + nz2);  var nrmB = VecUtils.vecNormalize(3, [nxB, nyB, nzB], 1.0 ),
                    nxC = (nx2 + nx0),  nyC = (ny2 + ny0),  nzC = (nz2 + nz0);  var nrmC = VecUtils.vecNormalize(3, [nxC, nyC, nzC], 1.0 );

                // push everything
                verts.push(xA);  verts.push(yA);  verts.push(zA);
                verts.push(xB);  verts.push(yB);  verts.push(zB);
                verts.push(xC);  verts.push(yC);  verts.push(zC);
                uvs.push(uA),  uvs.push(vA);
                uvs.push(uB),  uvs.push(vB);
                uvs.push(uC),  uvs.push(vC);
                norms.push(nrmA[0]);  norms.push(nrmA[1]);  norms.push(nrmA[2]);
                norms.push(nrmB[0]);  norms.push(nrmB[1]);  norms.push(nrmB[2]);
                norms.push(nrmC[0]);  norms.push(nrmC[1]);  norms.push(nrmC[2]);

                // split the current triangle into 4
                indices[index+1] = nVertices;  indices[index+2] = nVertices+2;
                indices.push(nVertices);    indices.push(i1);           indices.push(nVertices+1);  nTriangles++;
                indices.push(nVertices+1);  indices.push(i2);           indices.push(nVertices+2);  nTriangles++;
                indices.push(nVertices);    indices.push(nVertices+1);  indices.push(nVertices+2);  nTriangles++;
                nVertices += 3;

                // by not advancing 'index', we examine the first of the 3 triangles generated above
            }
        }
    }

    console.log( "refine mesh vertex count " + oldVrtCount  + " => " + nVertices );
    return nVertices;
};

ShapePrimitive.convertTriangleStripToTriangles = function( indices )
{
	if (!indices || (indices.length < 3))  return;

	var indOut = [];
	var nInd = indices.length;
	for (var i=2;  i<nInd;  i++)
	{
		indOut.push( indices[i-2] );
		indOut.push( indices[i-1] );
		indOut.push( indices[i] );
	}

	return indOut;
};

ShapePrimitive.subdivideOversizedMesh = function( vertices, normals, uvs, indices )
{
	var rtnArray;
	var nVrtBytes = vertices.length*4,
		nIndBytes = indices.length*4;

	// only subdivide the input mesh if it exceeds limits
	if ((nVrtBytes >= 65000) || (nIndBytes >= 65000))
	{
		var nVerts = vertices.length / 3;
		var nVerts0 = 0,  nVerts1 = 0;
		var iSplitVrt = nVerts/2;	// any triangle referencing vertex iSplitVrt or greater goes to the second half
		var nTriangles = indices.length/3;
		var v0 = [],  v1 = [],  n0 = [],  n1 = [],  uv0 = [],  uv1 = [],  i0 = [],  i1 = [];
		var map0 = [],  map1 = [];
		var index = 0;
		for (var iTri=0;  iTri<nTriangles;  iTri++)
		{
			// determine which side to move the triangle into
			var vDst,  nDst, uvDst, iDst, mapDst, nOut;
			var iVrts = [ indices[index], indices[index+1], indices[index+2] ];
			if ( (iVrts[0] >= iSplitVrt) || (iVrts[1] >= iSplitVrt) || (iVrts[2] >= iSplitVrt) )
			{
				vDst  = v0;  nDst = n0;  uvDst = uv0;  iDst = i0;  mapDst = map0;  nOut = v0.length / 3;
			}
			else
			{
				vDst  = v1;  nDst = n1;  uvDst = uv1;  iDst = i1;  mapDst = map1;  nOut = v1.length / 3;
			}

			for (var i=0;  i<3;  i++)
			{
				var iVrt = iVrts[i];

				// if this is the first time that the vertex has been encountered, copy it over to the output
				var iOut = mapDst[iVrt];
				if (!iOut)
				{
					mapDst[iVrt] = nOut;
					vDst.push( vertices[3*iVrt] );  vDst.push(  vertices[3*iVrt + 1] );  vDst.push(  vertices[3*iVrt + 2] );
					nDst.push( normals[3*iVrt] );   nDst.push(  normals[3*iVrt + 1] );   nDst.push(  normals[3*iVrt + 2] );
					uvDst.push( uvs[2*iVrt] );      uvDst.push(  uvs[2*iVrt + 1] );
					iDst.push( nOut );
					nOut++;
				}
				else
					iDst.push( iOut );
			}

			index += 3;
		}

		// create objects out of the 2 halves
		var obj1 = 
					{
						vertices:	v0,
						normals:	n0,
						uvs:		uv0,
						indices:	i0
					},
			obj2 = 
			{
				vertices:	v1,
				normals:	n1,
				uvs:		uv1,
				indices:	i1
			};

		console.log( "mesh split into 2 parts: " + obj1.vertices.length/3 + ", " + obj2.vertices.length/3 );

		// recurse on the 2 halves in case they need subdivision
		var arr1 = ShapePrimitive.subdivideOversizedMesh( obj1.vertices, obj1.normals, obj1.uvs, obj1.indices );
		var arr2 = ShapePrimitive.subdivideOversizedMesh( obj2.vertices, obj2.normals, obj2.uvs, obj2.indices );
		rtnArray = arr1.concat( arr2 );
	}
	else
	{
		rtnArray = 
		[
			{
				vertices:	vertices,
				normals:	normals,
				uvs:		uvs,
				indices:	indices
			}
		];
	}

	return rtnArray;
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

ShapePrimitive.convertTrianglesToLines = function( verts, norms, uvs, indices,   vertsOut, normsOut,  uvsOut, indicesOut )
{
	var iTriangle = 0;
	var nTriangles = indices.length/3;
	var index = 0;
	var nVertices = 0;
	while (iTriangle < nTriangles)
	{
		// get the indices of the 3 vertices
		var i0 = indices[index],
			i1 = indices[index+1],
			i2 = indices[index+2];

		// get the uv values
		//var vrtIndex = 3*iTriangle;
		var iuv0 = 2 * i0,
			iuv1 = 2 * i1,
			iuv2 = 2 * i2;
		var u0 = uvs[iuv0],  v0 = uvs[iuv0+1],
			u1 = uvs[iuv1],  v1 = uvs[iuv1+1],
			u2 = uvs[iuv2],  v2 = uvs[iuv2+1];

		//calculate the position of the new vertex
		var iPt0 = 3 * i0,
			iPt1 = 3 * i1,
			iPt2 = 3 * i2;
		var x0 = verts[iPt0],  y0 = verts[iPt0+1],  z0 = verts[iPt0+2],
			x1 = verts[iPt1],  y1 = verts[iPt1+1],  z1 = verts[iPt1+2],
			x2 = verts[iPt2],  y2 = verts[iPt2+1],  z2 = verts[iPt2+2];

		// calculate the normals for the new points
		var nx0 = norms[iPt0],  ny0 = norms[iPt0+1],  nz0 = norms[iPt0+2],
			nx1 = norms[iPt1],  ny1 = norms[iPt1+1],  nz1 = norms[iPt1+2],
			nx2 = norms[iPt2],  ny2 = norms[iPt2+1],  nz2 = norms[iPt2+2];

		// push everything
		vertsOut.push( x0 );		vertsOut.push( y0 );		vertsOut.push( z0 );
		vertsOut.push( x1 );		vertsOut.push( y1 );		vertsOut.push( z1 );
		vertsOut.push( x1 );		vertsOut.push( y1 );		vertsOut.push( z1 );
		vertsOut.push( x2 );		vertsOut.push( y2 );		vertsOut.push( z2 );
		vertsOut.push( x2 );		vertsOut.push( y2 );		vertsOut.push( z2 );
		vertsOut.push( x0 );		vertsOut.push( y0 );		vertsOut.push( z0 );
		indicesOut.push( index );		indicesOut.push( index + 1 );
		indicesOut.push( index + 1 );	indicesOut.push( index + 2 );
		indicesOut.push( index + 2 );	indicesOut.push( index );

		normsOut.push( nx0 );		normsOut.push( ny0 );		normsOut.push( nz0 );
		normsOut.push( nx1 );		normsOut.push( ny1 );		normsOut.push( nz1 );
		normsOut.push( nx1 );		normsOut.push( ny1 );		normsOut.push( nz1 );
		normsOut.push( nx2 );		normsOut.push( ny2 );		normsOut.push( nz2 );
		normsOut.push( nx2 );		normsOut.push( ny2 );		normsOut.push( nz2 );
		normsOut.push( nx0 );		normsOut.push( ny0 );		normsOut.push( nz0 );

		uvsOut.push( u0 );		uvsOut.push( v0 );
		uvsOut.push( u1 );		uvsOut.push( v1 );
		uvsOut.push( u1 );		uvsOut.push( v1 );
		uvsOut.push( u2 );		uvsOut.push( v2 );
		uvsOut.push( u2 );		uvsOut.push( v2 );
		uvsOut.push( u0 );		uvsOut.push( v0 );

		iTriangle++;
		index += 3;
		nVertices += 6;
	}

	return nVertices;
};



if (typeof exports === "object") {
    exports.ShapePrimitive = ShapePrimitive;
}
