/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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

    canvas: { value: null },
    ctx: { value: null },

    drawFillColor: { value: 'rgba(255,255,255,1)' },
    ctxLineWidth: { value: 0.2 },

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

//            this.eventManager.addEventListener("elementAdded", this, false);
            this.eventManager.addEventListener("elementDeleted", this, false);

            this.eventManager.addEventListener("selectionChange", this, false);

            this.eventManager.addEventListener("deleteSelection", this, false);
        }
    },

    handleOpenDocument: {
        value: function() {
            // Initial elements to draw are the childrens of the root element
            if(this.application.ninja.documentController.activeDocument.currentView === "design") {
                this.elementsToDraw = this.application.ninja.documentController.activeDocument.documentRoot.childNodes;
            }

            // Draw the elements and the 3d info
            this.draw();
            this.draw3DInfo(false);
        }
    },

    // Redraw stage only once after all deletion is completed
    handleDeleteSelection: {
        value: function(event) {
            this.draw();
            this.draw3DInfo(false);
        }
    },

    handleSelectionChange: {
        value: function(event) {
            var containerIndex;

            if(this.application.ninja.documentController.activeDocument === null){
                return;
            }

            if(this.application.ninja.documentController.activeDocument.currentView === "design"){
                // Make an array copy of the line node list which is not an array like object
                this.domTree = Array.prototype.slice.call(this.application.ninja.documentController.activeDocument._liveNodeList, 0);
                // Index of the current container
                containerIndex = this.domTree.indexOf(this.application.ninja.currentSelectedContainer);

                if(containerIndex < 0) {
                    // Stage is the container.
                    this.domTree = Array.prototype.slice.call(this.application.ninja.currentSelectedContainer.childNodes, 0);
                } else {
                    // Child nodes of the container
                    this.domTree = Array.prototype.slice.call(this.domTree[containerIndex].childNodes, 0);
                }
            }
            // Clear the elements to draw
            this.elementsToDraw.length = 0;

            // Draw the non selected elements
            if(!event.detail.isDocument) {
                var tmp = event.detail.elements.map(function(element){ return element._element});

                this.elementsToDraw = this.domTree.filter(function(value) {
                    return (tmp.indexOf(value) === -1);
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
            }

            if(this.stage.appModel.show3dGrid) {
                this.application.ninja.stage.stageDeps.snapManager.updateWorkingPlaneFromView();
                drawUtils.drawWorkingPlane();
            }

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

            if(!item) return;

            // TODO Bind the layoutview mode to the current document
            // var mode  = this.application.ninja.currentDocument.layoutMode;

            if(this.layoutView === "layoutOff") return;
            
            // Don't draw outlines for shapes.
            // TODO Use the element mediator/controller/model to see if its a shape
            // if (utilsModule.utils.isElementAShape(item)) return;


            // draw the layout
            viewUtils.setViewportObj( item );
            var bounds3D = viewUtils.getElementViewBounds3D( item );
            var tmpMat = viewUtils.getLocalToGlobalMatrix( item );

            var zoomFactor = 1;
            if (this.stage._viewport.style && this.stage._viewport.style.zoom) {
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

            if(item.uuid === this.application.ninja.currentSelectedContainer.uuid) {
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
                this.ctx.fillStyle = 'rgba(255,255,255,1)' // White Fill
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
                this.WalkDOM(this.application.ninja.currentDocument.documentRoot);

                //drawUtils.updatePlanes();
                //if(this.application.ninja.currentDocument.draw3DGrid) drawUtils.drawWorkingPlane();
                //drawUtils.draw3DCompass();
            }
        }
    },

    drawElementsOutline: {
        value: function(elements) {
            this.clearCanvas();
            this.WalkDOM(this.application.ninja.currentDocument.documentRoot, elements);
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
            return this.application.ninja.elementMediator.getNJProperty(item, "selection");
        }
    }

    
});