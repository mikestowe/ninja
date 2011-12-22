/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.Tree = Montage.create(Component, {

    treeViewDataObject:{
        writable:true,
        enumerable:true,
        value:null
    },

    showIcons :{
        writable:true,
        enumerable:true,
        value:true
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