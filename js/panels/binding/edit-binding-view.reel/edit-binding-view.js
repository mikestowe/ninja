/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;


exports.EditBindingView = Montage.create(Component, {
    objectsList : {
        value: ["Object1", "Object2", "Object3"]
    },

    prepareForDraw : {
        value: function() {
            console.log("Preparing to draw edit view");
        }
    }
});