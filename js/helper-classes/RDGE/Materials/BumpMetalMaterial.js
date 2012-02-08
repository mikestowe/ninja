/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */


///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
function BumpMetalMaterial()
{
    // initialize the inherited members
    this.inheritedFrom = GLMaterial;
    this.inheritedFrom();
   
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "BumpMetalMaterial";
	this._shaderName = "bumpMetal";

	this._lightDiff = [0.3, 0.3, 0.3, 1.0];
	this._diffuseTexture = "metal";
	this._specularTexture = "silver";
	this._normalTexture = "normalMap";

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getName			= function()		{	return this._name;								}
	this.getShaderName		= function()		{	return this._shaderName;						}

	this.getLightDiff		= function()		{	return this._lightDiff;							}
	this.setLightDiff		= function(ld)		{	this._lightDiff = ld;
													if (this._shader && this._shader.default)
														this._shader.default.u_light0Diff.set( ld );	}

	this.getDiffuseTexture	= function()		{	return this._diffuseTexture;					}
	this.setDiffuseTexture	= function(dt)		{	this._diffuseTexture = dt;
													if (this._materialNode)  this._materialNode.setDiffuseTexture( dt );	}

	this.getSpecularTexture	= function()		{	return this._specularTexture;					}
	this.setSpecularTexture	= function(st)		{	this._specularTexture = st;
													if (this._materialNode)  this._materialNode.setSpecularTexture( st );	}

	this.getNormalTexture	= function()		{	return this._normalTexture;						}
	this.setNormalTexture	= function(nt)		{	this._normalTexture = nt;
													if (this._materialNode)  this._materialNode.setNormalTexture( nt );		}

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this._propNames			= ["lightDiff",		"diffuseTexture",	"normalMap",	"specularTexture"];
	this._propLabels		= ["Diffuse Color",	"Diffuse Map",	"Bump Map",		"Specular Map"];
	this._propTypes			= ["color",			"file",			"file",			"file"];
	this._propValues		= [];

	this._propValues[ this._propNames[0] ] = this._lightDiff.slice(0);
	this._propValues[ this._propNames[1] ] = this._diffuseTexture.slice(0);
	this._propValues[ this._propNames[2] ] = this._specularTexture.slice(0);
	this._propValues[ this._propNames[3] ] = this._specularTexture.slice(0);

    // TODO - shader techniques are not all named the same, i.e., FlatMaterial uses "colorMe" and BrickMaterial uses "default"
    this.setProperty = function( prop, value )
	{
		// every material should do something with the "color" property
		if (prop === "color")  prop = "lightDiff";

		// make sure we have legitimate imput
		var ok = this.validateProperty( prop, value );
		if (!ok)
		{
			console.log( "invalid property in Bump Metal Materia;" + prop + " : " + value );
			return;
		}

		switch (prop)
		{
			case "lightDiff":		this.setLightDiff( value );			break;
			case "diffuseTexture":	this.setDiffuseTexture( value );	break;
			case "specularTexture":	this.setSpecularTexture( value );	break;
			case "normalMap":		this.setNormalTexture( value );		break;

			default:
				console.log( "invalid property to Bump Metal Material: " + prop + ", value: " + value );
				break;
		}
	}

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function()	{  return new BumpMetalMaterial();	} 

	this.init = function()
	{
		// set up the shader
		this._shader = new jshader();
		this._shader.def = bumpMetalMaterialDef;
		this._shader.init();
		this._shader.default.u_light0Diff.set( this.getLightDiff() );

		// set up the material node
		this._materialNode = createMaterialNode( this.getShaderName() );
		this._materialNode.setShader(this._shader);

		// set some image maps
		this._materialNode.setDiffuseTexture( this.getDiffuseTexture() );
        this._materialNode.setSpecTexture( this.getSpecularTexture() );
        this._materialNode.setNormalTexture( this.getNormalTexture() );
	}

	this.export = function()
	{
		// every material needs the base type and instance name
		var exportStr = "material: " + this.getShaderName() + "\n";
		exportStr += "name: " + this.getName() + "\n";

		exportStr += "lightDiff: "			+ this.getLightDiff()		+ "\n";
		exportStr += "diffuseTexture: "		+ this.getDiffuseTexture()	+ "\n";
		exportStr += "specularTexture: "	+ this.getSpecularTexture()	+ "\n";
		exportStr += "normalMap: "		+ this.getNormalTexture()	+ "\n";

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
			var lightDiff  = eval( "[" + pu.nextValue( "lightDiff: " ) + "]" ),
				dt = pu.nextValue( "diffuseTexture: " ),
				st = pu.nextValue( "specularTexture: " ),
				nt = pu.nextValue( "normalMap: " );
		
			this.setProperty( "lightDiff",  lightDiff);
			this.setProperty( "diffuseTexture", dt );
			this.setProperty( "specularTexture", st );
			this.setProperty( "normalMap", nt );

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
// RDGE shader
 
// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
var bumpMetalMaterialDef =
bumpMetalShaderDef =  
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
            }",
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
					'texcoord'  :   { 'type' : 'vec2' },
				},
				// parameters
				'params' : 
				{
					'u_light0Diff' : { 'type' : 'vec4' },
					//'u_matDiffuse' : { 'type' : 'vec4' }
				},

                // render states
                'states' : 
                    {
                    'depthEnable' : true,
                    'offset':[1.0, 0.1]
                    },
			},
            {   // light pass
                'vshader' : 'dirLightVShader',
                'fshader' : 'dirLightFShader',
                // attributes
                'attributes' :
                    {
                    'a_pos' :   { 'type' : 'vec3' },
                    'a_nrm' :   { 'type' : 'vec3' },
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
                    "dstBlend" : "DST_ALPHA",
                    },
            }	// light pass
		]
	}	// techniques
};




