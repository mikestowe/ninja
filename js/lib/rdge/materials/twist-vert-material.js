/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
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
	this._name = "Twist Vertex";
	this._shaderName = "twistVert";

	this._tex0 = 'assets/images/rocky-normal.jpg';
	this._tex1 = 'assets/images/metal.png';

	this._angle = 0.0;
	this._deltaTime = 0.01;
	this._speed = 1.0;

	///////////////////////////////////////////////////////////////////////
	// Property Accessors
	///////////////////////////////////////////////////////////////////////
	this.getShaderName = function () { return this._shaderName; };
	this.isAnimated = function () { return true; };
	this.getShaderDef	= function()	{  return twistVertShaderDef;	};
	this.getTechniqueName	= function() { return 'twistMe' };
	
	this.hasVertexDeformation = function () { return this._hasVertexDeformation; };
	this._hasVertexDeformation = true;
	this._vertexDeformationTolerance = 0.02; // should be a property

	///////////////////////////////////////////////////////////////////////
	// Material Property Accessors
	///////////////////////////////////////////////////////////////////////
	this._propNames = [ "u_limit1",				"u_limit2",			"u_twistAmount",	"speed",		"u_tex0",						"u_tex1"];
	this._propLabels = [ "Start Parameter",		"End Paramater",	"Twist Amount",		"Speed",		"Front facing texture map",		"Back facing texture map"];
	this._propTypes = [ "float",				"float",			"angle",			"float",		"file",							"file"];
	this._propValues = [];

	// initialize the property values
	this._propValues[this._propNames[0]] = 0.0;
	this._propValues[this._propNames[1]] = 1.0;
	this._propValues[this._propNames[2]] = 2.0 * Math.PI;
	this._propValues[this._propNames[3]] = this._speed;
	this._propValues[this._propNames[4]] = this._tex0.slice();
	this._propValues[this._propNames[5]] = this._tex1.slice();
	///////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////

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


		// initialize the twist vert properties
        this.setShaderValues();
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
			var glTex = this._glTextures["u_tex0"];
			if (glTex)
			{
				//if (glTex.isAnimated())
					glTex.render();
				tex = glTex.getTexture();
				if (tex)
					technique.u_tex0.set( tex );
			}

			glTex = this._glTextures["u_tex1"];
			if (glTex)
			{
				//if (glTex.isAnimated())
					glTex.render();
				tex = glTex.getTexture();
				if (tex)
					technique.u_tex1.set( tex );
			}

		}
	}
};

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
					'u_tex0': { 'type' : 'tex2d' },
					'u_tex1': { 'type' : 'tex2d' },
					 'u_limit1': { 'type': 'float' },
					 'u_limit2': { 'type': 'float' },
					 'u_minVal': { 'type': 'float' },
					 'u_maxVal': { 'type': 'float' },
					 'u_center': { 'type': 'float' },
					 'u_twistAmount': { 'type': 'float' },
					 'speed': { 'type': 'float' }
				 }
			}
		]
	}
};

if (typeof exports === "object") {
	exports.TwistVertMaterial = TwistVertMaterial;
}

