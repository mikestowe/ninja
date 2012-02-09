/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */
 
 ///////////////////////////////////////////////////////////////////////
// Class GLRectangle
//      GL representation of a rectangle.
//      Derived from class GLGeomObj
///////////////////////////////////////////////////////////////////////
function GLRectangle()
{
	// CONSTANTS
	this.N_TRIANGLES = 15;

	// initialize the inherited members
	this.inheritedFrom = GLGeomObj;
	this.inheritedFrom();

	///////////////////////////////////////////////////////////////////////
	// Instance variables
	///////////////////////////////////////////////////////////////////////
	this._width = 2.0;
	this._height = 2.0;
	this._xOffset = 0;
	this._yOffset = 0;

	this._tlRadius = 0;
	this._trRadius = 0;
	this._blRadius = 0;
	this._brRadius = 0;

	this._strokeWidth = 0.25;

	this._strokeStyle = "Solid";
	this.init = function(world, xOffset, yOffset, width, height, strokeSize, strokeColor, fillColor,
                      tlRadius, trRadius, blRadius, brRadius, strokeMaterial, fillMaterial, strokeStyle)
	{


		this.m_world = world;

		if (arguments.length > 0)
		{
			this._width = width;
			this._height = height;
			this._xOffset = xOffset;
			this._yOffset = yOffset;

			this._strokeWidth = strokeSize;
			this._strokeColor = strokeColor;
			this._fillColor = fillColor;

			this.setTLRadius(tlRadius);
			this.setTRRadius(trRadius);
			this.setBLRadius(blRadius);
			this.setBRRadius(brRadius);

			this._strokeStyle = strokeStyle;
		}

		// the overall radius includes the fill and the stroke.  separate the two based onthe stroke width
		//  this._fillRad = this._radius - this._strokeWidth;
		//    var err = 0.05;
		var err = 0;
		this._fillWidth = this._width - this._strokeWidth  + err;
		this._fillHeight = this._height - this._strokeWidth + err;

		this._materialAmbient  = [0.2, 0.2, 0.2,  1.0];
		this._materialDiffuse  = [0.4, 0.4, 0.4,  1.0];
		this._materialSpecular = [0.4, 0.4, 0.4,  1.0];

		if(strokeMaterial)
			this._strokeMaterial = strokeMaterial;
		else
			this._strokeMaterial = new FlatMaterial();

		if(fillMaterial)
			this._fillMaterial = fillMaterial;
		else 
			this._fillMaterial = new FlatMaterial();
	}

	///////////////////////////////////////////////////////////////////////
	// Property Accessors
	///////////////////////////////////////////////////////////////////////
	this.getStrokeWidth   = function()    {  return this._strokeWidth;    }
	this.setStrokeWidth   = function(w)   {  this._strokeWidth = w;     }

	this.getStrokeMaterial  = function()    {  return this._strokeMaterial;   }
	this.setStrokeMaterial  = function(m)   {  this._strokeMaterial = m;    }

	this.getFillMaterial  = function()    {  return this._fillMaterial;   }
	this.setFillMaterial  = function(m)   {  this._fillMaterial = m;      }

	this.getStrokeColor   = function()    {  return this._strokeColor;    }
	//this.setStrokeColor   = function(c)   {  this._strokeColor = c;     }

	this.getFillColor   = function()    {  return this._fillColor;      }
	//this.setFillColor   = function(c)	{  this._fillColor = c.slice(0);	}

	this.getTLRadius    = function()    {  return this._tlRadius;     }
	this.setTLRadius    = function(r)   {  this._tlRadius = Math.min(r, (this._height - this._strokeWidth)/2, (this._width - this._strokeWidth)/2);   }

	this.getTRRadius    = function()    {  return this._trRadius;     }
	this.setTRRadius    = function(r)   {  this._trRadius = Math.min(r, (this._height - this._strokeWidth)/2, (this._width - this._strokeWidth)/2);   }

	this.getBLRadius    = function()    {  return this._blRadius;     }
	this.setBLRadius    = function(r)   {  this._blRadius = Math.min(r, (this._height - this._strokeWidth)/2, (this._width - this._strokeWidth)/2);   }

	this.getBRRadius    = function()    {  return this._brRadius;     }
	this.setBRRadius    = function(r)   {  this._brRadius = Math.min(r, (this._height - this._strokeWidth)/2, (this._width - this._strokeWidth)/2);   }

	this.getStrokeStyle   = function()    {  return this._strokeStyle;    }
	this.setStrokeStyle   = function(s)   {  this._strokeStyle = s;     }

	this.getWidth     = function()    {  return this._width;        }
	this.setWidth     = function(w)   {  this._width = w;         }

	this.getHeight      = function()    {  return this._height;       }
	this.setHeight      = function(h)   {  this._height = h;        }

	this.geomType     = function()    {  return this.GEOM_TYPE_RECTANGLE; }


	///////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////
	this.export = function()
	{
		var rtnStr = "type: " + this.geomType() + "\n";

		/////////////////////////////////////////////////////////////////////////
		//
		//	world, xOffset, yOffset, width, height, strokeSize, strokeColor, fillColor,
        //    tlRadius, trRadius, blRadius, brRadius, strokeMaterial, fillMaterial, strokeStyle
		//
		/////////////////////////////////////////////////////////////////////////////

		rtnStr += "xoff: "			+ this._xOffset		+ "\n";
		rtnStr += "yoff: "			+ this._yOffset		+ "\n";
		rtnStr += "width: "			+ this._width		+ "\n";
		rtnStr += "height: "		+ this._height		+ "\n";
		rtnStr += "strokeWidth: "	+ this._strokeWidth	+ "\n";
		rtnStr += "strokeColor: "	+ String(this._strokeColor)  + "\n";
		rtnStr += "fillColor: "		+ String(this._fillColor)	 + "\n";
		rtnStr += "tlRadius: "		+ this._tlRadius	+ "\n";
		rtnStr += "trRadius: "		+ this._trRadius	+ "\n";
		rtnStr += "blRadius: "		+ this._blRadius	+ "\n";
		rtnStr += "brRadius: "		+ this._brRadius	+ "\n";
		rtnStr += "innerRadius: "	+ this._innerRadius	+ "\n";
		rtnStr += "strokeStyle: "	+ this._strokeStyle	+ "\n";

		rtnStr += "strokeMat: ";
		if (this._strokeMaterial)
			rtnStr += this._strokeMaterial.getName();
		else
			rtnStr += "flatMaterial";
		rtnStr += "\n";

		rtnStr += "fillMat: ";
		if (this._fillMaterial)
			rtnStr += this._fillMaterial.getName();
		else
			rtnStr += "flatMaterial";
		rtnStr += "\n";

		return rtnStr;
	}

	this.import = function( importStr )
	{
		this._xOffset			= Number( this.getPropertyFromString( "xoff: ",			importStr )  );
		this._yOffset			= Number( this.getPropertyFromString( "yoff: ",			importStr )  );
		this._width				= Number( this.getPropertyFromString( "width: ",		importStr )  );
		this._height			= Number( this.getPropertyFromString( "height: ",		importStr )  );
		this._strokeWidth		= Number( this.getPropertyFromString( "strokeWidth: ",	importStr )  );
		this._innerRadius		= Number( this.getPropertyFromString( "innerRadius: ",	importStr )  );
		this._strokeStyle		= Number( this.getPropertyFromString( "strokeStyle: ",	importStr )  );
		var strokeMaterialName	= Number( this.getPropertyFromString( "strokeMat: ",	importStr )  );
		var fillMaterialName	= Number( this.getPropertyFromString( "fillMat: ",		importStr )  );
		this._strokeStyle		=  Number( this.getPropertyFromString( "strokeColor: ",	importStr )  );
		this._fillColor			=  eval( "[" + this.getPropertyFromString( "fillColor: ",	importStr ) + "]" );
		this._strokeColor		=  eval( "[" + this.getPropertyFromString( "strokeColor: ",	importStr ) + "]" );
		this._tlRadius			=  Number( this.getPropertyFromString( "tlRadius: ",	importStr )  );
		this._trRadius			=  Number( this.getPropertyFromString( "trRadius: ",	importStr )  );
		this._blRadius			=  Number( this.getPropertyFromString( "blRadius: ",	importStr )  );
		this._brRadius			=  Number( this.getPropertyFromString( "brRadius: ",	importStr )  );

		var strokeMat = MaterialsLibrary.getMaterial( strokeMaterialName );
		if (!strokeMat)
		{
			console.log( "object material not found in library: " + strokeMaterialName );
			strokeMat = new FlatMaterial();
		}
		this._strokeMaterial = strokeMat;

		var fillMat = MaterialsLibrary.getMaterial( fillMaterialName );
		if (!fillMat)
		{
			console.log( "object material not found in library: " + fillMaterialName );
			fillMat = new FlatMaterial();
		}
		this._fillMaterial = fillMat;
	}

	this.buildBuffers = function()
	{
		// get the world
		var world = this.getWorld();
		if (!world)  throw( "null world in buildBuffers" );

		if (!world._useWebGL)  return;

		// create the gl buffer
		var gl = world.getGLContext();

		var tlRadius = this._tlRadius; //top-left radius
		var trRadius = this._trRadius;
		var blRadius = this._blRadius;
		var brRadius = this._brRadius;

		// declare the arrays to hold the parts
        this._primArray = [];
    	this._materialArray = [];
		this._materialTypeArray = [];
	    this._materialNodeArray = [];

		// get the normalized device coordinates (NDC) for
		// all position and dimensions.
		var vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
		var xNDC = 2*this._xOffset/vpw,  yNDC = 2*this._yOffset/vph,
			xFillNDC = this._width/vpw,  yFillNDC = this._height/vph,
			strokeSizeNDC = 2*this._strokeWidth/vpw,
			tlRadiusNDC = 2*tlRadius/vpw,  yTLRadiusNDC = 2*tlRadius/vph,
			trRadiusNDC = 2*trRadius/vpw,  yTRRadiusNDC = 2*trRadius/vph,
			blRadiusNDC = 2*blRadius/vpw,  yBLRadiusNDC = 2*blRadius/vph,
			brRadiusNDC = 2*brRadius/vpw,  yBRRadiusNDC = 2*brRadius/vph;

		var aspect = world.getAspect();
		var zn = world.getZNear(),  zf = world.getZFar();
		var t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),
			b = -t,
			r = aspect*t,
			l = -r;

		// calculate the object coordinates from their NDC coordinates
		var z = -world.getViewDistance();

		// get the position of the origin
		var x = -z*(r-l)/(2.0*zn)*xNDC,
			y = -z*(t-b)/(2.0*zn)*yNDC;

		// get the x and y fill
		var xFill = -z*(r-l)/(2.0*zn)*xFillNDC,
			yFill = -z*(t-b)/(2.0*zn)*yFillNDC;

		// keep some variables giving the overall dimensions of the
		// rectangle. These values are used to calculate consistent
		// texture map coordinates across all pieces.
		this._rectWidth = xFill;  this._rectHeight = yFill;

		// get the stroke size
		var strokeSize = -z*(r-l)/(2.0*zn)*strokeSizeNDC;

		// get the absolute corner radii
		tlRadius = -z*(r-l)/(2.0*zn)*tlRadiusNDC,
		trRadius = -z*(r-l)/(2.0*zn)*trRadiusNDC,
		blRadius = -z*(r-l)/(2.0*zn)*blRadiusNDC,
		brRadius = -z*(r-l)/(2.0*zn)*brRadiusNDC;

		// stroke
		var strokeMaterial = this.makeStrokeMaterial();
		var strokePrim = this.createStroke([x,y],  2*xFill,  2*yFill,  strokeSize,  tlRadius, blRadius, brRadius, trRadius, strokeMaterial);
        this._primArray.push( strokePrim );
		this._materialNodeArray.push( strokeMaterial.getMaterialNode() );

		// fill
		tlRadius -= strokeSize;  if (tlRadius < 0)  tlRadius = 0.0;
		blRadius -= strokeSize;  if (blRadius < 0)  blRadius = 0.0;
		brRadius -= strokeSize;  if (brRadius < 0)  brRadius = 0.0;
		trRadius -= strokeSize;  if (trRadius < 0)  trRadius = 0.0;
		xFill -= strokeSize;
		yFill -= strokeSize;
		var fillMaterial = this.makeFillMaterial();
		var fillPrim = this.createFill([x,y],  2*xFill,  2*yFill,  tlRadius, blRadius, brRadius, trRadius, fillMaterial);
        this._primArray.push( fillPrim );
		this._materialNodeArray.push( fillMaterial.getMaterialNode() );

        world.updateObject(this);
	}

	this.renderQuadraticBezier = function( bPts, ctx )
	{
		if (!bPts)  return;

		var nSegs = (bPts.length - 1)/2.0;
		if (nSegs <= 0)  return;

		var index = 1;
		for (var i=0;  i<nSegs;  i++)
		{
			ctx.quadraticCurveTo(  bPts[index][0],  bPts[index][1],    bPts[index+1][0], bPts[index+1][1] );
			index += 2;
		}
	}

	this.renderPath = function( inset, ctx )
	{
		// various declarations
		var pt,  rad,  ctr,  startPt, bPts;
		var width  = Math.round(this.getWidth()),
			height = Math.round(this.getHeight());

		// get the top left point
		pt = [inset, inset];	// top left corner
		rad = this.getTLRadius() - inset;
		if (rad < 0)  rad = 0;
		pt[1] += rad;
		if (MathUtils.fpSign(rad) == 0)  pt[1] = 0;
		ctx.moveTo( pt[0],  pt[1] );

		// get the bottom left point
		pt = [inset, height - inset];
		rad = this.getBLRadius() - inset;
		if (rad < 0)  rad = 0;
		pt[1] -= rad;
		ctx.lineTo( pt[0],  pt[1] );

		// get the bottom left arc
		if (MathUtils.fpSign(rad) > 0)
		{
			ctr = [ this.getBLRadius(),  height - this.getBLRadius() ];
			//this.renderQuadraticBezier( MathUtils.circularArcToBezier( ctr, pt, -0.5*Math.PI ), ctx  );
			ctx.arc( ctr[0], ctr[1],    rad,    Math.PI,   0.5*Math.PI,  true );
		}

		// do the bottom of the rectangle
		pt = [width - inset,  height - inset];
		rad = this.getBRRadius() - inset;
		if (rad < 0)  rad = 0;
		pt[0] -= rad;
		ctx.lineTo( pt[0], pt[1] );

		// get the bottom right arc
		if (MathUtils.fpSign(rad) > 0)
		{
			ctr = [width - this.getBRRadius(),  height - this.getBRRadius()];
			//this.renderQuadraticBezier( MathUtils.circularArcToBezier( ctr, pt, -0.5*Math.PI ), ctx  );
			ctx.arc( ctr[0], ctr[1],   rad,   0.5*Math.PI,  0.0,  true );
		}

		// get the right of the rectangle
		pt = [width - inset,  inset];
		rad = this.getTRRadius() - inset;
		if (rad < 0)  rad = 0;
		pt[1] += rad;
		ctx.lineTo( pt[0], pt[1] );

		// do the top right corner
		if (MathUtils.fpSign(rad) > 0)
		{
			ctr = [width - this.getTRRadius(),  this.getTRRadius()];
			//this.renderQuadraticBezier( MathUtils.circularArcToBezier( ctr, pt, -0.5*Math.PI ), ctx );
			ctx.arc( ctr[0], ctr[1],   rad,   0.0,  -0.5*Math.PI,  true );
		}

		// do the top of the rectangle
		pt = [inset, inset]
		rad = this.getTLRadius() - inset;
		if (rad < 0)  rad = 0;
		pt[0] += rad;
		ctx.lineTo( pt[0], pt[1] );

		// do the top left corner
		if (MathUtils.fpSign(rad) > 0)
		{
			ctr = [this.getTLRadius(),  this.getTLRadius()];
			//this.renderQuadraticBezier( MathUtils.circularArcToBezier( ctr, pt, -0.5*Math.PI ), ctx );
			ctx.arc( ctr[0], ctr[1],   rad,   -0.5*Math.PI,  Math.PI,  true );
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
		
		// draw the fill
		ctx.beginPath();
		ctx.fillStyle   = "#990000";
		//ctx.strokeStyle = "#0000ff";
		if (this._fillColor)
			ctx.fillStyle = MathUtils.colorToHex( this._fillColor );

		//ctx.lineWidth	= 0;
		//ctx.rect( lw, lw,  w - 2*lw,  h- 2*lw );
		//this.renderPath( lw, ctx )
		//ctx.fill();
		//ctx.closePath();

		// draw the stroke
		//ctx.beginPath();
		//ctx.fillStyle   = "#990000";
		ctx.strokeStyle = "#0000ff";
		if (this._strokeColor)
			ctx.strokeStyle = MathUtils.colorToHex( this._strokeColor );

		ctx.lineWidth	= lw;
		//ctx.rect( 0.5*lw, 0.5*lw,  w-lw,  h-lw );
		var inset = Math.ceil( 0.5*lw ) + 0.5;
//		console.log( "linewidth: " + lw + ", inset: " + inset+ ", width: " + Math.round(this.getWidth()) + ", height: " + Math.round(this.getHeight()) );
		this.renderPath( inset, ctx );
		//this.renderPath( lw, ctx );
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
    }

	this.createStroke = function(ctr,  width,  height,  strokeWidth,  tlRad, blRad, brRad, trRad, material)
	{
		// create the geometry
		var prim = RectangleStroke.create( ctr,  width, height, strokeWidth,  tlRad, blRad,  brRad, trRad)
		return prim;
	}

	this.createFill = function( ctr,  width,  height,  tlRad, blRad, brRad, trRad, material)
	{
		// create the geometry
		// special the (common) case of no rounded corners
		var prim
		if ((tlRad <= 0) && (blRad <= 0) && (brRad <= 0) && (trRad <= 0))
			prim = RectangleGeometry.create( ctr, width, height );
		else
			prim = RectangleFill.create( ctr,  width, height,  tlRad, blRad,  brRad, trRad);

		return prim;
	}

	this.collidesWithPoint = function( x, y )
	{
		if(x < this._xOffset) return false;
		if(x > (this._xOffset + this._width)) return false;
		if(y < this._yOffset) return false;
		if(y > (this._yOffset + this._height)) return false;

		return true;
	}
	
    this.containsPoint = function( pt,  dir )
    {
        var world = this.getWorld();
        if (!world)  throw( "null world in containsPoint" );
		
		// get a point on the plane of the circle
		// the point is in NDC, as is the input parameters
		var mat = this.getMatrix();
		var plane = Vector.create([0,0,1,0]);
		plane = MathUtils.transformPlane( plane, mat );
		var projPt = MathUtils.vecIntersectPlane ( pt, dir, plane );

		// transform the projected point back to the XY plane
		//var invMat = mat.inverse();
		var invMat = glmat4.inverse( mat, [] );
		var planePt = MathUtils.transformPoint( projPt, invMat );

		// get the normalized device coordinates (NDC) for
		// the position and radii.
		var	vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
		var	xNDC = 2*this._xOffset/vpw,  yNDC = 2*this._yOffset/vph,
			xRadNDC = this._width/vpw,  yRadNDC = this._height/vph;
		var projMat = world.makePerspectiveMatrix();
		var z = -world.getViewDistance();
		var planePtNDC = planePt.slice(0);
		planePtNDC[2] = z;
		planePtNDC = MathUtils.transformHomogeneousPoint( planePtNDC, projMat );
		planePtNDC = MathUtils.applyHomogeneousCoordinate( planePtNDC );

		// get the center and dimensions of the rect in NDC
		var vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
		var xNDC = 2*this._xOffset/vpw,  yNDC = 2*this._yOffset/vph,
			hw = this._width/vpw,  hh = this._height/vph;

		var x = planePtNDC[0],  y = planePtNDC[1];
		if (x < (xNDC - hw))  return false;
		if (x > (xNDC + hw))  return false;
		if (y < (yNDC - hh))  return false;
		if (y > (yNDC + hh))  return false;

		return true;
	}

	this.getNearVertex = function( pt, dir )
	{
        var world = this.getWorld();
        if (!world)  throw( "null world in getNearPoint" );
		
		// get a point on the plane of the circle
		// the point is in NDC, as is the input parameters
		var mat = this.getMatrix();
		var plane = Vector.create([0,0,1,0]);
		plane = MathUtils.transformPlane( plane, mat );
		var projPt = MathUtils.vecIntersectPlane ( pt, dir, plane );

		// transform the projected point back to the XY plane
		//var invMat = mat.inverse();
		var invMat = glmat4.inverse(mat, []);
		var planePt = MathUtils.transformPoint( projPt, invMat );

		// get the normalized device coordinates (NDC) for
		// the position and radii.
		var	vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
		var	xNDC = 2*this._xOffset/vpw,  yNDC = 2*this._yOffset/vph,
			hwNDC = this._width/vpw,  hhNDC = this._height/vph;
		var projMat = world.makePerspectiveMatrix();
		var z = -world.getViewDistance();
		var planePtNDC = planePt.slice(0);
		planePtNDC[2] = z;
		planePtNDC = MathUtils.transformHomogeneousPoint( planePtNDC, projMat );
		planePtNDC = MathUtils.applyHomogeneousCoordinate( planePtNDC );

		// get the near point in NDC
		var x = planePtNDC[0],  y = planePtNDC[1];
		var xMin = xNDC - hwNDC,  xMax = xNDC + hwNDC,
			yMin = yNDC - hhNDC,  yMax = yNDC + hhNDC;

		// compare the point against the 4 corners
			var pt, dist;
			pt = Vector.create( [xMin, yMin, 0] );
			dist = VecUtils.vecDist(2, pt, planePtNDC);
			var minPt = pt,  minDist = dist;
		
			pt = Vector.create( [xMin, yMax, 0] );
			dist = VecUtils.vecDist(2, pt, planePtNDC);
			if (dist < minDist)
			{
				minDist = dist;
				minPt = pt;
			}

			pt = Vector.create( [xMax, yMax, 0] );
			dist = VecUtils.vecDist(2, pt, planePtNDC);
			if (dist < minDist)
			{
				minDist = dist;
				minPt = pt;
			}
		
			pt = Vector.create( [xMax, yMin, 0] );
			dist = VecUtils.vecDist(2, pt, planePtNDC);
			if (dist < minDist)
			{
				minDist = dist;
				minPt = pt;
			}
		
		// convert to GL coordinates
		x = minPt[0];  y = minPt[1];
		var aspect = world.getAspect();
		var zn = world.getZNear(),  zf = world.getZFar();
		var	t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),
			b = -t,
			r = aspect*t,
			l = -r;
		var objPt = Vector.create([0,0,0]);
		objPt[0] = -z*(r-l)/(2.0*zn)*x;
		objPt[1] = -z*(t-b)/(2.0*zn)*y;

		// re-apply the transform
		objPt = MathUtils.transformPoint( objPt, mat );

		return objPt;
	}
	
    this.getNearPoint = function( pt, dir )
    {
        var world = this.getWorld();
        if (!world)  throw( "null world in getNearPoint" );
		
		// get a point on the plane of the circle
		// the point is in NDC, as is the input parameters
		var mat = this.getMatrix();
		var plane = Vector.create([0,0,1,0]);
		plane = MathUtils.transformPlane( plane, mat );
		var projPt = MathUtils.vecIntersectPlane ( pt, dir, plane );

		// transform the projected point back to the XY plane
		//var invMat = mat.inverse();
		var invMat = glmat4.inverse(mat, []);
		var planePt = MathUtils.transformPoint( projPt, invMat );

		// get the normalized device coordinates (NDC) for
		// the position and radii.
		var	vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
		var	xNDC = 2*this._xOffset/vpw,  yNDC = 2*this._yOffset/vph,
			hwNDC = this._width/vpw,  hhNDC = this._height/vph;
		var projMat = world.makePerspectiveMatrix();
		var z = -world.getViewDistance();
		var planePtNDC = planePt.slice(0);
		planePtNDC[2] = z;
		planePtNDC = MathUtils.transformHomogeneousPoint( planePtNDC, projMat );
		planePtNDC = MathUtils.applyHomogeneousCoordinate( planePtNDC );

		// get the near point in NDC
		var x = planePtNDC[0],  y = planePtNDC[1];
		var xMin = xNDC - hwNDC,  xMax = xNDC + hwNDC,
			yMin = yNDC - hhNDC,  yMax = yNDC + hhNDC;

		// compare the point against the near point on the 4 sides
			var pt, dist;
			pt = Vector.create( [xMin, y, 0] );
			if      (pt[1] < yMin)  pt[1] = yMin;
			else if (pt[1] > yMax)  pt[1] = yMax;
			dist = VecUtils.vecDist(2, pt, planePtNDC);
			var minPt = pt,  minDist = dist;
		
			pt = Vector.create( [x, yMax, 0] );
			if      (pt[0] < xMin)  pt[0] = xMin;
			else if (pt[0] > xMax)  pt[0] = xMax;
			dist = VecUtils.vecDist(2, pt, planePtNDC);
			if (dist < minDist)
			{
				minDist = dist;
				minPt = pt;
			}

			pt = Vector.create( [xMax, y, 0] );
			if      (pt[1] < yMin)  pt[1] = yMin;
			else if (pt[1] > yMax)  pt[1] = yMax;
			dist = VecUtils.vecDist(2, pt, planePtNDC);
			if (dist < minDist)
			{
				minDist = dist;
				minPt = pt;
			}
		
			pt = Vector.create( [x, yMin, 0] );
			if      (pt[0] < xMin)  pt[0] = xMin;
			else if (pt[0] > xMax)  pt[0] = xMax;
			dist = VecUtils.vecDist(2, pt, planePtNDC);
			if (dist < minDist)
			{
				minDist = dist;
				minPt = pt;
			}
		
		// convert to GL coordinates
		x = minPt[0];  y = minPt[1];
		var aspect = world.getAspect();
		var zn = world.getZNear(),  zf = world.getZFar();
		var	t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),
			b = -t,
			r = aspect*t,
			l = -r;
		var objPt = Vector.create([0,0,0]);
		objPt[0] = -z*(r-l)/(2.0*zn)*x;
		objPt[1] = -z*(t-b)/(2.0*zn)*y;

		// re-apply the transform
		objPt = MathUtils.transformPoint( objPt, mat );

		return objPt;
    }


	 this.recalcTexMapCoords = function( vrts, uvs )
	 {
		var n = vrts.length/3;
		var ivrt = 0,  iuv = 0;
		for (var i=0;  i<n;  i++)
		{
			uvs[iuv] = 0.5*(vrts[ivrt]/this._rectWidth + 1);
			iuv++;  ivrt++;
			uvs[iuv] = 0.5*(vrts[ivrt]/this._rectHeight + 1);
			iuv++;  ivrt += 2;
		}

		//console.log( "remap: " + uvs );
	 }

 }

