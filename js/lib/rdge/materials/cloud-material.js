/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var MaterialParser = require("js/lib/rdge/materials/material-parser").MaterialParser;
var Material = require("js/lib/rdge/materials/material").Material;
///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
var CloudMaterial = function CloudMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "CloudMaterial";
	this._shaderName = "cloud";

	this._texMap = 'assets/images/cloud2.jpg';
	this._diffuseColor = [0.5, 0.5, 0.5, 0.5];

	this._time = 0.0;
	this._dTime = 0.01;

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getName		= function()	{ return this._name;			};
	this.getShaderName	= function()	{  return this._shaderName;		};

	this.getTextureMap			= function()		{  return this._propValues[this._propNames[0]] ? this._propValues[this._propNames[0]].slice() : null	};
	this.setTextureMap			= function(m)		{  this._propValues[this._propNames[0]] = m ? m.slice(0) : null;  this.updateTexture();  	};

	this.setDiffuseColor		= function(c)		{  this._propValues[this._propNames[1]] = c.slice(0);  this.updateColor();  	};
	this.getDiffuseColor		= function()		{  return this._propValues[this._propNames[1]] ? this._propValues[this._propNames[1]].slice() : null; 	};

	this.isAnimated			= function()			{  return true;					};

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this._propNames			= ["texmap",		"diffusecolor"];
	this._propLabels		= ["Texture map",	"Diffuse Color"];
	this._propTypes			= ["file",			"color"];
	this._propValues		= [];

	this._propValues[ this._propNames[0] ] = this._texMap.slice(0);
	this._propValues[ this._propNames[1] ] = this._diffuseColor.slice();

    this.setProperty = function( prop, value )
	{
		if (prop === 'color')  prop = 'diffusecolor';

		// make sure we have legitimate imput
		var ok = this.validateProperty( prop, value );
		if (!ok) {
			console.log( "invalid property in Radial Gradient Material:" + prop + " : " + value );
        }

		switch (prop)
		{
			case "texmap":
				this.setTextureMap(value);
				break;

			case "diffusecolor":
				this.setDiffuseColor( value );
				break;

			case "color":
				break;
		}
	};
    ///////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function( world )
	{
		// save the world
		if (world)  this.setWorld( world );

		// allocate a new uber material
		var newMat = new CloudMaterial();

		// copy over the current values;
		var propNames = [],  propValues = [],  propTypes = [],  propLabels = [];
		this.getAllProperties( propNames,  propValues,  propTypes,  propLabels);
		var n = propNames.length;
		for (var i=0;  i<n;  i++) {
			newMat.setProperty( propNames[i], propValues[i] );
        }

		return newMat;
	};

	this.init = function( world )
	{
		// save the world
		if (world)  this.setWorld( world );

		// this variable declared above is inherited set to a smaller delta.
		// the cloud material runs a little faster
		this._dTime = 0.01;

		// set up the shader
		this._shader = new jshader();
		this._shader.def = cloudMaterialDef;
		this._shader.init();

		// set up the material node
		this._materialNode = createMaterialNode("cloudMaterial" + "_" + world.generateUniqueNodeID());
		this._materialNode.setShader(this._shader);

		this._time = 0;
		if (this._shader && this._shader['default']) {
			this._shader['default'].u_time.set( [this._time] );
			this._shader['default'].u_DiffuseColor.set( this._diffuseColor );
        }

		// set the shader values in the shader
		this.updateTexture();
		this.update( 0 );
	};

	this.updateColor = function()
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram['default'];
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique) {
				var color = this._propValues[this._propNames[1]];
				technique.u_DiffuseColor.set( this._diffuseColor );
			}
		}
	}

	this.updateTexture = function() {
		var material = this._materialNode;
		if (material) {
			var technique = material.shaderProgram['default'];
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique) {
				var texMapName = this._propValues[this._propNames[0]];
				var wrap = 'REPEAT',  mips = true;
				var tex = this.loadTexture( texMapName, wrap, mips );

				if (tex) {
					technique.u_tex0.set( tex );
                }
			}
		}
	};

	this.update = function( time )
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram['default'];
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique) {
				if (this._shader && this._shader['default']) {
					this._shader['default'].u_time.set( [this._time] );
                }
				this._time += this._dTime;

                if (this._time > 200.0)  this._time = 0.0;
			}
		}
	};

	// JSON export
	this.exportJSON = function()
	{
		var jObj =
		{
			'material'		: this.getShaderName(),
			'name'			: this.getName(),
			'texture'		: this._propValues[this._propNames[0]]
		};

		return jObj;
	};

	this.importJSON = function( jObj )
	{
        if (this.getShaderName() != jObj.material)  throw new Error( "ill-formed material" );
        this.setName(  jObj.name );

        try {
			this._propValues[this._propNames[0]] = jObj.texture;
        }
        catch (e)
        {
            throw new Error( "could not import material: " + jObj );
        }
	}


	this.export = function() {
		// every material needs the base type and instance name
		var exportStr = "material: " + this.getShaderName() + "\n";
		exportStr += "name: " + this.getName() + "\n";

		var world = this.getWorld();
		if (!world)
			throw new Error( "no world in material.export, " + this.getName() );

		var texMapName =  this._propValues[this._propNames[0]];
		exportStr += "texture: " +texMapName + "\n";
		
		// every material needs to terminate like this
		exportStr += "endMaterial\n";

		return exportStr;
	};

	this.import = function( importStr ) {
		var pu = new MaterialParser( importStr );
		var material = pu.nextValue( "material: " );
		if (material != this.getShaderName())  throw new Error( "ill-formed material" );
		this.setName(  pu.nextValue( "name: ") );

		var rtnStr;
        try {
			this._propValues[this._propNames[0]] = pu.nextValue( "texture: " );

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
};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader
 
// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
var cloudMaterialDef =
{'shaders': 
	{
		'defaultVShader':"assets/shaders/Cloud.vert.glsl",
		'defaultFShader':"assets/shaders/Cloud.frag.glsl"
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
					'u_tex0': { 'type' : 'tex2d' },
					'u_time' : { 'type' : 'float' },
					'u_DiffuseColor' : { 'type' : 'vec4' }
				},

				// render states
				'states' : 
				{
					'depthEnable' : true,
					'offset':[1.0, 0.1]
				}
			}
		]
	}
};




CloudMaterial.prototype = new Material();

if (typeof exports === "object") {
    exports.CloudMaterial = CloudMaterial;
}

