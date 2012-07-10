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

/**
@module js/document/documentManager
@requires montage/core/core
@requires montage/ui/component
*/
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils,
    vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils;

exports.Layout = Montage.create(Component, {

    canvas: {
        value: null,
        serializable: true
    },

    stage: {
        value: null,
        serializable: true
    },

    ctx: { value: null },

    drawFillColor: { value: 'rgba(255,255,255,1)' },
    ctxLineWidth: { value: 0.2 },

    _currentDocument: {
        value : null,
        enumerable : false
    },

    currentDocument : {
        get : function() {
            return this._currentDocument;
        },
        set : function(value) {
            if (value === this._currentDocument) {// || value.getProperty("currentView") !== "design") {
                return;
            }

            drawUtils._eltArray.length = 0;
            drawUtils._planesArray.length = 0;

            this._currentDocument = value;

            if(!value) {

            } else if(this._currentDocument.currentView === "design") {
                this.elementsToDraw = this._currentDocument.model.documentRoot.childNodes;
            }
        }
    },

    _layoutView: {
        value: "layoutAll"
    },

    layoutView: {
        get: function() {
            return this._layoutView;
        },
        set: function(value) {
            if(this._layoutView !== value) {
                this._layoutView = value;
                this.draw();
            }
        }
    },

    domTree: {
        value: []
    },

    elementsToDraw: {
        value: []
    },

    deserializedFromTemplate: {
        value: function() {
            this.ctx = this.canvas.getContext("2d");
            this.ctx.lineWidth = this.ctxLineWidth;
            this.ctx.fillStyle = this.drawFillColor;

            this.eventManager.addEventListener("selectionChange", this, false);
            this.eventManager.addEventListener("elementsRemoved", this, false);
        }
    },

    // Redraw stage only once after all deletion is completed
    handleElementsRemoved: {
        value: function(event) {
            this.draw();
            this.draw3DInfo(false);
        }
    },

    handleSelectionChange: {
        value: function(event) {
            var containerIndex;

            if(this.currentDocument === null){
                return;
            }

            if(this.currentDocument.currentView === "design"){
                // Make an array copy of the line node list which is not an array like object
                this.domTree = this.application.ninja.currentDocument.model.views.design.getLiveNodeList(true);
                // Index of the current container
                containerIndex = this.domTree.indexOf(this.currentDocument.model.domContainer);

                if(containerIndex < 0) {
                    // Stage is the container.
                    this.domTree = Array.prototype.slice.call(this.currentDocument.model.domContainer.childNodes, 0);
                } else {
                    // Child nodes of the container
                    this.domTree = Array.prototype.slice.call(this.domTree[containerIndex].childNodes, 0);
                }
            }
            // Clear the elements to draw
            this.elementsToDraw.length = 0;

            // Draw the non selected elements
            if(!event.detail.isDocument) {
                this.elementsToDraw = this.domTree.filter(function(value) {
                    return (event.detail.elements.indexOf(value) === -1);
                });
            } else {
                this.elementsToDraw = Array.prototype.slice.call(this.domTree, 0);
            }

            this.draw(); // Not a reel yet
            this.draw3DInfo(false);

            // Clear the domTree copy
            this.domTree.length = 0;
        }
    },

    draw: {
        value: function() {
            this.clearCanvas();

            // TODO Bind the layoutview mode to the current document
            // var mode  = this.application.ninja.currentDocument.layoutMode;
            if(this.layoutView === "layoutOff") return;

            var els = this.elementsToDraw.length;
            for(var i = 0, el; i < els; i++){
                this.drawTagOutline(this.elementsToDraw[i]);
            }
        }
    },

    draw3DInfo: {
        value: function(updatePlanes) {
            if(updatePlanes) {
                drawUtils.updatePlanes();
                this.application.ninja.stage.stageDeps.snapManager._isCacheInvalid = true;
            }

            if(this.stage.appModel.show3dGrid) {
                this.application.ninja.stage.stageDeps.snapManager.updateWorkingPlaneFromView();
            }
            drawUtils.drawWorkingPlane();
            drawUtils.draw3DCompass();
        }
    },

    clearCanvas: {
        value: function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },

    drawTagOutline: {
        value: function (item) {

            if(!item || !this.application.ninja.selectionController.isNodeTraversable(item)) return;

            // Don't draw outlines for shapes.
            // TODO Use the element mediator/controller/model to see if its a shape
            // if (utilsModule.utils.isElementAShape(item)) return;


            // draw the layout
            viewUtils.setViewportObj( item );
            var bounds3D = viewUtils.getElementViewBounds3D( item );
            var tmpMat = viewUtils.getLocalToGlobalMatrix( item );

            var zoomFactor = 1;
            if (this.stage._viewport && this.stage._viewport.style && this.stage._viewport.style.zoom) {
                zoomFactor = Number(this.stage._viewport.style.zoom);
            }

            var sSL = this.stage._scrollLeft;
            var sST = this.stage._scrollTop;

            for (var j=0;  j<4;  j++) {
                var localPt = bounds3D[j];
                var tmpPt = viewUtils.localToGlobal2(localPt, tmpMat);

                if(zoomFactor !== 1) {
                    tmpPt = vecUtils.vecScale(3, tmpPt, zoomFactor);

                    tmpPt[0] += sSL*(zoomFactor - 1);
                    tmpPt[1] += sST*(zoomFactor - 1);
                }
                bounds3D[j] = tmpPt;
            }

            if(item.uuid === this.currentDocument.model.domContainer.uuid) {
                this.ctx.save();
                this.ctx.strokeStyle = "#C61F00";

                this.ctx.beginPath();

                this.ctx.moveTo( bounds3D[3][0] + 0.5 ,  bounds3D[3][1] - 0.5 );

                this.ctx.lineTo( bounds3D[0][0] - 0.5 ,  bounds3D[0][1] - 0.5 );
                this.ctx.lineTo( bounds3D[1][0] - 0.5 ,  bounds3D[1][1] + 0.5 );
                this.ctx.lineTo( bounds3D[2][0] + 0.5  ,  bounds3D[2][1] + 0.5 );
                this.ctx.lineTo( bounds3D[3][0] + 0.5  ,  bounds3D[3][1] + 0.5 );

                this.ctx.closePath();
                this.ctx.stroke();

                this.ctx.restore();
            } else {
                // Draw the Item ouline
                this._dashedLine(bounds3D[3][0] - 0.5,bounds3D[3][1]- 0.5,bounds3D[0][0] + 2.5, bounds3D[0][1] - 0.5,[5,5]);
                this._dashedLine(bounds3D[0][0] - 0.5, bounds3D[0][1] - 0.5, bounds3D[1][0]- 0.5, bounds3D[1][1] + 0.5, [5,5] );
                this._dashedLine(bounds3D[1][0] - 0.5 , bounds3D[1][1] + 0.5, bounds3D[2][0]+ 0.5, bounds3D[2][1] + 0.5, [5,5] );
                this._dashedLine(bounds3D[2][0] + 0.5, bounds3D[2][1] + 0.5, bounds3D[3][0] + 0.5, bounds3D[3][1] - 0.5, [5,5] );
            }

            // Draw the Label is all mode
            if(this.layoutView === "layoutAll") {
                this.ctx.strokeStyle = 'rgba(0,0,0,1)'; // Black Stroke
                this.ctx.strokeRect(bounds3D[0][0]+5.5, bounds3D[0][1]-15.5, 70, 11);
                this.ctx.fillStyle = 'rgba(255,255,255,1)'; // White Fill
                this.ctx.fillRect(bounds3D[0][0]+6, bounds3D[0][1]-15, 69, 10);

                this.ctx.fillStyle = 'rgba(0,0,0,1)';
                this.ctx.font = "9px Droid Sans";

                this.ctx.fillText(this._elementName(item), bounds3D[0][0] + 8, bounds3D[0][1] - 7);
            }
        }
    },

    /**
     * redrawDocument: Redraws the outline for the entire document
     */
    redrawDocument: {
        value: function() {
            if(this.application.ninja.currentDocument) {
                this.clearCanvas();
                this.WalkDOM(this.application.ninja.currentDocument.model.documentRoot);

                //drawUtils.updatePlanes();
                //if(this.application.ninja.currentDocument.draw3DGrid) drawUtils.drawWorkingPlane();
                //drawUtils.draw3DCompass();
            }
        }
    },

    drawElementsOutline: {
        value: function(elements) {
            this.clearCanvas();
            this.WalkDOM(this.application.ninja.currentDocument.model.documentRoot, elements);
        }
    },

    WalkDOM: {
        value: function(element, excludeArray) {
            if(!element)
            {
                return;
            }

            try {
                if(element.nodeType == 1 && this.application.ninja.currentDocument.inExclusion(element) === -1 ) {

                    if(excludeArray) {
                        var found = false;
                        for(var j=0, elt; elt = excludeArray[j]; j++) {

                            if(elt.uuid === element.uuid) {
                                found = true;
                            }
                        }

                        if(!found) {
                            this.drawTagOutline(element);
                        }
                    } else {
                        this.drawTagOutline(element);
                    }

                }

                if(element.elementModel && element.elementModel.isComponent) {
                    this.WalkDOM(element.nextSibling, excludeArray);
                } else {
                    this.WalkDOM(element.firstChild, excludeArray);
                    this.WalkDOM(element.nextSibling, excludeArray);
                }
            } catch (err) {
                console.log(err);
            }
        }
    },

    // Dashed line function found at http://stackoverflow.com/questions/4576724/dotted-stroke-in-canvas/
    // Portions used with permission of Gavin Kistner (phrogz)
    _dashedLine: {
        value: function(x, y, x2, y2, dashArray) {
            this.ctx.lineCap = "square";
            this.ctx.beginPath();

            if(! dashArray) dashArray=[10,5];
            var dashCount = dashArray.length;
            var dx = (x2 - x);
            var dy = (y2 - y);
            var xSlope = (Math.abs(dx) > Math.abs(dy));
            var slope = (xSlope) ? dy / dx : dx / dy;

            this.ctx.moveTo(x, y);
            var distRemaining = Math.sqrt(dx * dx + dy * dy);
            var dashIndex = 0;
            while(distRemaining >= 0.1){
                var dashLength = Math.min(distRemaining, dashArray[dashIndex % dashCount]);
                var step = Math.sqrt(dashLength * dashLength / (1 + slope * slope));
                if(xSlope){
                    if(dx < 0) step = -step;
                    x += step;
                    y += slope * step;
                }else{
                    if(dy < 0) step = -step;
                    x += slope * step;
                    y += step;
                }

                this.ctx[(dashIndex % 2 == 0) ? 'lineTo' : 'moveTo'](x, y);
                distRemaining -= dashLength;
                dashIndex++;
            }

            this.ctx.closePath();
            this.ctx.stroke();
        }
    },

    _elementName: {
        value: function(item) {
            if(item.elementModel && item.elementModel.hasOwnProperty("selection")) {
                return item.elementModel['selection'];
            } else {
                return "";
            }
        }
    }


});
