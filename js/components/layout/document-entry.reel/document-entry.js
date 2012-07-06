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

exports.DocumentEntry = Montage.create(Component, {

    label: {
        value: null,
        serializable: true
    },

    _document: {
        value: null
    },

    document: {
        enumerable: false,
        get: function() {
            return this._document;
        },
        set: function(value) {
            if (this._document === value) {
                return;
            }

            this._document = value;
        }
    },

    _name: {
        value: null
    },

    name: {
        enumerable: false,
        get: function() {
            return this._name;
        },
        set: function(value) {

            if (this._name === value) {
                return;
            }

            this._name = value;
            this.needsDraw = true;
        }
    },

    _saveFlag: {
        value: false
    },

    saveFlag: {
        get: function() {
            return this._saveFlag;
        },
        set: function(value) {
            if(this._saveFlag !== value) {
                this._saveFlag = value;
                this.needsDraw = true;
            }
        }
    },

    draw: {
        enumerable: false,
        value: function() {
            this.label.innerText = this._name ? this._name : "";

            if(this.saveFlag) {
                this.label.classList.add("dirty");
            } else {
                this.label.classList.remove("dirty");
            }
        }
    },

    handleCloseButtonAction: {
        value: function() {
            this.application.ninja.documentController.closeFile(this.document);
        }
    }

});
