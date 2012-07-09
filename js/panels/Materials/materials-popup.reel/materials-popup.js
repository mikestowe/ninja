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

var Montage = require("montage/core/core").Montage,
    Component   = require("montage/ui/component").Component,
    MaterialsModel = require("js/models/materials-model").MaterialsModel,
    NJUtils = require("js/lib/NJUtils").NJUtils,
    World = require("js/lib/drawing/world").World,
    Rectangle = require("js/lib/geom/rectangle").Rectangle,
    ShapesController = require("js/controllers/elements/shapes-controller").ShapesController;

////////////////////////////////////////////////////////////////////////
//Exporting as MaterialsPopup
exports.MaterialsPopup = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    okButton: {
        value: null,
        serializable: true
    },

    cancelButton: {
        value: null,
        serializable: true
    },

    saveAsButton: {
        value: null,
        serializable: true
    },

    resetButton: {
        value: null,
        serializable: true
    },

    materialsLibraryRef: {
        value: null
    },

    materialTitle: {
        value: null,
        serializable: true
    },

    previewCanvas: {
        value: null,
        serializable: true
    },

    previewShape: {
        value: null,
        serializable: true
    },

    // Material Properties
    _materialName: {
        enumerable: true,
        value: ""
    },

    _useSelection: {  value: false,  enumerable: true },
    _whichMaterial: { value: "fill", enumerable: true },
    _originalValues: {value: null,  enumerable: true },

    captureAction: {
        value:function(event) {
            switch(event._currentTarget.label)
            {
                case "Cancel":
//					console.log("Cancel material edit");
                    this.revertToOriginalValues();
                    break;
                case "OK":
//					console.log("Committing material with the following values:");
                    for(var i=0, len=this.materialsProperties.childComponents.length; i< len; i++)
                    {
                        var childControl = this.materialsProperties.childComponents[i];
                        var childValue = childControl._control[childControl._prop];

                        if(typeof childValue === "object")
                        {
                            console.log(childControl.label + " is ");
                            console.dir(childValue);
                        }
                        else
                        {
                            console.log(childControl.label + " is " + childValue);
                        }
                        console.log("--------------");

                    }
                    break;
                case "Save As...":
                    this.saveAs();
                    break;
                case "Reset":
                    this.reset();
                    break;
            }

            // Notify Materials Library to close popup
            NJevent("hideMaterialPopup");
        }
    },

    saveAs:
    {
        value: function()
        {
//            console.log("Save As...");
            var materialCopy = prompt("Save material as", this._materialName + "_Copy");

            if (materialCopy)
            {
                this.materialsLibraryRef.duplicateMaterial(materialCopy);
            }
        }
    },

    reset:
    {
        value: function()
        {
//            console.log("Reset");
        }
    },

    revertToOriginalValues:
    {
        value: function()
        {
            if (this._originalValues)
            {
                this._material.importJSON( this._originalValues );

                if (this._useSelection)
                {
                    var selection = this.application.ninja.selectedElements;
                    if (selection && (selection.length > 0))
                    {
                        var nObjs = selection.length;
                        for (var iObj=0;  iObj<nObjs;  iObj++)
                        {
                            var canvas = selection[iObj];
                            var obj;
                            if (canvas.elementModel && canvas.elementModel.shapeModel)  obj = canvas.elementModel.shapeModel.GLGeomObj;
                            if (obj)
                            {
                                var matArray = obj._materialArray;
                                var matTypeArray = obj._materialTypeArray;
                                var nMats = matArray.length;
                                for (var iMat=0;  iMat<nMats;  iMat++)
                                {
                                    if (matTypeArray[iMat] === this._whichMaterial)
                                        matArray[iMat].importJSON( this._originalValues );
                                }
                                var world = obj.getWorld();
                                if (world)
                                    world.restartRenderLoop();
                            }
                        }
                    }
                }
            }
        }
    },

    updatePreview:
    {
        value: function(event)
        {
            if(event.type === "propertyChanging")
            {
                this._handlePropertyChanging(event);
            }
            else
            {
                this._handlePropertyChange(event);
            }
        }
    },

    _handlePropertyChanging:
    {
        value: function(event)
        {
//            if(typeof event.propertyValue === "object")
//            {
//                console.log(event.propertyLabel + " changing to ");
//                console.dir(event.propertyValue);
//            }
//            else
//            {
//                console.log(event.propertyLabel + " changing to " + event.propertyValue);
//            }

            if (event.propertyLabel && event.propertyValue)
                this.applyProperty( event.propertyLabel,  event.propertyValue );
        }
    },

    _handlePropertyChange:
    {
        value: function(theEvent)
        {
            var event = theEvent._event;
//            if(typeof event.propertyValue === "object")
//            {
//                console.log(event.propertyLabel + " changed to ");
//                console.dir(event.propertyValue);
//            }
//            else
//            {
//                console.log(event.propertyLabel + " changed to " + event.propertyValue);
//            }

            if (event.propertyLabel)
                this.applyProperty( event.propertyLabel,  event.propertyValue );
        }
    },

    applyProperty:
    {
        value: function( propLabel, propValue)
        {
            // find the property lable in the array
            // This assumes no duplication in labels
            if (this._propLabels)
            {
                // the label cones through with a trailing ':'.  remove that
                var ch = propLabel[ propLabel.length - 1];
                if (ch == ':')
                    propLabel = propLabel.substr(0, propLabel.length - 1);

                var index;
                var nProps = this._propLabels.length;
                for (var i=0;  i<nProps;  i++)
                {
                    if (this._propLabels[i] == propLabel)
                    {
                        index = i;
                        break;
                    }
                }
                if ((index != null) && this._material)
                {
                    var value = this.decodeValue( this._propTypes[index],  propValue );
                    this._material.setProperty( this._propNames[index],  value );
                }

                var obj, matArray, matTypeArray, nMats, iMat, world;
                if (this._useSelection)
                {
//					console.log( "apply to selection" );

                    var selection = this.application.ninja.selectedElements;
                    if (selection && (selection.length > 0))
                    {
                        var nObjs = selection.length;
                        for (var iObj=0;  iObj<nObjs;  iObj++)
                        {
                            var canvas = selection[iObj];
                            if (canvas.elementModel && canvas.elementModel.shapeModel)  obj = canvas.elementModel.shapeModel.GLGeomObj;
                            if (obj)
                            {
								matArray = obj._materialArray;
								matTypeArray = obj._materialTypeArray;
								nMats = matArray.length;
								for (iMat=0;  iMat<nMats;  iMat++)
                                {
                                    if (matTypeArray[iMat] === this._whichMaterial)
                                        matArray[iMat].setProperty( this._propNames[index], value );
                                }
								world = obj.getWorld();
                                if (world)
                                    world.restartRenderLoop();
                            }
                        }
                    }
                }

                // Update preview material
                obj = this.previewShape;
                matArray = obj._materialArray;
                matTypeArray = obj._materialTypeArray;
                nMats = matArray.length;
                for (iMat=0;  iMat<nMats;  iMat++)
                {
                    if (matTypeArray[iMat] === "fill")
                        matArray[iMat].setProperty( this._propNames[index], value );
            }
                world = obj.getWorld();
                if (world)
                    world.restartRenderLoop();
        }
		}
    },

    decodeValue:
    {
        value: function( type,  value )
        {
            var rtnValue;
            switch (type)
            {
                case "color":
                    rtnValue = [ value['r']/255.0,  value['g']/255.0,  value['b']/255.0, value['a'] ];
                    break;

                case "vector2d":
                case "vector3d":
                    rtnValue = [];
                    for (var i in value)  rtnValue.push( value[i] );
                    break;

                case "float":
                    rtnValue = value;
                    break;

                case "angle":
                    rtnValue = value*3.14159/180.0;
                    break;

                case "file":
                    if (value && (value.length > 0))
                    {
                        var index = value.lastIndexOf( "/" );
                        if (index < 0)  index = value.lastIndexOf( "\\" );
                        if (index >= 0)
                        {
                            value = value.substr( index+1 );
                            value = "assets/images/" + value;
                        }
                        rtnValue = value.slice(0);
                    }
                    break;

                case "checkbox":
                    rtnValue = value;
                    break;

                case "gradient":
                    rtnValue = value;
                    break;

                default:
                    console.log( "unrecognized material control type: " + type );
                    break;
            }
            return rtnValue;
        }
    },

    ////////////////////////////////////////////////////////////////////
    //
    prepareForDraw: {
        enumerable: false,
        value: function() {
            this.cancelButton.addEventListener("action", this, true);
            this.okButton.addEventListener("action", this, true);
            this.saveAsButton.addEventListener("action", this, true);
            this.resetButton.addEventListener("action", this, true);

            if (!this.previewCanvas.getAttribute( "data-RDGE-id" )) {
                this.previewCanvas.setAttribute( "data-RDGE-id", NJUtils.generateRandom() );
        }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    didDraw: {
        enumerable: false,
        value: function() {

            var world;
            if(!this.previewShape) {
                world = new World(this.previewCanvas, true);
                this.previewShape = Object.create(Rectangle, {});
                this.previewShape.init(world, 0, 0, 200, 100, 1, [0,0,0,1], [1,1,1,1],
                                            0, 0, 0, 0, null, null, "Solid");
                world.addObject(this.previewShape);
            } else {
                world = this.previewShape.getWorld();
            }

           this.materialTitle.innerHTML = this._materialName;

            this.previewShape.setFillMaterial(this._material);
            this.previewShape.buildBuffers();
            world.restartRenderLoop();
        }
    },

    //Garbage collection (Manual method)
    destroy: {
        enumerable: false,
        value: function() {
//			console.log("cleanup routines here");
            this.previewShape.getWorld().stop();
        }
    },

    loadMaterials:
    {
        enumerable: true,
        value: function(materialID,  useSelection,  whichMaterial)
        {
            //TODO - Hack to force repetition to draw. Setting .length = 0 did not work.
            this.materialsData = [];

            var material;
            this._materialName = materialID;
            if (useSelection)
            {
                this._useSelection = true;
                var selection = this.application.ninja.selectedElements;
                if (selection && (selection.length > 0))
                {
                    var canvas = selection[0];
                    var obj;
                    this._whichMaterial = whichMaterial;
                    if (canvas.elementModel && canvas.elementModel.shapeModel)  obj = canvas.elementModel.shapeModel.GLGeomObj;
                    if (obj)
                        material = (whichMaterial === 'stroke') ? obj.getStrokeMaterial() : obj.getFillMaterial();
                }
            }
            else
            {
                this._useSelection = false;
                    material = MaterialsModel.getMaterial( materialID );
                }

            if (material)
            {
                this._material = material;
                this._originalValues = material.exportJSON();
                if((materialID === "Linear Gradient") || (materialID === "Radial Gradient")) {
                    this.materialsData = this.getEditableProperties( material );
                } else {
                this.materialsData = this.getMaterialData( material );
            }
			}
            else
            {
                this.materialsData = this[materialID];
            }
            this.needsDraw = true;
        }
    },

    getEditableProperties: {
        value: function(material) {
            // declare the array to hold the results
            var rtnArray = [],
                obj,
                colorObj = ShapesController.getMaterialColor(material.getName());

                this._propNames = ["gradient"];
                this._propValues = ["gradient"];
                this._propTypes = ["gradient"];
                this._propLabels = ["gradient"];

            obj = this.createGradientData("gradient", colorObj);

            rtnArray.push(obj);

            return rtnArray;
        }
    },

    getMaterialData:
    {
        value: function( material )
        {
            // declare the array to hold the results
            var rtnArray = [];

            var propNames = [],  propValues = [],  propTypes = [],  propLabels = [];
            this._propNames = propNames;
            this._propValues = propValues;
            this._propTypes = propTypes;
            this._propLabels = propLabels;
            material.getAllProperties( propNames,  propValues,  propTypes,  propLabels);
            var n = propNames.length;
            for (var i=0;  i<n;  i++)
            {
                var obj;
                switch (propTypes[i])
                {
                    case "color":
                        obj = this.createColorData( propLabels[i], propValues[i] );
                        break;

                    case "vector2d":
                        obj = this.createVectorData( 2, propLabels[i], propValues[i] );
                        break;

                    case "vector3d":
                        obj = this.createVectorData( 3, propLabels[i], propValues[i] );
                        break;

                    case "float":
                        obj = this.createFloatData( propLabels[i], propValues[i] );
                        break;

                    case "angle":
                        obj = this.createFloatData( propLabels[i], propValues[i]*180.0/3.14159 );
                        break;

                    case "file":
                        obj = this.createFileData( propLabels[i], propValues[i] );
                        break;

                    case "checkbox":
                        obj = this.createCheckboxData( propLabels[i], propValues[i] );
                        break;

                    case "gradient":
                        obj = this.createGradientData( propLabels[i], propValues[i] );
                        break;

                    default:
                        console.log( "unrecognized material control type: " + propType[i] );
                        break;
                }

                if (obj)
                {
                    rtnArray.push( obj );
                    obj = null;
                }
            }

            return rtnArray;
        }
    },

    createColorData:
    {
        value:  function( label,  color )
        {
            var css = 'rgba(' + Math.floor(color[0]*255) + ',' + Math.floor(color[1]*255) + ',' + Math.floor(color[2]*255) + ',' + color[3] + ')';
            var colorObj = this.application.ninja.colorController.getColorObjFromCss(css)
            var obj =
            {
                "label":        label,
                "description":  "a color",
                "controlType":  "ColorChip",
                "defaults":
                {
                    "color":    colorObj
                }
            };

            return obj;
        }
    },

    createFloatData:
    {
        value: function( label, value )
        {
            var obj =
            {
                "label":         label,
                "description":   "floating point value",
                "controlType":   "HotText",
                "defaults":
                {
                    "minValue": 0,
                    "maxValue": 400,
                    "decimalPlace": 100,
					"value": value,
                    "stepSize": 0.1
                }
            }

            return obj;
        }
    },

    createCheckboxData:
    {
        value: function( label, value )
        {
            var obj =
            {
                "label":         label,
                "description":   "checkbox",
                "controlType":   "Button",
                "defaults":
                {
                    "isToggleButton": true,
                    "value": value
                }
            }

            return obj;
        }
    },

    createFileData:
    {
        value: function( label, value )
        {
            var obj =
            {
                "label":         label,
                "description":   "Image file",
                "controlType":   "FileInput",
                "defaults":
                {
                    "filePath": value
                }
            };

            return obj;
        }
    },

    createVectorData:
    {
        value: function( dimen, label, value )
        {
            var obj =
            {
                "label":         label,
                "description":   "a vector",
                "controlType":   "InputGroup",
                "defaults":
                {
                    data:[
                        {
                            "label":         "X",
                            "description":   "X value",
                            "controlType":   "HotText",
                            "defaults":
                            {
                                "decimalPlace": 100,
                                "minValue": -10,
                                "maxValue":  10,
                                "value": value[0],
                                "stepSize": 0.1
                            }
                        },
                        {
                            "label":         "Y",
                            "description":   "Y value",
                            "controlType":   "HotText",
                            "defaults":
                            {
                                "decimalPlace": 100,
                                "minValue": -100,
                                "maxValue":  100,
								"value":	value[1],
                                "stepSize": 0.1
                           }
                        }
                    ]
                }
            }

            if (dimen > 2)
            {
                obj["defaults"]["data"][2] =
                {
                    "label":         "Z",
                    "description":   "Z value",
                    "controlType":   "HotText",
                    "defaults":
                    {
                        "minValue": -1.e8,
                        "maxValue":  1.e8,
                        "value":    value[2]
                    }
                }
            }

            return obj;
        }
    },

    createGradientData:
            {
        value:  function( label,  colorObj )
                {
            var obj = {
                "label":		label,
                "description":	"a gradient",
                "controlType":	"GradientPicker",
                "defaults":
                {
                    "_mode":	colorObj.gradientMode,
                    "value": colorObj.color
                }
            };

            return obj;
                        }
                    },

    materialsProperties: {
        serializable: true,
        value: null
    },

    _materialsData: {
        enumerable: true,
        serializable: true,
        value: []

    },

    materialsData: {
        enumerable: true,
        serializable: true,
        get: function() {
                return this._materialsData;
            },
        set: function(data) {
            this._materialsData = data;
            if(this.materialsProperties && data.length)
            {
                this.materialsProperties.needsDraw = true;
            }
        }
    }


});
