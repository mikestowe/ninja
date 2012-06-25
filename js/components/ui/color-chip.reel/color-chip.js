/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
