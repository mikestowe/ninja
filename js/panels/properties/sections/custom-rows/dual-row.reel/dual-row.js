/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
                this.element.getElementsByClassName("lbl")[1].innerHTML = this.label2 + ":";
            } else {
                this.element.getElementsByClassName("lbl")[1].style.display = "none";
            }
        }
    }

});