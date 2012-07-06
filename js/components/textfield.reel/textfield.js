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

exports.TextField = Montage.create(Component, {

    _valueSyncedWithInputField: {
        enumerable: false,
        value: false
    },

    _value: {
        enumerable: false,
        value: ""
    },

    value: {
        enumerable: true,
        serializable: true,
        get: function() {
            return this._value;
        },
        set: function(value) {
            this._value = value;
            this._valueSyncedWithInputField = false;
            this.needsDraw = true;
        }
    },

    handleKeyup: {
        value: function(event) {
            if(event.keyCode === 13) {
                this.element.blur();
            }
        }
    },

    handleBlur: {
        value: function(event) {
            this.value = this.element.value;
            this._valueSyncedWithInputField = true;

            var e = document.createEvent("CustomEvent");
            e.initEvent("change", true, true);
            e.type = "change";
            e.value = this._value;
            this.dispatchEvent(e);
        }
    },

    draw: {
        value: function() {
            if(!this._valueSyncedWithInputField) {
                this.element.value = this._value;
                this._valueSyncedWithInputField = true;
            }
        }
    },

    prepareForDraw: {
        value: function() {
            this.element.addEventListener("blur", this, false);
            this.element.addEventListener("keyup", this, false);
        }
    }
});
