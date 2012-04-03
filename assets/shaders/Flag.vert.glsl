/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


#ifdef GL_ES
precision highp float;
#endif


// attributes
attribute vec3 a_pos;
attribute vec2 texcoord;

// scalar uniforms
uniform float u_time;
uniform float u_waveWidth;
uniform float u_waveHeight;

// matrix uniforms
uniform mat4 u_mvMatrix;
uniform mat4 u_projMatrix;
uniform mat4 u_worldMatrix;

// varying variables
varying vec2 v_uv;

void main()
{
    float pi = 3.14159;
	float angle = mod(u_time, pi)*2.0;

    vec3 v = a_pos;
    v_uv = texcoord;

    vec2 pos = texcoord;
    float tmp = pos.x;  pos.x = pos.y;  pos.y = tmp;
    pos.x = pos.x * 1.0*pi * u_waveWidth;
    pos.y = pos.y * 1.0*pi * u_waveWidth;

	v.z  = sin( pos.x + angle);
	v.z += sin( pos.y/2.0 + angle);
	v.z *= v.y * 0.09 * u_waveHeight;
	
    gl_Position = u_projMatrix * u_mvMatrix * vec4(v,1.0) ;
}
