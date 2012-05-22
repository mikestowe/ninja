/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */


var Material = require("js/lib/rdge/materials/material").Material;
var PulseMaterial = require("js/lib/rdge/materials/pulse-material").PulseMaterial;
var Texture = require("js/lib/rdge/texture").Texture;

var FlagMaterial = function FlagMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "FlagMaterial";
	this._shaderName = "flag";

	this._texMap = 'assets/images/us_flag.png';

	this._time = 0.0;
	this._dTime = 0.1;

	this._speed = 1.0;
    this._waveWidth = 1.0;
    this._waveHeight = 1.0;

	this._hasVertexDeformation = true;

    ///////////////////////////////////////////////////////////////////////
    // Properties
    ///////////////////////////////////////////////////////////////////////
	// all defined in parent PulseMaterial.js
	// load the local default value
	this._propNames			= ["texmap",        "wavewidth",        "waveheight",		"speed" ];
	this._propLabels		= ["Texture map",   "Wave Width",       "Wave Height",		"Speed" ];
	this._propTypes			= ["file",          "float",            "float",			"float" ];
	this._propValues		= [];

	this._propValues[ this._propNames[0] ] = this._texMap.slice(0);
    this._propValues[ this._propNames[1] ] = this._waveWidth;
    this._propValues[ this._propNames[2] ] = this._waveHeight;
    this._propValues[ this._propNames[3] ] = this._speed;


	// a material can be animated or not. default is not.  
	// Any material needing continuous rendering should override this method
	this.isAnimated	= function() {  return true;  };

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function( world )
	{
		// get the current values;
        var propNames = [], propValues = [], propTypes = [], propLabels = [];
        this.getAllProperties(propNames, propValues, propTypes, propLabels);
        
        // allocate a new uber material
        var newMat = new FlagMaterial();

		// copy over the current values;
        var n = propNames.length;
        for (var i = 0; i < n; i++)
            newMat.setProperty(propNames[i], propValues[i]);

        return newMat;
	};

	this.setProperty = function( prop, value )
	{
		// make sure we have legitimate imput
		var ok = this.validateProperty( prop, value );
		if (!ok) {
			console.log( "invalid property in Radial Gradient Material:" + prop + " : " + value );
		}

		switch (prop)
		{
			case "texmap":
				this.setTextureMap(value);
				break;

			case "wavewidth":
				this._waveWidth = value;
				this._propValues[ this._propNames[1] ] = this._waveWidth;
				this.updateParameters();
				break;

			case "waveheight":
				this._waveHeight = value;
				this._propValues[ this._propNames[2] ] = this._waveHeight;
				this.updateParameters();
				break;

			case "speed":
				this._speed = value;
				this._propValues[ this._propNames[3] ] = this._speed;
				this.updateParameters();
				break;

			case "color":
				break;
		}
	};


	this.updateParameters = function()
	{
		this._propValues[ this._propNames[1] ] = this._waveWidth;
		this._propValues[ this._propNames[2] ] = this._waveHeight;
		this._propValues[ this._propNames[3] ] = this._speed;

		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram['default'];
			var renderer = RDGE.globals.engine.getContext().renderer;
			if (renderer && technique)
			{

				if (this._shader && this._shader['default']) {
					this._shader['default'].u_speed.set( [this._speed] );
					this._shader['default'].u_waveWidth.set( [this._waveWidth] );
					this._shader['default'].u_waveHeight.set( [this._waveHeight] );
				}
			}
		}
	};


	this.init = function( world )
	{
		// save the world
		if (world)  this.setWorld( world );

		// set up the shader
		this._shader = new RDGE.jshader();
		this._shader.def = flagMaterialDef;
		this._shader.init();

		// set up the material node
		this._materialNode = RDGE.createMaterialNode("flagMaterial" + "_" + world.generateUniqueNodeID());
		this._materialNode.setShader(this._shader);

		this._time = 0;
		if (this._shader && this._shader['default']) {
			this._shader['default'].u_time.set( [this._time] );
            this._shader['default'].u_waveWidth.set(  [this._propValues[ this._propNames[1] ]] );
            this._shader['default'].u_waveHeight.set( [this._propValues[ this._propNames[2] ]] );
        }

        // set up the texture
        var texMapName = this._propValues[this._propNames[0]];
        this._glTex = new Texture( world, texMapName );

		// set the shader values in the shader
		this.updateParameters();
		this.updateTexture();
		this.update( 0 );
	}
};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader
 
// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
var flagMaterialDef =
{'shaders': 
	{
		'defaultVShader':"assets/shaders/Flag.vert.glsl",
		'defaultFShader':"assets/shaders/Flag.frag.glsl"
	},
	'techniques':
	{ 
		'default':
		[
			{
				'vshader' : 'defaultVShader',
				'fshader' : 'defaultFShader',
				// attributes
				'attributes' :
				{
					'vert'  :   { 'type' : 'vec3' },
					'normal' :  { 'type' : 'vec3' },
					'texcoord'  :   { 'type' : 'vec2' }
				},
				// parameters
				'params' : 
				{
					'u_tex0': { 'type' : 'tex2d' },
					'u_time' : { 'type' : 'float' },
					'u_speed' : { 'type' : 'float' },
					'u_waveWidth'  :   { 'type' : 'float' },
					'u_waveHeight'  :   { 'type' : 'float' }
				},

				// render states
				'states' : 
				{
					'depthEnable' : true,
					'offset':[1.0, 0.1]
				}
			}
		]
	}
};

FlagMaterial.prototype = new PulseMaterial();

if (typeof exports === "object") {
    exports.FlagMaterial = FlagMaterial;
}




