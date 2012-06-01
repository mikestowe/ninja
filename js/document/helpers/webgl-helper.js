/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 			require("montage/core/core").Montage,
	Component = 		require("montage/ui/component").Component,
    MaterialsModel = 	require("js/models/materials-model").MaterialsModel,
    NJUtils = 			require("js/lib/NJUtils").NJUtils,
	GLWorld =			require("js/lib/drawing/world").World;
////////////////////////////////////////////////////////////////////////
//	
exports.webGlDocumentHelper = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
	//This is set when the design view is ready, for local reference
	iframe: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
    _glData: {
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
    glData: {
    	//
    	get: function() {
    		//
			var elt = this.iframe.contentWindow.document.body;
			//
			if (elt) {
				var matLib = MaterialsModel.exportMaterials();
				this._glData = [matLib];
				this.collectGLData(elt, this._glData );
			} else {
				this._glData = null
			}
			//	
			return this._glData;
		},
		//
        set: function(value) {
        	//
        	var elt = this.iframe.contentWindow.document.body;
			//
			if (elt) {
				/*
				// Use this code to test the runtime version of WebGL
				var cdm = new NinjaCvsRt.CanvasDataManager();
				cdm.loadGLData(elt,  value,  null );
				*/

				//
				var i, nWorlds= value.length;
				//
				for (i = 0;  i < nWorlds;  i++) {
					// get the data for the next canvas
					var importStr = value[i], id, jObj, index = importStr.indexOf(';'), matLibStr, matLibObj, startIndex, endIndex, canvas, useWebGL, world;
					// determine if it is the new (JSON) or old style format
					if ((importStr[0] === 'v') && (index < 24)) {
						// JSON format.  pull off the
						importStr = importStr.substr(index+1);
						jObj = JSON.parse(importStr);
						id = jObj.id;
					} else {
                        // at this point the data could be either the materials library or
                        // an old style world.  We can determine which by converting the string
                        // to an object via JSON.parse.  That operation will fail if the string
                        // is an old style world.
                        matLibStr = 'materialLibrary;';
                        index = importStr.indexOf(matLibStr);
                        if (index == 0) {
                            importStr = importStr.substr(matLibStr.length);
                            matLibObj = JSON.parse(importStr);
                            MaterialsModel.importMaterials(matLibObj);
                        } else {
						    startIndex = importStr.indexOf("id: ");
						    if (startIndex >= 0) {
							    endIndex = importStr.indexOf("\n", startIndex);
							    if (endIndex > 0) id = importStr.substring(startIndex+4, endIndex);
						    }
                        }
					}
					//
					if (id != null) {
						//
						canvas = this.findCanvasWithID(id, elt);
						//
						if (canvas) {
							//
							if (!canvas.elementModel) {
								NJUtils.makeElementModel(canvas, "Canvas", "shape", true);
							}
							//
							if (canvas.elementModel) {
								if (canvas.elementModel.shapeModel.GLWorld) {
									canvas.elementModel.shapeModel.GLWorld.clearTree();
								}
								//
								if (jObj) {
									useWebGL = jObj.webGL;
									world = new GLWorld(canvas, useWebGL);
									world.importJSON(jObj);
								}
								//
								this.buildShapeModel(canvas.elementModel, world);
							}
						}
					}
				}
			}
		}
    },
    ////////////////////////////////////////////////////////////////////
	//
    findCanvasWithID:  {
		value: function(id, elt)  {
			//
			var i, child, nKids, foundElt, cid = elt.getAttribute("data-RDGE-id");
			//
			if (cid == id)  return elt;
			//
			if (elt.children) {
				nKids = elt.children.length;
				for (i=0;  i<nKids;  i++) {
					child = elt.children[i];
					foundElt = this.findCanvasWithID( id, child );
					if (foundElt)  return foundElt;
				}
			}
		}
	},
    ////////////////////////////////////////////////////////////////////
	//
    buildShapeModel: {
    	value: function(elementModel, world) {
    		//
            var shapeModel = elementModel.shapeModel, root;
			shapeModel.shapeCount	= 1;	// for now...
			shapeModel.useWebGl		= world._useWebGL;
			shapeModel.GLWorld		= world;
			//
			root = world.getGeomRoot();
			//
			if (root) {
				shapeModel.GLGeomObj			= root;
				shapeModel.strokeSize			= root._strokeWidth;
				shapeModel.strokeStyle			= "solid";
				//shapeModel.strokeStyleIndex
				switch (root.geomType()) {
					case root.GEOM_TYPE_RECTANGLE:
                        elementModel.selection = "Rectangle";
                        elementModel.pi = "RectanglePi";
						shapeModel.tlRadius = root._tlRadius;
						shapeModel.trRadius = root._trRadius;
						shapeModel.blRadius = root._blRadius;
						shapeModel.brRadius = root._brRadius;
						break;
					case root.GEOM_TYPE_CIRCLE:
                        elementModel.selection = "Oval";
                        elementModel.pi = "OvalPi";
						shapeModel.innerRadius = root._innerRadius;
						break;
					case root.GEOM_TYPE_LINE:
                        elementModel.selection = "Line";
                        elementModel.pi = "LinePi";
						shapeModel.slope = root._slope;
						break;
                    case root.GEOM_TYPE_BRUSH_STROKE:
                        elementModel.selection = "BrushStroke";
                        elementModel.pi = "BrushStrokePi";
						break;
                    case root.GEOM_TYPE_CUBIC_BEZIER:
                        elementModel.selection = "Subpath";
                        elementModel.pi = "SubpathPi";
                        break;
					default:
						console.log("geometry type not supported for file I/O, " + root.geomType());
						break;
				}
			}
		}
	},
	////////////////////////////////////////////////////////////////////
	//
	collectGLData: {
		value: function( elt,  dataArray ) {
			//
			var i, data, nKids, child;
			//
			if (elt.elementModel && elt.elementModel.shapeModel && elt.elementModel.shapeModel.GLWorld) {
				data = elt.elementModel.shapeModel.GLWorld.exportJSON();
				dataArray.push(data);
			}
			//
			if (elt.children) {
				nKids = elt.children.length;
				for (i=0;  i<nKids;  i++) {
					child = elt.children[i];
					this.collectGLData( child, dataArray );
				}
			}
		}
	}
	////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////