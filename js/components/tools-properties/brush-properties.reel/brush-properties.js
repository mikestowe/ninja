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

var BrushProperties = exports.BrushProperties = Montage.create(ToolProperties, {
    addedColorChips: { value: false },

    _fillColorCtrl: {
        value: null,
        serializable: true
    },

    _strokeSize: {
        value: null,
        serializable: true
    },

    _strokeHardness: {
        value: null,
        serializable: true
    },

    _doSmoothing: {
        value: null,
        serializable: true
    },

    _smoothingAmount: {
        value: null,
        serializable: true
    },

    _useCalligraphic: {
        value: null,
        serializable: true
    },

    _strokeAngle: {
        value: null,
        serializable: true
    },

    _angleLabel: {
        value: null,
        serializable: true
    },

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
            Object.getPrototypeOf(BrushProperties).draw.call(this);

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

    _subPrepare: {
        value: function() {
            this.handleChange(null);
            this._useCalligraphic.addEventListener("change", this, false);
            this._doSmoothing.addEventListener("change", this, false);
        }
    },
    handleChange: {
        value: function(event) {
            if(this._useCalligraphic.checked) {
                this._strokeAngle.element.style["display"] = "";
                this._strokeAngle.visible = true;
                this._angleLabel.style["display"] = "";
            } else {
                this._strokeAngle.element.style["display"] = "none";
                this._strokeAngle.visible = false;
                this._angleLabel.style["display"] = "none";
            }
            if(this._doSmoothing.checked) {
                this._smoothingAmount.element.style["display"] = "";
                this._smoothingAmount.visible = true;
            } else {
                this._smoothingAmount.element.style["display"] = "none";
                this._smoothingAmount.visible = false;
            }
        }
    },

    handleFillColorChange: {
        value: function (e) {
            this.fill = e._event;
            this.fill.webGlColor = this.application.ninja.colorController.colorModel.colorToWebGl(e._event.color);
        }
    },

    strokeSize: {
        get: function() { return this._strokeSize; }
    },
    strokeHardness: {
        get: function() { return this._strokeHardness; }
    },
    doSmoothing:{
        get: function() {return this._doSmoothing.checked; }
    },
    smoothingAmount:{
        get: function() {return this._smoothingAmount;}
    },
    useCalligraphic: {
        get: function() {return this._useCalligraphic.checked;}
    },
    strokeAngle: {
        get: function() {return this._strokeAngle;}
    }
});
