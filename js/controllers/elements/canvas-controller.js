/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ElementController = require("js/controllers/elements/element-controller").ElementController;

exports.CanvasController = Montage.create(ElementController, {

    getProperty: {
        value: function(el, prop) {
            switch(prop) {
                case "height":
                case "width":
                    return el.getAttribute(prop);
                    break;
                default:
                    return ElementController.getProperty(el, prop);
            }
        }
    },

    setProperty: {
        value: function(el, p, value) {
            switch(p) {
                case "height":
                case "width":
                    el.setAttribute(p, parseInt(value));
                    break;
                default:
                    ElementController.setProperty(el, p, value);
            }
        }
    },
	
   setProperties: {
       value: function(el, props, index) {
           for(var p in props) {
               el.elementModel.controller.setProperty(el, p, props[p][index]);
           }
       }
    }
});