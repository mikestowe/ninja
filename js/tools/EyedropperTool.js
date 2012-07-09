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
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator,
    toolBase = require("js/tools/ToolBase").toolBase,
    ShapesController = require("js/controllers/elements/shapes-controller").ShapesController,
    World = require("js/lib/drawing/world").World,
    njModule = require("js/lib/NJUtils");

exports.EyedropperTool = Montage.create(toolBase, {

    _isMouseDown: { value: false },
    _previousColor: { value: null},
    _color: { value: null},
    _elementUnderMouse: { value: null },
    _imageDataCanvas: { value: null },
    _webGlDataCanvas: { value: null },
    _webGlWorld: { value: null },
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
                this._deleteImageDataCanvas();
                this._isMouseDown = false;
                this._elementUnderMouse = null;
                this._previousColor = null;
                this._color = null;
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
                obj = this.application.ninja.stage.getElement(event);
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

                    c = this._getColorFromCanvas(ctx, [pt.x, pt.y]);
                    if(c)
                    {
                        color = this.application.ninja.colorController.getColorObjFromCss(c);
                    }
                }
                else
                {
                    if(ShapesController.isElementAShape(obj))
                    {
                        c = this._getColorFromShape(obj, event);
                    }
                    else
                    {
                        c = this._getColorFromElement(obj, event);
                    }

                    if(!c)
                    {
                        color = null;
                    }
                    else if(typeof(c) === "string")
                    {
                        color = this.application.ninja.colorController.getColorObjFromCss(c);
                    }
                    else if(c.mode !== "gradient")
                    {
                        color = this.application.ninja.colorController.getColorObjFromCss(c.color.css);
                    }
                    else
                    {
                        color = c;
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
                // TODO - Color chips in toolbar doesn't support gradients yet
                if (color && color.value && (color.mode !== "gradient"))
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
                this.application.ninja.colorController.colorModel.applyNoColor(true);
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
            this._deleteImageDataCanvas();

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

                if(x < innerBounds[0][0]) return ElementsMediator.getColor(elt, false, "left");
                if(x > innerBounds[2][0]) return ElementsMediator.getColor(elt, false, "right");
                if(y < innerBounds[0][1]) return ElementsMediator.getColor(elt, false, "top");
                if(y > innerBounds[1][1]) return ElementsMediator.getColor(elt, false, "bottom");
            }

            return ElementsMediator.getColor(elt, true);
        }
    },

    // TODO - We don't want to calculate this repeatedly
    _getColorFromShape: {
        value: function(elt, event)
        {
            var c,
                ctx,
                tmpPt,
                pt = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                                    new WebKitPoint(event.pageX, event.pageY));

            tmpPt = this.application.ninja.stage.viewUtils.globalToLocal([pt.x, pt.y], elt);

            if(elt.elementModel.shapeModel.useWebGl)
            {
                c = this._getColorAtPoint(elt, event, true);
            }
            else
            {
                this._deleteImageDataCanvas();
                ctx = elt.getContext("2d");
                if(ctx)
                {
                    c = this._getColorFromCanvas(ctx, tmpPt);
                }
            }
            return c;
        }
    },

    _getColorAtPoint: {
        value: function(elt, event, isWebGl)
        {
            var pt = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                        new WebKitPoint(event.pageX, event.pageY));

            var tmpPt = this.application.ninja.stage.viewUtils.globalToLocal([pt.x, pt.y], elt);

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
                if(isWebGl)
                {
                    var worldData = elt.elementModel.shapeModel.GLWorld.exportJSON();
                    if(worldData)
                    {
                        this._webGlDataCanvas = njModule.NJUtils.make("canvas", {"data-RDGE-id": njModule.NJUtils.generateRandom()}, this.application.ninja.currentDocument);
                        this._applyElementStyles(elt, this._webGlDataCanvas, ["display", "position", "width", "height",
                                                                    "-webkit-transform", "-webkit-transform-style"]);
                        this._webGlDataCanvas.style.left = eltCoords[0] + "px";
                        this._webGlDataCanvas.style.top = eltCoords[1] + "px";
                        this._webGlDataCanvas.width = w;
                        this._webGlDataCanvas.height = h;
                        this._webGlWorld = new World(this._webGlDataCanvas, true, true);

                        var index = worldData.indexOf( ';' );
                        if ((worldData[0] === 'v') && (index < 24))
                        {
                            // JSON format.  separate the version info from the JSON info
                            var jStr = worldData.substr( index+1 );
                            worldData = JSON.parse( jStr );
                        }

                        this._webGlWorld.importJSON(worldData);
                        this._webGlWorld.render();
                        setTimeout(function() {
                            if(this._webGlWorld)
                            {
                                this._webGlWorld.draw();
                                this._imageDataContext.drawImage(this._webGlDataCanvas, 0, 0);
                                return this._getColorFromCanvas(this._imageDataContext, tmpPt, true);
                            }
                        }.bind(this), 250);
                    }
                }
                else
                {
                    this._imageDataContext.drawImage(elt, 0, 0);
                }
            }

            return this._getColorFromCanvas(this._imageDataContext, tmpPt, isWebGl);
        }
    },

    _getColorFromCanvas: {
        value: function(ctx, pt, isWebGl)
        {
            var imageData = ctx.getImageData(~~pt[0], ~~pt[1], 1, 1).data;
            if(imageData)
            {
                if(isWebGl)
                {
                    return ("rgba(" + imageData[0] + "," + imageData[1] + "," + imageData[2] + "," + imageData[3]/255 + ")");
                }
                else
                {
                    return ("rgba(" + imageData[0] + "," + imageData[1] + "," + imageData[2] + "," + imageData[3] + ")");
                }
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
                if(this._webGlDataCanvas)
                {
                    this._webGlWorld = null;
                    this._webGlDataCanvas = null;
                }
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
