/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */


#ifdef GL_ES
precision highp float;
#endif

// attributes
attribute vec3	a_pos;
attribute vec2  texcoord;

// uniforms
uniform float u_time;
uniform float u_zmin;
uniform float u_zmax;
uniform float u_surfaceAlpha;

// matrix uniforms
uniform mat4 u_mvMatrix;
uniform mat4 u_projMatrix;

// varying
varying vec2	v_texCoord0;

// constants
const float zSpeed = 10.0;


void main()
{
    // Transform position
	vec4 pos = vec4(a_pos,1);

	float dz = u_time*zSpeed;
	float n = floor( dz/(u_zmax-u_zmin) );
	dz -= n*(u_zmax - u_zmin);
	float z = pos.z + dz;
	if (z > u_zmax)
	{
		z = u_zmin + (z - u_zmax);
	}
	pos.z = z;

	gl_Position = u_projMatrix * u_mvMatrix * pos;
	    
    v_texCoord0 = texcoord;
}
