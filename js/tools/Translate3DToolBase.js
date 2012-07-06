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

/* Base class for the 3D translate tools
Subclass TranslateObject3DTool will translate the object that was clicked.
*/
var Montage = require("montage/core/core").Montage,
    ModifierToolBase = require("js/tools/modifier-tool-base").ModifierToolBase,
    toolHandleModule = require("js/stage/tool-handle"),
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils,
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils,
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

exports.Translate3DToolBase = Montage.create(ModifierToolBase,
{
    _inLocalMode: { value: true, enumerable: true },
    _clickedOnStage: { value: false },

    HandleDoubleClick : {
       value : function() {
       }
    },

    modifyElements : {
        value : function(data, event)
        {
            //console.log( "modifyElements, data: " + data.pt0 + " => " + data.pt1 );

            // form the translation vector and post translate the matrix by it.
            var delta = vecUtils.vecSubtract( 3, data.pt1, data.pt0 );
            if(this._handleMode !== null)
            {
                switch(this._handleMode)
                {
                    case 0:
                        delta[1] = 0;
                        delta[2] = 0;
                        break;
                    case 1:
                        delta[0] = 0;
                        delta[2] = 0;
                        break;
                    case 2:
                        delta[0] = 0;
                        delta[1] = 0;
                        break;
                }
                if( (this.application.ninja.selectedElements.length > 1) && this._clickedOnStage )
                {
                    this._delta = ~~(delta[this._handleMode]);
                }
                else
                {
                    this._delta += ~~(delta[this._handleMode]);
                }

            }
            else
            {
                if(this._mode === 1)
                {
                    delta[2] = delta[1];
                    delta[0] = 0;
                    delta[1] = 0;
                }
                this._delta = delta.slice(0);
            }

            //console.log( "modifyElements delta: " + delta );
            var transMat = Matrix.Translation( delta );

            //console.log( "Translate: " + delta );
            if(this._inLocalMode && (this.application.ninja.selectedElements.length === 1) )
            {
                this._translateLocally(transMat);
            }
            else
            {
                this._translateGlobally(transMat);
            }
        }
    },


    Reset: {
        value: function() {
            var mat, iMat, dist, mod3dObject = [], self = this;

            this.application.ninja.selectedElements.forEach(function(element) {
                // Reset to the identity matrix
                //item = this.application.ninja.selectedElements[i];
                iMat = Matrix.I(4);
                mat = ElementsMediator.getMatrix(element);
                mat[12] = 0;
                mat[13] = 0;
                mat[14] = 0;

                dist = ElementsMediator.getPerspectiveDist(element);

                var previousStyleStr = {dist:dist, mat:element.elementModel.getProperty("mat")};
                var newStyleStr = {dist:dist, mat:iMat};

                mod3dObject.push({element:element, properties:newStyleStr, previousProperties: previousStyleStr});
            });

            ElementsMediator.set3DProperties(mod3dObject, "Change", "rotateTool");

            this.isDrawing = false;
            this.endDraw(event);

            // Need to force stage to draw immediately so the new selection center is calculated
            this.application.ninja.stage.draw();
            // And captureSelectionDrawn to draw the transform handles
            this.captureSelectionDrawn(null);
        }
    },

    // We will only translate single elements locally
    _translateLocally: {
        value: function (transMat) {
            //console.log( "_translateLocally, startMat: " + this._startMat );
            //console.log( "_translateLocally, transMat: " + transMat );
            //console.log( "_translateLocally, startMat: " + this._startMat + ", transMat: " + transMat );
            var mat = glmat4.multiply(this._startMat, transMat, []);
            viewUtils.setMatrixForElement( this._target, mat, true );
            if(this._mode !== 1)
            {
                this._startMat = mat;
            }
        }
    },

    _translateGlobally: {
        value: function (transMat) {
            //console.log( "_translateGlobally, transMat: " + transMat );
            var selectedElements = this.application.ninja.selectedElements;

            var len = selectedElements.length,
                self = this,
                target = selectedElements[0],
                curMat = viewUtils.getMatrixFromElement( target ),
                matInv = glmat4.inverse(this._startMat, []),
                nMat = glmat4.multiply(transMat, this._startMat, [] );
//              qMat = glmat4.multiply(matInv, nMat, []);

            if(this._mode === 1) {
                if (len > 1)  curMat = target.elementModel.getProperty("mat").slice();
                var curInv = glmat4.inverse( curMat, [] );
                transMat = glmat4.multiply( nMat, curInv, [] );
            }

            var shouldUpdateStartMat = true;

            if(this._clickedOnStage || ((this._handleMode === 2) && (len > 1)))
            {
                shouldUpdateStartMat = false;
            }
            else if(this._mode !== 1)
            {
                this._startMat = nMat;
            }

            selectedElements.forEach(function(element) {
                curMat = element.elementModel.getProperty("mat").slice(0);

//                glmat4.multiply(curMat, qMat, curMat);
//                viewUtils.setMatrixForElement( elt, curMat, true);
                curMat[12] += transMat[12];
                curMat[13] += transMat[13];
                curMat[14] += transMat[14];

                viewUtils.setMatrixForElement(element, curMat, true);

                if(shouldUpdateStartMat) {
                    //console.log(  "\t\tshouldUpdateStartMat" );
                    element.elementModel.setProperty("mat", curMat);
                }

            });
        }
    },

    _updateTargets: {
        value: function(addToUndo) {
            var mod3dObject = [], self = this;

            this.application.ninja.selectedElements.forEach(function(element) {
                if(addToUndo) {
                    var previousMat = element.elementModel.getProperty("mat").slice(0);
                    var previousStyleStr = {dist:element.elementModel.getProperty("dist"), mat:MathUtils.scientificToDecimal(previousMat, 5)};
                    var newStyleStr = {dist:viewUtils.getPerspectiveDistFromElement(element), mat:MathUtils.scientificToDecimal(viewUtils.getMatrixFromElement(element), 5)};

                    mod3dObject.push({element:element, properties:newStyleStr, previousProperties: previousStyleStr});

                }
            });

            if(addToUndo) {
                ElementsMediator.set3DProperties(mod3dObject, "Change", "translateTool");

                if(this._origin && this._delta) {
                    if(this._handleMode !== null) {
                        this._origin[this._handleMode] += this._delta;
                    } else {
                        this._origin[0] += this._delta[0];
                        this._origin[1] += this._delta[1];
                    }
                }

                this._delta = null;
            }

            this.application.ninja.selectedElements.forEach(function(element) {
                element.elementModel.setProperty("mat", viewUtils.getMatrixFromElement(element));
                element.elementModel.setProperty("dist", viewUtils.getPerspectiveDistFromElement(element));
            });

        }
    },

    HandleAltKeyDown: {
        value: function(event) {
            this._inLocalMode = !this._inLocalMode;
            this.DrawHandles();
        }
    },

    HandleAltKeyUp: {
        value: function(event) {
            this._inLocalMode = !this._inLocalMode;
            this.DrawHandles();
        }
    },

    handleScroll: {
        value: function(event) {
            this.captureSelectionDrawn(null);
        }
    },

    _updateHandlesOrigin: {
        value: function () {
            var ctr;

            var len = this.application.ninja.selectedElements.length;
            if(len > 0)
            {
                if(len === 1)
                {
                    var item = this._target;
                    viewUtils.pushViewportObj( item );
                    ctr = viewUtils.getCenterOfProjection();
                    viewUtils.popViewportObj();
                    ctr[2] = 0;

                    this._origin = viewUtils.localToGlobal(ctr, item);
                }
                else
                {
                    this._origin = undefined;
                    this._origin = this.calculateMultiSelOrigin();
                }
            }
        }
    },

    captureSelectionDrawn: {
        value: function(event){
            this._origin = null;
            this._startOriginArray = null;

            var len = this.application.ninja.selectedElements.length;
            if(len) {
                if(len === 1) {
                    this.target = this.application.ninja.selectedElements[0];
                    drawUtils.addElement(this.target);

                    viewUtils.pushViewportObj( this.target );
                    var eltCtr = viewUtils.getCenterOfProjection();
                    eltCtr[2] = 0;
                    viewUtils.popViewportObj();

                    var ctrOffset = this.target.elementModel.props3D.m_transformCtr;
                    if(ctrOffset) {
                        eltCtr[2] = 0;
                        eltCtr = vecUtils.vecAdd(3, eltCtr, ctrOffset);
                    }

                    this._origin = viewUtils.localToGlobal(eltCtr, this.target);
//                  console.log( "Rotate3DToolBase.captureSelectionDrawn _origin: " + this._origin );
                    this._updateTargets();
                    //this._setTransformOrigin(false);
                }
                else {
                    this.target = this.application.ninja.currentDocument.model.documentRoot;
                    //this._origin = drawUtils._selectionCtr.slice(0);
                    //this._origin[0] += this.application.ninja.stage.userContentLeft;
                    //this._origin[1] += this.application.ninja.stage.userContentTop;
                    this._updateTargets();
                    this._origin = this.calculateMultiSelOrigin();
                    //this._setTransformOrigin(true);
                }
            }
            else {
                this.target = null;
            }
            this.DrawHandles();

            if(event)
            {
                this.eventManager.removeEventListener("selectionDrawn", this, true);
            }
        }
    },

    calculateMultiSelOrigin:
    {
        value: function()
        {
            var minPt,  maxPt, i,j;
            this._startOriginArray = [];
            var len = this.application.ninja.selectedElements.length;
            for (i = 0; i < len; i++)
            {
                // get the next element and localToGlobal matrix
                var elt = this.application.ninja.selectedElements[i];
                var l2g = elt.elementModel.getProperty("l2g");

                // get the element bounds in 'plane' space
                var bounds = viewUtils.getElementViewBounds3D( elt );
                for (j=0;  j<4;  j++)
                {
                    var localPt = bounds[j];
                    //var pt = MathUtils.transformAndDivideHomogeneousPoint( localPt, l2g );
                    var pt = viewUtils.localToStageWorld( localPt, elt );
                    if (!minPt)
                    {
                        minPt = pt.slice();
                        maxPt = pt.slice();
                    }
                    else
                    {
                        minPt[0] = Math.min(minPt[0],pt[0]);  minPt[1] = Math.min(minPt[1],pt[1]);  minPt[2] = Math.min(minPt[2],pt[2]);
                        maxPt[0] = Math.max(maxPt[0],pt[0]);  maxPt[1] = Math.max(maxPt[1],pt[1]);  maxPt[2] = Math.max(maxPt[2],pt[2]);
                    }
                }
            }
            var stageWorldCtr = [ 0.5*(minPt[0] + maxPt[0]),  0.5*(minPt[1] + maxPt[1]), 0.5*(minPt[2] + maxPt[2]) ];
            var globalCtr = MathUtils.transformAndDivideHomogeneousPoint( stageWorldCtr, viewUtils.getStageWorldToGlobalMatrix() );
//          console.log( "resetting _origin to: " + this._origin );

            return globalCtr;
        }
    },


    DrawHandles: {
        value: function (delta) {
            this.application.ninja.stage.clearDrawingCanvas();

            if(!this._handles)
            {
                this._handles = [];

                // TODO - Using dummy cursors for now

                // translateX
                var rX = toolHandleModule.TranslateHandle.create();
                rX.init("url('images/cursors/Translate_X.png') 0 0, default", 'rgba(255,0,0,1)', "x");
                this._handles.push(rX);

                // translateY
                var rY = toolHandleModule.TranslateHandle.create();
                rY.init("url('images/cursors/Translate_Y.png') 0 0, default", 'rgba(0,255,0,1)', "y");
                this._handles.push(rY);

                // translateZ
                var rZ = toolHandleModule.TranslateHandle.create();
                rZ.init("url('images/cursors/Translate_Z.png') 0 0, default", 'rgba(0,0,255,1)', "z");
                this._handles.push(rZ);
            }

            var item = this._target;
            if(!item)
            {
                return;
            }

            // Draw tool handles

            this._updateHandlesOrigin();
            var base = this._origin.slice(0);

//          if (this.isDrawing)
//              console.log( "handle origin: " + base );

            var len = this.application.ninja.selectedElements.length;
            var lMode = this._inLocalMode;
            if(len === 1)
            {
                viewUtils.pushViewportObj( item );
            }
            else
            {
                lMode = false;
                viewUtils.pushViewportObj( this.application.ninja.currentDocument.model.documentRoot );
            }

            if(this._handleMode !== null)
            {
                switch(this._handleMode)
                {
                    case 0:
                        this._handles[1]._strokeStyle = 'rgba(0, 255, 0, 0.2)';
                        this._handles[2]._strokeStyle = 'rgba(0, 0, 255, 0.2)';
                        break;
                    case 1:
                        this._handles[0]._strokeStyle = 'rgba(255, 0, 0, 0.2)';
                        this._handles[2]._strokeStyle = 'rgba(0, 0, 255, 0.2)';
                        break;
                    case 2:
                        this._handles[0]._strokeStyle = 'rgba(255, 0, 0, 0.2)';
                        this._handles[1]._strokeStyle = 'rgba(0, 255, 0, 0.2)';
                        break;
                }
                if( delta && (len > 1) )
                {
                    base[this._handleMode] += ~~delta;
                }
            }
            this._handles[0].draw(base, item, lMode);
            this._handles[1].draw(base, item, lMode);
            this._handles[2].draw(base, item, lMode);

            if(delta && (this._handleMode !== null))
            {
                this._handles[this._handleMode].drawDelta(~~delta);
            }

            this._handles[0]._strokeStyle = 'rgba(255, 0, 0, 1)';
            this._handles[1]._strokeStyle = 'rgba(0, 255, 0, 1)';
            this._handles[2]._strokeStyle = 'rgba(0, 0, 255, 1)';

            viewUtils.popViewportObj();
        }
    }

});