RectangleFill = {};
RectangleFill.create = function( rectCtr,  width, height, tlRad, blRad,  brRad, trRad)
{
	var x = rectCtr[0],  y = rectCtr[1],  z = 0.0;
	var	hw = 0.5*width,  hh = 0.5*height;

	// limit the radii to half the rectangle dimension
	var minDimen = hw < hh ? hw : hh;
	if (tlRad > minDimen)  tlRad = minDimen;
	if (blRad > minDimen)  blRad = minDimen;
	if (brRad > minDimen)  brRad = minDimen;
	if (trRad > minDimen)  trRad = minDimen;

	// define some local variables
	this.vertices	= [];
	this.normals	= [];
	this.uvs		= [];
	this.indices	= [];
	
	// the center of the rectangle is the first vertex
	RectangleFill.pushVertex( x, y, z );

	// traverse the perimiter of the rectangle

	// push the starting point
	RectangleFill.pushVertex( x-hw, y+hh-tlRad,  z);

	// do the left side
	var ctr;
	if (blRad <= 0)
		RectangleFill.pushVertex( x-hw, y-hh, z);
	else
	{
		ctr = [x - hw + blRad,  y - hh + blRad, z];
		RectangleFill.getRoundedCorner( ctr,  [x-hw, y-hh+blRad, z],  this.vertices );
	}

	// do the bottom
	if (brRad <= 0)
		RectangleFill.pushVertex( x+hw, y-hh, z);
	else
	{
		ctr = [x + hw - brRad,  y - hh + brRad, z];
		RectangleFill.getRoundedCorner( ctr,  [x+hw-brRad, y-hh, z],  this.vertices );
	}

	// do the right
	if (trRad <= 0)
		RectangleFill.pushVertex( x+hw, y+hh, z);
	else
	{
		ctr = [x + hw - trRad,  y + hh - trRad, z];
		RectangleFill.getRoundedCorner( ctr,  [x+hw, y+hh-trRad, z],  this.vertices );
	}

	// do the top
	if (tlRad <= 0)
		RectangleFill.pushVertex( x-hw, y+hh, z);
	else
	{
		ctr = [x - hw + tlRad,  y + hh - tlRad, z];
		RectangleFill.getRoundedCorner( ctr,  [x-hw+tlRad, y+hh, z],  this.vertices );
	}

	// get the normals and uvs
	var vrt, uv;
	var xMin = x - hw,
		yMin = y - hh;
	var n = [0, 0, 1];
	var nVertices = this.vertices.length / 3;
	for (var i=0;  i<nVertices;  i++)
	{
		vrt = RectangleFill.getVertex(i);
		RectangleFill.pushNormal( n );
		uv  = RectangleFill.getUV(vrt[0], vrt[1], xMin, width, yMin, height);
		RectangleFill.pushUV( uv );
	}

	// build the triangles
	var nTriangles = nVertices - 2;
	var i = 1,  j = 2;
	for (var iTri=0;  iTri<nTriangles;  iTri++)
	{
		RectangleFill.pushIndices( 0, j, i );
		i++;
		j++;
	}

	// create the RDGE primitive
	var prim = ShapePrimitive.create(this.vertices, this.normals, this.uvs, this.indices, g_Engine.getContext().renderer.TRIANGLES, nVertices);
	return prim;
}

