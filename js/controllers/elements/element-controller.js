/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    NJComponent =   require("js/lib/nj-base").NJComponent;

var ElementController = exports.ElementController = Montage.create(NJComponent, {

    addElement: {
        value: function(el, styles) {
            this.application.ninja.currentDocument.documentRoot.appendChild(el);
            // Nested elements -
            // TODO make sure the CSS is correct before nesting elements
            // this.application.ninja.currentSelectedContainer.appendChild(el);
            this.application.ninja.stylesController.setElementStyles(el, styles);
        }
    },

    removeElement: {
        value: function(el) {
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
        value: function(el, props, index) {
            for(var p in props) {
                this.application.ninja.stylesController.setElementStyle(el, p, props[p][index]);
            }
        }
    },

    setAttribute: {
        value: function(el, att, value) {
            if(att === "id") {
                if(value === "") {
                    el.setAttribute(att, value);
                    return;
                }

                // Then check if this is a valid id by the following spec: http://www.w3.org/TR/REC-html40/types.html#h-6.2
                var regexID = /^([a-zA-Z])+([a-zA-Z0-9_\.\:\-])+/;
                if(!regexID.test(value)) {
                    alert("Invalid ID");
                    return;
                } else if (this.application.ninja.currentDocument._document.getElementById(value) !== null) {
                    alert("The following ID: " + value + " is already in Use");
                }

            }

            el.setAttribute(att, value);
        }
    },

    //--------------------------------------------------------------------------------------------------------
    // Routines to get/set color properties
    getColor: {
        value: function(el, isFill) {
            var colorObj,
                color,
                image;

            // Return cached value if one exists
            if(isFill)
            {
                if(el.elementModel.fill)
                {
                    return el.elementModel.fill;
                }
//                return this.application.ninja.stylesController.getElementStyle(el, "background-color");
                //TODO: Once logic for color and gradient is established, this needs to be revised
                color = this.getProperty(el, "background-color");
                image = this.getProperty(el, "background-image");
            }
            else
            {
                // TODO - Need to figure out which border side user wants
                if(el.elementModel.stroke)
                {
                    return el.elementModel.stroke;
                }
                // TODO - Need to figure out which border side user wants
//                return this.application.ninja.stylesController.getElementStyle(el, "border-color");
                color = this.getProperty(el, "border-color");
                image = this.getProperty(el, "border-image");
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
            if(isFill)
            {
                el.elementModel.fill = colorObj;
            }
            else
            {
                // TODO - Need to update border style and width also
                el.elementModel.stroke = colorObj;
            }

            return colorObj;
        }
    },

    setColor: {
        value: function(el, color, isFill) {
            var mode = color.mode;
            if(isFill)
            {
                if(mode)
                {
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
            }
            else
            {
                if(mode)
                {
                    switch (mode) {
                        case 'nocolor':
                            this.setProperty(el, "border-image", "none");
                            this.setProperty(el, "border-color", "none");
                            el.elementModel.stroke = null;
                            return;
                        case 'gradient':
                            this.setProperty(el, "border-image", color.color.css);
                            this.setProperty(el, "border-color", "none");
                            if(color.borderInfo)
                            {
                                this.setProperty(el, "border-width", color.borderInfo.borderWidth +
                                                                        color.borderInfo.borderUnits);
                                this.setProperty(el, "border-style", color.borderInfo.borderStyle);
                            }
                            break;
                        default:
                            this.setProperty(el, "border-image", "none");
                            this.setProperty(el, "border-color", color.color.css);
                            if(color.borderInfo)
                            {
                                this.setProperty(el, "border-width", color.borderInfo.borderWidth +
                                                                        color.borderInfo.borderUnits);
                                this.setProperty(el, "border-style", color.borderInfo.borderStyle);
                            }
                    }
                }
                el.elementModel.stroke = color;
            }
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
            if(el.elementModel && el.elementModel.props3D)
            {
                return el.elementModel.props3D[prop];
            }
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
                    var xformStr = this.application.ninja.elementMediator.getProperty(el, "-webkit-transform");
                    if (xformStr)
                        mat = this.transformStringToMat( xformStr );
                    if (!mat)
                        mat = Matrix.I(4);

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
                var dist = 1400;

                var str = this.getProperty(el, "-webkit-transform");
                if (str)
                {
                    var index1 = str.indexOf( "perspective(");
                    if (index1 >= 0)
                    {
                        index1 += 12;    // do not include 'perspective('
                        var index2 = str.indexOf( ")", index1 );
                        if (index2 >= 0)
                        {
                            var substr = str.substr( index1, (index2-index1));
                            if (substr && (substr.length > 0))
                                dist = MathUtils.styleToNumber( substr );
                        }
                    }
                }

                el.elementModel.props3D.perspectiveDist = dist;
                return dist;
            }
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
                                                                    "matrix3d(" + MathUtils.scientificToDecimal(mat, 5) + ")");

            el.elementModel.props3D.matrix3d = mat;
            el.elementModel.props3D.perspectiveDist = dist;

            if(update3DModel)
            {
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
    },

    transformStringToMat: {
        value: function( str )    {
            var rtnMat;

            var index1 = str.indexOf( "matrix3d(");
            if (index1 >= 0)
            {
                index1 += 9;    // do not include 'matrix3d('
                var index2 = str.indexOf( ")", index1 );
                if (index2 >= 0)
                {
                    var substr = str.substr( index1, (index2-index1));
                    if (substr && (substr.length > 0))
                    {
                        var numArray = substr.split(',');
                        var nNums = numArray.length;
                        if (nNums == 16)
                        {
                            // gl-matrix wants row order
                            rtnMat = numArray;
                            for (var i=0;  i<16;  i++)
                                rtnMat[i] = Number( rtnMat[i] );
                        }
                    }
                }
            }

            return rtnMat;
        }
    }
});