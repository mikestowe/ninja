/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage         = require("montage/core/core").Montage;

var BodyController = require("js/controllers/elements/body-controller").BodyController,
    BlockController = require("js/controllers/elements/block-controller").BlockController,
    ShapesController = require("js/controllers/elements/shapes-controller").ShapesController,
	ImageController = require("js/controllers/elements/image-controller").ImageController,
    VideoController = require("js/controllers/elements/video-controller").VideoController,
    ComponentController = require("js/controllers/elements/component-controller").ComponentController,
    CanvasController = require("js/controllers/elements/canvas-controller").CanvasController;

exports.ControllerFactory = Montage.create(Montage, {

    getController: {
        value: function(value) {
            if(!value) return;

            try {
                value = value.toLowerCase();

                if(value.indexOf("block") !== -1) {
                    return BlockController;
                } else if(value.indexOf("stage") !== -1) {
//                    return StageController;
                    alert("Calling the stage controller. Should not be calling this object");
                } else if(value.indexOf("body") !== -1) {
                    return BodyController;
                } else if(value.indexOf("shape") !== -1) {
                    return ShapesController;
                } else if(value.indexOf("canvas") !== -1) {
                    return CanvasController;
                } else if(value.indexOf("component") !== -1) {
                    return ComponentController;
                } else if(value.indexOf("media") !== -1) {
                    console.log("create media controller");
                } else if(value.indexOf("image") !== -1) {
                    return ImageController;
                } else if(value.indexOf("video") !== -1) {
                    return VideoController;
                } else {
                    return BlockController;
                }
            } catch (err) {
                console.log("Could not create Controller Factory " + err);
            }
        }
    }

});