RectangleFill.pushVertex = function( x, y, z )
{
	this.vertices.push( x );
	this.vertices.push( y );
	this.vertices.push( z );
}

RectangleFill.pushNormal = function( n )
{
	this.normals.push( n[0] );
	this.normals.push( n[1] );
	this.normals.push( n[2] );
}

RectangleFill.pushUV = function( uv )
{
	this.uvs.push( uv[0] );
	this.uvs.push( uv[1] );
}

RectangleFill.pushIndices = function( i, j, k )
{
	this.indices.push( i );
	this.indices.push( j );
	this.indices.push( k );
}

RectangleFill.getVertex = function( index )
{
	var i = 3*index;
	return [ this.vertices[i],  this.vertices[i+1],  this.vertices[i+2] ];
}

RectangleFill.getUV = function( x, y, xMin, w, yMin, h)
{
	var u = (x - xMin)/w,
		v = (y - yMin)/h;

	var uv = [ u, v ];
	return uv;
}

RectangleFill.getRoundedCorner = function(ctr, startPt,  vertices)
{
	var pt0 = startPt.slice();

	// create a matrix to rotate about the center
	var nSegs = 16;
	var angle = 0.5*Math.PI/nSegs;
	var ctrNeg = ctr.slice();
	VecUtils.vecNegate(3, ctrNeg);
	var tNeg  = Matrix.Translation( ctrNeg ),
		rot   = Matrix.RotationZ( angle ),
		trans = Matrix.Translation( ctr );
	var mat = glmat4.multiply( rot, tNeg, [] );
	glmat4.multiply(trans, mat, mat );

	RectangleFill.pushVertex(pt0[0], pt0[1], 0.0 );
	for (var i=0;  i<nSegs;  i++)
	{
		pt0 = MathUtils.transformPoint( pt0, mat );
		RectangleFill.pushVertex(pt0[0], pt0[1], 0.0 );
	}
}


