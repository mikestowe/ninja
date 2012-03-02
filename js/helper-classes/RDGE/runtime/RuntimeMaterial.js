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


