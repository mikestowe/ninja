/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

///////////////////////////////////////////////////////////////////////
// Class RuntimeMaterial
//      Runtime representation of a material.
///////////////////////////////////////////////////////////////////////
function RuntimeMaterial( world )
{
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "GLMaterial";
	this._shaderName = "undefined";

	// variables for animation speed
	this._time = 0.0;
	this._dTime = 0.01;

	// RDGE variables
	this._shader;
	this._materialNode;

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////

	// a material can be animated or not. default is not.  
	// Any material needing continuous rendering should override this method
	this.isAnimated			= function()	{  return false;	}

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	this.init = function()
	{
	}

	this.update = function( time )
	{
	}
}


function RuntimeFlatMaterial()
{
	// inherit the members of RuntimeMaterial
	this.inheritedFrom = RuntimeMaterial;
	this.inheritedFrom();

	this._name = "FlatMaterial";
	this._shaderName = "flat";

	// assign a default color
	this._color = [1,0,0,1];

    this.import = function( importStr )
    {
		var colorStr = getPropertyFromString( "color: ",	importStr );
		if (colorStr)
			this._color  = eval( "[" + colorStr + "]" );
    };


	this.init = function()
	{
		if (this._shader)
		{
			 this._shader.colorMe["color"].set( this._color );
		}
	}
}

function RuntimePulseMaterial()
{
	// inherit the members of RuntimeMaterial
	this.inheritedFrom = RuntimeMaterial;
	this.inheritedFrom();

	this._name = "PulseMaterial";
	this._shaderName = "pulse";

	this._texMap = 'assets/images/cubelight.png';

	this.isAnimated			= function()	{  return true;	}


	this.import = function( importStr )
	{
		this._texMap = getPropertyFromString( "texture: ",	importStr );
	}

	this.init = function()
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram.default;
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique)
			{
				if (this._shader && this._shader.default)
				{
					var res = [ renderer.vpWidth,  renderer.vpHeight ];
					technique.u_resolution.set( res );

					var wrap = 'REPEAT',  mips = true;
					var tex = renderer.getTextureByName(this._texMap, wrap, mips );
					if (tex)
						technique.u_tex0.set( tex );

					this._shader.default.u_time.set( [this._time] );
				}
			}
		}
	}

	// several materials inherit from pulse.
	// they may share this update method
	this.update = function( time )
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram.default;
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique)
			{
				if (this._shader && this._shader.default)
					this._shader.default.u_time.set( [this._time] );
				this._time += this._dTime;
				if (this._time > 200.0)  this._time = 0.0;
			}
		}
	}
}

function RuntimeRadialGradientMaterial()
{
	// inherit the members of RuntimeMaterial
	this.inheritedFrom = RuntimeMaterial;
	this.inheritedFrom();

	this._name = "RadialGradientMaterial";
	this._shaderName = "radialGradient";

	// setup default values
	this._color1 = [1,0,0,1];  this._colorStop1 = 0.0;
	this._color2 = [0,1,0,1];  this._colorStop2 = 0.3;
	this._color3 = [0,1,0,1];  this._colorStop3 = 0.6;
	this._color4 = [0,1,0,1];  this._colorStop4 = 1.0;

	this.init = function()
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram.default;
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique)
			{
				if (this._shader && this._shader.default)
				{
					this._shader.default.u_color1.set( this._color1 );
					this._shader.default.u_color2.set( this._color2 );
					this._shader.default.u_color3.set( this._color3 );
					this._shader.default.u_color4.set( this._color4 );

					this._shader.default.u_colorStop1.set( [this._colorStop1] );
					this._shader.default.u_colorStop2.set( [this._colorStop2] );
					this._shader.default.u_colorStop3.set( [this._colorStop3] );
					this._shader.default.u_colorStop4.set( [this._colorStop4] );

					if (this._angle !== undefined)
						this._shader.default.u_cos_sin_angle.set([Math.cos(this._angle), Math.sin(this._angle)]);
				}
			}
		}
	}

	this.import = function( importStr )
	{
		var colorStr;
		colorStr = getPropertyFromString( "color1: ",	importStr );
		this._color1  = eval( "[" + colorStr + "]" );
		colorStr = getPropertyFromString( "color2: ",	importStr );
		this._color2  = eval( "[" + colorStr + "]" );
		colorStr = getPropertyFromString( "color3: ",	importStr );
		this._color3  = eval( "[" + colorStr + "]" );
		colorStr = getPropertyFromString( "color4: ",	importStr );
		this._color4  = eval( "[" + colorStr + "]" );

		this._colorStop1 = Number( getPropertyFromString( "colorStop1: ",	importStr ) );
		this._colorStop2 = Number( getPropertyFromString( "colorStop2: ",	importStr ) );
		this._colorStop3 = Number( getPropertyFromString( "colorStop3: ",	importStr ) );
		this._colorStop4 = Number( getPropertyFromString( "colorStop4: ",	importStr ) );

		if (this._angle !== undefined)
			this._angle = getPropertyFromString( "angle: ",	importStr );
	}

}

function RuntimeLinearGradientMaterial()
{
	// inherit the members of RuntimeMaterial
	this.inheritedFrom = RuntimeRadialGradientMaterial;
	this.inheritedFrom();

	this._name = "LinearGradientMaterial";
	this._shaderName = "linearGradient";

	// the only difference between linear & radial gradient is the existance of an angle for linear.
	this._angle = 0.0;
}

function RuntimeBumpMetalMaterial()
{
	// inherit the members of RuntimeMaterial
	this.inheritedFrom = RuntimeMaterial;
	this.inheritedFrom();

	this._name = "BumpMetalMaterial";
	this._shaderName = "bumpMetal";

	this._lightDiff = [0.3, 0.3, 0.3, 1.0];
	this._diffuseTexture = "assets/images/metal.png";
	this._specularTexture = "assets/images/silver.png";
	this._normalTexture = "assets/images/normalMap.png";

	this.import = function( importStr )
	{
		this._lightDiff  = eval( "[" + getPropertyFromString( "lightDiff: ",	importStr ) + "]" );
		this._diffuseTexture = getPropertyFromString( "diffuseTexture: ",	importStr );
		this._specularTexture = getPropertyFromString( "specularTexture: ",	importStr );
		this._normalTexture = getPropertyFromString( "normalMap: ",	importStr );
	}

	this.init = function()
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram.default;
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique)
			{
				if (this._shader && this._shader.default)
				{
					technique.u_light0Diff.set( this._lightDiff );

					var tex;
					var wrap = 'REPEAT',  mips = true;
					if (this._diffuseTexture)
					{
						tex = renderer.getTextureByName(this._diffuseTexture, wrap, mips );
						if (tex)  technique.u_colMap.set( tex );

					}
					if (this._normalTexture)
					{
						tex = renderer.getTextureByName(this._normalTexture, wrap, mips );
						if (tex)  technique.u_normalMap.set( tex );
					}
					if (this._specularTexture)
					{
						tex = renderer.getTextureByName(this._specularTexture, wrap, mips );
						technique.u_glowMap.set( tex );
					}
				}
			}
		}
	}
}

function RuntimeUberMaterial()
{
}


