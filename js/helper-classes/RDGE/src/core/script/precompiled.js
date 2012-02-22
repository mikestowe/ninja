/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/*
 *	A list of shared parameters that all shaders can support (the engine always try to bind these uniforms)
 *	These parameters are compiled into all jshaders and can be set from any jshader
 *	with a call to jshader.global.u_matDiffuse.set([1,0,0,1]) if the jshader depends on that parameter.
 *	To set directly call rdgeGlobalParameters.'param'.set(x), for example rdgeGlobalParameters.u_lightPos.set([1,1,1])
 *	The values can be added to a jshaders params list - this will creating local jshader memory that binds to the parameter
 *	this parameter can be used to set the value for that shader but will not override the global setting
 *	The values set here are the default global values.
 *	note: the rdge_lights substructure can be ignored, the final parameter list contains only the uniform objects
 */

rdgeGlobalParameters =
{
	"u_projMatrix":			{'type': 'mat4',  'data': mat4.identity()},	
	"u_mvMatrix":			{'type': 'mat4',  'data': mat4.identity()},	
	"u_invMvMatrix":		{'type': 'mat4',  'data': mat4.identity()},	
	"u_normalMatrix":		{'type': 'mat4',  'data': mat4.identity()},	
	"u_worldMatrix":		{'type': 'mat4',  'data': mat4.identity()},	
	"u_viewMatrix":			{'type': 'mat4',  'data': mat4.identity()},
	"u_invViewMatrix":		{'type': 'mat4',  'data': mat4.identity()},
	"u_invWorldMatrix":		{'type': 'mat4',  'data': mat4.identity()},	
	"u_inv_viewport_width": {'type': 'float', 'data': [1]},
	"u_inv_viewport_height":{'type': 'float', 'data': [1]},
	"u_lightPos":			{'type': 'vec3',  'data': [-20.0, 50.0, 20.0]},		
	"u_lightDiff":			{'type': 'vec4',  'data': [0.8, 0.8, 0.8, 1]},		
	"u_lightAmb":			{'type': 'vec4',  'data': [1.0000, 1.0000, 1.0000, 1.0]},	
	"rdge_lights": {
	"u_light0Pos":			{'type': 'vec3',  'data': [-20.0, 50.0, 20.0]},		
	"u_light0Diff":			{'type': 'vec4',  'data': [0.8, 0.8, 0.8, 1]},		
	"u_light0Amb":			{'type': 'vec4',  'data': [0.0008, 0.0008, 0.0008, 1.0]},		
	"u_light0Spec":			{'type': 'vec4',  'data': [1.0, 1.0, 1.0, 1.0]},		
	"u_light1Pos":			{'type': 'vec3',  'data': [0.0, 0.0, 0.0]},		
	"u_light1Diff":			{'type': 'vec4',  'data': [0.0, 0.0, 0.0, 0.0]},		
	"u_light1Amb":			{'type': 'vec4',  'data': [0.5, 0.5, 0.5, 1.0]},
	"u_light1Spec":			{'type': 'vec4',  'data': [1.0, 1.0, 1.0, 1.0]},		
	"u_light2Pos":			{'type': 'vec3',  'data': [0.0, 0.0, 0.0]},		
	"u_light2Diff":			{'type': 'vec4',  'data': [0.0, 0.0, 0.0, 1.0]},		
	"u_light2Amb":			{'type': 'vec4',  'data': [0.5, 0.5, 0.5, 1.0]},
	"u_light2Spec":			{'type': 'vec4',  'data': [1.0, 1.0, 1.0, 1.0]},		
	"u_light3Pos":			{'type': 'vec3',  'data': [0.0, 0.0, 0.0]},		
	"u_light3Diff":			{'type': 'vec4',  'data': [0.8, 0.8, 0.8, 1]},		
	"u_light3Amb":			{'type': 'vec4',  'data': [0.5, 0.5, 0.5, 1.0]},
	"u_light3Spec":			{'type': 'vec4',  'data': [1.0, 1.0, 1.0, 1.0]}},		
	"colMap":				{'type': 'tex2d', 'data': "assets/images/white.png"},	
	//"envMap":				{'type': 'tex2d', 'data': null},	
	//"normalMap":			{'type': 'tex2d', 'data': null},	
	//"glowMap":				{'type': 'tex2d', 'data': "assets/images/black.png"},	
	//"u_shadowDepthMap":		{'type': 'tex2d', 'data': null},	
	//"u_depthMap":			{'type': 'tex2d', 'data': null},	
	"u_matAmbient":			{'type': 'vec4',  'data': [1.00,1.00,1.00, 1]},		
	"u_matDiffuse":			{'type': 'vec4',  'data': [1.0, 1.0, 1.0, 1.0]},		
	"u_matSpecular":		{'type': 'vec4',  'data': [1.0, 1.0, 1.0, 1.0]},		
	"u_matShininess":		{'type': 'float', 'data': [128.0]},		
	"u_matEmission":		{'type': 'float', 'data': [0.0, 0.0, 0.0, 1.0]},		
	"u_frustumFarZ":		{'type': 'float', 'data': [1000.0]},		
	"u_shadowLightWorld":	{'type': 'mat4',  'data': mat4.identity()},	
	"u_shadowBiasMatrix":	{'type': 'mat4',  'data': mat4.identity()},
	"u_vShadowLight":		{'type': 'mat4',  'data': mat4.identity()},	
	"u_shadowBPV":			{'type': 'mat4',  'data': mat4.identity()},	
	"u_farZ":				{'type': 'float', 'data': [1000]},
	"u_shadowLightFarZ":	{'type': 'float', 'data': [1000]},
	"u_cameraFTR":			{'type': 'vec3', 'data':[0.0, 0.0, 0.0]}
};
