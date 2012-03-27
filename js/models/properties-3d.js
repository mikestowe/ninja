/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    NJUtils = require("js/lib/NJUtils").NJUtils;

exports.Properties3D = Montage.create(Component, {

    //    m_upVector : {value : [0,1,0], enumerable: true},
    //    m_targetPos : {value : [0,0,0], enumerable: true},
    //    m_objStartPos : {value : [0,0,0], enumerable: true},

    m_azimuth :         {value : 0.0, enumerable: true},
    m_altitude :        {value : 0.0, enumerable: true},
    m_transformCtr :    {value : null, enumerable: true},
    m_endAzimuth :      {value : 0, enumerable: true},
    m_endAltitude :     {value : 0, enumerable: true},

	_world :            {value : null, enumerable:true}, // keep a referenceto the GLWorld (if any)

    // Keep track of 3d properties
    matrix3d : {value : null, enumerable: true},

    xAngle : {value : 0, enumerable: true},
    yAngle : {value : 0, enumerable: true},
    zAngle : {value : 0, enumerable: true},

    x3D : {value : 0, enumerable: true},
    y3D : {value : 0, enumerable: true},
    z3D : {value : 0, enumerable: true},

    //TODO - not sure if this should be part of the tool or stage or a utility
    perspectiveDist :   { value : null, enumerable: true},
    perspectiveMode :   { value : null, enumerable: true},

    elementPlane :   { value : null, enumerable: true},

    init : {
        value : function(elt, isStage) {

//          this.m_upVector = [0,1,0];
//			this.m_viewDir  = [0,0,1];
//			this.m_endUpVector = [0,1,0];

//          this.m_targetPos = [0,0,0];
//          this.m_objStartPos = [0,0,0];

            this.matrix3d = this.application.ninja.stylesController.getMatrixFromElement(elt, isStage);
            this.perspectiveDist = this.application.ninja.stylesController.getPerspectiveDistFromElement(elt, isStage);

            if(this.matrix3d) {
                var elt3DInfo = MathUtils.decomposeMatrix2(this.matrix3d);
                if(elt3DInfo) {
                    this.xAngle = ~~(elt3DInfo.rotation[0] * MathUtils.RAD_TO_DEG);
                    this.yAngle = ~~(elt3DInfo.rotation[1] * MathUtils.RAD_TO_DEG);
                    this.zAngle = ~~(elt3DInfo.rotation[2] * MathUtils.RAD_TO_DEG);

                    this.x3D = ~~(elt3DInfo.translation[0]);
                    this.y3D = ~~(elt3DInfo.translation[1]);
                    this.z3D = ~~(elt3DInfo.translation[2]);
                }
            } else {
                this.matrix3d = Matrix.I(4);
            }

            if(this.perspectiveDist == null) {
                this.perspectiveDist = 1400;
            }

            return this;
        }
    },

    ResetRotationValues : {
        value : function() {
//          this.m_upVector = [0,1,0];
//          this.m_viewDir = [0,0,1];

            this.m_azimuth = 0.0;
            this.m_altitude = 0.0;

            this.m_endAzimuth = 0.0;
            this.m_endAltitude = 0.0;

            this.m_transformCtr = null;
//          this.m_targetPos = [0,0,0];
        }
    },

    ResetTranslationValues : {
        value : function() {
//          this.m_objStartPos = [0,0,0];
            this.perspectiveDist = 1400;
        }
    }
});