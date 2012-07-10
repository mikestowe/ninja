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

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

var ColorChip = exports.ColorChip = Montage.create(Component, {

    icon: {
        value: null,
        serializable: true
    },

    chip: {
        value: false
    },

    hasIcon: {
        value: true
    },

    iconType: {
        value: null
    },

    mode: {
        value: "stroke"
    },

    offset: {
        value: 20
    },

    color: {
        value: {r:0, g:0, b:0, a:1, css:'rgb(0,0,0)', mode:'rgb'}
    },

    chipBtn: {
        serializable: true,
        value: null
    },

    changeDelegate: {
        value: function(event) {
            this.color = event._event.color;

            var evt = document.createEvent("CustomEvent");
            evt.initEvent("change", true, true);
            evt.type = "change";

            this.dispatchEvent(evt);
        }
    },

    prepareForDraw: {
        value: function() {
            this.addEventListener("firstDraw", this, false);
        }
    },

    draw: {
        value: function() {
            if(this.hasIcon) {
                var icon = this.iconType || this.mode + "Icon";
                this.application.ninja.colorController.addButton(icon, this.icon);
            } else {
                this.icon.style.display = "none";
            }

            this.chipBtn.props = {side: 'right', align: 'top', wheel: true, palette: true, gradient: true, image: true, nocolor: true, offset: this.offset};
            this.application.ninja.colorController.addButton(this.mode, this.chipBtn);

        }
    },

    handleFirstDraw: {
        value: function(evt) {
            if(this.chip) {
                // This is a single chip - Not related to the color panel -- Set the initial color if found
                var mode = "rgb", r = 0, g = 0, b = 0, a = 1, css = "rgb(0,0,0)";

                if(this.color && this.color.color) {
                    var g =  this.color.color;
                    g.wasSetByCode = true;
                    this.chipBtn.color(this.color.mode, g);
                } else if (this.color) {
                    var colorObj = this.application.ninja.colorController.getColorObjFromCss(this.color.css);
                    mode = colorObj.mode;
                    r = colorObj.value.r;
                    g = colorObj.value.g;
                    b = colorObj.value.b;
                    a = colorObj.value.a;
                    css = colorObj.css;
                    this.chipBtn.color(mode, {wasSetByCode: true, type: 'change', color: {r: r, g: g, b: b}, css: css});
                } else {
                    mode = "nocolor";
                    this.chipBtn.color(mode, null);

                }

                this.chipBtn.addEventListener("change", this, false);
            }
        }
    },

    handleChange: {
        value: function(evt) {
            if(this.changeDelegate && typeof(this.changeDelegate === "function")) {
                this.changeDelegate(evt);
            }
        }
    },

    destroy: {
        value: function() {
            this.application.ninja.colorController.removeButton(this.mode, this.chipBtn);
            var mode = this.mode;
            if(this.iconType) {
                if(this.iconType === "fillIcon") {
                    mode = "fill";
                } else if(this.iconType === "strokeIcon") {
                    mode = "stroke";
                }
            }
            this.application.ninja.colorController.removeButton(mode, this.icon);
        }
    }

});
