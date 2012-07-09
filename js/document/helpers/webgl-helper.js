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

////////////////////////////////////////////////////////////////////////
//
var Montage =           require("montage/core/core").Montage,
    Component =         require("montage/ui/component").Component,
    MaterialsModel =    require("js/models/materials-model").MaterialsModel,
    NJUtils =           require("js/lib/NJUtils").NJUtils,
    GLWorld =           require("js/lib/drawing/world").World;
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
                this.collectGLData(this.iframe.contentWindow.document, this._glData );
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
            shapeModel.shapeCount   = 1;    // for now...
            shapeModel.useWebGl     = world._useWebGL;
            shapeModel.GLWorld      = world;
            //
            root = world.getGeomRoot();
            //
            if (root) {
                shapeModel.GLGeomObj            = root;
                shapeModel.strokeSize           = root._strokeWidth;
                shapeModel.strokeStyle          = "solid";
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
            Array.prototype.slice.call(elt.querySelectorAll('[data-RDGE-id]'),0).forEach(function(glCanvas) {
                dataArray.push(glCanvas.elementModel.shapeModel.GLWorld.exportJSON());
            });

            // Removing the old loop that went through all the elements.
            // TODO: Remove the following code once QE has tested it.
/*
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
            */
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
