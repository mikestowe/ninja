/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ElementController = require("js/controllers/elements/element-controller").ElementController;

exports.BodyController = Montage.create(ElementController, {

    // TODO - perspective distance needs to be passed in as "dist" and matrix3d needs to be passed in as "mat"
    set3DProperties: {
        value: function(el, props, update3DModel) {
        }
    },

    getProperty: {
        value: function(el, p) {
        }
    },

    setProperty: {
        value: function(el, p, value) {
        }
    },

    setAttribute: {
        value: function(el, att, value) {
        }
    },

    getPerspectiveDist: {
        value: function(el) {
            if(el.elementModel && el.elementModel.props3D && el.elementModel.props3D.perspectiveDist) {
                return el.elementModel.props3D.perspectiveDist;
            } else {
                var dist = this.application.ninja.stylesController.getPerspectiveDistFromElement(el, true);
                el.elementModel.props3D.perspectiveDist = dist;
                return dist;
            }
        }
    }
});
