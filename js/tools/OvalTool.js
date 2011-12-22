/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = 	require("montage/core/core").Montage,
    ShapeTool = require("js/tools/ShapeTool").ShapeTool,
    ShapesController = 	require("js/controllers/elements/shapes-controller").ShapesController;

exports.OvalTool = Montage.create(ShapeTool, {

	_toolID: { value: "ovalTool" },
	_imageID: { value: "ovalToolImg" },
	_toolImageClass: { value: "ovalToolUp" },
	_selectedToolImageClass: { value: "ovalToolDown" },
	_toolTipText: { value: "Oval Tool (O)" },
    _selectedToolClass:{value:"ovalToolSpecificProperties"},
    _ovalView : { value: null, writable: true},

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
            var strokeStyle  = this.options.strokeStyle;

            var strokeSize = ShapesController.GetValueInPixels(this.options.strokeSize.value, this.options.strokeSize.units, h);

            var innerRadius = this.options.innerRadius.value / 100;

            var strokeColor = this.application.ninja.colorController.colorToolbar.stroke.webGlColor;
            var fillColor = this.application.ninja.colorController.colorToolbar.fill.webGlColor;

            // for default stroke and fill/no materials
            var strokeMaterial = null;
            var fillMaterial = null;

            var strokeIndex = parseInt(this.options.strokeMaterial);
            if(strokeIndex > 0)
            {
                strokeMaterial = Object.create(MaterialsLibrary.getMaterialAt(strokeIndex-1));
            }

            var fillIndex = parseInt(this.options.fillMaterial);
            if(fillIndex > 0)
            {
                fillMaterial = Object.create(MaterialsLibrary.getMaterialAt(fillIndex-1));
            }


            var world = this.getGLWorld(canvas, this.options.use3D);

            var xOffset = ((left - canvas.offsetLeft + w/2) - canvas.width/2);
            var yOffset = (canvas.height/2 - (top - canvas.offsetTop + h/2));

            var oval = new GLCircle();
            oval.init(world, xOffset, yOffset, w, h, strokeSize, strokeColor, fillColor, innerRadius, strokeMaterial, fillMaterial, strokeStyle);

            world.addObject(oval);
            world.render();

            canvas.elementModel.shapeModel.shapeCount++;
            if(canvas.elementModel.shapeModel.shapeCount === 1)
            {
                canvas.elementModel.selection = "Oval";
                canvas.elementModel.pi = "OvalPi";
                canvas.elementModel.shapeModel.strokeSize = this.options.strokeSize.value + " " + this.options.strokeSize.units;
                canvas.elementModel.shapeModel.stroke = strokeColor;
                canvas.elementModel.shapeModel.fill = fillColor;

                canvas.elementModel.shapeModel.innerRadius = this.options.innerRadius.value  + " " + this.options.innerRadius.units;

                canvas.elementModel.shapeModel.strokeMaterial = strokeMaterial;
                canvas.elementModel.shapeModel.fillMaterial = fillMaterial;
                canvas.elementModel.shapeModel.strokeMaterialIndex = strokeIndex;
                canvas.elementModel.shapeModel.fillMaterialIndex = fillIndex;

                canvas.elementModel.shapeModel.strokeStyleIndex = strokeStyleIndex;
                canvas.elementModel.shapeModel.strokeStyle = strokeStyle;

                canvas.elementModel.shapeModel.GLGeomObj = oval;
            }
            else
            {
                // TODO - update the shape's info only.  shapeModel will likely need an array of shapes.
            }

            if(canvas.elementModel.isShape)
            {
                this.application.ninja.selectionController.selectElement(canvas);
            }

        }
    }
});