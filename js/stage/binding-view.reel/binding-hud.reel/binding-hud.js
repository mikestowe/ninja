/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/**
@requires montage/core/core
@requires montage/ui/component
*/
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.BindingHud = Montage.create(Component, {
    title: {
        value: "default"
    },
    properties: {
        value: [
            {"title": "myProperty1"},
            {"title":"myproperty2"}
        ]
    },

    x: {
        value: 20
    },

    y: {
        value: 100
    },

    draw: {
        value: function() {
            this.element.style.top = this.y + "px";
            this.element.style.left = this.x + "px";
        }
    }
});