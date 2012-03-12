/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/* /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
NOTES:

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
    _coreApi: {
        enumerable: false,
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    coreApi: {
    	enumerable: false,
    	get: function() {
            return this._coreApi;
        },
        set: function(value) {
        	this._coreApi = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _libs: {
        enumerable: false,
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    libs: {
    	enumerable: false,
    	get: function() {
            return this._libs;
        },
        set: function(value) {
        	this._libs = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _libsToSync: {
    	enumerable: false,
        value: 0
    },
    ////////////////////////////////////////////////////////////////////
    //
    _syncedLibs: {
    	enumerable: false,
        value: 0
    },
    ////////////////////////////////////////////////////////////////////
    //
    copyLibToCloud: {
    	enumerable: false,
        value: function (path, libName, callback) {
        	//
        	if(this.coreApi.directoryExists({uri: path+libName}).status === 404) {
        		this.chromeApi.directoryContents(this.chromeApi.fileSystem.root, function (contents) {
        			for (var i in contents) {
    	    			if (libName === contents[i].name) {
	        				//Getting contents of library to be copied
        					this.chromeApi.directoryContents(contents[i], function (lib) {
        						//Creating directory structure from subfolders
        						this.copyDirectoryToCloud(path, contents[i], path, callback);
        					}.bind(this));
        					break;
        				}
    	    		}
	        	}.bind(this));
        	} else {
        		//Error
        	}
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    copyDirectoryToCloud: {
    	enumerable: true,
    	value: function(root, folder, fileRoot, callback) {
    		//
    		if (folder.name) {
    			var dir;
			    if (root) {
					dir = root+'/'+folder.name;
			    } else {
			    	dir = folder.name;
			    }
			    //
			    if (!this.coreApi.createDirectory({uri: dir.replace(/\/\//gi, '/')})) {
			    	//Error occured while creating folders
			    	return;
			    }
			}
			//
			if (folder.isDirectory) {
				this.chromeApi.directoryContents(folder, function (contents) {
					for (var i in contents) {
						if (contents[i].isDirectory) {
							this.copyDirectoryToCloud(dir, contents[i], fileRoot);
						} else if (contents[i].isFile){
							//File to copy
							this.chromeApi.fileContent(contents[i].fullPath, function (result) {
								//
								//this.coreApi.createFile({uri: fileRoot+result.file.fullPath, contents: blob.getBlob(result.data.type), contentType: result.data.type});
								this.coreApi.createFile({uri: (fileRoot+result.file.fullPath).replace(/\/\//gi, '/'), contents: result.content});
							}.bind(this));
						}
					}
				}.bind(this));
			}
			//TODO Add logic for proper callback status(es)
			if (callback) callback(true);
    	}
    },
	////////////////////////////////////////////////////////////////////
    //
    synchronize: {
    	enumerable: true,
    	value: function(chromeLibs, chrome) {
    		//TODO: Remove
    		window.wipeLibrary = this.deleteLibraries.bind(this);
    		//
    		this.chromeApi = chrome;
    		//
    		var i, l, libs, libjson, xhr = new XMLHttpRequest(), tocopylibs = [], copied;
            //Getting known json list of libraries to copy to chrome
           	xhr.open("GET", '/js/io/system/ninjalibrary.json', false);
            xhr.send();
            //Checkng for correct reponse
            if (xhr.readyState === 4) {
            	//Parsing json libraries
            	libs = JSON.parse(xhr.response);
            	//
            	this.libs = libs.libraries;
            	//
            	if (chromeLibs.length > 0) {
            		//
	            	for (i=0; chromeLibs[i]; i++) {
	            		copied = false;
	            		for (var j in libs.libraries) {
	            			if (String(libs.libraries[j].name+libs.libraries[j].version).toLowerCase() === chromeLibs[i]) {
	            				copied = true;
	            			}
	            		}
	            		//
	            		if (!copied) {
	            			if (libs.libraries[j].file) {
            					tocopylibs.push({name: String(libs.libraries[j].name+libs.libraries[j].version).toLowerCase(), path: libs.libraries[j].path, file: libs.libraries[j].file});
        		    		} else {
		            			tocopylibs.push({name: String(libs.libraries[j].name+libs.libraries[j].version).toLowerCase(), path: libs.libraries[j].path});
            				}
	            		} else {
	            			//TODO: Remove, currently manually removing copied libraries
	            			//this.chromeApi.directoryDelete(chromeLibs[i]);
	            		}
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
            	this._libsToSync = tocopylibs.length;
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
            				xhr.responseType = "arraybuffer"; 
            				xhr.send();
            				//Checking for status
            				if (xhr.readyState === 4) { //TODO: add check for mime type
            					//Creating new file from loaded content
            					this.chromeApi.fileNew('/'+tocopylibs[i].name+'/'+tocopylibs[i].file, xhr.response, function (status) {if(status) this.libraryCopied()}.bind(this));
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
            						libjson.local = tocopylibs[i].name;
            						libjson.main = this;
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
            									xhr.responseType = "arraybuffer"; 
            									xhr.send();
            									//Checking for status
            									if (xhr.readyState === 4) {
               										this.main.chromeApi.fileNew(this.local+'/'+this.files[i], xhr.response, function (status) {
               											if (status) {
               												this.filesCreated++;
               											}
               											if (this.filesCreated === this.filesToCreate) {
               												this.main.libraryCopied();
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
            		//Dispatching ready event since nothing to copy
            		this._dispatchEvent();
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
    },
    ////////////////////////////////////////////////////////////////////
    //
    libraryCopied: {
    	enumerable: true,
    	value: function() {
    		this._syncedLibs++;
    		if (this._syncedLibs === this._libsToSync) {
    			this._dispatchEvent();
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    deleteLibraries: {
    	enumerable: true,
    	value: function () {
    		function parseLibrary (contents) {
        		//
        		for(var i=0; contents[i]; i++) {
        			//
        			if (contents[i].isDirectory) {
        				this.chromeApi.directoryDelete(contents[i].name);
        			}
        		}
        	};
        	//
        	this.chromeApi.directoryContents(this.chromeApi.fileSystem.root, parseLibrary.bind(this));
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _dispatchEvent: {
    	enumerable: true,
    	value: function () {
    		var syncEvent = document.createEvent("CustomEvent");
            syncEvent.initEvent('sync', true, true);
            this.dispatchEvent(syncEvent);
    	}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////   
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////