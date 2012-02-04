/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 	require("montage/core/core").Montage,
	FileIo = 	require("js/io/system/fileio").FileIo,
	ProjectIo = require("js/io/system/projectio").ProjectIo;
////////////////////////////////////////////////////////////////////////
//
exports.IoMediator = Montage.create(require("montage/ui/component").Component, {
	////////////////////////////////////////////////////////////////////
    //
    fileNew: {
    	enumerable: false,
    	value: function (file, template, callback, callbackScope) {
    		//


            var returnObj = null; //like {"type": "js", "name": "filename", "source": "test file content", "uri": "/fs/fsd/"}
    		callback.call(callbackScope, returnObj);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    fileOpen: {
    	enumerable: false,
    	value: function (file, callback) {
    		//
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    fileSave: {
    	enumerable: false,
    	value: function (file, callback) {
    		//
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    fileSaveAs: {
    	enumerable: false,
    	value: function (file, copy, callback) {
    		//
    	}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////