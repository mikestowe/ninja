/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
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
///////////////////////////////////////////////////////////////////////
// Class GLLine
//      GL representation of a line.
//      Derived from class GeomObj
///////////////////////////////////////////////////////////////////////
exports.Line = Object.create(GeomObj, {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    _width: { value : 2.0, writable: true },
    _height: { value : 2.0, writable: true },
    _xOffset: { value : 0, writable: true },
    _yOffset: { value : 0, writable: true },

    // If line doesn't fit in canvas world, we had to grow the canvas by this much on either side
    _xAdj: { value : 0, writable: true },
    _yAdj: { value : 0, writable: true },

    _slope: { value : 0, writable: true },

    _strokeWidth: { value : 0.25, writable: true },
    _strokeStyle: { value : "Solid", writable: true },

    _scaleX: { value : 1.0, writable: true },
    _scaleY: { value : 1.0, writable: true },

    canFill: { value : false, writable: false },

    init: {
        value: function(world, xOffset, yOffset, width, height, slope, strokeSize, strokeColor, strokeMaterial, strokeStyle, xAdj, yAdj) {
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
        }
    },

    ////////////////////////////////////////////////////////////////////////
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
            return null;
        }
    },

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

    getXAdj: {
        value: function() {
            return this._xAdj;
        }
    },

    setXAdj: {
        value: function(x) {
            this._xAdj = x;
        }
    },

    getYAdj: {
        value: function() {
            return this._yAdj;
        }
    },

    setYAdj: {
        value: function(y) {
            this._yAdj = y;
        }
    },

    getSlope: {
        value: function() {
            return this._slope;
        }
    },

    setSlope: {
        value: function(m) {
            this._slope = m;
        }
    },

    geomType: {
        value: function() {
            return this.GEOM_TYPE_LINE;
        }
    },

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    exportJSON: {
        value: function() {
            var jObj =
            {
                'type'          : this.geomType(),
                'xoff'          : this._xOffset,
                'yoff'          : this._yOffset,
                'width'         : this._width,
                'height'        : this._height,
                'xAdj'          : this._xAdj,
                'yAdj'          : this._yAdj,
                'slope'         : this._slope,
                'strokeWidth'   : this._strokeWidth,
                'strokeColor'   : this._strokeColor,
                'strokeStyle'   : this._strokeStyle,
                'strokeMat'     : this._strokeMaterial ? this._strokeMaterial.getName() : MaterialsModel.getDefaultMaterialName(),
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
            this._xAdj              = jObj.xAdj;
            this._yAdj              = jObj.yAdj;
            this._strokeWidth       = jObj.strokeWidth;
            this._slope             = jObj.slope;
            this._strokeStyle       = jObj.strokeStyle;
            this._strokeColor       = jObj.strokeColor;
            var strokeMaterialName  = jObj.strokeMat;

            var strokeMat = MaterialsModel.getMaterial( strokeMaterialName );
            if (!strokeMat) {
                console.log( "object material not found in library: " + strokeMaterialName );
                strokeMat = MaterialsModel.getMaterial(  MaterialsModel.getDefaultMaterialName() );
            }
            this._strokeMaterial = strokeMat;

            this.importMaterialsJSON( jObj.materials );
        }
    },

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
            var vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
            var xNDC = 2*this._xOffset/vpw,  yNDC = 2*this._yOffset/vph,
                xFillNDC = this._width/vpw,  yFillNDC = this._height/vph,
                xAdjNDC = this._xAdj/vpw,  yAdjNDC = this._yAdj/vph,
                xStrokeNDC = this._strokeWidth/vpw,  yStrokeNDC = this._strokeWidth/vph;

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

            var strokeMaterial = this.makeStrokeMaterial();
//            var prim = ShapePrimitive.create(strokeVertices, strokeNormals, strokeTextures, indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, indices.length);
//            this._primArray.push( prim );
//            this._materialNodeArray.push( strokeMaterial.getMaterialNode() );

			// refine the mesh for vertex deformations
			if (strokeMaterial)
			{
				var primArray;
				if (strokeMaterial.hasVertexDeformation())
				{
					var paramRange = strokeMaterial.getVertexDeformationRange();
					var tolerance = strokeMaterial.getVertexDeformationTolerance();
					var nVertices = indices.length;
					nVertices = ShapePrimitive.refineMesh( strokeVertices, strokeNormals, strokeTextures, indices, nVertices,  paramRange,  tolerance );
					var subdividedParts = ShapePrimitive.subdivideOversizedMesh( strokeVertices, strokeNormals, strokeTextures, indices );

					primArray = [];
					if (subdividedParts)
					{
						for (var i=0;  i<subdividedParts.length;  i++)
						{
							var obj = subdividedParts[i];
							primArray.push( ShapePrimitive.create(obj.vertices, obj.normals, obj.uvs, obj.indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, obj.vertices.length/3) );
						}
					}
					else
						primArray = [ ShapePrimitive.create(vrts, nrms, uvs, indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, nVertices) ];
				}
				else
				{
					// create the RDGE primitive
					primArray = [ ShapePrimitive.create(strokeVertices, strokeNormals, strokeTextures, indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, indices.length) ];
				}

				var nPrims = primArray.length;
				for (var i=0;  i<nPrims;  i++)
				{
					this._primArray.push( primArray[i] );
            this._materialNodeArray.push( strokeMaterial.getMaterialNode() );
				}
			}

            world.updateObject(this);
        }
    },

    render: {
        value: function() {
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
            ctx.lineWidth   = lineWidth;
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
        }
    },

    collidesWithPoint: {
        value: function(x, y) {
            if(x < this._xOffset) return false;
            if(x > (this._xOffset + this._width)) return false;
            if(y < this._yOffset) return false;
            if(y > (this._yOffset + this._height)) return false;

            return true;
        }
    }
});
