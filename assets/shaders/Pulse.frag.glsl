#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_tex0;

void main(void)
{
    vec2 halfres = u_resolution.xy/2.0;
    vec2 cPos = gl_FragCoord.xy;

    cPos.x -= 0.5*halfres.x*sin(u_time/2.0)+0.3*halfres.x*cos(u_time)+halfres.x;
    cPos.y -= 0.4*halfres.y*sin(u_time/5.0)+0.3*halfres.y*cos(u_time)+halfres.y;
    float cLength = length(cPos);

    vec2 uv = gl_FragCoord.xy/u_resolution.xy+(cPos/cLength)*sin(cLength/30.0-u_time*10.0)/25.0;
    vec3 col = texture2D(u_tex0,uv).xyz*50.0/cLength;

    gl_FragColor = vec4(col,1.0);
}