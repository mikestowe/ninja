/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var GeomObj =           require("js/lib/geom/geom-obj").GeomObj;
var ShapePrimitive =    require("js/lib/geom/shape-primitive").ShapePrimitive;
var MaterialsModel = require("js/models/materials-model").MaterialsModel;
var drawUtils       = require("js/helper-classes/3D/draw-utils").DrawUtils;
var vecUtils        = require("js/helper-classes/3D/vec-utils").VecUtils;

///////////////////////////////////////////////////////////////////////
// Class GLCircle
//      GL representation of a circle.
//      Derived from class GLGeomObj
//      The position and dimensions of the stroke, fill, and inner Radius should be in pixels
///////////////////////////////////////////////////////////////////////
exports.Circle = Object.create(GeomObj, {

    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    _width: { value : 2.0, writable: true },
    _height: { value : 2.0, writable: true },
    _xOffset: { value : 0, writable: true },
    _yOffset: { value : 0, writable: true },

    _radius: { value : 2.0, writable: true },
    _strokeWidth: { value : 0.25, writable: true },
    _innerRadius: { value : 0, writable: true },
    _ovalHeight: { value : 4.0, writable: true },
    _strokeStyle: { value : "Solid", writable: true },
    _aspectRatio: { value : 1.0, writable: true },

    init: {
        value: function(world, xOffset, yOffset, width, height, strokeSize, strokeColor, fillColor, innerRadius, strokeMaterial, fillMaterial, strokeStyle) {
            if(arguments.length > 0) {
                this._width = width;
                this._height = height;
                this._xOffset = xOffset;
                this._yOffset = yOffset;
                this._ovalHeight = 2.0 * this._radius;

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

            if(strokeMaterial) {
                this._strokeMaterial = strokeMaterial.dup();
            } else {
                this._strokeMaterial = MaterialsModel.getMaterial( MaterialsModel.getDefaultMaterialName() ).dup();
            }

            if(strokeColor) {
                if(this._strokeMaterial.hasProperty("color")) {
                    this._strokeMaterial.setProperty( "color",  this._strokeColor );
                } else if (this._strokeMaterial && (this._strokeMaterial.gradientType === this._strokeColor.gradientMode)) {
                    this._strokeMaterial.setGradientData(this._strokeColor.color);
                }
            }

            if(fillMaterial) {
                this._fillMaterial = fillMaterial.dup();
            } else {
                this._fillMaterial = MaterialsModel.getMaterial(  MaterialsModel.getDefaultMaterialName() ).dup();
            }

            if(fillColor) {
                if(this._fillMaterial.hasProperty("color")) {
                    this._fillMaterial.setProperty( "color",  this._fillColor );
                } else if (this._fillMaterial && (this._fillMaterial.gradientType === this._fillColor.gradientMode)) {
                    this._fillMaterial.setGradientData(this._fillColor.color);
        }
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
    // TODO - Use getters/setters in the future
    getStrokeWidth: {
        value: function() {
            return this._strokeWidth;
        }
    },

    setStrokeWidth: {
        value: function(w) {
            this._strokeWidth = w;
        }
    },

    getStrokeMaterial: {
        value: function() {
            return this._strokeMaterial;
        }
    },

    setStrokeMaterial: {
        value: function(m) {
            this._strokeMaterial = m;
        }
    },

    getFillMaterial: {
        value: function() {
            return this._fillMaterial;
        }
    },

    setFillMaterial: {
        value: function(m) {
            this._fillMaterial = m;
        }
    },

    getRadius: {
        value: function() {
            return this._radius;
        }
    },

    setRadius: {
        value: function(r) {
            this._radius = r;
        }
    },

    getInnerRadius: {
        value: function() {
            return this._innerRadius;
        }
    },

    setInnerRadius: {
        value: function(r) {
            this._innerRadius = r;
        }
    },

    getStrokeStyle: {
        value: function() {
            return this._strokeStyle;
        }
    },

    setStrokeStyle: {
        value: function(s) {
            this._strokeStyle = s;
        }
    },

    getWidth: {
        value: function() {
            return this._width;
        }
    },

    setWidth: {
        value: function(w) {
            this._width = w;
        }
    },

    getHeight: {
        value: function() {
            return this._height;
        }
    },

    setHeight: {
        value: function(h) {
            this._height = h;
        }
    },

    geomType: {
        value: function() {
            return this.GEOM_TYPE_CIRCLE;
        }
    },

    ///////////////////////////////////////////////////////////////////////
    // update the "color of the material
    getFillColor: {
        value: function() {
            return this._fillColor;
        }
    },

//    setFillColor: {
//        value: function(c) {
//            this._fillColor = c;
//        }
//    },

    getStrokeColor: {
        value: function() {
            return this._strokeColor;
        }
    },

//    setStrokeColor: {
//        value: function(c) {
//            this._strokeColor = c;
//        }
//    },
    ///////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    buildBuffers: {
        value: function() {
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
            var vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
            var xNDC = 2*this._xOffset/vpw,  yNDC = -2*this._yOffset/vph,
                xRadNDC = this._width/vpw,  yRadNDC = this._height/vph,
                xStrokeNDC = 2*this._strokeWidth/vpw,  yStrokeNDC = 2*this._strokeWidth/vph,
                xInnRadNDC = this._innerRadius*xRadNDC,  yInnRadNDC = this._innerRadius*yRadNDC;

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

			var i;
			var fillPrimArray,  strokePrim0Array,  strokePrim1Array;
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
                    strokeMaterial0 = this.makeStrokeMaterial();
					strokePrim0Array = this.generateOvalRing(x, y, reverseRotMat, innerStrokeScaleMat, innerRadiusScaleMat, nTriangles,  strokeMaterial0);
                }

                strokeMaterial2 = this.makeStrokeMaterial();
				strokePrim1Array = this.generateOvalRing(x, y, reverseRotMat, fillScaleMat, strokeScaleMat, nTriangles,  strokeMaterial2);
            }

			if (strokePrim0Array) {
				strokeMaterial0.fitToPrimitiveArray( strokePrim0Array );
				for (i=0;  i<strokePrim0Array.length;  i++)
				{
					this._primArray.push( strokePrim0Array[i] );
                this._materialNodeArray.push( strokeMaterial0.getMaterialNode() );
            }
			}

			if (strokePrim1Array) {
				strokeMaterial2.fitToPrimitiveArray( strokePrim1Array );
				for (i=0;  i<strokePrim1Array.length;  i++)
				{
					this._primArray.push( strokePrim1Array[i] );
                this._materialNodeArray.push( strokeMaterial2.getMaterialNode() );
            }
			}

            /////////////////////////////////////////////////////////////
            //  Fill
            fillMaterial = this.makeFillMaterial();
            if(this._innerRadius === 0) {
				fillPrimArray = this.generateOval(x, y, mat, fillScaleMat, nTriangles,  fillMaterial);
            } else {
				fillPrimArray = this.generateOvalRing(x, y, reverseRotMat, innerRadiusScaleMat, fillScaleMat, nTriangles,  fillMaterial);
            }

			if (fillPrimArray) {
				fillMaterial.fitToPrimitiveArray( fillPrimArray );
				for (i=0;  i<fillPrimArray.length;  i++)
				{
					this._primArray.push( fillPrimArray[i] );
                this._materialNodeArray.push( fillMaterial.getMaterialNode() );
            }
			}

            world.updateObject(this);
        }
    },

    generateOval: {
        value: function(xOff, yOff, rotationMat, scaleMat, nTriangles,  material) {
            var pt = [1.0, 0.0, 0.0];
            //var pts = scaleMat.multiply(pt);
            var pts = glmat4.multiplyVec3( scaleMat, pt, []);
            var x = pts[0],  y = pts[1], z = 0;
            var xs = scaleMat[0], ys = scaleMat[4];

            var vrts = [], nrms = [], uvs = [], indices = [];
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

            //refine the mesh for vertex deformations
			var rtnArray;
			if (material)
			{
				if (material.hasVertexDeformation())
				{
                    var paramRange = material.getVertexDeformationRange();
                    var tolerance = material.getVertexDeformationTolerance();
					var nVertices = vrts.length/3
					nVertices = ShapePrimitive.refineMesh( vrts, nrms, uvs, indices, nVertices,  paramRange,  tolerance );
					var subdividedParts = ShapePrimitive.subdivideOversizedMesh( vrts, nrms, uvs, indices );

					rtnArray = [];
					if (subdividedParts)
					{
						for (var i=0;  i<subdividedParts.length;  i++)
						{
							var obj = subdividedParts[i];
							rtnArray.push( ShapePrimitive.create(obj.vertices, obj.normals, obj.uvs, obj.indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, obj.vertices.length/3) );
                }
            }
					else
						rtnArray = [ ShapePrimitive.create(vrts, nrms, uvs, indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, nVertices) ];
				}
				else
				{
					// create the RDGE primitive
					rtnArray = [ ShapePrimitive.create(vrts, nrms, uvs, indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, nVertices) ];
				}
			}

			return rtnArray;
        }
    },

    generateOvalRing: {
        value: function(xOff, yOff, rotationMat, innerScaleMat, outerScaleMat, nTriangles,  material) {
            var pt = [1.0, 0.0, 0.0];

            var z = 0;
            var pt0s,  pt1s;
            //pt0s = innerScaleMat.multiply(pt);
            //pt1s = outerScaleMat.multiply(pt);
            pt0s = glmat4.multiplyVec3(innerScaleMat, pt, []);
            pt1s = glmat4.multiplyVec3(outerScaleMat, pt, []);

            var vrts = [], nrms = [], uvs = [], indices = [];

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

            //refine the mesh for vertex deformations
			var rtnArray;
			if (material)
			{
				if (material.hasVertexDeformation())
				{
                    var paramRange = material.getVertexDeformationRange();
                    var tolerance = material.getVertexDeformationTolerance();
					var nVertices = indices.length;
					indices = ShapePrimitive.convertTriangleStripToTriangles( indices );
					nVertices = ShapePrimitive.refineMesh( vrts, nrms, uvs, indices, nVertices,  paramRange,  tolerance );
					var subdividedParts = ShapePrimitive.subdivideOversizedMesh( vrts, nrms, uvs, indices );

					rtnArray = [];
					if (subdividedParts)
					{
						for (var i=0;  i<subdividedParts.length;  i++)
						{
							var obj = subdividedParts[i];
							rtnArray.push( ShapePrimitive.create(obj.vertices, obj.normals, obj.uvs, obj.indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, obj.vertices.length/3) );
                }
            }
					else
						rtnArray = [ ShapePrimitive.create(vrts, nrms, uvs, indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, nVertices) ];
				}
				else
				{
					// create the RDGE primitive
					rtnArray = [ ShapePrimitive.create(vrts, nrms, uvs, indices, RDGE.globals.engine.getContext().renderer.TRIANGLE_STRIP, indices.length) ];
				}
			}

			return rtnArray;
        }
    },

    render: {
        value: function() {
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
                                                                xCtr, yCtr, Math.max(this._width, this._height)/2 - lineWidth);
                        } else {
                            gradient = ctx.createLinearGradient(lineWidth, this._height/2, this._width-lineWidth, this._height/2);
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
    //              ctx.beginPath();
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
                ctx.lineWidth   = lineWidth;
                if (this._strokeColor) {
                    if(this._strokeColor.gradientMode) {
                        if(this._strokeColor.gradientMode === "radial") {
                            gradient = ctx.createRadialGradient(xCtr, yCtr, 0,
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
        }
    },

    exportJSON: {
        value: function() {
            var jObj =
            {
                'type'          : this.geomType(),
                'xoff'          : this._xOffset,
                'yoff'          : this._yOffset,
                'width'         : this._width,
                'height'        : this._height,
                'strokeWidth'   : this._strokeWidth,
                'strokeColor'   : this._strokeColor,
                'fillColor'     : this._fillColor,
                'innerRadius'   : this._innerRadius,
                'strokeStyle'   : this._strokeStyle,
                'strokeMat'     : this._strokeMaterial ? this._strokeMaterial.getName() :  MaterialsModel.getDefaultMaterialName(),
                'fillMat'       : this._fillMaterial ?  this._fillMaterial.getName() :  MaterialsModel.getDefaultMaterialName(),
                'materials'     : this.exportMaterialsJSON()
            };

            return jObj;
        }
    },

    importJSON: {
        value: function(jObj) {
            this._xOffset           = jObj.xoff;
            this._yOffset           = jObj.yoff;
            this._width             = jObj.width;
            this._height            = jObj.height;
            this._strokeWidth       = jObj.strokeWidth;
            this._strokeColor       = jObj.strokeColor;
            this._fillColor         = jObj.fillColor;
            this._innerRadius       = jObj.innerRadius;
            this._strokeStyle       = jObj.strokeStyle;
            var strokeMaterialName  = jObj.strokeMat;
            var fillMaterialName    = jObj.fillMat;

            var strokeMat = MaterialsModel.getMaterial( strokeMaterialName ).dup();
            if (!strokeMat) {
                console.log( "object material not found in library: " + strokeMaterialName );
                strokeMat = MaterialsModel.getMaterial(  MaterialsModel.getDefaultMaterialName() ).dup();
            }
            this._strokeMaterial = strokeMat;
            if (this._strokeMaterial.hasProperty( 'color' ))
                this._strokeMaterial.setProperty( 'color', this._strokeColor );

            var fillMat = MaterialsModel.getMaterial( fillMaterialName ).dup();
            if (!fillMat) {
                console.log( "object material not found in library: " + fillMaterialName );
                fillMat = MaterialsModel.getMaterial(  MaterialsModel.getDefaultMaterialName() ).dup();
            }
            this._fillMaterial = fillMat;
            if (this._fillMaterial.hasProperty( 'color' ))
                this._fillMaterial.setProperty( 'color', this._fillColor );

            this.importMaterialsJSON( jObj.materials );
        }
    },

    collidesWithPoint: {
        value: function(x, y) {
//        if(x < this._xOffset) return false;
//        if(x > (this._xOffset + this._width)) return false;
//        if(y < this._yOffset) return false;
//        if(y > (this._yOffset + this._height)) return false;

        return true;
        }
    },

    containsPoint: {
        value: function(pt, dir) {
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
            var vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
            var xNDC = 2*this._xOffset/vpw,  yNDC = 2*this._yOffset/vph,
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
            var t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),
                b = -t,
                r = aspect*t,
                l = -r;

            var angle = Math.atan2( planePtNDC[1] - yNDC, planePtNDC[0] - xNDC );
            var degrees = angle*180.0/Math.PI;
            var objPtNDC = [Math.cos(angle)*xRadNDC + xNDC, Math.sin(angle)*yRadNDC + yNDC, 0];

            var ctrNDC = [xNDC, yNDC];

            var distToBoundary = VecUtils.vecDist( 2, ctrNDC, objPtNDC ),
                distToPt        = VecUtils.vecDist( 2, ctrNDC, planePtNDC );

            return (MathUtils.fpCmp(distToPt,distToBoundary) <= 0);
        }
    },

    getNearPoint: {
        value: function(pt, dir) {
            var world = this.getWorld();
            if (!world)  throw( "null world in getNearPoint" );

            // the input point and direction are in GL space
            // project to the z == 0 plane
            var mat = this.getMatrix();
            var plane = [0,0,1,0];
            plane = MathUtils.transformPlane( plane, mat );
            var projPt = MathUtils.vecIntersectPlane ( pt, dir, plane );

            // get the center of the circle in GL space
            var ctr = this.getGLCenter();

            // transform the projected point to the plane of the circle
            var planePt = MathUtils.transformPoint( projPt, mat );

            // get a matrix mapping the circle to a 2D coordinate system
            var normal = [ mat[8], mat[9], mat[10] ];
            var planeMat = drawUtils.getPlaneToWorldMatrix(normal, ctr);
            var planeMatInv = glmat4.inverse( planeMat, [] );
            var planePt2D = MathUtils.transformPoint( planePt, planeMatInv );

            // get 2 points on the axes of the oval
            var wPt = this.preViewToGL( [this._xOffset + 0.5*this.getWidth(),   this._yOffset,  0] ),
                hPt = this.preViewToGL( [this._xOffset,  this._yOffset + 0.5*this.getHeight(),  0] );
            var w = vecUtils.vecDist( 2, wPt, ctr ),
                h = vecUtils.vecDist( 2, hPt, ctr );
            var aspect = w/h;

            // get the angle of the projected point relative to the circle
            var angle = Math.atan2( planePt2D[1], planePt2D[0]/aspect );
            var degrees = angle*180.0/Math.PI;

            // get the corresponding point on the object
            var pt = [ Math.cos(angle)*w,  Math.sin(angle)*h,  0 ];
            var glPt = MathUtils.transformPoint( pt, planeMat );

            return glPt;
        }
    },

    recalcTexMapCoords: {
        value: function(vrts, uvs) {
            var n = vrts.length/3;
            if (n === 0)  return;
            var ivrt = 0,  iuv = 0;
            var uMin = 1.e8,  uMax = -1.e8,
                vMin = 1.e8,  vMax = -1.e8;

            var i, index = 3;
            var xMin = vrts[0], xMax = vrts[0],
                yMin = vrts[1], yMax = vrts[1];
            for (i=1;  i<n;  i++)
            {
                if (vrts[index] < xMin)  xMin = vrts[index];
                else if (vrts[index] > xMax)  xMax = vrts[index];

                if (vrts[index+1] < yMin)  yMin = vrts[index+1];
                else if (vrts[index+1] > yMax)  yMax = vrts[index+1];

                index += 3;
            }
            var ovalWidth  = xMax - xMin,
                ovalHeight = yMax - yMin;
            for (i=0;  i<n;  i++) {
                uvs[iuv] = (vrts[ivrt]-xMin)/ovalWidth;
                if (uvs[iuv] < uMin)  uMin = uvs[iuv];
                if (uvs[iuv] > uMax)  uMax = uvs[iuv];

                iuv++;  ivrt++;
				uvs[iuv] = 1.0 - (vrts[ivrt]-yMin)/ovalHeight;
                if (uvs[iuv] < vMin)  vMin = uvs[iuv];
                if (uvs[iuv] > vMax)  vMax = uvs[iuv];
                iuv++;  ivrt += 2;
            }

            //console.log( "remap" );
            //console.log( "uRange: " + uMin + " => " + uMax );
            //console.log( "vRange: " + vMin + " => " + vMax );
        }
    }
});
