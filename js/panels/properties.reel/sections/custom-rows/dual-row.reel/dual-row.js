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

exports.DualRow = Montage.create(Component, {
    id: {
        value: null
    },

    label: {
        value: null
    },

    label2:{
        value: null
    },

    content: {
        value: null
    },

    content2: {
        value: null
    },

    eventDelegate: {
        value: null
    },

    divider: {
        value: false
    },

    prepareForDraw: {
        value: function() {
            if (this.divider) this.element.appendChild(document.createElement("hr"));
            if(this.label !== null) {
                this.element.getElementsByClassName("lbl")[0].innerHTML = this.label + ":";
            }
            if(this.label2 !== null) {
                if(this.content2.type === "button") {
                    this.content2.label = this.label2;
                    this.element.getElementsByClassName("lbl")[1].style.display = "none";
                } else {
                    this.element.getElementsByClassName("lbl")[1].innerHTML = this.label2 + ":";
                }
            } else {
                this.element.getElementsByClassName("lbl")[1].style.display = "none";
            }
        }
    }

});
