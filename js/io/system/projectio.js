/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 	require("montage/core/core").Montage,
	FileIo = 	require("js/io/system/fileio").FileIo;
////////////////////////////////////////////////////////////////////////
//
exports.ProjectIo = Montage.create(Object.prototype, {
	////////////////////////////////////////////////////////////////////
    //
    newProject: {
    	enumerable: false,
    	value: function () {
    		//Checking for API to be available
    		if (!this.application.ninja.coreIoApi.cloudAvailable()) {
    			//API not available, no IO action taken
    			return null;
    		}
    		//
    	}
    },
	////////////////////////////////////////////////////////////////////
    //
    readProject: {
    	enumerable: false,
    	value: function(e) {
    		//Checking for API to be available
    		if (!this.application.ninja.coreIoApi.cloudAvailable()) {
    			//API not available, no IO action taken
    			return null;
    		}
    		//
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    saveProject: {
    	enumerable: false,
    	value: function() {
    		//Checking for API to be available
    		if (!this.application.ninja.coreIoApi.cloudAvailable()) {
    			//API not available, no IO action taken
    			return null;
    		}
    		//
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    copyProject: {
    	enumerable: false,
    	value: function(e) {
    		//Checking for API to be available
    		if (!this.application.ninja.coreIoApi.cloudAvailable()) {
    			//API not available, no IO action taken
    			return null;
    		}
    		//
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    infoProject: {
    	enumerable: false,
    	value: function(e) {
    		//Checking for API to be available
    		if (!this.application.ninja.coreIoApi.cloudAvailable()) {
    			//API not available, no IO action taken
    			return null;
    		}
    		//
    	}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////