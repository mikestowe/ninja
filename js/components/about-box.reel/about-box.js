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
Component = require("montage/ui/component").Component,
Popup = require("montage/ui/popup/popup.reel").Popup;

var AboutBox = exports.AboutBox = Montage.create(Component, {
    _ninjaVersionString: {
        enumerable: false,
        value: null
    },

    _popup: {
        enumerable: false,
        value: null
    },

    captureMouseup: {
        value: function(event) {
            document.removeEventListener("mouseup", this, true);
            this._popup.hide();
        }
    },

    captureMousedown: {
        value: function(event) {
            // ignore clicks on our links to the license, credits or project page
            if(event._event.srcElement.className !== 'aboutBoxAnchor') {
                document.addEventListener("mouseup", this, true);
                document.removeEventListener("mousedown", this, true);
            }
        }
    },

    prepareForDraw: {
        value: function() {
            if(this._ninjaVersionString == null) {
                this._ninjaVersionString = this.application.ninja.ninjaVersion;
            }

            if(this._ninjaVersionString) {
                var verNum = document.getElementById("aboutBoxVersionNumber");
                if(verNum) {
                     verNum.innerHTML = this._ninjaVersionString;
                 }
            }
        }
    },
    draw: {
        enumerable: false,
        value: function() {
        }
    },

    show: {
        value: function() {
            document.addEventListener("mousedown", this, true);
            var popup = this.application._alertPopup, about;
            if(!popup) {
                popup = Popup.create();
                this._popup = popup;

                popup.modal = true;
                this.application._alertPopup = popup;

                about = AboutBox.create();
                popup.content = about;
            }
            popup.show();
        }
    }
});
