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

	this._color = [1,0,0,1];


    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getShaderName	= function()	{  return this._shaderName;		};

	this.isAnimated		= function()	{  return true;					};

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this._propNames			= ["color"];
	this._propLabels		= ["Color"];
	this._propTypes			= ["color"];
	this._propValues		= [];

	this._propValues[ this._propNames[0] ] = this._color;

    this.setProperty = function( prop, value ) {
		// make sure we have legitimate imput
		if (this.validateProperty( prop, value )) {
			this._color = value.slice(0);
			this._shader['default'][prop].set(value);
		}
	};
    ///////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function()	{
        return new PlasmaMaterial();
    };

	this.init = function() {
		// set up the shader
		this._shader = new jshader();
		this._shader.def = plasmaShaderDef;
		this._shader.init();

		// set the default value
		this._time = 0;
		this._shader['default'].u_time = this._time;
		this.setProperty( "color", [this._time, 0, 0,  1] );

		// set up the material node
		this._materialNode = createMaterialNode("plasmaMaterial");
		this._materialNode.setShader(this._shader);
	};

	this.update = function( time ) {
		this._shader['default'].u_time = this._time;
		var color = this.getProperty( "color" );
		color[0] = this._time;
		this.setProperty( "color", color );
		//console.log( "update color to: " + color );
		this._time += this._dTime;
	}

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
					'color' : { 'type' : 'vec4' }
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


