/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


#ifdef GL_ES
precision highp float;
#endif


// attributes
attribute vec3 vert;
attribute vec3 normal;
attribute vec2 texcoord;

// matrix uniforms
uniform mat4 u_mvMatrix;
uniform mat4 u_projMatrix;

varying		vec2	v_uv;

void main(void)
{
	gl_Position = u_projMatrix * u_mvMatrix * vec4(vert,1.0) ;
	v_uv = texcoord;
}