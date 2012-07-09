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
var PulseMaterial = function PulseMaterial()
{
    var MaterialLibrary = require("js/models/materials-model").MaterialsModel;

   // initialize the inherited members
    this.inheritedFrom = Material;
    this.inheritedFrom();

    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._name = "Pulse";
    this._shaderName = "pulse";

    this._texMap = 'assets/images/cubelight.png';

    this._time = 0.0;
    this._dTime = 0.01;

    this._glTextures = [];

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this.isAnimated         = function()            {  return true;     };
    this.getShaderDef       = function()            {  return pulseMaterialDef; }

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////

    var u_tex0_index    = 0,
        u_xScale_index  = 1,
        u_yScale_index  = 2,
        u_speed_index   = 3;

    this._propNames         = ["u_tex0",        "u_xscale",     "u_yscale",     "u_speed" ];
    this._propLabels        = ["Texture map",   "X Range",      "Y Range",      "Speed" ];
    this._propTypes         = ["file",          "float",        "float",        "float"];
    this._propValues        = [];

    this._propValues[ this._propNames[  u_tex0_index] ] = this._texMap.slice(0);
    this._propValues[ this._propNames[u_xScale_index] ] = 0.5;
    this._propValues[ this._propNames[u_yScale_index] ] = 0.4;
    this._propValues[ this._propNames[ u_speed_index] ] = 1.0;
    ///////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    // duplicate method required

    this.init = function( world )
    {
        // save the world
        if (world)  this.setWorld( world );

        // this variable declared above is inherited set to a smaller delta.
        // the pulse material runs a little faster
        this._dTime = 0.01;

        // set up the shader
        this._shader = new RDGE.jshader();
        this._shader.def = pulseMaterialDef;
        this._shader.init();

        // set up the material node
        this._materialNode = RDGE.createMaterialNode("pulseMaterial" + "_" + world.generateUniqueNodeID());
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

	this.resetToDefault = function()
	{
		this._propValues[ this._propNames[  u_tex0_index] ] = this._texMap.slice(0);
		this._propValues[ this._propNames[u_xScale_index] ] = 0.5;
		this._propValues[ this._propNames[u_yScale_index] ] = 0.4;
		this._propValues[ this._propNames[ u_speed_index] ] = 1.0;
	
		var nProps = this._propNames.length;
		for (var i=0; i<nProps;  i++)
			this.setProperty( this._propNames[i],  this._propValues[this._propNames[i]]  );
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
                var glTex = this._glTextures["u_tex0"];
                if (glTex)
                {
                    //this.updateTexture();
                    if (glTex.isAnimated())
                        glTex.render();
                    tex = glTex.getTexture();
                    if (tex)
                        technique.u_tex0.set( tex );
                }

                if (this._shader && this._shader['default']) {
                    this._shader['default'].u_time.set( [this._time] );
                }
                this._time += this._dTime;
            }
        }
    };

    this.setResolution = function( res ) {
        var material = this._materialNode;
        if (material) {
            var technique = material.shaderProgram['default'];
            var renderer = RDGE.globals.engine.getContext().renderer;
            if (renderer && technique) {
                technique.u_resolution.set( res );
            }
        }
    };

};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader

// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
var pulseMaterialDef =
{'shaders':
    {
        'defaultVShader':"assets/shaders/Basic.vert.glsl",
        'defaultFShader':"assets/shaders/Pulse.frag.glsl"
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
                    'u_tex0'   : { 'type' : 'tex2d' },
                    'u_time'   : { 'type' : 'float' },
                    'u_speed'  : { 'type' : 'float' },
                    'u_xscale' : { 'type' : 'float' },
                    'u_yscale' : { 'type' : 'float' },
                    'u_resolution'  :   { 'type' : 'vec2' }
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

//PulseMaterial.prototype = new Material();

if (typeof exports === "object") {
    exports.PulseMaterial = PulseMaterial;
}

