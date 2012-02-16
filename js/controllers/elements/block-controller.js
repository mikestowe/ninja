/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ElementController = require("js/controllers/elements/element-controller").ElementController;

exports.BlockController = Montage.create(ElementController, {

    /**
     If the base method needs to be sub-classed
    setProperty: {
        value: function(el, p, value) {
            switch(p) {
                case "width":
                    console.log("width");
                    break;
                default:
                    ElementController.setProperty(el, p, value);
            }
        }
    },
    */

    /*
    setProperties: {
        value: function(el, newProps, currentProps, index, eventType, notify, redraw) {
            ElementController.setProperties(el, newProps, currentProps, index, eventType, notify, redraw);
        }
    },
    */

});