RectangleStroke = {};
RectangleStroke.create = function( rectCtr,  width, height, strokeWidth,  tlRad, blRad,  brRad, trRad)
{
	var x = rectCtr[0],  y = rectCtr[1],  z = 0.0;
	var	hw = 0.5*width,  hh = 0.5*height,  sw = strokeWidth;

	// limit the radii to half the rectangle dimension
	var minDimen = hw < hh ? hw : hh;
	if (tlRad > minDimen)  tlRad = minDimen;
	if (blRad > minDimen)  blRad = minDimen;
	if (brRad > minDimen)  brRad = minDimen;
	if (trRad > minDimen)  trRad = minDimen;

	// define some local variables
	this.vertices	= [];
	this.normals	= [];
	this.uvs		= [];
	this.indices	= [];

	// get the starting points
	if (tlRad == 0)
	{
		RectangleStroke.pushVertex( x-hw+sw, y+hh-sw, z);
		RectangleStroke.pushVertex( x-hw,    y+hh,    z);
	}
	else
	{
		if (tlRad > sw)
		{
			RectangleStroke.pushVertex( x-hw+sw, y+hh-tlRad, z);
			RectangleStroke.pushVertex( x-hw,    y+hh-tlRad, z);
		}
		else
		{
			RectangleStroke.pushVertex( x-hw+tlRad, y+hh-tlRad, z);
			RectangleStroke.pushVertex( x-hw,       y+hh-tlRad, z);
			RectangleStroke.pushVertex( x-hw+sw,    y+hh-sw,    z);
			RectangleStroke.pushVertex( x-hw,       y+hh-sw,    z);
		}
	}

	// get the left side
	if (blRad == 0)
	{
		RectangleStroke.pushVertex( x-hw+sw, y-hh+sw, z);
		RectangleStroke.pushVertex( x-hw,    y-hh,    z);
	}
	else
	{
		if (blRad >= sw)
		{
			RectangleStroke.pushVertex( x-hw+sw, y-hh+blRad, z);
			RectangleStroke.pushVertex( x-hw,    y-hh+blRad, z);
			var ctr		 =	[x-hw+blRad,  y-hh+blRad, z],
				insidePt =	[x-hw+sw,     y-hh+blRad, z],
				outsidePt = [x-hw,        y-hh+blRad, z];
			RectangleStroke.getRoundedCorner( ctr, insidePt,  outsidePt,  this.vertices );
		}
		else
		{
			RectangleStroke.pushVertex( x-hw+sw,  y-hh+sw,    z);
			RectangleStroke.pushVertex( x-hw,     y-hh+blRad, z);
			var ctr		 =	[x-hw+blRad,  y-hh+blRad, z],
				insidePt =	[x-hw+blRad,  y-hh+blRad, z],
				outsidePt = [x-hw,        y-hh+blRad, z];
			RectangleStroke.getRoundedCorner( ctr, insidePt, outsidePt, this.vertices  );

			RectangleStroke.pushVertex( x-hw+sw,  y-hh+sw, z);
			RectangleStroke.pushVertex( x-hw+sw,  y-hh,    z);
		}
	}

	// get the bottom
	if (brRad == 0)
	{
		RectangleStroke.pushVertex( x+hw-sw, y-hh+sw, z);
		RectangleStroke.pushVertex( x+hw,    y-hh,    z);
	}
	else
	{
		RectangleStroke.pushVertex( x+hw-brRad,    y-hh+sw, z);
		RectangleStroke.pushVertex( x+hw-brRad,    y-hh,    z);
		if (brRad >= sw)
		{
			var ctr		 =	[x+hw-brRad,  y-hh+brRad, z],
				insidePt =	[x+hw-brRad,  y-hh+sw,    z],
				outsidePt = [x+hw-brRad,  y-hh,       z];
			RectangleStroke.getRoundedCorner( ctr, insidePt,  outsidePt,  this.vertices );
		}
		else
		{
			RectangleStroke.pushVertex( x+hw-sw,    y-hh+sw, z);
			RectangleStroke.pushVertex( x+hw-brRad,    y-hh, z);
			var ctr		 =	[x+hw-brRad,  y-hh+brRad, z],
				insidePt =	[x+hw-brRad,  y-hh+brRad, z],
				outsidePt = [x+hw-brRad,  y-hh,       z];
			RectangleStroke.getRoundedCorner( ctr, insidePt, outsidePt,  this.vertices );
			RectangleStroke.pushVertex( x+hw-sw,    y-hh+sw, z);
			RectangleStroke.pushVertex( x+hw,       y-hh+sw, z);
		}
	}

	// get the right
	if (trRad == 0)
	{
		RectangleStroke.pushVertex( x+hw-sw, y+hh-sw, z);
		RectangleStroke.pushVertex(    x+hw,    y+hh, z);
	}
	else
	{
		if (trRad >= sw)
		{
			RectangleStroke.pushVertex( x+hw-sw,  y+hh-trRad, z);
			RectangleStroke.pushVertex( x+hw,     y+hh-trRad, z);
			var ctr		 =	[x+hw-trRad,  y+hh-trRad, z],
				insidePt =	[x+hw-sw,     y+hh-trRad, z],
				outsidePt = [x+hw,        y+hh-trRad, z];
			RectangleStroke.getRoundedCorner( ctr, insidePt,  outsidePt,  this.vertices );
		}
		else
		{
			RectangleStroke.pushVertex( x+hw-sw,  y+hh-sw,    z);
			RectangleStroke.pushVertex( x+hw,     y+hh-trRad, z);
			var ctr		 =	[x+hw-trRad,  y+hh-trRad, z],
				insidePt =	[x+hw-trRad,  y+hh-trRad, z],
				outsidePt = [x+hw,        y+hh-trRad, z];
			RectangleStroke.getRoundedCorner( ctr, insidePt, outsidePt,  this.vertices );
			RectangleStroke.pushVertex( x+hw-sw,  y+hh-sw, z);
			RectangleStroke.pushVertex( x+hw-sw,  y+hh,    z);
		}
	}

	// get the top
	if (tlRad == 0)
	{
		RectangleStroke.pushVertex( x-hw+sw,  y+hh-sw, z);
		RectangleStroke.pushVertex( x-hw,     y+hh,    z);
	}
	else
	{
		if (tlRad >= sw)
		{
			RectangleStroke.pushVertex( x-hw+tlRad,  y+hh-sw, z);
			RectangleStroke.pushVertex( x-hw+tlRad,  y+hh,    z);
			var ctr		 =	[x-hw+tlRad,  y+hh-tlRad, z],
				insidePt =	[x-hw+tlRad,  y+hh-sw, z],
				outsidePt = [x-hw+tlRad,  y+hh, z];
			RectangleStroke.getRoundedCorner( ctr, insidePt,  outsidePt,  this.vertices );
		}
		else
		{
			RectangleStroke.pushVertex( x-hw+sw,     y+hh-sw, z);
			RectangleStroke.pushVertex( x-hw+tlRad,  y+hh,    z);
			var ctr		 =	[x-hw+tlRad,  y+hh-tlRad, z],
				insidePt =	[x-hw+tlRad,  y+hh-tlRad, z],
				outsidePt = [x-hw+tlRad,  y+hh, z];
			RectangleStroke.getRoundedCorner( ctr, insidePt, outsidePt,  this.vertices );
		}
	}

	// get the normals and uvs
	var vrt, uv;
	var xMin = x - hw,
		yMin = y - hh;
	var n = [0, 0, 1];
	var nVertices = this.vertices.length / 3;
	for (var i=0;  i<nVertices;  i++)
	{
		vrt = RectangleStroke.getVertex(i);
		RectangleStroke.pushNormal( n );
		uv  = RectangleStroke.getUV(vrt[0], vrt[1], xMin, width, yMin, height);
		RectangleStroke.pushUV( uv );
	}

	// build the triangles
	var nTriangles = nVertices - 2;
	var i = 0,  j = 1, k = 2;
	var reverse = false;
	for (var iTri=0;  iTri<nTriangles;  iTri++)
	{
		// we created a triangle strip, so each sequential triangle has the opposite orientation than its predecessor
		if (!reverse)
			RectangleStroke.pushIndices( k, j, i );
		else
			RectangleStroke.pushIndices( i, j, k );
		reverse = !reverse;

		i++;
		j++;
		k++;
	}

	// create the RDGE primitive
	var prim = ShapePrimitive.create(this.vertices, this.normals, this.uvs, this.indices, g_Engine.getContext().renderer.TRIANGLES, nVertices);
	return prim;
}

