/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var PulseMaterial = require("js/lib/rdge/materials/pulse-material").PulseMaterial;
var Texture = require("js/lib/rdge/texture").Texture;

///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
var WaterMaterial = function WaterMaterial()
{
	///////////////////////////////////////////////////////////////////////
	// Instance variables
	///////////////////////////////////////////////////////////////////////
	this._name = "WaterMaterial";
	this._shaderName = "water";

	this._defaultTexMap = 'assets/images/rocky-normal.jpg';

	this._time = 0.0;
	this._dTime = 0.01;

    // array textures indexed by shader uniform name
    this._glTextures = [];

	this.isAnimated			= function()			{  return true;				};
	this.getShaderDef		= function()			{  return waterMaterialDef;	};

	///////////////////////////////////////////////////////////////////////
	// Properties
	///////////////////////////////////////////////////////////////////////
	// all defined in parent PulseMaterial.js
	// load the local default value
	this._propNames			= ["u_tex0",		"u_emboss",	"u_delta",		"u_intensity",		"u_speed"];
	this._propLabels		= ["Texture map",	"Emboss",	"Delta",		"Intensity",		"Speed"];
	this._propTypes			= ["file",			"float",	"float",			"float",		"float"];

	var u_tex_index			= 0,
		u_emboss_index		= 1,
		u_delta_index		= 2,
		u_intensity_index	= 3,
		u_speed_index		= 4;

	this._propValues		= [];
	this._propValues[ this._propNames[u_tex_index		] ]	= this._defaultTexMap.slice(0);
	this._propValues[ this._propNames[u_emboss_index	] ]	= 0.3;
	this._propValues[ this._propNames[u_delta_index		] ]	= 20.0;
	this._propValues[ this._propNames[u_intensity_index	] ]	= 3.0;
	this._propValues[ this._propNames[u_speed_index		] ]	= 0.2;

	///////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////

	this.init = function (world) {
		// save the world
		if (world) this.setWorld(world);

		// set up the shader
		this._shader = new RDGE.jshader();
		this._shader.def = waterMaterialDef;
		this._shader.init();

		// set up the material node
		this._materialNode = RDGE.createMaterialNode("waterMaterial" + "_" + world.generateUniqueNodeID());
		this._materialNode.setShader(this._shader);

		this._time = 0;
		if (this._shader && this._shader['default'])
			this._shader['default'].u_time.set([this._time]);

		// set the shader values in the shader
		this.setShaderValues();
		this.setResolution([world.getViewportWidth(), world.getViewportHeight()]);
		this.update(0);
	};
};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader

// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
var waterMaterialDef =
{ 'shaders':
	{
		'defaultVShader': "assets/shaders/Basic.vert.glsl",
		'defaultFShader': "assets/shaders/Water2.frag.glsl"
	},
	'techniques':
	{
		'default':
		[
			{
				'vshader': 'defaultVShader',
				'fshader': 'defaultFShader',
				// attributes
				'attributes':
				{
					'vert': { 'type': 'vec3' },
					'normal': { 'type': 'vec3' },
					'texcoord': { 'type': 'vec2' }
				},
				// parameters
				'params':
				{
					'u_tex0': { 'type': 'tex2d' },
					'u_time': { 'type': 'float' },
					'u_emboss': { 'type': 'float' },
					'u_delta': { 'type': 'float' },
					'u_speed': { 'type': 'float' },
					'u_intensity': { 'type': 'float' },
					'u_resolution': { 'type': 'vec2' }
				},

				// render states
				'states':
				{
					'depthEnable': true,
					'offset': [1.0, 0.1]
				}
			}
		]
	}
};

var ParisMaterial = function ParisMaterial()
{
	// initialize the inherited members
	this.inheritedFrom = WaterMaterial;
	this.inheritedFrom();

	this._name = "ParisMaterial";
	this._shaderName = "paris";

	this._defaultTexMap = 'assets/images/paris.png';
	this._propValues[this._propNames[u_tex_index]] = this._defaultTexMap.slice(0);

	//this._diffuseColor = [0.5, 0.5, 0.5, 0.5];
	//this._propValues[this._propNames[1]] = this._diffuseColor.slice();

	this.init = function (world)
	{
		// save the world
		if (world) this.setWorld(world);

		// set up the shader
		this._shader = new RDGE.jshader();
		this._shader.def = waterMaterialDef;
		this._shader.init();

		// set up the material node
		this._materialNode = RDGE.createMaterialNode("parisMaterial" + "_" + world.generateUniqueNodeID());
		this._materialNode.setShader(this._shader);

		this._time = 0;
		if (this._shader && this._shader['default']) 
			this._shader['default'].u_time.set([this._time]);

		// set the shader values in the shader
		this.setShaderValues();
		this.setResolution([world.getViewportWidth(), world.getViewportHeight()]);
		this.update(0);
	}
}


ParisMaterial.prototype = new PulseMaterial();
if (typeof exports === "object") {
	exports.ParisMaterial = ParisMaterial;
}


WaterMaterial.prototype = new PulseMaterial();

if (typeof exports === "object") {
	exports.WaterMaterial = WaterMaterial;
}
