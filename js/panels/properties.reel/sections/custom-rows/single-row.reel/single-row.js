/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.SingleRow = Montage.create(Component, {
    slot: {
        value: null
    },

    id: {
        value: null
    },

    label: {
        value: null
    },

    content: {
        value: null
    },

    eventDelegate: {
        value: null
    },


    handleChange: {
        value: function(event) {
        }
    },

    handleChanging: {
        value: function(event) {
            this.eventDelegate({"type": "changing", "id": this.id, "prop": this.prop, "text": this.label, "value": this.value});
        }
    },

    divider: {
        value: false
    },

    prepareForDraw: {
        value: function() {
            if (this.divider) this.element.appendChild(document.createElement("hr"));
            if(this.label !== null) this.element.getElementsByClassName("lbl")[0].innerHTML = this.label + ":";
        }
    }

});