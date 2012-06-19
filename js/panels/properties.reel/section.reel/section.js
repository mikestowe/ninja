/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.Section = Montage.create(Component, {

    name: {
        value: "Panel"

    },

    slot: {
        value: null
    },

    content: {
        value: null
    },

    prepareForDraw: {
        value: function() {
            this.element.getElementsByClassName("title")[0].innerHTML = this.name;
            this.slot.content = this.content;
        }
    }
});