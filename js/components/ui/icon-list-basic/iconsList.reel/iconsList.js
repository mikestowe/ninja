/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

var IconsList = exports.IconsList = Montage.create(Component, {

    anItemData:{
        enumerable:true,
        value: null
    },

    iconsViewDataObject:{
        writable:true,
        enumerable:true,
        value:[]
    },

    selected:{
        writable:true,
        enumerable:true,
        value:null
    },

    willDraw: {
    	enumerable: false,
    	value: function() {

    	}
    },
    draw: {
    	enumerable: false,
    	value: function() {

    	}
    },
    didDraw: {
    	enumerable: false,
    	value: function() {

    	}
    }

});