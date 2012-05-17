/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.RectProperties = Montage.create(ToolProperties, {
    base:       { value: null },
    lockButton: { value: null, enumerable: false},
    TLRadiusControl: { value: null, enumerable: false },
    TRRadiusControl: { value: null, enumerable: false },
    BLRadiusControl: { value: null, enumerable: false },
    BRRadiusControl: { value: null, enumerable: false },

    _unlocked: { value: false, enumerable: false},

    _subPrepare: {
        value: function() {
        }
    },

    handleLockButtonAction: {
        value: function(event) {
            this.TRRadiusControl.enabled = this.BLRadiusControl.enabled = this.BRRadiusControl.enabled = !this.lockButton.pressed;

            if(this.lockButton.pressed) {
                this._syncRadii(this.TLRadiusControl.value, this.TLRadiusControl.units);
            }
        }
    },

    // Public API
    fill: {
        get: function () { return this.base.fill; }
    },

    stroke: {
        get: function () { return this.base.stroke; }
    },

    use3D: {
        get: function() { return this.base._use3D; }
    },
    
    strokeSize: {
        get: function() { return this.base._strokeSize; }
    },

    strokeStyle : {
        get: function() {
//            return this.base._strokeStyle.options[this.base._strokeStyle.value].text;
            return "Solid";
        }
    },

    strokeStyleIndex : {
        get: function() {
//            return this.base._strokeStyle.options[this.base._strokeStyle.value].value;
            return 1;
        }
    },

    strokeMaterial: {
        get: function() { return this.base._strokeMaterial.value; }
    },

    fillMaterial: {
        get: function() { return this.base._fillMaterial.value; }
    },

    handleChanging: {
        value: function(event) {
            if(event.wasSetByCode) {
                return;
            }

            this._setBorderRadius(event);
        }
    },

    handleChange: {
        value: function(event) {
            if(event.wasSetByCode) {
                return;
            }

            this._setBorderRadius(event);
        }
    },

    _setBorderRadius: {
        value: function(event) {
            var hotTxt = event.currentTarget;
            if(hotTxt.units === "%") {
                if(hotTxt.value > 50) {
                    hotTxt.maxValue = 50;
                }
            }

            if(this.lockButton.pressed && (this.TLRadiusControl === hotTxt)) {
                this._syncRadii(hotTxt.value, hotTxt.units);
            }
        }
    },

    _syncRadii: {
        value: function(value, units) {
            this.TRRadiusControl.value = value;
            this.BLRadiusControl.value = value;
            this.BRRadiusControl.value = value;

            this.TRRadiusControl.units = units;
            this.BLRadiusControl.units = units;
            this.BRRadiusControl.units = units;
        }
    }

});