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
uniform float u_twistAmount;
//uniform float u_center;

// texture sampler uniforms
uniform sampler2D u_tex0;
uniform sampler2D u_tex1;

uniform vec4 color;


// matrix uniforms
uniform mat4 u_mvMatrix;
uniform mat4 u_projMatrix;
uniform mat4 u_worldMatrix;

//varying vec4 v_color;
varying float v_zNormal;
varying vec2 v_texcoord;


float GetAngle( float t )
{
	float angle= 0.0;
	if (t < u_limit2)
	{
		if (t < u_limit1)
		{
			angle = u_twistAmount;
		}
		else
		{
			angle = (t - u_limit2)/(u_limit1 - u_limit2)*u_twistAmount;
		}
	}

	return angle;
}


void main(void)
{
	vec3 pos = vert;
	vec2 uv = texcoord;
	v_texcoord = texcoord;

	v_zNormal = 1.0;
	if (uv.x < u_limit2)
	{
		float angle = GetAngle( uv.x );
		float cs = cos(angle),  sn = sin(angle);

		vec3 ctrPt = pos;
		float y = pos.y*cs - pos.z*sn;	// + u_center;
		pos.z   = pos.y*sn + pos.z*cs;
		pos.y = y;

		// rotate the normal
		mat3 rotMat = mat3( vec3( 1.0,  0.0,  0.0 ),  vec3( 0.0,   cs,   sn ),  vec3( 0.0,  -sn,   cs ) );
		vec3 pt0 = ctrPt, pt1 = vec3(ctrPt.x, ctrPt.y+1.0, ctrPt.z),  pt2 = vec3( ctrPt.x+1.0, ctrPt.y, ctrPt.z);
		pt0 = rotMat * pt0;  pt1 = rotMat * pt1;
		angle = GetAngle(1.0);
		cs = cos(angle); sn = sin(angle);
		rotMat = mat3( vec3( 1.0,  0.0,  0.0 ),  vec3( 0.0,   cs,   sn ),  vec3( 0.0,  -sn,   cs ) );
		pt2 = rotMat * pt2;
		vec4 nrm = vec4( cross(pt1-pt0, pt2-pt0), 1.0 );
		v_zNormal   = -nrm.z;
	}

	gl_Position = u_projMatrix * u_mvMatrix * vec4(pos,1.0) ;
}