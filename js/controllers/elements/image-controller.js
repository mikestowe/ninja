/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ElementController = require("js/controllers/elements/element-controller").ElementController;

exports.ImageController = Montage.create(ElementController, {

    getProperty: {
        value: function(el, prop) {
            switch(prop) {
                case "src":
                    return el.getAttribute(prop);
                    break;
                case  "alt":
                    return el.getAttribute(prop);
                    break;
                default:
                    return ElementController.getProperty(el, prop, true);
            }
        }
    },

    setProperty: {
        value: function(el, p, value) {
            switch(p) {
                case "src":
                    el.setAttribute(p, value);
                    break;
                case "alt":
                    el.setAttribute(p, value);
                    break;
                default:
                    ElementController.setProperty(el, p, value);
            }
        }
    }
});