RectangleStroke.getRoundedCorner = function( ctr, insidePt, outsidePt )
{
	var pt0 = insidePt.slice(),
		pt1 = outsidePt.slice();

	// create a matrix to rotate about the center
	var nSegs = 16;
	var angle = 0.5*Math.PI/nSegs;
	var ctrNeg = ctr.slice();
	VecUtils.vecNegate(3, ctrNeg);
	var tNeg  = Matrix.Translation( ctrNeg ),
		rot   = Matrix.RotationZ( angle ),
		trans = Matrix.Translation( ctr );
	var mat = glmat4.multiply( rot, tNeg, [] );
	glmat4.multiply(trans, mat, mat );

	RectangleStroke.pushVertex(pt0[0], pt0[1], 0.0 );
	RectangleStroke.pushVertex(pt1[0], pt1[1], 0.0 );
	for (var i=0;  i<nSegs;  i++)
	{
		pt0 = MathUtils.transformPoint( pt0, mat );
		pt1 = MathUtils.transformPoint( pt1, mat );

		RectangleStroke.pushVertex(pt0[0], pt0[1], 0.0 );
		RectangleStroke.pushVertex(pt1[0], pt1[1], 0.0 );
	}
}

RectangleStroke.pushVertex	= RectangleFill.pushVertex;
RectangleStroke.pushNormal	= RectangleFill.pushNormal;
RectangleStroke.pushUV		= RectangleFill.pushUV;
RectangleStroke.pushIndices	= RectangleFill.pushIndices;
RectangleStroke.getVertex	= RectangleFill.getVertex;
RectangleStroke.getUV		= RectangleFill.getUV;



