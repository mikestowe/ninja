/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */


///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      GL representation of a material.
///////////////////////////////////////////////////////////////////////
function StitchMaterial()
{
    // initialize the inherited members
    this.inheritedFrom = GLMaterial;
    this.inheritedFrom();
   
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "StitchMaterial";
	this._shaderName = "stitch";

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getShaderName	= function()	{  return this._shaderName;		}

    ///////////////////////////////////////////////////////////////////////
    // Methods
    /////////////////////////////////////////////////////////////////////// 
	this.dup = function()	{  return new StitchMaterial();	}

	this.init = function()
	{

		// set up the material node
		this._materialNode = createMaterialNode("stitchMaterial")
		this._materialNode.setDiffuseTexture("stitchStroke");
		this._materialNode.setSpecTexture("quilt02_E");
		this._materialNode.setNormalTexture("stitchStroke_N");

		// set up the shader
		this._shader = new jshader();
		this._shader.def = stitchShaderDef;
		this._shader.init();
		this._materialNode.setShader(this._shader);
	}
}

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shaders
/*
 *  The  main shader for the scene
 */
var stitchShaderDef =  {'shaders': {
            // this shader is being referenced by file
			'defaultVShader':"assets/shaders/quilt_vshader.glsl",
			'defaultFShader':"assets/shaders/quilt_fshader.glsl",
                
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
			}",
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
                'offset':[1.0, 0.1]
               },
            }]
          }};
