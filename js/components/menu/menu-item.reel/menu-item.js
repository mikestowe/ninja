/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.MenuItem = Montage.create(Component, {

    itemBackground: {
        value: null
    },

    itemText: {
        value: null
    },

    subMenu: {
        value: null
    },

    data: {
        value: null
    },

    _enabled: {
        value: false
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

            if(this.data.submenu) {
                this.submenu = true;
                this.subentries = this.data.entries;
                this.subMenu.classList.add("subMenu");
            }

            this.element.addEventListener("mouseover", this, false);
            this.element.addEventListener("mouseout", this, false);

            this.itemText.innerHTML = this.data.displayText;
            this.element.addEventListener("mouseup", this, true);
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

    captureMouseup: {
        value: function(event) {

            if(this.data.radio && this.checked){
                this.parentComponent.ownerComponent.toggleOnMenuItemAction();
                return;
            }

            if( ( this.enabled === true || this.enabled > 0 ) && (this.submenu === false) ) {
                if(this.data.action) {
                    NJevent ( this.data.action );
                } else  if(this.checked !== null) {
                    this.checked = !this.checked;
                }
                this.parentComponent.ownerComponent.toggleOnMenuItemAction();
            }

        }
    },

    handleMouseover: {
        value: function() {
            if(this.enabled){
                this.element.style.backgroundColor = "#7f7f7f";
                this.element.style.cursor = "pointer";
                if(this.data.submenu) {
                    this.subMenu.style.display = "block";
                }
            }
        }
    },

    handleMouseout: {
        value: function() {
            this.element.style.backgroundColor = "#474747";
            if(this.data.submenu) {
                this.subMenu.style.display = "none";
            }
        }
    }

});