// Helper function for generating Three.js geometry
RectangleGeometry = {};
RectangleGeometry.create = function( ctr,  width, height )
{
	var x = ctr[0],  y = ctr[1],  z = 0.0;
	var	hw = 0.5*width,  hh = 0.5*height;

	// define some local variables
	this.vertices	= [];
	this.normals	= [];
	this.uvs		= [];
	this.indices	= [];

	// create the 4 vertices
	var nVertices = 4;
	RectangleGeometry.pushVertex( x-hw, y+hh, z);
	RectangleGeometry.pushVertex( x-hw, y-hh, z);
	RectangleGeometry.pushVertex( x+hw, y-hh, z);
	RectangleGeometry.pushVertex( x+hw, y+hh, z);

	// create the uv values for each vertex
	RectangleGeometry.pushUV( [0, 0] );
	RectangleGeometry.pushUV( [0, 1] );
	RectangleGeometry.pushUV( [1, 1] );
	RectangleGeometry.pushUV( [1, 0] );


	// create the per-vertex normals
	var n = [0, 0, 1];
	RectangleGeometry.pushNormal( n );
	RectangleGeometry.pushNormal( n );
	RectangleGeometry.pushNormal( n );
	RectangleGeometry.pushNormal( n );

	// create the 2 triangles
//	RectangleGeometry.pushIndices( 0, 1, 2 );
//	RectangleGeometry.pushIndices( 2, 3, 0 );
	RectangleGeometry.pushIndices( 2, 1, 0 );
	RectangleGeometry.pushIndices( 0, 3, 2 );

	// create the RDGE primitive
	var prim = ShapePrimitive.create(this.vertices, this.normals, this.uvs, this.indices, g_Engine.getContext().renderer.TRIANGLES, nVertices);
	return prim;
}

