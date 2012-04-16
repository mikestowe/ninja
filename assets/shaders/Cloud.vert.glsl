/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


#ifdef GL_ES
precision highp float;
#endif

// attributes
attribute vec3	a_pos;
attribute vec2  texcoord;

// uniforms
uniform float u_time;
uniform float u_zmin;
uniform float u_zmax;
uniform float u_surfaceAlpha;

// matrix uniforms
uniform mat4 u_mvMatrix;
uniform mat4 u_projMatrix;
uniform mat4 u_worldMatrix;

// varying
varying vec2	v_texCoord0;

// constants
const float zSpeed = 2.0;


void main()
{
    // Transform position
	vec4 pos = vec4(a_pos,1);
	float dz = u_time*zSpeed;
	float n = floor( dz/(u_zmax-u_zmin) );
	dz -= n*(u_zmax - u_zmin);
	float z = pos.z + dz;
	if (z > u_zmax)
	{
		z = u_zmin + (z - u_zmax);
	}
	pos.z = z;
	gl_Position = u_projMatrix * u_mvMatrix * pos;
	    
    v_texCoord0 = texcoord;
}