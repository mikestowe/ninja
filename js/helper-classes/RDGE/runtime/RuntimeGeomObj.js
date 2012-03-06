
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
				case "radialGradient":  mat = new RuntimeRadialGradientMaterial();		break;
				case "linearGradient":  mat = new RuntimeLinearGradientMaterial();		break;
				case "bumpMetal":		mat = new RuntimeBumpMetalMaterial();			break;
				case "uber":			mat = new RuntimeUberMaterial();				break;

				case "deform":
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
				case "keleidoscope":
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

	////////////////////////////////////////////////////////////////////
	// vector function

	this.vecAdd = function( dimen,  a, b )
	{
        var rtnVec;
        if ((a.length < dimen) || (b.length < dimen))
        {
            throw new Error( "dimension error in vecAdd" );
        }

        rtnVec = [];
        for (var i=0;  i<dimen;  i++)
            rtnVec[i] = a[i] + b[i];

        return rtnVec;
    }


	this.vecSubtract =  function( dimen, a, b )
	{
        var rtnVec;
        if ((a.length < dimen) || (b.length < dimen))
        {
            throw new Error( "dimension error in vecSubtract" );
        }

        rtnVec = [];
        for (var i=0;  i<dimen;  i++)
            rtnVec[i] = a[i] - b[i];

        return rtnVec;
    }

    this.vecDot = function( dimen,  v0, v1 )
	{
        if ((v0.length < dimen) || (v1.length < dimen))
        {
            throw new Error( "dimension error in vecDot" );
        }

        var sum = 0.0;
        for (var i=0;  i<dimen;  i++)
            sum += v0[i] * v1[i];

        return sum;
    }

	this.vecMag = function( dimen, vec )
	{
        var sum = 0.0;
        for (var i=0;  i<dimen;  i++)
            sum += vec[i]*vec[i];
        return Math.sqrt( sum );
    }

	this.vecScale = function(dimen, vec, scale)
	{
        for (var i=0;  i<dimen;  i++)
            vec[i] *= scale;

        return vec;
    }

    this.vecNormalize = function(dimen, vec, len)
	{
        var rtnVec;
		if (!len)  len = 1.0;

        var sum = 0.0;
        for (var i=0;  i<dimen;  i++)
            sum += vec[i]*vec[i];
        sum = Math.sqrt( sum );

        if (Math.abs(sum) >= 0.001)
        {
            var scale = len/sum;
            rtnVec = [];
            for (var i=0;  i<dimen;  i++)
                rtnVec[i] = vec[i]*scale;
        }

        return rtnVec;
    },

	this.transformPoint = function( srcPt, mat )
    {
        var pt = srcPt.slice(0);
        var	x = this.vecDot(3,  pt, [mat[0], mat[4], mat[ 8]] ) + mat[12],
            y = this.vecDot(3,  pt, [mat[1], mat[5], mat[ 9]] ) + mat[13],
            z = this.vecDot(3,  pt, [mat[2], mat[6], mat[10]] ) + mat[14];

        return [x, y, z];
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
			if (Math.abs(rad) < 0.001)  pt[1] = inset;
			ctx.moveTo( pt[0],  pt[1] );

			// get the bottom left point
			pt = [inset, height - inset];
			rad = blRad - inset;
			if (rad < 0)  rad = 0;
			pt[1] -= rad;
			ctx.lineTo( pt[0],  pt[1] );

			// get the bottom left curve
			if (rad > 0.001)
				ctx.quadraticCurveTo( inset, height-inset,  inset+rad, height-inset );

			// do the bottom of the rectangle
			pt = [width - inset,  height - inset];
			rad = brRad - inset;
			if (rad < 0)  rad = 0;
			pt[0] -= rad;
			ctx.lineTo( pt[0], pt[1] );

			// get the bottom right arc
			if (rad > 0.001)
				ctx.quadraticCurveTo( width-inset, height-inset,  width-inset, height-inset-rad );

			// get the right of the rectangle
			pt = [width - inset,  inset];
			rad = trRad - inset;
			if (rad < 0)  rad = 0;
			pt[1] += rad;
			ctx.lineTo( pt[0], pt[1] );

			// do the top right corner
			if (rad > 0.001)
				ctx.quadraticCurveTo( width-inset, inset,  width-inset-rad, inset );

			// do the top of the rectangle
			pt = [inset, inset]
			rad = tlRad - inset;
			if (rad < 0)  rad = 0;
			pt[0] += rad;
			ctx.lineTo( pt[0], pt[1] );

			// do the top left corner
			if (rad > 0.001)
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

	this.import = function( importStr )
	{
		this._xOffset			= Number( getPropertyFromString( "xoff: ",			importStr ) );
		this._yOffset			= Number( getPropertyFromString( "yoff: ",			importStr ) );
		this._width				= Number( getPropertyFromString( "width: ",		importStr ) );
		this._height			= Number( getPropertyFromString( "height: ",		importStr ) );
		this._strokeWidth		= Number( getPropertyFromString( "strokeWidth: ",	importStr ) );
		this._innerRadius		= Number( getPropertyFromString( "innerRadius: ",	importStr ) );
		this._strokeStyle		= getPropertyFromString( "strokeStyle: ",	importStr );
		var strokeMaterialName	= getPropertyFromString( "strokeMat: ",	importStr );
		var fillMaterialName	= getPropertyFromString( "fillMat: ",		importStr );
		this._fillColor			=  eval( "[" + getPropertyFromString( "fillColor: ",	importStr ) + "]" );
		this._strokeColor		=  eval( "[" + getPropertyFromString( "strokeColor: ",	importStr ) + "]" );
		
		this.importMaterials( importStr );
	}

	this.render = function()
	{
		// get the world
		var world = this.getWorld();
		if (!world)  throw( "null world in buildBuffers" );

		 // get the context
		var ctx = world.get2DContext();
		if (!ctx)  return;

		// declare some variables
		var p0, p1;
		var x0, y1,   x1, y1;

		// create the matrix
		var lineWidth = this._strokeWidth;
		var innerRad  = this._innerRadius;
		var xScale = 0.5*this._width - lineWidth,
			yScale = 0.5*this._height - lineWidth;

		// translate
		var xCtr = 0.5*world.getViewportWidth() + this._xOffset,
			yCtr = 0.5*world.getViewportHeight() + this._yOffset;
		var mat = Matrix.create( [
							[ xScale,     0.0,  0.0,  xCtr],
							[    0.0,  yScale,  0.0,  yCtr],
							[    0.0,     0.0,  1.0,   0.0],
							[    0.0,     0.0,  0.0,   1.0]
						] );

		// get a bezier representation of the circle
		var bezPts = this.circularArcToBezier( [0,0,0],  [1,0,0], 2.0*Math.PI );
		if (bezPts)
		{
			var n = bezPts.length;

			// set up the fill style
			ctx.beginPath();
			ctx.lineWidth = 0;
			if (this._fillColor)
			{
				var c = "rgba(" + 255*this._fillColor[0] + "," + 255*this._fillColor[1] + "," + 255*this._fillColor[2] + "," + this._fillColor[3] + ")";  
				ctx.fillStyle = c;

				// draw the fill
				ctx.beginPath();
				var p = this.transformPoint( bezPts[0],   mat );
				ctx.moveTo( p[0],  p[1] );
				var index = 1;
				while (index < n)
				{
					p0 = this.transformPoint( bezPts[index],  mat );
					p1 = this.transformPoint( bezPts[index+1],  mat );

					x0 = p0[0];  y0 = p0[1];
					x1 = p1[0];  y1 = p1[1];
					ctx.quadraticCurveTo( x0,  y0,  x1, y1 );
					index += 2;
				}

				if ( innerRad > 0.001)
				{
					xScale = 0.5*innerRad*this._width;
					yScale = 0.5*innerRad*this._height;
					mat[0] = xScale;
					mat[5] = yScale;

					// get the bezier points
					var bezPts = this.circularArcToBezier( Vector.create([0,0,0]), Vector.create([1,0,0]), -2.0*Math.PI );
					if (bezPts)
					{
						var n = bezPts.length;
						p = this.transformPoint( bezPts[0],   mat );
						ctx.moveTo( p[0],  p[1] );
						index = 1;
						while (index < n)
						{
							p0 = this.transformPoint( bezPts[index],    mat );
							p1 = this.transformPoint( bezPts[index+1],  mat );

							var x0 = p0[0],  y0 = p0[1],
								x1 = p1[0],  y1 = p1[1];
							ctx.quadraticCurveTo( x0,  y0,  x1, y1 );
							index += 2;
						}
					}
				}

				// fill the path
				ctx.fill();
			}

			// calculate the stroke matrix
			xScale = 0.5*this._width  - 0.5*lineWidth;
			yScale = 0.5*this._height - 0.5*lineWidth;
			mat[0] = xScale;
			mat[5] = yScale;

			// set up the stroke style
			ctx.beginPath();
			ctx.lineWidth	= lineWidth;
			if (this._strokeColor)
			{
				var c = "rgba(" + 255*this._strokeColor[0] + "," + 255*this._strokeColor[1] + "," + 255*this._strokeColor[2] + "," + this._strokeColor[3] + ")";  
				ctx.strokeStyle = c;
			
				// draw the stroke
				p = this.transformPoint( bezPts[0],   mat );
				ctx.moveTo( p[0],  p[1] );
				index = 1;
				while (index < n)
				{
					var p0 = this.transformPoint( bezPts[index],  mat );
					var p1 = this.transformPoint( bezPts[index+1],  mat );

					var x0 = p0[0],  y0 = p0[1],
						x1 = p1[0],  y1 = p1[1];
					ctx.quadraticCurveTo( x0,  y0,  x1, y1 );
					index += 2;
				}

				if (innerRad > 0.01)
				{
					// calculate the stroke matrix
					xScale = 0.5*innerRad*this._width  - 0.5*lineWidth;
					yScale = 0.5*innerRad*this._height - 0.5*lineWidth;
					mat[0] = xScale;
					mat[5] = yScale;
			
					// draw the stroke
					p = this.transformPoint( bezPts[0],   mat );
					ctx.moveTo( p[0],  p[1] );
					index = 1;
					while (index < n)
					{
						var p0 = this.transformPoint( bezPts[index],  mat );
						var p1 = this.transformPoint( bezPts[index+1],  mat );

						var x0 = p0[0],  y0 = p0[1],
							x1 = p1[0],  y1 = p1[1];
						ctx.quadraticCurveTo( x0,  y0,  x1, y1 );
						index += 2;
					}
				}

				// render the stroke
				ctx.stroke();
			}
		}
    }

    ///////////////////////////////////////////////////////////////////////
	// this function returns the quadratic Bezier approximation to the specified
	// circular arc.  The input can be 2D or 3D, determined by the minimum dimension
	// of the center and start point.
	// includedAngle is in radians, can be positiveor negative
	this.circularArcToBezier= function( ctr_, startPt_, includedAngle )
	{
        var dimen = 3;
        var ctr = ctr_.slice();
        var startPt = startPt_.slice();

        // make sure the start point is good
        var pt = this.vecSubtract(dimen, startPt, ctr);
        var rad = this.vecMag(dimen, pt);

        if ((dimen != 3) || (rad <= 0) || (includedAngle === 0))
        {
            if (dimen != 3)  console.log( "circularArcToBezier works for 3 dimensional points only.  Was " + dimen );
            return [ startPt.slice(0), startPt.slice(0), startPt.slice(0) ];
        }

        // determine the number of segments.  45 degree span maximum.
        var nSegs = Math.ceil( Math.abs(includedAngle)/(0.25*Math.PI) );
        if (nSegs <= 0)  return [ startPt.slice(0), startPt.slice(0), startPt.slice(0) ];
        var dAngle = includedAngle/nSegs;

        // determine the length of the center control point from the circle center
        var cs = Math.cos( 0.5*Math.abs(dAngle) ),  sn = Math.sin( 0.5*Math.abs(dAngle) );
        var  c = rad*sn;
        var  h = c*sn/cs;
        var  d = rad*cs + h;

        var rtnPts = [ this.vecAdd(dimen, pt, ctr) ];
        var rotMat = Matrix.RotationZ( dAngle );
        for ( var i=0;  i<nSegs;  i++)
        {
            // get the next end point
            var pt2 = this.transformPoint( pt, rotMat );

            // get the next center control point
            var midPt = this.vecAdd(3, pt, pt2);
            this.vecScale(dimen, midPt, 0.5);
            midPt = this.vecNormalize( dimen, midPt, d );

            // save the next segment
            rtnPts.push( this.vecAdd(dimen, midPt, ctr) );
            rtnPts.push( this.vecAdd(dimen,   pt2, ctr) );

            // advance for the next segment
            pt = pt2;
        }
        return rtnPts;
	}
}

