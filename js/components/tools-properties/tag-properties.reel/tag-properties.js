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

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

var TagProperties = exports.TagProperties = Montage.create(ToolProperties, {
    divElement: {
        value: null,
        serializable: true
    },

    imageElement:   { value: null, serializable: true },
    videoElement:   { value: null, serializable: true },
    canvasElement:  { value: null, serializable: true },
    customElement:  { value: null, serializable: true },
    classField:     { value: null, serializable: true },
    customName:     { value: null, serializable: true },
    customLabel:    { value: null, serializable: true },

    addedColorChips: { value: false },

    _fillColorCtrl: {
        value: null,
        serializable: true
    },

    _fill: {
        enumerable: false,
        value: { colorMode: 'nocolor', color: null, webGlColor: null }
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

    _subPrepare: {
        value: function() {
            this.customName.style["display"] = "none";
            this.customLabel.style["display"] = "none";

            this.divElement.addEventListener("click", this, false);
            this.imageElement.addEventListener("click", this, false);
            this.videoElement.addEventListener("click", this, false);
            this.canvasElement.addEventListener("click", this, false);
            this.customElement.addEventListener("click", this, false);
        }
    },

    draw: {
        enumerable: false,
        value: function () {
            Object.getPrototypeOf(TagProperties).draw.call(this);

            if (this.addedColorChips === false && this.application.ninja.colorController.colorPanelDrawn) {
                this._fillColorCtrl.props = { side: 'top', align: 'center', wheel: true, palette: true, gradient: true, image: false, nocolor: true, offset: -80 };
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
//            this.fill.webGlColor = this.application.ninja.colorController.colorModel.colorToWebGl(e._event.color);
        }
    },

    handleClick: {
        value: function(event) {
            this.selectedElement = event._event.target.value;

            if(this.selectedElement === "custom") {
                this.customName.style["display"] = "";
                this.customLabel.style["display"] = "";
            } else {
                this.customName.style["display"] = "none";
                this.customLabel.style["display"] = "none";
            }
        }
    },

    _selectedElement: {
        value: "div", enumerable: false
    },

    selectedElement: {
        get: function() { return this._selectedElement;},
        set: function(value) { this._selectedElement = value; }
    }

});
