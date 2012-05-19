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

exports.bindingView = Montage.create(Component, {
    _bindables: {
        value: []
    },
    bindables: {
        get: function() {
            return this._bindables;
        },
        set: function(val) {
            this._bindables = val;
        }
    },


    nonVisualComponents: {
        get: function() {
            return this._bindables;
        },
        set: function(val) {
            this._bindables = val;
        }
    }
});