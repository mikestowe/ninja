/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */


///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
function RadialGradientMaterial()
{
    // initialize the inherited members
    this.inheritedFrom = GLMaterial;
    this.inheritedFrom();
   
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "RadialGradientMaterial";
	this._shaderName = "radialGradient";

	this._startColor = [1, 0, 0, 1];
	this._stopColor  = [0, 1, 0, 1];

	this._mainCircleRadius = 0.5;
	this._innerCircleRadius = 0.05;
	this._innerCircleCenter = [0.5, 0.5];
	this._mainCircleCenter = [0.5, 0.5];

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getName		= function()	{ return this._name;			}
	this.getShaderName	= function()	{  return this._shaderName;		}

	this.getStartColor			= function()		{  return this._startColor.slice(0);	}
	this.setStartColor			= function(c)		{  this._startColor = c.slice(0);		}	

	this.getStopColor			= function()		{  return this._stopColor.slice(0);		}
	this.setStopColor			= function(c)		{  this._stopColor = c.slice(0);		}	

	this.getMainCircleRadius	= function()		{  return this._mainCircleRadius;		}
	this.setMainCircleRadius	= function(r)		{  this._mainCircleRadius = r;			}

	this.getInnerCircleRadius	= function()		{  return this._innerCircleRadius;		}
	this.setInnerCircleRadius	= function(r)		{  this._innerCircleRadius = r;			}

	this.getInnerCircleCenter	= function()		{  return this._innerCircleCenter;		}
	this.setInnerCircleCenter	= function(c)		{  this._innerCircleCenter = c;			}

	this.getMainCircleCenter	= function()		{  return this._mainCircleCenter;		}
	this.setMainCircleCenter	= function(c)		{  this._mainCircleCenter = c;			}

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this._propNames			= ["startColor",	"stopColor",	"mainCircleRadius",		"innerCircleRadius",	"mainCircleCenter",		"innerCircleCenter"];
	this._propLabels		= ["Start Color",	"Stop Color",	"Main Circle Radius",	"Inner Circle Radius",	"Main Circle Center",	"Inner Circle Center"];
	this._propTypes			= ["color",			"color",		"float",				"float",				"vector2d",				"vector2d"];
	this._propValues		= [];

	this._propValues[ this._propNames[0] ] = this._startColor.slice(0);
	this._propValues[ this._propNames[1] ] = this._stopColor.slice(0);
	this._propValues[ this._propNames[2] ] = this.getMainCircleRadius();
	this._propValues[ this._propNames[3] ] = this.getInnerCircleRadius();
	this._propValues[ this._propNames[4] ] = this.getMainCircleCenter();
	this._propValues[ this._propNames[5] ] = this.getInnerCircleCenter();

    this.setProperty = function( prop, value )
	{
		if (prop === "color")  prop = "startColor";

		// make sure we have legitimate imput
		var ok = this.validateProperty( prop, value );
		if (!ok)
			console.log( "invalid property in Radial Gradient Material:" + prop + " : " + value );

		switch (prop)
		{
			case "startColor":				this.setStartColor(value);				break;
			case "stopColor":				this.setStopColor(value);				break;
			case "innerCircleRadius":		this.setInnerCircleRadius( value );		break;
			case "mainCircleRadius":		this.setMainCircleRadius( value );		break;
			case "innerCircleCenter":		this.setInnerCircleCenter( value );		break;
			case "mainCircleCenter":		this.setMainCircleCenter( value );		break;
		}

		this.updateValuesInShader();
	}
    ///////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function()	{  return new RadialGradientMaterial();	} 

	this.init = function()
	{
		// set up the shader
		this._shader = new jshader();
		this._shader.def = radialGradientMaterialDef;
		this._shader.init();

		// set up the material node
		this._materialNode = createMaterialNode("radialGradientMaterial");
		this._materialNode.setShader(this._shader);

		// set the shader values in the shader
		this.updateValuesInShader();
	}

	this.updateValuesInShader = function()
	{
		if (!this._shader || !this._shader.default)  return;

		// calculate values
		var mainCircleRadius  = this.getMainCircleRadius();
		var innerCircleRadius = this.getInnerCircleRadius();
		var innerCircleCenter = this.getInnerCircleCenter();
		var mainCircleCenter  = this.getMainCircleCenter();
		var radiusDelta = innerCircleRadius - mainCircleRadius;
		var innerCircleCenterMinusCenter = VecUtils.vecSubtract( 2, innerCircleCenter,  mainCircleCenter );
		var	u_A = VecUtils.vecDot( 2, innerCircleCenterMinusCenter, innerCircleCenterMinusCenter) - (radiusDelta * radiusDelta)

		// set values
		this._shader.default.u_center.set( innerCircleCenter );
		this._shader.default.u_startColor.set( this.getStartColor() );
		this._shader.default.u_stopColor.set( this.getStopColor() );
		this._shader.default.u_innerCircleCenterMinusCenter.set( innerCircleCenterMinusCenter );
		this._shader.default.u_radius.set( [mainCircleRadius] );
		this._shader.default.u_A.set( [ u_A] );
		this._shader.default.u_radiusDelta.set( [radiusDelta] );
	}

	this.export = function()
	{
		// every material needs the base type and instance name
		var exportStr = "material: " + this.getShaderName() + "\n";
		exportStr += "name: " + this.getName() + "\n";

		exportStr += "innerCircleRadius: "	+ this.getInnerCircleRadius()			+ "\n";
		exportStr += "mainCircleRadius: "	+ this.getMainCircleRadius()			+ "\n";
		exportStr += "innerCircleCenter: "	+ String(this.getInnerCircleCenter())	+ "\n";
		exportStr += "mainCircleCenter: "	+ String(this.getMainCircleCenter())	+ "\n";
		
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
			var innerCircleRadius	= Number( pu.nextValue("innerCircleRadius: ") ),
				mainCircleRadius	= Number( pu.nextValue("mainCircleRadius: ") ),
				innerCircleCenter	= eval( "[" + pu.nextValue( "innerCircleCenter: " )		+ "]" );
				mainCircleCenter	= eval( "[" + pu.nextValue( "mainCircleCenter: " )		+ "]" );

			this._innerCircleRadius		= innerCircleRadius;
			this._mainCircleRadius		= mainCircleRadius;
			this._innerCircleCenter		= innerCircleCenter;
			this.mainCircleCenter		= mainCircleCenter;
			this.updateValuesInShader();

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
var radialGradientMaterialDef =
{'shaders': 
	{
		'defaultVShader':"assets/shaders/radialGradient.vert.glsl",
		'defaultFShader':"assets/shaders/radialGradient.frag.glsl",
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
					'u_startColor' : { 'type' : 'vec4' },									
					'u_stopColor' : { 'type' : 'vec4' },
					'u_center' : { 'type' : 'vec2' },
					'u_radius' : { 'type' : 'float' },
					'u_A' : { 'type' : 'float' },
					'u_radiusDelta' : { 'type' : 'float' },									
					'u_innerCircleCenterMinusCenter' : { 'type' : 'vec2' },
				},

				// render states
				'states' : 
				{
					'depthEnable' : true,
					'offset':[1.0, 0.1]
				},
			},
		]
	}
};




