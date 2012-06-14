/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
    this.isAnimated = function ()			{ return false;		};
	this.getTechniqueName	= function()	{  return 'colorMe' };

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
						'vert'	:	{ 'type' : 'vec3' },
						'normal' :	{ 'type' : 'vec3' },
						'texcoord'	:	{ 'type' : 'vec2' }
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
