/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


attribute vec3 vert;
attribute vec3 normal;
attribute vec2 texcoord;

// matrix uniforms
uniform mat4 u_mvMatrix;
uniform vec3 u_eye;
uniform mat4 u_normalMatrix;
uniform mat4 u_projMatrix;
uniform mat4 u_worldMatrix;

uniform mat4 u_shadowLightWorld;
uniform mat4 u_shadowBiasMatrix;
uniform mat4 u_vShadowLight;
uniform vec3 u_lightPos;

// varyings
varying vec4 vNormal;	// w = texcoord.x
varying vec4 vECPos;	// w = texcoord.y
varying vec3 vEyePos;
varying vec4 vShadowCoord;
varying vec2 vEnvTexCoord;
varying float vDiffuseIntensity;

#ifdef PC
void main()
{
	vNormal.w       = texcoord.x;
	vECPos.w		= texcoord.y;
    vEyePos         = u_eye;

//	position normals and vert
	vECPos.xyz	= (u_mvMatrix*vec4(vert, 1.0)).xyz;
	vNormal.xyz = (u_normalMatrix*vec4(normal, 0.0)).xyz;

//	pass along the geo
	gl_Position	= u_projMatrix * vec4(vECPos.xyz, 1.0);
	
 	mat4 shadowMat  = u_shadowBiasMatrix*u_projMatrix*u_vShadowLight*u_worldMatrix;
     vShadowCoord    = shadowMat * vec4(vert, 1.0);
}
#endif

#ifdef DEVICE

void main()
{
	vNormal.w       = texcoord.x;
	vECPos.w		= texcoord.y;
    vEyePos         = u_eye;

//	position normals and vert
	vECPos.xyz	= (u_mvMatrix*vec4(vert, 1.0)).xyz;
	vNormal.xyz = (u_normalMatrix*vec4(normal, 0.0)).xyz;

//	pass along the geo
	gl_Position	= u_projMatrix * vec4(vECPos.xyz, 1.0);
	
 	//mat4 shadowMat  = u_shadowBiasMatrix*u_projMatrix*u_vShadowLight*u_worldMatrix;
    //vShadowCoord    = shadowMat * vec4(vert, 1.0);
     
    // normal mapping
	vec3 normal = normalize(vNormal.xyz);

	// create envmap coordinates
	vec3 r = reflect( vec3(vECPos.xyz - u_eye.xyz), normal);
	float m = 2.0 * length(r);
	vEnvTexCoord = vec2(r.x/m + 0.5, r.y/m + 0.5);
	
	vec3 lightDirection = normalize(u_lightPos - vECPos.xyz);
	vDiffuseIntensity = max(0.0, dot(normal, lightDirection));
	
}

#endif
