/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

var ColorChip = exports.ColorChip = Montage.create(Component, {

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

    initialColor: {
        value: false
    },

    changeDelegate: {
        value: null
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
            }

            this.chipBtn.props = {side: 'right', align: 'top', wheel: true, palette: true, gradient: true, image: true, offset: this.offset};
            this.application.ninja.colorController.addButton(this.mode, this.chipBtn);

            /*
            if(this.chip) {
                //this.application.ninja.colorController.addButton('fillIcon', this.icon);
                this.chipBtn.props = {side: 'right', align: 'top', wheel: true, palette: true, gradient: true, image: true, offset: 0};
                this.application.ninja.colorController.addButton(this.mode, this.chipBtn);
            } else {
                //if(this.hasIcon) this.application.ninja.colorController.addButton(this.mode + 'Icon', this.icon);
                this.chipBtn.props = {side: 'right', align: 'top', wheel: true, palette: true, gradient: true, image: true, offset: 20};
                this.application.ninja.colorController.addButton(this.mode, this.chipBtn);
            }
            */


        }
    },

    handleFirstDraw: {
        value: function(evt) {
            if(this.chip) {
                // This is a single chip - Not related to the color panel -- Set the initial color if found
                var mode = "rgb", r = 0, g = 0, b = 0, a = 1, css = "rgb(255,0,0)";

                if(this.initialColor) {
                    console.log(this.initialColor);
                    var colorObj = this.application.ninja.colorController.getColorObjFromCss(this.initialColor);
                    mode = colorObj.mode;
                    r = colorObj.value.r;
                    g = colorObj.value.g;
                    b = colorObj.value.b;
                    a = colorObj.value.a;
                    css = colorObj.css;
                }

                this.chipBtn.color(mode, {wasSetByCode: true, type: 'change', color: {r: r, g: g, b: b}, css: css});
                //this.chipBtn.color('rgb', {wasSetByCode: true, type: 'change', color: {r: 255, g: 0, b: 0}, css: 'rgb(255,0,0)'});

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
    }

});
