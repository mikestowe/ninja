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
var WaterMaterial = function WaterMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._name = "WaterMaterial";
    this._shaderName = "water";

    this._texMap = 'assets/images/rocky-normal.jpg';
    //this._texMap = 'assets/images/powderblue.png';

    this._time = 0.0;
    this._dTime = 0.01;
	this._emboss = 0.3;
	this._delta = 20.0;
	this._intensity = 3.0;

	this._speed = 0.2;

    ///////////////////////////////////////////////////////////////////////
    // Properties
    ///////////////////////////////////////////////////////////////////////
    // all defined in parent PulseMaterial.js
    // load the local default value
    //this._propValues = [];
    //this._propValues[this._propNames[0]] = this._texMap.slice(0);
	this._propNames			= ["texmap",		"emboss",	"delta",		  "intensity",		"speed"];
	this._propLabels		= ["Texture map",	"Emboss",	"Delta",		"Intensity",		"Speed"];
	this._propTypes			= ["file",			"float",	"float",			"float",		"float"];

	this._propValues		= [];
	this._propValues[ this._propNames[0] ] = this._texMap.slice(0);
	this._propValues[ this._propNames[1] ] = this._emboss;
	this._propValues[ this._propNames[2] ] = this._delta;
	this._propValues[ this._propNames[3] ] = this._intensity;
	this._propValues[ this._propNames[4] ] = this._speed;

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////

	this.setProperty = function( prop, value ) {
		// make sure we have legitimate imput
		var ok = this.validateProperty( prop, value );
		if (!ok) {
			console.log( "invalid property in Water Material:" + prop + " : " + value );
		}

		switch (prop)
		{
			case "texmap":
				this.setTextureMap(value);
				break;

			case "emboss":
				this.setEmboss( value );
				break;

			case "delta":
				this.setDelta( value );
				break;

			case "intensity":
				this.setIntensity( value );
				break;

			case "speed":
				this.setSpeed( value );
				break;

			case "color":
				break;
		}
	};

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
		if (this._shader && this._shader['default']) {
			this._shader['default'].u_time.set([this._time]);

			this._shader['default'].u_emboss.set( [this._emboss] );
			this._shader['default'].u_delta.set( [this._delta] );
			this._shader['default'].u_intensity.set( [this._intensity] );
			this._shader['default'].u_speed.set( [this._speed] );
		}

		var texMapName = this._propValues[this._propNames[0]];
		this._glTex = new Texture( world, texMapName );

		// set the shader values in the shader
		this.updateTexture();
		this.setResolution([world.getViewportWidth(), world.getViewportHeight()]);
		this.update(0);
	};

	this.setTextureMap = function( texMapName )
	{
		this._texMap = texMapName.slice();
		this._propValues[ this._propNames[0] ] = this._texMap.slice(0);

		this._glTex = new Texture( this.getWorld(), texMapName );
		this.updateTexture();
	}

	this.updateTexture = function() {
		
		var texMapName = this._propValues[this._propNames[0]];
		this._glTex = new Texture( this.getWorld(), texMapName );

		var material = this._materialNode;
		if (material) {
			var technique = material.shaderProgram['default'];
			var renderer = RDGE.globals.engine.getContext().renderer;
			if (renderer && technique) {
				var wrap = 'REPEAT',  mips = true;
				var tex;
				if (this._glTex)
				{
					if (this._glTex.isAnimated())
						this._glTex.render();
					tex = this._glTex.getTexture();
				}
				
				if (tex) {
					technique.u_tex0.set( tex );
				}
			}
		}
	};

	this.setEmboss = function( value )
	{
		this._emboss = value;
		this._propValues[ "emboss" ] = value;

		var material = this._materialNode;
		if (material) {
			var technique = material.shaderProgram['default'];
			var renderer = RDGE.globals.engine.getContext().renderer;
			if (renderer && technique) {
					technique.u_emboss.set( [value] );
			}
		}
	}

	this.setIntensity = function( value )
	{
		this._intensity = value;
		this._propValues[ "intensity" ] = value;

		var material = this._materialNode;
		if (material) {
			var technique = material.shaderProgram['default'];
			var renderer = RDGE.globals.engine.getContext().renderer;
			if (renderer && technique) {
					technique.u_intensity.set( [value] );
					console.log( "setting intensity to: " + value );
			}
		}
	}

	this.setDelta = function( value )
	{
		this._delta = value;
		this._propValues[ "delta" ] = value;

		var material = this._materialNode;
		if (material) {
			var technique = material.shaderProgram['default'];
			var renderer = RDGE.globals.engine.getContext().renderer;
			if (renderer && technique) {
					technique.u_delta.set( [value] );
			}
		}
	}

	this.setSpeed = function( value )
	{
		this._speed = value;
		this._propValues[ "speed" ] = value;

		var material = this._materialNode;
		if (material) {
			var technique = material.shaderProgram['default'];
			var renderer = RDGE.globals.engine.getContext().renderer;
			if (renderer && technique) {
					technique.u_speed.set( [value] );
			}
		}
	}
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

/*
var ParisMaterial = function ParisMaterial() {
    // initialize the inherited members
    this.inheritedFrom = WaterMaterial;
    this.inheritedFrom();

    this._name = "ParisMaterial";
    this._shaderName = "paris";

    this._texMap = 'assets/images/paris.png';
    this._propValues[this._propNames[0]] = this._texMap.slice(0);

    this._diffuseColor = [0.5, 0.5, 0.5, 0.5];
    this._propValues[this._propNames[1]] = this._diffuseColor.slice();

    // duplcate method requirde
    this.dup = function (world) {
        // allocate a new uber material
        var newMat = new ParisMaterial();

        // copy over the current values;
        var propNames = [], propValues = [], propTypes = [], propLabels = [];
        this.getAllProperties(propNames, propValues, propTypes, propLabels);
        var n = propNames.length;
        for (var i = 0; i < n; i++)
            newMat.setProperty(propNames[i], propValues[i]);

        return newMat;
    };

    this.init = function (world) {
        // save the world
        if (world) this.setWorld(world);

        // set up the shader
        this._shader = new RDGE.jshader();
        this._shader.def = parisMaterialDef;
        this._shader.init();

        // set up the material node
        this._materialNode = RDGE.createMaterialNode("parisMaterial" + "_" + world.generateUniqueNodeID());
        this._materialNode.setShader(this._shader);

        this._time = 0;
        if (this._shader && this._shader['default']) {
            this._shader['default'].u_time.set([this._time]);
        }

        // set the shader values in the shader
        this.updateTexture();
        this.setResolution([world.getViewportWidth(), world.getViewportHeight()]);
        this.update(0);
    };
}

ParisMaterial.prototype = new PulseMaterial();
if (typeof exports === "object") {
    exports.ParisMaterial = ParisMaterial;
}

// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
var parisMaterialDef =
{ 'shaders':
	{
	    'defaultVShader': "assets/shaders/Basic.vert.glsl",
	    'defaultFShader': "assets/shaders/Paris.frag.glsl"
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
*/

WaterMaterial.prototype = new PulseMaterial();

if (typeof exports === "object") {
    exports.WaterMaterial = WaterMaterial;
}




