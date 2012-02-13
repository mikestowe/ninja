/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

#ifdef GL_ES
precision highp float;
#endif

uniform vec4	u_color1;									
uniform vec4	u_color2;									
uniform vec4	u_color3;									
uniform vec4	u_color4;									
uniform float	u_colorStop1;									
uniform float	u_colorStop2;									
uniform float	u_colorStop3;									
uniform float	u_colorStop4;									
uniform vec2	u_cos_sin_angle;
//uniform int		u_colorCount;	// currently using all 4
	
varying	vec2	v_uv;

void main(void)
{
	vec2 pt = vec2( v_uv.x - 0.5,  v_uv.y - 0.5);
	float t = sqrt( dot(pt, pt) );

	vec4 color;
	if (t < u_colorStop1)
		color = u_color1;
	else if (t < u_colorStop2)
	{
		float tLocal = (t - u_colorStop1)/(u_colorStop2 - u_colorStop1);
		color = mix(u_color1,u_color2,tLocal);
	}
	else if (t < u_colorStop3)
	{
		float tLocal = (t - u_colorStop2)/(u_colorStop3 - u_colorStop2);
		color = mix(u_color2,u_color3,tLocal);
	}
	else if (t < u_colorStop4)
	{
		float tLocal = (t - u_colorStop3)/(u_colorStop4 - u_colorStop3);
		color = mix(u_color3,u_color4,tLocal);
	}
	else
		color = u_color4;

	gl_FragColor = color;
}
