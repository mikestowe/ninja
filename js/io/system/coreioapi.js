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
var Montage = 		require("montage/core/core").Montage,
    Component = 	require("montage/ui/component").Component,
    Popup = 		require("js/components/popup.reel").Popup,
    CloudPopup = 	require("js/io/ui/cloudpopup.reel").CloudPopup,
    ChromeApi =		require("js/io/system/chromeapi").ChromeApi,
    NinjaLibrary = 	require("js/io/system/ninjalibrary").NinjaLibrary;
////////////////////////////////////////////////////////////////////////
//Exporting as Project I/O
exports.CoreIoApi = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //
	deserializedFromTemplate: {
		enumerable: false,
		value: function () {
			////////////////////////////////////////////////////////////
			//Checking for local storage of URL for IO
			if (window.localStorage['ioRootUrl']) {
				//Getting URL from local storage
				this.rootUrl = window.localStorage['ioRootUrl'];
				//Checks for IO API to be active
				this.ioServiceDetected = this.cloudAvailable();
			} else {
				//IO API to be inactive
				this.ioServiceDetected = false;
			}
			////////////////////////////////////////////////////////////
			//Instance of ninja library
			this.ninjaLibrary = NinjaLibrary;
			//Getting reference of chrome file system API
			this.chromeFileSystem = ChromeApi;
			//Sending size in MBs for file system storage
			var chromeFs = this.chromeFileSystem.init(20);
			//Checking for availability of API
			if (chromeFs) {
				this.chromeFileSystem.addEventListener('ready', this, false);
			} else {
				//Error, Chrome File System API not detected
			}
			////////////////////////////////////////////////////////////
		}
	},
	////////////////////////////////////////////////////////////////////
    //
	handleReady: {
		enumerable: false,
        value: function (e) {
        	//Removing events
        	this.chromeFileSystem.removeEventListener('ready', this, false);
        	//Listening for library to be copied event (builds list)
        	this.chromeFileSystem.addEventListener('library', this, false);
        }
	},
	////////////////////////////////////////////////////////////////////
    //
	handleLibrary: {
		enumerable: false,
        value: function (e) {
        	//Removing events
        	this.chromeFileSystem.removeEventListener('library', this, false);
        	//Listening for synced library event
        	this.ninjaLibrary.addEventListener('sync', this, false);
        	//Sending library to be synced to chrome
        	this.ninjaLibrary.synchronize(e._event.ninjaChromeLibrary, this.chromeFileSystem);
        	
        }
	},
	////////////////////////////////////////////////////////////////////
    //
	handleSync: {
		enumerable: false,
        value: function (e) {
        	console.log('Ninja Local Library: Ready');
        	//Removing events
        	this.ninjaLibrary.removeEventListener('sync', this, false);
        	this.ninjaLibrary.coreApi = this;
        	//TODO: Add sync loading screen logic
        	
        	//TODO: Remove test
        	//this.ninjaLibrary.copyLibToCloud('Users/kgq387/Desktop/Ninja Cloud/Disk', 'montage0.6.0');
        	//this.ninjaLibrary.deleteLibraries();
        	/*
window.hack = function (name, type) {
        		this.application.ninja.ioMediator.fileNew('Users/kgq387/Desktop/Ninja Cloud/Disk/'+name+'.'+type, '/js/io/templates/files/'+type+'.txt', function (status) {console.log(status)});
        	}.bind(this);
*/			
			window.hack = function (path) {
				//
				this.application.ninja.ioMediator.fileOpen('Users/kgq387/Desktop/Ninja Cloud/Disk/'+path, function (result) {console.log(result)});
			}.bind(this);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _chromeNinjaLibrary: {
        enumerable: false,
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    chromeNinjaLibrary: {
    	enumerable: false,
    	get: function() {
            return this._chromeNinjaLibrary;
        },
        set: function(value) {
        	this._chromeNinjaLibrary = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _chromeFileSystem: {
        enumerable: false,
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    chromeFileSystem: {
    	enumerable: false,
    	get: function() {
            return this._chromeFileSystem;
        },
        set: function(value) {
        	this._chromeFileSystem = value;
        }
    },
	////////////////////////////////////////////////////////////////////
    //
    _ioServiceDetected: {
        enumerable: false,
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //Checking for service availability on boot
    ioServiceDetected: {
    	enumerable: false,
    	get: function() {
            return this._ioServiceDetected;
        },
        set: function(value) {
        	this._ioServiceDetected = value;
        }
    },
	////////////////////////////////////////////////////////////////////
    //Root API URL
    _rootUrl: {
        enumerable: false,
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    rootUrl: {
    	enumerable: false,
    	get: function() {
            return this._rootUrl;
        },
        set: function(value) {
        	this._rootUrl = window.localStorage["ioRootUrl"] = value;
        }
    },
	////////////////////////////////////////////////////////////////////
    //API service URL
    _apiServiceURL: {
        enumerable: false,
        value: '/cloudstatus'
    },
    ////////////////////////////////////////////////////////////////////
    //
    apiServiceURL: {
    	enumerable: false,
    	get: function() {
            return String(this.rootUrl+this._apiServiceURL);
        },
        set: function(value) {
        	this._apiServiceURL = value;
        }
    },
	////////////////////////////////////////////////////////////////////
    //File service API URL
    _fileServiceURL: {
        enumerable: false,
        value: '/file'
    },
    ////////////////////////////////////////////////////////////////////
    //
    fileServiceURL: {
    	enumerable: false,
    	get: function() {
            return String(this.rootUrl+this._fileServiceURL);
        },
        set: function(value) {
        	this._fileServiceURL = value;
        }
    },
	////////////////////////////////////////////////////////////////////
    //Directory service API URL
    _directoryServiceURL: {
        enumerable: false,
        value: '/directory'
    },
    ////////////////////////////////////////////////////////////////////
    //
    directoryServiceURL: {
    	enumerable: false,
    	get: function() {
            return String(this.rootUrl+this._directoryServiceURL);
        },
        set: function(value) {
        	this._directoryServiceURL = value;
        }
    },
	////////////////////////////////////////////////////////////////////
    // private helper to parse URIs and append them to the service URL
    _prepareServiceURL: {
        enumerable: false,
        value: function(serviceURL, path) {
            var urlOut = path.replace(/\\/g,"/");
            urlOut = urlOut.replace(/:/g,"");
            urlOut = encodeURI(urlOut);
            //add leading / if not already there
            if((urlOut.length > 0) && (urlOut.charAt(0) !== "/")){
                urlOut = "/" + urlOut;
            }
            //remove extra / at the end
            if((urlOut.length > 1) && (urlOut.charAt(urlOut.length - 1) === "/")){
                urlOut = urlOut.substring(0, (urlOut.length - 1));
            }
			//
            return String(serviceURL+urlOut);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Method to check status of I/O API, will return false if not active
	cloudAvailable: {
		enumerable: false,
		value: function () {
			var cloud = this.getCloudStatus();
			//
			if (this.rootUrl && cloud.status === 200) {
				//Active
				this.cloudData.name = cloud.response['name'];
				this.cloudData.root = cloud.response['server-root'];
				return true;
			} else {
				//Inactive
				if (!this._cloudDialogOpen && this.application.ninja) {
					this.showCloudDialog();
				}
				return false;
			}
		}
	},
	////////////////////////////////////////////////////////////////////
    //
    _cloudDialogOpen: {
    	enumerable: false,
		value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    cloudData: {
    	enumerable: false,
		value: {name: null, root: ''}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _cloudDialogComponents: {
    	enumerable: false,
		value: {blackout: null, popup: null, dialog: null}
    },
    ////////////////////////////////////////////////////////////////////
    //
    showCloudDialog: {
    	enumerable: false,
		value: function () {
			//
			this._cloudDialogOpen = true;
			//
			this._cloudDialogComponents.blackout = document.createElement('div');
			this._cloudDialogComponents.blackout.style.width = '100%';
			this._cloudDialogComponents.blackout.style.height = '100%';
			this._cloudDialogComponents.blackout.style.background = '-webkit-radial-gradient(center, ellipse cover, rgba(0,0,0,.65) 0%, rgba(0,0,0,0.8) 80%)';
			this.application.ninja.popupManager.addPopup(this._cloudDialogComponents.blackout);
    		//
    		////////////////////////////////////////////////////
    		//Creating popup from m-js component
    		var popup = document.createElement('div');
    		//
    		this._cloudDialogComponents.dialog = CloudPopup.create();
    		//
    		document.body.appendChild(popup);
    		//
    		this._cloudDialogComponents.dialog.element = popup;
    		this._cloudDialogComponents.dialog.needsDraw = true;
    		this._cloudDialogComponents.dialog.element.style.opacity = 0;
    		//
    		this._cloudDialogComponents.dialog.addEventListener('firstDraw', this, false);
		}
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleFirstDraw: {
    	value: function (e) {
			if (e._target._element.className === 'cloud_popup') {
	    		this._cloudDialogComponents.dialog.removeEventListener('firstDraw', this, false);
		    	//
				this._cloudDialogComponents.popup = this.application.ninja.popupManager.createPopup(this._cloudDialogComponents.dialog.element, {x: '50%', y: '50%'});
				this._cloudDialogComponents.popup.addEventListener('firstDraw', this, false);
			} else {
				//
				this._cloudDialogComponents.dialog.element.style.opacity = 1;
				this._cloudDialogComponents.popup.element.style.opacity = 1;
				this._cloudDialogComponents.popup.element.style.margin = '-170px 0px 0px -190px';
			}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    hideCloudDialog: {
    	enumerable: false,
		value: function () {
			//
			this.application.ninja.popupManager.removePopup(this._cloudDialogComponents.blackout);
			this.application.ninja.popupManager.removePopup(this._cloudDialogComponents.popup.element);
		}
    },
    ////////////////////////////////////////////////////////////////////
    // Checks for the existence of a file
    // Parameters:
    //      the file parameter must contain the following properties
    //          uri: string value containing the full file path/URI i.e. "c:/foo/bar.html"
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              204 - the file exists
    //              404 - the file does not exist
    //              500 - unknown server error occurred
    fileExists: {
        enumerable: false,
        value: function(file) {
        	//
            var retValue = { success:null, status:null };
            //
            if(file && file.uri && file.uri.length) {
                try {
                    var serviceURL = this._prepareServiceURL(this.fileServiceURL, file.uri),
                    	xhr = new XMLHttpRequest();
                    //	
                    xhr.open("GET", serviceURL, false);
                    xhr.setRequestHeader("check-existence-only", "true");
                    xhr.send();
					//
                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }
			//
            return retValue;
        }
    },
    ////////////////////////////////////////////////////////////////////
    // Creates a new file at the specified path
    // Parameters:
    //      the file parameter must contain the following properties
    //          uri: string value containing the full file path/URI i.e. "c:/foo/bar.html"
    //      it can optionally contain the following properties
    //          contentType: string with the content type  i.e. "text/plain". "text/plain" is assumed if this property is not specified
    //          contents: string containing the file contents. These contents will be saved to the new file.
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              201 - the file was created and contents were saved if they were passed
    //              400 - the file already exists and could not be created
    //              500 - unknown server error occurred
    createFile: {
    	enumerable: false,
    	value: function(file) {
            var retValue = { success:null, status:null };
            if(file && file.uri && file.uri.length) {
                try {
                    var serviceURL = this._prepareServiceURL(this.fileServiceURL, file.uri),
                    	xhr = new XMLHttpRequest();
                    //
                    xhr.open("POST", serviceURL, false);
                    xhr.responseType = "arraybuffer"; 
                    if(file.contentType && file.contentType.length)
                        xhr.setRequestHeader("Content-Type", file.contentType);
                    else
                        xhr.setRequestHeader("Content-Type", "text/plain");

                    if (file.contents)
                        xhr.send(file.contents);
                    else
                      	xhr.send();

                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }

            return retValue;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    // Save contents into an existing file at the specified path
    // Parameters:
    //      the file parameter must contain the following properties
    //          uri: string value containing the full file path/URI i.e. "c:/foo/bar.html"
    //      it can optionally contain the following properties
    //          contentType: string with the content type  i.e. "text/plain". "text/plain" is assumed if this property is not specified
    //          contents: string containing the file contents. These contents will be saved to the new file.
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              204 - the file was saved
    //              404 - the file specified does not exist
    //              500 - unknown server error occurred
    updateFile: {
    	enumerable: false,
    	value: function(file) {
            var retValue = { success:null, status:null };
            if(file && file.uri && file.uri.length && file.contents && file.contents.length) {
                try {
                    var serviceURL = this._prepareServiceURL(this.fileServiceURL, file.uri),
                    	xhr = new XMLHttpRequest();
                    //
                    xhr.open("PUT", serviceURL, false);
                    if(file.contentType && file.contentType.length)
                        xhr.setRequestHeader("Content-Type", file.contentType);
                    else
                        xhr.setRequestHeader("Content-Type", "text/plain");

                    xhr.send(file.contents);

                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }

            return retValue;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    // Copies a file from one location to another
    // Parameters:
    //      the file parameter must contain the following properties
    //          sourceUri: string value containing the full file path/URI to copy from i.e. "c:/foo/bar.html"
    //          destUri: string containing the full path/URI to copy to
    //      it can optionally contain the following properties
    //          overwriteDestination: bool indicating whether it is okay to overwrite the file specified at destUri if it already exists
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              204 - the file was copied
    //              404 - the file specified in sourceUri does not exist
    //              500 - unknown server error occurred
    copyFile: {
    	enumerable: false,
    	value: function(file) {
            var retValue = { success:null, status:null };
            if(file && file.sourceUri && file.sourceUri.length && file.destUri && file.destUri.length) {
                try {
                    var serviceURL = this._prepareServiceURL(this.fileServiceURL, file.destUri),
                    	xhr = new XMLHttpRequest();
                    //
                    xhr.open("PUT", serviceURL, false);
                    xhr.setRequestHeader("sourceURI", file.sourceUri);
					//
                    if(file.overwriteDestination && file.overwriteDestination === true) {
                        xhr.setRequestHeader("overwrite-destination", "true");
                    }
					//
                    xhr.send();
					//
                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }
			//
            return retValue;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    // Moves a file from one location to another
    // Parameters:
    //      the file parameter must contain the following properties
    //          sourceUri: string value containing the full file path/URI to copy from i.e. "c:/foo/bar.html"
    //          destUri: string containing the full path/URI to copy to
    //      it can optionally contain the following properties
    //          overwriteDestination: bool indicating whether it is okay to overwrite the file specified at destUri if it already exists
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              204 - the file was moved
    //              404 - the file specified in sourceUri does not exist
    //              500 - unknown server error occurred
    moveFile: {
    	enumerable: false,
    	value: function(file) {
            var retValue = { success:null, status:null };
            if(file && file.sourceUri && file.sourceUri.length && file.destUri && file.destUri.length) {
                try {
                    var serviceURL = this._prepareServiceURL(this.fileServiceURL, file.destUri),
                    	xhr = new XMLHttpRequest();
                    //
                    xhr.open("PUT", serviceURL, false);
                    xhr.setRequestHeader("sourceURI", file.sourceUri);
                    xhr.setRequestHeader("delete-source", "true");
					//
                    if(file.overwriteDestination && file.overwriteDestination === true) {
                        xhr.setRequestHeader("overwrite-destination", "true");
                    }
					//
                    xhr.send();
					//
                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }
			//
            return retValue;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    // Deletes an existing file
    // Parameters:
    //      the file parameter must contain the following properties
    //          uri: string value containing the full file path/URI i.e. "c:/foo/bar.html"
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              204 - the file was deleted
    //              404 - the file does not exist
    //              500 - unknown server error occurred
    deleteFile: {
    	enumerable: false,
    	value: function(file) {
            var retValue = { success:null, status:null };
            if(file && file.uri && file.uri.length) {
                try {
                    var serviceURL = this._prepareServiceURL(this.fileServiceURL, file.uri),
                    	xhr = new XMLHttpRequest();
                    //
                    xhr.open("DELETE", serviceURL, false);
                    xhr.send();
					//
                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }
			//
            return retValue;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    // Reads an existing file
    // Parameters:
    //      the file parameter must contain the following properties
    //          uri: string value containing the full file path/URI i.e. "c:/foo/bar.html"
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      content: string containing the file contents
    //      status: int indicating the request HTTP status code
    //              200 - the file was read and its contents were returned
    //              404 - the file does not exist
    //              500 - unknown server error occurred
    readFile: {
    	enumerable: false,
    	value: function(file) {
    		//
            var retValue = { success:null, content:null, status:null};
            //
            if(file && file.uri && file.uri.length) {
                try {
                    var serviceURL = this._prepareServiceURL(this.fileServiceURL, file.uri),
                    	xhr = new XMLHttpRequest();
                    //
                    xhr.open("GET", serviceURL, false);
                    xhr.send();
					//
                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        if(xhr.status == 200) {
                            retValue.content = xhr.responseText;
                        }
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }
			//
            return retValue;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    // Create a new directory/folder
    // Parameters:
    //      the dir parameter must contain the following properties
    //          uri: string value containing the full file path/URI i.e. "c:/dir/subdir"
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              201 - the directory was created
    //              400 - the directory was unable to be created
    //              500 - unknown server error occurred
    createDirectory: {
    	enumerable: false,
    	value: function(dir) {
            var retValue = { success:null, status:null };
            if(dir && dir.uri && dir.uri.length) {
                try {
                    var serviceURL = this._prepareServiceURL(this.directoryServiceURL, dir.uri),
                    	xhr = new XMLHttpRequest();
                    //
                    xhr.open("POST", serviceURL, false);
                    xhr.send();
					//
                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }
			//
            return retValue;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    // Delete a directory/folder
    // Parameters:
    //      the dir parameter must contain the following properties
    //          uri: string value containing the full file path/URI i.e. "c:/dir/subdir"
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              204 - the directory was deleted
    //              404 - the directory does not exist
    //              500 - unknown server error occurred
    deleteDirectory: {
    	enumerable: false,
    	value: function(dir) {
            var retValue = { success:null, status:null };
            if(dir && dir.uri && dir.uri.length) {
                try {
                    var serviceURL = this._prepareServiceURL(this.directoryServiceURL, dir.uri),
                    	xhr = new XMLHttpRequest();
                    //
                    xhr.open("DELETE", serviceURL, false);
                    xhr.send();
					//
                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }
			//
            return retValue;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    // List the contents of a directory/folder
    // Parameters:
    //      the dir parameter must contain the following properties
    //          uri: string value containing the full file path/URI i.e. "c:/dir/subdir"
    //          recursive: boolean true to list contents of all subdirectories as well. if this is not specified "false" is the default.
    //          returnType: string "all", "files", "directories". Specifies the types to return. if this is not specified, the default is "all"
    //          fileFilters: string containing the file extensions to include in the return listing. This list is semi-colon separated. i.e. "xml;html"
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      content: string containing the JSON structure of the file contents
    //      status: int indicating the request HTTP status code
    //              200 - the directory was read and the content JSON string was returned in dir.content
    //              404 - the directory does not exist
    //              500 - unknown server error occurred
    getDirectoryContents: {
    	enumerable: false,
    	value: function(dir) {
            var retValue = { success:null, content:null, status:null };
            if(!!dir && (typeof dir.uri !== "undefined") && (dir.uri !== null) ) {
                try {
                    var serviceURL = this._prepareServiceURL(this.directoryServiceURL, dir.uri),
                    	xhr = new XMLHttpRequest();
                    //
                    xhr.open("GET", serviceURL, false);
					//
                    if(dir.recursive) {
                        xhr.setRequestHeader("recursive", dir.recursive.toString());
                    }

                    //
                    if (dir.fileFilters) {
                        xhr.setRequestHeader("file-filters", dir.fileFilters.toString());
                    }
					//

                    //
                    if(dir.returnType) {
                        xhr.setRequestHeader("return-type", dir.returnType.toString());
                    }
					//
                    xhr.send();
					//
                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        if(xhr.status == 200) {
                            retValue.content = xhr.responseText;
                        }
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }
			//
            return retValue;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    // Check if a directory/folder exists
    // Parameters:
    //      the dir parameter must contain the following properties
    //          uri: string value containing the full file path/URI i.e. "c:/dir/subdir"
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              204 - the directory exists
    //              404 - the directory does not exist
    //              500 - unknown server error occurred
    directoryExists: {
    	enumerable: false,
    	value: function(dir) {
            var retValue = { success:null, content:null, status:null };
            if(dir && dir.uri && dir.uri.length) {
                try {
                    var serviceURL = this._prepareServiceURL(this.directoryServiceURL, dir.uri),	
                    	xhr = new XMLHttpRequest();
                    //
                    xhr.open("GET", serviceURL, false);
                    xhr.setRequestHeader("check-existence-only", "true");
					//
                    xhr.send();
					//
                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }
			//
            return retValue;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    // copies an existing directory/folder to a new location
    // Parameters:
    //      the dir parameter must contain the following properties
    //          sourceUri: string value containing the full file path/URI to copy from i.e. "c:/foo/bar"
    //          destUri: string containing the full path/URI to copy to
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              204 - the operation succeeded
    //              400 - the operation could not be performed because the destUri existed
    //              404 - the source directory does not exist
    //              500 - unknown server error occurred
    copyDirectory: {
    	enumerable: false,
    	value: function(dir) {
            return this._copyMoveDirHelper(dir.sourceUri, dir.destUri, "copy");
    	}
    },
    ////////////////////////////////////////////////////////////////////
    // Moves an existing directory/folder to a new location
    // Parameters:
    //      the dir parameter must contain the following properties
    //          sourceUri: string value containing the full file path/URI to copy from i.e. "c:/foo/bar"
    //          destUri: string containing the full path/URI to move to
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              204 - the operation succeeded
    //              400 - the operation could not be performed because the destUri existed
    //              404 - the source directory does not exist
    //              500 - unknown server error occurred
    moveDirectory: {
    	enumerable: false,
    	value: function(dir) {
            return this._copyMoveDirHelper(dir.sourceUri, dir.destUri, "move");
    	}
    },
    ////////////////////////////////////////////////////////////////////
    // Moves an existing directory/folder to a new location
    // Parameters:
    //      the dir parameter must contain the following properties
    //          sourceUri: string value containing the full file path/URI to copy from i.e. "c:/foo/bar"
    //          newDirectoryName: string containing the new name of the directory i.e. "bar2"
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              204 - the operation succeeded
    //              400 - the operation could not be performed because the destUri existed
    //              404 - the source directory does not exist
    //              500 - unknown server error occurred
    renameDirectory: {
    	enumerable: false,
    	value: function(dir) {
            return this._copyMoveDirHelper(dir.sourceUri, dir.sourceUri + "/" + dir.newDirectoryName, "move");
    	}
    },
	////////////////////////////////////////////////////////////////////
    //Helper that is used by copyDirectory, moveDirectory, renameDirectory
    _copyMoveDirHelper: {
    	enumerable: false,
    	value: function(sourceDir, destDir, operation) {
    		var retValue = {};
            if(sourceDir && sourceDir.length && destDir && destDir.length && operation && operation.length) {
                try {
                    var serviceURL = this._prepareServiceURL(this.directoryServiceURL, destDir),
                    	xhr = new XMLHttpRequest();
                    //
                    xhr.open("PUT", serviceURL, false);
                    xhr.setRequestHeader("sourceURI", sourceDir);
                    xhr.setRequestHeader("operation", operation);
					//
                    xhr.send();
					//
                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }
			//
            return retValue;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    // Checks if the file has been modified since it was last queried
    // Parameters:
    //      the file parameter must contain the following properties
    //          uri: string value containing the full file path/URI i.e. "c:/foo/bar.html"
    //          recursive: boolean true to check the modified date of all subdirectories as well. if this is not specified "false" is the default.
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              200 - the file has been modified
    //              304 - the file has not been modified
    //              404 - the file does not exist
    //              500 - unknown server error occurred

    isFileModified:{
        enumerable:true,
        writable:false,
        value:function(file, lastQueriedTimestamp){
            var retValue = { success:null, status:null };
            if(file && file.uri && (typeof lastQueriedTimestamp !== "undefined")) {
                try {
                    var serviceURL = this._prepareServiceURL(this.fileServiceURL, file.uri),
                    xhr = new XMLHttpRequest();
                    xhr.open("GET", serviceURL, false);
                    xhr.setRequestHeader("if-modified-since", lastQueriedTimestamp);
                    xhr.send();
                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }
            return retValue;
        }
    },

    ////////////////////////////////////////////////////////////////////
    // Checks if the directory content has been modified since it was last queried
    // Parameters:
    //      the file parameter must contain the following properties
    //          uri: string value containing the full directory path/URI i.e. "c:/foo/bar.html"
    //          recursive: boolean true to check the modified date of all subdirectories as well. if this is not specified "false" is the default.
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              200 - the file has been modified
    //              304 - the file has not been modified
    //              404 - the file does not exist
    //              500 - unknown server error occurred

    isDirectoryModified:{
        enumerable:true,
        writable:false,
        value:function(file, lastQueriedTimestamp){
            var retValue = { success:null, status:null };
            if(file && file.uri && (typeof lastQueriedTimestamp !== "undefined")) {
                try {
                    var serviceURL = this._prepareServiceURL(this.directoryServiceURL, file.uri),
                    xhr = new XMLHttpRequest();
                    xhr.open("GET", serviceURL, false);
                    xhr.setRequestHeader("if-modified-since", lastQueriedTimestamp);
                    xhr.send();
                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }
            return retValue;
        }
    },

    ////////////////////////////////////////////////////////////////////
    // Checks if the file is writable
    // Parameters:
    //      the file parameter must contain the following properties
    //          uri: string value containing the full file path/URI i.e. "c:/foo/bar.html"
    //
    // Return values:
    //    returns an object with two properties
    //      success: boolean indicating if the call succeeded or failed
    //      status: int indicating the request HTTP status code
    //              204 -  The file exists and response body has writable flag
    //              404 - the file does not exist
    //              500 - unknown server error occurred
    isFileWritable:{
        enumerable:true,
        writable:false,
        value:function(file){
            var retValue = { success:null, status:null };
            if(file && file.uri) {
                try {
                    var serviceURL = this._prepareServiceURL(this.fileServiceURL, file.uri),
                    xhr = new XMLHttpRequest();
                    xhr.open("GET", serviceURL, false);
                    xhr.setRequestHeader("get-file-info", "true");
                    xhr.send();
                    if (xhr.readyState === 4) {
                        retValue.status = xhr.status;
                        if(xhr.status == 200) {
                            retValue.content = xhr.responseText;
                        }
                        retValue.success = true;
                    }
                }
                catch(error) {
                    xhr = null;
                    retValue.success = false;
                }
            }
            return retValue;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
	getCloudStatus: {
        enumerable: false,
        writable:false,
        value: function() {
        	//
            var retValue = {success:null, status:null};
            //
            try {
           		var serviceURL = this._prepareServiceURL(this.apiServiceURL, '/'),
           			xhr = new XMLHttpRequest();
               	//
            	xhr.open("GET", serviceURL, false);
              	xhr.send();
				//
               	if (xhr.readyState === 4) {
                 	retValue.status = xhr.status;
                 	retValue.response = JSON.parse(xhr.response);
                  	retValue.success = true;
               	}
           	}
            catch(error) {
           		xhr = null;
              	retValue.success = false;
            }
			//
            return retValue;
        }
    },

    /***
     * checks for valid uri pattern
     * also flags if Windows uri pattern and Unix uri patterns are mixed
     * Todo: need to augment when files can be accessed via other protocols like http, ftp, ssh, etc.
     */
    isValidUri:{
        value: function(uri){
            var isWindowsUri=false, isUnixUri=false,status=false;
            if(uri !== ""){
                uri = uri.replace(/^\s+|\s+$/g,"");  // strip any leading or trailing spaces

                //for local machine folder uri
                isWindowsUri = /^([a-zA-Z]:)(\\[^<>:"/\\|?*]+)*\\?$/gi.test(uri);
                isUnixUri = /^(\/)?(\/(?![.])[^/]*)*\/?$/gi.test(uri);//folders beginning with . are hidden on Mac / Unix
                status = isWindowsUri || isUnixUri;
                if(isWindowsUri && isUnixUri){status = false;}
            }
            return status;
        }
    },

	////////////////////////////////////////////////////////////////////
    /***
     * check if the file exists
     */
    checkFileExists:{
        value: function(fileName, folderUri, fileType){
            var uri = "", response=null, status=true;

            //prepare absolute uri
            if(/[^/\\]$/g.test(folderUri)){
                folderUri = folderUri + "/";
            }

            if(!!fileType && (fileName.lastIndexOf(fileType) !== (fileName.length - fileType.length))){
                fileName = fileName+fileType;
            }

            uri = ""+folderUri+fileName;

            response = this.fileExists({"uri":uri});
            if(!!response && response.success && (response.status === 204)){
                status = true;
            }else if(!!response && response.success && (response.status === 404)){
                status = false;
            }else{
                status = false;
            }
            return status;
        }
    }
	////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////