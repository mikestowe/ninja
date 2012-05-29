/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Material = require("js/lib/rdge/materials/material").Material;
var Texture = require("js/lib/rdge/texture").Texture;

///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
var TwistVertMaterial = function TwistVertMaterial()
{
	// initialize the inherited members
	this.inheritedFrom = Material;
	this.inheritedFrom();

	///////////////////////////////////////////////////////////////////////
	// Instance variables
	///////////////////////////////////////////////////////////////////////
	this._name = "TwistVertMaterial";
	this._shaderName = "twistVert";

	this._tex0 = 'assets/images/rocky-normal.jpg';
	this._tex1 = 'assets/images/metal.png';

	this._glTex0;
	this._glTex1;

	this._angle = 0.0;
	this._deltaTime = 0.01;
	this._speed = 1.0;

	///////////////////////////////////////////////////////////////////////
	// Property Accessors
	///////////////////////////////////////////////////////////////////////
	this.getShaderName = function () { return this._shaderName; };

	this.isAnimated = function () { return true; };
	
	this.hasVertexDeformation = function () { return this._hasVertexDeformation; };
	this._hasVertexDeformation = true;
	this._vertexDeformationTolerance = 0.02; // should be a property

	///////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function() {
		// get the current values;
		var propNames = [], propValues = [], propTypes = [], propLabels = [];
		this.getAllProperties(propNames, propValues, propTypes, propLabels);
		
		// allocate a new material
		var newMat = new TwistVertMaterial();

		// copy over the current values;
		var n = propNames.length;
		for (var i = 0; i < n; i++)
			newMat.setProperty(propNames[i], propValues[i]);

		return newMat;
	};

	this.init = function (world)
	{
		this.setWorld(world);

		// set up the shader
		this._shader = new RDGE.jshader();
		this._shader.def = twistVertShaderDef;
		this._shader.init();

		// set up the material node
		this._materialNode = RDGE.createMaterialNode("twistVertMaterial" + "_" + world.generateUniqueNodeID());
		this._materialNode.setShader(this._shader);

		// set up the texture maps
		this.updateTextures();

		// initialize the twist vert properties
		this.updateShaderValues();
	};


	///////////////////////////////////////////////////////////////////////
	// Material Property Accessors
	///////////////////////////////////////////////////////////////////////
	this._propNames = [ "u_limit1",				"u_limit2",		"u_twistAmount", "speed",	"u_tex0",					"u_tex1"];
	this._propLabels = [ "Start Parameter",		"End Paramater", "Twist Amount", "Speed",	"Front facing texture map", "Back facing texture map"];
	this._propTypes = [ "float",				"float",		"angle",		"float",	"file",						"file"];
	this._propValues = [];

	// initialize the property values
	this._propValues[this._propNames[0]] = 0.0;
	this._propValues[this._propNames[1]] = 1.0;
	this._propValues[this._propNames[2]] = 2.0 * Math.PI;
	this._propValues[this._propNames[3]] = this._speed;
	this._propValues[this._propNames[4]] = this._tex0.slice();
	this._propValues[this._propNames[5]] = this._tex1.slice();

	this.setProperty = function (prop, value)
	{
		// make sure we have legitimate input
		if (this.validateProperty(prop, value))
		{
			switch (prop) {
				case "u_tex1":
				case "u_tex0": this._propValues[prop] = value ? value.slice() : null;
					this.updateTextures();
					break;

				default:
					this._propValues[prop] = value;
					break;
			}

			this.updateShaderValues();
		}
	};
	///////////////////////////////////////////////////////////////////////

	this.exportJSON = function () {
		var jObj =
		{
			'material'	: this.getShaderName(),
			'name'		: this.getName(),

			'tex0'		: this._propValues[this._propNames[4]],
			'tex1'		: this._propValues[this._propNames[5]],

			'speed'		: this._propValues[this._propNames[3]],

			'limit1'	: this._propValues[this._propNames[0]],
			'limit2'	: this._propValues[this._propNames[1]],
			'angle'		: this._propValues[this._propNames[2]]
		}

		return jObj;
	};

	this.importJSON = function (jObj) {
		if (this.getShaderName() != jObj.material) throw new Error("ill-formed material");
		this.setName(jObj.name);

		try {

			this._propValues[this._propNames[4]] = jObj.tex0;
			this._propValues[this._propNames[5]] = jObj.tex1;

			this._propValues[this._propNames[3]] = jObj.speed;

			this._propValues[this._propNames[0]] = jObj.limit1;
			this._propValues[this._propNames[1]] = jObj.limit2;
			this._propValues[this._propNames[2]] = jObj.angle;

			this.updateShaderValues();
		}
		catch (e) {
			throw new Error("could not import material: " + importStr);
		}
	};

	this.update = function (time)
	{
		if (this._shader && this._shader.twistMe)
		{
			var technique = this._shader.twistMe;
		   
			var angle = this._angle;
			angle += this._deltaTime * this._propValues["speed"];
			if (angle > this._propValues["u_twistAmount"])
			{
				angle = this._propValues["u_twistAmount"];
				this._deltaTime = -this._deltaTime;
			}
			else if (angle < 0.0)
			{
				angle = 0;
				this._deltaTime = -this._deltaTime;
			}
			this._angle = angle;
			this._shader.twistMe["u_twistAmount"].set([angle]);

			var tex;
			if (this._glTex0)
			{
				if (this._glTex0.isAnimated())
					this._glTex0.render();
				tex = this._glTex0.getTexture();
				if (tex)
					technique.u_tex0.set( tex );
			}
			if (this._glTex1)
			{
				if (this._glTex1.isAnimated())
					this._glTex1.render();
				tex = this._glTex1.getTexture();
				if (tex)
					technique.u_tex1.set( tex );
			}

		}
	};

	this.updateShaderValues = function ()
	{
		if (this._shader && this._shader.twistMe)
		{
			var nProps = this._propNames.length;
			for (var i = 0; i < nProps; i++)
			{
				var propName = this._propNames[i];
				var propValue = this._propValues[propName];
				switch (propName)
				{
					case "u_tex0":
					case "u_tex1":
						break;

					default:
						if (this._shader.twistMe[propName])
							this._shader.twistMe[propName].set([propValue]);
						break;
				}
			}
		}
	};

	this.updateTextures = function ()
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram['twistMe'];
			var renderer = RDGE.globals.engine.getContext().renderer;
			if (renderer && technique)
			{
				var texMapName;
				texMapName = this._propValues[this._propNames[4]];
				var wrap = 'REPEAT', mips = true;
				this._glTex0 = new Texture( this.getWorld(), texMapName,  wrap, mips );
				tex = this._glTex0.getTexture();
				//if (tex)
					technique.u_tex0.set(tex);

				texMapName = this._propValues[this._propNames[5]];
				this._glTex1 = new Texture( this.getWorld(), texMapName,  wrap, mips );
				tex = this._glTex1.getTexture();
				//if (tex)
					technique.u_tex1.set(tex);
			}
		}
	}
};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader

// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
twistVertShaderDef =
{
	'shaders': { // shader files
		'defaultVShader': "assets/shaders/TwistVert.vert.glsl",
		'defaultFShader': "assets/shaders/TwistVert.frag.glsl"
	},
	'techniques': { // rendering control
		'twistMe': [ // simple color pass
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
			// attributes
			'params':
				 {
					 'u_limit1': { 'type': 'float' },
					 'u_limit2': { 'type': 'float' },
					 'u_minVal': { 'type': 'float' },
					 'u_maxVal': { 'type': 'float' },
					 'u_center': { 'type': 'float' },
					 'u_twistAmount': { 'type': 'float' }
				 }
			}
		]
	}
};

if (typeof exports === "object") {
	exports.TwistVertMaterial = TwistVertMaterial;
}

