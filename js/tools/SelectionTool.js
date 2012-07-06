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
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils,
    toolHandleModule = require("js/stage/tool-handle"),
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator,
    DrawingToolBase = require("js/tools/drawing-tool-base").DrawingToolBase,
    Keyboard = require("js/mediators/keyboard-mediator").Keyboard,
    ModifierToolBase = require("js/tools/modifier-tool-base").ModifierToolBase;

var SelectionTool = exports.SelectionTool = Montage.create(ModifierToolBase, {
    drawingFeedback: { value: { mode: "Draw2D", type: "" } },

    _inLocalMode: { value: false},      // This tool should always use global mode for translations
    _canOperateOnStage: { value: true},
    _isSelecting: {value: false, writable:true},
    _shiftMove: { value: 10},
    _use3DMode: { value: false },

    _showTransformHandles: { value: false, enumerable: true },

    _handleToolOptionsChange : {
        value: function (event) {
            this._showTransformHandles = event.detail.inTransformMode;
            this.DrawHandles();
        }
    },

    _areElementsOnSamePlane : {
        value: function () {
            if(this.application.ninja.selectedElements.length) {
                var len = this.application.ninja.selectedElements.length;
                var plane = this.application.ninja.stage.stageDeps.snapManager.getDragPlane();
                for(var i = 0; i < len; i++) {
                    if(!this.application.ninja.stage.stageDeps.snapManager.elementIsOnPlane(this.application.ninja.selectedElements[i], plane)) {
                        return false;
                    }
                }
            }

            return true;
        }
    },

    _areElementsIn2D : {
        value: function () {
            if(this.application.ninja.selectedElements.length) {
                var len = this.application.ninja.selectedElements.length;
                for(var i = 0; i < len; i++) {
                    if(!MathUtils.isIdentityMatrix(this.application.ninja.selectedElements[i].elementModel.getProperty("mat"))) {
                        return false;
                    }
                }
            }
            return true;
        }
    },

    startDraw: {
        value: function(event) {
            this.drawData = null;

            if(!this.application.ninja.selectedElements.length)
            {
                this._isSelecting = true;
                this._canSnap = false;
            }
            else
            {
                this._canSnap = true;
                this._updateTargets();
            }

            this.isDrawing = true;
            this.application.ninja.stage.showSelectionBounds = false;

            this._use3DMode = false;

            if(this._canSnap)
            {
                this.initializeSnapping(event);
//                this._use3DMode = !this._areElementsOnSamePlane();
                this._use3DMode = !this._areElementsIn2D();
//                console.log("use3DMode = " + this._use3DMode);
            }
            else
            {
                this.drawWithoutSnapping(event);
            }
        }
    },

    drawSelectionMarquee: {
        value: function(event) {
            var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                        new WebKitPoint(event.pageX, event.pageY));

            if(this._isSpace) {
                this._currentDX = point.x - this._currentX;
                this._currentDY = point.y - this._currentY;

                this.downPoint.x += this._currentDX;
                this.downPoint.y += this._currentDY;
                this.currentX += this._currentDX;
                this.currentY += this._currentDY;

                DrawingToolBase.draw2DRectangle(this.downPoint.x,this.downPoint.y,this.currentX - this.downPoint.x,this.currentY - this.downPoint.y);
            } else {
                this._currentX = point.x;
                this._currentY = point.y;

                DrawingToolBase.draw2DRectangle(this.downPoint.x,this.downPoint.y,point.x - this.downPoint.x,point.y - this.downPoint.y);
            }
        }
    },

    HandleMouseMove: {
        value: function(event) {
            if(this._escape) {
                this._escape = false;
                this.isDrawing = true;
            }

            if(this._isSelecting) {
                // Draw the Selection Marquee
                this.drawSelectionMarquee(event);
            }
            else
            {
                if(this.isDrawing) {
                    this._hasDraw = true;   // Flag for position of element
                    this.doDraw(event);
                } else {
                    this._showFeedbackOnMouseMove(event);
                    if(this._canSnap)
                    {
                        this.doSnap(event);
                    }
                }

                this.DrawHandles(this._delta);
                if(this._canSnap)
                {
                    this.application.ninja.stage.stageDeps.snapManager.drawLastHit();
                }
            }
        }
    },

    HandleLeftButtonUp: {
        value: function(event) {
            var selectedItems,
                point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas, new WebKitPoint(event.pageX, event.pageY));

            this.isDrawing = false;
            this.application.ninja.stage.showSelectionBounds = true;
            if(this._escape) {
                this._escape = false;
                this._isSelecting = false;
                this._canSnap = true;
                this._use3DMode = false;
                return;
            }


            if(this._isSelecting) {
                this._isSelecting = false;

                // Don't do the marque selection if the mouse has not moved
                if(this.downPoint.x != point.x && this.downPoint.y != point.y) {
                    var box = [];
                    selectedItems = [];

                    box[0] = this.downPoint.x;
                    box[1] = this.downPoint.y;
                    box[2] = point.x;
                    box[3] = point.y;

                    //selectionManagerModule.selectionManager.marqueeSelection(box);
                    var childNodes = this.application.ninja.currentDocument.model.documentRoot.childNodes,
                        selectionController = this.application.ninja.selectionController;
                    childNodes = Array.prototype.slice.call(childNodes, 0);
                    childNodes.forEach(function(item) {
                        if(selectionController.isNodeTraversable(item) && SelectionTool._complicatedCollisionDetection(item, box)) {
                            selectedItems.push(item);
                        }
                    });

                    this.application.ninja.selectionController.selectElements(selectedItems);

                }

                this.endDraw(event);
                this._canSnap = true;
                this._use3DMode = false;
                return;
            }



            if(this._hasDraw)
            {
                if(this._activateOriginHandle)
                {
                    this._setTransformOrigin(true);
                }
                else if ( ((this.downPoint.x - point.x) !== 0) ||
                            ((this.downPoint.y - point.y) !== 0) )
                {
                    this._updateTargets(true);
                }

                this._hasDraw = false;
            }
            if(this._handleMode !== null)
            {
                this._handleMode = null;
                this._delta = null;
            }

            this.endDraw(event);
            this._canSnap = true;
            this._use3DMode = false;
            this.DrawHandles();
        }
    },

    /**
     * Double click handler
     *
     * Sets the currentSelectionContainer to the current selected element. If no elements are selected set the
     * currentSelectionContainer to the userDocument div.
     */
    HandleDoubleClick: {
        value: function(event) {
            if(this.application.ninja.selectedElements.length > 0) {
                this.application.ninja.currentDocument.model.domContainer = this.application.ninja.selectedElements[0];
            } else {
                this.application.ninja.currentDocument.model.domContainer = this.application.ninja.currentDocument.model.documentRoot;
            }
            this.application.ninja.selectionController.executeSelectElement();
        }
    },

    HandleKeyPress: {
        value: function(event){
            var inc;

            if (!(event.target instanceof HTMLInputElement)) {
                if(this.application.ninja.selectedElements.length !== 0) {
                    inc  = (event.shiftKey) ? this._shiftMove : 1;

                    switch(event.keyCode) {
                        case Keyboard.LEFT:
                            var newLeft = [];
                            var leftArr = this.application.ninja.selectedElements.map(function(item) {
                                newLeft.push( (parseInt(ElementsMediator.getProperty(item, "left")) - inc) + "px"  );
                                return ElementsMediator.getProperty(item, "left");
                            });

                            ElementsMediator.setProperty(this.application.ninja.selectedElements, "left", newLeft , "Change", "selectionTool", leftArr);
                            break;
                        case Keyboard.UP:
                            var newTop = [];
                            var topArr = this.application.ninja.selectedElements.map(function(item) {
                                newTop.push( (parseInt(ElementsMediator.getProperty(item, "top")) - inc) + "px"  );
                                return ElementsMediator.getProperty(item, "top");
                            });

                            ElementsMediator.setProperty(this.application.ninja.selectedElements, "top", newTop , "Change", "selectionTool", topArr);
                            break;
                        case Keyboard.RIGHT:
                            var newLeft = [];
                            var leftArr = this.application.ninja.selectedElements.map(function(item) {
                                newLeft.push( (parseInt(ElementsMediator.getProperty(item, "left")) + inc) + "px"  );
                                return ElementsMediator.getProperty(item, "left");
                            });

                            ElementsMediator.setProperty(this.application.ninja.selectedElements, "left", newLeft , "Change", "selectionTool", leftArr);
                            break;
                        case Keyboard.DOWN:
                            var newTop = [];
                            var topArr = this.application.ninja.selectedElements.map(function(item) {
                                newTop.push( (parseInt(ElementsMediator.getProperty(item, "top")) + inc) + "px"  );
                                return ElementsMediator.getProperty(item, "top");
                            });

                            ElementsMediator.setProperty(this.application.ninja.selectedElements, "top", newTop , "Change", "selectionTool", topArr);
                            break;
                        default:
                            return false;
                            break;
                    }


                } else {
                    // Try and capture the delete key so that the browser doesn't attempt an unwelcome history action.
                    if (event.keyCode == Keyboard.BACKSPACE) {
                        event.stopImmediatePropagation();
                        event.preventDefault();
                    }
                }
            }
            // console.log("Unhandled key press:", event.keyCode);

        }
    },

    _updateTargets: {
        value: function(addToUndo) {
            var modObject = [], mod3dObject = [], self = this;

            this.application.ninja.selectedElements.forEach(function(element) {

                if(addToUndo) {
                    if(!self._use3DMode) {
                        var prevX = element.elementModel.getProperty("x");
                        var prevY = element.elementModel.getProperty("y");
                        var prevW = element.elementModel.getProperty("w");
                        var prevH = element.elementModel.getProperty("h");
                        var x = ElementsMediator.getProperty(element, "left");
                        var y = ElementsMediator.getProperty(element, "top");
                        var w = ElementsMediator.getProperty(element, "width");
                        var h = ElementsMediator.getProperty(element, "height");

                        // if we have a delta, that means the transform handles were used and
                        // we should update the width and height too.  Otherwise, just update left and top.
                        if(this.delta) {
                            modObject.push({element:element, properties:{left: x, top:y, width: w, height: h}, previousProperties: {left: prevX, top:prevY, width: prevW, height: prevH}});
                        } else {
                            modObject.push({element:element, properties:{left: x, top:y}, previousProperties: {left: prevX, top:prevY}});
                        }

                    } else {
                        // Not using the 3d mode
                        var previousMat = element.elementModel.getProperty("mat").slice(0);
                        var prevW = element.elementModel.getProperty("w");
                        var prevH = element.elementModel.getProperty("h");
                        var w = ElementsMediator.getProperty(element, "width");
                        var h = ElementsMediator.getProperty(element, "height");

                        var previousStyleStr = {dist:element.elementModel.getProperty("dist"), mat:MathUtils.scientificToDecimal(previousMat, 5)};
                        var newStyleStr = {dist:viewUtils.getPerspectiveDistFromElement(element), mat:MathUtils.scientificToDecimal(viewUtils.getMatrixFromElement(element), 5)};

                        modObject.push({element:element, properties:{width: w, height:h}, previousProperties: {width: prevW, height:prevH}});
                        mod3dObject.push({element:element, properties:newStyleStr, previousProperties: previousStyleStr});
                    }
                }
            });

            // Move them
            if(addToUndo) {
                if(!this._use3DMode) {
                        ElementsMediator.setProperties(modObject, "Change", "SelectionTool" );
                } else {
                    // TODO - We don't support transform handles in 3d space for now
                    ElementsMediator.setProperties(modObject, "Change", "SelectionTool" );
                    ElementsMediator.set3DProperties(mod3dObject, "Change", "translateTool");

                }
            }

            this.application.ninja.selectedElements.forEach(function(element) {
                element.elementModel.setProperty("x", ElementsMediator.getProperty(element, "left"));
                element.elementModel.setProperty("y", ElementsMediator.getProperty(element, "top"));
                element.elementModel.setProperty("w", ElementsMediator.getProperty(element, "width"));
                element.elementModel.setProperty("h", ElementsMediator.getProperty(element, "height"));
                element.elementModel.setProperty("mat", viewUtils.getMatrixFromElement(element));
                element.elementModel.setProperty("matInv", glmat4.inverse(element.elementModel.getProperty("mat"), []));
                element.elementModel.setProperty("dist", viewUtils.getPerspectiveDistFromElement(element));
            });

        }
    },

    _moveElements: {
        value: function (transMat) {
            var elt, curMat, targets = [];

//          var matInv = glmat4.inverse(this._startMat, []);
//          var qMat = glmat4.multiply(matInv, nMat, []);
            this._startMat = glmat4.multiply(transMat, this._startMat, [] );

            var self = this;

            this.application.ninja.selectedElements.forEach(function(element) {
                if(self._use3DMode) {
                    curMat = element.elementModel.getProperty("mat");

                    curMat[12] += transMat[12];
                    curMat[13] += transMat[13];
                    curMat[14] += transMat[14];
                    viewUtils.setMatrixForElement( element, curMat, true);
                    element.elementModel.setProperty("mat", curMat);
                } else {
                    var x = (parseInt(ElementsMediator.getProperty(element, "left")) + transMat[12]) + "px";
                    var y = (parseInt(ElementsMediator.getProperty(element, "top")) + transMat[13]) + "px";

                    targets.push({element:element, properties:{left:x , top:y}});
                }
            });

            if(this._use3DMode) {
                return NJevent("elementChanging", {type : "Changing", redraw: false});
            } else {
                ElementsMediator.setProperties(targets, "Changing", "SelectionTool" );
            }
        }
    },

    //-------------------------------------------------------------------------
    //Routines to modify the selected objects
    modifyElements : {
        value : function(data, event) {
            var delta, modObject = [], left, top, width, height;

            if(this._handleMode !== null) {
                // 0  7  6
                // 1     5
                // 2  3  4
                switch(this._handleMode)
                {
                    case 0:
                        // Resize North-West
                        this.application.ninja.selectedElements.forEach(function(element) {
                            delta = ~~(data.pt1[0] - data.pt0[0]);
                            width = parseInt(element.elementModel.getProperty("w")) - delta;
                            if(width <= 0) {
                                width = 1;
                                left = parseInt(element.elementModel.getProperty("x")) + parseInt(element.elementModel.getProperty("w")) - 1;
                            } else {
                                left = parseInt(element.elementModel.getProperty("x")) + delta;
                            }

                            delta = ~~(data.pt1[1] - data.pt0[1]);
                            height = parseInt(element.elementModel.getProperty("h")) - delta;
                            if(height <= 0) {
                                height = 1;
                                top = parseInt(element.elementModel.getProperty("y")) + parseInt(element.elementModel.getProperty("h")) - 1;
                            } else {
                                top = parseInt(element.elementModel.getProperty("y")) + delta;
                            }
                            modObject.push({element:element, properties:{width: width + "px", height: height + "px", left: left + "px", top: top + "px"}});
                        });
                        break;
                    case 1:
                        // Resize West
                        this.application.ninja.selectedElements.forEach(function(element) {
                            delta = ~~(data.pt1[0] - data.pt0[0]);
                            width = parseInt(element.elementModel.getProperty("w")) - delta;
                            if(width <= 0) {
                                width = 1;
                                left = parseInt(element.elementModel.getProperty("x")) + parseInt(element.elementModel.getProperty("w")) - 1;
                            } else {
                                left = parseInt(element.elementModel.getProperty("x")) + delta;
                            }
                            modObject.push({element:element, properties:{left: left + "px", width: width + "px"}});
                        });
                        break;
                    case 2:
                        // Resize South-West
                        this.application.ninja.selectedElements.forEach(function(element) {
                            delta = ~~(data.pt1[0] - data.pt0[0]);
                            width = parseInt(element.elementModel.getProperty("w")) - delta;
                            if(width <= 0) {
                                width = 1;
                                left = parseInt(element.elementModel.getProperty("x")) + parseInt(element.elementModel.getProperty("w")) - 1;
                            } else {
                                left = parseInt(element.elementModel.getProperty("x")) + delta;
                            }
                            delta = ~~(data.pt1[1] - data.pt0[1]);
                            height = parseInt(element.elementModel.getProperty("h")) + delta;
                            if(height <= 0) {
                                height = 1;
                            }
                            modObject.push({element:element, properties:{width: width + "px", height: height + "px", left: left + "px"}});
                        });
                        break;
                    case 3:
                        // Resize South
                        this.application.ninja.selectedElements.forEach(function(element) {
                            delta = ~~(data.pt1[1] - data.pt0[1]);
                            height = parseInt(element.elementModel.getProperty("h")) + delta;
                            if(height <= 0) {
                                height = 1;
                            }
                            modObject.push({element:element, properties:{height: height + "px"}});
                        });
                        break;
                    case 4:
                        // Resize South-East
                        this.application.ninja.selectedElements.forEach(function(element) {
                            delta = ~~(data.pt1[0] - data.pt0[0]);
                            width = parseInt(element.elementModel.getProperty("w")) + delta;
                            if(width <= 0) {
                                width = 1;
                            }
                            delta = ~~(data.pt1[1] - data.pt0[1]);
                            height = parseInt(element.elementModel.getProperty("h")) + delta;
                            if(height <= 0) {
                                height = 1;
                            }
                            modObject.push({element:element, properties:{width: width + "px", height: height + "px"}});
                        });
                        break;
                    case 5:
                        // Resize East
                        this.application.ninja.selectedElements.forEach(function(element) {
                            delta = ~~(data.pt1[0] - data.pt0[0]);
                            width = parseInt(element.elementModel.getProperty("w")) + delta;
                            if(width <= 0) {
                                width = 1;
                            }
                            modObject.push({element:element, properties:{width: width + "px"}});
                        });
                        break;
                    case 6:
                        // Resize North-East
                        this.application.ninja.selectedElements.forEach(function(element) {
                            delta = ~~(data.pt1[0] - data.pt0[0]);
                            width = parseInt(element.elementModel.getProperty("w")) + delta;
                            if(width <= 0) {
                                width = 1;
                            }
                            delta = ~~(data.pt1[1] - data.pt0[1]);
                            height = parseInt(element.elementModel.getProperty("h")) - delta;
                            if(height <= 0) {
                                height = 1;
                                top = parseInt(element.elementModel.getProperty("y")) + parseInt(element.elementModel.getProperty("h")) - 1;
                            } else {
                                top = parseInt(element.elementModel.getProperty("y")) + delta;
                            }
                            modObject.push({element:element, properties:{width: width + "px", height: height + "px", top: top + "px"}});
                        });
                        break;
                    case 7:
                        // Resize North
                        this.application.ninja.selectedElements.forEach(function(element) {
                            delta = ~~(data.pt1[1] - data.pt0[1]);
                            height = parseInt(element.elementModel.getProperty("h")) - delta;
                            if(height <= 0) {
                                height = 1;
                                top = parseInt(element.elementModel.getProperty("y")) + parseInt(element.elementModel.getProperty("h")) - 1;
                            } else {
                                top = parseInt(element.elementModel.getProperty("y")) + delta;
                            }
                            modObject.push({element:element, properties:{height: height + "px", top: top + "px"}});
                        });
                        break;
                    default:
                        break;
                }

                ElementsMediator.setProperties(modObject, "Changing", "SelectionTool" );
                this._delta = delta;
            }
            else
            {
                // form the translation vector and post translate the matrix by it.
                delta = vecUtils.vecSubtract( 3, data.pt1, data.pt0 );
                delta[0] = ~~delta[0];
                delta[1] = ~~delta[1];
                //delta[2] = 0;
                var transMat = Matrix.Translation( delta );
                this._moveElements(transMat);
            }
        }
    },

    updateUsingSnappingData: {
        value: function(event) {
            var data;

            if(this._handleMode === null)
            {
                this.getUpdatedSnapPoint(event);
                if (this._mouseDownHitRec && this._mouseUpHitRec)
                {
                    data = this.getMousePoints();
                    if(data)
                    {
                        this.modifyElements(data, event);
                    }
                }
            }
            else
            {
                var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                                new WebKitPoint(event.pageX, event.pageY));
                var do3DSnap = false;
                do3DSnap = event.ctrlKey || event.metaKey;

                this.mouseUpHitRec = DrawingToolBase.getUpdatedSnapPoint(point.x, point.y, do3DSnap, this.mouseDownHitRec);
                if (this._mouseDownHitRec && this._mouseUpHitRec)
                {
                    this.modifyElements({pt0:this._mouseDownHitRec.calculateElementScreenPoint(),
                                            pt1:this._mouseUpHitRec.calculateElementScreenPoint()}, event);
                }
            }
        }
    },

    /*
     *  The parameterization is based on the position of the
     *  snap point in pre-transformed element screen space
     */
    parameterizeSnap:
    {
        value: function( hitRec )
        {
            var paramPt = [0,0,0];
             var elt = this._getObjectBeingTracked(hitRec);
            if (elt)
            {
                this.clickedObject = elt;
                if(this._handleMode === null)
                {
                    var worldPt = hitRec.calculateStageWorldPoint();
                    MathUtils.makeDimension4( worldPt );
                    var mat = viewUtils.getObjToStageWorldMatrix( elt, true );
                    if(mat)
                    {
                        var invMat = glmat4.inverse(mat, []);
                        var scrPt = MathUtils.transformHomogeneousPoint( worldPt, invMat );
                        scrPt = MathUtils.applyHomogeneousCoordinate( scrPt );

                        var bounds = viewUtils.getElementViewBounds3D( elt );
                        var x0 = bounds[0][0],  x1 = bounds[3][0],
                            y0 = bounds[0][1],  y1 = bounds[1][1];
                        var dx = x1 - x0,   dy = y1 - y0;
                        var u = 0, v = 0;
                        if (MathUtils.fpSign(dx) != 0)
                            u = (scrPt[0] - x0) / dx;
                        if (MathUtils.fpSign(dy) != 0)
                            v = (scrPt[1] - y0) / dy;

                        paramPt[0] = u;
                        paramPt[1] = v;
                        paramPt[2] = scrPt[2];
                    }
                }
                else
                {
                    // 0  7  6
                    // 1     5
                    // 2  3  4
                    switch(this._handleMode)
                    {
                        case 0:
                            paramPt = [0,0,0];
                            break;
                        case 1:
                            paramPt = [0,0.5,0];
                            break;
                        case 2:
                            paramPt = [0,1,0];
                            break;
                        case 3:
                            paramPt = [0.5,1,0];
                            break;
                        case 4:
                            paramPt = [1,1,0];
                            break;
                        case 5:
                            paramPt = [1,0.5,0];
                            break;
                        case 6:
                            paramPt = [1,0,0];
                            break;
                        case 7:
                            paramPt = [0.5,0,0];
                            break;
                    }
                }
            }

            return paramPt;
        }
    },

    /**
     * This function is for specifying custom feedback routine
     * upon mouse over.
     * For example, the drawing tools will add a glow when mousing
     * over existing canvas elements to signal to the user that
     * the drawing operation will act on the targeted canvas.
     */
    _showFeedbackOnMouseMove : {
        value: function (event) {
            if(!this._showTransformHandles)
            {
                return;
            }
            if((this.application.ninja.selectedElements.length === 1) && this._handles)
            {
                var len = this._handles.length;
                var i = 0,
                    toolHandle,
                    c,
                    point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                            new WebKitPoint(event.pageX, event.pageY));
                for (i=0; i<len; i++)
                {
                    toolHandle = this._handles[i];
                    c = toolHandle.collidesWithPoint(point.x, point.y);
                    if(c)
                    {
                        this.application.ninja.stage.drawingCanvas.style.cursor = toolHandle._cursor;
                        this._handleMode = i;
                        return;
                    }
                }
            }

            this._handleMode = null;
   //            this.application.ninja.stage.drawingCanvas.style.cursor = this._cursor;
            this.application.ninja.stage.drawingCanvas.style.cursor = "auto";
        }
    },

    // TODO - This tool-specific customization should be somewhere else
    _initializeToolHandles: {
        value: function() {
            this.application.ninja.stage.stageDeps.snapManager.enableSnapAlign( false );
            this.application.ninja.stage.stageDeps.snapManager.enableElementSnap( false );
            this.application.ninja.stage.stageDeps.snapManager.enableGridSnap( false );
        }
    },

    // Should be an array of handles for each tool.
    // The array should contain ToolHandle objects that define
    // dimensions, cursor, functionality
    // For example, the Selection Tool holds the 8 resize handles in this order because this
    // is the order we retrieve a rectangle's points using viewUtils:
    // 0  7  6
    // 1     5
    // 2  3  4
    // Draw handles.  For now, we are setting up the selection/transform tool's handles in this base class
    // But it should probably be moved to the selection tool
    DrawHandles: {
        value: function (delta) {
            this.application.ninja.stage.clearDrawingCanvas();

            var item = this._target;
            if(!item || (item === this.application.ninja.currentDocument.model.documentRoot))
            {
                return;
            }
            if(!this._showTransformHandles)
            {
                this._drawTopLeft(item);
                return;
            }

            if(!this._handles)
            {
                this._handles = [];

                // NorthWest
                var nw = toolHandleModule.ToolHandle.create();
                nw.init("NW-resize");
                this._handles.push(nw);

                // West
                var w = toolHandleModule.ToolHandle.create();
                w.init("W-resize");
                this._handles.push(w);

                // SouthWest
                var sw = toolHandleModule.ToolHandle.create();
                sw.init("SW-resize");
                this._handles.push(sw);

                // South
                var s = toolHandleModule.ToolHandle.create();
                s.init("S-resize");
                this._handles.push(s);

                // SouthEast
                var se = toolHandleModule.ToolHandle.create();
                se.init("SE-resize");
                this._handles.push(se);

                // East
                var e = toolHandleModule.ToolHandle.create();
                e.init("E-resize");
                this._handles.push(e);

                // NorthEast
                var ne = toolHandleModule.ToolHandle.create();
                ne.init("NE-resize");
                this._handles.push(ne);

                // North
                var n = toolHandleModule.ToolHandle.create();
                n.init("N-resize");
                this._handles.push(n);

            }


            viewUtils.setViewportObj( item );
            var bounds3D = viewUtils.getElementViewBounds3D( item );

            var zoomFactor = 1;
            var viewPort = this.application.ninja.stage._viewport;
            if (viewPort && viewPort.style && viewPort.style.zoom) {
                zoomFactor = Number(viewPort.style.zoom);
            }

            var tmpMat = viewUtils.getLocalToGlobalMatrix( item );
            for (var j=0;  j<4;  j++)
            {
                var localPt = bounds3D[j];
                var tmpPt = viewUtils.localToGlobal2(localPt, tmpMat);

                if(zoomFactor !== 1)
                {
                    tmpPt = vecUtils.vecScale(3, tmpPt, zoomFactor);

                    tmpPt[0] += this.application.ninja.stage._scrollLeft*(zoomFactor - 1);
                    tmpPt[1] += this.application.ninja.stage._scrollTop*(zoomFactor - 1);
                }
                bounds3D[j] = tmpPt;
            }

            // Draw tool handles
            var context = this.application.ninja.stage.drawingContext;
            context.beginPath();

            // NW
            var x = bounds3D[0][0];
            var y = bounds3D[0][1];
            context.moveTo(x, y);
            this._handles[0].draw(x, y);

            var left = x;
            var top = y;

//            if(delta)
            if(!this._use3DMode && this.isDrawing)
            {
                context.font = "10px sans-serif";
                context.textAlign = "right";

                context.fillText("( " + ~~(left - this.application.ninja.stage.userContentLeft) + " , " +
                                       ~~(top - this.application.ninja.stage.userContentTop) + " )", x-10, y-4);
            }

            // W
            var pt = MathUtils.interpolateLine3D(bounds3D[0], bounds3D[1], 0.5);
            x = pt[0];
            y = pt[1];
            context.moveTo( x, y );
            this._handles[1].draw(x, y);

            // SW
            x = bounds3D[1][0];
            y = bounds3D[1][1];
            context.moveTo( x, y );
            this._handles[2].draw(x, y);

            // S
            pt = MathUtils.interpolateLine3D(bounds3D[1], bounds3D[2], 0.5);
            x = pt[0];
            y = pt[1];
            context.moveTo( x, y );
            this._handles[3].draw(x, y);

            // SE
            x = bounds3D[2][0];
            y = bounds3D[2][1];
            context.moveTo( x, y );
            this._handles[4].draw(x, y);

//            if(delta)
            if(!this._use3DMode && this.isDrawing)
            {
                context.fillText("H: " + ~~(y - top), x+38, y - 4);
                context.fillText("W: " + ~~(x - left), x-5, y + 12);
            }

            // E
            pt = MathUtils.interpolateLine3D(bounds3D[2], bounds3D[3], 0.5);
            x = pt[0];
            y = pt[1];
            context.moveTo( x, y );
            this._handles[5].draw(x, y);

            // NW
            x = bounds3D[3][0];
            y = bounds3D[3][1];
            context.moveTo( x, y );
            this._handles[6].draw(x, y);

            // N
            pt = MathUtils.interpolateLine3D(bounds3D[0], bounds3D[3], 0.5);
            x = pt[0];
            y = pt[1];
            context.moveTo( x, y );
            this._handles[7].draw(x, y);

            context.closePath();
        }
    },

    _drawTopLeft: {
        value: function(item)
        {
            if(!this.isDrawing || this._use3DMode)
            {
                return;
            }
            viewUtils.setViewportObj( item );
            var bounds3D = viewUtils.getElementViewBounds3D( item );

            var zoomFactor = 1;
            var viewPort = this.application.ninja.stage._viewport;
            if (viewPort && viewPort.style && viewPort.style.zoom)
            {
                zoomFactor = Number(viewPort.style.zoom);
            }
            var tmpMat = viewUtils.getLocalToGlobalMatrix( item );
            for (var j=0;  j<4;  j++)
            {
                var localPt = bounds3D[j];
                var tmpPt = viewUtils.localToGlobal2(localPt, tmpMat);

                if(zoomFactor !== 1)
                {
                    tmpPt = vecUtils.vecScale(3, tmpPt, zoomFactor);

                    tmpPt[0] += this.application.ninja.stage._scrollLeft*(zoomFactor - 1);
                    tmpPt[1] += this.application.ninja.stage._scrollTop*(zoomFactor - 1);
                }
                bounds3D[j] = tmpPt;
            }

            // Draw tool handles
            var context = this.application.ninja.stage.drawingContext;
            context.beginPath();

            // NW
            var x = bounds3D[0][0];
            var y = bounds3D[0][1];
            context.moveTo(x, y);

            context.font = "10px sans-serif";
            context.textAlign = "right";

            context.fillText("( " + ~~(x - this.application.ninja.stage.userContentLeft) + " , " +
                                   ~~(y - this.application.ninja.stage.userContentTop) + " )", x-10, y-4);

            context.closePath();
        }
    },

    // TODO : Use the new element mediator to get element offsets
    _complicatedCollisionDetection: {
        value: function(elt, box)
        {
            var left, top, width, height;

            left = box[0];
            width = box[2] - left;
            if (width < 0)
            {
                left = box[2];
                width = -width;
            }
            top = box[1];
            height = box[3] - top;
            if (height < 0)
            {
                top = box[3];
                height = -height;
            }

            var rtnVal = MathUtils.rectsOverlap( [left,top], width, height,  elt );

            return rtnVal;
        }
    },

    // TODO : Use the new element mediator to get element offsets
    _simpleCollisionDetection: {
        value: function(ele, box){
            var left1, left2, right1, right2, top1, top2, bottom1, bottom2;

            left1 = ele.offsetLeft;
            left2 = box[0];
            right1 = ele.offsetLeft + ele.offsetWidth;
            right2 = box[2];
            top1 = ele.offsetTop;
            top2 = box[1];
            bottom1 = ele.offsetTop + ele.offsetHeight;
            bottom2 = box[3];

            if (bottom1 < top2) return false;
            if (top1 > bottom2) return false;
            if (right1 < left2) return false;
            if (left1 > right2) return false;

            return true;
        }
    }

});
