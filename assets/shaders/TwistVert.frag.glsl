/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


#ifdef GL_ES
precision highp float;
#endif

// texture sampler uniforms
uniform sampler2D u_tex0;
uniform sampler2D u_tex1;

//uniform vec4 color;
//varying vec4 v_color;
varying float v_zNormal;
varying vec2 v_texcoord;


void main()
{
    vec3 col;
	if (v_zNormal >= 0.0)
		col = texture2D(u_tex0, v_texcoord).xyz;
	else
		col = texture2D(u_tex1, v_texcoord).xyz;

    gl_FragColor = vec4(col, 1.0);
}
