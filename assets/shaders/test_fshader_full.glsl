/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


#ifdef GL_ES
precision highp float;
#endif

// lighting uniforms
uniform vec3 u_lightPos;
uniform vec4 u_lightDiff;
uniform vec4 u_lightAmb;

// diffuse map
uniform sampler2D colMap;

// environment map	
uniform sampler2D envMap;

// normal map
uniform sampler2D normalMap;

//material uniforms
uniform vec4   u_matAmbient;
uniform vec4   u_matDiffuse;
uniform vec4   u_matSpecular;
uniform float  u_matShininess;
uniform vec4   u_matEmission;
uniform float  u_renderGlow;

// varyings
varying vec4 vNormal; // w = texcoord.x
varying vec4 vECPos;  // w = texcoord.y
varying vec3 vEyePos;

void main()
{
  vec4 colMapTexel = vec4(texture2D(colMap, vec2(vNormal.w, vECPos.w)).rgb, 1.0);

  // normal mapping
  vec3 normal = normalize(vNormal.xyz);
  vec3 mapNormal = texture2D(normalMap, vec2(vNormal.w, vECPos.w)).xyz * 2.0 - 1.0;
  mapNormal = normalize(mapNormal.x*vec3(normal.z, 0.0, -normal.x) + vec3(0.0, mapNormal.y, 0.0) + mapNormal.z*normal);
  
  // create envmap coordinates
  vec3 r = reflect( normalize(vec3(vECPos.xyz - vEyePos.xyz)), mapNormal);
  float m = 2.0 * sqrt( r.x*r.x + r.y*r.y + r.z*r.z );
  
  // calculate environment map texel
  vec4 envMapTexel = vec4(texture2D(envMap, vec2(r.x/m + 0.5, r.y/m + 0.5)).rgb, 0.0);
  
  // lighting
  vec3 lightDirection = u_lightPos - vECPos.xyz;
  float lightDist = length(lightDirection);
  lightDirection /= lightDist;
  
  float attenuation = clamp(1.0 - lightDist * 0.01, 0.0, 1.0);
  
  vec3 halfVec = normalize(lightDirection + vEyePos);
  
  float diffuseIntensity = max(0.0, dot(mapNormal, lightDirection));
  float specularModifier = max(0.0, dot(mapNormal, halfVec));
  
  float pf;
  if(diffuseIntensity == 0.0)
	pf = 0.0;
  else
	pf = pow(specularModifier, 76.0);
  
  vec4 ambient = u_matAmbient * u_lightAmb;
  vec4 diffuse = u_matDiffuse * (colMapTexel + envMapTexel);

  if (u_renderGlow <= 0.5)
  	diffuse *= u_lightDiff * diffuseIntensity * attenuation;
  
  vec4 specular = 2.0 * pf * envMapTexel;
  
  gl_FragColor = (colMapTexel*(ambient + diffuse)) + specular + vec4(0.0,0.0,0.0,1.0);
}
