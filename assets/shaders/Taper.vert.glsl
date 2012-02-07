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

// scalar uniforms
uniform float u_limit1;
uniform float u_limit2;
uniform float u_limit3;
uniform float u_taperAmount;
uniform float u_center;

uniform vec4 color;


// matrix uniforms
uniform mat4 u_mvMatrix;
uniform mat4 u_projMatrix;
uniform mat4 u_worldMatrix;

varying vec4 v_color;

float TaperAmount( float param )
{
	float y0 = 1.0,  y1 = 1.0,  y2 = 0.0,  y3 = 0.0;
	float yA0 = y0 + param*(y1 - y0),  yA1 = y1 + param*(y2 - y1),  yA2 = y2 + param*(y3 - y2);
	float yB0 = yA0 + param*(yA1 - yA0),  yB1 = yA1 + param*(yA2 - yA1);
	float yC0 = yB0 + param*(yB1 - yB0);

	return yC0;
}

void main(void)
{
	vec3 pos = vert;
	vec2 uv = texcoord;

	v_color = vec4(texcoord.x, texcoord.y, 0, 1);
	if (uv.x > u_limit1)
	{
		if (uv.x < u_limit2)
		{
			float t = (uv.x - u_limit1)/(u_limit2 - u_limit1);
			pos.y = pos.y - pos.y*TaperAmount(t)*u_taperAmount;
		}
		else if (uv.x < u_limit3)
		{
			float t = 1.0 - (uv.x - u_limit2)/(u_limit3 - u_limit2);
			pos.y = pos.y - pos.y*TaperAmount(t)*u_taperAmount;
		}
	}

	gl_Position = u_projMatrix * u_mvMatrix * vec4(pos,1.0) ;
}