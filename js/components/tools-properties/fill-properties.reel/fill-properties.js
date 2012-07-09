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

var FillProperties = exports.FillProperties = Montage.create(ToolProperties, {

    useFillColor: {
        value: null,
        serializable: true
    },

    _fillColorCtrl: {
        value: null,
        serializable: true
    },

    useWebGL: {
        value: null,
        serializable: true
    },

    _materialsContainer: {
        value: null,
        serializable: true
    },

    fillMaterial: {
        value: null,
        serializable: true
    },

    addedColorChips: { value: false },

    _fill: {
        enumerable: false,
        value: { colorMode: 'rgb', color: { r: 0, g: 0, b: 0, a: 1, css: 'rgb(0,0,0)', mode: 'rgb', wasSetByCode: true, type: 'change' }, webGlColor: [0, 0, 0, 1] }
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
            Object.getPrototypeOf(FillProperties).draw.call(this);

            if (this.addedColorChips === false && this.application.ninja.colorController.colorPanelDrawn) {
                this._fillColorCtrl.props = {side: 'top', align: 'left', wheel: true, palette: true, gradient: true, image: false, nocolor: true, offset: 8};
                this.application.ninja.colorController.addButton("chip", this._fillColorCtrl);

                this._fillColorCtrl.addEventListener("change", this.handleFillColorChange.bind(this), false);

                this.addedColorChips = true;
            }

            if (this.addedColorChips) {
                this._fillColorCtrl.color(this._fill.colorMode, this._fill.color);
            }
        }
    },

    handleFillColorChange: {
        value: function (e) {
            this.fill = e._event;
            this.fill.webGlColor = this.application.ninja.colorController.colorModel.colorToWebGl(e._event.color);
        }
    },

    _subPrepare: {
        value: function() {
            Object.defineBinding(this.fillMaterial, "items", {
                boundObject: this.application.ninja.appModel,
                boundObjectPropertyPath: "materials",
                oneway: false
            });
        }
    },

    handleAction: {
        value: function(event) {
            (this.useWebGL.checked) ? this._materialsContainer.style["display"] = "" : this._materialsContainer.style["display"] = "none";
        }
    }
});
