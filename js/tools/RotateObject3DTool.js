/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;

var Rotate3DToolBase = require("js/tools/Rotate3DToolBase").Rotate3DToolBase;
var toolHandleModule = require("js/stage/tool-handle");

exports.RotateObject3DTool = Montage.create(Rotate3DToolBase, {
    _toolID: { value: "rotateObject3DTool" },
    _imageID: { value: "rotateObject3DToolImg" },
    _toolImageClass: { value: "rotateObject3DToolUp" },
    _selectedToolImageClass: { value: "rotateObject3DToolDown" },
    _toolTipText : { value : "3D Rotate Object Tool" },

    _initializeToolHandles: {
        value: function() {
            this.rotateStage = false;
            if(!this._handles)
            {
                this._handles = [];
                // rotateX
                var rX = toolHandleModule.RotateHandle.create();
                rX.init("url('images/cursors/Translate_X.png') 0 0, default", 'rgba(255,0,0,1)', "x");
                this._handles.push(rX);
                // rotateY
                var rY = toolHandleModule.RotateHandle.create();
                rY.init("url('images/cursors/Translate_Y.png') 0 0, default", 'rgba(0,255,0,1)', "y");
                this._handles.push(rY);

                // rotateZ
                var rZ = toolHandleModule.RotateHandle.create();
                rZ.init("url('images/cursors/Translate_Z.png') 0 0, default", 'rgba(0,0,255,1)', "z");
                this._handles.push(rZ);
            }
            else
            {
                // may need to reset values if they were changed by the stage rotate tool
                var len = this._handles.length;
                var i = 0,
                    toolHandle;
                for (i=0; i<len; i++)
                {
                    toolHandle = this._handles[i];
                    toolHandle._lineWidth = 2;
                    toolHandle._radius = 50;
                    toolHandle._nTriangles = 30;
                    var angle = 2.0*Math.PI/Number(toolHandle._nTriangles);
                    toolHandle._rotMat = Matrix.RotationZ( angle );
                }
            }
            this._inLocalMode = (this.options.selectedMode === "rotateLocally");
        }
    },

    _handleToolOptionsChange: {
        value: function(event) {
            this._inLocalMode = event.detail.mode;
            this.DrawHandles();
        }
    }

});
