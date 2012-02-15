/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ElementController = require("js/controllers/elements/element-controller").ElementController;

exports.ComponentController = Montage.create(ElementController, {

    getProperty: {
        value: function(el, prop) {
            switch(prop) {
                case "id":
                case "class":
                case "left":
                case "top":
                case "width":
                case "height":
                    return ElementController.getProperty(el, prop, true);
                default:
                    return this.application.ninja.currentDocument.getComponentFromElement(el)[prop];
            }
        }
    },

    setProperty: {
        value: function(el, p, value) {
            switch(p) {
                case "id":
                case "class":
                case "left":
                case "top":
                case "width":
                case "height":
                    ElementController.setProperty(el, p, value);
                    break;
                default:
                    this.application.ninja.currentDocument.getComponentFromElement(el)[p] = value;
                    break;

            }
        }
    }
});
