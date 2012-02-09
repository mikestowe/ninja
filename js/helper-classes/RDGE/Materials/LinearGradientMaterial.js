/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */


///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
function LinearGradientMaterial()
{
    // initialize the inherited members
    this.inheritedFrom = GLMaterial;
    this.inheritedFrom();
   
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "LinearGradientMaterial";
	this._shaderName = "linearGradient";

	this._color1		= [1,0,0,1];
	this._color2		= [0,1,0,1];
	this._color3		= [0,0,1,1];
	this._color4		= [0,1,1,1];
	this._colorStop1	= 0.0;
	this._colorStop2	= 0.3;
	this._colorStop3	= 0.6;
	this._colorStop4	= 1.0;
	this._colorCount	= 4;
	this._angle			= 0.0;	// the shader takes [cos(a), sin(a)]

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getShaderName	= function()		{  return this._shaderName;			}
	this.getName		= function()		{  return this._name;				}

	this.getColor1	= function()		{	return this._color1;		}
	this.setColor1	= function(c)		{	this._color1 = c.slice();
												if (this._shader && this._shader.default)
													this._shader.default.u_color1.set(c);
										}

	this.getColor2	= function()		{	return this._color2;		}
	this.setColor2	= function(c)		{	this._color2 = c.slice();
												if (this._shader && this._shader.default)
													this._shader.default.u_color2.set(c);
										}

	this.getColor3	= function()		{	return this._color3;		}
	this.setColor3	= function(c)		{	this._color3 = c.slice();
												if (this._shader && this._shader.default)
													this._shader.default.u_color3.set(c);
										}

	this.getColor4	= function()		{	return this._color4;		}
	this.setColor4	= function(c)		{	this._color4 = c.slice();
												if (this._shader && this._shader.default)
													this._shader.default.u_color4.set(c);
										}

	this.getColorStop1 = function()		{  return this._colorStop1;		}
	this.setColorStop1 = function(s)	{  this._colorStop1 = s;
												if (this._shader && this._shader.default)
													this._shader.default.u_colorStop1.set([s]);
										}

	this.getColorStop2 = function()		{  return this._colorStop2;		}
	this.setColorStop2 = function(s)	{  this._colorStop2 = s;
												if (this._shader && this._shader.default)
													this._shader.default.u_colorStop2.set([s]);
										}

	this.getColorStop3 = function()		{  return this._colorStop3;		}
	this.setColorStop3 = function(s)	{  this._colorStop3 = s;
												if (this._shader && this._shader.default)
													this._shader.default.u_colorStop3.set([s]);
										}

	this.getColorStop4 = function()		{  return this._colorStop4;		}
	this.setColorStop4 = function(s)	{  this._colorStop4 = s;
												if (this._shader && this._shader.default)
													this._shader.default.u_colorStop4.set([s]);
										}

	this.getColorCount	= function()	{  return this._colorCount;		}
	this.setColorCount	= function(c)	{  this._colorCount = c;
												if (this._shader && this._shader.default)
													this._shader.default.u_colorCount.set([c]);
										}

	this.getAngle		= function()		{	return this._angle;			}
	this.setAngle		= function(a)		{	this._angle = a;
												if (this._shader && this._shader.default)
													this._shader.default.u_cos_sin_angle.set([Math.cos(a), Math.sin(a)]);
											}

	this.isAnimated			= function()			{  return false;					}

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this._propNames			= ["color1",		"color2",		"angle"];
	this._propLabels		= ["Start Color",	"Stop Color",	"Angle"];
	this._propTypes			= ["color",			"color",		"float"];
	this._propValues		= [];

	this._propValues[ this._propNames[0] ] = this._color1.slice(0);
	this._propValues[ this._propNames[1] ] = this._color4.slice(0);
	this._propValues[ this._propNames[2] ] = this._angle;

    this.setProperty = function( prop, value )
	{
		if (prop === "color")  prop = "color1";

		// make sure we have legitimate imput
		var ok = this.validateProperty( prop, value );
		if (!ok)
			console.log( "invalid property in Linear Gradient Material" + prop + " : " + value );

		switch (prop)
		{
			case "color1":		this.setColor1( value );		break;
			case "color2":		this.setColor2( value );		break;
			case "angle":		this.setAngle( value );			break;
		}
	}

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function()	{  return new LinearGradientMaterial();	} 

	this.init = function()
	{
		// set up the shader
		this._shader = new jshader();
		this._shader.def = linearGradientMaterialDef;
		this._shader.init();

		// set up the material node
		this._materialNode = createMaterialNode( this.getShaderName() );
		this._materialNode.setShader(this._shader);

		// send the current values to the shader
		this.updateShaderValues();

		console.log( "**** LinearGradientMaterial initialized" );
	}

	this.updateShaderValues= function()
	{
		if (this._shader && this._shader.default)
		{
			//this._shader.default.u_colorCount.set( [4] );

			var c;
			c = this.getColor1();
			this._shader.default.u_color1.set( c );
			c = this.getColor2();
			this._shader.default.u_color2.set( c );
			c = this.getColor3();
			this._shader.default.u_color3.set( c );
			c = this.getColor4();
			this._shader.default.u_color4.set( c );

			var s;
			s = this.getColorStop1();
			this._shader.default.u_colorStop1.set( [s] );
			s = this.getColorStop2();
			this._shader.default.u_colorStop2.set( [s] );
			s = this.getColorStop3();
			this._shader.default.u_colorStop3.set( [s] );
			s = this.getColorStop4();
			this._shader.default.u_colorStop4.set( [s] );

			this.setAngle( this.getAngle() );
		}
	}

	this.export = function()
	{
		// every material needs the base type and instance name
		var exportStr = "material: " + this.getShaderName() + "\n";
		exportStr += "name: " + this.getName() + "\n";

		exportStr += "startColor: "		+ this.getStartColor()	+ "\n";
		exportStr += "stopColor: "		+ this.getStopColor()	+ "\n";
		exportStr += "angle: "			+ this.getAngle()		+ "\n";
		
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
			var startColor	= eval( "[" + pu.nextValue( "startColor: " )	+ "]" ),
				stopColor	= eval( "[" + pu.nextValue( "stopColor: " )		+ "]" ),
				angle		= eval( "[" + pu.nextValue( "angle: " )			+ "]" );

			var endKey = "endMaterial\n";
			var index = importStr.indexOf( endKey );
			index += endKey.length;
			rtnStr = importStr.substr( index );

			this.setProperty( "startColor", startColor );
			this.setProperty( "stopColor", stopColor );
			this.setProperty( "angle", angle );
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
var linearGradientMaterialDef =
{'shaders': 
	{
			// Brick shader
			'defaultVShader':"assets/shaders/linearGradient.vert.glsl",
			'defaultFShader':"assets/shaders/linearGradient.frag.glsl",
				        
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
						'vert'	:	{ 'type' : 'vec3' },
						'normal' :	{ 'type' : 'vec3' },
						'texcoord'	:	{ 'type' : 'vec2' },
					},
					// parameters
					'params' : 
					{
						'u_color1' :		{ 'type' : 'vec4' },									
						'u_color2' :		{ 'type' : 'vec4' },									
						'u_color3' :		{ 'type' : 'vec4' },									
						'u_color4' :		{ 'type' : 'vec4' },
						'u_colorStop1':		{ 'type' : 'float' },									
						'u_colorStop2':		{ 'type' : 'float' },									
						'u_colorStop3':		{ 'type' : 'float' },									
						'u_colorStop4':		{ 'type' : 'float' },									
						'u_cos_sin_angle' : { 'type' : 'vec2' }
						//'u_colorCount':		{'type' : 'int' }

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




