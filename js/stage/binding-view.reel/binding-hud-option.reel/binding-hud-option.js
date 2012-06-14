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
    _title: {
        value: null
    },

    title: {
        get: function() {
            return this._title;
        },
        set: function(val) {
            this._title = val;
            this.needsDraw = true;
        }
    },

    bound: {
        value: false
    },

    _hudOptions: {
        value: []
    },

    hudOptions: {
        get: function() {
            return this._hudOptions;
        },
        set: function(val) {
            if (typeof(val) !== "undefined") {
                this._hudOptions = val;
                this.title = val.title;
                this.bound = val.bound;
            } else {
                this._hudOptions = null;
            }
            this.needsDraw = true;

        }
    },

    prepareForDraw: {
        value: function() {
            // Set Up Listener for click and propagate up to Binding View
        }
    },

    draw: {
        value:function() {
            if(this.bound) {
                console.log(this.title);
                this.element.classList.add("bound");
            } else {
                this.element.classList.remove("bound");
            }
//            if(this.bindings.length > 0) {
//                this.element.classList.add("bound");
//            } else {
//                this.element.classList.remove("bound");
//            }
        }
    }
});