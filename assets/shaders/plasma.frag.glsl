//
// Fragment shader for procedural bricks
//
// Authors: Dave Baldwin, Steve Koren, Randi Rost
//          based on a shader by Darwyn Peachey
//
// Copyright (c) 2002-2006 3Dlabs Inc. Ltd. 
//
// See 3Dlabs-License.txt for license information
//

#ifdef GL_ES
precision highp float;
#endif


varying vec2 	v_uv;
uniform float 	u_time;
uniform vec4	color;

void main(void)
{
	float x = v_uv.x ;
	float y = v_uv.y ;
	float time = color.x;
	float wave =	(cos(time + y / 0.2  + cos(x / 0.3 + cos((y / 0.1)))));
	float wave1 =	(sin(abs(wave + y/0.6)));
	float wave2 =	(sin(abs(wave1 + y/0.8)));
	float tmp = u_time * 0.1;
	gl_FragColor = vec4( abs(vec3(wave2,wave1,wave)),1.0);
	//gl_FragColor = color;
}	