RectangleGeometry.pushVertex	= RectangleFill.pushVertex;
RectangleGeometry.pushNormal	= RectangleFill.pushNormal;
RectangleGeometry.pushUV		= RectangleFill.pushUV;
RectangleGeometry.pushIndices	= RectangleFill.pushIndices;
RectangleGeometry.getVertex		= RectangleFill.getVertex;
RectangleGeometry.getUV			= RectangleFill.getUV;



// Helper function for generating a RDGE primitive
ShapePrimitive = {};

ShapePrimitive.create = function(coords,  normals,  uvs,  indices, primType, vertexCount)
{
	var renderer = g_Engine.getContext().renderer;

	// to setup a primitive you must define it
	// create a new primitive definition here to then fill out
	var prim = new rdgePrimitiveDefinition();

	// the vertex definition declares how the data will be delivered to the shader
	// the position of an element in array determines which attribute in a shader the
	// data is bound to
	prim.vertexDefinition=
	{
		// this shows two ways to map this data to an attribute
		"vert":{'type':renderer.VS_ELEMENT_POS, 'bufferIndex':0, 'bufferUsage': renderer.BUFFER_STATIC},
		"a_pos":{'type':renderer.VS_ELEMENT_POS, 'bufferIndex':0, 'bufferUsage': renderer.BUFFER_STATIC},

		"normal":{'type':renderer.VS_ELEMENT_FLOAT3, 'bufferIndex':1, 'bufferUsage': renderer.BUFFER_STATIC},
		"a_nrm":{'type':renderer.VS_ELEMENT_FLOAT3, 'bufferIndex':1, 'bufferUsage': renderer.BUFFER_STATIC},
		"a_normal":{'type':renderer.VS_ELEMENT_FLOAT3, 'bufferIndex':1, 'bufferUsage': renderer.BUFFER_STATIC},

		"texcoord":{'type':renderer.VS_ELEMENT_FLOAT2, 'bufferIndex':2, 'bufferUsage': renderer.BUFFER_STATIC},
		"a_texcoord":{'type':renderer.VS_ELEMENT_FLOAT2, 'bufferIndex':2, 'bufferUsage': renderer.BUFFER_STATIC}
	};


	// the actual data that correlates to the vertex definition
	prim.bufferStreams=
	[
		coords,
		normals,
		uvs
	];

	// what type of buffers the data resides in, static is the most common case
	prim.streamUsage=
	[
		renderer.BUFFER_STATIC,
		renderer.BUFFER_STATIC,
		renderer.BUFFER_STATIC
	];

	// this tells the renderer to draw the primitive as a list of triangles
	prim.type = primType;

	prim.indexUsage = renderer.BUFFER_STREAM;
	prim.indexBuffer = indices;

	// finally the primitive is created, buffers are generated and the system determines
	// the data it needs to draw this primitive according to the previous definition
	renderer.createPrimitive(prim, vertexCount);

	return prim;
}