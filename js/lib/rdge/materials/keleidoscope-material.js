/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var PulseMaterial = require("js/lib/rdge/materials/pulse-material").PulseMaterial;

var KeleidoscopeMaterial = function KeleidoscopeMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "KeleidoscopeMaterial";
	this._shaderName = "keleidoscope";

	this._texMap = 'assets/images/rocky-normal.jpg';

	this._time = 0.0;
	this._dTime = 0.01;

    ///////////////////////////////////////////////////////////////////////
    // Properties
    ///////////////////////////////////////////////////////////////////////
	// all defined in parent PulseMaterial.js
	// load the local default value
	this._propValues[ this._propNames[0] ] = this._texMap.slice(0);

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function( world ) {
		// allocate a new uber material
		var newMat = new KeleidoscopeMaterial();

		// copy over the current values;
		var propNames = [],  propValues = [],  propTypes = [],  propLabels = [];
		this.getAllProperties( propNames,  propValues,  propTypes,  propLabels);
		var n = propNames.length;
		for (var i=0;  i<n;  i++)
			newMat.setProperty( propNames[i], propValues[i] );

		return newMat;
	};

	this.init = function( world ) {
		// save the world
		if (world)  this.setWorld( world );

		// set up the shader
		this._shader = new RDGE.jshader();
		this._shader.def = keleidoscopeMaterialDef;
		this._shader.init();

		// set up the material node
		this._materialNode = RDGE.createMaterialNode("keleidoscopeMaterial" + "_" + world.generateUniqueNodeID());
		this._materialNode.setShader(this._shader);

		this._time = 0;
		if (this._shader && this._shader['default']) {
			this._shader['default'].u_time.set( [this._time] );
        }

		// set the shader values in the shader
		this.updateTexture();
		this.setResolution( [world.getViewportWidth(),world.getViewportHeight()] );
		this.update( 0 );
	};

	this.update = function( time )
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram['default'];
			var renderer = RDGE.globals.engine.getContext().renderer;
			if (renderer && technique)
			{
				if (this._shader && this._shader['default']) {
					this._shader['default'].u_time.set( [this._time] );
                }

				this._time = time;
			}
		}
	}
};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader
 
// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
var keleidoscopeMaterialDef =
{'shaders': 
	{
		'defaultVShader':"assets/shaders/Basic.vert.glsl",
		'defaultFShader':"assets/shaders/Keleidoscope.frag.glsl"
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

KeleidoscopeMaterial.prototype = new PulseMaterial();

if (typeof exports === "object") {
    exports.KeleidoscopeMaterial = KeleidoscopeMaterial;
}

