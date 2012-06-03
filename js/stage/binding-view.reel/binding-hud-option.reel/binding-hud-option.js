/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/**
@requires montage/core/core
@requires montage/ui/component
*/
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.BindingHudOption = Montage.create(Component, {
    title: {
        value: "value"
    },
    _bindings: {
        value: []
    },

    bindings: {
        get: function() {
            return this._bindings;
        },
        set: function(val) {
            this._bindings = val;
            this.needsDraw = true;
        }
    },

    draw: {
        value:function() {
            if(this.bindings.length > 0) {
                this.element.classList.add("bound");
            } else {
                this.element.classList.remove("bound");
            }
        }
    }
});