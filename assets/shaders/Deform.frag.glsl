#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform float u_speed;
uniform vec2 u_resolution;
//uniform vec4 mouse;
uniform sampler2D u_tex0;

void main(void)
{
    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / u_resolution.xy;
    //vec2 m = -1.0 + 2.0 * mouse.xy / u_resolution.xy;
	vec2 m = vec2(-.8, .8);

    float a1 = atan(p.y-m.y,p.x-m.x);
    float r1 = sqrt(dot(p-m,p-m));
    float a2 = atan(p.y+m.y,p.x+m.x);
    float r2 = sqrt(dot(p+m,p+m));

    vec2 uv;
    uv.x = 0.2*u_time*u_speed + (r1-r2)*0.25;
    uv.y = sin(2.0*(a1-a2));

    float w = r1*r2*0.8;
    vec3 col = texture2D(u_tex0,uv).xyz;

    gl_FragColor = vec4(col/(.1+w),1.0);
}