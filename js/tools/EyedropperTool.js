/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator,
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils,
    vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils,
    toolBase = require("js/tools/ToolBase").toolBase;

exports.EyedropperTool = Montage.create(toolBase, {

    _isMouseDown: { value: false },
    _previousColor: { value: null},
    _color: { value: null},

    Configure: {
        value: function ( doActivate )
		{
			if (doActivate)
			{
                NJevent("enableStageMove");
			}
			else
			{
                NJevent("disableStageMove");
			}
        }
    },

    HandleLeftButtonDown: {
        value : function ( event ) {
            this._isMouseDown = true;
            this._previousColor =
                this.application.ninja.colorController[this.application.ninja.colorController.colorModel.input].css;

            this._updateColorFromPoint(event);
       }
    },

    HandleMouseMove: {
        value : function (event)
		{
            if(this._escape)
            {
                this._isMouseDown = false;
                this._escape = false;
            }
            if(this._isMouseDown)
            {
                this._updateColorFromPoint(event);
            }
		}
	},

    HandleLeftButtonUp: {
        value : function (event) {
			{
                this._isMouseDown = false;

                if(this._escape)
                {
                    this._escape = false;
                }

                this._updateColor(this._color);

                this._color = null;
            }
        }
    },

    HandleEscape: {
        value: function(event) {
            if(this._color && this._color.value)
            {
                var color = this.application.ninja.colorController.getColorObjFromCss(this._previousColor);

                if (color && color.value) {
                    color.value.wasSetByCode = true;
                    color.value.type = 'change';
                    if (color.value.a) {
                        this.application.ninja.colorController.colorModel.alpha = {value: color.value.a,
                                                                                    wasSetByCode: true,
                                                                                    type: 'change'};
                    }
                    this.application.ninja.colorController.colorModel[color.mode] = color.value;
                    this._color = null;
                }
            }
            this._escape = true;
        }
    },

    _updateColorFromPoint: {
        value : function (event) {
            var obj = this.application.ninja.stage.GetElement(event);
            if (obj)
            {
                // TODO - figure out if user clicked on a border - for now, just get fill
                var c = ElementsMediator.getColor(obj, this._isOverBorder(obj, event));
                if(c)
                {
                    var color = this.application.ninja.colorController.getColorObjFromCss(c.color.css);
                    if (color && color.value) {
                        color.value.wasSetByCode = true;
                        color.value.type = 'changing';
                        if (color.value.a) {
                            this.application.ninja.colorController.colorModel.alpha = {value: color.value.a,
                                                                                        wasSetByCode: true,
                                                                                        type: 'changing'};
                        }
                        this.application.ninja.colorController.colorModel[color.mode] = color.value;
                        this._color = color;
                    }
                }
            }
        }
    },

    _updateColor: {
        value: function(color) {
            if (color && color.value) {
                var input = this.application.ninja.colorController.colorModel.input;

                if(input === "fill")
                {
                    this.application.ninja.colorController.colorToolbar.fill_btn.color(color.mode, color.value);
                }
                else
                {
                    this.application.ninja.colorController.colorToolbar.stroke_btn.color(color.mode, color.value);
                }

                // Updating color chips will set the input type to "chip", so set it back here.
                this.application.ninja.colorController.colorModel.input = input;

                color.value.wasSetByCode = true;
                color.value.type = 'change';
                if (color.value.a) {
                    this.application.ninja.colorController.colorModel.alpha = {value: color.value.a,
                                                                                wasSetByCode: true,
                                                                                type: 'change'};
                }
                this.application.ninja.colorController.colorModel[color.mode] = color.value;
                this._previousColor = color.value.css;
            }
        }
    },

    // TODO - We don't want to calculate this repeatedly
    _isOverBorder: {
        value: function(elt, event)
        {
            var border = ElementsMediator.getProperty(elt, "border", parseFloat);

            if(border)
            {
                var bounds3D,
                    innerBounds = [],
                    pt = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas, new WebKitPoint(event.pageX, event.pageY)),
                    bt = ElementsMediator.getProperty(elt, "border-top", parseFloat),
                    br = ElementsMediator.getProperty(elt, "border-right", parseFloat),
                    bb = ElementsMediator.getProperty(elt, "border-bottom", parseFloat),
                    bl = ElementsMediator.getProperty(elt, "border-left", parseFloat);

//                this.application.ninja.stage.viewUtils.setViewportObj( elt );
                bounds3D = this.application.ninja.stage.viewUtils.getElementViewBounds3D( elt );
                console.log("bounds");
                console.dir(bounds3D);

                var xAdj = bl || border,
                    yAdj = bt || border;
                innerBounds.push([bounds3D[0][0] + xAdj, bounds3D[0][1] + yAdj, 0]);

                yAdj += bb || border;
                innerBounds.push([bounds3D[1][0] + xAdj, bounds3D[1][1] - yAdj, 0]);

                xAdj += br || border;
                innerBounds.push([bounds3D[2][0] - xAdj, bounds3D[2][1] - yAdj, 0]);

                yAdj = bt || border;
                innerBounds.push([bounds3D[3][0] - xAdj, bounds3D[3][1] + yAdj, 0]);
                console.log("innerBounds");
                console.dir(innerBounds);

                var tmpPt = this.application.ninja.stage.viewUtils.globalToLocal([pt.x, pt.y], elt);
                var x = tmpPt[0],
                    y = tmpPt[1];

                if(x < innerBounds[0][0]) return false;
                if(x > innerBounds[2][0]) return false;
                if(y < innerBounds[0][1]) return false;
                if(y > innerBounds[1][1]) return false;

                return true;


//                var contain = MathUtils.boundaryContainsPoint(innerBounds, tmpPt, false);
//                console.log("contain is " + contain);
//                var tmpMat = this.application.ninja.stage.viewUtils.getLocalToGlobalMatrix( elt );
////                var zoomFactor = 1;
////                if (this.application.ninja.stage.viewport.style && this.application.ninja.stage.viewport.style.zoom)
////                {
////                    zoomFactor = Number(this.application.ninja.stage.viewport.style.zoom);
////                }
//
//                for (var j=0;  j<4;  j++)
//                {
//                    var localPt = innerBounds[j];
//                    var tmpPt = this.application.ninja.stage.viewUtils.localToGlobal2(localPt, tmpMat);
//
////                    if(zoomFactor !== 1)
////                    {
////                        tmpPt = vecUtils.vecScale(3, tmpPt, zoomFactor);
////                        tmpPt[0] += this.application.ninja.stage.scrollLeft*(zoomFactor - 1);
////                        tmpPt[1] += this.application.ninja.stage.scrollTop*(zoomFactor - 1);
////                    }
//                    innerBounds[j]  = tmpPt;
//                }
//
//                var contain = MathUtils.boundaryContainsPoint(innerBounds, [pt.x, pt.y], false);
//                console.log("contain is " + contain);



//                var bounds,
//                    innerBounds = [],
//                    plane = ElementsMediator.get3DProperty(elt, "elementPlane"),
//                    pt = webkitConvertPointFromPageToNode(drawUtils.getDrawingSurfaceElement(), new WebKitPoint(event.pageX, event.pageY)),
//                    bt = ElementsMediator.getProperty(elt, "border-top", parseFloat),
//                    br = ElementsMediator.getProperty(elt, "border-right", parseFloat),
//                    bb = ElementsMediator.getProperty(elt, "border-bottom", parseFloat),
//                    bl = ElementsMediator.getProperty(elt, "border-left", parseFloat);
//
//                if(plane)
//                {
//                    bounds = plane.getBoundaryPoints().slice(0);
//                    var b = bl || border;
//                    var dirV = vecUtils.vecSubtract(2, bounds[3], bounds[0]);
//                    dirV = vecUtils.vecNormalize(2, dirV, b);
//                    innerBounds.push(vecUtils.vecAdd(2, bounds[0], dirV));
//
//                    b = bb || border;
//                    dirV = vecUtils.vecSubtract(2, bounds[1], bounds[0]);
//                    dirV = vecUtils.vecNormalize(2, dirV, b);
//                    innerBounds.push(vecUtils.vecAdd(2, bounds[0], dirV));
//
//                    b = br || border;
//                    dirV = vecUtils.vecSubtract(2, bounds[2], bounds[1]);
//                    dirV = vecUtils.vecNormalize(2, dirV, b);
//                    innerBounds.push(vecUtils.vecAdd(2, bounds[1], dirV));
//
//                    b = bt || border;
//                    dirV = vecUtils.vecSubtract(2, bounds[2], bounds[3]);
//                    dirV = vecUtils.vecNormalize(2, dirV, b);
//                    innerBounds.push(vecUtils.vecAdd(2, bounds[3], dirV));
//
//                    console.log("outerBounds");
//                    console.dir(bounds);
//
//                    console.log("innerBounds");
//                    console.dir(innerBounds);
//                }

//                var contain = MathUtils.boundaryContainsPoint( bounds,  pt,  plane.isBackFacing() );
//                if (contain == MathUtils.OUTSIDE)
//                {
//
//                }
//                if (contain == MathUtils.ON)
//                {
//
//                }
//
//                var bt = ElementsMediator.getProperty(elt, "border-top", parseFloat),
//                    br = ElementsMediator.getProperty(elt, "border-right", parseFloat),
//                    bb = ElementsMediator.getProperty(elt, "border-bottom", parseFloat),
//                    bl = ElementsMediator.getProperty(elt, "border-left", parseFloat),
//                    left = ElementsMediator.getProperty(elt, "left", parseFloat),
//                    top = ElementsMediator.getProperty(elt, "top", parseFloat),
//                    width = ElementsMediator.getProperty(elt, "width", parseFloat),
//                    height = ElementsMediator.getProperty(elt, "height", parseFloat);
//
//                left1 = elt.offsetLeft;
//                left2 = box[0];
//                right1 = elt.offsetLeft + ele.offsetWidth;
//                right2 = box[2];
//                top1 = ele.offsetTop;
//                top2 = box[1];
//                bottom1 = ele.offsetTop + ele.offsetHeight;
//                bottom2 = box[3];
//
//                if (bottom1 < top2) return false;
//                if (top1 > bottom2) return false;
//                if (right1 < left2) return false;
//                if (left1 > right2) return false;
//
//                return true;

            }


        }

    }

});