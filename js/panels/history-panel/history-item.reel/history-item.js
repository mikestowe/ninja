/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage     = require("montage/core/core").Montage,
    Component   = require("montage/ui/component").Component;

exports.HistoryItem = Montage.create(Component, {
    _title: {
        value: null
    },

    title: {
        get: function() {
            return this._title;
        },
        set: function(value) {
            if(value !== this._title) {
                this._title = value;
                this.needsDraw = true;
            }
        }
    },

    draw: {
        value: function() {
            this.element.innerHTML = this.title;
        }
    }
});