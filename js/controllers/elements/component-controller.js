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
                case "label":
                    return this.application.ninja.currentDocument.getComponentFromElement(el).label;
                    break;
                default:
                    return ElementController.getProperty(el, prop);
            }
        }
    },

    setProperty: {
        value: function(el, p, value) {
            switch(p) {
                case "label":
                    this.application.ninja.currentDocument.getComponentFromElement(el).label = value;
                    break;
                default:
                    ElementController.setProperty(el, p, value);
            }
        }
    }
});
