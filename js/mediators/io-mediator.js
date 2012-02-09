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
	deserializedFromTemplate: {
		enumerable: false,
		value: function () {
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
    		var xhr = new XMLHttpRequest();
    		xhr.open("GET", template, false);
            xhr.send();
    		if (xhr.readyState === 4) {
    			//
    			console.log(this.fio.newFile({uri: file, contents: xhr.response}));
    		} else {
    			//Error
    		}
    		
    		
    		
    		
    		
    		

			//callback('win');
            /*
var returnObj = null; //like {"uri": "/gfdg/gdf/dfg.js", "success": true,...}
    		callback(returnObj);
*/
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