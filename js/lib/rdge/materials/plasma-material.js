/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Material = require("js/lib/rdge/materials/material").Material;

var PlasmaMaterial = function PlasmaMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "PlasmaMaterial";
	this._shaderName = "plasma";

	this._time = 0.0;
	this._dTime = 0.01;
	this._speed = 1.0;

	this._wave  = 0.0;
	this._wave1 = 0.6;
	this._wave2 = 0.8;

    ///////////////////////////////////////////////////////////////////////
    // Properties
    ///////////////////////////////////////////////////////////////////////
	this._propNames			= ["wave",		"wave1",	"wave2",		"speed"];
	this._propLabels		= ["Wave",		"Wave 1",	"Wave 2",		"Speed"];
	this._propTypes			= ["float",		"float",	"float",		"float"];

	this._propValues		= [];
	this._propValues[ this._propNames[0] ] = this._wave;
	this._propValues[ this._propNames[1] ] = this._wave1;
	this._propValues[ this._propNames[2] ] = this._wave2;
	this._propValues[ this._propNames[3] ] = this._speed;


    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getShaderName	= function()	{  return this._shaderName;		};

	this.isAnimated		= function()	{  return true;					};

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
    // duplcate method requirde
    this.dup = function (world) {
        // get the current values;
        var propNames = [], propValues = [], propTypes = [], propLabels = [];
        this.getAllProperties(propNames, propValues, propTypes, propLabels);
        
        // allocate a new material
        var newMat = new PlasmaMaterial();

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
			console.log( "invalid property in Water Material:" + prop + " : " + value );
		}

		switch (prop)
		{
			case "wave":
				this._wave = value;
				break;

			case "wave1":
				this._wave1 = value;
				break;

			case "wave2":
				this._wave2 = value;
				break;

			case "speed":
				this._speed = value;
				break;
		}

		this.updateParameters();
	};

    ///////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function()	{
        return new PlasmaMaterial();
    };

	this.init = function( world)
	{
		this.setWorld( world );

		// set up the shader
	    this._shader = new RDGE.jshader();
		this._shader.def = plasmaShaderDef;
		this._shader.init();

		// set the default value
		this._time = 0;
		this._shader['default'].u_time.set( [this._time] );
		this._shader['default'].u_speed.set( [this._speed] );

		this._shader['default'].u_wave.set( [this._wave] );
		this._shader['default'].u_wave1.set( [this._wave1] );
		this._shader['default'].u_wave2.set( [this._wave2] );

		// set up the material node
		this._materialNode = RDGE.createMaterialNode("plasmaMaterial" + "_" + world.generateUniqueNodeID());
		this._materialNode.setShader(this._shader);
	};

	this.updateParameters = function()
	{
		this._propValues[ this._propNames[0] ] = this._wave;
		this._propValues[ this._propNames[1] ] = this._wave1;
		this._propValues[ this._propNames[2] ] = this._wave2;
		this._propValues[ this._propNames[3] ] = this._speed;

		var material = this._materialNode;
		if (material) {
			var technique = material.shaderProgram['default'];
			var renderer = RDGE.globals.engine.getContext().renderer;
			if (renderer && technique) {
					technique.u_wave.set( [this._wave] );
					technique.u_wave1.set( [this._wave1] );
					technique.u_wave2.set( [this._wave2] );
					technique.u_speed.set( [this._speed] );
			}
		}
	};

	this.update = function( time ) {
		this._shader['default'].u_time.set( [this._time] );
		this._time += this._dTime;
	};

	this.exportJSON = function()
	{
		var jObj =
		{
			'material'		: this.getShaderName(),
			'name'			: this.getName(),
			'speed'			: this._speed,
			'dTime'			: this._dTime,
			'wave'			: this._wave,
			'wave1'			: this._wave1,
			'wave2'			: this._wave2
		};

		return jObj;
	};

	this.importJSON = function( jObj )
	{
		this._speed = jObj.speed;
		this._dTime = jObj.dTime;

		this._wave  = jObj.wave;
		this._wave1 = jObj.wave1;
		this._wave2 = jObj.wave2;
	};
};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader
 
// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
var plasmaShaderDef =
{'shaders': 
	{
		'defaultVShader':"assets/shaders/plasma.vert.glsl",
		'defaultFShader':"assets/shaders/plasma.frag.glsl"
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
					'vert'	:	{ 'type' : 'vec3' },
					'normal' :	{ 'type' : 'vec3' },
					'texcoord'	:	{ 'type' : 'vec2' }
				},
				// parameters
				'params' : 
				{
					'u_time' : { 'type' : 'float' },
					'u_speed': { 'type' : 'float' },
					'u_wave' : { 'type' : 'float' },
					'u_wave1': { 'type' : 'float' },
					'u_wave2': { 'type' : 'float' }
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

PlasmaMaterial.prototype = new Material();

if (typeof exports === "object") {
    exports.PlasmaMaterial = PlasmaMaterial;
}


