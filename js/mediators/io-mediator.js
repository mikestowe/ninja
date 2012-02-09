/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 	require("montage/core/core").Montage,
	Component = require("montage/ui/component").Component,
	FileIo = 	require("js/io/system/fileio").FileIo,
	ProjectIo = require("js/io/system/projectio").ProjectIo;
////////////////////////////////////////////////////////////////////////
//
exports.IoMediator = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
		enumerable: false,
        value: false
    },
	////////////////////////////////////////////////////////////////////
    //
	deserializedFromTemplate: {
		enumerable: false,
		value: function () {
			//
		}
	},
	////////////////////////////////////////////////////////////////////
    //
    fio: {
    	enumerable: false,
    	value: FileIo
    },
	////////////////////////////////////////////////////////////////////
    //
    fileNew: {
    	enumerable: false,
    	value: function (file, template, callback) {
    		//
    		var xhr = new XMLHttpRequest(), result;
    		xhr.open("GET", template, false);
            xhr.send();
    		if (xhr.readyState === 4) {
    			//
    			switch (this.fio.newFile({uri: file, contents: xhr.response})) {
    				case 201:
    					result = {status: 201, success: true, uri: file};
    					break;
    				case 204:
    					result = {status: 204, success: false, uri: file};
    					break;
    				case 400:
    					result = {status: 400, success: false, uri: file};
    					break;
    				default:
    					result = {status: 500, success: false, uri: file};
    					break;
    			}
    		} else {
    			result = {status: 500, success: false, uri: file};
    		}
    		//
    		if (callback) callback(result);
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
            callback(returnObj);
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