#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_tex0;

void main(void)
{
    vec2 uv;

    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / u_resolution.xy;
    float a = atan(p.y,p.x);
    float r = sqrt(dot(p,p));
    float s = r * (1.0+0.8*cos(u_time*1.0));

    uv.x =          .02*p.y+.03*cos(-u_time+a*3.0)/s;
    uv.y = .1*u_time +.02*p.x+.03*sin(-u_time+a*3.0)/s;

    float w = .9 + pow(max(1.5-r,0.0),4.0);

    w*=0.6+0.4*cos(u_time+3.0*a);

    vec3 col =  texture2D(u_tex0,uv).xyz;

    gl_FragColor = vec4(col*w,1.0);
}