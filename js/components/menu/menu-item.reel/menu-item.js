/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.MenuItem = Montage.create(Component, {

    data: {
        value: null
    },

    _enabled: {
        value: null
    },

    enabled: {
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

    _checked: {
        value: null
    },

    checked: {
        get: function() {
            return this._checked;
        },
        set: function(value) {
            /*
            if( Object.prototype.toString.call( value ) === '[object Array]' ) {
                value =  value.indexOf(this.data.displayText + "Panel") >= 0;
            }
            */

            if(this._checked !== value) {
                this._checked = value;
                this.needsDraw = true;
            }
        }
    },

    submenu: {
        value: false
    },

    subentries: {
        value: []
    },

    prepareForDraw: {
        value: function() {
            var boundObject = this.application.ninja, strArr = null, i=0;

            if(!this.data) return;

            if(this.data.separator) {
                this.element.classList.add("itemSeparator");
                this.itemBackground.classList.remove("menubg");
                this.itemBackground.classList.add("separator");

                return;

            }

            // Binding the checked to the assigned bound property
            if(this.data.checked) {
                Object.defineBinding(this, "checked", {
                  boundObject: this.application.ninja.appModel,
                  boundObjectPropertyPath: this.data.checked.boundProperty
                });

            }

            if(this.data.enabled.boundProperty) {

                boundObject = this.application.ninja[this.data.enabled.boundObj];

                Object.defineBinding(this, "enabled", {
                  boundObject: boundObject,
                  boundObjectPropertyPath: this.data.enabled.boundProperty,
                  boundValueMutator: this.data.enabled.boundValueMutator,
                  oneway : this.data.enabled.oneway
                });

            } else {
                this.enabled = this.data.enabled;
            }

            if(this.data.submenu) {
                this.submenu = true;

                this.subentries = this.data.entries;

                this.subMenu.classList.add("subMenu");
                this.element.addEventListener("mouseover", this, false);
                this.element.addEventListener("mouseout", this, false);

            }


            this.itemText.innerHTML = this.data.displayText;
            this.element.addEventListener("mousedown", this, true);
        }
    },

    draw: {
        value: function() {

            if(this.enabled) {
                this.element.classList.remove("disabled");
            } else {
                this.element.classList.add("disabled");
            }

            if(this.checked) {
                this.itemBackground.classList.add("checked");
            } else {
                this.itemBackground.classList.remove("checked");
            }

            if(this.submenu) {
                this.itemBackground.classList.add("submenu");
            }
        }
    },

    captureMousedown: {
        value: function(event) {

            if(this.data.radio && this.checked) return;

            if((this.enabled === true) && (this.submenu === false) ) {
                if(this.data.action) {
                    NJevent ( this.data.action );
                } else  if(this.checked !== null) {
                    this.checked = !this.checked;
                }
            }

        }
    },

    handleMouseover: {
        value: function() {
            if(this.enabled) this.subMenu.style.display = "block";
        }
    },

    handleMouseout: {
        value: function() {
            this.subMenu.style.display = "none";
        }
    }

});