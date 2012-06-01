/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.ElementController = Montage.create(Component, {

    addElement: {
        value: function(el, styles) {
        
        	if (el.getAttribute) el.setAttribute('data-ninja-node', 'true');
        	
            if(this.application.ninja.timeline.currentLayerSelected) {
                var selectedLayerIndex = this.application.ninja.timeline.getLayerIndexByID(this.application.ninja.timeline.currentLayerSelected.layerData.layerID);

                if(selectedLayerIndex === 0) {
                    this.application.ninja.currentSelectedContainer.appendChild(el);
                } else {
                    var element = this.application.ninja.timeline.arrLayers[selectedLayerIndex].layerData.elementsList[0];
                    element.parentNode.insertBefore(el, element.nextSibling);
                }
            } else {
                this.application.ninja.currentSelectedContainer.appendChild(el);
            }

            if(styles) {
                this.application.ninja.stylesController.setElementStyles(el, styles);
            }
        }
    },

    // Remove the element from the DOM and clear the GLWord.
    removeElement: {
        value: function(el) {
            if(el.elementModel && el.elementModel.shapeModel && el.elementModel.shapeModel.GLWorld) {
                el.elementModel.shapeModel.GLWorld.clearTree();
            }
            el.parentNode.removeChild(el);
        }
    },
    
    getProperty: {
        value: function(el, prop, fallbackOnComputed, isStageElement) {
            if(el.nodeType !== 3){
                return this.application.ninja.stylesController.getElementStyle(el, prop, fallbackOnComputed, isStageElement);
            }else{
                return null;
            }
        }
    },

    setProperty: {
        value: function(el, p, value) {
            this.application.ninja.stylesController.setElementStyle(el, p, value);
        }
    },

    setProperties: {
        value: function(element, properties) {
            for(var property in properties) {
                this.application.ninja.stylesController.setElementStyle(element, property, properties[property]);
        }
        }
    },

    setAttribute: {
        value: function(el, att, value) {
            el.setAttribute(att, value);
        }
    },

    //--------------------------------------------------------------------------------------------------------
    // Routines to get/set color properties
    // borderSide : "top", "right", "bottom", or "left"
    getColor: {
        value: function(el, isFill, borderSide) {
            var colorObj, color, image;

            // Return cached value if one exists
            if(isFill) {
                if(el.elementModel.fill) {
                    return el.elementModel.fill;
                }
                //TODO: Once logic for color and gradient is established, this needs to be revised
                color = this.getProperty(el, "background-color");
                image = this.getProperty(el, "background-image");
            } else {
                // Try getting border color from specific side first
                if(borderSide) {
                    color = this.getProperty(el, "border-" + borderSide + "-color");
                    image = this.getProperty(el, "border-" + borderSide + "-image");
                }

                // If no color was found, look up the shared border color
                if(!color && !image) {
                    if(el.elementModel.stroke) {
                        return el.elementModel.stroke;
                    }

                    color = this.getProperty(el, "border-color");
                    image = this.getProperty(el, "border-image");
                }
            }

            if(color || image) {
                if (image && image !== 'none' && image.indexOf('-webkit') >= 0) {
                    //Gradient
                    colorObj = this.application.ninja.colorController.getColorObjFromCss(image);
                } else {
                    //Solid
                    colorObj = this.application.ninja.colorController.getColorObjFromCss(color);
                }
            }

            // Update cache
            if(isFill) {
                el.elementModel.fill = colorObj;
            } else if(!borderSide) {
                // TODO - Need to update border style and width also
                el.elementModel.stroke = colorObj;
            } else {
                // TODO - Should update specific border sides too
            }

            return colorObj;
        }
    },

    setColor: {
        value: function(el, color, isFill) {
            var mode = color.mode;

            if(isFill) {
                if(mode) {
                    switch (mode) {
                        case 'nocolor':
                            this.setProperty(el, "background-image", "none");
                            this.setProperty(el, "background-color", "none");
                            el.elementModel.fill = null;
                            return;
                        case 'gradient':
                            this.setProperty(el, "background-image", color.color.css);
                            this.setProperty(el, "background-color", "none");
                            break;
                        default:
                            this.setProperty(el, "background-image", "none");
                            this.setProperty(el, "background-color", color.color.css);
                    }
                }

                el.elementModel.fill = color;
            } else {
                if(mode) {
                    switch (mode) {
                        case 'nocolor':
                            this.setProperty(el, "border-image", "none");
                            this.setProperty(el, "border-color", "none");
                            el.elementModel.stroke = null;
                            return;
                        case 'gradient':
                            if(color.borderInfo) {
                                if(color.borderInfo.borderWidth) {
                                    this.setProperty(el, "border-width", color.borderInfo.borderWidth + color.borderInfo.borderUnits);
                                }
                                if(color.borderInfo.borderStyle) {
                                    this.setProperty(el, "border-style", color.borderInfo.borderStyle);
                                }
                            }
                            this.setGradientBorder(el, color.color.gradientMode, color.color.css);
                            break;
                        default:
                            this.setProperty(el, "border-image", "none");
                            this.setProperty(el, "border-image-slice", "");
                            this.setProperty(el, "border-color", color.color.css);
                            if(color.borderInfo) {
                                if(color.borderInfo.borderWidth) {
                                    this.setProperty(el, "border-width", color.borderInfo.borderWidth + color.borderInfo.borderUnits);
                                }
                                if(color.borderInfo.borderStyle) {
                                    this.setProperty(el, "border-style", color.borderInfo.borderStyle);
                                }
                            }
                    }
                }
                el.elementModel.stroke = color;
            }
        }
    },

    setGradientBorder: {
        value: function(el, gradientMode, css) {
            if(gradientMode === "radial") {
                this.setProperty(el, "border-image", css.replace("ellipse", "circle"));
            } else {
                this.setProperty(el, "border-image", css);
            }
            this.setProperty(el, "border-color", "none");
            // gradient slice = borderWidth/totalWidth
            var b = parseInt(this.getProperty(el, "border-left-width", true)),
                w = parseInt(this.getProperty(el, "width", true)),
                h = parseInt(this.getProperty(el, "height", true));
            if(h > w) {
                w = h;
            }
            this.setProperty(el, "border-image-slice", Math.floor(b/(w+b+b) * 100) + "%");
        }
    },

    getStroke: {
        value: function(el) {
            // TODO - Need to figure out which border side user wants
            return this.application.ninja.stylesController.getElementStyle(el, "border");
        }
    },

    setStroke: {
        value: function(el, stroke) {
            this.application.ninja.stylesController.setElementStyle(el, "border-width", stroke.borderWidth + stroke.borderUnits);
            this.application.ninja.stylesController.setElementStyle(el, "border-style", stroke.borderStyle);
            this.setColor(el, stroke.color, false);
        }
    },

    //--------------------------------------------------------------------------------------------------------
    // Routines to get/set 3D properties
    get3DProperty: {
        value: function(el, prop) {
            if(el.elementModel && el.elementModel.props3D) {
                return el.elementModel.props3D[prop];
            }
        }
    },

    getMatrix: {
        value: function(el) {
            if(el.elementModel && el.elementModel.props3D && el.elementModel.props3D.matrix3d) {
                return el.elementModel.props3D.matrix3d.slice(0);
            } else {
                var mat;

                if (el) {
                    mat = this.application.ninja.stylesController.getMatrixFromElement(el, false);
                    if (!mat) {
                        mat = Matrix.I(4);
                    }
                }

                el.elementModel.props3D.matrix3d = mat;
                return mat;
            }
        }
    },

    getPerspectiveDist: {
        value: function(el) {
            if(el.elementModel && el.elementModel.props3D && el.elementModel.props3D.perspectiveDist) {
                return el.elementModel.props3D.perspectiveDist;
            } else {
                var dist = this.application.ninja.stylesController.getPerspectiveDistFromElement(el, false);
                el.elementModel.props3D.perspectiveDist = dist;
                return dist;
            }
        }
    },

    // TODO - perspective distance needs to be passed in as "dist" and matrix3d needs to be passed in as "mat"
    set3DProperties: {
        value: function(el, props, update3DModel) {
            var dist = props["dist"],
                mat = props["mat"];

            this.application.ninja.stylesController.setElementStyle(el, "-webkit-transform", "matrix3d(" + MathUtils.scientificToDecimal(mat, 5) + ")");

            this.application.ninja.stylesController.setElementStyle(el, "-webkit-transform-style", "preserve-3d");

            // TODO - We don't support perspective on individual elements yet
            // this.application.ninja.stylesController.setElementStyle(el, "-webkit-perspective", dist);

            el.elementModel.props3D.matrix3d = mat;
            el.elementModel.props3D.perspectiveDist = dist;

            if(update3DModel) {
                this._update3DProperties(el, mat, dist);
            }
        }
    },

    _update3DProperties: {
        value: function(elt, mat, dist) {
            var elt3DInfo = MathUtils.decomposeMatrix2(mat);
            if(elt3DInfo)
            {
                elt.elementModel.props3D.xAngle = elt3DInfo.rotation[0] * MathUtils.RAD_TO_DEG;
                elt.elementModel.props3D.yAngle = elt3DInfo.rotation[1] * MathUtils.RAD_TO_DEG;
                elt.elementModel.props3D.zAngle = elt3DInfo.rotation[2] * MathUtils.RAD_TO_DEG;

                elt.elementModel.props3D.x3D = ~~(elt3DInfo.translation[0]);
                elt.elementModel.props3D.y3D = ~~(elt3DInfo.translation[1]);
                elt.elementModel.props3D.z3D = ~~(elt3DInfo.translation[2]);
            }
        }
    }

});