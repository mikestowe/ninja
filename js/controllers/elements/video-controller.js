/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ElementController = require("js/controllers/elements/element-controller").ElementController;

exports.VideoController = Montage.create(ElementController, {
    getProperty: {
        value: function(el, prop) {
            switch(prop) {
                case "src":
                case "poster":
                case "autoplay":
                case "controls":
                case "loop":
                case "muted":
                    return el.getAttribute(prop);
                default:
                    return ElementController.getProperty(el, prop);
            }
        }
    },

    setProperty: {
        value: function(el, p, value) {
            switch(p) {
                case "src":
                    el.setAttribute(p, value);
                    break;
                case "poster":
                    el.setAttribute(p, value);
                    break;
                case "autoplay":
                    value ? el.setAttribute(p, "autoplay") : el.removeAttribute(p);
                    break;
                case "preload":
                    value ? el.setAttribute(p, "preload") : el.removeAttribute(p);
                    break;
                case "controls":
                    value ? el.setAttribute(p, "controls") : el.removeAttribute(p);
                    break;
                case "loop":
                    value ? el.setAttribute(p, "loop") : el.removeAttribute(p);
                    break;
                case "muted":
                    value ? el.setAttribute(p, "muted") : el.removeAttribute(p);
                    break;
                default:
                    ElementController.setProperty(el, p, value);
            }
        }
    }
});