/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

var PenProperties = exports.PenProperties = Montage.create(ToolProperties, {
    addedColorChips: { value: false },

    _penToolRadio: {
        value: null,
        serializable: true
    },

    _penPlusRadio: {
        value: null,
        serializable: true
    },

    _penMinusRadio: {
        value: null,
        serializable: true
    },

    _subPrepare: {
        value: function() {
            this._penToolRadio.addEventListener("click", this, false);
            this._penPlusRadio.addEventListener("click", this, false);
            this._penMinusRadio.addEventListener("click", this, false);
        }
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

    strokeSize: {
        get: function () {
            return this._strokeSize; 
        }
    },

    _selectedSubtool: {
        value: "pen", enumerable: false
    },

    selectedSubtool: {
        get: function() { return this._selectedSubtool;},
        set: function(value) { this._selectedSubtool = value; }
    },

    handleClick: {
        value: function(event) {
            this._selectedSubtool = event._event.target.value;
            NJevent("penSubToolChange");
        }
    },

    draw: {
        enumerable: false,
        value: function () {
            Object.getPrototypeOf(PenProperties).draw.call(this);

            if (this.addedColorChips === false && this.application.ninja.colorController.colorPanelDrawn) {
                // setup fill color
                this._fillColorCtrl.props = {side: 'top', align: 'center', wheel: true, palette: true, gradient: true, image: false, nocolor: true, offset: -80};
                this.application.ninja.colorController.addButton("chip", this._fillColorCtrl);

                // setup stroke color
                this._strokeColorCtrl.props = {side: 'top', align: 'center', wheel: true, palette: true, gradient: true, image: false, nocolor: true, offset: -80};
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