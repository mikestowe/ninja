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

//uniform mat4 u_shadowLightWorld;
//uniform mat4 u_shadowBiasMatrix;
//uniform mat4 u_vShadowLight;
//uniform vec3 u_lightPos;

// matrix uniforms
uniform mat4 u_mvMatrix;
uniform vec3 u_eye;
uniform mat4 u_normalMatrix;
uniform mat4 u_projMatrix;
uniform mat4 u_worldMatrix;

uniform vec4	u_color1;									
uniform vec4	u_color2;									
uniform vec4	u_color3;									
uniform vec4	u_color4;									
uniform float	u_colorStop1;									
uniform float	u_colorStop2;									
uniform float	u_colorStop3;									
uniform float	u_colorStop4;									
uniform vec2	u_cos_sin_angle;
//uniform int		u_colorCount;	// currently using 4
uniform mat3 u_texTransform;

varying		vec2 v_uv;


void main(void)
{
	gl_Position = u_projMatrix * u_mvMatrix * vec4(vert,1.0) ;
	//v_uv = texcoord;
	vec3 tmp = u_texTransform * vec3( texcoord, 1.0);
	v_uv = tmp.xy;
}
