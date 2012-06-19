/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_tex0;

varying vec2 v_uv;

void main(void)
{
    vec3 col = texture2D(u_tex0, v_uv).xyz;
    gl_FragColor = vec4(col,1.0);
}