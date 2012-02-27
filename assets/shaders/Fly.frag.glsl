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

    float an = u_time*.25;

    float x = p.x*cos(an)-p.y*sin(an);
    float y = p.x*sin(an)+p.y*cos(an);
     
    uv.x = .25*x/abs(y);
    uv.y = .20*u_time + .25/abs(y);

    gl_FragColor = vec4(texture2D(u_tex0,uv).xyz * y*y, 1.0);
}
