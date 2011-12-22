/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/* Class that holds all 3d properties per element.
*/

exports.Properties3D = Object.create(Object.prototype, {
    m_element : {value : null, writable:true, enumerable:true, configurable:true},
    
//    m_upVector : {value : Vector.create( [0,1,0] ), writable: true, enumerable: true, configurable: true},
    m_azimuth : {value : 0.0, writable: true, enumerable: true, configurable: true},
    m_altitude : {value : 0.0, writable: true, enumerable: true, configurable: true},

    m_transformCtr : {value : null, writable: true, enumerable: true, configurable: true},
//    m_targetPos : {value : Vector.create( [0,0,0] ), writable: true, enumerable: true, configurable: true},

    m_endAzimuth : {value : 0, writable: true, enumerable: true, configurable: true},
    m_endAltitude : {value : 0, writable: true, enumerable: true, configurable: true},

//    m_objStartPos : {value : Vector.create( [0,0,0] ), writable: true, enumerable: true, configurable: true},

    //TODO - not sure if this should be part of the tool or stage or a utility
    perspectiveDist : { value : 1400, writable: true, enumerable: true, configurable: true},

	// keep a referenceto the GLWorld (if any)
	_world : {value : null, writable:true, enumerable:true, configurable:true},

	// keep a flag indicating the element is in the 2D snap cache
	_eltIsIn2DSnapCache : { value: false, writable: true, enumerable: true, configurable: true},

    Init : {
        value : function(elt)
        {
            this.m_element = elt;
            
            this.m_azimuth = 0.0;
            this.m_altitude = 0.0;

            this.m_endAzimuth = 0.0;
            this.m_endAltitude = 0.0;

//            this.m_upVector = Vector.create( [0,1,0] );
//			this.m_viewDir  = Vector.create( [0,0,1] );
//			this.m_endUpVector = Vector.create( [0,1,0] );

            this.m_transformCtr = null;
//            this.m_targetPos = Vector.create( [0,0,0] );

//            this.m_objStartPos = Vector.create( [0,0,0] );

            this.perspectiveDist = 1400;
        }
    },

    ResetRotationValues : {
        value : function(elt)
        {
//            this.m_upVector = Vector.create( [0,1,0] );
//            this.m_viewDir = Vector.create( [0,0,1] );

            this.m_azimuth = 0.0;
            this.m_altitude = 0.0;

            this.m_endAzimuth = 0.0;
            this.m_endAltitude = 0.0;

            this.m_transformCtr = null;
//            this.m_targetPos = Vector.create( [0,0,0] );
        }
    },

    ResetTranslationValues : {
        value : function(elt)
        {
//            this.m_objStartPos = Vector.create( [0,0,0] );
            this.perspectiveDist = 1400;
        }
    }
});