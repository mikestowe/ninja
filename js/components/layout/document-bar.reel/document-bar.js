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

exports.DocumentBar = Montage.create(Component, {

    _currentDocument: {
        enumerable: false,
        value: null
    },

    currentDocument: {
        enumerable: false,
        get: function() {
            return this._currentDocument;
        },
        set: function(value) {
            if (value === this._currentDocument) {
                return;
            }

            this._currentDocument = value;

            this.disabled = !this._currentDocument;

            if(this._currentDocument && this._currentDocument.currentView === "design") {
                this.visible = true;
            } else if(this._currentDocument && this._currentDocument.currentView === "code") {
                this.visible = false;
            }
        }
    },

    _visible: {
        value: false
    },

    visible: {
        get: function() {
            return this._visible;
        },
        set: function(value) {
            if(this._visible !== value) {
                this._visible = value;
                this.needsDraw = true;
            }
        }
    },

    designView: {
        value: null
    },

    codeView: {
        value: null
    },

    zoomControl: {
        value: null,
        serializable: true
    },

    _type: {
        value: null
    },

    type: {
        enumerable: false,
        get: function() { return this._type; },
        set: function(value) {
            if (this._type === value) {
                return;
            }

            this._type = value;
            this.needsDraw = true;

        }
    },

    _currentView: {
        value: null
    },

    currentView: {
        get: function() { return this._currentView},
        set: function(value) {
            if (this._currentView === value) {
                return;
            }

            this._currentView = value;
            this.needsDraw = true;
        }
    },

    _zoomFactor: {
        value: 100
    },

    zoomFactor: {
        get: function() { return this._zoomFactor; },

        set: function(value)
        {
            if(value !== this._zoomFactor)
            {
                this._zoomFactor = value;
                if (!this._firstDraw)
                {
                    this.application.ninja.stage.setZoom(value);
                }
            }
        }
    },

    draw: {
        value: function() {
            /*
            if(this.type === "htm" || this.type === "html") {
                this.designView.classList.add("active");
                this.codeView.classList.add("active");

                if(this.currentView === "design") {
                    this.designView.classList.add("selected");
                    if(this.codeView.classList.contains("selected")) this.codeView.classList.toggle("selected");
                } else {
                    this.codeView.classList.add("selected");
                    if(this.designView.classList.contains("selected")) this.designView.classList.toggle("selected");
                }

            } else if(this.type) {
                this.designView.classList.remove("active");
            }
            */
            if(this.visible) {
                this.element.style.display = "block";
            } else {
                this.element.style.display = "none";
            }

        }
    },

    prepareForDraw: {
        value: function() {
//            this.designView.addEventListener("click", this, false);
//            this.codeView.addEventListener("click", this, false);

        }
    },

    _disabled: {
        value: true
    },

    disabled: {
        get: function() {
            return this._disabled;
        },
        set: function(value) {
            if(value !== this._disabled) {
                this._disabled = value;
            }
        }
    },


    handleClick: {
        value: function(event) {
            if(event._event.target.id === this.currentView) return;

            this.currentView = event._event.target.id;
            this.application.ninja.documentController.stage.stageView.switchDesignDocViews(event._event.target.id);//switch between design view
        }
    }
});
