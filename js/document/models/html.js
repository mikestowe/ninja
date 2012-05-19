/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 				require("montage/core/core").Montage,
    BaseDocumentModel = 	require("js/document/models/base").BaseDocumentModel,
    webGlDocumentHelper = 	require("js/document/helpers/webgl-helper").webGlDocumentHelper;
////////////////////////////////////////////////////////////////////////
//	
exports.HtmlDocumentModel = Montage.create(BaseDocumentModel, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    selection: {
        value: []
    },
	////////////////////////////////////////////////////////////////////
	//
    draw3DGrid: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    scrollLeft: {
        value: null
    },

    scrollTop: {
        value: null
    },

    userContentLeft: {
        value: null
    },

    userContentTop: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
	baseHref: {
		value: null
	},
    ////////////////////////////////////////////////////////////////////
	//
	webGlHelper: {
        value: webGlDocumentHelper
    },
    ////////////////////////////////////////////////////////////////////
	//
    userComponents: {
        value: {}
    },
	////////////////////////////////////////////////////////////////////
	//Add a reference to a component instance to the userComponents hash using the element UUID
    setComponentInstance: {
        value: function(instance, el) {
            this.userComponents[el.uuid] = instance;
        }
    },
    ////////////////////////////////////////////////////////////////////
	//Returns the component instance obj from the element
    getComponentFromElement: {
        value: function(el) {
            if(el) {
                if(el.uuid) return this.userComponents[el.uuid];
            } else {
                return null;
            }
        }
    }
	////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////