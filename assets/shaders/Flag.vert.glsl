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
uniform float u_speed;
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
	float time = u_time * u_speed;
	const float pi = 3.14159;
	float angle = time;

    v_uv = texcoord;

	float x = 2.0*pi*texcoord.x/u_waveWidth;
	float y = 2.0*pi*texcoord.y;

    vec3 v = a_pos;
	v.z  = sin( x + angle );
	v.z += sin( 0.2*y + angle);
	v.z *= u_waveHeight;
	v.z -=  2.0*u_waveHeight;
	v.z *= x * 0.09;
	
    gl_Position = u_projMatrix * u_mvMatrix * vec4(v,1.0) ;
}
