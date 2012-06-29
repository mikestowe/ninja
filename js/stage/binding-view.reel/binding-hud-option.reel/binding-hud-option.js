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

    _promoted : { value: null },
    promoted : {
        get : function() { return this._promoted; },
        set : function(value) {
            if(value === this._promoted) { return; }

            this._promoted = value;

            this.needsDraw = true;
        }
    },

    _bound : { value: null },
    bound : {
        get : function() { return this._bound; },
        set : function(value) {
            if(value === this._bound) { return; }

            this._bound = value;

            this.needsDraw = true;
        }
    },

    prepareForDraw: {
        value: function() {
            // Set Up Listener for click and propagate up to Binding View
            var matchesBound = this.parentComponent.parentComponent.boundProperties.filter(function(obj) {
                return (obj === this.title);
            }.bind(this));
            if(matchesBound.length > 0) this.bound = true;
        }
    },

    draw: {
        value:function() {
            if(this.bound) {
                this.element.classList.add("bound");
            } else {
                this.element.classList.remove("bound");
            }

            if(this.promoted || this.bound) {
                this.element.classList.add("promoted");
            } else {
                this.element.classList.remove("promoted");
            }
//            if(this.bindings.length > 0) {
//                this.element.classList.add("bound");
//            } else {
//                this.element.classList.remove("bound");
//            }
        }
    }
});