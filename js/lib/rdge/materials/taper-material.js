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
var TaperMaterial = function TaperMaterial()
{
    // initialize the inherited members
	this.inheritedFrom = Material;
    this.inheritedFrom();

    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._name = "Taper";
    this._shaderName = "taper";

    this._deltaTime = 0.0;

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this.getShaderName = function () { return this._shaderName; };

    this.isAnimated = function () { return true; };
	this.getShaderDef	= function()	{  return taperShaderDef;	};
	this.getTechniqueName	= function() {  return 'colorMe'  };

    this.hasVertexDeformation = function () { return this._hasVertexDeformation; };
    this._hasVertexDeformation = true;
    this._vertexDeformationTolerance = 0.02; // should be a property

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    this.init = function (world) {
        this.setWorld(world);

        // set up the shader
        this._shader = new RDGE.jshader();
        this._shader.def = taperShaderDef;
        this._shader.init();

        // set up the material node
        this._materialNode = RDGE.createMaterialNode("taperMaterial" + "_" + world.generateUniqueNodeID());
        this._materialNode.setShader(this._shader);
 
        this._time = 0;
        if (this._shader && this._shader['default']) {
            this._shader['default'].u_time.set([this._time]);
        }

        // initialize the taper properties
        this.setShaderValues();
    };


    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this._propNames = [ "u_limit1", "u_limit2", "u_limit3", "u_minVal", "u_maxVal", "u_center", "u_taperAmount",  "u_speed" ];
    this._propLabels = [ "Minimum Parameter Value", "Center Paramater Value", "Maximum Parameter Value", "Minimum Data Bounds", "Maximum Data Bounds", "Center", "Taper Amount", "Speed" ];
    this._propTypes = [ "float", "float", "float", "float", "float", "float", "float", "float" ];
    this._propValues = [];

    // initialize the property values
    this._propValues[this._propNames[0]] = 0.25;
    this._propValues[this._propNames[1]] = 0.50;
    this._propValues[this._propNames[2]] = 0.75;
    this._propValues[this._propNames[3]] = -1;
    this._propValues[this._propNames[4]] = 1;
    this._propValues[this._propNames[5]] = 0.0;
    this._propValues[this._propNames[6]] = 0.9;
    this._propValues[this._propNames[7]] = 1.0;

    this.update = function (time) {
        var speed = this._propValues["u_speed"];
        this._deltaTime += 0.01 * speed;

        if (this._shader && this._shader.colorMe) {
            var t3 = this._propValues["u_limit3"] - this._deltaTime;
            if (t3 < 0) {
                this._deltaTime = this._propValues["u_limit1"] - 1.0;
                t3 = this._propValues["u_limit3"] - this._deltaTime;
            }

            var t1 = this._propValues["u_limit1"] - this._deltaTime,
				t2 = this._propValues["u_limit2"] - this._deltaTime;


            this._shader.colorMe["u_limit1"].set([t1]);
            this._shader.colorMe["u_limit2"].set([t2]);
            this._shader.colorMe["u_limit3"].set([t3]);
        }
    };
};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader

// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
taperShaderDef = {
    'shaders': { // shader files
        'defaultVShader': "assets/shaders/Taper.vert.glsl",
        'defaultFShader': "assets/shaders/Taper.frag.glsl"
    },
    'techniques': { // rendering control
        'colorMe': [ // simple color pass
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
				     'u_limit3': { 'type': 'float' },
				     'u_minVal': { 'type': 'float' },
				     'u_maxVal': { 'type': 'float' },
				     'u_center': { 'type': 'float' },
				     'u_taperAmount': { 'type': 'float' },
				     'u_speed': { 'type': 'float' }
				 }
            }
		]
    }
};


if (typeof exports === "object") {
    exports.TaperMaterial = TaperMaterial;
}
