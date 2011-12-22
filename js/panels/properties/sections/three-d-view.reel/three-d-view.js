/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

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
            
            if(value === 0)
            {
                this.inGlobalMode = false;
                this.x3D = 0;
                this.y3D = 0;
                this.z3D = 0;

                this.xAngle = 0;
                this.yAngle = 0;
                this.zAngle = 0;
            }
            else
            {
                this.inGlobalMode = true;
                if(this.application.ninja.selectedElements.length)
                {
                    var item = this.application.ninja.selectedElements[0]._element;
                    if(item)
                    {
                        this.x3D = item.elementModel.props3D.x3D;
                        this.y3D = item.elementModel.props3D.y3D;
                        this.z3D = item.elementModel.props3D.z3D;

                        this.xAngle = item.elementModel.props3D.xAngle;
                        this.yAngle = item.elementModel.props3D.yAngle;
                        this.zAngle = item.elementModel.props3D.zAngle;
                    }
                }
            }
        }
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

    handleChange: {
        value: function(event) {
            if(event.wasSetByCode) {
                return;
            }

            this.apply3DProperties(event.currentTarget.identifier,
                                    event.currentTarget,
                                    this.application.ninja.selectedElements[0]._element,
                                    this.inGlobalMode,
                                    false);
        }
    },

    handleChanging: {
        value: function(event) {
            if(event.wasSetByCode) {
                return;
            }

            this.apply3DProperties(event.currentTarget.identifier,
                            event.currentTarget,
                            this.application.ninja.selectedElements[0]._element,
                            this.inGlobalMode,
                            true);
        }
    },

    apply3DProperties : {
        value : function(prop, value, item, inGlobalMode, isChanging){
            // TODO - May want to use mediator instead
            var curMat = item.elementModel.props3D.matrix3d;
            var delta = value.value - item.elementModel.props3D[prop];

            var xFormMat = Matrix.I(4);
            switch (prop)
            {
                case "xAngle":
                    xFormMat = Matrix.RotationX(MathUtils.DEG_TO_RAD * delta);
                    break;
                case "yAngle":
                    xFormMat = Matrix.RotationY(MathUtils.DEG_TO_RAD * delta);
                    break;
                case "zAngle":
                    xFormMat = Matrix.RotationZ(MathUtils.DEG_TO_RAD * delta);
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

            var mat = [];
            if(inGlobalMode)
            {
                glmat4.multiply(xFormMat, curMat, mat);
            }
            else
            {
                glmat4.multiply(curMat, xFormMat, mat);
            }

            if(isChanging)
            {
                this.application.ninja.elementMediator.setMatrix(item, mat, true);
            }
            else
            {
                this.application.ninja.elementMediator.setMatrix(item, mat, false);

                if(!inGlobalMode)
                {
                    value.value = 0;
                }
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