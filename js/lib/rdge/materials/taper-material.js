/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var MaterialParser = require("js/lib/rdge/materials/material-parser").MaterialParser;
///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
function TaperMaterial()
{
	// initialize the inherited members
	this.inheritedFrom = GLMaterial;
	this.inheritedFrom();
   
	///////////////////////////////////////////////////////////////////////
	// Instance variables
	///////////////////////////////////////////////////////////////////////
	this._name = "TaperMaterial";
	this._shaderName = "taper";

	this._color = [1,0,0,1];

	this._deltaTime = 0.0;

	///////////////////////////////////////////////////////////////////////
	// Property Accessors
	///////////////////////////////////////////////////////////////////////
	this.getColor				= function()	{  return this._color;					}
	this.getShaderName			= function()	{  return this._shaderName;				}

	this.isAnimated				= function()	{  return true;						}
	this.hasVertexDeformation	= function()	{  return this._hasVertexDeformation;	}
	this._hasVertexDeformation	= true;
	this._vertexDeformationTolerance = 0.02;	// should be a property

	///////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function()	{  return new TaperMaterial();	} 

	this.init = function( world )
	{
		this.setWorld( world );

		// set up the shader
	    this._shader = new RDGE.jshader();
		this._shader.def = taperShaderDef;
		this._shader.init();

		// set the defaults
		this._shader.colorMe.color.set( this.getColor() );

		// set up the material node
		this._materialNode = RDGE.createMaterialNode("taperMaterial" + "_" + world.generateUniqueNodeID());
		this._materialNode.setShader(this._shader);

		// initialize the taper properties
		this.updateShaderValues();
	}


	///////////////////////////////////////////////////////////////////////
	// Material Property Accessors
	///////////////////////////////////////////////////////////////////////
	this._propNames		= ["color",		"u_limit1",					"u_limit2",					"u_limit3",					"u_minVal",				"u_maxVal",				"u_center",	"u_taperAmount" ];
	this._propLabels	= ["Color",		"Minimum Parameter Value",	"Center Paramater Value",	"Maximum Parameter Value",	"Minimum Data Bounds",	"Maximum Data Bounds",	"Center",	"Taper Amount"];
	this._propTypes		= ["color",		"float",					"float",					"float",					"float",				"float",				"float",	"float"];
	this._propValues	= [];

	// initialize the property values
	this._propValues[ this._propNames[0] ] = this._color.slice();
	this._propValues[ this._propNames[1] ] = 0.25;
	this._propValues[ this._propNames[2] ] = 0.50;
	this._propValues[ this._propNames[3] ] = 0.75;
	this._propValues[ this._propNames[4] ] =   -1;
	this._propValues[ this._propNames[5] ] =    1;
	this._propValues[ this._propNames[6] ] =  0.0;
	this._propValues[ this._propNames[7] ] =  0.9;

	this.setProperty = function( prop, value )
	{
		// make sure we have legitimate input
		if (this.validateProperty( prop, value ))
		{
			switch (prop)
			{
				case "color":		this._propValues[prop] = value.slice();		break;
				default:			this._propValues[prop] = value;				break;
			}

			this.updateShaderValues();
		}
	}
	///////////////////////////////////////////////////////////////////////
	this.exportJSON = function()
	{
		var jObj =
		{
			'material'		: this.getShaderName(),
			'name'			: this.getName(),
			'color'			: this._propValues["color"]
		};

		return jObj;
	}

	this.importJSON = function( jObj )
	{
        if (this.getShaderName() != jObj.material)  throw new Error( "ill-formed material" );
        this.setName( jObj.name );

		try
		{
			var color  = jObj.color;
			this.setProperty( "color",  color);
		}
		catch (e)
		{
			throw new Error( "could not import material: " + jObj );
		}
	}

	this.export = function()
	{
		// this function should be overridden by subclasses
		var exportStr = "material: " + this.getShaderName() + "\n";
		exportStr += "name: " + this.getName() + "\n";
		
		if (this._shader)
			exportStr += "color: " + this._shader.colorMe.color + "\n";
		else
			exportStr += "color: " + this.getColor() + "\n";
		exportStr += "endMaterial\n";

		return exportStr;
	}

	this.import = function( importStr )
	{
		var pu = new MaterialParser( importStr );
		var material = pu.nextValue( "material: " );
		if (material != this.getShaderName())  throw new Error( "ill-formed material" );
		this.setName(  pu.nextValue( "name: ") );

		var rtnStr;
		try
		{
			var color  = eval( "[" + pu.nextValue( "color: " ) + "]" );

			this.setProperty( "color",  color);

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

	this.update = function( time )
	{
		//var speed = 0.01;
		//time *= speed;
		this._deltaTime += 0.01;

		if (this._shader && this._shader.colorMe)
		{
			var t3 = this._propValues[ this._propNames[3] ] - this._deltaTime;
			if (t3 < 0)
			{
				this._deltaTime = this._propValues[ this._propNames[1] ] - 1.0;
				t3 = this._propValues[ this._propNames[3] ] - this._deltaTime;
			}
			var	t1 = this._propValues[ this._propNames[1] ] - this._deltaTime,
				t2 = this._propValues[ this._propNames[2] ] - this._deltaTime;


			this._shader.colorMe[this._propNames[1]].set( [t1] );
			this._shader.colorMe[this._propNames[2]].set( [t2] );
			this._shader.colorMe[this._propNames[3]].set( [t3] );
		}
	}

	this.updateShaderValues = function()
	{
		if (this._shader && this._shader.colorMe)
		{
			var nProps = this._propNames.length;
			for (var i=0;  i<nProps;  i++)
			{
				var propName = this._propNames[i];
				var propValue = this._propValues[propName];
				switch (propName)
				{
					case "color":	this._shader.colorMe[propName].set( propValue );		break;
					default:		this._shader.colorMe[propName].set( [propValue] );		break;
				}
			}
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader
 
// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
taperShaderDef  = 
{
	'shaders':  { // shader files
		'defaultVShader':"assets/shaders/Taper.vert.glsl",
		'defaultFShader':"assets/shaders/Taper.frag.glsl"
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
					'color' :   { 'type' : 'vec4' },

					'u_limit1': { 'type': 'float' },
					'u_limit2': { 'type': 'float' },
					'u_limit3': { 'type': 'float' },
					'u_minVal': { 'type': 'float' },
					'u_maxVal': { 'type': 'float' },
					'u_center': { 'type': 'float' },
					'u_taperAmount': { 'type': 'float' }
				 }
			}
		]
	 }
};

