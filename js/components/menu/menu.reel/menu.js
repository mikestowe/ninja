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

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.Menu = Montage.create(Component, {

    _currentDocument: {
            value : null
    },

    currentDocument : {
        get : function() {
            return this._currentDocument;
        },
        set : function(value) {
            if (value === this._currentDocument) {
                return;
            }

            this._currentDocument = value;
        }
    },

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
                this.element.ownerDocument.removeEventListener('mousedown', this, false);
            }
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
