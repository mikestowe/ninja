/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */


///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      GL representation of a material.
///////////////////////////////////////////////////////////////////////
function IridescentScalesMaterial()
{
    // initialize the inherited members
    this.inheritedFrom = GLMaterial;
    this.inheritedFrom();
   
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "IridescentScalesMaterial";
	this._shaderName = "iridescentScales";

	//this._diffuseTexture = "grey";
	//this._specularTexture = "irredecentENV";
	//this._normalTexture = "scales_normal";

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getShaderName	= function()	{  return this._shaderName;	}

	//this.getLightDiff		= function()		{  return this._lightDiff;				}

	this.getDiffuseTexture	= function()		{	return this._propValues["diffuseTexture"].slice(0);		}
	this.setDiffuseTexture	= function(dt)		{	this._propValues["diffuseTexture"] = dt.slice(0);
													if (this._materialNode)  this._materialNode.setDiffuseTexture( dt );	}
	
	this.getSpecularTexture	= function()		{	return this._propValues["specularTexture"].slice(0);		}
	this.setSpecularTexture	= function(st)		{	this._propValues["specularTexture"] = st.slice(0);
													if (this._materialNode)  this._materialNode.setSpecularTexture( st );	}
	
	this.getNormalTexture	= function()		{	return this._propValues["normalTexture"].slice(0);			}
	this.setNormalTexture	= function(nt)		{	this._propValues["normalTexture"] = nt.slice(0);
													if (this._materialNode)  this._materialNode.setNormalTexture( nt );		}

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this._propNames			= ["diffuseTexture",	"specularTexture",	"normalTexture"];
	this._propLabels		= ["Diffuse Tecture",	"Specular Texture",	"Bump Map"];
	this._propTypes			= ["file",				"file",				"file"];
	this._propValues		= [];

	this._propValues[ this._propNames[0] ] = "grey";
	this._propValues[ this._propNames[1] ] = "irredecentENV";
	this._propValues[ this._propNames[2] ] = "scales_normal";

    this.setProperty = function( prop, value )
	{
		// make sure we have legitimate imput
		var ok = this.validateProperty( prop, value );
		if (!ok)
			console.log( "invalid property in Bump Metal Materia;" + prop + " : " + value );

		switch (prop)
		{
			case "diffuseTexture":	this.setDiffuseTexture( value );	break;
			case "specularTexture":	this.setSpecularTexture( value );	break;
			case "normalMap":		this.setNormalTexture( value );		break;

			default:
				console.log( "invalid property to Iridescent Scales Material: " + prop + ", value: " + value );
				break;
		}
	}

    ///////////////////////////////////////////////////////////////////////
    // Methods
    /////////////////////////////////////////////////////////////////////// 
	this.dup = function()	{  return new IridescentScalesMaterial();	}

	this.init = function()
	{
		// set up the shader
		this._shader = new jshader();
		this._shader.def = iridescentScalesShaderDef;
		this._shader.init();

		// create the material node
		this._materialNode = createMaterialNode( this.getName() );
		this._materialNode.setShader(this._shader);

		// set up the material node
		this._materialNode.setDiffuseTexture( this.getDiffuseTexture() );
		this._materialNode.setSpecTexture( this.getSpecularTexture() );
		this._materialNode.setNormalTexture( this.getNormalTexture() );
	}

	this.export = function()
	{
		// every material needs the base type and instance name
		var exportStr = "material: " + this.getShaderName() + "\n";
		exportStr += "name: " + this.getName() + "\n";

		exportStr += "diffuseTexture: "		+ this.getDiffuseTexture()	+ "\n";
		exportStr += "specularTexture: "	+ this.getSpecularTexture()	+ "\n";
		exportStr += "normalTexture: "		+ this.getNormalTexture()	+ "\n";
		
		// every material needs to terminate like this
		exportStr += "endMaterial\n";

		return exportStr;
	}

	this.import = function( importStr )
	{
		var pu = new ParseUtils( importStr );
		var material = pu.nextValue( "material: " );
		if (material != this.getShaderName())  throw new Error( "ill-formed material" );
		this.setName(  pu.nextValue( "name: ") );

		var rtnStr;
		try
		{
			var	dt = pu.nextValue( "diffuseTexture: " ),
				st = pu.nextValue( "specularTexture: " ),
				nt = pu.nextValue( "normalTexture: " );

			var endKey = "endMaterial\n";
			var index = importStr.indexOf( endKey );
			index += endKey.length;
			rtnStr = importStr.substr( index );
		}
		catch (e)
		{
			throw new Error( "could not import material: " + importStr );
		}
		
		return rtnStr;
	}
}

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shaders
/*
 *  The  main shader for the scene
 */
var iridescentScalesShaderDef =  {'shaders': {
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
