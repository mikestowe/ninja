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

exports.Splitter = Montage.create(Component, {

    version: {
        value: "1.0"
    },

    hasTemplate: {
        value: false
    },

    _panel: {
        value: null
    },

    panel: {
        get: function() {
            return this._panel;
        },
        set: function(value) {
            this._panel = value;
        }
    },

    _resizeBar: {
        value: null
    },

    resizeBar: {
        get: function() {
            return this._resizeBar;
        },
        set: function(val) {
            this._resizeBar = val;
        },
        serializable: true
    },

    _collapsed : {
        value: false,
        enumerable:true
    },

    collapsed: {
        get: function() {
            return this._collapsed;
        },
        set: function(value) {
            this._collapsed = value;
            this.application.localStorage.setItem(this.element.getAttribute("data-montage-id"), {"version": this.version, "value": value});
        }
    },

    prepareForDraw: {
        value: function() {
            //Get splitter initial value from SettingManager
            var storedData = this.application.localStorage.getItem(this.element.getAttribute("data-montage-id"));
            if(storedData && this.element.getAttribute("data-montage-id") !== null) {
                this._collapsed = storedData.value;

            } else {
                this._collapsed = false;
            }

            this.element.addEventListener("click", this, false);
        }
    },

    draw: {
        value: function() {
            if(this.collapsed) {
                if(this.panel.element) this.panel.element.classList.add("collapsed");
                else this.panel.classList.add("collapsed");
                this.element.classList.add("collapsed");
                if(this._resizeBar != null) this.resizeBar.classList.add("collapsed");
            } else {
                if(this.panel.element) this.panel.element.classList.remove("collapsed");
                else this.panel.classList.remove("collapsed");
                this.element.classList.remove("collapsed");
                if(this._resizeBar != null) this.resizeBar.classList.remove("collapsed");
            }
        }
    },

    handleClick : {
        value: function() {
            if (!this.disabled) {
                if(this.panel.element) {
                    this.panel.element.addEventListener("webkitTransitionEnd", this, false);
                } else {
                    this.panel.addEventListener("webkitTransitionEnd", this, false);
                }
                this.collapsed = !this.collapsed;
                this.needsDraw = true;
            }
        }
    },

    handleWebkitTransitionEnd: {
        value: function() {
            if(this.panel.element) {
                this.panel.element.removeEventListener("webkitTransitionEnd", this, false);
            } else {
                this.panel.removeEventListener("webkitTransitionEnd", this, false);
            }
            if(this.application.ninja.currentDocument && this.application.ninja.currentDocument.currentView === "design"){
                this.application.ninja.stage.resizeCanvases = true;
            }
        }
    },

    _disabled: {
        value: null
    },

    disabled: {
        get: function() {
            return this._disabled;
        },
        set: function(val) {
            if (val && !this.element.classList.contains("disabled")) {
                this.element.classList.add("disabled");
            } else {
                this.element.classList.remove("disabled");
            }
            this._disabled = val;
        }
    },

    toggle: {
        value: function() {
            this.handleClick();
        }
    },

    collapse:{
        value: function() {
            if (this.collapsed === false) {
                if(this.panel.element) {
                    this.panel.element.addEventListener("webkitTransitionEnd", this, false);
                } else {
                    this.panel.addEventListener("webkitTransitionEnd", this, false);
                }
                this._collapsed = true;
                this.disabled = true;
                this.needsDraw = true;
            }
        }
    },
    restore:{
        value: function(onSwitchFromCodeDocument) {
            //Get splitter initial value from SettingManager
            var storedData = this.application.localStorage.getItem(this.element.getAttribute("data-montage-id")), temp = this.collapsed;
            if(storedData && this.element.getAttribute("data-montage-id") !== null) {
                this._collapsed = storedData.value;

            } else {
                this._collapsed = false;
            }
            if(temp != this._collapsed){
                if(this.panel.element) {
                    this.panel.element.addEventListener("webkitTransitionEnd", this, false);
                } else {
                    this.panel.addEventListener("webkitTransitionEnd", this, false);
                }
                this.disabled = false;
                if(onSwitchFromCodeDocument) {
                    this.draw();    // When switching from code document, draw immediately so stage size is correct
                } else {
                    this.needsDraw = true;
                }
            }
        }
    }
});
