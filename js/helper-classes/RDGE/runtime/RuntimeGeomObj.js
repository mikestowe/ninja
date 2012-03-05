
/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

///////////////////////////////////////////////////////////////////////
// Class RuntimeGeomObj
//      Super class for all geometry classes
///////////////////////////////////////////////////////////////////////
function RuntimeGeomObj()
{
    ///////////////////////////////////////////////////////////////////////
    // Constants
    ///////////////////////////////////////////////////////////////////////
	this.GEOM_TYPE_RECTANGLE		=  1;
	this.GEOM_TYPE_CIRCLE			=  2;
	this.GEOM_TYPE_LINE             =  3;
	this.GEOM_TYPE_PATH			    =  4;
	this.GEOM_TYPE_CUBIC_BEZIER     =  5;
	this.GEOM_TYPE_UNDEFINED		= -1;
	
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._children;

    // stroke and fill colors
    this._strokeColor	= [0,0,0,0];
    this._fillColor		= [0,0,0,0];

	// array of materials
	this._materials = [];

    ///////////////////////////////////////////////////////////////////////
    // Property accessors
    ///////////////////////////////////////////////////////////////////////

	this.geomType	= function()		{  return this.GEOM_TYPE_UNDEFINED;	}

	this.setWorld	= function(w)		{  this._world = w;					}
	this.getWorld	= function()		{  return this._world;				}

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    this.makeStrokeMaterial = function()
    {
    }

    this.makeFillMaterial = function()
    {
    }


    this.render = function()
    {
    }
    
	this.addChild = function( child )
	{
		if (!this._children)  this._children = [];
		this._children.push( child );
	}

    this.import = function()
    {
	}

	this.importMaterials = function(importStr)
	{
		var nMaterials = Number( getPropertyFromString( "nMaterials: ", importStr )  );
		for (var i=0;  i<nMaterials;  i++)
		{
			var matNodeName = getPropertyFromString( "materialNodeName: ",	importStr );

			var mat;
			var materialType = getPropertyFromString( "material: ",	importStr );
			switch (materialType)
			{
				case "flat":			mat = new RuntimeFlatMaterial();				break;

				case "radialGradient":
				case "linearGradient":  mat = new RuntimeLinearGradientMaterial();		break;

				case "water":
				case "tunnel":
				case "reliefTunnel":
				case "squareTunnel":
				case "twist":
				case "fly":
				case "julia":
				case "mandel":
				case "star":
				case "zinvert":
				case "pulse":			mat = new RuntimePulseMaterial();				break;

				default:
					console.log( "material type: " + materialType + " is not supported" );
					break;
			}

			if (mat)
			{
				mat.import( importStr );
				mat._materialNodeName = matNodeName;
				this._materials.push( mat );
			}

			var endIndex = importStr.indexOf( "endMaterial\n" );
			if (endIndex < 0)  break;
			importStr = importStr.substr( endIndex );
		}
	}
}

function getPropertyFromString( prop, str )
{
	var index = str.indexOf( prop );
	if (index < 0)  throw new Error( "property " + prop + " not found in string: " + str);

	var rtnStr = str.substr( index+prop.length );
	index = rtnStr.indexOf( "\n" );
	if (index >= 0)
		rtnStr = rtnStr.substr(0, index);

	return rtnStr;
}

