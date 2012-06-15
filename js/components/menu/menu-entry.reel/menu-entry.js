/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.MenuEntry = Montage.create(Component, {
    topHeader: { value: null },
    topHeaderText: { value: null },

    // Reference to the parent Menu component
    _menu: {
        value: null
    },

    data: {
        value: null
    },

    select: {
        value: function() {
            this.element.classList.add("selected");
            this.subEntries.style.display = "block";
        }
    },

    deselect: {
        value: function() {
            this.element.classList.remove("selected");
            this.subEntries.style.display = "none";
        }
    },

    _menuIsActive: {
        value: false
    },

    menuIsActive: {
        get: function() {
            return this._menuIsActive;
        },
        set: function(value) {
            if(value)  this.topHeader.addEventListener("mouseover", this, false);
        }
    },

    captureMousedown: {
        value: function(event) {
            this._menu.toggleActivation(this);
        }
    },

    handleMouseover: {
        value: function(event) {
            this._menu.activeEntry = this;
        }
    },

    prepareForDraw: {
        value: function() {

            this.subEntries.style.display = "none";

            this.topHeaderText.innerHTML = this.data.header;

            this.element.addEventListener("mousedown", this, true);

            Object.defineBinding(this, "menuIsActive", {
                boundObject: this._menu,
                boundObjectPropertyPath: "active",
                oneway: true
            });

        }
    }
});