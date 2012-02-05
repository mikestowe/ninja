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
    	value: function (file, template, callback) {
    		//


            var returnObj = null; //like {"type": "js", "name": "filename", "source": "test file content", "uri": "/fs/fsd/"}
    		callback.operation.call(callback.thisScope, returnObj);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    fileOpen: {
    	enumerable: false,
    	value: function (file, callback) {
    		var response = "", fileContent="", filename="", fileType="js", returnObj=null;

            response = this.application.ninja.coreIoApi.openFile({"uri":file.uri});
            if((response.success === true) && ((response.status === 200) || (response.status === 304))){
                fileContent = response.content;
            }


            //TODO : format html content to render in design view


            filename = this.getFileNameFromPath(file.uri);
            if(file.uri.indexOf('.') != -1){
                fileType = file.uri.substr(file.uri.lastIndexOf('.') + 1);
            }
            returnObj = {"type": ""+fileType, "name": ""+filename, "source": fileContent, "uri": file.uri};
            callback.operation.call(callback.thisScope, returnObj);
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
    },
    ////////////////////////////////////////////////////////////////////
    ///// Return the last part of a path (e.g. filename)
    getFileNameFromPath : {
        value: function(path) {
            path = path.replace(/[/\\]$/g,"");
            path = path.replace(/\\/g,"/");
            return path.substr(path.lastIndexOf('/') + 1);
        }
    }
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////