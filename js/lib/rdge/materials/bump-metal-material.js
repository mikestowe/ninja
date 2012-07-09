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

var MaterialParser = require("js/lib/rdge/materials/material-parser").MaterialParser;
var Material = require("js/lib/rdge/materials/material").Material;
var Texture = require("js/lib/rdge/texture").Texture;

///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
var BumpMetalMaterial = function BumpMetalMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._name = "Bump Metal";
    this._shaderName = "bumpMetal";


	this._defaultLightDiff = [0.3, 0.3, 0.3, 1.0];
    this._defaultDiffuseTexture = "assets/images/metal.png";
    this._defaultSpecularTexture = "assets/images/silver.png";
    this._defaultNormalTexture = "assets/images/normalMap.png";

    // array textures indexed by shader uniform name
    this._glTextures = [];

    this._speed = 1.0;

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this.isAnimated         = function()        {  return true;                 };
    this.getShaderDef       = function()        {  return bumpMetalMaterialDef; };

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this._propNames         = ["u_light0Diff",      "u_colMap",         "u_normalMap",  "u_glowMap" ];
    this._propLabels        = ["Diffuse Color",     "Diffuse Map",      "Bump Map",     "Specular Map" ];
    this._propTypes         = ["color",             "file",             "file",         "file" ];
    this._propValues        = [];

	this._propValues[ this._propNames[0] ] = this._defaultLightDiff;
    this._propValues[ this._propNames[1] ] = this._defaultDiffuseTexture.slice(0);
    this._propValues[ this._propNames[2] ] = this._defaultNormalTexture.slice(0);
    this._propValues[ this._propNames[3] ] = this._defaultSpecularTexture.slice(0);


    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////

    this.init = function( world )
    {
        // save the world
        if (world) {
             this.setWorld( world );
        }

        // set up the shader
        this._shader = new RDGE.jshader();
        this._shader.def = bumpMetalMaterialDef;
        this._shader.init();

        // set up the material node
        this._materialNode = RDGE.createMaterialNode( this.getShaderName() + "_" + world.generateUniqueNodeID() );
        this._materialNode.setShader(this._shader);

        this.setShaderValues();
        this.update(0);
    };

	this.resetToDefault = function()
	{
		this._propValues[ this._propNames[0] ] = this._defaultLightDiff;
		this._propValues[ this._propNames[1] ] = this._defaultDiffuseTexture.slice(0);
		this._propValues[ this._propNames[2] ] = this._defaultNormalTexture.slice(0);
		this._propValues[ this._propNames[3] ] = this._defaultSpecularTexture.slice(0);
		for (var i=0; i<4;  i++)
			this.setProperty( this._propNames[i],  this._propValues[this._propNames[i]]  );
};
};


///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader

// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
var bumpMetalMaterialDef = bumpMetalShaderDef =
{
    'shaders':
    {
        // this shader is being referenced by file
        'defaultVShader':"assets/shaders/test_vshader.glsl",
        'defaultFShader':"assets/shaders/test_fshader.glsl",

        // this shader is inline
        'dirLightVShader': "\
            uniform mat4 u_mvMatrix;\
            uniform mat4 u_normalMatrix;\
            uniform mat4 u_projMatrix;\
            uniform mat4 u_worldMatrix;\
            attribute vec3  a_pos;\
            attribute vec3  a_nrm;\
            varying vec3 vNormal;\
            varying vec3 vPos;\
            void main() {\
                vNormal.xyz = (u_normalMatrix*vec4(a_nrm, 0.0)).xyz;\
                gl_Position = u_projMatrix * u_mvMatrix * vec4(a_pos,1.0);\
                vPos = (u_worldMatrix * vec4(a_pos,1.0)).xyz;\
            }",
        'dirLightFShader': "\
            precision highp float;\
            uniform vec4 u_light1Diff;\
            uniform vec3 u_light1Pos;\
            uniform vec4 u_light2Diff;\
            uniform vec3 u_light2Pos;\
            varying vec3 vNormal;\
            varying vec3 vPos;\
            void main() {\
                vec3 light1 = vec3(u_light1Pos.x - vPos.x, u_light1Pos.y - vPos.y, u_light1Pos.z - vPos.z);\
                vec3 light2 = vec3(u_light2Pos.x - vPos.x, u_light2Pos.y - vPos.y, u_light2Pos.z - vPos.z);\
                float t = 0.75;\
                float range = t*t;\
                float alpha1 = max(0.0, 1.0 - ( (light1.x*light1.x)/range + (light1.y*light1.y)/range + (light1.z*light1.z)/range));\
                float alpha2 = max(0.0, 1.0 - ( (light2.x*light2.x)/range + (light2.y*light2.y)/range + (light2.z*light2.z)/range));\
                gl_FragColor = vec4((u_light2Diff*alpha2 + u_light1Diff*alpha1).rgb, 1.0);\
            }"
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
                    'u_light0Diff' : { 'type' : 'vec4' },
                    'u_colMap': { 'type' : 'tex2d' },
                    'u_normalMap': { 'type' : 'tex2d' },
                    'u_glowMap': { 'type' : 'tex2d' }
                },

                // render states
                'states' :
                    {
                    'depthEnable' : true,
                    'offset':[1.0, 0.1]
                    }
            },
            {   // light pass
                'vshader' : 'dirLightVShader',
                'fshader' : 'dirLightFShader',
                // attributes
                'attributes' :
                    {
                    'a_pos' :   { 'type' : 'vec3' },
                    'a_nrm' :   { 'type' : 'vec3' }
                    },
                // parameters
                'params' :
                    {
                    },

                // render states
                'states' :
                    {
                    'depthEnable' : true,
                    "blendEnable" : true,
                    "srcBlend" : "SRC_ALPHA",
                    "dstBlend" : "DST_ALPHA"
                    }
            }   // light pass
        ]
    }   // techniques
};

BumpMetalMaterial.prototype = new Material();

if (typeof exports === "object") {
    exports.BumpMetalMaterial = BumpMetalMaterial;
}

