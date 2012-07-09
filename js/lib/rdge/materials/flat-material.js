/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Material = require("js/lib/rdge/materials/material").Material;

///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
var FlatMaterial = function FlatMaterial()
{
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._name = "Flat";
    this._shaderName = "flat";

    this._color = [1, 0, 0, 1];

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this.getShaderName = function () { return this._shaderName; };
    this.isAnimated = function ()           { return false;     };
    this.getTechniqueName   = function()    {  return 'colorMe' };

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    // duplcate method requirde

    this.init = function (world)
    {
        // save the world
        if (world) {
            this.setWorld(world);

            // set up the shader
            this._shader = new RDGE.jshader();
            this._shader.def = flatShaderDef;
            this._shader.init();

            // set up the material node
            this._materialNode = RDGE.createMaterialNode("flatMaterial_" + world.generateUniqueNodeID());
            this._materialNode.setShader(this._shader);

            this.setShaderValues();
        }
        else
            throw new Error("GLWorld not supplied to material initialization");
    };


    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this._propNames = ["color"];
    this._propLabels = ["Color"];
    this._propTypes = ["color"];
    this._propValues = [];

    this._propValues[this._propNames[0]] = this._color;
};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader

// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
flatShaderDef  =
{
    'shaders':  { // shader files
        'defaultVShader':"assets/shaders/Basic.vert.glsl",
        'defaultFShader':"assets/shaders/Basic.frag.glsl"
        },
    'techniques': { // rendering control
        'colorMe':[ // simple color pass
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
                // attributes
                'params' :
                 {
                    'color' :   { 'type' : 'vec4' }
                 }
            }
        ]
     }
};

FlatMaterial.prototype = new Material();

if (typeof exports === "object") {
    exports.FlatMaterial = FlatMaterial;
}
