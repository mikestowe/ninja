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

exports.Resizer = Montage.create(Component, {

    version: {
        value: "1.0"
    },

    hasTemplate: {
        value: false
    },

    // This property might not be needed anymore.
    // TODO - Review this once we the the new panels in place
    ownerId: {
        value: ""
    },

    willSave: {
        value: true
    },

    _value: {
        value: null
    },

    value: {
        get: function() {
            return this._value;
        },
        set: function(val) {
            this._value = val;
        }
    },

    redrawStage: {
        value:false
    },

    _isInversed: {
        value: false
    },

    isInversed: {
        get: function() {
            return this._isInversed;
        },
        set: function(val) {
            this._isInversed = val;
        },
        serializable: true
    },

    _isVertical: {
        value: null
    },

    isVertical: {
        get: function() {
            return this._isVertical;
        },
        set: function(val) {
            this._isVertical = val;
        },
        serializable: true
    },

    _isPanel: {
        value: true
    },
    isPanel: {
        get: function() {
            return this._isPanel;
        },
        set: function(value) {
            this._isPanel = value;
        },
        serializable: true
    },

    _panel : {
        value: null
    },

    panel : {
        get: function() {
            return this._panel;
        },
        set: function(val) {
            this._panel = val;
            if(val._element) this._panel = val._element;
        },
        serializable: true
    },

    height: {
        value: null
    },

    handleClick: {
        value: function() {

        }
    },


    handleMousedown: {
        value: function(e) {
            e.preventDefault();
            this.panel.addEventListener("webkitTransitionEnd", this, true);
            if (this.isVertical) {
                this._startPosition = e.y;
                this._initDimension = this.panel.offsetHeight;
            }
            else {
                this._startPosition = e.x;
                this._initDimension = this.panel.offsetWidth;
            }

            this.panel.classList.add("disableTransition");
            window.addEventListener("mousemove", this, false);
            window.addEventListener("mouseup", this, false);
            NJevent("panelResizedStart", this)
        }
    },

    handleDblclick: {
        value : function() {
            this.panel.addEventListener("webkitTransitionEnd", this, false);
            if (this.isVertical) {
                this.panel.style.height = "";
            } else {
                this.panel.style.width = "";
            }

            this.application.localStorage.setItem(this.element.getAttribute("data-montage-id"), {"version": this.version, "value": ""});
        }
    },

    handleWebkitTransitionEnd: {
        value: function() {

            if(this.redrawStage) {
                this.application.ninja.stage.resizeCanvases = true;
            }

            this.panel.removeEventListener("webkitTransitionEnd", this, false);

        }
    },

    prepareForDraw: {
        value: function() {
            if(this.willSave) {
                var storedData = this.application.localStorage.getItem(this.element.getAttribute("data-montage-id"));

                if(storedData && storedData.value) {
                    this.value = storedData.value;
                }

            }

            if(this.value != null) {
                if (this.isVertical) {
                    this.panel.style.height = this.value + "px";
                } else {
                    this.panel.style.width = this.value + "px";
                }
            }
            this.element.addEventListener("mousedown", this, false);
            this.element.addEventListener("dblclick", this, false);
        }
    },

    draw: {
        value: function() {

        }
    },

    handleMouseup: {
        value:  function(e) {
            e.preventDefault();
            window.removeEventListener("mousemove", this);
            window.removeEventListener("mouseup", this);
            this.panel.classList.remove("disableTransition");

            if (this.isVertical) {
                this.panel.style.height = this.panel.offsetHeight;
            } else {
                this.panel.style.width = this.panel.offsetWidth;
            }

            this.application.localStorage.setItem(this.element.getAttribute("data-montage-id"), {"version": this.version, "value": this.value});

            if(this.redrawStage) {
                this.application.ninja.stage.resizeCanvases = true;
            }

            NJevent("panelResizedEnd", this)
        }
    },

    handleMousemove: {
        value: function(e) {
            if(this.isVertical) {
                this.value = this._isInversed ? this._initDimension + (this._startPosition - e.y) : this._initDimension + (e.y - this._startPosition);
                this.panel.style.height = this.value + "px";
            }
            else {
                if (this.isPanel) {
                    this.value = this._initDimension + (this._startPosition - e.x);
                } else {
                    this.value = this._isInversed ? this._initDimension + (this._startPosition - e.x) : this._initDimension + (e.x - this._startPosition);
                }
                this.panel.style.width = this.value + "px";
            }

            if(this.redrawStage) {
                this.application.ninja.stage.resizeCanvases = true;
            }

            NJevent("panelResizing", this);
        }
    }
});
