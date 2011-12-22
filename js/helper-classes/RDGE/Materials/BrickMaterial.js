/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */


///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
function BrickMaterial()
{
    // initialize the inherited members
    this.inheritedFrom = GLMaterial;
    this.inheritedFrom();
   
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._shaderName = "brick";
	this._name = "BrickMaterial";

	// store local values in convenient form
	this._propNames			= ["BrickColor",		"MortarColor",		"BrickSize",		"BrickPct"		];
	this._propLabels		= ["Brick Color",		"Mortar Color",		"Brick Size",		"Brick Percent"	];
	this._propTypes			= ["color",				"color",			"vector2d",			"vector2d"		];
	this._propValues		= [];

	// set default property values
	this._propValues[this._propNames[0]] = [0.8,0,0,1].slice(0);
	this._propValues[this._propNames[1]] = [0.8, 0.8, 0.0, 1.0].slice(0);
	this._propValues[this._propNames[2]] = [1, .5].slice(0);
	this._propValues[this._propNames[3]] = [.8, .7].slice(0);

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////

	this.getBrickColor		= function()	{  return this._propValues["BrickColor"].slice(0);		}
	this.getMortarColor		= function()	{  return this._propValues["MortarColor"].slice(0);		}
	this.getBrickSize		= function()	{  return this._propValues["BrickSize"].slice(0);		}
	this.getBrickPct		= function()	{  return this._propValues["BrickPct"].slice(0);		}

	this.getShaderName		= function()	{  return this._shaderName;				}

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function()	{  return new BrickMaterial();	} 

	this.init = function()
	{
		// set up the shader
		this._shader = new jshader();
		this._shader.def = brickShaderDef;
		this._shader.init();

		// set the defaults
		this._shader.default.BrickColor.set( this.getBrickColor() );
		this._shader.default.MortarColor.set( this.getMortarColor() );
		this._shader.default.BrickSize.set( this.getBrickSize() );
		this._shader.default.BrickPct.set( this.getBrickPct() );

		// set up the material node
		this._materialNode = createMaterialNode("brickMaterial");
		this._materialNode.setShader(this._shader);
	}

    this.setProperty = function( prop, value )
	{
		// we always want to use the "color" property for something
		if (prop == "color")  prop = "BrickColor";

		// make sure we have legitimate imput
		var ok = this.validateProperty( prop, value );
		if (ok)
		{
			this._propValues[prop] = value;
			if (this._shader && this._shader.default)
				this._shader.default[prop].set(value);
		}
	}

	this.export = function()
	{
		// every material needs the base type and instance name
		var exportStr = "material: " + this.getShaderName() + "\n";
		exportStr += "name: " + this.getName() + "\n";

		if (this._shader)
		{
			exportStr += "BrickColor: "  + String(this._shader.default.BrickColor)  + "\n";
			exportStr += "MortarColor: " + String(this._shader.default.MortarColor) + "\n";
			exportStr += "BrickSize: "   + String(this._shader.default.BrickSize)   + "\n";
			exportStr += "BrickPct: "    + String(this._shader.default.BrickPct)    + "\n";
		}
		else
		{
			exportStr += "BrickColor: "  + String(this.getBrickColor())  + "\n";
			exportStr += "MortarColor: " + String(this.getMortarColor()) + "\n";
			exportStr += "BrickSize: "   + String(this.getBrickSize())   + "\n";
			exportStr += "BrickPct: "    + String(this.getBrickPct())    + "\n";
		}
		
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

		var brickColor  = eval( "[" + pu.nextValue( "BrickColor: " ) + "]" ),
			mortarColor = eval( "[" + pu.nextValue( "MortarColor: " ) + "]" ),
			brickSize   = eval( "[" + pu.nextValue( "BrickSize: " ) + "]" ),
			brickPct    = eval( "[" + pu.nextValue( "BrickPct: " ) + "]" );

		var endKey = "endMaterial\n";
		var index = importStr.indexOf( endKey );
		index += endKey.length;
		var rtnStr = importStr.substr( index );
		
		return rtnStr;
	}
}

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader
var brickShaderDef =  {'shaders': {
						// Brick shader
				        'defaultVShader':"assets/shaders/CH06-brick.vert.glsl",
				        'defaultFShader':"assets/shaders/CH06-brick.frag.glsl",
				        
				        // this shader is inline
				        'dirLightVShader': "\
							uniform mat4 u_mvMatrix;\
							uniform mat4 u_normalMatrix;\
							uniform mat4 u_projMatrix;\
							uniform mat4 u_worldMatrix;\
							attribute vec3	a_pos;\
							attribute vec3	a_nrm;\
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
		    'default':[
						{
							'vshader' : 'defaultVShader',
							'fshader' : 'defaultFShader',
							// attributes
							'attributes' :
							{
								'vert'	:	{ 'type' : 'vec3' },
								'normal' :	{ 'type' : 'vec3' },
								'texcoord'	:	{ 'type' : 'vec2' },
							},
							// parameters
							'params' : 
							{
								//'u_light0Diff' : { 'type' : 'vec4' },
								//'u_matDiffuse' : { 'type' : 'vec4' }

								// Brick shader
								'BrickColor' : { 'type' : 'vec3' },
								'MortarColor' : { 'type' : 'vec3' },
								'BrickSize' : { 'type' : 'vec2' },
								'BrickPct' : { 'type' : 'vec2' }
							},

							// render states
							'states' : 
							{
								'depthEnable' : true,
								'offset':[1.0, 0.1]
							},
						},
						{	// light pass
							'vshader' : 'dirLightVShader',
							'fshader' : 'dirLightFShader',
							// attributes
							'attributes' :
							{
								'a_pos'	:	{ 'type' : 'vec3' },
								'a_nrm'	:	{ 'type' : 'vec3' },
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
						}
					]
				}
			};
