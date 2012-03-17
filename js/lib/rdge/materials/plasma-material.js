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


    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getShaderName	= function()	{  return this._shaderName;		};

	this.isAnimated		= function()	{  return true;					};

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////

    this.setProperty = function( prop, value )
	{
		// plasma has no properties
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
		this._shader = new jshader();
		this._shader.def = plasmaShaderDef;
		this._shader.init();

		// set the default value
		this._time = 0;
		this._shader['default'].u_time.set( [this._time] );

		// set up the material node
		this._materialNode = createMaterialNode("plasmaMaterial" + "_" + world.generateUniqueNodeID());
		this._materialNode.setShader(this._shader);
	};

	this.update = function( time ) {
		this._shader['default'].u_time.set( [this._time] );
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


