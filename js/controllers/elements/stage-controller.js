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
            value: function(el, props, update3DModel) {
                var dist = props["dist"], mat = props["mat"];
                this.application.ninja.stylesController.setElementStyle(el, "-webkit-transform", "perspective(" + dist + ") " + "matrix3d(" + MathUtils.scientificToDecimal(mat, 5) + ")", true);

                el.elementModel.props3D.matrix3d = mat;
                el.elementModel.props3D.perspectiveDist = dist;

                // TODO - Move this to matrix class
                if(this._isRotated(mat)) {
                    this.application.ninja.currentDocument.stageBG.style.display = "none";
                } else {
                    this.application.ninja.stylesController.setElementStyle(this.application.ninja.currentDocument.stageBG, "-webkit-transform", "perspective(" + dist + ") " + "matrix3d(" + MathUtils.scientificToDecimal(mat, 5) + ")", true);

                    this.application.ninja.currentDocument.stageBG.elementModel.props3D.matrix3d = mat;
                    this.application.ninja.currentDocument.stageBG.elementModel.props3D.perspectiveDist = dist;
                    this.application.ninja.currentDocument.stageBG.style.display = "block";
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
                    return this.application.ninja.colorController.getColorObjFromCss(el.elementModel.stageBackground.style.getProperty(p));
                case "border":
                    return el.elementModel.stageView.style.getProperty(p);
                case "height":
                    return el.elementModel.stageDimension.style.getProperty(p);
                case "width":
                    return el.elementModel.stageDimension.style.getProperty(p);
                case "-webkit-transform-style":
                    if(el.id === "Viewport") {
                        return this.application.ninja.stylesController.getElementStyle(el, p, false, true);
                    } else {
                        return el.elementModel.stageView.style.getProperty(p);
                    }
                default:
                    return ElementController.getProperty(el, p, true, true);
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
                case "-webkit-transform-style":
                    el.elementModel.stageView.style.setProperty(p, value);
                    this.application.ninja.stage.updatedStage = true;
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
    },

    getMatrix: {
        value: function(el) {
            if(el.elementModel && el.elementModel.props3D && el.elementModel.props3D.matrix3d)
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
    },

    getPerspectiveDist: {
        value: function(el) {
            if(el.elementModel && el.elementModel.props3D && el.elementModel.props3D.perspectiveDist)
            {
                return el.elementModel.props3D.perspectiveDist;
            }
            else
            {
                var dist = this.application.ninja.stylesController.getPerspectiveDistFromElement(el, true);
                el.elementModel.props3D.perspectiveDist = dist;
                return dist;
            }
        }
    }
});
