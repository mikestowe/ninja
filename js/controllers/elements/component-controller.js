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
                case "-webkit-transform-style":
                case "left":
                case "top":
                case "width":
                case "height":
                    if(el.nodeName === "IMG" && (prop === "width" || prop === "height")) {
                        return this.application.ninja.currentDocument.getComponentFromElement(el)[prop];
                    } else {
                        return ElementController.getProperty(el, prop, true);
                    }
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
                case "-webkit-transform-style":
                case "left":
                case "top":
                case "width":
                case "height":
                    if(el.nodeName === "IMG" && (p === "width" || p === "height")) {
                        this.application.ninja.currentDocument.getComponentFromElement(el)[p] = value;
                    } else {
                        ElementController.setProperty(el, p, value);
                    }
                    break;
                default:
                    if(p === "min" || p === "max") value = parseFloat(value);

                    this.application.ninja.currentDocument.getComponentFromElement(el)[p] = value;
                    break;

            }
        }
    }
});
