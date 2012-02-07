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
    		var i, l, libs, libjson, xhr = new XMLHttpRequest(), tocopylibs = [];
            //Getting known json list of libraries to copy to chrome
           	xhr.open("GET", '/ninja-internal/js/io/system/ninjalibrary.json', false);
            xhr.send();
            //Checkng for correct reponse
            if (xhr.readyState === 4) {
            	//Parsing json libraries
            	libs = JSON.parse(xhr.response);
            	//
            	if (chromeLibs.length > 0) {
            		//TODO: Remove
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
            				} else {
            					//Error creating single file library
            				}
            			} else {
            				//Creating root folder
            				this.chromeApi.directoryNew('/'+tocopylibs[i].name);
            				//Getting file contents
            				xhr = new XMLHttpRequest();
            				xhr.open("GET", tocopylibs[i].path, false);
            				xhr.send();
            				//Checking for status
            				if (xhr.readyState === 4) {
            					//
            					libjson = JSON.parse(xhr.response);
            					//
            					for (l=0; libjson.directories[l]; l++) {
            						libjson.dirsToCreate = libjson.directories.length;
            						libjson.dirsCreated = 0;
            						libjson.filesToCreate = libjson.files.length;
            						libjson.filesCreated = 0;
            						libjson.api = this.chromeApi;
            						libjson.local = tocopylibs[i].name;
               						this.createDirectory(tocopylibs[i].name, libjson.directories[l], function (status) {
               							//Checking for success on directories created
               							if (status) {
               								this.dirsCreated++;
               							}
               							//All directories created
               							if (this.dirsCreated === this.dirsToCreate) {
               								var xhr, i;
               								for (i=0; this.files[i]; i++) {
               									xhr = new XMLHttpRequest();
            									xhr.open("GET", this.root+this.files[i], false);
            									xhr.send();
            									//Checking for status
            									if (xhr.readyState === 4) {
               										this.api.fileNew(this.local+'/'+this.files[i], xhr.response, 'text/plain', function (status) {
               											if (status) {
               												this.filesCreated++;
               											}
               											if (this.filesCreated === this.filesToCreate) {
               												//TODO: Add logic for task completed
               											}
               										}.bind(this));
               									}	
               								}
               							}
               						}.bind(libjson));
               					}
            				} else {
            					//Error
            				}
            			}
            		}
            	} else {
            		//No libraries to copy
            	}
            } else {
            	//Error
            }
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    createDirectory: {
    	enumerable: true,
    	value: function(root, folder, callback) {
    		//
    		if (folder.name) {
			    if (root) {
					dir = root+'/'+folder.name;
			    } else {
			    	dir = folder.name;
			    }
			    //
			    this.chromeApi.directoryNew(dir, function (status) {if (callback)callback(status)});
			}
			//
			if (folder.children) {
				for (var j in folder.children) {
					if (root) {
						this.createDirectory(root+'/'+folder.name, folder.children[j]);
			   		} else {
			   			this.createDirectory(folder.name, folder.children[j]);
			    	}
			    }
			}
    	}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////   
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////