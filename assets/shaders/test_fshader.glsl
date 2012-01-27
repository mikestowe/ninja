/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


#ifdef GL_ES
precision highp float;
#endif

// lighting uniforms
uniform vec3 u_light0Pos;
uniform vec4 u_light0Diff;
uniform vec4 u_light0Amb;

// diffuse map
uniform sampler2D colMap;

// environment map	
uniform sampler2D envMap;

// normal map
uniform sampler2D normalMap;

// glow map
uniform sampler2D glowMap;

// glow map
uniform sampler2D depthMap;

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
varying vec4 vShadowCoord;
varying vec2 vEnvTexCoord;
varying float vDiffuseIntensity;

#ifdef PC

void main()
{
 	vec4 rgba_depth = texture2D(depthMap, vShadowCoord.xy/vShadowCoord.w, -32.0);
 	const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);
 	float dist = vShadowCoord.w/200.0;
 	float d = dot(rgba_depth, bit_shift);
	float shadowCoef = (dist > d + 0.00779) ? (0.6) : (1.0);
	
  vec4 colMapTexel = vec4(0);
  if (u_renderGlow <= 0.5) {
    colMapTexel = vec4(texture2D(colMap, vec2(vNormal.w, vECPos.w)).rgb, 1.0);
  } else {
    colMapTexel = vec4(texture2D(glowMap, vec2(vNormal.w, vECPos.w)).rgb, 1.0);
  }

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
  vec3 lightDirection = u_light0Pos - vECPos.xyz;
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
  
  vec4 ambient = u_matAmbient * u_light0Amb;

  vec4 diffuse = u_matDiffuse * (colMapTexel + envMapTexel)*shadowCoef;

  if (u_renderGlow <= 0.5) {
  	diffuse *= u_light0Diff;
  }
  
  vec4 specular = 2.0 * pf * envMapTexel;
  
  //gl_FragColor = vec4(dist, dist, dist, 1.0);
  gl_FragColor = ((colMapTexel*(ambient + diffuse)) + specular);
}

#endif

#ifdef DEVICE

void main()
{
  vec4 colMapTexel = vec4(texture2D(colMap, vec2(vNormal.w, vECPos.w)).rgb, 1.0);

//   // normal mapping
	vec3 normal = normalize(vNormal.xyz);
//   vec3 mapNormal = texture2D(normalMap, vec2(vNormal.w, vECPos.w)).xyz * 2.0 - 1.0;
//   mapNormal = normalize(mapNormal.x*vec3(normal.z, 0.0, -normal.x) + vec3(0.0, mapNormal.y, 0.0) + mapNormal.z*normal);
//   
//   // create envmap coordinates
//   vec3 r = reflect( (vec3(vECPos.xyz - vEyePos.xyz)), mapNormal);
//   float m = 2.0 * length(r);
  
  // calculate environment map texel
  //vec4 envMapTexel = vec4(texture2D(envMap, vec2(r.x/m + 0.5, r.y/m + 0.5)).rgb, 0.0);
  vec4 envMapTexel = vec4(texture2D(envMap, vEnvTexCoord).rgb, 0.0);
  
  // lighting
  //vec3 lightDirection = normalize(u_light0Pos - vECPos.xyz);
//   float lightDist = length(lightDirection);
//   lightDirection /= lightDist;
  
  
  //vec3 halfVec = normalize(lightDirection + vEyePos);
  
  //float diffuseIntensity = max(0.0, dot(normal, lightDirection));
 // float specularModifier = max(0.0, dot(mapNormal, halfVec));
  
 // float pf;
  //if(diffuseIntensity == 0.0)
  //pf = 0.0;
  //else
  //pf = pow(specularModifier, 76.0);
  
 // vec4 ambient = u_matAmbient * u_light0Amb;

  vec4 diffuse = u_matDiffuse*(colMapTexel + envMapTexel)*(vDiffuseIntensity + u_matAmbient);

  //diffuse *= u_light0Diff * diffuseIntensity;
  
  //vec4 specular = envMapTexel;
  
  //gl_FragColor = vec4(dist, dist, dist, 1.0);
  gl_FragColor = diffuse;//(colMapTexel*(ambient + diffuse)) + specular;
}

#endif