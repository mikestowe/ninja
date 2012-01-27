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
            this.lockButton.addEventListener("click", this, false);

            this._setBindings([this.TRRadiusControl, this.BLRadiusControl, this.BRRadiusControl]);
            this._setCap([this.TLRadiusControl,this.TRRadiusControl, this.BLRadiusControl, this.BRRadiusControl]);

        }
    },

    handleClick: {
        value: function(event) {
            this._unlocked = !this._unlocked;

            this.TRRadiusControl.enabled = this.BLRadiusControl.enabled = this.BRRadiusControl.enabled = this._unlocked;

            if(this._unlocked) {
                this.lockButton.classList.remove("LockToolUp");
                this.lockButton.classList.add("UnLockToolUp");
                this._removeBindings([this.TRRadiusControl, this.BLRadiusControl, this.BRRadiusControl]);
            } else {
                this.lockButton.classList.remove("UnLockToolUp");
                this.lockButton.classList.add("LockToolUp");
                this._setBindings([this.TRRadiusControl, this.BLRadiusControl, this.BRRadiusControl]);
            }
        }
    },

    // Public API
    use3D: {
        get: function() { return this.base._use3D; }
    },
    
    strokeSize: {
        get: function() { return this.base._strokeSize; }
    },

    strokeStyle : {
        get: function() { return this.base._strokeStyle.options[this.base._strokeStyle.value].text; }
    },

    strokeStyleIndex : {
        get: function() { return this.base._strokeStyle.options[this.base._strokeStyle.value].value; }
    },

    strokeMaterial: {
        get: function() { return this.base._strokeMaterial.options[this.base._strokeMaterial.value].value; }
    },

    fillMaterial: {
        get: function() { return this.base._fillMaterial.options[this.base._fillMaterial.value].value; }
    },

    _setBindings: {
        value: function(els) {
            var that = this;
            els.forEach(function(el) {
                Object.defineBinding(el, "value", {
                    boundObject: that.TLRadiusControl,
                    boundObjectPropertyPath: "value",
                    boundValueMutator: function(value) {
                        if (typeof value === "string") {
                            return parseFloat(value);
                        }

                        return value;
                    }
                });

                Object.defineBinding(el, "units", {
                    boundObject: that.TLRadiusControl,
                    boundObjectPropertyPath: "units"
                });
            });
        }
    },

    _removeBindings: {
        value: function(els) {
            els.forEach(function(el) {
                Object.deleteBindings(el);
            });
        }
    },

    _setCap: {
        value: function(els) {
            var that = this;
            els.forEach(function(el) {
                el.addEventListener("change", that, false);
            });
        }
    },

    handleChange: {
        value: function(event) {
            var hotTxt = event.currentTarget
            if(hotTxt.units === "%") {
                if(hotTxt.value > 50) {
                    hotTxt.maxValue = 50;
                }
                return hotTxt.value;
            }
            
        }
    }


});