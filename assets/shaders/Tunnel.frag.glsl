#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform sampler2D u_tex0;

void main(void)
{
    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / u_resolution.xy;
    vec2 uv;
   
    float a = atan(p.y,p.x);
    float r = sqrt(dot(p,p));

    uv.x = .75*u_time*u_speed + .1/r;
    uv.y = a/3.1416;

    vec3 col =  texture2D(u_tex0,uv).xyz;

    gl_FragColor = vec4(col*r,1.0);
}