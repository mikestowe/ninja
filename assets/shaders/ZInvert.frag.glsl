#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_tex0;

void main(void)
{
    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / u_resolution.xy;
    vec2 uv;

    float a = atan(p.y,p.x);
    float r = sqrt(dot(p,p));

    uv.x = cos(0.6+u_time) + cos(cos(1.2+u_time)+a)/r;
    uv.y = cos(0.3+u_time) + sin(cos(2.0+u_time)+a)/r;

    vec3 col =  texture2D(u_tex0,uv*.25).xyz;

    gl_FragColor = vec4(col*r*r,1.0);
}