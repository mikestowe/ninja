/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
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

exports.MenuEntry = Montage.create(Component, {
    topHeader: {
        value: null
    },

    topHeaderText: {
        value: null
    },

    subEntries: {
        value: null
    },

    // Reference to the parent Menu component
    _menu: {
        value: null
    },

    menu: {
        get: function() {
            return this._menu;
        },
        set: function(value) {
            if(value !== this._menu) {
                this._menu = value;
            }
        }
    },

    _data: {
        value: null
    },

    data: {
        get: function() {
            return this._data;
        },
        set: function(value) {
            if(this._data !== value) {
                this._data = value;
            }
        }
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
            if(value)  this.element.addEventListener("mouseover", this, false);
        }
    },

    captureMousedown: {
        value: function(event) {
            // TODO: Hack! Rework this!
            this.parentComponent.ownerComponent.toggleActivation(this);
        }
    },

    handleMouseover: {
        value: function(event) {
            this.parentComponent.ownerComponent.activeEntry = this;
        }
    },

    prepareForDraw: {
        value: function() {

            this.subEntries.style.display = "none";

            this.topHeaderText.innerHTML = this.data.header;

            this.element.addEventListener("mousedown", this, true);
        }
    }
});
