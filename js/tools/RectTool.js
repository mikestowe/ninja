/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = 	require("montage/core/core").Montage,
    ShapeTool = require("js/tools/ShapeTool").ShapeTool,
    ShapesController = 	require("js/controllers/elements/shapes-controller").ShapesController;

var Rectangle = require("js/lib/geom/rectangle").Rectangle;
var MaterialsModel = require("js/models/materials-model").MaterialsModel;

exports.RectTool = Montage.create(ShapeTool, {

    _toolID: { value: "rectTool" },
    _imageID: { value: "rectToolImg" },
    _toolImageClass: { value: "rectToolUp" },
    _selectedToolImageClass: { value: "rectToolDown" },
    _toolTipText : { value : "Rectangle Tool (R)" },
    _selectedSubTool :{value :"rect"},
    _ovalTool:{value:null,writable:true},
    _rectTool:{value:null,writable:true},
    _rectView:{value:null,writable:true},
    _ovalView:{value:null,writable:true},

    _selectedToolClass:{value:"rectToolSpecificProperties"},
    _rectToolProperties:{enumerable:false , value:null,writable:true},
    _parentNode:{enumerable:false , value:null,writable:true},
    _toolsPropertiesContainer:{enumerable:false , value:null,writable:true},

    _lockRadiusButton : { value: null, writable: true, enumerable: true, configurable: true },
    _tlRadiusHotText : { value: null, writable: true, enumerable: true, configurable: true },
    _trRadiusHotText : { value: null, writable: true, enumerable: true, configurable: true },
    _blRadiusHotText : { value: null, writable: true, enumerable: true, configurable: true },
    _brRadiusHotText : { value: null, writable: true, enumerable: true, configurable: true },

    _lockRadius : { value: false, writable: true, enumerable: true, configurable: true },
    _buttons: {enumerable: false,value: { hexinput: [] , lockbutton: []}},

    RenderShape: {
		value: function (w, h, planeMat, midPt, canvas)
        {
            if( (Math.floor(w) === 0) || (Math.floor(h) === 0) )
            {
                return;
            }

            var left = Math.round(midPt[0] - 0.5*w);
            var top = Math.round(midPt[1] - 0.5*h);

            var strokeStyleIndex = this.options.strokeStyleIndex;
            var strokeStyle = this.options.strokeStyle;

            var strokeSize = ShapesController.GetValueInPixels(this.options.strokeSize.value, this.options.strokeSize.units, h);

            var tlRadius = ShapesController.GetValueInPixels(this.options.TLRadiusControl.value, this.options.TLRadiusControl.units, h);
            var trRadius = ShapesController.GetValueInPixels(this.options.TRRadiusControl.value, this.options.TRRadiusControl.units, h);
            var blRadius = ShapesController.GetValueInPixels(this.options.BLRadiusControl.value, this.options.BLRadiusControl.units, h);
            var brRadius = ShapesController.GetValueInPixels(this.options.BRRadiusControl.value, this.options.BRRadiusControl.units, h);

            var strokeColor = this.options.stroke.webGlColor || [0,0,0,1];
            var fillColor = this.options.fill.webGlColor || [1,1,1,1];
            // for default stroke and fill/no materials
            var strokeMaterial = null;
            var fillMaterial = null;
            var fillM = null;
            var strokeM = null;

            if(this.options.use3D)
            {
                strokeM = this.options.strokeMaterial;
                if(strokeM)
                {
                    strokeMaterial = Object.create(MaterialsModel.getMaterial(strokeM));
                }
                strokeColor = ShapesController.getMaterialColor(strokeM) || strokeColor;

                fillM = this.options.fillMaterial;
                if(fillM)
                {
                    fillMaterial = Object.create(MaterialsModel.getMaterial(fillM));
                }
                fillColor = ShapesController.getMaterialColor(fillM) || fillColor;
            }

            var world = this.getGLWorld(canvas, this.options.use3D);

            var xOffset = ((left - canvas.offsetLeft + w/2) - canvas.width/2);
            var yOffset = (canvas.height/2 - (top - canvas.offsetTop + h/2));

            var rect = Object.create(Rectangle, {});
            rect.init(world, xOffset, yOffset, w, h, strokeSize, strokeColor, fillColor,
                                        tlRadius, trRadius, blRadius, brRadius, strokeMaterial, fillMaterial, strokeStyle);

            world.addObject(rect);
            world.render();

            canvas.elementModel.shapeModel.shapeCount++;
            if(canvas.elementModel.shapeModel.shapeCount === 1)
            {
                canvas.elementModel.selection = "Rectangle";
                canvas.elementModel.pi = "RectanglePi";
                canvas.elementModel.shapeModel.strokeSize = this.options.strokeSize.value + " " + this.options.strokeSize.units;

                canvas.elementModel.shapeModel.tlRadius = this.options.TLRadiusControl.value + " " + this.options.TLRadiusControl.units;
                canvas.elementModel.shapeModel.trRadius = this.options.TRRadiusControl.value + " " + this.options.TRRadiusControl.units;
                canvas.elementModel.shapeModel.blRadius = this.options.BLRadiusControl.value + " " + this.options.BLRadiusControl.units;
                canvas.elementModel.shapeModel.brRadius = this.options.BRRadiusControl.value + " " + this.options.BRRadiusControl.units;

                canvas.elementModel.shapeModel.strokeStyleIndex = strokeStyleIndex;
                canvas.elementModel.shapeModel.strokeStyle = strokeStyle;

                canvas.elementModel.shapeModel.GLGeomObj = rect;
                canvas.elementModel.shapeModel.useWebGl = this.options.use3D;
            }
            else
            {
                // TODO - update the shape's info only.  shapeModel will likely need an array of shapes.
            }

            // TODO - This needs to be moved into geom obj's init routine instead of here
            if(!fillM) {
                this.setColor(canvas, this.options.fill, true, "rectTool");
            }
            if(!strokeM) {
                this.setColor(canvas, this.options.stroke, false, "rectTool");
            }
            if(canvas.elementModel.isShape)
            {
                this.application.ninja.selectionController.selectElement(canvas);
            }
        }
    }
});