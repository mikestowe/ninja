/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.ToolProperties = Montage.create(Component, {
    
    _visible: {
        value: false, enumerable: false
    },

    visible: {
        get: function() { return this._visible;},
        set: function(value) { this._visible = value; this.needsDraw = true;}
    },

    prepareForDraw: {
        enumerable: false,
        value: function() {
            this.element.style.display = "none";

            this._subPrepare();
        }
    },

    _subPrepare: {
        value: function() { /* Overwrite this in the child */ }
    },

    draw: {
        enumerable: false,
        value: function() {
            if(this.visible) {
                this.element.style.display = "";
            } else {
                this.element.style.display = "none";
            }
        }
    }



});