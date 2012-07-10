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

var MaterialsModel = require("js/models/materials-model").MaterialsModel;

///////////////////////////////////////////////////////////////////////
// Class GLGeomObj
//      Super class for all geometry classes
///////////////////////////////////////////////////////////////////////
exports.GeomObj = Object.create(Object.prototype, {
    ///////////////////////////////////////////////////////////////////////
    // Constants
    ///////////////////////////////////////////////////////////////////////
    // TODO - Is there a way to make these static constants?
    GEOM_TYPE_RECTANGLE: { value : 1, writable: false },
    GEOM_TYPE_CIRCLE: { value : 2, writable: false },
    GEOM_TYPE_LINE: { value : 3, writable: false },
    GEOM_TYPE_PATH: { value : 4, writable: false },
    GEOM_TYPE_CUBIC_BEZIER: { value : 5, writable: false },
    GEOM_TYPE_BRUSH_STROKE: { value : 6, writable: false },
    GEOM_TYPE_UNDEFINED: { value : -1, writable: false },

    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    _matrix: { value : Matrix.I(4), writable: true },

    _next: { value : undefined, writable: true },
    _prev: { value : undefined, writable: true },
    _child: { value : undefined, writable: true },
    _parent: { value : undefined, writable: true },

    m_world: { value : null, writable: true },

    // stroke and fill colors
    _strokeColor: { value : [0, 0, 0, 0], writable: true },
    _fillColor: { value : [0, 0, 0, 0], writable: true },

    // stroke and fill materials
    _fillMaterial: { value : null, writable: true },
    _strokeMaterial: { value : null, writable: true },

    // Shapes (such as lines) that don't support fill should set this to false
    canFill: { value : true, writable: true },

    // array of primitives - used in RDGE
    _primArray: { value : [], writable: true },
    _materialNodeArray: { value : [], writable: true },
    _materialArray: { value : [], writable: true },
    _materialTypeArray: { value : [], writable: true },

    // the transform node used by RDGE
    _trNode: { value : null, writable: true },

    ///////////////////////////////////////////////////////////////////////
    // Property accessors
    ///////////////////////////////////////////////////////////////////////
    getWorld: {
        value: function() {
            return this.m_world;
        }
    },

    setWorld: {
        value: function(world) {
            this.m_world = world;
        }
    },

    getMatrix: {
        value: function() {
            return this._matrix.slice(0);
        }
    },

    setMatrix: {
        value: function(m) {
            this._matrix = m.slice(0);
        }
    },

    getNext: {
        value: function() {
            return this._next;
        }
    },

    setNext: {
        value: function(next) {
            this._next = next;
        }
    },

    getPrev: {
        value: function() {
            return this._prev;
        }
    },

    setPrev: {
        value: function(prev) {
            this._prev = prev;
        }
    },

    getChild: {
        value: function() {
            return this._child;
        }
    },

    setChild: {
        value: function(child) {
            this._child = child;
        }
    },

    getParent: {
        value: function() {
            return this._parent;
        }
    },

    setParent: {
        value: function(parent) {
            this._parent = parent;
        }
    },

    geomType: {
        value: function() {
            return this.GEOM_TYPE_UNDEFINED;
        }
    },

    getPrimitiveArray: {
        value: function() {
            return this._primArray;
        }
    },

    getMaterialNodeArray: {
        value: function() {
            return this._materialNodeArray;
        }
    },

    getMaterialArray: {
        value: function() {
            return this._materialArray;
        }
    },

    getTransformNode: {
        value: function() {
            return this._trNode;
        }
    },

    setTransformNode: {
        value: function(t) {
            this._trNode = t;
        }
    },

    setFillColor: {
        value: function(c) {
            this.setMaterialColor(c, "fill");
        }
    },

    setStrokeColor: {
        value: function(c) {
            this.setMaterialColor(c, "stroke");
        }
    },
    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
   setMaterialColor: {
        value: function(c, type) {
            var i = 0,
                nMats = 0;
            if (c) {
                if (c.gradientMode) {
                    // Gradient support
                    if (this._materialArray && this._materialTypeArray) {
                        nMats = this._materialArray.length;
                    }

                    if (nMats === this._materialTypeArray.length) {
                        for (i = 0; i < nMats; i++) {
                            if (this._materialTypeArray[i] == type) {
                                this._materialArray[i].setGradientData(c.color);
                            }
                        }
                    }
                    if (type === "fill") {
                        this._fillColor = c;
                    } else {
                        this._strokeColor = c;
                    }
                } else {
                    if (type === "fill") {
                        this._fillColor = c.slice(0);
                    } else {
                        this._strokeColor = c.slice(0);
                    }

                    if (this._materialArray && this._materialTypeArray) {
                        nMats = this._materialArray.length;
                        if (nMats === this._materialTypeArray.length) {
                            for (i = 0; i < nMats; i++) {
                                if (this._materialTypeArray[i] == type) {
                                    this._materialArray[i].setProperty("color", c.slice(0));
                                }
                            }
                        }
                    }
                }
            } else {
                if (type === "fill") {
                    this._fillColor = null;
                } else {
                    this._strokeColor = null;
                }

                if (this._materialArray && this._materialTypeArray) {
                    nMats = this._materialArray.length;
                    if (nMats === this._materialTypeArray.length) {
                        for (i = 0; i < nMats; i++) {
                            if (this._materialTypeArray[i] == type) {
                                // TODO - Not sure how to set color to null values in shaders
                                this._materialArray[i].setProperty("color", [0, 0, 0, 0]);
                            }
                        }
                    }
                }
            }

            var world = this.getWorld();
            if (world) {
                world.restartRenderLoop();
            }
        }
    },

    makeStrokeMaterial: {
        value: function() {
            var strokeMaterial;
            if (this.getStrokeMaterial()) {
                strokeMaterial = this.getStrokeMaterial().dup();
            } else {
                strokeMaterial = MaterialsModel.exportFlatMaterial();
            }

            if (strokeMaterial) {
                strokeMaterial.init(this.getWorld());
            }

            this._materialArray.push(strokeMaterial);
            this._materialTypeArray.push("stroke");

            // don't set the value here.  The material editor may set a color directly
            // to the material without setting this value in the obj.  The following
            // lines of code will clobber the value in the material
            //if (this._strokeColor)
            //    this.setStrokeColor(this._strokeColor);

            this._strokeMaterial = strokeMaterial;

            return strokeMaterial;
        }
    },

    makeFillMaterial: {
        value: function() {
            var fillMaterial;
            if (this.getFillMaterial()) {
                fillMaterial = this.getFillMaterial().dup();
            } else {
                fillMaterial = MaterialsModel.exportFlatMaterial();
            }

            if (fillMaterial) {
                fillMaterial.init(this.getWorld());
            }

            this._materialArray.push(fillMaterial);
            this._materialTypeArray.push("fill");

            // don't set the value here.  The material editor may set a color directly
            // to the material without setting this value in the obj.  The following
            // lines of code will clobber the value in the material
            //if (this._fillColor)
            //     this.setFillColor(this._fillColor);

            this._fillMaterial = fillMaterial;

            return fillMaterial;
        }
    },

    exportMaterialsJSON: {
        value: function() {
            MaterialsModel = require("js/models/materials-model").MaterialsModel;

            var jObj;
            if (this._materialArray && this._materialNodeArray && this.getWorld().isWebGL()) {
                var nMats = this._materialArray.length;
                if (nMats > 0) {
                    var arr = [];

                    for (var i = 0; i < nMats; i++) {
                        var matObj =
                        {
                            'materialNodeName':this._materialNodeArray[i].name,
                            'material':this._materialArray[i].exportJSON(),
                            'type':this._materialTypeArray[i]
                        }
                        arr.push(matObj);
                    }

                    jObj =
                    {
                        'nMaterials':nMats,
                        'materials':arr
                    };
                }
            }

            return jObj;
        }
    },

    importMaterialsJSON: {
        value: function(jObj) {
            MaterialsModel = require("js/models/materials-model").MaterialsModel;

            this._materialArray = [];
            this._materialTypeArray = [];

            if (!jObj)  return;

            var nMaterials = jObj.nMaterials;
            var matArray = jObj.materials;
            for (var i = 0; i < nMaterials; i++) {
                var mat;
                var matObj = matArray[i].material;
                var shaderName = matObj.material;
                switch (shaderName) {
                    case "flat":
                    case "radialGradient":
                    case "linearGradient":
                    case "bumpMetal":
                    case "uber":
                    case "plasma":
                    case "deform":
                    case "water":
                    case "paris":
                    case "raiders":
                    case "tunnel":
                    case "reliefTunnel":
                    case "squareTunnel":
                    case "flag":
                    case "twist":
                    case "fly":
                    case "julia":
                    case "mandel":
                    case "star":
                    case "zinvert":
                    case "keleidoscope":
                    case "radialBlur":
                    case "pulse":
                    case "twistVert":
                    case "taper":
                        mat = MaterialsModel.getMaterialByShader(shaderName);
                        if (mat)  mat = mat.dup();
                        break;

                    default:
                        console.log("material type: " + shaderName + " is not supported");
                        break;
                }

                if (mat) {
                    mat.importJSON(matObj);
                    this._materialArray.push(mat);
                    this._materialTypeArray.push(matObj.type);
                    var type = matArray[i].type;
                    if (type == "fill")  this._fillMaterial = mat;
                    else  this._strokeMaterial = mat;
                }
            }
        }
    },

    translate: {
        value: function(v) {
            var mat = Matrix.Translation(v);
            //var mat2 = mat.multiply( this._matrix );
            //this._matrix = mat2;
            glmat4.multiply(mat, this._matrix, this._matrix);
        }
    },

    transform: {
        value: function(mat) {
            if (mat) {
                //this._matrix = mat.multiply( this._matrix );
                glmat4.multiply(mat, this._matrix, this._matrix);
            }
        }
    },

    setMatrix: {
        value: function(mat) {
            var gl = this.getWorld().getGLContext();
            if (gl) {
                gl.uniformMatrix4fv(this.getWorld().getShaderProgram().mvMatrixUniform, false, new Float32Array(mat));
            }
        }
    },

    getGLCenter: {
        value: function() {
            // get the normalized device coordinates (NDC) for
            // all position and dimensions.
            var world = this.getWorld();
            var vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
            var xNDC = 2*this._xOffset/vpw,  yNDC = -2*this._yOffset/vph;

            var aspect = world.getAspect();
            var zn = world.getZNear(),  zf = world.getZFar();
            var t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),
                b = -t,
                r = aspect*t,
                l = -r;

            // calculate the object coordinates from their NDC coordinates
            var z = -world.getViewDistance();

            // unproject to get the position of the origin in GL
            var x = -z*(r-l)/(2.0*zn)*xNDC,
                y = -z*(t-b)/(2.0*zn)*yNDC;
            z = 0.0;

            // transform by the object's transformation matrix
            var ctr = MathUtils.transformPoint( [x, y, z], this.getMatrix() );

            return ctr;
        }
    },

    preViewToGL: {
        value: function(preViewPt) {
            // get the normalized device coordinates (NDC) for
            // all position and dimensions.
            var world = this.getWorld();
            var vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
            var xNDC = 2*preViewPt[0]/vpw,  yNDC = -2*preViewPt[1]/vph;

            var aspect = world.getAspect();
            var zn = world.getZNear(),  zf = world.getZFar();
            var t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),
                b = -t,
                r = aspect*t,
                l = -r;

            // calculate the object coordinates from their NDC coordinates
            var z = -world.getViewDistance();

            // unproject to get the position of the origin in GL
            var x = -z*(r-l)/(2.0*zn)*xNDC,
                y = -z*(t-b)/(2.0*zn)*yNDC;
            z = 0.0;

            // transform by the object's transformation matrix
            var glPt = MathUtils.transformPoint( [x, y, z], this.getMatrix() );

            return glPt;
        }
    },

    buildBuffers: {
        value: function() {
            // this function must be overridden by the base class
            alert("GLGeomObj.buildBuffers must be overridden by base class");
        }
    },

    render: {
        value: function() {
            alert("GLGeomObj.render method must be overridden by sub class");
        }
    },

    collidesWithPoint: {
        value: function(x, y) {
            alert("GLGeomObj.collidesWithPoint method must be overridden by sub class");
        }
    },

    getNearPoint: {
        value: function(pt, dir) {
            // the alert is not displayed.  Objects may choose not to implement this method.
            //alert( "GLGeomObj.getNearPoint method must be overridden by sub class" );
        }
    },

    getNearVertex: {
        value: function(pt, dir) {
            // this should be overridden by objects (such as rectangles) that have corners
        }
    },

    containsPoint: {
        value: function(pt, dir) {
            // the alert is not displayed.  Objects may choose not to implement this method.
            //alert( "GLGeomObj.containsPoint method must be overridden by sub class" );
        }
    },

    getPropertyFromString: {
        value: function(prop, str) {
            var index = str.indexOf(prop);
            if (index < 0)  throw new Error("property " + prop + " not found in string: " + str);

            var rtnStr = str.substr(index + prop.length);
            index = rtnStr.indexOf("\n");
            if (index >= 0) {
                rtnStr = rtnStr.substr(0, index);
            }

            return rtnStr;
        }
    },

    // Gradient stops for rgba(255,0,0,1) at 0%; rgba(0,255,0,1) at 33%; rgba(0,0,255,1) at 100% will return
    // 255,0,0,1@0;0,255,0,1@33;0,0,255,1@100
    gradientToString: {
        value: function(colors) {
            var rtnStr = "";
            if (colors && colors.length) {
                var c = colors[0],
                    len = colors.length;

                rtnStr += String(c.value.r + "," + c.value.g + "," + c.value.b + "," + c.value.a + "@" + c.position);
                for (var i = 1; i < len; i++) {
                    c = colors[i];
                    rtnStr += ";" + String(c.value.r + "," + c.value.g + "," + c.value.b + "," + c.value.a + "@" + c.position);
                }
            }
            return rtnStr;
        }
    },

    // Given a gradientStr "255,0,0,1@0;0,255,0,1@33;0,0,255,1@100" will return:
    // colors array [{position:0, value:{r:255, g:0, b:0, a:1}},
    //               {position:33, value:{r:0, g:255, b:0, a:1}},
    //               {position:100, value:{r:0, g:0, b:255, a:1}}
    //             ]
    stringToGradient: {
        value: function(gradientStr) {
            var rtnArr = [];

            var i,
                len,
                stops,
                stop,
                c;

            stops = gradientStr.split(";");
            len = stops.length;
            for (i = 0; i < len; i++) {
                stop = stops[i].split("@");
                c = stop[0].split(",");
                rtnArr.push({ position:Number(stop[1]), value:{r:Number(c[0]), g:Number(c[1]), b:Number(c[2]), a:Number(c[3])} });
            }

            return rtnArr;
        }
    }

    /*
     this.export = function() {
     var rtnStr;
     return rtnStr;
     }
     */
});

