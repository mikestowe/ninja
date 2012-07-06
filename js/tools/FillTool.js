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

/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ModifierToolBase = require("js/tools/modifier-tool-base").ModifierToolBase,
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator,
    ShapesController = require("js/controllers/elements/shapes-controller").ShapesController;

exports.FillTool = Montage.create(ModifierToolBase, {
	_canSnap: { value: false },
	_canColor: { value: true },
	_targetedElement: { value: null },

    HandleMouseMove: {
        value : function (event)
		{
            var obj = this.application.ninja.stage.getElement(event, true);
            var cursor = "url('images/cursors/fill.png') 14 14, default";
            var canColor = true;
            if (obj)
            {
                var name = obj.nodeName;
                if ( ((name !== 'CANVAS') && (name !== 'DIV')) || (ShapesController.isElementAShape(obj) && !obj.elementModel.shapeModel.GLGeomObj.canFill))
                {
                    cursor = "url('images/cursors/nofill.png') 14 14, default";
                    canColor = false;
                    if(this._targetedElement)
                    {
                        this._targetedElement.classList.remove("active-element-outline");
                        this._targetedElement = null;
                    }
                }
                else
                {
                    if (obj !== this._targetedElement)
                    {
                        if(this._targetedElement)
                        {
                            this._targetedElement.classList.remove("active-element-outline");
                        }
                    }
                    this._targetedElement = obj;
                    this._targetedElement.classList.add("active-element-outline");
                }
            }
            this.application.ninja.stage.drawingCanvas.style.cursor = cursor;
            this._canColor = canColor;
		}
	},

    HandleLeftButtonUp: {
        value : function () {
            //if(this._isDrawing)
			{
                this.application.ninja.stage.clearDrawingCanvas();
                this._hasDraw = false;
                this._isDrawing = false;
            }
        }
    },

    // Called by modifier tool base's HandleLeftButtonDown after updating selection (if needed)
    startDraw: {
        value: function(event) {
            this.drawData = null;
            this.isDrawing = true;

            if(this._canColor && this.application.ninja.selectedElements.length) {
                var fillInfo = {},
                    color;
                if(this.options.useFillColor.checked) {
                    fillInfo.colorInfo = {};
                    color = this.options.fill;
                    if(color && color.color)
                    {
                        fillInfo.colorInfo.mode = color.colorMode;
                        fillInfo.colorInfo.color = color.color;
                    } else {
                        fillInfo.colorInfo.mode = "nocolor";
                        fillInfo.colorInfo.color = null;
                    }
                }

                if(this.options.useWebGL.checked) {
                    fillInfo.webGLInfo = {};
                    fillInfo.webGLInfo.material = this.options.fillMaterial.value;
                }
                if(fillInfo.colorInfo || fillInfo.webGLInfo) {
                    ElementsMediator.setFill(this.application.ninja.selectedElements, fillInfo, "Change", "fillTool");
                }
            }
        }
    }
});
