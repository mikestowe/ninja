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
    ShapesController = require("js/controllers/elements/shapes-controller").ShapesController,
    ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

var ShapeProperties = exports.ShapeProperties = Montage.create(ToolProperties, {
    toolsData: { value: null },

    _strokeMaterial: {
        value: null,
        serializable: true
    },

    _fillIcon: {
        value: null,
        serializable: true
    },

    _fillMaterial: {
        value: null,
        serializable: true
    },

    _useWebGL: {
        value: null,
        serializable: true
    },

    _materialLabel: {
        value: null,
        serializable: true
    },

    _strokeIcon: {
        value: null,
        serializable: true
    },

    _fillColorCtrlIcon: {
        value: null,
        serializable: true
    },

    _fillColorCtrl: {
        value: null,
        serializable: true
    },

    _strokeColorCtrl: {
        value: null,
        serializable: true
    },

    _strokeSize: {
        value: null,
        serializable: true
    },

    ovalProperties: {
        value: null,
        serializable: true
    },

    rectProperties: {
        value: null,
        serializable: true
    },

    lineProperties: {
        value: null,
        serializable: true
    },

    endDivider: {
        value: null,
        serializable: true
    },

    _use3D: { value: false },
    addedColorChips: { value: false },

    _fill: {
        enumerable: false,
        value: { colorMode: 'rgb', color: { r: 255, g: 255, b: 255, a: 1, css: 'rgb(255,255,255)', mode: 'rgb', wasSetByCode: true, type: 'change' }, webGlColor: [1, 1, 1, 1] }
    },

    _stroke: {
        enumerable: false,
        value: { colorMode: 'rgb', color: { r: 0, g: 0, b: 0, a: 1, css: 'rgb(0,0,0)', mode: 'rgb', wasSetByCode: true, type: 'change' }, webGlColor: [0, 0, 0, 1] }
    },

    stroke: {
        enumerable: true,
        get: function () {
            return this._stroke;
        },
        set: function (value) {
            if (value !== this._stroke) {
                this._stroke = value;
            }
        }
    },

    fill: {
        enumerable: true,
        get: function () {
            return this._fill;
        },
        set: function (value) {
            if (value !== this._fill) {
                this._fill = value;
            }
        }
    },

    draw: {
        enumerable: false,
        value: function () {
            Object.getPrototypeOf(ShapeProperties).draw.call(this);

            if (this.addedColorChips === false && this.application.ninja.colorController.colorPanelDrawn) {
                // setup fill color
                this._fillColorCtrl.props = { side: 'top', align: 'center', wheel: true, palette: true, gradient: true, image: false, nocolor: true, offset: -80 };
                this.application.ninja.colorController.addButton("chip", this._fillColorCtrl);

                // setup stroke color
                this._strokeColorCtrl.props = { side: 'top', align: 'center', wheel: true, palette: true, gradient: true, image: false, nocolor: true, offset: -80 };
                this.application.ninja.colorController.addButton("chip", this._strokeColorCtrl);

                this._fillColorCtrl.addEventListener("change", this.handleFillColorChange.bind(this), false);
                this._strokeColorCtrl.addEventListener("change", this.handleStrokeColorChange.bind(this), false);

                this.addedColorChips = true;
            }

            if (this.addedColorChips) {
                this._fillColorCtrl.color(this._fill.colorMode, this._fill.color);
                this._strokeColorCtrl.color(this._stroke.colorMode, this._stroke.color);
            }
        }
    },

    _subPrepare: {
        value: function () {
            this.rectProperties.visible = true;

            Object.defineBinding(this._strokeMaterial, "items", {
                boundObject: this.application.ninja.appModel,
                boundObjectPropertyPath: "materials",
                oneway: false
            });

            Object.defineBinding(this._fillMaterial, "items", {
                boundObject: this.application.ninja.appModel,
                boundObjectPropertyPath: "materials",
                oneway: false
            });

            this.handleChange(null);
            this._useWebGL.addEventListener("change", this, false);
        }
    },

    _selectedSubTool: { value: null, enumerable: false },

    selectedSubTool: {
        get: function () { return this._selectedSubTool; },
        set: function (value) {
            if (value) {

                this._selectedSubTool ? this[this._selectedSubTool.properties].visible = false : this.rectProperties.visible = false;

                this._selectedSubTool = value;
                this[this._selectedSubTool.properties].visible = true;

                if (this._selectedSubTool.id === "LineTool") {
                    this._fillColorCtrlContainer.style["display"] = "none";
                    this._fillColorCtrlContainer.visible = false;
                    this._fillColorCtrlIcon.style["display"] = "none";
                    this._fillColorCtrlIcon.visible = false;                    
                    this.endDivider.style["display"] = "none";
                } else {
                    this._fillColorCtrlContainer.style["display"] = "";
                    this._fillColorCtrlContainer.visible = true;
                    this._fillColorCtrlIcon.style["display"] = "";
                    this._fillColorCtrlIcon.visible = true;
                    this.endDivider.style["display"] = "";
                }

                if (this._useWebGL.checked) {
                    if (this._selectedSubTool.id === "LineTool") {
                        this._fillIcon.style["display"] = "none";
                        this._fillMaterial.visible = false;
                    } else {
                        this._fillIcon.style["display"] = "";
                        this._fillMaterial.visible = true;
                    }
                }
            }
        }
    },

    handleChange: {
        value: function (event) {
            if (this._useWebGL.checked) {
                this._use3D = true;
                this._materialLabel.style["display"] = "";
                this._strokeIcon.style["display"] = "";
                this._strokeMaterial.visible = true;
                if (this.selectedSubTool.id !== "LineTool") {
                    this._fillIcon.style["display"] = "";
                    this._fillMaterial.visible = true;
                }
            }
            else {
                this._use3D = false;
                this._materialLabel.style["display"] = "none";
                this._strokeIcon.style["display"] = "none";
                this._strokeMaterial.visible = false;
                this._fillIcon.style["display"] = "none";
                this._fillMaterial.visible = false;
            }
        }
    },

    handleFillColorChange: {
        value: function (e) {
            this.fill = e._event;
            this.fill.webGlColor = this.application.ninja.colorController.colorModel.colorToWebGl(e._event.color);
        }
    },

    handleStrokeColorChange: {
        value: function (e) {
            this.stroke = e._event;
            this.stroke.webGlColor = this.application.ninja.colorController.colorModel.colorToWebGl(e._event.color);
        }
    }
});
