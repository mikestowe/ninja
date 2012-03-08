/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator,
    toolBase = require("js/tools/ToolBase").toolBase,
    ShapesController = require("js/controllers/elements/shapes-controller").ShapesController;

exports.EyedropperTool = Montage.create(toolBase, {

    _isMouseDown: { value: false },
    _previousColor: { value: null},
    _color: { value: null},
    _elementUnderMouse: { value: null },
    _imageDataCanvas: { value: null },
    _imageDataContext: { value: null },
    _canSnap: { value: false },

    Configure: {
        value: function ( doActivate )
		{
			if (doActivate)
			{
                NJevent("enableStageMove");
			}
			else
			{
                NJevent("disableStageMove");
			}
        }
    },

    HandleLeftButtonDown: {
        value : function ( event ) {
            this._isMouseDown = true;
            this._previousColor =
                this.application.ninja.colorController[this.application.ninja.colorController.colorModel.input].css;

            this._updateColorFromPoint(event);
       }
    },

    HandleMouseMove: {
        value : function (event)
		{
            if(this._escape)
            {
                this._isMouseDown = false;
                this._escape = false;
                this._elementUnderMouse = null;
                this._deleteImageDataCanvas();
            }
            if(this._isMouseDown)
            {
                this._updateColorFromPoint(event);
            }
		}
	},

    HandleLeftButtonUp: {
        value : function (event) {
			{
                this._isMouseDown = false;

                if(this._escape)
                {
                    this._escape = false;
                }

                this._updateColor(this._color, true);

                this._color = null;

                this._elementUnderMouse = null;
                this._deleteImageDataCanvas();
            }
        }
    },

    HandleEscape: {
        value: function(event) {
            if(this._color && this._color.value)
            {
                var color = this.application.ninja.colorController.getColorObjFromCss(this._previousColor);
                this._updateColor(color, true);
            }
            this._escape = true;
        }
    },

    _updateColorFromPoint: {
        value : function (event) {
            var c,
                color,
                obj = this.application.ninja.stage.GetElement(event);
            if (obj)
            {
                if(this.application.ninja.currentDocument.inExclusion(obj) !== -1)
                {
                    this._elementUnderMouse = null;
                    this._deleteImageDataCanvas();
                    return;
                }
                this._elementUnderMouse = obj;
                // Depending on the object type, we need to get different colors
                if(obj.elementModel.selection === "image")
                {
                    c = this._getColorAtPoint(obj, event);
                    if(c)
                    {
                        color = this.application.ninja.colorController.getColorObjFromCss(c);
                    }
                }
                else if (obj.elementModel.selection === "canvas")
                {
                    this._deleteImageDataCanvas();

                    var pt = webkitConvertPointFromPageToNode(obj,
                                                                new WebKitPoint(event.pageX, event.pageY)),
                        ctx = obj.getContext("2d");

                    c = this._getColorFromCanvas(ctx, pt);
                    if(c)
                    {
                        color = this.application.ninja.colorController.getColorObjFromCss(c);
                    }
                }
                else
                {
                    this._deleteImageDataCanvas();

                    if(ShapesController.isElementAShape(obj))
                    {
                        c = this._getColorFromShape(obj, event);
                    }
                    else
                    {
                        c = this._getColorFromElement(obj, event);
                    }

                    if(typeof(c) === "string")
                    {
                        color = this.application.ninja.colorController.getColorObjFromCss(c);
                    }
                    else
                    {
                        color = this.application.ninja.colorController.getColorObjFromCss(c.color.css);
                    }
                }

                this._updateColor(color, false);
            }
            else
            {
                this._elementUnderMouse = null;
                this._deleteImageDataCanvas();
            }

        }
    },

    _updateColor: {
        value: function(color, updateColorToolBar) {
            var eventType = "changing";
            if(updateColorToolBar)
            {
                eventType = "change";
                if (color && color.value)
                {
                    var input = this.application.ninja.colorController.colorModel.input;

                    if(input === "fill")
                    {
                        this.application.ninja.colorController.colorToolbar.fill_btn.color(color.mode, color.value);
                    }
                    else
                    {
                        this.application.ninja.colorController.colorToolbar.stroke_btn.color(color.mode, color.value);
                    }

                    // Updating color chips will set the input type to "chip", so set it back here.
                    this.application.ninja.colorController.colorModel.input = input;
                }
            }

            if(color)
            {
                if(color.color)
                {
                    color.color.wasSetByCode = true;
                    color.color.type = eventType;
                }

                if(color.mode === "gradient")
                {
                    this.application.ninja.colorController.colorModel["gradient"] =
                                    {value: color.color, wasSetByCode: true, type: eventType};
                }
                else
                {
                    if (color.color.a !== undefined)
                    {
                        this.application.ninja.colorController.colorModel.alpha =
                                        {value: color.color.a, wasSetByCode: true, type: eventType};
                    }
                    if(color.color.mode)
                    {
                        this.application.ninja.colorController.colorModel[color.color.mode] = color.color;
                    }
                    else
                    {
                        this.application.ninja.colorController.colorModel["rgb"] = color.color;
                    }
                }

                if(updateColorToolBar)
                {
                    this._previousColor = color.color.css;
                }
            }
            else
            {
                this.application.ninja.colorController.colorModel.alpha = {value: 1, wasSetByCode: true, type: eventType};
                this.application.ninja.colorController.colorModel.applyNoColor();
                if(updateColorToolBar)
                {
                    this._previousColor = "none";
                }
            }

            this._color = color;
        }
    },

    // TODO - We don't want to calculate this repeatedly
    _getColorFromElement: {
        value: function(elt, event)
        {
            var border = ElementsMediator.getProperty(elt, "border"),
                borderWidth,
                bounds3D,
                innerBounds,
                pt,
                bt,
                br,
                bb,
                bl,
                xAdj,
                yAdj,
                tmpPt,
                x,
                y;
            if(border)
            {
                bounds3D = this.application.ninja.stage.viewUtils.getElementViewBounds3D( elt );
                innerBounds = [];
                pt = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                                        new WebKitPoint(event.pageX, event.pageY));
                borderWidth = parseFloat(border);
                if(isNaN(borderWidth))
                {
                    bt = ElementsMediator.getProperty(elt, "border-top", parseFloat);
                    br = ElementsMediator.getProperty(elt, "border-right", parseFloat);
                    bb = ElementsMediator.getProperty(elt, "border-bottom", parseFloat);
                    bl = ElementsMediator.getProperty(elt, "border-left", parseFloat);
                    borderWidth = 0;
                }
                xAdj = bl || borderWidth;
                yAdj = bt || borderWidth;

                innerBounds.push([bounds3D[0][0] + xAdj, bounds3D[0][1] + yAdj, 0]);

                yAdj = bb || borderWidth;
                innerBounds.push([bounds3D[1][0] + xAdj, bounds3D[1][1] - yAdj, 0]);

                xAdj = br || borderWidth;
                innerBounds.push([bounds3D[2][0] - xAdj, bounds3D[2][1] - yAdj, 0]);

                yAdj = bt || borderWidth;
                innerBounds.push([bounds3D[3][0] - xAdj, bounds3D[3][1] + yAdj, 0]);

                tmpPt = this.application.ninja.stage.viewUtils.globalToLocal([pt.x, pt.y], elt);
                x = tmpPt[0];
                y = tmpPt[1];

                if(x < innerBounds[0][0]) return ElementsMediator.getProperty(elt, "border-left-color");
                if(x > innerBounds[2][0]) return ElementsMediator.getProperty(elt, "border-right-color");
                if(y < innerBounds[0][1]) return ElementsMediator.getProperty(elt, "border-top-color");
                if(y > innerBounds[1][1]) return ElementsMediator.getProperty(elt, "border-bottom-color");
            }

            return ElementsMediator.getColor(elt, true);
        }
    },

    // TODO - We don't want to calculate this repeatedly
    _getColorFromShape: {
        value: function(elt, event)
        {
            var strokeWidth = ShapesController.getShapeProperty(elt, "strokeSize"),
                bounds3D,
                innerBounds,
                pt,
                tmpPt,
                x,
                y;
            if(strokeWidth)
            {
                strokeWidth = parseFloat(strokeWidth);
                bounds3D = this.application.ninja.stage.viewUtils.getElementViewBounds3D( elt );
                innerBounds = [];
                pt = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                                        new WebKitPoint(event.pageX, event.pageY));

                innerBounds.push([bounds3D[0][0] + strokeWidth, bounds3D[0][1] + strokeWidth, 0]);

                innerBounds.push([bounds3D[1][0] + strokeWidth, bounds3D[1][1] - strokeWidth, 0]);

                innerBounds.push([bounds3D[2][0] - strokeWidth, bounds3D[2][1] - strokeWidth, 0]);

                innerBounds.push([bounds3D[3][0] - strokeWidth, bounds3D[3][1] + strokeWidth, 0]);

                tmpPt = this.application.ninja.stage.viewUtils.globalToLocal([pt.x, pt.y], elt);
                x = tmpPt[0];
                y = tmpPt[1];

                if( (x < innerBounds[0][0]) ||
                    (x > innerBounds[2][0]) ||
                    (y < innerBounds[0][1]) ||
                    (y > innerBounds[1][1]) )
                {
                    return ShapesController.getColor(elt, false);
                }
            }

            return ShapesController.getColor(elt, true);
        }
    },

    _getColorAtPoint: {
        value: function(elt, event)
        {
            if(!this._imageDataCanvas)
            {
                this._imageDataCanvas = document.createElement("canvas");

                this._applyElementStyles(elt, this._imageDataCanvas, ["display", "position", "width", "height",
                                                                "-webkit-transform", "-webkit-transform-style"]);

                var l = this.application.ninja.elementMediator.getProperty(elt, "left", parseInt),
                    t = this.application.ninja.elementMediator.getProperty(elt, "top", parseInt),
                    w = this.application.ninja.elementMediator.getProperty(elt, "width", parseInt),
                    h = this.application.ninja.elementMediator.getProperty(elt, "height", parseInt);

                var eltCoords = this.application.ninja.stage.toViewportCoordinates(l, t);
                this._imageDataCanvas.style.left = eltCoords[0] + "px";
                this._imageDataCanvas.style.top = eltCoords[1] + "px";
                this._imageDataCanvas.width = w;
                this._imageDataCanvas.height = h;

                this._imageDataContext = this._imageDataCanvas.getContext("2d");
                this._imageDataContext.drawImage(elt, 0, 0);
            }

            var pt = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                        new WebKitPoint(event.pageX, event.pageY));

            var tmpPt = this.application.ninja.stage.viewUtils.globalToLocal([pt.x, pt.y], elt);

            return this._getColorFromCanvas(this._imageDataContext, tmpPt);
        }
    },

    _getColorFromCanvas: {
        value: function(ctx, pt)
        {
            var imageData = ctx.getImageData(pt[0], pt[1], 1, 1).data;
            if(imageData)
            {
                return ("rgba(" + imageData[0] + "," + imageData[1] + "," + imageData[2] + "," + imageData[3] + ")");
            }
            else
            {
                return null;
            }
        }
    },

    _deleteImageDataCanvas : {
        value: function()
        {
            if(this._imageDataCanvas)
            {
                this._imageDataCanvas = null;
                this._imageDataContext = null;
            }
        }
    },

    _applyElementStyles : {
        value: function(fromElement, toElement, styles) {
            styles.forEach(function(style) {
                var styleCamelCase = style.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
                toElement.style[styleCamelCase] = window.getComputedStyle(fromElement)[style];
            }, this);
        }
    }

});