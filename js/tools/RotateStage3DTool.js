/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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

    captureSelectionDrawn: {
        value: function(event){
            this._origin = null;
            this._startOriginArray = null;

            var stage = this.application.ninja.currentDocument.documentRoot;
            this.target = stage;

            viewUtils.pushViewportObj( stage );
            var eltCtr = viewUtils.getCenterOfProjection();
            viewUtils.popViewportObj();
//            if(this.application.ninja.documentController.webTemplate)
            if(this.application.ninja.currentDocument.documentRoot.id !== "UserContent")
            {
                eltCtr[0] = stage.scrollWidth/2;
                eltCtr[1] = stage.scrollHeight/2;
            }

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

//            if(this.application.ninja.documentController.webTemplate)
            if(this.application.ninja.currentDocument.documentRoot.id !== "UserContent")
            {
                this._startOriginArray = [];
                this._startOriginArray.push(this._origin.slice());
            }
            else
            {
                this._setTransformOrigin(false);
            }
            this.DrawHandles();
        }
    },

    captureElementChange: {
        value: function(event) {
            if(event._event.item === this.application.ninja.currentDocument.documentRoot)
            {
                this.captureSelectionDrawn(null);
            }
        }
    },

    Reset : {
       value : function()
       {
           // Reset stage to identity matrix
           var iMat = Matrix.I(4);

           ElementsMediator.setMatrix(this.application.ninja.currentDocument.documentRoot,
                                        iMat, false, "rotateStage3DTool");
           this.application.ninja.currentDocument.documentRoot.elementModel.props3D.m_transformCtr = null;

			// let the document and stage manager know about the zoom change
			this.application.ninja.stage._firstDraw = true;
			this.application.ninja.documentBar.zoomFactor = 100;
			this.application.ninja.currentDocument.iframe.style.zoom = 1.0;
			this.application.ninja.stage._firstDraw = false;

           // TODO - Any updates to the stage should redraw stage's children. Move this to mediator?
           this.application.ninja.stage.updatedStage = true;

           this.isDrawing = false;
           this.endDraw(event);

//			this.UpdateSelection(true);
           this.Configure(true);
       }
    }

});
