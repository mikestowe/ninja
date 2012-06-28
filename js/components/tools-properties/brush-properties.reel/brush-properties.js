/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
