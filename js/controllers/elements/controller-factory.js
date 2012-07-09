/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
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
