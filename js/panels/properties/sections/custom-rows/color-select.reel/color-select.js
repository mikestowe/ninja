/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.ColorSelect = Montage.create(Component, {

    Stroke: {
        value: null
    },

    Fill: {
        value: null
    },

    strokeChip: {
        value: null
    },

    fillChip: {
        value: null
    },

    handleChange: {
        value: function(e) {

        }
    },

    colorVisible: {
        value: true
    },

    color2Visible: {
        value: true
    },

    divider: {
        value: false
    },

    prepareForDraw: {
        value: function() {
            if (this.divider) {
                this.element.appendChild(document.createElement("hr"));
            }
            if (!this.colorVisible) {
                this.Stroke.style.display = "none";
            }

            if (!this.color2Visible) {
                this.Fill.style.display = "none";
            }

//            for (var i = 0; i < this.options.length; i ++ ) {
//                var tmpOption = new Option();
//                tmpOption.text = this.options[i].name;
//                tmpOption.value = this.options[i].value;
//                if (i === this.selectedIndex) tmpOption.selected = true
//                this.options[i].name = this.element.getElementsByTagName("select")[0].add(tmpOption);
//            }

        }
    },

    destroy: {
        value: function() {
            if(this.strokeChip)
            {
                this.strokeChip.destroy();
            }
            if(this.fillChip)
            {
                this.fillChip.destroy();
            }
        }
    }

});