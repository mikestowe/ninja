/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var MaterialParser = require("js/lib/rdge/materials/material-parser").MaterialParser;
var Material = require("js/lib/rdge/materials/material").Material;

var RadialBlurMaterial = function RadialBlurMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "RadialBlurMaterial";
	this._shaderName = "radialBlur";

	this._texMap = 'assets/images/cubelight.png';
	this._color = [1,0,0,1];

	this._time = 0.0;
	this._dTime = 0.01;

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getName		= function()	{ return this._name;			};
	this.getShaderName	= function()	{  return this._shaderName;		};

	this.getTextureMap			= function()		{  return this._texMap.slice(0);	};
	this.setTextureMap			= function(m)		{  this._propValues[this._propNames[0]] = m.slice(0);  this.updateTexture();  	};

	this.isAnimated				= function()		{  return true;		};

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this._propNames			= ["texmap",			"color"];
	this._propLabels		= ["Texture map",		"Color"];
	this._propTypes			= ["file",				"color"];
	this._propValues		= [];

	this._propValues[ this._propNames[0] ] = this._texMap.slice(0);
	this._propValues[ this._propNames[1] ] = this._color.slice(0);

    this.setProperty = function( prop, value ) {
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

			case "color":
				this._propValues[prop] = value.slice(0);
				if (this._shader && this._shader['default']) {
					this._shader['default'][prop].set(value);
                }
				break;
		}
	};
    ///////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function( ) {
		// allocate a new uber material
		var newMat = new RadialBlurMaterial();

		// copy over the current values;
		var propNames = [],  propValues = [],  propTypes = [],  propLabels = [];
		this.getAllProperties( propNames,  propValues,  propTypes,  propLabels);
		var n = propNames.length;
		for (var i=0;  i<n;  i++)
			newMat.setProperty( propNames[i], propValues[i] );

		return newMat;
	};

	this.init = function( world ) {
		// save the world
		if (world)  this.setWorld( world );

		// set up the shader
		this._shader = new jshader();
		this._shader.def = radialBlurMaterialDef;
		this._shader.init();

		// set up the material node
		this._materialNode = createMaterialNode("radialBlurMaterial" + "_" + world.generateUniqueNodeID());
		this._materialNode.setShader(this._shader);

		this._time = 0;
		if (this._shader && this._shader['default'])
			this._shader['default'].u_time.set( [this._time] );
		this.setProperty( "color", [this._time, 0, 0,  1] );

		// set the shader values in the shader
		this.updateTexture();
		this.setResolution( [world.getViewportWidth(),world.getViewportHeight()] );
		this.update( 0 );
	};

	this.updateTexture = function() {
		var material = this._materialNode;
		if (material) {
			var technique = material.shaderProgram['default'];
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique) {
				var texMapName = this._propValues[this._propNames[0]];
				var tex = renderer.getTextureByName(texMapName, 'REPEAT');
//				if (tex)
//				{
//					var res = [tex.image.naturalWidth, tex.image.naturalHeight];
//					this.setResoloution( res );
//				}
				technique.u_tex0.set( tex );
			}
		}
	};

	this.update = function( ) {
		var material = this._materialNode;
		if (material) {
			var technique = material.shaderProgram['default'];
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique) {
				if (this._shader && this._shader['default']) {
					this._shader['default'].u_time.set( [this._time] );
                }

				var color = this.getProperty( "color" );
				color[0] = this._time;
				this.setProperty( "color", color );
				//console.log( "update color to: " + color );
				this._time += this._dTime;
			}
		}
	};

	this.setResolution = function( res ) {
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram['default'];
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique) {
				technique.u_resolution.set( res );
			}
		}
	};

	this.exportJSON = function()
	{
		var world = this.getWorld();
		if (!world)
			throw new Error( "no world in material.export, " + this.getName() );

		var jObj =
		{
			'material'		: this.getShaderName(),
			'name'			: this.getName(),
			'color'			: this._propValues["color"],
			'texture'		: this._propValues[this._propNames[0]]
		};

		return jObj;
	};

	this.importJSON = function( importStr )
	{
        if (this.getShaderName() != jObj.material)  throw new Error( "ill-formed material" );
        this.setName( jObj.name );

		var rtnStr;
        try
        {
            this._propValues[this._propNames[0]] = jObj.texture;
			this.updateTexture();
        }
        catch (e)
        {
            throw new Error( "could not import material: " + importStr );
        }
		
		return rtnStr;
	}

	this.export = function() {
		// every material needs the base type and instance name
		var exportStr = "material: " + this.getShaderName() + "\n";
		exportStr += "name: " + this.getName() + "\n";

		var world = this.getWorld();
		if (!world)
			throw new Error( "no world in material.export, " + this.getName() );

		var texMapName =  this._propValues[this._propNames[0]];
		exportStr += "texture: " + texMapName + "\n";
		
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
        try
        {
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
var radialBlurMaterialDef =
{'shaders': 
	{
		'defaultVShader':"assets/shaders/Basic.vert.glsl",
		'defaultFShader':"assets/shaders/radialBlur.frag.glsl"
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
					'u_resolution'  :   { 'type' : 'vec2' },
					'color' :   { 'type' : 'vec4' }
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

RadialBlurMaterial.prototype = new Material();

if (typeof exports === "object") {
    exports.RadialBlurMaterial = RadialBlurMaterial;
}


