/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var GeomObj =           require("js/lib/geom/geom-obj").GeomObj;
var ShapePrimitive =    require("js/lib/geom/shape-primitive").ShapePrimitive;
var MaterialsModel = require("js/models/materials-model").MaterialsModel;
///////////////////////////////////////////////////////////////////////
// Class GLCircle
//      GL representation of a circle.
//      Derived from class GLGeomObj
//		The position and dimensions of the stroke, fill, and inner Radius should be in pixels
///////////////////////////////////////////////////////////////////////
var Circle = function GLCircle() {

	this.init = function( world, xOffset, yOffset, width, height, strokeSize, strokeColor, fillColor, innerRadius, strokeMaterial, fillMaterial, strokeStyle) {
		///////////////////////////////////////////////////////////////////////
		// Instance variables
		///////////////////////////////////////////////////////////////////////
		this._width = 2.0;
		this._height = 2.0;
		this._xOffset = 0;
		this._yOffset = 0;

		this._radius = 2.0;
		this._strokeWidth = 0.25;
		this._innerRadius = 0;

		this._ovalHeight = this._ovalHeight = 2.0 * this._radius;

		this._strokeStyle = "Solid";

		this._aspectRatio = 1.0;

		if (arguments.length > 0) {
			this._width = width;
			this._height = height;
			this._xOffset = xOffset;
			this._yOffset = yOffset;
        
			this._strokeWidth = strokeSize;
			this._innerRadius = innerRadius;
			this._strokeColor = strokeColor;
			this._fillColor = fillColor;

			this._strokeStyle = strokeStyle;

			this._matrix = Matrix.I(4);
			//this._matrix[12] = xOffset;
			//this._matrix[13] = yOffset;
		}

		this.m_world = world;

		if(strokeMaterial){
			this._strokeMaterial = strokeMaterial;
        } else {
			this._strokeMaterial = MaterialsModel.getMaterial( MaterialsModel.getDefaultMaterialName() );
        }

		if(fillMaterial) {
			this._fillMaterial = fillMaterial;
        } else {
			this._fillMaterial = MaterialsModel.getMaterial(  MaterialsModel.getDefaultMaterialName() );
        }
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

	this.getRadius = function() {
        return this._radius;
    };

	this.setRadius = function(r) {
        this._radius = r;
    };

	this.getWorld = function() {
        return this._world;
    };

	this.setWorld = function(w) {
        this._world = w;
    };

    this.getInnerRadius = function() {
        return this._innerRadius;
    };

	this.setInnerRadius = function(r) {
        this._innerRadius = r;
    };

    this.getStrokeStyle	= function() {
        return this._strokeStyle;
    };
	this.setStrokeStyle	= function(s) {
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
        return this.GEOM_TYPE_CIRCLE;
    };

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////
	// update the "color of the material
    this.getFillColor = function()
	{
		return this._fillColor;
	}
	
//	this.setFillColor = function(c)
//	{
//		this._fillColor = c;
//	}

    this.getStrokeColor	= function()
	{
		return this._strokeColor;
	}
	
//	this.setStrokeColor	= function(c)
//	{
//		this._strokeColor = c;
//	}
    ///////////////////////////////////////////////////////////////////////

	this.buildBuffers = function() {
        // get the world
        var world = this.getWorld();
        if (!world)  throw( "null world in buildBuffers" );

		if (!world._useWebGL)  return;
		
		// make sure RDGE has the correct context
		RDGE.globals.engine.setContext( world.getCanvas().rdgeid );

         // create the gl buffer
        var gl = world.getGLContext();

        // determine the number of triangles to generate
        var nTriangles = 60;        // yes, we will do better than this

		// get the normalized device coordinates (NDC) for
		// all position and dimensions.
		var	vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
		var	xNDC = 2*this._xOffset/vpw,  yNDC = -2*this._yOffset/vph,
			xRadNDC = this._width/vpw,  yRadNDC = this._height/vph,
			xStrokeNDC = 2*this._strokeWidth/vpw,  yStrokeNDC = 2*this._strokeWidth/vph,
			xInnRadNDC = this._innerRadius*xRadNDC,  yInnRadNDC = this._innerRadius*yRadNDC;

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

		// get the x and y radii
		var xRad = -z*(r-l)/(2.0*zn)*xRadNDC,
			yRad = -z*(t-b)/(2.0*zn)*yRadNDC;

		// save the overall dimensions to be used in the uv calculations
		this._ovalWidth = xRad;  this._ovalHeight = yRad;

		// get the x & y stroke size
		var xStroke = -z*(r-l)/(2.0*zn)*xStrokeNDC,
			yStroke = -z*(t-b)/(2.0*zn)*yStrokeNDC;

		// get the inner radius
		var xInnRad = -z*(r-l)/(2.0*zn)*xInnRadNDC,
			yInnRad = -z*(t-b)/(2.0*zn)*yInnRadNDC;
        
		// get a matrix to rotate a point around the circle
        var angle = 2.0 * Math.PI/Number(nTriangles);
        var mat = Matrix.RotationZ( angle );
		var reverseRotMat = Matrix.RotationZ( -angle );

		// calculate matrices to scale the circle and stroke to fit the bounds of the ellipse
		var strokeScaleMat = Matrix.I(4);
		strokeScaleMat[0] = xRad;
		strokeScaleMat[5] = yRad;

		var fillScaleMat = Matrix.I(4);
		fillScaleMat[0] = xRad - xStroke;
		fillScaleMat[5] = yRad - yStroke;

		var innerRadiusScaleMat = Matrix.I(4);
		innerRadiusScaleMat[0] = xInnRad;
		innerRadiusScaleMat[5] = yInnRad;

		var innerStrokeScaleMat = Matrix.I(4);
		innerStrokeScaleMat[0] = xInnRad - xStroke;
		innerStrokeScaleMat[5] = yInnRad - yStroke;

		var fillPrim,  strokePrim0,  strokePrim1;
		var fillMaterial,  strokeMaterial0,  strokeMaterial2;

        this._primArray = [];
        this._materialArray = [];
		this._materialTypeArray = [];
	    this._materialNodeArray = [];

        /////////////////////////////////////////////////////////////
        // Strokes
        if(this._strokeWidth > 0) {
            var numStrokes = 1;
            if(this._innerRadius !== 0) {
                strokePrim0 = this.generateOvalRing(x, y, reverseRotMat, innerStrokeScaleMat, innerRadiusScaleMat, nTriangles);
            }

            strokePrim1 = this.generateOvalRing(x, y, reverseRotMat, fillScaleMat, strokeScaleMat, nTriangles);
        }
        
		/////////////////////////////////////////////////////////////
		//  Fill
        if(this._innerRadius === 0) {
            fillPrim = this.generateOval(x, y, mat, fillScaleMat, nTriangles);
        } else {
            fillPrim = this.generateOvalRing(x, y, reverseRotMat, innerRadiusScaleMat, fillScaleMat, nTriangles);
        }

		if (fillPrim) {
            fillMaterial = this.makeFillMaterial();

            this._primArray.push( fillPrim );
            this._materialNodeArray.push( fillMaterial.getMaterialNode() );
		}

		if (strokePrim0) {
            strokeMaterial0 = this.makeStrokeMaterial();

            this._primArray.push( strokePrim0 );
            this._materialNodeArray.push( strokeMaterial0.getMaterialNode() );
		}

		if (strokePrim1) {
            strokeMaterial2 = this.makeStrokeMaterial();

            this._primArray.push( strokePrim1 );
            this._materialNodeArray.push( strokeMaterial2.getMaterialNode() );
		}

        world.updateObject(this);
    };

    this.generateOval = function(xOff, yOff, rotationMat, scaleMat, nTriangles) {
        var pt = [1.0, 0.0, 0.0];
        //var pts = scaleMat.multiply(pt);
		var pts = glmat4.multiplyVec3( scaleMat, pt, []);
        var x = pts[0],  y = pts[1], z = 0;
        var xs = scaleMat[0], ys = scaleMat[4];

		var	vrts = [], nrms = [], uvs = [], indices = [];
		var index = 0;
        for (var i=0;  i<nTriangles;  i++) {
            //pt = rotationMat.multiply( pt );
            //pts = scaleMat.multiply(pt);
            glmat4.multiplyVec3( rotationMat, pt );
            glmat4.multiplyVec3( scaleMat, pt, pts );

            // push the 3 vertices for the next triangle
            vrts.push(pts[0]+xOff);
            vrts.push(pts[1]+yOff);
            vrts.push(z);

			vrts.push(x+xOff);
            vrts.push(y+yOff);
            vrts.push(z);

            vrts.push(xOff);
            vrts.push(yOff);
            vrts.push(z);

            // push a texture coordinate pair for each vertex
            uvs.push(0.5);
            uvs.push(0.5);
            uvs.push(x/(2.0 * xs) + 0.5,  y/(2.0 * ys) + 0.5);
            uvs.push(pts[0]/(2.0 * xs) + 0.5, pts[1]/(2.0 * ys) + 0.5);

            // push a normal for each vertex
            nrms.push(0.0);
            nrms.push(0.0);
            nrms.push(1);
            nrms.push(0.0);
            nrms.push(0.0);
            nrms.push(1);
            nrms.push(0.0);
            nrms.push(0.0);
            nrms.push(1);

            x = pts[0];  y = pts[1];

			indices[index] = index++;
			indices[index] = index++;
			indices[index] = index++;
        }

		this.recalcTexMapCoords( vrts, uvs );

		return ShapePrimitive.create(vrts, nrms, uvs, indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, index);
    };

    this.generateOvalRing = function(xOff, yOff, rotationMat, innerScaleMat, outerScaleMat, nTriangles) {
        var pt = [1.0, 0.0, 0.0];

		var z = 0;
		var pt0s,  pt1s;
        //pt0s = innerScaleMat.multiply(pt);
        //pt1s = outerScaleMat.multiply(pt);
        pt0s = glmat4.multiplyVec3(innerScaleMat, pt, []);
        pt1s = glmat4.multiplyVec3(outerScaleMat, pt, []);

		var	vrts = [], nrms = [], uvs = [], indices = [];

        // normals
        var insideAngle  = -15.0*Math.PI/180.0,
            outsideAngle =  15.0*Math.PI/180.0;
        var cs1 = Math.cos(insideAngle),  sn0 = Math.sin(insideAngle),
            cs0 = Math.cos(outsideAngle), sn1 = Math.sin(outsideAngle);
        var nrm0 = [-sn0, 0,  cs0],
            nrm1 = [-sn1, 0,  cs1];
        
        var index = 0;
        vrts.push( pt0s[0]+xOff);  vrts.push(pt0s[1]+yOff);  vrts.push(z);
        vrts.push( pt1s[0]+xOff);  vrts.push(pt1s[1]+yOff);  vrts.push(z);
        uvs.push(0.5*pt0s[0] + 0.5);  uvs.push(0.5*pt0s[1] + 0.5);
        uvs.push(0.5*pt1s[0] + 0.5);  uvs.push(0.5*pt1s[1] + 0.5);
        nrms.push( nrm0[0] );  nrms.push(nrm0[1] );  nrms.push(nrm0[2] );
        nrms.push( nrm1[0] );  nrms.push(nrm1[1] );  nrms.push(nrm1[2] );
        indices[index] = index++;
        indices[index] = index++;

        for (var i=0;  i<nTriangles;  i++) {
            pt   = glmat4.multiplyVec3( rotationMat, pt );
            glmat4.multiplyVec3( innerScaleMat, pt, pt0s );
            glmat4.multiplyVec3( outerScaleMat, pt, pt1s );

            // vertices
            vrts.push( pt0s[0]+xOff);  vrts.push(pt0s[1]+yOff);  vrts.push(z);
            vrts.push( pt1s[0]+xOff);  vrts.push(pt1s[1]+yOff);  vrts.push(z);

            // textures
            uvs.push(0.5*pt0s[0] + 0.5);  uvs.push(0.5*pt0s[1] + 0.5);
            uvs.push(0.5*pt1s[0] + 0.5);  uvs.push(0.5*pt1s[1] + 0.5);

            // normals
            glmat4.multiplyVec3( rotationMat, nrm0 );
            glmat4.multiplyVec3( rotationMat, nrm1 );
            nrms.push( nrm0[0]);  nrms.push(nrm0[1]);  nrms.push(nrm0[2] );
            nrms.push( nrm1[0]);  nrms.push(nrm1[1]);  nrms.push(nrm1[2] );
			indices[index] = index++;
			indices[index] = index++;
        }

		this.recalcTexMapCoords( vrts, uvs );

		return ShapePrimitive.create(vrts, nrms, uvs, indices, RDGE.globals.engine.getContext().renderer.TRIANGLE_STRIP, indices.length);
    };

    this.render = function() {
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
		var innerRad  = this.getInnerRadius();
		var xScale = 0.5*this._width - lineWidth,
			yScale = 0.5*this._height - lineWidth;

		// translate
		var xCtr = 0.5*world.getViewportWidth() + this._xOffset,
			yCtr = 0.5*world.getViewportHeight() + this._yOffset;
		//ctx.setTransform( xScale, 0.0,  0.0, yScale, xCtr, yCtr );
		var mat = Matrix.create( [
							[ xScale,     0.0,  0.0,  xCtr],
							[    0.0,  yScale,  0.0,  yCtr],
							[    0.0,     0.0,  1.0,   0.0],
							[    0.0,     0.0,  0.0,   1.0]
						] );

		// get a bezier representation of the circle
		var bezPts = MathUtils.circularArcToBezier( [0,0,0], [1,0,0], 2.0*Math.PI );
		if (bezPts) {
			var n = bezPts.length;
            var gradient,
                colors,
                len,
                j,
                position,
                cs,
                c;

			// set up the fill style
			ctx.beginPath();
			ctx.lineWidth = 0;
			if (this._fillColor) {
                if(this._fillColor.gradientMode) {
                    if(this._fillColor.gradientMode === "radial") {
                        gradient = ctx.createRadialGradient(xCtr, yCtr, 0,
                                                            xCtr, yCtr, Math.max(yScale, xScale));
                    } else {
                        gradient = ctx.createLinearGradient(0, this._height/2, this._width, this._height/2);
                    }
                    colors = this._fillColor.color;

                    len = colors.length;

                    for(j=0; j<len; j++) {
                        position = colors[j].position/100;
                        cs = colors[j].value;
                        gradient.addColorStop(position, "rgba(" + cs.r + "," + cs.g + "," + cs.b + "," + cs.a + ")");
                    }

                    ctx.fillStyle = gradient;

                } else {
                    c = "rgba(" + 255*this._fillColor[0] + "," + 255*this._fillColor[1] + "," + 255*this._fillColor[2] + "," + this._fillColor[3] + ")";
                    ctx.fillStyle = c;
                }
				// draw the fill
//				ctx.beginPath();
				var p = MathUtils.transformPoint( bezPts[0],   mat );
				ctx.moveTo( p[0],  p[1] );
				var index = 1;
				while (index < n) {
					p0   = MathUtils.transformPoint( bezPts[index],  mat );
					p1 = MathUtils.transformPoint( bezPts[index+1],  mat );

					x0 = p0[0];  y0 = p0[1];
					x1 = p1[0];  y1 = p1[1];
					ctx.quadraticCurveTo( x0,  y0,  x1, y1 );
					index += 2;
				}

				if (MathUtils.fpSign(innerRad) > 0) {
					xScale = 0.5*innerRad*this._width;
					yScale = 0.5*innerRad*this._height;
					mat[0] = xScale;
					mat[5] = yScale;

					// get the bezier points
					var bezPts = MathUtils.circularArcToBezier( [0,0,0], [1,0,0], -2.0*Math.PI );
					if (bezPts) {
						var n = bezPts.length;
						p = MathUtils.transformPoint( bezPts[0],   mat );
						ctx.moveTo( p[0],  p[1] );
						index = 1;
						while (index < n) {
							p0 = MathUtils.transformPoint( bezPts[index],    mat );
							p1 = MathUtils.transformPoint( bezPts[index+1],  mat );

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
			if (this._strokeColor) {
                if(this._strokeColor.gradientMode) {
                    if(this._strokeColor.gradientMode === "radial") {
                        gradient = ctx.createRadialGradient(xCtr, yCtr, Math.min(xScale, yScale),
                                                            xCtr, yCtr, 0.5*Math.max(this._height, this._width));
                    } else {
                        gradient = ctx.createLinearGradient(0, this._height/2, this._width, this._height/2);
                    }
                    colors = this._strokeColor.color;

                    len = colors.length;

                    for(j=0; j<len; j++) {
                        position = colors[j].position/100;
                        cs = colors[j].value;
                        gradient.addColorStop(position, "rgba(" + cs.r + "," + cs.g + "," + cs.b + "," + cs.a + ")");
                    }

                    ctx.strokeStyle = gradient;

                } else {
                    c = "rgba(" + 255*this._strokeColor[0] + "," + 255*this._strokeColor[1] + "," + 255*this._strokeColor[2] + "," + this._strokeColor[3] + ")";
                    ctx.strokeStyle = c;
                }
				// draw the stroke
				p = MathUtils.transformPoint( bezPts[0],   mat );
				ctx.moveTo( p[0],  p[1] );
				index = 1;
				while (index < n) {
					var p0   = MathUtils.transformPoint( bezPts[index],  mat );
					var p1 = MathUtils.transformPoint( bezPts[index+1],  mat );

					var x0 = p0[0],  y0 = p0[1],
						x1 = p1[0],  y1 = p1[1];
					ctx.quadraticCurveTo( x0,  y0,  x1, y1 );
					index += 2;
				}

				if (MathUtils.fpSign(innerRad) > 0) {
					// calculate the stroke matrix
					xScale = 0.5*innerRad*this._width  - 0.5*lineWidth;
					yScale = 0.5*innerRad*this._height - 0.5*lineWidth;
					mat[0] = xScale;
					mat[5] = yScale;
			
					// draw the stroke
					p = MathUtils.transformPoint( bezPts[0],   mat );
					ctx.moveTo( p[0],  p[1] );
					index = 1;
					while (index < n) {
						var p0   = MathUtils.transformPoint( bezPts[index],  mat );
						var p1 = MathUtils.transformPoint( bezPts[index+1],  mat );

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
    };

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
		this._innerRadius		= jObj.innerRadius;
		this._strokeStyle		= jObj.strokeStyle;
		var strokeMaterialName	= jObj.strokeMat;
		var fillMaterialName	= jObj.fillMat;

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

		this.importMaterialsJSON( jObj.materials );
	};

    this.collidesWithPoint = function( x, y ) {
//        if(x < this._xOffset) return false;
//        if(x > (this._xOffset + this._width)) return false;
//        if(y < this._yOffset) return false;
//        if(y > (this._yOffset + this._height)) return false;

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

        // get the gl coordinates
		var aspect = world.getAspect();
		var zn = world.getZNear(),  zf = world.getZFar();
		var	t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),
			b = -t,
			r = aspect*t,
			l = -r;

		var angle = Math.atan2( planePtNDC[1] - yNDC, planePtNDC[0] - xNDC );
		var degrees = angle*180.0/Math.PI;
		var objPtNDC = [Math.cos(angle)*xRadNDC + xNDC, Math.sin(angle)*yRadNDC + yNDC, 0];

		var ctrNDC = [xNDC, yNDC];

		var distToBoundary = VecUtils.vecDist( 2, ctrNDC, objPtNDC ),
			distToPt		= VecUtils.vecDist( 2, ctrNDC, planePtNDC );
		
		return (MathUtils.fpCmp(distToPt,distToBoundary) <= 0);
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
		var invMat = glmat4.inverse( mat, [] );
		var planePt = MathUtils.transformPoint( projPt, invMat );

		// get the normalized device coordinates (NDC) for
		// the position and radii.
		var	vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
		var	xNDC = 2*this._xOffset/vpw,  yNDC = -2*this._yOffset/vph,
			xRadNDC = this._width/vpw,  yRadNDC = this._height/vph;
		var projMat = world.makePerspectiveMatrix();
		var z = -world.getViewDistance();
		var planePtNDC = planePt.slice(0);
		planePtNDC[2] = z;
		planePtNDC = MathUtils.transformHomogeneousPoint( planePtNDC, projMat );
		planePtNDC = MathUtils.applyHomogeneousCoordinate( planePtNDC );

        // get the gl coordinates
		var aspect = world.getAspect();
		var zn = world.getZNear(),  zf = world.getZFar();
		var	t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),
			b = -t,
			r = aspect*t,
			l = -r;

		var angle = Math.atan2( planePtNDC[1] - yNDC, planePtNDC[0] - xNDC );
		var degrees = angle*180.0/Math.PI;
		var objPt = [Math.cos(angle)*xRadNDC + xNDC, Math.sin(angle)*yRadNDC + yNDC, 0];
		
		// convert to GL coordinates
		objPt[0] = -z*(r-l)/(2.0*zn)*objPt[0];
		objPt[1] = -z*(t-b)/(2.0*zn)*objPt[1];

		// re-apply the transform
		objPt = MathUtils.transformPoint( objPt, mat );

		return objPt;
    };

	 this.recalcTexMapCoords = function( vrts, uvs ) {
		var n = vrts.length/3;
		var ivrt = 0,  iuv = 0;
		var uMin = 1.e8,  uMax = -1.e8,
			vMin = 1.e8,  vMax = -1.e8;

		for (var i=0;  i<n;  i++) {
			uvs[iuv] = 0.5*(vrts[ivrt]/this._ovalWidth + 1);
			if (uvs[iuv] < uMin)  uMin = uvs[iuv];
			if (uvs[iuv] > uMax)  uMax = uvs[iuv];

			iuv++;  ivrt++;
			uvs[iuv] = 0.5*(vrts[ivrt]/this._ovalHeight + 1);
			if (uvs[iuv] < vMin)  vMin = uvs[iuv];
			if (uvs[iuv] > vMax)  vMax = uvs[iuv];
			iuv++;  ivrt += 2;
		}

		//console.log( "remap: " + uvs );
		//console.log( "uRange: " + uMin + " => " + uMax );
		//console.log( "vRange: " + vMin + " => " + vMax );
	 };
 };

Circle.prototype = new GeomObj();

if (typeof exports === "object") {
    exports.Circle = Circle;
}