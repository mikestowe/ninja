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

var Montage = require("montage/core/core").Montage,
    Component       = require("montage/ui/component").Component;

exports.LocalStorage = Montage.create( Component, {

    canStore: {
        value: null
    },

    deserializedFromTemplate: {
        value: function() {
            this.canStore = window.localStorage;
            this.application.localStorage = this;

            // Redefine setItem and getItem if local storage is not available.
            if(!this.canStore) {
                this.getItem = function() {
                    console.log("Local Storage is not supported on your browser");
                    return "";
                };

                this.setItem = function() {
                    console.log("Local Storage is not supported on your browser");
                    return false;
                }
            }

            // Temporary clear the local storage if we find the version key
            if(window.localStorage.version) {
                window.localStorage.clear();
            }
        }
    },

    getItem: {
        value: function(key) {
            var value = window.localStorage.getItem("ninja-" + key);
            if(value !== null) value = JSON.parse(value);

            return value;
        }
    },

    setItem: {
        value: function(key, value) {
            window.localStorage.setItem("ninja-" + key, JSON.stringify(value));

            return value;
        }
    }
});
