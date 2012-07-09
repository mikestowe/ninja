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

exports.LabelCheckbox = Montage.create(Component, {

    _label: {
        value: ""
    },

    label: {
        get: function() {
            return this._label;
        },
        set: function(value) {
            if(this._label !== value) {
                this._label = value;
                this.needsDraw = true;
            }
        }
    },

    _checked: {
        value: false
    },

    checked: {
        serializable: true,
        get: function() {
            return this._checked;
        },
        set: function(value) {
            if(this._checked !== value) {
                this._checked = value;
                this.needsDraw = true;
            }
        }
    },

    _enabled: {
        enumerable: false,
        value: true
    },

    enabled: {
        enumerable: true,
        serializable: true,
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

    value: {
        value: false
    },

    handleAction: {
        value: function(event) {
            var e = document.createEvent("CustomEvent");
            e.initEvent("change", true, true);
            e.type = "change";
            e.wasSetByCode = false;
            this.checked = this.value = e.value = this._checkbox.checked;
            this.dispatchEvent(e);
        }
    },

    draw: {
        value: function() {
            this._labelText.value = this.label;
            this._checkbox.checked = this.checked;
            this._checkbox.disabled = !this._enabled;
        }

    }
});
