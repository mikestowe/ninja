/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_tex0;
uniform float u_surfaceAlpha;

varying vec2	v_texCoord0;


void main()
{
	vec4 c = texture2D(u_tex0, v_texCoord0);
	//c.a *= u_surfaceAlpha;
	if ((c.r == 0.0) && (c.b == 0.0) && (c.g == 0.0) && (c.a == 1.0))  c = vec4( 0.0, 0.0, 1.0, 1.0 );
	gl_FragColor = c;
}    
  