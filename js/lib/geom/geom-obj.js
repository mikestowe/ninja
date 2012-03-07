/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var MaterialsModel = require("js/models/materials-model").MaterialsModel;
///////////////////////////////////////////////////////////////////////
// Class GLGeomObj
//      Super class for all geometry classes
///////////////////////////////////////////////////////////////////////
var GeomObj = function GLGeomObj() {
    ///////////////////////////////////////////////////////////////////////
    // Constants
    ///////////////////////////////////////////////////////////////////////
	this.GEOM_TYPE_RECTANGLE		=  1;
	this.GEOM_TYPE_CIRCLE			=  2;
	this.GEOM_TYPE_LINE             =  3;
	this.GEOM_TYPE_PATH			    =  4;
	this.GEOM_TYPE_CUBIC_BEZIER     =  5;
	this.GEOM_TYPE_UNDEFINED		= -1;

    // Needed for calculating dashed/dotted strokes
    this.DASH_LENGTH = 0.15;
    this.DOT_LENGTH = 0.05;
    this.GAP_LENGTH = 0.05;
	
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._matrix = Matrix.I(4);

    this._next = undefined;
    this._prev = undefined;
    this._child = undefined;
    this._parent = undefined;

    this.m_world = null;

    // stroke and fill colors
    this._strokeColor	= [0,0,0,0];
    this._fillColor		= [0,0,0,0];

	// stroke and fill materials
	this._fillMaterial = null;
	this._strokeMaterial = null;

	// array of primitives - used in RDGE
	this._primArray = [];
	this._materialNodeArray = [];
	this._materialArray = [];
	this._materialTypeArray = [];

	// the transform node used by RDGE
	this._trNode = null;

    ///////////////////////////////////////////////////////////////////////
    // Property accessors
    ///////////////////////////////////////////////////////////////////////
    this.setWorld = function( world ) {
        this.m_world = world;
    };

    this.getWorld = function() {
        return this.m_world;
    };

	this.getMatrix = function() {
        return this._matrix.slice(0);
    };

	this.setMatrix = function(m) {
        this._matrix = m.slice(0);
    };

    this.setNext = function( next ) {
        this._next = next;
    };

    this.getNext = function() {
        return this._next;
    };

    this.setPrev = function( prev ) {
        this._prev = prev;
    };

    this.getPrev = function() {
        return this._prev;
    };

    this.setChild = function( child ) {
        this._child = child;
    };

    this.getChild = function() {
        return this._child;
    };

    this.setParent = function( parent ) {
        this._parent = parent;
    };

    this.getParent = function() {
        return this._parent;
    };

	this.geomType = function() {
        return this.GEOM_TYPE_UNDEFINED;
    };

	this.getPrimitiveArray = function() {  return this._primArray;
    };

	this.getMaterialNodeArray = function() {
        return this._materialNodeArray;
    };

	this.getMaterialArray = function() {  return this._materialArray;
    };

	this.getTransformNode = function() {
        return this._trNode;
    };

	this.setTransformNode = function(t) {
        this._trNode = t;
    };

    this.setFillColor = function(c) {
        this.setMaterialColor(c, "fill");
    };

    this.setStrokeColor = function(c) {
        this.setMaterialColor(c, "stroke");
    };
    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	this.setMaterialColor = function(c, type) {
        if(c.gradientMode) {
            var nMats = 0;
            if (this._materialArray && this._materialTypeArray) {
                nMats = this._materialArray.length;
            }

            var stops = [],
                colors = c.color;

            var len = colors.length;
            // TODO - Current shaders only support 4 color stops
            if(len > 4) {
                len = 4;
            }

            for(var n=0; n<len; n++) {
                var position = colors[n].position/100;
                var cs = colors[n].value;
                var stop = [cs.r/255, cs.g/255, cs.b/255, cs.a];
                stops.push(stop);

                if (nMats === this._materialTypeArray.length) {
                    for (var i=0;  i<nMats;  i++) {
                        if (this._materialTypeArray[i] == type) {
                            this._materialArray[i].setProperty( "color"+(n+1), stop.slice(0) );
                            this._materialArray[i].setProperty( "colorStop"+(n+1), position );
                        }
                    }
                }
            }
//            if (type == "fill") {
//                this._fillColor = c.slice(0);
//            } else {
//                this._strokeColor = c.slice(0);
//            }
        } else {
            if (type == "fill") {
                this._fillColor = c.slice(0);
            } else {
                this._strokeColor = c.slice(0);
            }

            if (this._materialArray && this._materialTypeArray) {
                var nMats = this._materialArray.length;
                if (nMats === this._materialTypeArray.length) {
                    for (var i=0;  i<nMats;  i++) {
                        if (this._materialTypeArray[i] == type) {
                            this._materialArray[i].setProperty( "color", c.slice(0) );
                        }
                    }
                }
            }
        }



		var world = this.getWorld();
		if (world)  {
            world.restartRenderLoop();
        }
	};

    this.makeStrokeMaterial = function() {
        var strokeMaterial;
        if (this.getStrokeMaterial()){
            strokeMaterial = this.getStrokeMaterial().dup();
        } else {
            strokeMaterial = MaterialsModel.exportFlatMaterial();
        }

        if (strokeMaterial) {
            strokeMaterial.init( this.getWorld() );
            if(this._strokeColor) {
                strokeMaterial.setProperty("color", this._strokeColor);
            }
        }

        this._materialArray.push( strokeMaterial );
        this._materialTypeArray.push( "stroke" );

        return strokeMaterial;
    };

    this.makeFillMaterial = function() {
        var fillMaterial;
        if (this.getFillMaterial()) {
            fillMaterial = this.getFillMaterial().dup();
        } else {
            fillMaterial = MaterialsModel.exportFlatMaterial();
        }

        if (fillMaterial) {
            fillMaterial.init( this.getWorld() );
            //if(!this.getFillMaterial() && this._fillColor)
            if (this._fillColor) {
                fillMaterial.setProperty("color", this._fillColor);
            }
        }

        this._materialArray.push( fillMaterial );
        this._materialTypeArray.push( "fill" );

        return fillMaterial;
    };

    this.translate   = function(v) {
        var mat = Matrix.Translation( v );
        //var mat2 = mat.multiply( this._matrix );
        //this._matrix = mat2;
		glmat4.multiply(mat, this._matrix, this._matrix);
    };

    this.transform  = function( mat ) {
        if (mat) {
            //this._matrix = mat.multiply( this._matrix );
			glmat4.multiply(mat, this._matrix, this._matrix);
		}
    };

    this.setMatrix  = function(mat) {
        var gl = this.getWorld().getGLContext();
        if (gl) {
            gl.uniformMatrix4fv(this.getWorld().getShaderProgram().mvMatrixUniform, false, new Float32Array(mat));
        }
    };

    this.buildBuffers = function() {
        // this function must be overridden by the base class
        alert( "GLGeomObj.buildBuffers must be overridden by base class" );
    };

    this.render = function() {
        alert( "GLGeomObj.render method must be overridden by sub class" );
    };

    this.collidesWithPoint = function( x, y ) {
        alert( "GLGeomObj.collidesWithPoint method must be overridden by sub class" );
    };

    this.getNearPoint = function( pt, dir ) {
		// the alert is not displayed.  Objects may choose not to implement this method.
        //alert( "GLGeomObj.getNearPoint method must be overridden by sub class" );
    };

	this.getNearVertex = function( pt, dir ) {
		// this should be overridden by objects (such as rectangles) that have corners
	};

    this.containsPoint = function( pt, dir ) {
		// the alert is not displayed.  Objects may choose not to implement this method.
        //alert( "GLGeomObj.containsPoint method must be overridden by sub class" );
    };

	this.getPropertyFromString = function( prop, str ) {
		var index = str.indexOf( prop );
		if (index < 0)  throw new Error( "property " + prop + " not found in string: " + str);

		var rtnStr = str.substr( index+prop.length );
		index = rtnStr.indexOf( "\n" );
		if (index >= 0) {
			rtnStr = rtnStr.substr(0, index);
        }

		return rtnStr;
	};

    /*
    this.export = function() {
		var rtnStr;
		return rtnStr;
    }
    */
};

if (typeof exports === "object") {
    exports.GeomObj = GeomObj;
}


