/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */
 
 ///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      GL representation of a material.
///////////////////////////////////////////////////////////////////////
function QuiltMaterial01()
{
    // initialize the inherited members
    this.inheritedFrom = GLMaterial;
    this.inheritedFrom();
   
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "QuiltMaterial 1";
	this._shaderName = "quilt_1";

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getShaderName	= function()	{  return this._shaderName;		}

    ///////////////////////////////////////////////////////////////////////
    // Methods
    /////////////////////////////////////////////////////////////////////// 
	this.dup = function()	{  return new QuiltMaterial01();	}

	this.init = function()
	{

		// set up the material node
		this._materialNode = createMaterialNode("quiltMaterial01")
		this._materialNode.setDiffuseTexture("quilt01");
		this._materialNode.setSpecTexture("quilt01_E");
		this._materialNode.setNormalTexture("quilt01_N");

		// set up the shader
		this._shader = new jshader();
		this._shader.def = quiltShaderDef;
		this._shader.init();
		this._materialNode.setShader(this._shader);
	}
}

///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      GL representation of a material.
///////////////////////////////////////////////////////////////////////
function QuiltMaterial02()
{
    // initialize the inherited members
    this.inheritedFrom = GLMaterial;
    this.inheritedFrom();
   
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "QuiltMaterial 2";
	this._shaderName = "quilt_2";

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getShaderName	= function()	{  return this._shaderName;		}

    ///////////////////////////////////////////////////////////////////////
    // Methods
    /////////////////////////////////////////////////////////////////////// 
	this.dup = function()	{  return new QuiltMaterial02();	}

	this.init = function()
	{

		// set up the material node
		this._materialNode = createMaterialNode("quiltMaterial02")
		this._materialNode.setDiffuseTexture("quilt02");
		this._materialNode.setSpecTexture("quilt02_E");
		this._materialNode.setNormalTexture("quilt02_N");

		// set up the shader
		this._shader = new jshader();
		this._shader.def = quilt2ShaderDef;
		this._shader.init();
		this._materialNode.setShader(this._shader);
	}
}

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shaders
/*
 *  The  main shader for the scene
 */
var quiltShaderDef =  {'shaders': {
            // this shader is being referenced by file
			'defaultVShader':"assets/shaders/quilt_vshader.glsl",
			'defaultFShader':"assets/shaders/quilt_fshader.glsl",
                
		},
        'techniques': { 
        'default':[{
              'vshader' : 'defaultVShader',
              'fshader' : 'defaultFShader',
              // attributes
              'attributes' :
               {
                'vert'  : { 'type' : 'vec3' },
                'normal' :  { 'type' : 'vec3' },
                'texcoord'  : { 'type' : 'vec2' },
               },
              // parameters
              'params' : 
               {
                  //'u_light0Diff' : { 'type' : 'vec4' },
                  //'u_matDiffuse' : { 'type' : 'vec4' }
               },

              // render states
              'states' : 
               {
                'depthEnable' : true,
                'offset':[1.0, 0.1],
                'blendEnabled' : true,
                'srcBlend' : 'SRC_ALPHA',
                'dstcBlend' : 'ONE_MINUS_SRC_ALPHA'
               },
            }]
          }};
          
var quilt2ShaderDef =  {'shaders': {
            // this shader is being referenced by file
			'defaultVShader':"assets/shaders/quilt_vshader.glsl",
			'defaultFShader':"assets/shaders/quilt2_fshader.glsl",
                
		},
        'techniques': { 
        'default':[{
              'vshader' : 'defaultVShader',
              'fshader' : 'defaultFShader',
              // attributes
              'attributes' :
               {
                'vert'  : { 'type' : 'vec3' },
                'normal' :  { 'type' : 'vec3' },
                'texcoord'  : { 'type' : 'vec2' },
               },
              // parameters
              'params' : 
               {
                  //'u_light0Diff' : { 'type' : 'vec4' },
                  //'u_matDiffuse' : { 'type' : 'vec4' }
               },

              // render states
              'states' : 
               {
                'depthEnable' : true,
                'offset':[1.0, 0.1],
                'blendEnabled' : true,
                'srcBlend' : 'SRC_ALPHA',
                'dstcBlend' : 'ONE_MINUS_SRC_ALPHA'
               },
            }]
          }};
