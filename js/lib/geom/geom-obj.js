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
        var i = 0,
            nMats = 0;
        if(c.gradientMode) {
            // Gradient support
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
                    for (i=0;  i<nMats;  i++) {
                        if (this._materialTypeArray[i] == type) {
                            this._materialArray[i].setProperty( "color"+(n+1), stop.slice(0) );
                            this._materialArray[i].setProperty( "colorStop"+(n+1), position );
                        }
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
                    for (i=0;  i<nMats;  i++) {
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
        }

        this._materialArray.push( strokeMaterial );
        this._materialTypeArray.push( "stroke" );

        if(this._strokeColor) {
            this.setStrokeColor(this._strokeColor);
        }

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
        }

        this._materialArray.push( fillMaterial );
        this._materialTypeArray.push( "fill" );

        if (this._fillColor) {
            this.setFillColor(this._fillColor);
        }

        return fillMaterial;
    };

	this.exportMaterialsJSON = function()
	{
		var jObj;
		if (this._materialArray && this._materialNodeArray && this.getWorld().isWebGL())
		{
			var nMats = this._materialArray.length;
			if (nMats > 0)
			{
				var arr = [];

				for (var i=0;  i<nMats;  i++)
				{
					var matObj = 
					{
						'materialNodeName'	: this._materialNodeArray[i].name,
						'material'			: this._materialArray[i].exportJSON(),
						'type'				: this._materialTypeArray[i]
					}
					arr.push( matObj );
				}

				jObj =
				{
					'nMaterials'	: nMats,
					'materials'		: arr
				};
			}
		}

		return jObj;
	}

	this.importMaterialsJSON = function( jObj )
	{
		this._materialArray = [];
		this._materialTypeArray = [];

		if (!jObj)  return;

		var nMaterials = jObj.nMaterials;
		var matArray = jObj.materials;
		for (var i=0;  i<nMaterials;  i++)
		{
			var mat;
			var matObj = matArray[i].material;
			var shaderName = matObj.material;
			switch (shaderName)
			{
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
				case "twist":
				case "fly":
				case "julia":
				case "mandel":
				case "star":
				case "zinvert":
				case "keleidoscope":
				case "radialBlur":
				case "pulse":
					mat = MaterialsModel.getMaterialByShader( shaderName );
					if (mat)  mat = mat.dup();
					break;

				default:
					console.log( "material type: " + shaderName + " is not supported" );
					break;
			}

			if (mat)
			{
				mat.importJSON( matObj );
				this._materialArray.push( mat );
				this._materialTypeArray.push( matObj.type );
				var type = matArray[i].type;
				if (type == "fill")  this._fillMaterial = mat;
				else  this._strokeMaterial = mat;
			}
		}
	}

	this.exportMaterials = function()
	{
		var rtnStr = "";
		if (this._materialArray && this._materialNodeArray)
		{
			var nMats = this._materialArray.length;
			rtnStr += "nMaterials: " + nMats + "\n";
			for (var i=0;  i<nMats;  i++)
			{
				var matNode  = this._materialNodeArray[i];
				rtnStr += "materialNodeName: " + matNode.name + "\n";

				var material = this._materialArray[i];
				rtnStr += material.export();
			}
		}
		else
			rtnStr += "nMaterials: 0\n" ;

		return rtnStr;
	}

	this.importMaterials = function(importStr)
	{
		var nMaterials = Number( this.getPropertyFromString( "nMaterials: ", importStr )  );
		for (var i=0;  i<nMaterials;  i++)
		{
			var mat;
			var materialType = this.getPropertyFromString( "material: ",	importStr );
			switch (materialType)
			{
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
				case "twist":
				case "fly":
				case "julia":
				case "mandel":
				case "star":
				case "zinvert":
				case "keleidoscope":
				case "radialBlur":
				case "pulse":
					mat = MaterialsModel.getMaterialByShader( materialType );
					if (mat)  mat = mat.dup();
					break;

				default:
					console.log( "material type: " + materialType + " is not supported" );
					break;
			}

			if (mat)
				mat.import( importStr );

			// pull off the end of the material 
			var endMat = "endMaterial\n";
			var endIndex = importStr.indexOf( endMat );
			if (endIndex < 0)  break;
			importStr = importStr.substr( endIndex + endMat.length );
		}
	}

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

    // Gradient stops for rgba(255,0,0,1) at 0%; rgba(0,255,0,1) at 33%; rgba(0,0,255,1) at 100% will return
    // 255,0,0,1@0;0,255,0,1@33;0,0,255,1@100
    this.gradientToString = function(colors) {
        var rtnStr = "";
        if(colors && colors.length) {
                var c = colors[0],
                len = colors.length;

            rtnStr += String(c.value.r + "," + c.value.g + "," + c.value.b + "," + c.value.a + "@" + c.position);
            for(var i=1; i<len; i++) {
                c = colors[i];
                rtnStr += ";" + String(c.value.r + "," + c.value.g + "," + c.value.b + "," + c.value.a + "@" + c.position);
            }
        }
        return rtnStr;
    };

    // Given a gradientStr "255,0,0,1@0;0,255,0,1@33;0,0,255,1@100" will return:
    // colors array [{position:0, value:{r:255, g:0, b:0, a:1}},
    //               {position:33, value:{r:0, g:255, b:0, a:1}},
    //               {position:100, value:{r:0, g:0, b:255, a:1}}
    //             ]
    this.stringToGradient = function(gradientStr) {
        var rtnArr = [];

        var i,
            len,
            stops,
            stop,
            c;

        stops = gradientStr.split(";");
        len = stops.length;
        for(i=0; i<len; i++)
        {
            stop = stops[i].split("@");
            c = stop[0].split(",");
            rtnArr.push({ position: Number(stop[1]), value:{r:Number(c[0]), g:Number(c[1]), b:Number(c[2]), a:Number(c[3])} });
        }

        return rtnArr;
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


