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
            console.log("safdasdasdasd");
            var component = el.controller || this.application.ninja.currentDocument.model.getComponentFromElement(el);

            switch(prop) {
                case "id":
                case "class":
                case "-webkit-transform-style":
                case "left":
                case "top":
                case "width":
                case "height":
                    if(el.nodeName === "IMG" && (prop === "width" || prop === "height")) {
                        return component[prop];
                    } else {
                        return ElementController.getProperty(el, prop, true);
                    }
                default:
                    return component[prop];
            }
        }
    },

    setProperty: {
        value: function(el, p, value) {
            var component = el.controller || this.application.ninja.currentDocument.model.getComponentFromElement(el);

            switch(p) {
                case "id":
                case "class":
                case "-webkit-transform-style":
                case "left":
                case "top":
                case "width":
                case "height":
                    if(el.nodeName === "IMG" && (p === "width" || p === "height")) {
                        component[p] = value;
                    } else {
                        ElementController.setProperty(el, p, value);
                    }
                    break;
                default:
                    if(p === "min" || p === "max") value = parseFloat(value);
                    component[p] = value;
                    break;

            }
        }
    }
});
