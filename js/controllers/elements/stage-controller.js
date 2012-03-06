/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ElementController = require("js/controllers/elements/element-controller").ElementController;

exports.StageController = Montage.create(ElementController, {

    // TODO - This is a simple routine, may not always be correct
    _isRotated: {
        value: function(mat) {

            if(mat[1] !== 0) return true;
            if(mat[2] !== 0) return true;
            if(mat[3] !== 0) return true;

            if(mat[4] !== 0) return true;

            if(mat[6] !== 0) return true;
            if(mat[7] !== 0) return true;

            if(mat[8] !== 0) return true;
            if(mat[9] !== 0) return true;

            if(mat[11] !== 0) return true;

            return false;
        }
    },

    // TODO - perspective distance needs to be passed in as "dist" and matrix3d needs to be passed in as "mat"
    set3DProperties: {
        value: function(el, props, index, update3DModel) {
            var dist = props[index]["dist"],
                mat = props[index]["mat"];
            this.application.ninja.stylesController.setElementStyle(el,
                                                                    "-webkit-transform",
                                                                    "perspective(" + dist + ") " +
                                                                    "matrix3d(" + MathUtils.scientificToDecimal(mat, 5) + ")",
                                                                    true);

            el.elementModel.props3D.matrix3d = mat;
            el.elementModel.props3D.perspectiveDist = dist;

            // TODO - Move this to matrix class
            if(this._isRotated(mat))
            {
                this.application.ninja.currentDocument.stageBG.style.display = "none";
            }
            else
            {
                this.application.ninja.stylesController.setElementStyle(this.application.ninja.currentDocument.stageBG,
                                                                        "-webkit-transform",
                                                                        "perspective(" + dist + ") " +
                                                                        "matrix3d(" + MathUtils.scientificToDecimal(mat, 5) + ")",
                                                                        true);

                this.application.ninja.currentDocument.stageBG.elementModel.props3D.matrix3d = mat;
                this.application.ninja.currentDocument.stageBG.elementModel.props3D.perspectiveDist = dist;
                this.application.ninja.currentDocument.stageBG.style.display = "block";
            }

            this.application.ninja.stage.updatedStage = true;

            if(update3DModel)
            {
                this._update3DProperties(el, mat, dist);
            }
        }
    },

    getProperty: {
        value: function(el, p) {
            switch(p) {
                case "background" :
                    return this.application.ninja.colorController.getColorObjFromCss(el.elementModel.stageBackground.style.getProperty(p));
                case "border":
                    return el.elementModel.stageView.style.getProperty(p);
                case "height":
                    return el.elementModel.stageDimension.style.getProperty(p);
                case "width":
                    return el.elementModel.stageDimension.style.getProperty(p);
                default:
                    return ElementController.getProperty(el, p, false, true);
                    //console.log("Undefined Stage property ", p);
            }
        }
    },

    setProperty: {
        value: function(el, p, value) {

            switch(p) {
                case "body-background":
                    el.elementModel.body.style.setProperty("background", value);
                    break;
                case "background":
                    el.elementModel.stageBackground.style.setProperty(p, value);
                    break;
                case "overflow":
                    el.elementModel.viewPort.style.setProperty(p, value);
                    break;
                case "width":
                    this.application.ninja.currentDocument.iframe.width = parseInt(value) + 1400;
                    el.elementModel.stageDimension.style.setProperty(p, value);
                    break;
                case "height":
                    this.application.ninja.currentDocument.iframe.height = parseInt(value) + 400;
                    el.elementModel.stageDimension.style.setProperty(p, value);
                    break;
                default:
                    console.log("Undefined property ", p, "for the Stage Controller");
            }
        }
    },

    setAttribute: {
        value: function(el, att, value) {
            if(att === "id") {
                el.elementModel.id = value;
            }
        }
    },

    changeSelector: {
        value: function(el, rule, selector) {
            el.elementModel.transitionStopRule.selectorText = selector;
        }
    }
});
