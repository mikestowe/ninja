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

var PlasmaMaterial = function PlasmaMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._name = "Plasma";
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
    this._propNames         = ["u_wave",    "u_wave1",  "u_wave2",      "u_speed"];
    this._propLabels        = ["Wave",      "Wave 1",   "Wave 2",       "Speed"];
    this._propTypes         = ["float",     "float",    "float",        "float"];

    this._propValues        = [];
    this._propValues[ this._propNames[0] ] = this._wave;
    this._propValues[ this._propNames[1] ] = this._wave1;
    this._propValues[ this._propNames[2] ] = this._wave2;
    this._propValues[ this._propNames[3] ] = this._speed;


    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this.getShaderName  = function()    {  return this._shaderName;     };
    this.isAnimated     = function()    {  return true;                 };
    this.getShaderDef   = function()    {  return plasmaShaderDef;      };

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    // duplcate method requirde

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

        // set up the material node
        this._materialNode = RDGE.createMaterialNode("plasmaMaterial" + "_" + world.generateUniqueNodeID());
        this._materialNode.setShader(this._shader);

        this._time = 0;
        if (this._shader && this._shader['default']) {
            this._shader['default'].u_time.set( [this._time] );
        }

        this.setShaderValues();
    };

    this.update = function( time ) {
        this._shader['default'].u_time.set( [this._time] );
        this._time += this._dTime;
    };

	this.resetToDefault = function()
	{
		this._propValues[ this._propNames[0] ] = this._wave;
		this._propValues[ this._propNames[1] ] = this._wave1;
		this._propValues[ this._propNames[2] ] = this._wave2;
		this._propValues[ this._propNames[3] ] = this._speed;

		var nProps = this._propNames.length;
		for (var i=0; i<nProps;  i++)
			this.setProperty( this._propNames[i],  this._propValues[this._propNames[i]]  );
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
                    'vert'  :   { 'type' : 'vec3' },
                    'normal' :  { 'type' : 'vec3' },
                    'texcoord'  :   { 'type' : 'vec2' }
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


