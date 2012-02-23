/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.TextField = Montage.create(Component, {

    _valueSyncedWithInputField: {
        enumerable: false,
        value: false
    },
    
    _value: {
        enumerable: false,
        value: ""
    },

    value: {
        enumerable: true,
        serializable: true,
        get: function() {
            return this._value;
        },
        set: function(value) {
            this._value = value;
            this.needsDraw = true;
        }
    },

    handleKeyup: {
        value: function(event) {
            if(event.keyCode === 13) {
                this.element.blur();
            }
        }
    },

    handleBlur: {
        value: function(event) {
            this._value = this.element.value;
            this._valueSyncedWithInputField = true;

            var e = document.createEvent("CustomEvent");
            e.initEvent("change", true, true);
            e.type = "change";
            e.value = this._value;
            this.dispatchEvent(e);
        }
    },
    /*
    handleChange:
    {
        value:function(event)
		{
            this._value = this.element.value;
            this._valueSyncedWithInputField = true;

            var e = document.createEvent("CustomEvent");
            e.initEvent("change", true, true);
            e.type = "change";
            e.value = this._value;
            this.dispatchEvent(e);
		}
    },
    */

    draw: {
        value: function() {
            if(!this._valueSyncedWithInputField)
            {
                this.element.value = this._value;
                this._valueSyncedWithInputField = true;
            }
        }
    },

    prepareForDraw: {
        value: function() {
            //this.element.addEventListener("change", this, false);
            this.element.addEventListener("blur", this, false);
            this.element.addEventListener("keyup", this, false);
        }
    }
});