/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    DrawingTool = require("js/tools/drawing-tool").DrawingTool;

exports.PencilTool = Montage.create(DrawingTool, {
    drawingFeedback: { value: { mode: "Draw2D", type: "" } },

    HandleLeftButtonDown: {
        value: function(event) {
            NJevent("enableStageMove");

        }
    },

    HandleMouseMove: {
        value: function(event) {
            this.doDraw(event);
        }
    },

    HandleLeftButtonUp: {
        value: function(event) {
            this.endDraw(event);
            NJevent("disableStageMove");
        }
    }
});