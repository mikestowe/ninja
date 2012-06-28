/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.StageMode = Montage.create(Component, {

    _chromePreview: {
        value: null
    },

    chromePreview: {
        get: function() {
            return this._chromePreview;
        },
        set: function(value) {
            if(value !== this._chromePreview) {
                this._chromePreview = value;
                this.needsDraw = true;
            }
        }
    },

    prepareForDraw: {
        value: function() {
            this.element.addEventListener("click", this, false);
        }
    },

    draw: {
        value: function() {
            if(this._livePreview) {
                this.element.classList.remove("editMode");
                this.element.classList.add("liveMode");

            } else {
                this.element.classList.remove("liveMode");
                this.element.classList.add("editMode");
            }
        }
    },

    handleClick: {
        value: function(event) {
            this.chromePreview = !this.chromePreview;
        }
    }
});