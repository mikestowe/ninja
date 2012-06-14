/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var PulseMaterial = require("js/lib/rdge/materials/pulse-material").PulseMaterial;
var Texture = require("js/lib/rdge/texture").Texture;

var JuliaMaterial = function JuliaMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "Julia";
	this._shaderName = "julia";

	this._defaultTexMap = 'assets/images/rocky-normal.jpg';

	this._time = 0.0;
	this._dTime = 0.01;

    ///////////////////////////////////////////////////////////////////////
    // Properties
    ///////////////////////////////////////////////////////////////////////
	var  u_speed_index = 0;
	this._propNames			= [ "u_speed" ];
	this._propLabels		= [ "Speed" ];
	this._propTypes			= [ "float" ];
	this._propValues		= [];
    this._propValues[this._propNames[u_speed_index]] = 1.0;

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.isAnimated			= function()			{  return true;		};
	this.getShaderDef		= function()			{  return JuliaMaterialDef;	}

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////

	this.init = function( world ) {
		// save the world
		if (world)  this.setWorld( world );

		// set up the shader
		this._shader = new RDGE.jshader();
		this._shader.def = JuliaMaterialDef;
		this._shader.init();

		// set up the material node
		this._materialNode = RDGE.createMaterialNode("juliaMaterial" + "_" + world.generateUniqueNodeID());
		this._materialNode.setShader(this._shader);

		this._time = 0;
		if (this._shader && this._shader['default']) {
			this._shader['default'].u_time.set( [this._time] );
        }

		// set the shader values in the shader
        this.setShaderValues();
		this.setResolution( [world.getViewportWidth(),world.getViewportHeight()] );
		this.update( 0 );
	};
}

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader
 
// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
var JuliaMaterialDef =
{'shaders': 
	{
		'defaultVShader':"assets/shaders/Basic.vert.glsl",
		'defaultFShader':"assets/shaders/Julia.frag.glsl"
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
					'u_time' : { 'type' : 'float' },
					'u_speed' : { 'type' : 'float' },
					'u_resolution'  :   { 'type' : 'vec2' },
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

JuliaMaterial.prototype = new PulseMaterial();

if (typeof exports === "object") {
    exports.JuliaMaterial = JuliaMaterial;
}



