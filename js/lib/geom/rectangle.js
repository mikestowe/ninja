/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var GeomObj = require("js/lib/geom/geom-obj").GeomObj;
var ShapePrimitive =    require("js/lib/geom/shape-primitive").ShapePrimitive;
var MaterialsModel = require("js/models/materials-model").MaterialsModel;
 ///////////////////////////////////////////////////////////////////////
// Class GLRectangle
//      GL representation of a rectangle.
//      Derived from class GeomObj
///////////////////////////////////////////////////////////////////////
var Rectangle = function GLRectangle() {
	// CONSTANTS
	this.N_TRIANGLES = 15;

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
                      tlRadius, trRadius, blRadius, brRadius, strokeMaterial, fillMaterial, strokeStyle) {


		this.m_world = world;

		if (arguments.length > 0) {
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

		if(strokeMaterial) {
			this._strokeMaterial = strokeMaterial;
        } else {
			this._strokeMaterial = MaterialsModel.getMaterial( MaterialsModel.getDefaultMaterialName() );
        }

		if(fillMaterial) {
			this._fillMaterial = fillMaterial;
        } else {
			this._fillMaterial = MaterialsModel.getMaterial( MaterialsModel.getDefaultMaterialName() );
        }

		this.exportMaterials();
	};

	///////////////////////////////////////////////////////////////////////
	// Property Accessors
	///////////////////////////////////////////////////////////////////////
	this.getStrokeWidth = function() {
        return this._strokeWidth;
    };

	this.setStrokeWidth = function(w) {
        this._strokeWidth = w;
    };

	this.getStrokeMaterial = function() {
        return this._strokeMaterial;
    };

	this.setStrokeMaterial = function(m) {
        this._strokeMaterial = m;
    };

	this.getFillMaterial = function() {
        return this._fillMaterial;
    };

	this.setFillMaterial = function(m) {
        this._fillMaterial = m;
    };

	this.getStrokeColor = function() {
        return this._strokeColor;
    };

	//this.setStrokeColor = function(c) {
	// this._strokeColor = c;
	// };

	this.getFillColor = function() {
        return this._fillColor;
    };

	//this.setFillColor = function(c) {
	// this._fillColor = c.slice(0);
	// };

	this.getTLRadius = function() {
        return this._tlRadius;
    };

	this.setTLRadius = function(r) {
        this._tlRadius = Math.min(r, (this._height - this._strokeWidth)/2, (this._width - this._strokeWidth)/2);
    };

	this.getTRRadius = function() {
        return this._trRadius;
    };

	this.setTRRadius = function(r) {
        this._trRadius = Math.min(r, (this._height - this._strokeWidth)/2, (this._width - this._strokeWidth)/2);
    };

	this.getBLRadius = function() {
        return this._blRadius;
    };

	this.setBLRadius = function(r) {
        this._blRadius = Math.min(r, (this._height - this._strokeWidth)/2, (this._width - this._strokeWidth)/2);
    };

	this.getBRRadius = function() {
        return this._brRadius;
    };

	this.setBRRadius = function(r) {
        this._brRadius = Math.min(r, (this._height - this._strokeWidth)/2, (this._width - this._strokeWidth)/2);
    };

	this.getStrokeStyle = function() {
        return this._strokeStyle;
    };

	this.setStrokeStyle = function(s) {
        this._strokeStyle = s;
    };

	this.getWidth = function() {
        return this._width;
    };

	this.setWidth = function(w) {
        this._width = w;
    };

	this.getHeight = function() {
        return this._height;
    };

	this.setHeight = function(h) {
        this._height = h;
    };

	this.geomType = function() {
        return this.GEOM_TYPE_RECTANGLE;
    };


	///////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////
	this.export = function() {
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

        if(this._strokeColor.gradientMode) {
            rtnStr += "strokeGradientMode: "	+ this._strokeColor.gradientMode	+ "\n";
            rtnStr += "strokeColor: " + this.gradientToString(this._strokeColor.color) + "\n";
        } else {
            rtnStr += "strokeColor: "	+ String(this._strokeColor)  + "\n";
        }

        if(this._fillColor.gradientMode) {
            rtnStr += "fillGradientMode: "	+ this._fillColor.gradientMode	+ "\n";
            rtnStr += "fillColor: " + this.gradientToString(this._fillColor.color) + "\n";
        } else {
            rtnStr += "fillColor: "	+ String(this._fillColor)  + "\n";
        }
		rtnStr += "tlRadius: "		+ this._tlRadius	+ "\n";
		rtnStr += "trRadius: "		+ this._trRadius	+ "\n";
		rtnStr += "blRadius: "		+ this._blRadius	+ "\n";
		rtnStr += "brRadius: "		+ this._brRadius	+ "\n";
		rtnStr += "innerRadius: "	+ this._innerRadius	+ "\n";
		rtnStr += "strokeStyle: "	+ this._strokeStyle	+ "\n";

		rtnStr += "strokeMat: ";
		if (this._strokeMaterial) {
			rtnStr += this._strokeMaterial.getName();
        } else {
			rtnStr +=  MaterialsModel.getDefaultMaterialName();
        }
		rtnStr += "\n";

		rtnStr += "fillMat: ";
		if (this._fillMaterial) {
			rtnStr += this._fillMaterial.getName();
        } else {
			rtnStr +=  MaterialsModel.getDefaultMaterialName();
        }
		rtnStr += "\n";

		rtnStr += this.exportMaterials();

		return rtnStr;
	};

	// JSON export
	this.exportJSON = function()
	{
		var jObj = 
		{
			'type'			: this.geomType(),
			'xoff'			: this._xOffset,
			'yoff'			: this._yOffset,
			'width'			: this._width,
			'height'		: this._height,
			'strokeWidth'	: this._strokeWidth,
			'strokeColor'	: this._strokeColor,
			'fillColor'		: this._fillColor,
			'tlRadius'		: this._tlRadius,
			'trRadius'		: this._trRadius,
			'blRadius'		: this._blRadius,
			'brRadius'		: this._brRadius,
			'innerRadius'	: this._innerRadius,
			'strokeStyle'	: this._strokeStyle,
			'strokeMat'		: this._strokeMaterial ? this._strokeMaterial.getName() :  MaterialsModel.getDefaultMaterialName(),
			'fillMat'		: this._fillMaterial ?  this._fillMaterial.getName() :  MaterialsModel.getDefaultMaterialName(),
			'materials'		: this.exportMaterialsJSON()
		};

		return jObj;
	};

	this.importJSON = function( jObj )
	{
		this._xOffset			= jObj.xoff;
		this._yOffset			= jObj.yoff;
		this._width				= jObj.width;
		this._height			= jObj.height;
		this._strokeWidth		= jObj.strokeWidth;
		this._strokeColor		= jObj.strokeColor;
		this._fillColor			= jObj.fillColor;
		this._tlRadius			= jObj.tlRadius;
		this._trRadius			= jObj.trRadius;
		this._blRadius			= jObj.blRadius;
		this._brRadius			= jObj.brRadius;
		this._innerRadius		= jObj.innerRadius;
		this._strokeStyle		= jObj.strokeStyle;
		var strokeMaterialName	= jObj.strokeMat;
		var fillMaterialName	= jObj.fillMat;
		this.importMaterialsJSON( jObj.materials );

		var strokeMat = MaterialsModel.getMaterial( strokeMaterialName );
		if (!strokeMat) {
			console.log( "object material not found in library: " + strokeMaterialName );
			strokeMat = MaterialsModel.getMaterial(  MaterialsModel.getDefaultMaterialName() );
		}
		else
			strokeMat = strokeMat.dup();
		this._strokeMaterial = strokeMat;

		var fillMat = MaterialsModel.getMaterial( fillMaterialName );
		if (!fillMat) {
			console.log( "object material not found in library: " + fillMaterialName );
			fillMat = MaterialsModel.getMaterial(  MaterialsModel.getDefaultMaterialName() );
		}
		else
			fillMat = fillMat.dup();
		this._fillMaterial = fillMat;
	};

	this.import = function( importStr ) {
		this._xOffset			= Number( this.getPropertyFromString( "xoff: ",			importStr )  );
		this._yOffset			= Number( this.getPropertyFromString( "yoff: ",			importStr )  );
		this._width				= Number( this.getPropertyFromString( "width: ",		importStr )  );
		this._height			= Number( this.getPropertyFromString( "height: ",		importStr )  );
		this._strokeWidth		= Number( this.getPropertyFromString( "strokeWidth: ",	importStr )  );
		this._innerRadius		= Number( this.getPropertyFromString( "innerRadius: ",	importStr )  );
		this._strokeStyle		= Number( this.getPropertyFromString( "strokeStyle: ",	importStr )  );
		var strokeMaterialName	= this.getPropertyFromString( "strokeMat: ",	importStr );
		var fillMaterialName	= this.getPropertyFromString( "fillMat: ",		importStr );
		this._strokeStyle		=  this.getPropertyFromString( "strokeStyle: ",	importStr );

        if(importStr.indexOf("fillGradientMode: ") < 0) {
            this._fillColor		=  eval( "[" + this.getPropertyFromString( "fillColor: ",	importStr ) + "]" );
        } else {
            this._fillColor = {};
            this._fillColor.gradientMode = this.getPropertyFromString( "fillGradientMode: ",	importStr );
            this._fillColor.color = this.stringToGradient(this.getPropertyFromString( "fillColor: ",	importStr ));
        }

        if(importStr.indexOf("strokeGradientMode: ") < 0)
        {
            this._strokeColor		=  eval( "[" + this.getPropertyFromString( "strokeColor: ",	importStr ) + "]" );
        } else {
            this._strokeColor = {};
            this._strokeColor.gradientMode = this.getPropertyFromString( "strokeGradientMode: ",	importStr );
            this._strokeColor.color = this.stringToGradient(this.getPropertyFromString( "strokeColor: ",	importStr ));
        }

        this._tlRadius			=  Number( this.getPropertyFromString( "tlRadius: ",	importStr )  );
		this._trRadius			=  Number( this.getPropertyFromString( "trRadius: ",	importStr )  );
		this._blRadius			=  Number( this.getPropertyFromString( "blRadius: ",	importStr )  );
		this._brRadius			=  Number( this.getPropertyFromString( "brRadius: ",	importStr )  );

		var strokeMat = MaterialsModel.getMaterial( strokeMaterialName );
		if (!strokeMat) {
			console.log( "object material not found in library: " + strokeMaterialName );
			strokeMat = MaterialsModel.getMaterial(  MaterialsModel.getDefaultMaterialName() );
		}
		this._strokeMaterial = strokeMat;

		var fillMat = MaterialsModel.getMaterial( fillMaterialName );
		if (!fillMat) {
			console.log( "object material not found in library: " + fillMaterialName );
			fillMat = MaterialsModel.getMaterial(  MaterialsModel.getDefaultMaterialName() );
		}
		this._fillMaterial = fillMat;

		this.importMaterials( importStr );
	};

	this.buildBuffers = function() {
		// get the world
		var world = this.getWorld();
		if (!world)  throw( "null world in buildBuffers" );
		//console.log( "GLRectangle.buildBuffers " + world._worldCount );
		if (!world._useWebGL)  return;
		
		// make sure RDGE has the correct context
		g_Engine.setContext( world.getCanvas().rdgeid );

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
//		var strokeMaterial = this.makeStrokeMaterial();
//		var strokePrim = this.createStroke([x,y],  2*xFill,  2*yFill,  strokeSize,  tlRadius, blRadius, brRadius, trRadius, strokeMaterial);
//        this._primArray.push( strokePrim );
//		this._materialNodeArray.push( strokeMaterial.getMaterialNode() );

		// fill
		tlRadius -= strokeSize;  if (tlRadius < 0)  tlRadius = 0.0;
		blRadius -= strokeSize;  if (blRadius < 0)  blRadius = 0.0;
		brRadius -= strokeSize;  if (brRadius < 0)  brRadius = 0.0;
		trRadius -= strokeSize;  if (trRadius < 0)  trRadius = 0.0;
		xFill -= strokeSize;
		yFill -= strokeSize;
		var fillMaterial = this.makeFillMaterial();
		//console.log( "fillMaterial: " + fillMaterial.getName() );
		var fillPrim = this.createFill([x,y],  2*xFill,  2*yFill,  tlRadius, blRadius, brRadius, trRadius, fillMaterial);
        this._primArray.push( fillPrim );
		this._materialNodeArray.push( fillMaterial.getMaterialNode() );

        world.updateObject(this);
	};

	this.renderQuadraticBezier = function( bPts, ctx ) {
		if (!bPts)  return;

		var nSegs = (bPts.length - 1)/2.0;
		if (nSegs <= 0)  return;

		var index = 1;
		for (var i=0;  i<nSegs;  i++) {
			ctx.quadraticCurveTo(  bPts[index][0],  bPts[index][1],    bPts[index+1][0], bPts[index+1][1] );
			index += 2;
		}
	};

	this.renderPath = function( inset, ctx )
	{
		// various declarations
		var pt,  rad,  ctr,  startPt, bPts;
		var width  = Math.round(this.getWidth()),
			height = Math.round(this.getHeight());

		pt = [inset, inset];	// top left corner

		var tlRad = this._tlRadius; //top-left radius
		var trRad = this._trRadius;
		var blRad = this._blRadius;
		var brRad = this._brRadius;

		if ((tlRad <= 0) && (blRad <= 0) && (brRad <= 0) && (trRad <= 0)) {
			ctx.rect(pt[0], pt[1], width - 2*inset, height - 2*inset);
		} else {
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
			if (MathUtils.fpSign(rad) > 0) {
				ctx.quadraticCurveTo( inset, height-inset,  inset+rad, height-inset );
            }

			// do the bottom of the rectangle
			pt = [width - inset,  height - inset];
			rad = brRad - inset;
			if (rad < 0)  rad = 0;
			pt[0] -= rad;
			ctx.lineTo( pt[0], pt[1] );

			// get the bottom right arc
			if (MathUtils.fpSign(rad) > 0) {
				ctx.quadraticCurveTo( width-inset, height-inset,  width-inset, height-inset-rad );
            }

			// get the right of the rectangle
			pt = [width - inset,  inset];
			rad = trRad - inset;
			if (rad < 0)  rad = 0;
			pt[1] += rad;
			ctx.lineTo( pt[0], pt[1] );

			// do the top right corner
			if (MathUtils.fpSign(rad) > 0) {
				ctx.quadraticCurveTo( width-inset, inset,  width-inset-rad, inset );
            }

			// do the top of the rectangle
			pt = [inset, inset];
			rad = tlRad - inset;
			if (rad < 0)  rad = 0;
			pt[0] += rad;
			ctx.lineTo( pt[0], pt[1] );

			// do the top left corner
			if (MathUtils.fpSign(rad) > 0) {
				ctx.quadraticCurveTo( inset, inset, inset, inset+rad );
            } else {
				ctx.lineTo( inset, 2*inset );
            }
		}
	};

    this.render = function() {
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

        var c,
            inset,
            gradient,
            colors,
            len,
            n,
            position,
            cs;
		// render the fill
		ctx.beginPath();
		if (this._fillColor) {
            inset = Math.ceil( lw ) + 0.5;

            if(this._fillColor.gradientMode) {
                if(this._fillColor.gradientMode === "radial") {
                    gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w/2, h/2)-inset);
                } else {
                    gradient = ctx.createLinearGradient(inset, h/2, w-2*inset, h/2);
                }
                colors = this._fillColor.color;

                len = colors.length;

                for(n=0; n<len; n++) {
                    position = colors[n].position/100;
                    cs = colors[n].value;
                    gradient.addColorStop(position, "rgba(" + cs.r + "," + cs.g + "," + cs.b + "," + cs.a + ")");
                }

                ctx.fillStyle = gradient;

            } else {
                c = "rgba(" + 255*this._fillColor[0] + "," + 255*this._fillColor[1] + "," + 255*this._fillColor[2] + "," + this._fillColor[3] + ")";
                ctx.fillStyle = c;
            }

			ctx.lineWidth	= lw;
			this.renderPath( inset, ctx );
			ctx.fill();
			ctx.closePath();
		}

		// render the stroke
		ctx.beginPath();
		if (this._strokeColor) {
            inset = Math.ceil( 0.5*lw ) + 0.5;

            if(this._strokeColor.gradientMode) {
                if(this._strokeColor.gradientMode === "radial") {
                    gradient = ctx.createRadialGradient(w/2, h/2, Math.min(h/2, w/2)-inset, w/2, h/2, Math.max(h/2, w/2));
                } else {
                    gradient = ctx.createLinearGradient(0, h/2, w, h/2);
                }
                colors = this._strokeColor.color;

                len = colors.length;

                for(n=0; n<len; n++) {
                    position = colors[n].position/100;
                    cs = colors[n].value;
                    gradient.addColorStop(position, "rgba(" + cs.r + "," + cs.g + "," + cs.b + "," + cs.a + ")");
                }

                ctx.strokeStyle = gradient;

            } else {
                c = "rgba(" + 255*this._strokeColor[0] + "," + 255*this._strokeColor[1] + "," + 255*this._strokeColor[2] + "," + this._strokeColor[3] + ")";
                ctx.strokeStyle = c;
            }

			ctx.lineWidth	= lw;
			this.renderPath( inset, ctx );
			ctx.stroke();
			ctx.closePath();
		}
    };

	this.createStroke = function(ctr,  width,  height,  strokeWidth,  tlRad, blRad, brRad, trRad, material) {
		// create the geometry
		return RectangleStroke.create( ctr,  width, height, strokeWidth,  tlRad, blRad,  brRad, trRad, material);
	};

	this.createFill = function( ctr,  width,  height,  tlRad, blRad, brRad, trRad, material) {
		// create the geometry
		// special the (common) case of no rounded corners
		var prim;

		if ((tlRad <= 0) && (blRad <= 0) && (brRad <= 0) && (trRad <= 0)) {
			prim = RectangleGeometry.create( ctr, width, height, material );
        } else {
			prim = RectangleFill.create( ctr,  width, height,  tlRad, blRad,  brRad, trRad, material);
        }

		return prim;
	};

	this.collidesWithPoint = function( x, y ) {
		if(x < this._xOffset) return false;
		if(x > (this._xOffset + this._width)) return false;
		if(y < this._yOffset) return false;
		if(y > (this._yOffset + this._height)) return false;

		return true;
	};
	
    this.containsPoint = function( pt,  dir ) {
        var world = this.getWorld();
        if (!world)  throw( "null world in containsPoint" );
		
		// get a point on the plane of the circle
		// the point is in NDC, as is the input parameters
		var mat = this.getMatrix();
		var plane = [0,0,1,0];
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
	};

	this.getNearVertex = function( pt, dir ) {
        var world = this.getWorld();
        if (!world)  throw( "null world in getNearPoint" );
		
		// get a point on the plane of the circle
		// the point is in NDC, as is the input parameters
		var mat = this.getMatrix();
		var plane = [0,0,1,0];
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
			pt = [xMin, yMin, 0];
			dist = VecUtils.vecDist(2, pt, planePtNDC);
			var minPt = pt,  minDist = dist;
		
			pt = [xMin, yMax, 0];
			dist = VecUtils.vecDist(2, pt, planePtNDC);
			if (dist < minDist) {
				minDist = dist;
				minPt = pt;
			}

			pt = [xMax, yMax, 0];
			dist = VecUtils.vecDist(2, pt, planePtNDC);
			if (dist < minDist) {
				minDist = dist;
				minPt = pt;
			}
		
			pt = [xMax, yMin, 0];
			dist = VecUtils.vecDist(2, pt, planePtNDC);
			if (dist < minDist) {
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
		var objPt = [0,0,0];
		objPt[0] = -z*(r-l)/(2.0*zn)*x;
		objPt[1] = -z*(t-b)/(2.0*zn)*y;

		// re-apply the transform
		objPt = MathUtils.transformPoint( objPt, mat );

		return objPt;
	};
	
    this.getNearPoint = function( pt, dir ) {
        var world = this.getWorld();
        if (!world)  throw( "null world in getNearPoint" );
		
		// get a point on the plane of the circle
		// the point is in NDC, as is the input parameters
		var mat = this.getMatrix();
		var plane = [0,0,1,0];
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
        pt = [xMin, y, 0];
        if      (pt[1] < yMin)  pt[1] = yMin;
        else if (pt[1] > yMax)  pt[1] = yMax;
        dist = VecUtils.vecDist(2, pt, planePtNDC);
        var minPt = pt,  minDist = dist;

        pt = [x, yMax, 0];
        if      (pt[0] < xMin)  pt[0] = xMin;
        else if (pt[0] > xMax)  pt[0] = xMax;
        dist = VecUtils.vecDist(2, pt, planePtNDC);
        if (dist < minDist) {
            minDist = dist;
            minPt = pt;
        }

        pt = [xMax, y, 0];
        if      (pt[1] < yMin)  pt[1] = yMin;
        else if (pt[1] > yMax)  pt[1] = yMax;
        dist = VecUtils.vecDist(2, pt, planePtNDC);
        if (dist < minDist) {
            minDist = dist;
            minPt = pt;
        }

        pt = [x, yMin, 0];
        if      (pt[0] < xMin)  pt[0] = xMin;
        else if (pt[0] > xMax)  pt[0] = xMax;
        dist = VecUtils.vecDist(2, pt, planePtNDC);
        if (dist < minDist) {
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
		var objPt = [0,0,0];
		objPt[0] = -z*(r-l)/(2.0*zn)*x;
		objPt[1] = -z*(t-b)/(2.0*zn)*y;

		// re-apply the transform
		objPt = MathUtils.transformPoint( objPt, mat );

		return objPt;
    };


	 this.recalcTexMapCoords = function( vrts, uvs ) {
		var n = vrts.length/3;
		var ivrt = 0,  iuv = 0;

		for (var i=0;  i<n;  i++) {
			uvs[iuv] = 0.5*(vrts[ivrt]/this._rectWidth + 1);
			iuv++;  ivrt++;
			uvs[iuv] = 0.5*(vrts[ivrt]/this._rectHeight + 1);
			iuv++;  ivrt += 2;
		}
	 }
 };

var RectangleFill = {};
RectangleFill.create = function( rectCtr,  width, height, tlRad, blRad,  brRad, trRad,  material) {
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
	if (blRad <= 0){
		RectangleFill.pushVertex( x-hw, y-hh, z);
    } else {
		ctr = [x - hw + blRad,  y - hh + blRad, z];
		RectangleFill.getRoundedCorner( ctr,  [x-hw, y-hh+blRad, z],  this.vertices );
	}

	// do the bottom
	if (brRad <= 0) {
		RectangleFill.pushVertex( x+hw, y-hh, z);
    } else {
		ctr = [x + hw - brRad,  y - hh + brRad, z];
		RectangleFill.getRoundedCorner( ctr,  [x+hw-brRad, y-hh, z],  this.vertices );
	}

	// do the right
	if (trRad <= 0) {
		RectangleFill.pushVertex( x+hw, y+hh, z);
    } else {
		ctr = [x + hw - trRad,  y + hh - trRad, z];
		RectangleFill.getRoundedCorner( ctr,  [x+hw, y+hh-trRad, z],  this.vertices );
	}

	// do the top
	if (tlRad <= 0) {
		RectangleFill.pushVertex( x-hw, y+hh, z);
    } else {
		ctr = [x - hw + tlRad,  y + hh - tlRad, z];
		RectangleFill.getRoundedCorner( ctr,  [x-hw+tlRad, y+hh, z],  this.vertices );
	}

	// get the normals and uvs
	var vrt, uv;
	var xMin = x - hw,
		yMin = y - hh;
	var n = [0, 0, 1];
	var nVertices = this.vertices.length / 3;
	for (var i=0;  i<nVertices;  i++) {
		vrt = RectangleFill.getVertex(i);
		RectangleFill.pushNormal( n );
		uv  = RectangleFill.getUV(vrt[0], vrt[1], xMin, width, yMin, height);
		RectangleFill.pushUV( uv );
	}

	// build the triangles
	var nTriangles = nVertices - 2;
	var i = 1,  j = 2;
	for (var iTri=0;  iTri<nTriangles;  iTri++) {
		RectangleFill.pushIndices( 0, j, i );
		i++;
		j++;
	}

	//refine the mesh for vertex deformations
//	if (material) {
//		if (material.hasVertexDeformation()) {
//			var paramRange = material.getVertexDeformationRange();
//			var tolerance = material.getVertexDeformationTolerance();
//			nVertices = ShapePrimitive.refineMesh( this.vertices, this.normals, this.uvs, this.indices, nVertices,  paramRange,  tolerance );
//		}
//	}

	// create the RDGE primitive
	return ShapePrimitive.create(this.vertices, this.normals, this.uvs, this.indices, g_Engine.getContext().renderer.TRIANGLES, nVertices);
};

RectangleFill.pushVertex = function( x, y, z ) {
	this.vertices.push( x );
	this.vertices.push( y );
	this.vertices.push( z );
};

RectangleFill.pushNormal = function( n ) {
	this.normals.push( n[0] );
	this.normals.push( n[1] );
	this.normals.push( n[2] );
};

RectangleFill.pushUV = function( uv ) {
	this.uvs.push( uv[0] );
	this.uvs.push( uv[1] );
};

RectangleFill.pushIndices = function( i, j, k ) {
	this.indices.push( i );
	this.indices.push( j );
	this.indices.push( k );
};

RectangleFill.getVertex = function( index ) {
	var i = 3*index;
	return [ this.vertices[i],  this.vertices[i+1],  this.vertices[i+2] ];
};

RectangleFill.getUV = function( x, y, xMin, w, yMin, h) {
	var u = (x - xMin)/w,
		v = (y - yMin)/h;

	var uv = [ u, v ];
	return uv;
};

RectangleFill.getRoundedCorner = function(ctr, startPt,  vertices) {
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
	for (var i=0;  i<nSegs;  i++) {
		pt0 = MathUtils.transformPoint( pt0, mat );
		RectangleFill.pushVertex(pt0[0], pt0[1], 0.0 );
	}
};


var RectangleStroke = {};
RectangleStroke.create = function( rectCtr,  width, height, strokeWidth,  tlRad, blRad,  brRad, trRad, material) {
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
	if (tlRad == 0) {
		RectangleStroke.pushVertex( x-hw+sw, y+hh-sw, z);
		RectangleStroke.pushVertex( x-hw,    y+hh,    z);
	} else {
		if (tlRad > sw) {
			RectangleStroke.pushVertex( x-hw+sw, y+hh-tlRad, z);
			RectangleStroke.pushVertex( x-hw,    y+hh-tlRad, z);
		} else {
			RectangleStroke.pushVertex( x-hw+tlRad, y+hh-tlRad, z);
			RectangleStroke.pushVertex( x-hw,       y+hh-tlRad, z);
			RectangleStroke.pushVertex( x-hw+sw,    y+hh-sw,    z);
			RectangleStroke.pushVertex( x-hw,       y+hh-sw,    z);
		}
	}

	// get the left side
	if (blRad == 0) {
		RectangleStroke.pushVertex( x-hw+sw, y-hh+sw, z);
		RectangleStroke.pushVertex( x-hw,    y-hh,    z);
	} else {
		if (blRad >= sw) {
			RectangleStroke.pushVertex( x-hw+sw, y-hh+blRad, z);
			RectangleStroke.pushVertex( x-hw,    y-hh+blRad, z);
			var ctr		 =	[x-hw+blRad,  y-hh+blRad, z],
				insidePt =	[x-hw+sw,     y-hh+blRad, z],
				outsidePt = [x-hw,        y-hh+blRad, z];
			RectangleStroke.getRoundedCorner( ctr, insidePt,  outsidePt,  this.vertices );
		} else {
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
	if (brRad == 0) {
		RectangleStroke.pushVertex( x+hw-sw, y-hh+sw, z);
		RectangleStroke.pushVertex( x+hw,    y-hh,    z);
	} else {
		RectangleStroke.pushVertex( x+hw-brRad,    y-hh+sw, z);
		RectangleStroke.pushVertex( x+hw-brRad,    y-hh,    z);
		if (brRad >= sw) {
			var ctr		 =	[x+hw-brRad,  y-hh+brRad, z],
				insidePt =	[x+hw-brRad,  y-hh+sw,    z],
				outsidePt = [x+hw-brRad,  y-hh,       z];
			RectangleStroke.getRoundedCorner( ctr, insidePt,  outsidePt,  this.vertices );
		} else {
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
	if (trRad == 0) {
		RectangleStroke.pushVertex( x+hw-sw, y+hh-sw, z);
		RectangleStroke.pushVertex(    x+hw,    y+hh, z);
	} else {
		if (trRad >= sw) {
			RectangleStroke.pushVertex( x+hw-sw,  y+hh-trRad, z);
			RectangleStroke.pushVertex( x+hw,     y+hh-trRad, z);
			var ctr		 =	[x+hw-trRad,  y+hh-trRad, z],
				insidePt =	[x+hw-sw,     y+hh-trRad, z],
				outsidePt = [x+hw,        y+hh-trRad, z];
			RectangleStroke.getRoundedCorner( ctr, insidePt,  outsidePt,  this.vertices );
		} else {
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
	if (tlRad == 0) {
		RectangleStroke.pushVertex( x-hw+sw,  y+hh-sw, z);
		RectangleStroke.pushVertex( x-hw,     y+hh,    z);
	} else {
		if (tlRad >= sw) {
			RectangleStroke.pushVertex( x-hw+tlRad,  y+hh-sw, z);
			RectangleStroke.pushVertex( x-hw+tlRad,  y+hh,    z);
			var ctr		 =	[x-hw+tlRad,  y+hh-tlRad, z],
				insidePt =	[x-hw+tlRad,  y+hh-sw, z],
				outsidePt = [x-hw+tlRad,  y+hh, z];
			RectangleStroke.getRoundedCorner( ctr, insidePt,  outsidePt,  this.vertices );
		} else {
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
	for (var i=0;  i<nVertices;  i++) {
		vrt = RectangleStroke.getVertex(i);
		RectangleStroke.pushNormal( n );
		uv  = RectangleStroke.getUV(vrt[0], vrt[1], xMin, width, yMin, height);
		RectangleStroke.pushUV( uv );
	}

	// build the triangles
	var nTriangles = nVertices - 2;
	var i = 0,  j = 1, k = 2;
	var reverse = false;
	for (var iTri=0;  iTri<nTriangles;  iTri++) {
		// we created a triangle strip, so each sequential triangle has the opposite orientation than its predecessor
		if (!reverse) {
			RectangleStroke.pushIndices( k, j, i );
        } else {
			RectangleStroke.pushIndices( i, j, k );
        }

		reverse = !reverse;

		i++;
		j++;
		k++;
	}

	//refine the mesh for vertex deformations
//	if (material) {
//		if (material.hasVertexDeformation()) {
//			var paramRange = material.getVertexDeformationRange();
//			var tolerance = material.getVertexDeformationTolerance();
//			nVertices = ShapePrimitive.refineMesh( this.vertices, this.normals, this.uvs, this.indices, nVertices,  paramRange,  tolerance );
//		}
//	}

	// create the RDGE primitive
	return ShapePrimitive.create(this.vertices, this.normals, this.uvs, this.indices, g_Engine.getContext().renderer.TRIANGLES, nVertices);
};

RectangleStroke.getRoundedCorner = function( ctr, insidePt, outsidePt ) {
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
	for (var i=0;  i<nSegs;  i++) {
		pt0 = MathUtils.transformPoint( pt0, mat );
		pt1 = MathUtils.transformPoint( pt1, mat );

		RectangleStroke.pushVertex(pt0[0], pt0[1], 0.0 );
		RectangleStroke.pushVertex(pt1[0], pt1[1], 0.0 );
	}
};

RectangleStroke.pushVertex	= RectangleFill.pushVertex;
RectangleStroke.pushNormal	= RectangleFill.pushNormal;
RectangleStroke.pushUV		= RectangleFill.pushUV;
RectangleStroke.pushIndices	= RectangleFill.pushIndices;
RectangleStroke.getVertex	= RectangleFill.getVertex;
RectangleStroke.getUV		= RectangleFill.getUV;

var RectangleGeometry = {};
RectangleGeometry.create = function( ctr,  width, height, material ) {
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

	//refine the mesh for vertex deformations
//	if (material)
//	{
//		if (material.hasVertexDeformation())
//		{
//			var paramRange = material.getVertexDeformationRange();
//			var tolerance = material.getVertexDeformationTolerance();
//			nVertices = ShapePrimitive.refineMesh( this.vertices, this.normals, this.uvs, this.indices, nVertices,  paramRange,  tolerance );
//		}
//	}

	// create the RDGE primitive
	return ShapePrimitive.create(this.vertices, this.normals, this.uvs, this.indices, g_Engine.getContext().renderer.TRIANGLES, nVertices);
};

RectangleGeometry.pushVertex	= RectangleFill.pushVertex;
RectangleGeometry.pushNormal	= RectangleFill.pushNormal;
RectangleGeometry.pushUV		= RectangleFill.pushUV;
RectangleGeometry.pushIndices	= RectangleFill.pushIndices;
RectangleGeometry.getVertex		= RectangleFill.getVertex;
RectangleGeometry.getUV			= RectangleFill.getUV;


Rectangle.prototype = new GeomObj();

if (typeof exports === "object") {
    exports.Rectangle = Rectangle;
}



