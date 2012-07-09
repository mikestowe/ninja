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

var InkBottleProperties = exports.InkBottleProperties = Montage.create(ToolProperties, {
    addedColorChips: { value: false },

    useStrokeColor: {
        value: null,
        serializable: true
    },

    _strokeColorCtrl: {
        value: null,
        serializable: true
    },

    borderWidth: {
        value: null,
        serializable: true
    },

    useBorderWidth: {
        value: null,
        serializable: true
    },

    useBorderStyle: {
        value: null,
        serializable: true
    },

    borderStyle: {
        value: null,
        serializable: true
    },

    useStrokeSize: {
        value: null,
        serializable: true
    },

    strokeSize: {
        value: null,
        serializable: true
    },

    _useWebGL: {
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

    _strokeMaterial: {
        value: null,
        serializable: true
    },

    strokeMaterial: {
        value: null,
        serializable: true
    },

    _stroke: {
        enumerable: false,
        value: { colorMode: 'rgb', color: { r: 255, g: 255, b: 255, a: 1, css: 'rgb(255,255,255)', mode: 'rgb', wasSetByCode: true, type: 'change' }, webGlColor: [1, 1, 1, 1] }
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

    draw: {
        enumerable: false,
        value: function () {
            Object.getPrototypeOf(InkBottleProperties).draw.call(this);

            if (this.addedColorChips === false && this.application.ninja.colorController.colorPanelDrawn) {
                // setup stroke color
                this._strokeColorCtrl.props = {side: 'top', align: 'left', wheel: true, palette: true, gradient: true, image: false, nocolor: true, offset: 8};
                this.application.ninja.colorController.addButton("chip", this._strokeColorCtrl);

                this._strokeColorCtrl.addEventListener("change", this.handleStrokeColorChange.bind(this), false);

                this.addedColorChips = true;
            }

            if (this.addedColorChips) {
                this._strokeColorCtrl.color(this._stroke.colorMode, this._stroke.color);
            }
        }
    },

    handleStrokeColorChange: {
        value: function (e) {
            this.stroke = e._event;
            this.stroke.webGlColor = this.application.ninja.colorController.colorModel.colorToWebGl(e._event.color);
        }
    },

    _subPrepare: {
        value: function() {
            Object.defineBinding(this.strokeMaterial, "items", {
                boundObject: this.application.ninja.appModel,
                boundObjectPropertyPath: "materials",
                oneway: false
            });
        }
    },

    handleAction: {
        value: function(event) {
            var ch = event.currentTarget,
                val = event.currentTarget.identifier;
            switch(val) {
                case "useBorderWidth":
                    this.borderWidth.enabled = ch.checked;
                    break;
                case "useBorderStyle":
                    if(ch.checked) {
                        this.borderStyle.removeAttribute("disabled");
                    } else {
                        this.borderStyle.setAttribute("disabled", "disabled");
                    }
                    break;
                case "useStrokeSize":
                    this.strokeSize.enabled = ch.checked;
                    break;
                case "useWebGL":
                    (ch.checked) ? this._materialsContainer.style["display"] = "" : this._materialsContainer.style["display"] = "none";
                    break;
            }
        }
    }
});
