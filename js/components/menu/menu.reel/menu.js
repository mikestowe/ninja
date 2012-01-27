/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.Menu = Montage.create(Component, {

    _active: {
        value: false
    },

    active: {
        get: function() {
            return this._active;
        },
        set: function(value) {
            this._active = value;
        }
    },

    _activeEntry: {
        value: null
    },

    activeEntry: {
        get: function() {
            return this._activeEntry;
        },
        set: function(value) {
            if(this.active) {

                if(this._activeEntry) this._activeEntry.deselect();

                this._activeEntry = value;

                this._activeEntry.select();

            }
        }
    },

    toggleActivation: {
        value: function(item) {
            if(this.active) {
                this._activeEntry.deselect();
                this._activeEntry = null;
                this.active = false;
                this.element.ownerDocument.removeEventListener('mousedown', this, false);
            } else {
                this.active = true;
                this.activeEntry = item;
                this.element.ownerDocument.addEventListener('mousedown', this, false);
            }
        }
    },

    prepareForDraw: {
        value: function() {

        }
    },

    handleMousedown: {
        value: function(evt) {

            if(this.active && (this.getZIndex(evt.target) < 9000 || evt.target.id === "topMenu")) {
                this._activeEntry.deselect();
                this._activeEntry = null;
                this.active = false;

                //console.log(this.rep.objects[1]);
                //this.controller.content[1].header = "BLAH";
            }

//            console.log(evt.target.style['z-index']);
//            console.log(this.getZIndex(evt.target));

        }
    },

    getZIndex: {
        value: function(elem) {

            var position, value, zIndex;
            while (elem && elem !== document) {
//                position = elem.style.position;
                position = document.defaultView.getComputedStyle(elem, "").getPropertyValue("position");

                if (position === "absolute" || position === "relative" || position === "fixed") {
                    // webkit returns a string for zindex value and "" if zindex is not available
//                    zIndex = elem.style['z-index'];
                    zIndex = document.defaultView.getComputedStyle(elem, "").getPropertyValue("z-index");
                    value = parseInt(zIndex, 10);
                    if (!isNaN(value) && value !== 0) {
                        return value;
                    }
                }
                elem = elem.parentNode;
            }
            return 0;
        }
    }

});