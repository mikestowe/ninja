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

var Montage = require("montage/core/core").Montage,
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    snapManager = require("js/helper-classes/3D/snap-manager").SnapManager;

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