///////////////////////////////////////////////////////////////////////
// Class RuntimeRectangle
///////////////////////////////////////////////////////////////////////
function RuntimeRectangle()
{
	// inherit the members of RuntimeGeomObj
	this.inheritedFrom = RuntimeGeomObj;
	this.inheritedFrom();

	this.import = function( importStr )
	{
		this._xOffset			= Number( getPropertyFromString( "xoff: ",			importStr )  );
		this._yOffset			= Number( getPropertyFromString( "yoff: ",			importStr )  );
		this._width				= Number( getPropertyFromString( "width: ",		importStr )  );
		this._height			= Number( getPropertyFromString( "height: ",		importStr )  );
		this._strokeWidth		= Number( getPropertyFromString( "strokeWidth: ",	importStr )  );
		this._innerRadius		= Number( getPropertyFromString( "innerRadius: ",	importStr )  );
		this._strokeStyle		= Number( getPropertyFromString( "strokeStyle: ",	importStr )  );
		var strokeMaterialName	= getPropertyFromString( "strokeMat: ",	importStr );
		var fillMaterialName	= getPropertyFromString( "fillMat: ",		importStr );
		this._strokeStyle		=  getPropertyFromString( "strokeStyle: ",	importStr );
		this._fillColor			=  eval( "[" + getPropertyFromString( "fillColor: ",	importStr ) + "]" );
		this._strokeColor		=  eval( "[" + getPropertyFromString( "strokeColor: ",	importStr ) + "]" );
		this._tlRadius			=  Number( getPropertyFromString( "tlRadius: ",	importStr )  );
		this._trRadius			=  Number( getPropertyFromString( "trRadius: ",	importStr )  );
		this._blRadius			=  Number( getPropertyFromString( "blRadius: ",	importStr )  );
		this._brRadius			=  Number( getPropertyFromString( "brRadius: ",	importStr )  );

		this.importMaterials( importStr );
	}

	this.renderPath = function( inset, ctx )
	{
		// various declarations
		var pt,  rad,  ctr,  startPt, bPts;
		var width  = Math.round(this._width),
			height = Math.round(this._height);

		pt = [inset, inset];	// top left corner

		var tlRad = this._tlRadius; //top-left radius
		var trRad = this._trRadius;
		var blRad = this._blRadius;
		var brRad = this._brRadius;

		if ((tlRad <= 0) && (blRad <= 0) && (brRad <= 0) && (trRad <= 0))
		{
			ctx.rect(pt[0], pt[1], width - 2*inset, height - 2*inset);
		}
		else
		{
			// get the top left point
			rad = tlRad - inset;
			if (rad < 0)  rad = 0;
			pt[1] += rad;
			if (MathUtils.fpSign(rad) == 0)  pt[1] = inset;
			ctx.moveTo( pt[0],  pt[1] );

			// get the bottom left point
			pt = [inset, height - inset];
			rad = blRad - inset;
			if (rad < 0)  rad = 0;
			pt[1] -= rad;
			ctx.lineTo( pt[0],  pt[1] );

			// get the bottom left curve
			if (MathUtils.fpSign(rad) > 0)
				ctx.quadraticCurveTo( inset, height-inset,  inset+rad, height-inset );

			// do the bottom of the rectangle
			pt = [width - inset,  height - inset];
			rad = brRad - inset;
			if (rad < 0)  rad = 0;
			pt[0] -= rad;
			ctx.lineTo( pt[0], pt[1] );

			// get the bottom right arc
			if (MathUtils.fpSign(rad) > 0)
				ctx.quadraticCurveTo( width-inset, height-inset,  width-inset, height-inset-rad );

			// get the right of the rectangle
			pt = [width - inset,  inset];
			rad = trRad - inset;
			if (rad < 0)  rad = 0;
			pt[1] += rad;
			ctx.lineTo( pt[0], pt[1] );

			// do the top right corner
			if (MathUtils.fpSign(rad) > 0)
				ctx.quadraticCurveTo( width-inset, inset,  width-inset-rad, inset );

			// do the top of the rectangle
			pt = [inset, inset]
			rad = tlRad - inset;
			if (rad < 0)  rad = 0;
			pt[0] += rad;
			ctx.lineTo( pt[0], pt[1] );

			// do the top left corner
			if (MathUtils.fpSign(rad) > 0)
				ctx.quadraticCurveTo( inset, inset, inset, inset+rad );
			else
				ctx.lineTo( inset, 2*inset );
		}
	}

    this.render = function()
    {
        // get the world
        var world = this.getWorld();
        if (!world)  throw( "null world in rectangle render" );

         // get the context
		var ctx = world.get2DContext();
		if (!ctx)  return;

		// get some dimensions
		var lw = this._strokeWidth;
		var	w = world.getViewportWidth(),
			h = world.getViewportHeight();
		
		// render the fill
		ctx.beginPath();
		if (this._fillColor)
		{
			var c = "rgba(" + 255*this._fillColor[0] + "," + 255*this._fillColor[1] + "," + 255*this._fillColor[2] + "," + this._fillColor[3] + ")";  
			ctx.fillStyle = c;

			ctx.lineWidth	= lw;
			var inset = Math.ceil( lw ) + 0.5;
			this.renderPath( inset, ctx );
			ctx.fill();
			ctx.closePath();
		}

		// render the stroke
		ctx.beginPath();
		if (this._strokeColor)
		{
			var c = "rgba(" + 255*this._strokeColor[0] + "," + 255*this._strokeColor[1] + "," + 255*this._strokeColor[2] + "," + this._strokeColor[3] + ")";  
			ctx.strokeStyle = c;

			ctx.lineWidth	= lw;
			var inset = Math.ceil( 0.5*lw ) + 0.5;
			this.renderPath( inset, ctx );
			ctx.stroke();
			ctx.closePath();
		}
    }
}

///////////////////////////////////////////////////////////////////////
// Class RuntimeOval
///////////////////////////////////////////////////////////////////////
function RuntimeOval()
{
	// inherit the members of RuntimeGeomObj
	this.inheritedFrom = RuntimeGeomObj;
	this.inheritedFrom();
}

