/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ElementController = require("js/controllers/elements/element-controller").ElementController;

exports.BodyController = Montage.create(ElementController, {

    // TODO - perspective distance needs to be passed in as "dist" and matrix3d needs to be passed in as "mat"
    set3DProperties: {
        value: function(el, props, update3DModel) {
            var dist = props["dist"], mat = props["mat"];
//            this.application.ninja.stylesController.setElementStyle(el, "-webkit-transform", "perspective(" + dist + ") " + "matrix3d(" + MathUtils.scientificToDecimal(mat, 5) + ")");
            el.style["-webkit-transform"] = "perspective(" + dist + ") " + "matrix3d(" + MathUtils.scientificToDecimal(mat, 5) + ")";

            el.elementModel.props3D.matrix3d = mat;
            el.elementModel.props3D.perspectiveDist = dist;

            if(this.application.ninja.currentDocument.model.views.design._template) {
                if(!MathUtils.isIdentityMatrix(mat)) {
                    el.parentNode.style.backgroundColor = "transparent";
                } else {
                    el.parentNode.style.removeProperty("background-color");
                }
            }

            this.application.ninja.stage.updatedStage = true;

            if(update3DModel) {
                this._update3DProperties(el, mat, dist);
            }
        }
    },

    getProperty: {
        value: function(el, p) {
            switch(p) {
                case "background" :
                case "background-image":
                    return this.application.ninja.colorController.getColorObjFromCss(this.application.ninja.stylesController.getElementStyle(el, "background-image"));
                case "background-color":
                    if(this.application.ninja.currentDocument.model.views.design._template) {
                        return this.application.ninja.colorController.getColorObjFromCss(this.application.ninja.stylesController.getElementStyle(el.parentNode, "background-color"));
                    } else {
                        return this.application.ninja.colorController.getColorObjFromCss(this.application.ninja.stylesController.getElementStyle(el, "background-color"));
                    }
                case "border":
                    return 0;
                case "height":
                case "width":
                case "-webkit-transform-style":
                    return this.application.ninja.stylesController.getElementStyle(el, p);
                default:
                    return ElementController.getProperty(el, p, true, true);
                    //console.log("Undefined Stage property ", p);
            }
        }
    },

    setProperty: {
        value: function(el, p, value) {
            switch(p) {
                case "background":
                case "background-image":
                    this.application.ninja.stylesController.setElementStyle(el, "background-image", value);
                    break;
                case "background-color":
                    if(this.application.ninja.currentDocument.model.views.design._template) {
                        this.application.ninja.stylesController.setElementStyle(el.parentNode, "background-color", value);
                    } else {
                        this.application.ninja.stylesController.setElementStyle(el, "background-color", value);
                    }
                    break;
                case "overflow":
                case "width":
                case "height":
                case "-webkit-transform-style":
                    this.application.ninja.stylesController.setElementStyle(el, p, value);
                    this.application.ninja.stage.updatedStage = true;
                    break;
                default:
                    console.log("Undefined property ", p, "for the Body Controller");
            }
        }
    },

    setAttribute: {
        value: function(el, att, value) {
        }
    },

    getPerspectiveDist: {
        value: function(el) {
            if(el.elementModel.props3D && el.elementModel.props3D.perspectiveDist) {
                return el.elementModel.props3D.perspectiveDist;
            } else {
                var dist = this.application.ninja.stylesController.getPerspectiveDistFromElement(el, true);
                el.elementModel.props3D.perspectiveDist = dist;
                return dist;
            }
        }
    },

    getMatrix: {
        value: function(el) {
            if(el.elementModel.props3D && el.elementModel.props3D.matrix3d)
            {
                return el.elementModel.props3D.matrix3d.slice(0);
            }
            else
            {
                var mat;

                if (el)
                {
                    mat = this.application.ninja.stylesController.getMatrixFromElement(el, true);
                    if (!mat) {
                        mat = Matrix.I(4);
                    }

                    var zoom = this.application.ninja.elementMediator.getProperty(el, "zoom");
                    if (zoom)
                    {
                        zoom = Number(zoom);
                        if (zoom != 1)
                        {
                            var zoomMat = Matrix.create(  [
                                [ zoom,    0,    0, 0],
                                [    0, zoom,    0, 0],
                                [    0,    0, zoom, 0],
                                [    0,    0,    0, 1]
                            ] );
                            glmat4.multiply( zoomMat, mat, mat );
                        }
                    }
                }

                el.elementModel.props3D.matrix3d = mat;
                return mat;
            }
        }
    }
});
