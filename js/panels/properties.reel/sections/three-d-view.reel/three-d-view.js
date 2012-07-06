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
    Component = require("montage/ui/component").Component;

exports.ThreeD = Montage.create(Component, {

    inGlobalMode: {
        value: false
    },

    // TODO - booleans not working with boundValueMutator when bound to selectedIndex, so using index
    // 0 = local; 1 = global
    _axisMode: {
        value: 0
    },

    axisMode: {
        get: function() {
            return this._axisMode;
        },
        set: function(value) {
            this._axisMode = value;
            
            if(value === 0) {
                this.inGlobalMode = false;
                this.x3D = 0;
                this.y3D = 0;
                this.z3D = 0;

                this.xAngle = 0;
                this.yAngle = 0;
                this.zAngle = 0;
            } else {
                this.inGlobalMode = true;
                var item = this.item;
                if(item) {
                    this.x3D = item.elementModel.props3D.x3D;
                    this.y3D = item.elementModel.props3D.y3D;
                    this.z3D = item.elementModel.props3D.z3D;

                    this.xAngle = item.elementModel.props3D.xAngle;
                    this.yAngle = item.elementModel.props3D.yAngle;
                    this.zAngle = item.elementModel.props3D.zAngle;
                }
            }
        }
    },

    x3DControl: {
        value: null,
        serializable: true
    },

    y3DControl: {
        value: null,
        serializable: true
    },

    z3DControl: {
        value: null,
        serializable: true
    },

    x3DLabel: {
        value: null,
        serializable: true
    },

    y3DLabel: {
        value: null,
        serializable: true
    },

    z3DLabel: {
        value: null,
        serializable: true
    },

    xAngleControl: {
        value: null,
        serializable: true
    },

    yAngleControl: {
        value: null,
        serializable: true
    },

    zAngleControl: {
        value: null,
        serializable: true
    },

    axisModeGroupControl: {
        value: null,
        serializable: true
    },

    flattenControl: {
        value: null,
        serializable: true
    },

    x3D: {
        value: 0
    },

    y3D: {
        value: 0
    },

    z3D: {
        value: 0
    },

    xAngle: {
        value: 0
    },

    yAngle: {
        value: 0
    },

    zAngle: {
        value: 0
    },

    flatten: {
        value: false
    },

    _disableTranslation: {
        value: true
    },

    disableTranslation: {
        get: function () {
            return this._disableTranslation;
        },
        set: function (value) {
            if(value !== this._disableTranslation) {
                this._disableTranslation  = value;
                this.needsDraw = true;
            }
        }
    },

    item: {
        value: null
    },

    _curMat: {
        value: null
    },

    _curProp: {
        value: null
    },

    _transformCtr: {
        value: null
    },

    handleAction: {
        value: function(event) {
            if(event.currentTarget.identifier === "flatten") {
                this.application.ninja.elementMediator.setProperty([this.item], "-webkit-transform-style",
                                                                    event.currentTarget.checked ? ["flat"] : ["preserve-3d"]);
            }
        }
    },

    handleChange: {
        value: function(event) {
            if(event.wasSetByCode) {
                return;
            }

            this.apply3DProperties(event.currentTarget.identifier, event.currentTarget, this.item, this.inGlobalMode, false);

            this._curMat = null;
            this._curProp = null;
        }
    },

    handleChanging: {
        value: function(event) {
            if(event.wasSetByCode) {
                return;
            }

            this.apply3DProperties(event.currentTarget.identifier, event.currentTarget, this.item, this.inGlobalMode, true);
        }
    },

    apply3DProperties : {
        value : function(prop, value, item, inGlobalMode, isChanging){
            if(!this._curMat) {
                this._curMat = this.application.ninja.elementMediator.getMatrix(item);
//                this._transformCtr = item.elementModel.props3D.m_transformCtr || [0,0,0];
                // TODO - Always use the center for now until we support multiple selections
                this._transformCtr = [0,0,0];
                if(inGlobalMode) {
                    this._transformCtr = MathUtils.transformPoint(this._transformCtr, this._curMat);
                }
            }

            var curMat = this._curMat,
                delta = value.value,
                isRotating = false,
                xFormMat = Matrix.I(4),
                tMat = Matrix.I(4),
                mat = [];
            if(inGlobalMode) {

                if(!this._curProp) {
                    this._curProp = this.application.ninja.elementMediator.get3DProperty(item, prop);
                }

                delta -= this._curProp;
            }

            switch (prop)
            {
                case "xAngle":
                    xFormMat = Matrix.RotationX(MathUtils.DEG_TO_RAD * delta);
                    isRotating = true;
                    break;
                case "yAngle":
                    xFormMat = Matrix.RotationY(MathUtils.DEG_TO_RAD * delta);
                    isRotating = true;
                    break;
                case "zAngle":
                    xFormMat = Matrix.RotationZ(MathUtils.DEG_TO_RAD * delta);
                    isRotating = true;
                    break;
                case "x3D":
                    xFormMat[12] = delta;
                    break;
                case "y3D":
                    xFormMat[13] = delta;
                    break;
                case "z3D":
                    xFormMat[14] = delta;
                    break;
            }

            if(inGlobalMode) {

                if(isRotating) {

                    // pre-translate by the transformation center
                    tMat[12] = this._transformCtr[0];
                    tMat[13] = this._transformCtr[1];
                    tMat[14] = this._transformCtr[2];

                    glmat4.multiply(tMat, xFormMat, mat);

                    // translate back
                    tMat[12] = -this._transformCtr[0];
                    tMat[13] = -this._transformCtr[1];
                    tMat[14] = -this._transformCtr[2];

                    glmat4.multiply(mat, tMat, mat);
                    glmat4.multiply(mat, curMat, mat);
                } else {
                    glmat4.multiply(xFormMat, curMat, mat);
                }
            } else {
                if(isRotating) {
                    tMat[12] = this._transformCtr[0];
                    tMat[13] = this._transformCtr[1];
                    tMat[14] = this._transformCtr[2];

                    glmat4.multiply(curMat, tMat, mat);

                    // translate back
                    tMat[12] = -this._transformCtr[0];
                    tMat[13] = -this._transformCtr[1];
                    tMat[14] = -this._transformCtr[2];

                    glmat4.multiply(mat, xFormMat, mat);
                    glmat4.multiply(mat, tMat, mat);
                } else {
                    glmat4.multiply(curMat, xFormMat, mat);
                }
            }

            if(isChanging) {
                this.application.ninja.elementMediator.setMatrix(item, mat, true);
            } else {
                this.application.ninja.elementMediator.setMatrix(item, mat, false);

                if(!inGlobalMode) {
                    value.value = 0;
                }
            }
        }
    },

    _currentDocument: {
        value : null
    },

    currentDocument : {
        get : function() {
            return this._currentDocument;
        },
        set : function(value) {
            if (value === this._currentDocument) {
                return;
            }

            this._currentDocument = value;

            if(this._currentDocument && this._currentDocument.currentView === "design") {
                // Save a reference of the pi inside the document view to be able to clear
                Object.defineBinding(this, "item", {
                    boundObject: this,
                    boundObjectPropertyPath: "application.ninja.selectedElements",
                    boundValueMutator: this._getSelectedItem,
                    oneway: true
                });
            }
        }
    },

    templateDidLoad : {
        value: function() {
            Object.defineBinding(this, "axisMode", {
                boundObject: this.axisModeGroupControl,
                boundObjectPropertyPath: "selectedIndex",
                oneway: false
            });
        }
    },

    _getSelectedItem: {
        value: function(els) {
            if(els.length) {
                return els[0];
            } else {
                return this.boundObject.application.ninja.currentDocument.model.documentRoot;
            }
        }
    },

    draw: {
        value: function() {
            if(this._disableTranslation) {
                this.x3D = 0;
                this.x3DControl.enabled = false;
                this.y3D = 0;
                this.y3DControl.enabled = false;
                this.z3D = 0;
                this.z3DControl.enabled = false;

                this.x3DLabel.classList.add("disabled");
                this.y3DLabel.classList.add("disabled");
                this.z3DLabel.classList.add("disabled");
            } else {
                this.x3DControl.enabled = true;
                this.y3DControl.enabled = true;
                this.z3DControl.enabled = true;
                this.x3DLabel.classList.remove("disabled");
                this.y3DLabel.classList.remove("disabled");
                this.z3DLabel.classList.remove("disabled");
            }
        }
    }

});
