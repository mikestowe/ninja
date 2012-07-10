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

var GeomObj = require("js/lib/geom/geom-obj").GeomObj;
var ShapePrimitive =    require("js/lib/geom/shape-primitive").ShapePrimitive;
var MaterialsModel = require("js/models/materials-model").MaterialsModel;

 ///////////////////////////////////////////////////////////////////////
// Class GLRectangle
//      GL representation of a rectangle.
//      Derived from class GeomObj
///////////////////////////////////////////////////////////////////////
exports.Rectangle = Object.create(GeomObj, {
    // CONSTANTS
    N_TRIANGLES: { value : 15, writable: false },       // TODO - This is not being used anywhere. Remove?

    //if (!MaterialsModel)
    //  MaterialsModel = require("js/models/materials-model").MaterialsModel;

    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    _width: { value : 2.0, writable: true },
    _height: { value : 2.0, writable: true },
    _xOffset: { value : 0, writable: true },
    _yOffset: { value : 0, writable: true },

    _tlRadius: { value : 0, writable: true },
    _trRadius: { value : 0, writable: true },
    _blRadius: { value : 0, writable: true },
    _brRadius: { value : 0, writable: true },

    _strokeWidth: { value : 0.25, writable: true },
    _strokeStyle: { value : "Solid", writable: true },

    init: {
        value: function(world, xOffset, yOffset, width, height, strokeSize, strokeColor, fillColor,
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

            this._matrix = Matrix.I(4);
            }

            // the overall radius includes the fill and the stroke.  separate the two based on the stroke width
            //  this._fillRad = this._radius - this._strokeWidth;
            //    var err = 0.05;
            var err = 0;
            this._fillWidth = this._width - this._strokeWidth  + err;
            this._fillHeight = this._height - this._strokeWidth + err;

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

            if(fillMaterial) {
                this._fillMaterial = fillMaterial.dup();
            } else {
                this._fillMaterial = MaterialsModel.getMaterial( MaterialsModel.getDefaultMaterialName() ).dup();
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
    getTLRadius: {
        value: function() {
            return this._tlRadius;
        }
    },

    setTLRadius: {
        value: function(r) {
            this._tlRadius = Math.min(r, (this._height - this._strokeWidth)/2, (this._width - this._strokeWidth)/2);
        }
    },

    getTRRadius: {
        value: function() {
            return this._trRadius;
        }
    },

    setTRRadius: {
        value: function(r) {
            this._trRadius = Math.min(r, (this._height - this._strokeWidth)/2, (this._width - this._strokeWidth)/2);
        }
    },

    getBLRadius: {
        value: function() {
            return this._blRadius;
        }
    },

    setBLRadius: {
        value: function(r) {
            this._blRadius = Math.min(r, (this._height - this._strokeWidth)/2, (this._width - this._strokeWidth)/2);
        }
    },

    getBRRadius: {
        value: function() {
            return this._brRadius;
        }
    },

    setBRRadius: {
        value: function(r) {
            this._brRadius = Math.min(r, (this._height - this._strokeWidth)/2, (this._width - this._strokeWidth)/2);
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
            return this.GEOM_TYPE_RECTANGLE;
        }
    },

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    // JSON export
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
                'tlRadius'      : this._tlRadius,
                'trRadius'      : this._trRadius,
                'blRadius'      : this._blRadius,
                'brRadius'      : this._brRadius,
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
            this._tlRadius          = jObj.tlRadius;
            this._trRadius          = jObj.trRadius;
            this._blRadius          = jObj.blRadius;
            this._brRadius          = jObj.brRadius;
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

    buildBuffers: {
        value: function() {
            // get the world
            var world = this.getWorld();
            if (!world)  throw( "null world in buildBuffers" );
            //console.log( "GLRectangle.buildBuffers " + world._worldCount );
            if (!world._useWebGL)  return;

            // make sure RDGE has the correct context
            RDGE.globals.engine.setContext( world.getCanvas().rdgeid );

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
			var i;
            var strokeMaterial = this.makeStrokeMaterial();
			var strokePrimArray = this.createStroke([x,y],  2*xFill,  2*yFill,  strokeSize,  tlRadius, blRadius, brRadius, trRadius, strokeMaterial);
			strokeMaterial.fitToPrimitiveArray( strokePrimArray );
			for (i=0;  i<strokePrimArray.length;  i++)
			{
				this._primArray.push( strokePrimArray[i] );
            this._materialNodeArray.push( strokeMaterial.getMaterialNode() );
			}

            // fill
            tlRadius -= strokeSize;  if (tlRadius < 0)  tlRadius = 0.0;
            blRadius -= strokeSize;  if (blRadius < 0)  blRadius = 0.0;
            brRadius -= strokeSize;  if (brRadius < 0)  brRadius = 0.0;
            trRadius -= strokeSize;  if (trRadius < 0)  trRadius = 0.0;
            xFill -= strokeSize;
            yFill -= strokeSize;
            var fillMaterial = this.makeFillMaterial();
            //console.log( "fillMaterial: " + fillMaterial.getName() );
			var fillPrimArray = this.createFill([x,y],  2*xFill,  2*yFill,  tlRadius, blRadius, brRadius, trRadius, fillMaterial);
			fillMaterial.fitToPrimitiveArray( fillPrimArray );
			for (i=0;  i<fillPrimArray.length;  i++)
			{
				this._primArray.push( fillPrimArray[i] );
            this._materialNodeArray.push( fillMaterial.getMaterialNode() );
			}

            world.updateObject(this);
        }
    },

    renderQuadraticBezier: {
        value: function(bPts, ctx) {
            if (!bPts)  return;

            var nSegs = (bPts.length - 1)/2.0;
            if (nSegs <= 0)  return;

            var index = 1;
            for (var i=0;  i<nSegs;  i++) {
                ctx.quadraticCurveTo(  bPts[index][0],  bPts[index][1],    bPts[index+1][0], bPts[index+1][1] );
                index += 2;
            }
        }
    },

    renderPath: {
        value: function(inset, ctx) {
            // various declarations
            var pt,  rad,  ctr,  startPt, bPts;
            var width  = Math.round(this.getWidth()),
                height = Math.round(this.getHeight()),
                hw = 0.5*width,
                hh = 0.5*height;

            pt = [inset, inset];    // top left corner

            var tlRad = this._tlRadius; //top-left radius
            var trRad = this._trRadius;
            var blRad = this._blRadius;
            var brRad = this._brRadius;
            // limit the radii to half the rectangle dimension
            var minDimen = hw < hh ? hw : hh;
            if (tlRad > minDimen)  tlRad = minDimen;
            if (blRad > minDimen)  blRad = minDimen;
            if (brRad > minDimen)  brRad = minDimen;
            if (trRad > minDimen)  trRad = minDimen;

        var viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils;
        var world = this.getWorld();
        viewUtils.pushViewportObj( world.getCanvas() );
        var cop = viewUtils.getCenterOfProjection();
        viewUtils.popViewportObj();
        var xCtr = cop[0] + this._xOffset,                  yCtr = cop[1] - this._yOffset;
        var xLeft = xCtr - 0.5*this.getWidth(),             yTop = yCtr - 0.5*this.getHeight();
        var xDist = cop[0] - xLeft,                         yDist = cop[1] - yTop;
        var xOff = 0.5*world.getViewportWidth() - xDist,    yOff  = 0.5*world.getViewportHeight() - yDist;

            if ((tlRad <= 0) && (blRad <= 0) && (brRad <= 0) && (trRad <= 0)) {
            ctx.rect(pt[0]+xOff, pt[1]+yOff, width - 2*inset, height - 2*inset);
            } else {
                // get the top left point
                rad = tlRad - inset;
                if (rad < 0)  rad = 0;
                pt[1] += rad;
                if (MathUtils.fpSign(rad) == 0)  pt[1] = inset;
            ctx.moveTo( pt[0]+xOff,  pt[1]+yOff );

                // get the bottom left point
                pt = [inset, height - inset];
                rad = blRad - inset;
                if (rad < 0)  rad = 0;
                pt[1] -= rad;
            ctx.lineTo( pt[0]+xOff,  pt[1]+yOff );

                // get the bottom left curve
                if (MathUtils.fpSign(rad) > 0) {
                ctx.quadraticCurveTo( inset+xOff, height-inset+yOff,  inset+rad+xOff, height-inset+yOff );
                }

                // do the bottom of the rectangle
                pt = [width - inset,  height - inset];
                rad = brRad - inset;
                if (rad < 0)  rad = 0;
                pt[0] -= rad;
            ctx.lineTo( pt[0]+xOff, pt[1]+yOff );

                // get the bottom right arc
                if (MathUtils.fpSign(rad) > 0) {
                ctx.quadraticCurveTo( width-inset+xOff, height-inset+yOff,  width-inset+xOff, height-inset-rad+yOff );
                }

                // get the right of the rectangle
                pt = [width - inset,  inset];
                rad = trRad - inset;
                if (rad < 0)  rad = 0;
                pt[1] += rad;
            ctx.lineTo( pt[0]+xOff, pt[1]+yOff );

                // do the top right corner
                if (MathUtils.fpSign(rad) > 0) {
                ctx.quadraticCurveTo( width-inset+xOff, inset+yOff,  width-inset-rad+xOff, inset+yOff );
                }

                // do the top of the rectangle
                pt = [inset, inset];
                rad = tlRad - inset;
                if (rad < 0)  rad = 0;
                pt[0] += rad;
            ctx.lineTo( pt[0]+xOff, pt[1]+yOff );

                // do the top left corner
                if (MathUtils.fpSign(rad) > 0) {
                ctx.quadraticCurveTo( inset+xOff, inset+yOff, inset+xOff, inset+rad+yOff );
                } else {
                ctx.lineTo( inset+xOff, 2*inset+yOff );
                }
            }
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

            // get some dimensions
            var lw = this._strokeWidth;
            var w = world.getViewportWidth(),
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
                inset = Math.ceil( lw ) - 0.5;

                if(this._fillColor.gradientMode) {
                    if(this._fillColor.gradientMode === "radial") {
                        var ww = w - 2*lw,  hh = h - 2*lw;
                        gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(ww, hh)/2);
                    } else {
                        gradient = ctx.createLinearGradient(inset, h/2, w-inset, h/2);
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

                ctx.lineWidth   = lw;
                this.renderPath( inset, ctx );
                ctx.fill();
                ctx.closePath();
            }

            // render the stroke
            ctx.beginPath();
            if (this._strokeColor) {
                inset = Math.ceil( 0.5*lw ) - 0.5;

                if(this._strokeColor.gradientMode) {
                    if(this._strokeColor.gradientMode === "radial")
                        gradient = ctx.createRadialGradient(w/2, h/2, 0,  w/2, h/2, Math.max(h, w)/2);
                    else
                        gradient = ctx.createLinearGradient(0, h/2, w, h/2);
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

                ctx.lineWidth   = lw;
                this.renderPath( inset, ctx );
                ctx.stroke();
                ctx.closePath();
            }
        }
    },

    createStroke: {
        value: function(ctr,  width,  height,  strokeWidth,  tlRad, blRad, brRad, trRad, material) {
            // create the geometry
            return RectangleStroke.create( ctr,  width, height, strokeWidth,  tlRad, blRad,  brRad, trRad, material);
        }
    },

    createFill: {
        value: function(ctr,  width,  height,  tlRad, blRad, brRad, trRad, material) {
            // create the geometry
            // special the (common) case of no rounded corners
            var primArray;

            if ((tlRad <= 0) && (blRad <= 0) && (brRad <= 0) && (trRad <= 0)) {
                primArray = RectangleGeometry.create( ctr, width, height, material );
            } else {
                primArray = RectangleFill.create( ctr,  width, height,  tlRad, blRad,  brRad, trRad, material);
            }

			console.log( "rectangle produced " + primArray.length + " fill primitives" );

            return primArray;
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
    },

    getNearVertex: {
        value: function(pt, dir) {
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
            var vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
            var xNDC = 2*this._xOffset/vpw,  yNDC = 2*this._yOffset/vph,
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
            var t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),
                b = -t,
                r = aspect*t,
                l = -r;
            var objPt = [0,0,0];
            objPt[0] = -z*(r-l)/(2.0*zn)*x;
            objPt[1] = -z*(t-b)/(2.0*zn)*y;

            // re-apply the transform
            objPt = MathUtils.transformPoint( objPt, mat );

            return objPt;
        }
    },

    getNearPoint: {
        value: function(pt, dir) {
            var world = this.getWorld();
            if (!world)  throw( "null world in getNearPoint" );

            // get a point on the plane of the circle
            // the point is in NDC, as is the input parameters
            var mat = this.getMatrix();
            var plane = [0,0,1,0];
            plane = MathUtils.transformPlane( plane, mat );
            var projPt = MathUtils.vecIntersectPlane ( pt, dir, plane );

            // transform the projected point back to the XY plane
            var invMat = glmat4.inverse(mat, []);
            var planePt = MathUtils.transformPoint( projPt, invMat );

            // get the normalized device coordinates (NDC) for
            // the position and radii.
            var vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
            var xNDC = 2*this._xOffset/vpw,  yNDC = 2*this._yOffset/vph,
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
            var t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),
                b = -t,
                r = aspect*t,
                l = -r;
            var objPt = [0,0,0];
            objPt[0] = -z*(r-l)/(2.0*zn)*x;
            objPt[1] = -z*(t-b)/(2.0*zn)*y;

            // re-apply the transform
            objPt = MathUtils.transformPoint( objPt, mat );

            return objPt;
        }
    },

    recalcTexMapCoords: {
        value: function(vrts, uvs) {
            var n = vrts.length/3;
            var ivrt = 0,  iuv = 0;

            for (var i=0;  i<n;  i++) {
                uvs[iuv] = 0.5*(vrts[ivrt]/this._rectWidth + 1);
                iuv++;  ivrt++;
                uvs[iuv] = 0.5*(vrts[ivrt]/this._rectHeight + 1);
                iuv++;  ivrt += 2;
            }
        }
    }
});

var RectangleFill = {};
RectangleFill.create = function( rectCtr,  width, height, tlRad, blRad,  brRad, trRad,  material) {
    var x = rectCtr[0],  y = rectCtr[1],  z = 0.0;
    var hw = 0.5*width,  hh = 0.5*height;

    // limit the radii to half the rectangle dimension
    var minDimen = hw < hh ? hw : hh;
    if (tlRad > minDimen)  tlRad = minDimen;
    if (blRad > minDimen)  blRad = minDimen;
    if (brRad > minDimen)  brRad = minDimen;
    if (trRad > minDimen)  trRad = minDimen;

    // define some local variables
    this.vertices   = [];
    this.normals    = [];
    this.uvs        = [];
    this.indices    = [];

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
	var rtnArray;
	if (material)
	{
		if (material.hasVertexDeformation())
		{
            var paramRange = material.getVertexDeformationRange();
            var tolerance = material.getVertexDeformationTolerance();
            nVertices = ShapePrimitive.refineMesh( this.vertices, this.normals, this.uvs, this.indices, nVertices,  paramRange,  tolerance );

			var subdividedParts = ShapePrimitive.subdivideOversizedMesh( this.vertices, this.normals, this.uvs, this.indices );

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
				rtnArray = [ ShapePrimitive.create(this.vertices, this.normals, this.uvs, this.indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, nVertices) ];

//			var vertsOut = [],  normsOut = [], uvsOut = [],  indicesOut = [];
//			ShapePrimitive.convertTrianglesToLines( this.vertices, this.normals, this.uvs, this.indices,   vertsOut, normsOut,  uvsOut, indicesOut );
//			nVertices = vertsOut.length;
//			return ShapePrimitive.create(vertsOut, normsOut, uvsOut, indicesOut, RDGE.globals.engine.getContext().renderer.LINES, nVertices);

		}
		else
		{
    // create the RDGE primitive
			rtnArray = [ ShapePrimitive.create(this.vertices, this.normals, this.uvs, this.indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, nVertices) ];
		}
	}

	return rtnArray;
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
		v = 1.0 - (y - yMin)/h;

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
    var hw = 0.5*width,  hh = 0.5*height,  sw = strokeWidth;

    // limit the radii to half the rectangle dimension
    var minDimen = hw < hh ? hw : hh;
    if (tlRad > minDimen)  tlRad = minDimen;
    if (blRad > minDimen)  blRad = minDimen;
    if (brRad > minDimen)  brRad = minDimen;
    if (trRad > minDimen)  trRad = minDimen;

    // define some local variables
    this.vertices   = [];
    this.normals    = [];
    this.uvs        = [];
    this.indices    = [];

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
            var ctr      =  [x-hw+blRad,  y-hh+blRad, z],
                insidePt =  [x-hw+sw,     y-hh+blRad, z],
                outsidePt = [x-hw,        y-hh+blRad, z];
            RectangleStroke.getRoundedCorner( ctr, insidePt,  outsidePt,  this.vertices );
        } else {
            RectangleStroke.pushVertex( x-hw+sw,  y-hh+sw,    z);
            RectangleStroke.pushVertex( x-hw,     y-hh+blRad, z);
            var ctr      =  [x-hw+blRad,  y-hh+blRad, z],
                insidePt =  [x-hw+blRad,  y-hh+blRad, z],
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
            var ctr      =  [x+hw-brRad,  y-hh+brRad, z],
                insidePt =  [x+hw-brRad,  y-hh+sw,    z],
                outsidePt = [x+hw-brRad,  y-hh,       z];
            RectangleStroke.getRoundedCorner( ctr, insidePt,  outsidePt,  this.vertices );
        } else {
            RectangleStroke.pushVertex( x+hw-sw,    y-hh+sw, z);
            RectangleStroke.pushVertex( x+hw-brRad,    y-hh, z);
            var ctr      =  [x+hw-brRad,  y-hh+brRad, z],
                insidePt =  [x+hw-brRad,  y-hh+brRad, z],
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
            var ctr      =  [x+hw-trRad,  y+hh-trRad, z],
                insidePt =  [x+hw-sw,     y+hh-trRad, z],
                outsidePt = [x+hw,        y+hh-trRad, z];
            RectangleStroke.getRoundedCorner( ctr, insidePt,  outsidePt,  this.vertices );
        } else {
            RectangleStroke.pushVertex( x+hw-sw,  y+hh-sw,    z);
            RectangleStroke.pushVertex( x+hw,     y+hh-trRad, z);
            var ctr      =  [x+hw-trRad,  y+hh-trRad, z],
                insidePt =  [x+hw-trRad,  y+hh-trRad, z],
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
            var ctr      =  [x-hw+tlRad,  y+hh-tlRad, z],
                insidePt =  [x-hw+tlRad,  y+hh-sw, z],
                outsidePt = [x-hw+tlRad,  y+hh, z];
            RectangleStroke.getRoundedCorner( ctr, insidePt,  outsidePt,  this.vertices );
        } else {
            RectangleStroke.pushVertex( x-hw+sw,     y+hh-sw, z);
            RectangleStroke.pushVertex( x-hw+tlRad,  y+hh,    z);
            var ctr      =  [x-hw+tlRad,  y+hh-tlRad, z],
                insidePt =  [x-hw+tlRad,  y+hh-tlRad, z],
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
	var rtnArray;
    if (material)
    {
        if (material.hasVertexDeformation())
        {
            var paramRange = material.getVertexDeformationRange();
            var tolerance = material.getVertexDeformationTolerance();
            nVertices = ShapePrimitive.refineMesh( this.vertices, this.normals, this.uvs, this.indices, nVertices,  paramRange,  tolerance );

			var subdividedParts = ShapePrimitive.subdivideOversizedMesh( this.vertices, this.normals, this.uvs, this.indices );

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
				rtnArray = [ ShapePrimitive.create(this.vertices, this.normals, this.uvs, this.indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, nVertices) ];
		}
		else
		{
			// create the RDGE primitive
			rtnArray = [ ShapePrimitive.create(this.vertices, this.normals, this.uvs, this.indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, nVertices) ];
		}
	}

	return rtnArray;
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

RectangleStroke.pushVertex  = RectangleFill.pushVertex;
RectangleStroke.pushNormal  = RectangleFill.pushNormal;
RectangleStroke.pushUV      = RectangleFill.pushUV;
RectangleStroke.pushIndices = RectangleFill.pushIndices;
RectangleStroke.getVertex   = RectangleFill.getVertex;
RectangleStroke.getUV       = RectangleFill.getUV;

var RectangleGeometry = {};
RectangleGeometry.create = function( ctr,  width, height, material ) {
    var x = ctr[0],  y = ctr[1],  z = 0.0;
    var hw = 0.5*width,  hh = 0.5*height;

    // define some local variables
    this.vertices   = [];
    this.normals    = [];
    this.uvs        = [];
    this.indices    = [];

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
//  RectangleGeometry.pushIndices( 0, 1, 2 );
//  RectangleGeometry.pushIndices( 2, 3, 0 );
    RectangleGeometry.pushIndices( 2, 1, 0 );
    RectangleGeometry.pushIndices( 0, 3, 2 );

    //refine the mesh for vertex deformations
	var rtnArray;
    if (material)
    {
        if (material.hasVertexDeformation())
        {
            var paramRange = material.getVertexDeformationRange();
            var tolerance = material.getVertexDeformationTolerance();
            nVertices = ShapePrimitive.refineMesh( this.vertices, this.normals, this.uvs, this.indices, nVertices,  paramRange,  tolerance );

			var subdividedParts = ShapePrimitive.subdivideOversizedMesh( this.vertices, this.normals, this.uvs, this.indices );

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
				rtnArray = [ ShapePrimitive.create(this.vertices, this.normals, this.uvs, this.indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, nVertices) ];
		}
		else
		{
			// create the RDGE primitive
			rtnArray = [ ShapePrimitive.create(this.vertices, this.normals, this.uvs, this.indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, nVertices) ];
		}
	}

	return rtnArray;
};

RectangleGeometry.pushVertex    = RectangleFill.pushVertex;
RectangleGeometry.pushNormal    = RectangleFill.pushNormal;
RectangleGeometry.pushUV        = RectangleFill.pushUV;
RectangleGeometry.pushIndices   = RectangleFill.pushIndices;
RectangleGeometry.getVertex     = RectangleFill.getVertex;
RectangleGeometry.getUV         = RectangleFill.getUV;

RectangleGeometry.init = function()
{
    this.vertices   = [];
    this.normals    = [];
    this.uvs        = [];
    this.indices    = [];
}

RectangleGeometry.addQuad = function( verts,  normals, uvs )
{
    var offset = this.vertices.length/3;
    for (var i=0;  i<4;  i++)
    {
        RectangleGeometry.pushVertex( verts[i][0], verts[i][1], verts[i][2]);
        RectangleGeometry.pushNormal( normals[i] );
        RectangleGeometry.pushUV( uvs[i] );
    }

    RectangleGeometry.pushIndices( 0+offset, 1+offset, 2+offset );
    RectangleGeometry.pushIndices( 2+offset, 3+offset, 0+offset );
}

RectangleGeometry.buildPrimitive = function()
{
    var nVertices = this.vertices.length/3;
    return ShapePrimitive.create(this.vertices, this.normals, this.uvs, this.indices, RDGE.globals.engine.getContext().renderer.TRIANGLES, nVertices);
}



    exports.RectangleGeometry = RectangleGeometry;


