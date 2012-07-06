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

/**
@requires montage/core/core
@requires montage/ui/component
*/
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.BindingHudOption = Montage.create(Component, {
    _title: {
        value: null
    },

    title: {
        get: function() {
            return this._title;
        },
        set: function(val) {
            this._title = val;
            this.needsDraw = true;
        }
    },

    _promoted : { value: null },
    promoted : {
        get : function() { return this._promoted; },
        set : function(value) {
            if(value === this._promoted) { return; }

            this._promoted = value;

            this.needsDraw = true;
        }
    },

    _bound : { value: null },
    bound : {
        get : function() { return this._bound; },
        set : function(value) {
            if(value === this._bound) { return; }

            this._bound = value;

            this.needsDraw = true;
        }
    },

    prepareForDraw: {
        value: function() {
            // Set Up Listener for click and propagate up to Binding View
            var matchesBound = this.parentComponent.parentComponent.boundProperties.filter(function(obj) {
                return (obj === this.title);
            }.bind(this));
            if(matchesBound.length > 0) this.bound = true;
        }
    },

    draw: {
        value:function() {
            if(this.bound) {
                this.element.classList.add("bound");
            } else {
                this.element.classList.remove("bound");
            }

            if(this.promoted || this.bound) {
                this.element.classList.add("promoted");
            } else {
                this.element.classList.remove("promoted");
            }
//            if(this.bindings.length > 0) {
//                this.element.classList.add("bound");
//            } else {
//                this.element.classList.remove("bound");
//            }
        }
    }
});
