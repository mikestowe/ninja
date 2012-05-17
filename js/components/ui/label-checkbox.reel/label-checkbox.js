/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.LabelCheckbox = Montage.create(Component, {

    _label: {
        value: ""
    },

    label: {
        get: function() {
            return this._label;
        },
        set: function(value) {
            if(this._label !== value) {
                this._label = value;
                this.needsDraw = true;
            }
        }
    },

    _checked: {
        value: false
    },

    checked: {
        serializable: true,
        get: function() {
            return this._checked;
        },
        set: function(value) {
            if(this._checked !== value) {
                this._checked = value;
                this.needsDraw = true;
            }
        }
    },

    _enabled: {
        enumerable: false,
        value: true
    },

    enabled: {
        enumerable: true,
        serializable: true,
        get: function() {
            return this._enabled;
        },
        set: function(value) {
            if(value !== this._enabled) {
                this._enabled = value;
                this.needsDraw = true;
            }
        }
    },

    value: {
        value: false
    },

    handleAction: {
        value: function(event) {
            var e = document.createEvent("CustomEvent");
            e.initEvent("change", true, true);
            e.type = "change";
            e.wasSetByCode = false;
            this.checked = this.value = e.value = this._checkbox.checked;
            this.dispatchEvent(e);
        }
    },

    draw: {
        value: function() {
            this._labelText.value = this.label;
            this._checkbox.checked = this.checked;
            this._checkbox.disabled = !this._enabled;
        }

    }
});