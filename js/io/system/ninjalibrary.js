/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/* /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
NOTES:

	Core API reference in NINJA: this.application.ninja.coreIoApi

////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////// */
//
var Montage = require("montage/core/core").Montage;
////////////////////////////////////////////////////////////////////////
//
exports.NinjaLibrary = Montage.create(Object.prototype, {
	////////////////////////////////////////////////////////////////////
    //
    _chromeApi: {
        enumerable: false,
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    chromeApi: {
    	enumerable: false,
    	get: function() {
            return this._chromeApi;
        },
        set: function(value) {
        	this._chromeApi = value;
        }
    },
	////////////////////////////////////////////////////////////////////
    //
    synchronize: {
    	enumerable: true,
    	value: function(chromeLibs, chrome) {
    		//
    		this.chromeApi = chrome;
    		//
    		var i, libs, xhr = new XMLHttpRequest(), tocopylibs = [];
            //Getting known json list of libraries to copy to chrome
           	xhr.open("GET", '/ninja-internal/js/io/system/ninjalibrary.json', false);
            xhr.send();
            //Checkng for correct reponse
            if (xhr.readyState === 4) {
            	//Parsing json libraries
            	libs = JSON.parse(xhr.response);
            	//
            	if (chromeLibs.length > 0) {
            		//Compare (always deleting for testing)
            		for (i=0; chromeLibs[i]; i++) {
            			this.chromeApi.directoryDelete(chromeLibs[i]);
            		}
            	} else {
            		//No library is present, must copy all
            		for (var j in libs.libraries) {
            			//name: 	used to folder container contents
            			//path: 	url of descriptor json or single file to load (descriptor has list of files)
            			//singular:	indicates the path is the file to be loaded into folder
            			if (libs.libraries[j].file) {
            				tocopylibs.push({name: String(libs.libraries[j].name+libs.libraries[j].version).toLowerCase(), path: libs.libraries[j].path, file: libs.libraries[j].file});
            			} else {
            				tocopylibs.push({name: String(libs.libraries[j].name+libs.libraries[j].version).toLowerCase(), path: libs.libraries[j].path});
            			}
            		}
            	}
            	//
            	if (tocopylibs.length > 0) {
            		for (i=0; tocopylibs[i]; i++) {
            			//Checking for library to be single file
            			if (tocopylibs[i].file) {
            				//Creating root folder
            				this.chromeApi.directoryNew('/'+tocopylibs[i].name);
            				//Getting file contents
            				xhr = new XMLHttpRequest();
            				xhr.open("GET", tocopylibs[i].path, false);
            				xhr.send();
            				//Checking for status
            				if (xhr.readyState === 4) { //TODO: add check for mime type
            					//Creating new file from loaded content
            					this.chromeApi.fileNew('/'+tocopylibs[i].name+'/'+tocopylibs[i].file, xhr.response, 'text/plain');
            					//this.chromeApi.fileNew('/'+tocopylibs[i].name+'/'+tocopylibs[i].file, xhr.response, 'text/plain', function (v){console.log(v)});
            				} else {
            					//Error
            				}
            			} else {
            				//
            			}
            		}
            	} else {
            		//No libraries to copy
            	}
            } else {
            	//Error
            }
    	}
    }/*
,
    ////////////////////////////////////////////////////////////////////
    //
    createFolder: {
    	enumerable: true,
    	value: function(name) {
    		//
    		this.chromeApi.directoryNew(name);
    	}
    }
*/
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////   
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////