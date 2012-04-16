/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var GeomObj =           require("js/lib/geom/geom-obj").GeomObj;
var ShapePrimitive =    require("js/lib/geom/shape-primitive").ShapePrimitive;
var MaterialsModel = require("js/models/materials-model").MaterialsModel;
///////////////////////////////////////////////////////////////////////
// Class GLLine
//      GL representation of a line.
//      Derived from class GeomObj
///////////////////////////////////////////////////////////////////////
var Line = function GLLine( world, xOffset, yOffset, width, height, slope, strokeSize, strokeColor, strokeMaterial, strokeStyle, xAdj, yAdj) {
	///////////////////////////////////////////////////////////////////////
	// Instance variables
	///////////////////////////////////////////////////////////////////////
	this._width = 2.0;
	this._height = 2.0;
	this._xOffset = 0;
	this._yOffset = 0;

	// If line doesn't fit in canvas world, we had to grow the canvas by this much on either side
	this._xAdj = 0;
	this._yAdj = 0;
	
	this._slope = 0;

	this._strokeWidth = 0.25;

	this._strokeStyle = "Solid";
	this._scaleX = 1.0;
	this._scaleY = 1.0;

	if (arguments.length > 0) {
		this._width = width;
		this._height = height;
		this._xOffset = xOffset;
		this._yOffset = yOffset;

		this._xAdj = xAdj;
		this._yAdj = yAdj;

		this._slope = slope;
		this._strokeWidth = strokeSize;
		this._strokeColor = strokeColor;

		this._strokeStyle = strokeStyle;
		this._scaleX = (world.getViewportWidth())/(world.getViewportHeight());
	}

	this._strokeVerticesLen = 0;

	this.m_world = world;

	this._materialAmbient  = [0.2, 0.2, 0.2,  1.0];
	this._materialDiffuse  = [0.4, 0.4, 0.4,  1.0];
	this._materialSpecular = [0.4, 0.4, 0.4,  1.0];

	if(strokeMaterial) {
		this._strokeMaterial = strokeMaterial;
	}

	///////////////////////////////////////////////////////////////////////
	// Property Accessors
	///////////////////////////////////////////////////////////////////////
	this.getStrokeWidth		= function()		{  return this._strokeWidth;	}
	this.setStrokeWidth		= function(w)		{  this._strokeWidth = w;		}

	this.getStrokeMaterial	= function()		{  return this._strokeMaterial;	}
	this.setStrokeMaterial	= function(m)		{  this._strokeMaterial = m;	}

	this.getStrokeColor		= function()		{  return this._strokeColor;	}
	//this.setStrokeColor	= function(c)		{  this._strokeColor = c;		}

	this.getStrokeStyle		= function()		{  return this._strokeStyle;	}
	this.setStrokeStyle		= function(s)		{  this._strokeStyle = s;		}

	this.getFillMaterial	= function()		{  return null;		}
	
	this.setStrokeMaterial  = function(m)		 {  this._strokeMaterial = m;		 }
	this.getStrokeMaterial	= function()		{  return this._strokeMaterial;		}

	this.getWidth			= function()		{  return this._width;				}
	this.setWidth			= function(w)		{  this._width = w;					}

	this.getHeight			= function()		{  return this._height;				}
	this.setHeight			= function(h)		{  this._height = h;				}

	this.getXAdj			= function()		{  return this._xAdj;			}
	this.setXAdj            = function(x)		{  this._xAdj = x;				}

	this.getYAdj			= function()		{  return this._yAdj;			}
	this.setYAdj            = function(y)		{  this._yAdj = y;				}

	this.getSlope			= function()		{  return this._slope;			}
	this.setSlope            = function(m)		{  this._slope = m;				}

	this.geomType	= function()				{  return this.GEOM_TYPE_LINE;	}

	///////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////
	this.exportJSON = function()
	{
		var jObj = 
		{
			'type'			: this.geomType(),
			'xoff'			: this._xOffset,
			'yoff'			: this._yOffset,
			'width'			: this._width,
			'height'		: this._height,
			'xAdj'		    : this._xAdj,
			'yAdj'		    : this._yAdj,
			'slope'	        : this._slope,
			'strokeWidth'	: this._strokeWidth,
			'strokeColor'	: this._strokeColor,
			'strokeStyle'	: this._strokeStyle,
			'strokeMat'		: this._strokeMaterial ? this._strokeMaterial.getName() : MaterialsModel.getDefaultMaterialName(),
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
		this._xAdj			    = jObj.xAdj;
		this._yAdj			    = jObj.yAdj;
		this._strokeWidth		= jObj.strokeWidth;
		this._slope 		    = jObj.slope;
		this._strokeStyle		= jObj.strokeStyle;
		this._strokeColor		= jObj.strokeColor;
		var strokeMaterialName	= jObj.strokeMat;

        var strokeMat = MaterialsModel.getMaterial( strokeMaterialName );
        if (!strokeMat) {
            console.log( "object material not found in library: " + strokeMaterialName );
            strokeMat = MaterialsModel.getMaterial(  MaterialsModel.getDefaultMaterialName() );
        }
        this._strokeMaterial = strokeMat;

		this.importMaterialsJSON( jObj.materials );
	};

	///////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////
	this.buildBuffers = function()  {
		// get the world
		var world = this.getWorld();
		if (!world)  throw( "null world in buildBuffers" );
		if (!world._useWebGL)  return;
		
		// make sure RDGE has the correct context
		RDGE.globals.engine.setContext( world.getCanvas().rdgeid );

		 // create the gl buffer
		var gl = world.getGLContext();

		this._strokeVerticesLen = 0;

		var strokeVertices = [];
		var strokeTextures = [];
		var strokeNormals = [];
		var strokeColors = [];

//        var scaleMat = Matrix.I(3);
//        scaleMat.elements[0][0] = this._scaleX;
//        scaleMat.elements[1][1] = this._scaleY;


        // get the normalized device coordinates (NDC) for
		// all position and dimensions.
		var	vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
		var	xNDC = 2*this._xOffset/vpw,  yNDC = 2*this._yOffset/vph,
			xFillNDC = this._width/vpw,  yFillNDC = this._height/vph,
			xAdjNDC = this._xAdj/vpw,  yAdjNDC = this._yAdj/vph,
			xStrokeNDC = this._strokeWidth/vpw,  yStrokeNDC = this._strokeWidth/vph;

		var aspect = world.getAspect();
		var zn = world.getZNear(),  zf = world.getZFar();
		var	t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),
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

		// get the x & y stroke size
		var xStroke = -z*(r-l)/(2.0*zn)*xStrokeNDC,
			yStroke = -z*(t-b)/(2.0*zn)*yStrokeNDC;

		// get the x & y adjustments size
		var xAdj = -z*(r-l)/(2.0*zn)*xAdjNDC*2,
			yAdj = -z*(t-b)/(2.0*zn)*yAdjNDC*2;


		this._primArray = [];
		this._materialArray = [];
		this._materialTypeArray = [];
		this._materialNodeArray = [];
		
		this._scaleX = (world._viewportWidth)/(world._viewportHeight);
		
		var innerX = xFill-xStroke;
		var innerY = yFill-yStroke;

		if(this._slope === "vertical") {
			strokeVertices = [
				-xFill+x, yFill+y,  0.0,
				xFill+x, yFill+y,  0.0,
				-xFill+x, -yFill+y,  0.0,

				xFill+x, -yFill+y,  0.0,
				-xFill+x, -yFill+y,  0.0,
				xFill+x, yFill+y,  0.0
			];

			strokeTextures = [
				0, 1,
				1, 1,
				0, 0,

				1, 0,
				0, 0,
				1, 1
			];
		} else if(this._slope === "horizontal") {
			// right now, this is the same as vertical line because,
			// our canvas is the same size as us.
			// But, we will need to use this when drawing in an existing GLWorld with other shapes
			strokeVertices = [
				-xFill+x, yFill+y,  0.0,
				xFill+x, yFill+y,  0.0,
				-xFill+x, -yFill+y,  0.0,

					xFill+x, -yFill+y,  0.0,
				-xFill+x, -yFill+y,  0.0,
				xFill+x, yFill+y,  0.0
			];

			strokeTextures = [
				0, 1,
				1, 1,
				0, 0,

				1, 0,
				0, 0,
				1, 1
			];
		} else if(this._slope > 0) {
			// if slope is positive, draw a line from top-left to bottom-right
			strokeVertices = [
				-xFill+x, yFill-2*yAdj+y,  0.0,
				-xFill+2*xAdj+x, yFill+y,  0.0,
				xFill-2*xAdj+x, -yFill+y,  0.0,

				xFill+x, -yFill+2*yAdj+y,  0.0,
				xFill-2*xAdj+x, -yFill+y,  0.0,
				-xFill+2*xAdj+x, yFill+y,  0.0
			];

			strokeTextures = [
				0, 0,
				0, 1,
				1, 0,

				1, 1,
				1, 0,
				0, 1
			];
		} else {
			// else slope is negative, draw a line from bottom-left to top-right
			strokeVertices = [
				xFill-2*xAdj+x, yFill+y,  0.0,
				-xFill+2*xAdj+x, -yFill+y,  0.0,
				-xFill+x, -yFill+2*yAdj+y,  0.0,

				-xFill+2*xAdj+x, -yFill+y,  0.0,
				xFill-2*xAdj+x, yFill+y,  0.0,
				xFill+x, yFill-2*yAdj+y,  0.0
			];
	
			strokeTextures = [
				1, 1,
				0, 0,
				0, 1,

				0, 0,
				1, 1,
				1, 0
			];
		}
		
		var z = 0;
		var indices = [];
		var nVerts = strokeVertices.length/3;

		// stroke normals
		var index = 0;
		for (var i=0;  i<nVerts;  i++) {
			// push a normal for each vertex in the stroke
			strokeNormals.push(0.0);  strokeNormals.push(0.0);  strokeNormals.push(1);
			indices.push( index );  index++;
		}

		var prim = ShapePrimitive.create(strokeVertices, strokeNormals, strokeTextures, indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, indices.length);

		var strokeMaterial = this.makeStrokeMaterial();

		this._primArray.push( prim );
		this._materialNodeArray.push( strokeMaterial.getMaterialNode() );

		world.updateObject(this);
	};

	this.render = function() {
		// get the world
		var world = this.getWorld();
		if (!world)  throw( "null world in rectangle render" );

		 // get the context
		var ctx = world.get2DContext();
		if (!ctx)  return;
	
		// set up the stroke style
		var lineWidth = this._strokeWidth,
            w = this._width,
            h = this._height;

        var c,
            gradient,
            colors,
            len,
            n,
            position,
            cs;

		ctx.beginPath();
		ctx.lineWidth	= lineWidth;
		if (this._strokeColor) {
            if(this._strokeColor.gradientMode) {
                if(this._strokeColor.gradientMode === "radial") {
                    gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w/2, h/2));
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

			// get the points
			var p0,  p1;
			if(this._slope === "vertical") {
				p0 = [0.5*w, 0];
				p1 = [0.5*w, h];
			} else if(this._slope === "horizontal") {
				p0 = [0, 0.5*h];
				p1 = [w, 0.5*h];
			} else if(this._slope > 0) {
				p0 = [this._xAdj, this._yAdj];
				p1 = [w - this._xAdj,  h - this._yAdj];
			} else {
				p0 = [this._xAdj, h - this._yAdj];
				p1 = [w - this._xAdj,  this._yAdj];
			}
			
			// draw the line
			ctx.moveTo( p0[0],  p0[1] );
			ctx.lineTo( p1[0],  p1[1] );
			ctx.stroke();
		}
	};

	/*
	// type is Dotted or Dashed
	this.createStippledStrokes = function(strokeVertices, strokeSize, slope, type, innerX, innerY)
	{
		var stippleLength = strokeSize;

		if (type === "Dotted")
		{
			stippleLength = this.DOT_LENGTH;
		}
		else if(type === "Dashed")
		{
			stippleLength = this.DASH_LENGTH;
		}

		var numStrokes = 0;
		var startPos = -innerX;
		var endPos = innerX;

		var gap = this.GAP_LENGTH;
		if(slope === "horizontal")
		{
			gap *= this._scaleX;
			stippleLength *= this._scaleX;
		}
		else if(slope === "vertical")
		{
			startPos = -innerY;
			endPos = innerY;
		}
		else
		{
			if(this._scaleX < 1)
			{
				startPos = -innerY;
				endPos = innerY;
				strokeSize = (strokeSize*this._scaleX)/2;
//                strokeSize *= this._scaleX;
				stippleLength *= this._scaleX;
			}
			else
			{
				strokeSize = strokeSize/2;
				gap *= this._scaleX;
				stippleLength *= this._scaleX;
			}

		}

		while(startPos + stippleLength < endPos)
		{
			if(slope === "horizontal")
			{
				strokeVertices.push(startPos); strokeVertices.push(-strokeSize); strokeVertices.push(0);
				strokeVertices.push(startPos); strokeVertices.push(strokeSize); strokeVertices.push(0);
				strokeVertices.push(startPos+stippleLength); strokeVertices.push(-strokeSize); strokeVertices.push(0);

				strokeVertices.push(startPos); strokeVertices.push(strokeSize); strokeVertices.push(0);
				strokeVertices.push(startPos+stippleLength); strokeVertices.push(-strokeSize); strokeVertices.push(0);
				strokeVertices.push(startPos+stippleLength); strokeVertices.push(strokeSize); strokeVertices.push(0);
			}
			else if(slope === "vertical")
			{
				strokeVertices.push(-strokeSize); strokeVertices.push(startPos); strokeVertices.push(0);
				strokeVertices.push(strokeSize); strokeVertices.push(startPos); strokeVertices.push(0);
				strokeVertices.push(-strokeSize); strokeVertices.push(startPos+stippleLength); strokeVertices.push(0);

				strokeVertices.push(strokeSize); strokeVertices.push(startPos); strokeVertices.push(0);
				strokeVertices.push(-strokeSize); strokeVertices.push(startPos+stippleLength); strokeVertices.push(0);
				strokeVertices.push(strokeSize); strokeVertices.push(startPos+stippleLength); strokeVertices.push(0);
			}
			else
			{
				strokeVertices.push(startPos); strokeVertices.push(startPos*-slope-strokeSize); strokeVertices.push(0);
				strokeVertices.push(startPos); strokeVertices.push(startPos*-slope+strokeSize); strokeVertices.push(0);
				strokeVertices.push(startPos+stippleLength); strokeVertices.push((startPos+stippleLength)*-slope-strokeSize); strokeVertices.push(0);

				strokeVertices.push(startPos); strokeVertices.push(startPos*-slope+strokeSize); strokeVertices.push(0);
				strokeVertices.push(startPos+stippleLength); strokeVertices.push((startPos+stippleLength)*-slope-strokeSize); strokeVertices.push(0);
				strokeVertices.push(startPos+stippleLength); strokeVertices.push((startPos+stippleLength)*-slope+strokeSize); strokeVertices.push(0);
			}

			numStrokes += 6;

			startPos += (stippleLength+gap);
		}
//
		return numStrokes;
	}
	*/

	this.collidesWithPoint = function( x, y ) {
		if(x < this._xOffset) return false;
		if(x > (this._xOffset + this._width)) return false;
		if(y < this._yOffset) return false;
		if(y > (this._yOffset + this._height)) return false;

		return true;
	}
 };

Line.prototype = new GeomObj();

if (typeof exports === "object") {
    exports.Line = Line;
}

