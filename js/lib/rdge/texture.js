/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Material = require("js/lib/rdge/materials/material").Material;

///////////////////////////////////////////////////////////////////////
// Class GLTexture
//      GL representation of a texture.
///////////////////////////////////////////////////////////////////////
function Texture( dstWorld )
{
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._texture;

	// texture attributes
	this._texMapName;
	this._wrap;
	this._mips;

	this._srcCanvas;	// the canvas generating the texture map.
	this._dstWorld;		// the world that will use the texture map
	this._dstWorld = dstWorld;

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getTexture		= function()	{  return this._texture;	}

	this.setSrcWorld	= function(w)	{  this._srcWorld = w;		}
	this.getSrcWorld	= function()	{  return this._srcWorld;	}

	this.setDstWorld	= function(w)	{  this._dstWorld = w;		}
	this.getDstWorld	= function()	{  return this._dstWorld;	}

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////

	this.loadFromFile = function( texMapName,  wrap,  mips )
	{
		var tex = this._texture;
		this._srcCanvas = null;

		// only load if something has changed
		if (this._texMapName !== texMapName)	// does RDGE allow us to change wrap or mips?
		{
			this._texMapName = texMapName.slice();
			this._wrap = wrap;
			this._mips = mips;

			var dstWorld = this.getDstWorld();
			if (dstWorld)
			{
				var renderer = dstWorld.getRenderer();
				tex = renderer.getTextureByName(texMapName, wrap, mips );
				this._texture = tex;
				dstWorld.textureToLoad( tex );
			}
		}

		return tex;
	}

	this.loadFromCanvas = function( srcCanvas,  wrap, mips )
	{
		this._texMapName = "GLTexture_" + this.texCounter;
		this.texCounter++;

		//if (elt.elementModel && elt.elementModel.shapeModel && elt.elementModel.shapeModel.GLWorld)
		var world = this.getDstWorld();
		var renderer = world.getRenderer();

		var imageData;
		var width = srcCanvas.width,  height = srcCanvas.height;
		width = 128;  height = 64;	// some even power of 2 for now...

		// create a canvas to be used as the image for the texture map
		var doc = srcCanvas.ownerDocument;
		var dstCanvas = doc.createElement("canvas");
		dstCanvas.width = width;
		dstCanvas.height = height;
		var dstCtx = dstCanvas.getContext("2d");

		var tex;
		var srcCtx = srcCanvas.getContext("2d");
		if (srcCtx)
		{
			tex = renderer.getTextureByName(this._texMapName, wrap, mips );
			imageData = srcCtx.getImageData( 0, 0, width, height );
		    dstCtx.putImageData( imageData, 0, 0 );
		}
		else
		{
			tex = renderer.getTextureByName(this._texMapName, wrap, mips );
			//tex = world.getGLContext().createTexture();
			tex.image = new Image;
			tex.wrap = wrap;
			tex.mips = mips;

			srcCtx = srcCanvas.getContext("experimental-webgl");
			if (srcCtx)
			{
//				var data = new Uint8Array(width * height * 4);
//				srcCtx.readPixels(0, 0, width, height, srcCtx.RGBA, srcCtx.UNSIGNED_BYTE, data);
//				console.log( "pixel 0: " + data[width+0] + ", " + data[width+1] + ", " + data[width+2] + ", " + data[width+3] );
//						
//				//imageData.data = data;
//				imageData = dstCtx.createImageData(width, height);
//				var nBytes = width*height*4;
//				for (var i=0;  i<nBytes;  i++)
//					imageData.data[i] = data[i];
//		        dstCtx.putImageData( imageData, 0, 0 );

                dstCtx.drawImage(srcCanvas, 0, 0);
			}
		}


		/////////////////
		tex.image = dstCanvas;

		this._texture = tex;
		return tex;
	}

	this.findPreviousWorld = function()
	{
		var prevWorld;
		for ( var w in _worldStack )
		{
			world = _worldStack[w];
			if (world == this.getWorld())  return prevWorld;
			prevWorld = world;
		}
	}

	var texCounter = 0;
}

if (typeof exports === "object") {
    exports.Texture = Texture;
}


