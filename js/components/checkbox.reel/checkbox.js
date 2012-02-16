/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.Checkbox = Montage.create(Component, {

    _valueSyncedWithInputField: {
        enumerable: false,
        value: false
    },

    _wasSetByCode: {
        enumerable: false,
        value: true
    },

    prependLabel: {
        value: false
    },

    label: {
        value: null
    },

    value: {
        value: false
    },

    _checked: {
        enumerable: false,
        value: false
    },

    checked: {
        enumerable: true,
        serializable: true,
        get: function() {
            return this._checked;
        },
        set: function(value) {
            this._checked = value;
            this.needsDraw = true;

            var e = document.createEvent("CustomEvent");
            e.initEvent("change", true, true);
            e.type = "change";
            e.wasSetByCode = this._wasSetByCode;
            e.value = value;
            this.value = value;
            this.dispatchEvent(e);

            this._wasSetByCode = true;
        }
    },

    handleChange:
    {
        value:function(event)
		{
            this._valueSyncedWithInputField = true;
            this._wasSetByCode = false;
            this.checked = this.element.checked;
		}
    },
    handleClick: {
        value: function() {
            this._wasSetByCode = false;
            this.checked = !this.element.checked;
        }
    },
    
    draw: {
        value: function() {
            if(!this._valueSyncedWithInputField)
            {
                this.element.checked = this._checked;
            }
            this._valueSyncedWithInputField = false;
        }
    },

    prepareForDraw: {
        value: function() {
            if (this.label !== null) {
                var b = document.createElement("label");
                b.innerHTML = this.label;
                this.element.appendChild(b);
                b.addEventListener("click", this, false);
            }
            this.element.addEventListener("change", this, false);
        }
    }

});