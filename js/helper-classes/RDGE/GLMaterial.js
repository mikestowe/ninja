/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      GL representation of a material.
///////////////////////////////////////////////////////////////////////
function GLMaterial( world )
{
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "GLMaterial";
	this._shaderName = "undefined";

	// keep a reference to the owning GLWorld
	this._world = null;
    if(world)
    {
        this._world = world;
    }

	this._shininess = 60;
		
	this._ambient  = [0.0, 0.0, 0.0,  1.0];
	this._diffuse  = [0.0, 0.0, 0.0,  1.0];
	this._specular = [0.0, 0.0, 0.0,  1.0];

	this._texture;

	// vertex deformation variables
	this._hasVertexDeformation = false;
	this._vertexDeformationRange = [0, 0, 1, 1];	// (xMin, yMin, xMax, yMax)
	this._vertexDeformationTolerance = 0.1;

	// RDGE variables
	this._shader;
	this._materialNode;

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getShininess		= function()			{  return this._shininess;			}
	this.setShininess		= function(s)			{  this._shininess = s;				}

	this.setName			= function(n)			{  this._name = n;					}
	this.getName			= function()			{  return this._name;				}

	this.setShaderName		= function(n)			{  this._shaderName = n;			}
	this.getShaderName		= function()			{  return this._shaderName;			}

	this.setWorld			= function(world)		{  this._world = world;				}
	this.getWorld			= function()			{  return this._world;				}

	this.setAmbient			= function(r, g, b, a)	{  this._ambient = [r, g, b, a];	}
	this.getAmbient			= function()			{  return [this._ambient[0], this._ambient[1], this._ambient[2], this._ambient[3]];	}

	this.setDiffuse			= function(r, g, b, a)	{  this._diffuse = [r, g, b, a];	}
	this.getDiffuse			= function()			{  return [this._diffuse[0], this._diffuse[1], this._diffuse[2], this._diffuse[3]];	}

	this.setSpecular		= function(r, g, b, a)	{  this._specular = [r, g, b, a];	}
	this.getSpecular		= function()			{  return [this._specular[0], this._specular[1], this._specular[2], this._specular[3]];	}

	this.getShader			= function()			{  return this._shader;				}
	this.getMaterialNode	= function()			{  return this._materialNode;		}

	// a material can be animated or not. default is not.  
	// Any material needing continuous rendering should override this method
	this.isAnimated			= function()			{  return false;					}

	// the vertex shader can apply deformations requiring refinement in
	// certain areas.
	this.hasVertexDeformation			= function()	{  return this._hasVertexDeformation;			}
	this.getVertexDeformationRange		= function()	{  return this._vertexDeformationRange.slice();	}	
	this.getVertexDeformationTolerance	= function()	{  return this._vertexDeformationTolerance;		}


    ///////////////////////////////////////////////////////////////////////
    // Common Material Methods
    ///////////////////////////////////////////////////////////////////////
	this.getProperty = function( propName )
	{
		return this._propValues[propName];
	}

	this.getPropertyCount = function()
	{
		return this._propNames.length;
	}

	this.getPropertyAtIndex = function( index )
	{
		var rtnArr = [];
		if ((index < 0) || (index >= this.getPropertyCount()))
			throw new Error( "property index " + index + " is out of range for material" );

		var rtnArr = [ this._propNames[index],  this._propLabels[index],  this._propTypes[index],  this._propValues[index] ];
		return rtnArr;
	}

	this.getAllProperties = function( propNames,  propValues,  propTypes,  propLabels)
	{
		// clear all the input arrays if there is junk in them
		propNames.length	= 0;
		propValues.length	= 0;
		propTypes.length	= 0;
		propLabels.length	= 0;

		var nProps = this._propNames.length;
		for (var i=0;  i<nProps;  i++)
		{
			propNames[i]	= this._propNames[i];
			propValues[i]	= this._propValues[this._propNames[i]];
			propTypes[i]	= this._propTypes[i];
			propLabels[i]	= this._propLabels[i];
		}
	}

	this.validateProperty = function( prop, value )
	{
		var rtnVal = false;
		try
		{
			//if (!this._propValues[prop])  return false;

			// find the index of the property
			var n = this._propNames.length;
			var valType =  typeof value;
			for (var i=0;  i<n;  i++)
			{
				if (this._propNames[i] == prop)
				{
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
		
		if (!rtnVal)
			console.log( "invalid material property: " + prop + " : " + value ); 

		return rtnVal;
	}
    ///////////////////////////////////////////////////////////////////////
    
    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	// duplcate method required by sub class
	this.dup = function()
	{
		throw new Error( "Material.dup() must be overridden by subclass" );
	} 

	this.init = function( world )
	{
		throw new Error( "Material.init() must be overridden by subclass" );
	} 

	this.update = function( time )
	{
		// animated materials should implement the update method
	}

	this.registerTexture = function( texture )
	{
		// the world needs to know about the texture map
		var world = this.getWorld();
		if (!world)
			console.log( "**** world not defined for registering texture map: " + texture.lookUpName );
		else
			world.textureToLoad( texture );
	}

	this.loadTexture = function( texMapName, wrap, mips )
	{
		var tex;
		var world = this.getWorld();
		if (!world)
			console.log( "world not defined for material with texture map" );
		else
		{
			var renderer = world.getRenderer();
			tex = renderer.getTextureByName(texMapName, wrap, mips );
			this.registerTexture( tex );
		}
		return tex;
	}

	this.export = function()
	{
		// this function should be overridden by subclasses
		var exportStr = "material: " + this.getShaderName() + "\n" + "endMaterial\n";
		return exportStr;
	}

	this.import = function( importStr )
	{
		var endKey = "endMaterial\n";
		var index = importStr.indexOf( endKey );
		index += endKey.length;
		rtnStr = importStr.substr( index );

		return rtnStr;
	}

	/*
	this.setRenderProperties = function( glContext, shaderProgram )
	{
		glContext.uniform1f( shaderProgram.materialShininessUniform, this._shininess );

		if (this._texture)
			this.prepareTextureForRender( 0 );
		else
			glContext.uniform1i( shaderProgram.useTextureUniform,	false  );

		var amb = this._ambient,  diff = this._diffuse,  spec = this._specular;
		glContext.uniform4f( shaderProgram.materialAmbientUniform,		 amb[0],  amb[1],  amb[2],  amb[3]);
		glContext.uniform4f( shaderProgram.materialDiffuseUniform,		diff[0], diff[1], diff[2], diff[3]);
		glContext.uniform4f( shaderProgram.materialSpecularUniform,		spec[0], spec[1], spec[2], spec[3]);
	}
 
 
 
    this.prepareTextureForRender = function ( index )
	{
		// we will need to be able to handle multiple textures.
		// currently only dealing with 1.
		index = 0;
		var texture = this._texture;

		var gl = this.getWorld().getGLContext();
		var shaderProgram = this.getWorld().getShaderProgram();

		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(shaderProgram.samplerUniform, 0);
		gl.uniform1i( shaderProgram.useTextureUniform,	true  );
    }
 
    this.textureLoadHandler = function (event)
	{
		var texture = this._texture;

		var gl = this._world.getGLContext();
		var shaderProgram = this._world.getShaderProgram();

		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

//		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
//		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindTexture(gl.TEXTURE_2D, null);

		this._material._texture = this._texture;
		this._world.render();
	}
 
 
    this.loadTexture = function( path )
	{
        var gl = this.getWorld().getGLContext();
		var tex = gl.createTexture();
        tex.image = new Image();
		tex.image._world = this._world;
		tex.image._material = this;
		tex.image._texture = tex;
        tex.image.onload = this.textureLoadHandler;
        tex.image.src = path;
    }
	*/
}


