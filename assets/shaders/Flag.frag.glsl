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