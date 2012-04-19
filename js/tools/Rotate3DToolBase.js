/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/* Base class for the 3D rotation tools
Subclass RotateObject3DTool will rotate the object that was clicked.
Subclass RotateStage3DTool will rotate the stage.
 */
var Montage = require("montage/core/core").Montage,
    ModifierToolBase = require("js/tools/modifier-tool-base").ModifierToolBase,
    snapManager = require("js/helper-classes/3D/snap-manager").SnapManager,
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils,
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils,
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

exports.Rotate3DToolBase = Montage.create(ModifierToolBase, {
	_canSnap: { value: false },

    _inLocalMode: { value: true, enumerable: true },

    rotateStage: {
        value: false
    },

    drawWithoutSnapping:
    {
        value: function(event)
        {
            if(this._handleMode !== null)
            {
                this._matL = this._handles[this._handleMode]._matL.slice(0);
                this._planeEq = this._handles[this._handleMode]._planeEq.slice(0);
                this._dirVecL = this._handles[this._handleMode]._dirVecL.slice(0);
                this._startPoint = MathUtils.getLocalPoint(this.downPoint.x,
                                                            this.downPoint.y,
                                                            this._planeEq,
                                                            this._matL);
                if(!this._startPoint)
                {
                    this._startPoint = [this.downPoint.x, this.downPoint.y];
                }
            }
        }
    },

    modifyElements: {
        value: function(data, event) {
            var mat, angle, pt0 = data.pt0, pt1 = data.pt1;

            if(this._handleMode !== null) {
                if(this._activateOriginHandle) {
                    // move the transform origin handle
                    var dx = pt1.x - pt0.x;
                    var dy = pt1.y - pt0.y;
                    this._origin[0] += dx;
                    this._origin[1] += dy;

                    if( this.rotateStage || (this.application.ninja.selectedElements.length === 1)) {
                        this._startOriginArray[0][0] += dx;
                        this._startOriginArray[0][1] += dy;
                    }

                    this.downPoint.x = pt1.x;
                    this.downPoint.y = pt1.y;
                    this.DrawHandles();
                    return;
                }

                angle = this._getAngleToRotate(pt1.x, pt1.y);
                if(event.shiftKey)
                {
                    var f = Math.floor(angle/(Math.PI/4));
                    angle = f*Math.PI/4;
                }
                this._delta = angle;
                switch(this._handleMode)
                {
                    case 0:
                        // Rotate X;
                        mat = Matrix.RotationX(angle);
                        break;
                    case 1:
                        // Rotate Y
                        mat = Matrix.RotationY(angle);
                        break;
                    case 2:
                        // Rotate Z
                        mat = Matrix.RotationZ(angle);
                        break;
                    default:
                        break;
                }
            }
            else
            {
                if (event.ctrlKey || event.metaKey)
                {
                    var zAngle = this._mouseSpeed * (pt1.y - this.downPoint.y) * Math.PI / 180.0;
                    if (zAngle === 0)
                    {
                        zAngle = 0.01 * Math.PI / 180.0;
                    }
                    if(event.shiftKey)
                    {
                        var f = Math.floor(zAngle/(Math.PI/4));
                        zAngle = f*Math.PI/4;
                    }
                    mat = Matrix.RotationZ(zAngle);
                }
                else
                {
                    var yAngle = this._mouseSpeed * (pt1.x - this.downPoint.x) * Math.PI / 180.0;
                    var xAngle = -this._mouseSpeed * (pt1.y - this.downPoint.y) * Math.PI / 180.0;
                    if(event.shiftKey)
                    {
                        var f = Math.floor(yAngle/(Math.PI/4));
                        yAngle = f*Math.PI/4;
                        f = Math.floor(xAngle/(Math.PI/4));
                        xAngle = f*Math.PI/4;
                    }

                    // check the orientation of the X axis
                    //if (drawUtils.drawYZ)  xAngle = -xAngle;
                    var yMat  = Matrix.RotationY( yAngle ),
                        xMat  = Matrix.RotationX( xAngle );

                    mat = glmat4.multiply(yMat, xMat, []);
                }
            }

            if(this._inLocalMode && (this.application.ninja.selectedElements.length === 1 || this.rotateStage) )
            {
                this._rotateLocally(mat);
            }
            else
            {
                this._rotateGlobally(mat);
            }

//            this.UpdateSelection();
            NJevent("elementChanging", {type : "Changing", redraw: false});
        }
    },

    _rotateLocally: {
        value: function (rotMat) {
            var selectedElements = this.application.ninja.selectedElements;

            if(this.rotateStage) {
                selectedElements = [this.application.ninja.currentDocument.documentRoot];
            }
            var len = selectedElements.length;
            for(var i = 0; i < len; i++) {
                var elt = selectedElements[i].elementModel.getProperty("elt");
                var curMat = selectedElements[i].elementModel.getProperty("mat");

                // pre-translate by the transformation center
                var tMat = Matrix.I(4);

                var transformCtr = this._startOriginArray[i];

                tMat[12] = transformCtr[0];
                tMat[13] = transformCtr[1];
                tMat[14] = transformCtr[2];

                var mat = glmat4.multiply(curMat, tMat, []);

                // translate back
                tMat[12] = -transformCtr[0];
                tMat[13] = -transformCtr[1];
                tMat[14] = -transformCtr[2];

                glmat4.multiply(mat, rotMat, mat);


                glmat4.multiply(mat, tMat, mat);

                // while moving, set inline style to improve performance
                viewUtils.setMatrixForElement(selectedElements[i], mat, true );
            }
        }
    },

    _rotateGlobally: {
        value: function (rotMat) {
            var len = this.application.ninja.selectedElements.length;
            for(var i = 0; i < len; i++) {
                var elt = this.application.ninja.selectedElements[i].elementModel.getProperty("elt");
                var curMat = this.application.ninja.selectedElements[i].elementModel.getProperty("mat");

                // pre-translate by the transformation center
                var tMat = Matrix.I(4);

                var transformCtr = this._startOriginArray[i].slice(0);
                transformCtr = MathUtils.transformPoint(transformCtr, curMat);

                tMat[12] = transformCtr[0];
                tMat[13] = transformCtr[1];
                tMat[14] = transformCtr[2];

                var mat = glmat4.multiply(tMat, rotMat, []);

                // translate back
                tMat[12] = -transformCtr[0];
                tMat[13] = -transformCtr[1];
                tMat[14] = -transformCtr[2];

                glmat4.multiply(mat, tMat, mat);

                glmat4.multiply(mat, curMat, mat);

                viewUtils.setMatrixForElement(this.application.ninja.selectedElements[i], mat, true );
            }
        }
    },

    _getAngleToRotate: {
        value: function (x, y) {
            var angle;
            var pt = MathUtils.getLocalPoint(x, y, this._planeEq, this._matL);
            if(!pt)
            {
                //TODO - should this be _startPoint.x/y instead of downPoint.x/y?
                var st = [this.downPoint.x, this.downPoint.y];
                pt = [x, y];
                var sub = vecUtils.vecSubtract(2, pt, st);
                var dot = vecUtils.vecDot(2, sub, this._dirVecL);

                angle = vecUtils.vecDist(2, pt, st) * 0.1;

                if (dot < 0)
                {
                    angle = -angle;
                }
            }
            else
            {
                angle = MathUtils.getAngleBetweenPoints(this._startPoint, pt);
            }
            return angle;
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

            var len = this.application.ninja.selectedElements.length;
            if(len)
            {
                if(len === 1)
                {
                    this.target = this.application.ninja.selectedElements[0];
                    drawUtils.addElement(this.target);

                    viewUtils.pushViewportObj( this.target );
                    var eltCtr = viewUtils.getCenterOfProjection();
                    viewUtils.popViewportObj();

                    var ctrOffset = this.target.elementModel.props3D.m_transformCtr;
                    if(ctrOffset)
                    {
                        eltCtr[2] = 0;
                        eltCtr = vecUtils.vecAdd(3, eltCtr, ctrOffset);
                    }
                    
                    this._origin = viewUtils.localToGlobal(eltCtr, this.target);
                    this._updateTargets();
                    this._setTransformOrigin(false);
                }
                else
                {
                    this.target = this.application.ninja.currentDocument.documentRoot;
                    this._origin = drawUtils._selectionCtr.slice(0);
                    this._origin[0] += this.application.ninja.stage.userContentLeft;
                    this._origin[1] += this.application.ninja.stage.userContentTop;
                    this._updateTargets();
                    this._setTransformOrigin(true);
                }
            }
            else
            {
                this.target = null;
            }
            this.DrawHandles();

            if(event)
            {
                this.eventManager.removeEventListener("selectionDrawn", this, true);
            }
        }
    },

    _updateTargets: {
        value: function(addToUndo) {
            var mod3dObject = [], self = this;

            this.application.ninja.selectedElements.forEach(function(element) {
                viewUtils.pushViewportObj(element);
                var eltCtr = viewUtils.getCenterOfProjection();
                viewUtils.popViewportObj();
                eltCtr = viewUtils.localToGlobal(eltCtr, element);

                element.elementModel.setProperty("ctr", eltCtr);

                if(addToUndo) {
                    var previousMat = element.elementModel.getProperty("mat").slice(0);
                    var previousStyleStr = {dist:element.elementModel.getProperty("dist"), mat:MathUtils.scientificToDecimal(previousMat, 5)};
                    var newStyleStr = {dist:viewUtils.getPerspectiveDistFromElement(element), mat:MathUtils.scientificToDecimal(viewUtils.getMatrixFromElement(element), 5)};

                    mod3dObject.push({element:element, properties:newStyleStr, previousProperties: previousStyleStr});
                }

            });

            if(addToUndo) {
                ElementsMediator.set3DProperties(mod3dObject, "Change", "rotateTool");
            }

            this.application.ninja.selectedElements.forEach(function(element) {
                element.elementModel.setProperty("mat", viewUtils.getMatrixFromElement(element));
                element.elementModel.setProperty("matInv", glmat4.inverse(element.elementModel.getProperty("mat"), []));
                element.elementModel.setProperty("dist", viewUtils.getPerspectiveDistFromElement(element));
            });
        }
    },

    _setTransformOrigin: {
        value: function(shouldUpdateCenter) {
            if(!this._origin) {
                return;
            }

            var elt, element, eltCtr, ctrOffset, matInv;

            if(this.rotateStage || (this.application.ninja.selectedElements.length === 1)) {
                elt = this._target;

                if(shouldUpdateCenter) {
                    if(this.rotateStage) {
                        element = this.application.ninja.currentDocument.documentRoot;
                    } else {
                        element = this.application.ninja.selectedElements[0];
                    }
                    eltCtr = element.elementModel.getProperty("ctr");
                    ctrOffset = vecUtils.vecSubtract(3, this._origin, eltCtr);

                    matInv = element.elementModel.getProperty("matInv");
                    ctrOffset = MathUtils.transformVector(ctrOffset, matInv);

                    elt.elementModel.props3D.m_transformCtr = ctrOffset;
                } else {
                    this._startOriginArray = [];
                    ctrOffset = this._target.elementModel.props3D.m_transformCtr;
                    if(!ctrOffset) {
                        ctrOffset = [0,0,0];
                    }
                }
                this._startOriginArray[0] = ctrOffset;
            } else {
                // Update transform ctr for all elements if transform origin was modified
                this._startOriginArray = [];
                var len = this.application.ninja.selectedElements.length;
                for (var i = 0; i < len; i++) {
                    eltCtr = this.application.ninja.selectedElements[i].elementModel.getProperty("ctr");
                    ctrOffset = vecUtils.vecSubtract(3, this._origin, eltCtr);
                    matInv = this.application.ninja.selectedElements[i].elementModel.getProperty("matInv");
                    ctrOffset = MathUtils.transformVector(ctrOffset, matInv);

                    this._startOriginArray[i] = ctrOffset;
                }
            }
        }
    },

	HandleDoubleClick: {
		value: function () {

            if(!this._target)
            {
                return;
            }

            if(this._activateOriginHandle)
            {
                var len = this.application.ninja.selectedElements.length;
                if( (len === 1) || (this._toolID === "rotateStage3DTool") )
                {
                    this._target.elementModel.props3D.m_transformCtr = null;
                }

                this._handleMode = null;
                this._activateOriginHandle = false;
                this.application.ninja.stage.drawingCanvas.style.cursor = this._cursor;

                this.captureSelectionDrawn(null);
            }
		}
	},

    Reset: {
        value: function() {
            var mat, iMat, dist, mod3dObject = [], self = this;

            this.application.ninja.selectedElements.forEach(function(element) {
                // Reset to the identity matrix
                iMat = Matrix.I(4);
                mat = ElementsMediator.getMatrix(element);
//                iMat[12] = mat[12];
//                iMat[13] = mat[13];
//                iMat[14] = mat[14];

                dist = ElementsMediator.getPerspectiveDist(element);

                var previousStyleStr = {dist:dist, mat:mat};
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

        /**
    * SHIFT/ALT/SPACE Key Handlers
    */
    HandleShiftKeyDown: {
        value: function (event) {
        }
    },

    HandleShiftKeyUp: {
        value: function () {
        }
    },

    HandleSpaceKeyDown: {
        value: function () {
        }
    },

    HandleSpaceUp: {
        value: function () {
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

    /**
     * This function is for specifying custom feedback routine
     * upon mouse over.
     * For example, the drawing tools will add a glow when mousing
     * over existing canvas elements to signal to the user that
     * the drawing operation will act on the targeted canvas.
     */
    _showFeedbackOnMouseMove : {
        value: function (event) {
            if(this._target && this._handles)
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
                    if(c === 1)
                    {
                        this.application.ninja.stage.drawingCanvas.style.cursor = "move";
                        this._handleMode = i;
                        this._activateOriginHandle = true;
                        return;
                    }
                    else if(c === 2)
                    {
                        this.application.ninja.stage.drawingCanvas.style.cursor = toolHandle._cursor;
                        this._handleMode = i;
                        this._activateOriginHandle = false;
                        return;
                    }
                }
            }

            this._handleMode = null;
            this._activateOriginHandle = false;
   //            this.application.ninja.stage.drawingCanvas.style.cursor = this._cursor;
            this.application.ninja.stage.drawingCanvas.style.cursor = "auto";
        }
    },

    DrawHandles: {
        value: function (angle) {
            this.application.ninja.stage.clearDrawingCanvas();

            var item = this._target;
            if(!item)
            {
                return;
            }

            // Draw tool handles

            // set the element to be the viewport object - temporarily
            var lMode = this._inLocalMode;
            if( (this._toolID !== "rotateStage3DTool") &&
                    (this.application.ninja.selectedElements.length === 1) )
            {
                viewUtils.pushViewportObj( item );
            }
            else
            {
                lMode = false;
                viewUtils.pushViewportObj( this.application.ninja.currentDocument.documentRoot );
            }
            var base = this._origin;

            if( (this._handleMode !== null) && !this._activateOriginHandle )
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
            }
            this._handles[0].draw(base, item, lMode);
            this._handles[1].draw(base, item, lMode);
            this._handles[2].draw(base, item, lMode);

            if(angle && (this._handleMode !== null))
            {
                this._handles[this._handleMode].drawShadedAngle(angle, this._startPoint);
            }


            this._handles[0]._strokeStyle = 'rgba(255, 0, 0, 1)';
            this._handles[1]._strokeStyle = 'rgba(0, 255, 0, 1)';
            this._handles[2]._strokeStyle = 'rgba(0, 0, 255, 1)';

            viewUtils.popViewportObj();
        }
    }

});