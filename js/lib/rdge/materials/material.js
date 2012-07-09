/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Texture = require("js/lib/rdge/texture").Texture;


///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      GL representation of a material.
///////////////////////////////////////////////////////////////////////
var Material = function GLMaterial( world ) {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "GLMaterial";
	this._shaderName = "undefined";

	this._time = 0.0;
	this._dTime = 0.01;

	// keep a reference to the owning GLWorld
	this._world = null;
    if(world) {
        this._world = world;
    }

	this._glTextures = [];		// indexed by uniform name

	// vertex deformation variables
	this._hasVertexDeformation = false;
	this._vertexDeformationRange = [0, 0, 1, 1];	// (xMin, yMin, xMax, yMax)
	this._vertexDeformationTolerance = 0.1;

	// RDGE variables
	this._shader = null;
	this._materialNode = null;

	// vertex deformation variables
	this._hasVertexDeformation = false;
	this._vertexDeformationRange = [0, 0, 1, 1];	// (xMin, yMin, xMax, yMax)
	this._vertexDeformationTolerance = 0.02;

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////

	this.setName = function(n) {
        this._name = n;
    };

	this.getName = function() {
        return this._name;
    };

	this.setShaderName = function(n) {
        this._shaderName = n;
    };

	this.getShaderName = function() {
        return this._shaderName;
    };

	this.setWorld = function(world) {
        this._world = world;
    };

	this.getWorld = function() {
        return this._world;
    };

	this.getShader = function() {
        return this._shader;
    };

	this.getMaterialNode = function() {
        return this._materialNode;
    };

	// a material can be animated or not. default is not.  
	// Any material needing continuous rendering should override this method
	this.isAnimated	= function() {
        return false;
    };

	this.getTechniqueName	= function() {
		return 'default'
	};

	// the vertex shader can apply deformations requiring refinement in
	// certain areas.
	this.hasVertexDeformation = function()	{
        return this._hasVertexDeformation;
    };

	this.getVertexDeformationRange = function()	{
        return this._vertexDeformationRange.slice();
    };

	this.getVertexDeformationTolerance = function()	{
        return this._vertexDeformationTolerance;
    };

    ///////////////////////////////////////////////////////////////////////
    // Common Material Methods
    ///////////////////////////////////////////////////////////////////////
	this.getProperty = function( propName ) {
		return this._propValues[propName];
	};

	this.getPropertyCount = function() {
		return this._propNames.length;
	};

	this.getPropertyAtIndex = function( index ) {
		var rtnArr = [];
		if ((index < 0) || (index >= this.getPropertyCount())) {
			throw new Error( "property index " + index + " is out of range for material" );
        }

		return [ this._propNames[index],  this._propLabels[index],  this._propTypes[index],  this._propValues[index] ];
	};

	this.getAllProperties = function( propNames,  propValues,  propTypes,  propLabels) {
		// clear all the input arrays if there is junk in them
		propNames.length	= 0;
		propValues.length	= 0;
		propTypes.length	= 0;
		propLabels.length	= 0;

		var nProps = this._propNames.length;
		for (var i=0;  i<nProps;  i++) {
			propNames[i]	= this._propNames[i];
			propValues[i]	= this._propValues[this._propNames[i]];
			propTypes[i]	= this._propTypes[i];
			propLabels[i]	= this._propLabels[i];
		}
	};

	this.hasProperty = function( prop )
	{
		var propNames = [],  dummy = [];
		this.getAllProperties( propNames, dummy, dummy, dummy )
		for (var i=0;  i<propNames.length;  i++)
		{
			if (prop === propNames[i])  return true;
		}
	};

	this.getPropertyType = function( prop )
	{
		var n = this.getPropertyCount();
		for (var i=0;  i<n;  i++)
		{
			if (prop === this._propNames[i])  return this._propTypes[i];
		}
	};

    this.dup = function ()
	{
        // get the current values;
        var propNames = [], propValues = [], propTypes = [], propLabels = [];
        this.getAllProperties(propNames, propValues, propTypes, propLabels);
        
        // allocate a new material
		var MaterialLibrary = require("js/models/materials-model").MaterialsModel;
        var newMat = MaterialLibrary.createMaterialByShaderName( this.getShaderName() );

		// copy over the current values;
        var n = propNames.length;
        for (var i = 0; i < n; i++)
            newMat.setProperty(propNames[i], propValues[i]);

        return newMat;
    };

	this.validateProperty = function( prop, value ) {
		var rtnVal = false;
		try
		{
			//if (!this._propValues[prop])  return false;

			// find the index of the property
			var n = this._propNames.length;
			var valType =  typeof value;
			for (var i=0;  i<n;  i++) {
				if (this._propNames[i] == prop) {

					switch (this._propTypes[i])
					{
						case "color":
							rtnVal = ((valType == "object") && (value.length >= 4));
							break;

						case "vector2d":
							rtnVal = ((valType == "object") && (value.length >= 2));
							break;
							
						case "vector3d":
							rtnVal = ((valType == "object") && (value.length >= 3));
							break;

						case "angle":
						case "float":
							rtnVal = (valType == "number");
							break;

						case "file":
							rtnVal = ((valType == "string") || !value);
							break;
					}

					break;
				}
			}
		}
		catch(e)  {
			console.log( "setting invalid material property: " + prop + ", value: " + value );
		}
		
//		if (!rtnVal && (prop != 'color')) {
//			console.log( "invalid material property: " + prop + " : " + value );
//        }

		return rtnVal;
	};

	this.setProperty = function( prop,  value )
	{
		var ok = this.validateProperty( prop, value );
		if (!ok && (prop != 'color')) {
			//console.log( "invalid property in Material:" + prop + " : " + value );
			return;
		}

		// get the technique if the shader is instantiated
		var technique;
		var material = this._materialNode;
		if (material)  technique = material.shaderProgram[this.getTechniqueName()];

		switch (this.getPropertyType(prop))
		{
			case "angle":
			case "float":
				this._propValues[prop] = value;
				if (technique)  technique[prop].set( [value] );
				break;

			case "file":
				this._propValues[prop] = value.slice();
				if (technique)
				{
					var glTex = new Texture( this.getWorld(),  value );
					this._glTextures[prop] = glTex;
					glTex.render();
					var tex = glTex.getTexture();
					if (tex)  technique[prop].set( tex );
				}
				break;

			case "color":
			case "vector2d":
			case "vector3d":
				this._propValues[prop] = value.slice();
				if (technique)  technique[prop].set( value );
				break;
		}
	};

	this.setShaderValues = function()
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram[this.getTechniqueName()];
			if (technique)
			{
				var n = this.getPropertyCount();
				for (var i=0;  i<n;  i++)
				{
					var prop = this._propNames[i],
						value = this._propValues[prop];

					switch (this._propTypes[i])
					{
						case "angle":
						case "float":
							technique[prop].set( [value] );
							break;

						case "file":
							var glTex = this._glTextures[prop];
							if (glTex)
							{
								var tex = glTex.getTexture();
								if (tex)  technique[prop].set( tex );
							}
							else
								this.setProperty( prop, value );
							break;

						case "color":
						case "vector2d":
						case "vector3d":
							technique[prop].set( value );
							break;
					}
				}
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
			'dTime'         : this._dTime
		};

		var n = this.getPropertyCount();
		for (var i=0;  i<n;  i++)
		{
			var	prop  = this._propNames[i],
				value = this._propValues[prop];

			jObj[prop] = value;
		}

		if (this.customExport)
			jObj = this.customExport( jObj );

		return jObj;
	};
	
    this.importJSON = function (jObj) {
        if (this.getShaderName() != jObj.material) throw new Error("ill-formed material");
        this.setName(jObj.name);

        try
		{
			for (var prop in jObj)
			{
				if ((prop != 'material') && (prop != 'name'))
				{
					var value = jObj[prop];
					this.setProperty( prop, value );
				}
			}
        }
        catch (e) {
            throw new Error("could not import material: " + jObj);
        }
    };

    ///////////////////////////////////////////////////////////////////////
    
    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	this.init = function( world ) {
		throw new Error( "Material.init() must be overridden by subclass" );
	};

	this.update = function( time ) {
		// animated materials should implement the update method
	};

	this.fitToPrimitive = function( prim )  {
		// some materials need to preserve an aspect ratio - or someting else.
	};

	this.registerTexture = function( texture ) {
		// the world needs to know about the texture map
		var world = this.getWorld();
		if (!world) {
			console.log( "**** world not defined for registering texture map: " + texture.lookUpName );
        } else {
			world.textureToLoad( texture );
        }
	};

	this.loadTexture = function( texMapName, wrap, mips ) {
		var tex;
		var world = this.getWorld();
		if (!world) {
			console.log( "world not defined for material with texture map" );
        } else {
			var renderer = world.getRenderer();
			tex = renderer.getTextureByName(texMapName, wrap, mips );
			this.registerTexture( tex );
		}

		return tex;
	};

};

if (typeof exports === "object") {
    exports.Material = Material;
}
