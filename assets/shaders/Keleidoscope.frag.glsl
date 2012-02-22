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

    uv.x =          7.0*a/3.1416;
    uv.y = -u_time+ sin(7.0*r+u_time) + .7*cos(u_time+7.0*a);

    float w = .5+.5*(sin(u_time+7.0*r)+ .7*cos(u_time+7.0*a));

    vec3 col =  texture2D(u_tex0,uv*.5).xyz;

    gl_FragColor = vec4(col*w,1.0);
}