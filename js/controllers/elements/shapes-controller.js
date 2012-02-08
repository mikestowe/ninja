/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = 			require("montage/core/core").Montage,
    CanvasController = require("js/controllers/elements/canvas-controller").CanvasController,
    njModule = require("js/lib/NJUtils");

exports.ShapesController = Montage.create(CanvasController, {

    setProperty: {
        value: function(el, p, value) {
            var val = parseInt(value);
            switch(p) {
                case "strokeSize":
                    // TODO - For now, just handling px units.
                    this.setShapeProperty(el, "strokeSize", value);
                    el.elementModel.shapeModel.GLGeomObj.setStrokeWidth(val);
                    el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    break;
                case "innerRadius":
                    this.setShapeProperty(el, "innerRadius", value);
                    el.elementModel.shapeModel.GLGeomObj.setInnerRadius(val/100);
                    el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    break;
                case "width":
                    el.elementModel.shapeModel.GLGeomObj.setWidth(val);
                    CanvasController.setProperty(el, p, value);
                    el.elementModel.shapeModel.GLWorld.setViewportFromCanvas(el);
                    el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    break;
                case "height":
                    el.elementModel.shapeModel.GLGeomObj.setHeight(val);
                    CanvasController.setProperty(el, p, value);
                    el.elementModel.shapeModel.GLWorld.setViewportFromCanvas(el);
                    el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    break;
                case "useWebGl":
                    var canvas = njModule.NJUtils.makeNJElement("canvas", "Canvas", "shape", el.className, true);
                    canvas.width = el.width;
                    canvas.height = el.height;
                    this.application.ninja.elementMediator.replaceElement(el, canvas);
                    NJevent("elementDeleted", el);
                    this.application.ninja.selectionController.selectElement(canvas);
                    el = canvas;
                    this.toggleWebGlMode(el, value);
                    el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    break;
                case "strokeMaterial":
                    var sm = Object.create(MaterialsLibrary.getMaterial(value));
                    if(sm)
                    {
                        el.elementModel.shapeModel.GLGeomObj.setStrokeMaterial(sm);
                        el.elementModel.shapeModel.strokeMaterial = sm;
                        el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    }
                    break;
                case "fillMaterial":
                    var fm = Object.create(MaterialsLibrary.getMaterial(value));
                    if(fm)
                    {
                        el.elementModel.shapeModel.GLGeomObj.setFillMaterial(fm);
                        el.elementModel.shapeModel.fillMaterial = fm;
                        el.elementModel.shapeModel.GLGeomObj.buildBuffers();
                    }
                    break;
                default:
                    CanvasController.setProperty(el, p, value);
            }
            el.elementModel.shapeModel.GLWorld.render();
        }
    },

    getProperty: {
        value: function(el, p) {
            switch(p) {
                case "strokeSize":
                case "innerRadius":
                case "tlRadius":
                case "trRadius":
                case "blRadius":
                case "brRadius":
                case "border":
                case "background":
                case "useWebGl":
                    return this.getShapeProperty(el, p);
                case "strokeMaterial":
                case "fillMaterial":
                    var m = this.getShapeProperty(el, p);
                    if(m)
                    {
                        return this.getShapeProperty(el, p).getName();
                    }
                    else
                    {
                        return "FlatMaterial";
                    }
                default:
                    return CanvasController.getProperty(el, p);
            }
        }
    },

    getShapeProperty: {
        value: function(el, prop) {
            if(el.elementModel && el.elementModel.shapeModel)
            {
                return el.elementModel.shapeModel[prop];
            }
            else
            {
                console.log("No shapeModel, one should have been created already");
                return null;
            }
        }
    },

    setShapeProperty: {
        value: function(el, prop, value) {
            if(el.elementModel && el.elementModel.shapeModel)
            {
                el.elementModel.shapeModel[prop] = value;
            }
            else
            {
                console.log("No shapeModel, one should have been created already");
            }
        }
    },

    GetValueInPixels: {
        value: function(value, units, h)
        {
            switch(units)
            {
                case "px":
                {
                    return value;
                }
                case "pt":
                {
                    return ~~(value*4/3);
                }
                case "%":
                {
                    if(h)
                    {
                        return ~~(value/100*h);
                    }
                    else
                    {
                        console.warn("Can't use % for a line's stroke size, using 10 for the value.");
                        return 10;
                    }
                }
            }
        }
    },

    CapWorldPercentFromValue: {
        value: function(value, units, h)
        {
            return Math.min(this.GetWorldPercentFromValue(value, units, h), 2);
        }
    },

    GetWorldPercentFromValue: {
        value: function(value, units, h)
        {
            switch(units)
            {
                case "pt":
                {
                    value = Math.round(value*4/3);
                    return 4*value/h;
                }
                case "px":
                {
                    return 4*value/h;
                }
                case "%":
                {
                    // Our calculations in GLWorld use 2 = 100%, so our calculations would usually be value/50,
                    // but in order to get values other than 0, 1, and 2, we need to multiply by 10, round that value,
                    // and then divide by 50*10 again.
                    // 100*10 = 1000/500 = 2
                    // 20*10 = 200/500 = 0.4
                    // 50*10 = 500/500 = 1
                    return Math.round(value*10)/500;
                }
                default:
                {
                    console.warn("Unhandled units " + units);
                }
            }
        }
    },

    //--------------------------------------------------------------------------------------------------------
    // Routines to get/set color properties
    getColor: {
        value: function(el, isFill) {
            var color,
                css;
            if(isFill)
            {
                if(el.elementModel.shapeModel.background)
                {
                    return el.elementModel.shapeModel.background;
                }
                color = this.getShapeProperty(el, "fill");
            }
            else
            {
                if(el.elementModel.shapeModel.border)
                {
                    return el.elementModel.shapeModel.border;
                }
                color = this.getShapeProperty(el, "stroke");
            }

            css = this.application.ninja.colorController.colorModel.webGlToCss(color);
            return this.application.ninja.colorController.getColorObjFromCss(css);
        }
    },

    setColor: {
        value: function(el, color, isFill) {
            var webGl = color.webGlColor || color.color.webGlColor;
            if(isFill)
            {
                el.elementModel.shapeModel.GLGeomObj.setFillColor(webGl);
                this.setShapeProperty(el, "fill", webGl);
                this.setShapeProperty(el, "background", color);
            }
            else
            {
                el.elementModel.shapeModel.GLGeomObj.setStrokeColor(webGl);
                this.setShapeProperty(el, "stroke", webGl);
                this.setShapeProperty(el, "border", color);
            }
            el.elementModel.shapeModel.GLWorld.render();
        }
    },

    getStroke: {
        value: function(el) {
            // TODO - Need to figure out which border side user wants
            var size = this.getShapeProperty(el, "strokeSize");
            var color = this.getShapeProperty(el, "stroke");
            return {stroke:color, strokeSize:size};
        }
    },

    setStroke: {
        value: function(el, stroke) {
            el.elementModel.shapeModel.GLGeomObj.setStrokeColor(stroke.color.webGlColor);
            var strokeWidth = this.GetValueInPixels(stroke.strokeSize, stroke.strokeUnits);
            el.elementModel.shapeModel.GLGeomObj.setStrokeWidth(strokeWidth);
            this.setShapeProperty(el, "stroke", stroke.color.webGlColor);
            this.setShapeProperty(el, "strokeSize", stroke.strokeSize + " " + stroke.strokeUnits);
            el.elementModel.shapeModel.GLGeomObj.buildBuffers();
            el.elementModel.shapeModel.GLWorld.render();
        }
    },

    DisplayMaterials: {
        value: function (cb)
        {

            var optionItem = document.createElement("option");
            optionItem.value = 0;
            optionItem.innerText = "Default";
            cb.appendChild(optionItem);

            var materials = MaterialsLibrary.materials;
            var len = materials.length;

            var i;
            for (i = 0; i < len; i++)
            {
                var current = materials[i];
                optionItem = document.createElement("option");
                optionItem.value = i+1;
                optionItem.innerText = current.getName();
                cb.appendChild(optionItem);
            }
        }
    },

    isElementAShape: {
        value: function(el)
        {
            return (el.elementModel && el.elementModel.isShape);
        }
    },

    toggleWebGlMode: {
        value: function(el, useWebGl)
        {
            if(useWebGl)
            {
                this.convertToWebGlWorld(el);
            }
            else
            {
                this.convertTo2DWorld(el);
            }
        }
    },

    convertToWebGlWorld: {
        value: function(el)
        {
            if(el.elementModel.shapeModel.useWebGl)
            {
                return;
            }
            var world,
                worldData = el.elementModel.shapeModel.GLWorld.export();
            if(worldData)
            {
                world = new GLWorld(el, true);
                el.elementModel.shapeModel.GLWorld = world;
                el.elementModel.shapeModel.useWebGl = true;
                world.import(worldData);
            }

        }
    },

    convertTo2DWorld: {
        value: function(el)
        {
            if(!el.elementModel.shapeModel.useWebGl)
            {
                return;
            }
            var world,
                worldData = el.elementModel.shapeModel.GLWorld.export();
            if(worldData)
            {
                world = new GLWorld(el, false);
                el.elementModel.shapeModel.GLWorld = world;
                el.elementModel.shapeModel.useWebGl = false;
                world.import(worldData);
            }

        }
    }

});
