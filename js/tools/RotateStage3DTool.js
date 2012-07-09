/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Rotate3DToolBase = require("js/tools/Rotate3DToolBase").Rotate3DToolBase,
    toolHandleModule = require("js/stage/tool-handle"),
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils,
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

exports.RotateStage3DTool = Montage.create(Rotate3DToolBase, {
    _toolID: { value: "rotateStage3DTool" },
    _imageID: { value: "rotateStage3DToolImg" },
    _toolImageClass: { value: "rotateStage3DToolUp" },
    _selectedToolImageClass: { value: "rotateStage3DToolDown" },
    _toolTipText : { value : "3D Rotate Stage Tool" },
    _canOperateOnStage:{value:false,writable:true},

    _initializeToolHandles: {
        value: function() {
            this.rotateStage = true;
            if(!this._handles)
            {
                this._handles = [];

                // TODO - Using dummy cursors for now

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

            var len = this._handles.length;
            var i = 0,
                toolHandle;
            for (i=0; i<len; i++)
            {
                toolHandle = this._handles[i];
                toolHandle._lineWidth = 3;
                toolHandle._radius = 100;
                toolHandle._nTriangles = 60;
                var angle = 2.0*Math.PI/Number(toolHandle._nTriangles);
                toolHandle._rotMat = Matrix.RotationZ( angle );
            }
        }
    },

    _updateTargets: {
        value: function(addToUndoStack) {
            var elt = this._target;

            var curMat = viewUtils.getMatrixFromElement(elt);
            var curMatInv = glmat4.inverse(curMat, []);

            viewUtils.pushViewportObj( elt );
            var eltCtr = viewUtils.getCenterOfProjection();
            viewUtils.popViewportObj();

			// cache the local to global and global to local matrices
			var l2gMat = viewUtils.getLocalToGlobalMatrix( elt );
			var g2lMat = glmat4.inverse( l2gMat, [] );
			eltCtr = MathUtils.transformAndDivideHomogeneousPoint( eltCtr, l2gMat );

            elt.elementModel.setProperty("mat", curMat);
            elt.elementModel.setProperty("matInv", curMatInv);
            elt.elementModel.setProperty("ctr", eltCtr);
			elt.elementModel.setProperty("l2g", l2gMat);
            elt.elementModel.setProperty("g2l", g2lMat);

            ElementsMediator.setMatrix(elt, curMat, false, "rotateStage3DTool");
        }
    },

    captureSelectionChange: {
        value: function(event){
            this.eventManager.addEventListener("selectionDrawn", this, true);
        }
    },

    captureSelectionDrawn: {
        value: function(event){
            this._origin = null;
            this._startOriginArray = null;

            var stage = this.application.ninja.currentDocument.model.documentRoot;
            this.target = stage;

            viewUtils.pushViewportObj( stage );
            var eltCtr = viewUtils.getCenterOfProjection();
            viewUtils.popViewportObj();

            var curMat = viewUtils.getMatrixFromElement(stage);
            var curMatInv = glmat4.inverse(curMat, []);

            stage.elementModel.setProperty("mat", curMat);
            stage.elementModel.setProperty("matInv", curMatInv);
            stage.elementModel.setProperty("ctr", eltCtr);

            var ctrOffset = stage.elementModel.props3D.m_transformCtr;
            if(ctrOffset)
            {
                eltCtr[2] = 0;
                eltCtr = vecUtils.vecAdd(3, eltCtr, ctrOffset);
            }

            this._origin = viewUtils.localToGlobal(eltCtr, stage);
            this._setTransformOrigin(false);
            this.DrawHandles();

            if(event)
            {
                this.eventManager.removeEventListener("selectionDrawn", this, true);
            }
        }
    },

    captureElementChange: {
        value: function(event) {
            if(event._event.item === this.application.ninja.currentDocument.model.documentRoot)
            {
                this.captureSelectionDrawn(null);
            }
        }
    },

    Reset : {
       value : function()
       {
           // Reset stage to identity matrix
           var iMat = Matrix.I(4),
               stage = this.application.ninja.stage;

           ElementsMediator.setMatrix(this.application.ninja.currentDocument.model.documentRoot,
                                        iMat, false, "rotateStage3DTool");
           this.application.ninja.currentDocument.model.documentRoot.elementModel.props3D.m_transformCtr = null;

			// let the document and stage manager know about the zoom change
			stage._firstDraw = true;
			this.application.ninja.documentBar.zoomFactor = 100;
            this.application.ninja.currentDocument.model.views.design.iframe.style.zoom = 1.0;
			stage._firstDraw = false;

           viewUtils.clearStageTranslation();
           stage.centerStage();
           stage.draw();

           this.isDrawing = false;
           this.endDraw(event);

//			this.UpdateSelection(true);
           this.Configure(true);
       }
    }

});
