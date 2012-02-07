/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/* /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
NOTES:
	The init function starts up the file system API, and a size must be
	set, no unlimited available as of now.
////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////// */
//
var Montage = require("montage/core/core").Montage;
////////////////////////////////////////////////////////////////////////
//
exports.ChromeApi = Montage.create(Object.prototype, {
	////////////////////////////////////////////////////////////////////
    //Needs size in MBs for fileSystem init
    init: {
    	enumerable: true,
    	value: function(size) {
    		//
    		if (window.webkitRequestFileSystem) {
    			//Current way to init Chrome's fileSystem API
    			window.webkitRequestFileSystem(window.PERSISTENT, size*1024*1024, function (fs) {
    				//Storing reference to instance
    				this.fileSystem = fs;
    				//Dispatching action ready event
    				var readyEvent = document.createEvent("CustomEvent");
            		readyEvent.initEvent('ready', true, true);
            		this.dispatchEvent(readyEvent);
    				//Building data of local Ninja Library
    				this._listNinjaChromeLibrary();
    			}.bind(this), function (e) {return false}); //Returns false on error (not able to init)
    			//
    			return true;
    		} else {
    			//No fileSystem API
    			return false;
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _fileSystem: {
        enumerable: false,
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    fileSystem: {
    	enumerable: false,
    	get: function() {
            return this._fileSystem;
        },
        set: function(value) {
        	this._fileSystem = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    directoryNew: {
    	enumerable: true,
    	value: function() {
    	}
    },
    
    ////////////////////////////////////////////////////////////////////
    //
    directoryDelete: {
    	enumerable: true,
    	value: function(directoryPath, callback) {
    		//
    		this.fileSystem.getDirectory(directoryPath, {}, function(dirEntry) {
    			//
    			dirEntry.removeRecursively(function() {
      				callback(true);
    			});
    		}, function (e) {callback(false)});
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //Returns the directory contents to a callback function
    directoryContents: {
    	enumerable: true,
    	value: function(directory, callback) {
    		//Creating instance of directory reader
    		this.fileSystem.directoryReader = directory.createReader();
    		//Getting directory contents and sending results to callback
    		this.fileSystem.directoryReader.readEntries(function(results) {
    			//Calling callback with results (null if invalid directory)
    			callback(results);
    		}, function (e) {callback(null)});
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    directoryCopy: {
    	enumerable: true,
    	value: function() {
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    directoryRename: {
    	enumerable: true,
    	value: function() {
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    directoryMove: {
    	enumerable: true,
    	value: function() {
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _listNinjaChromeLibrary: {
    	enumerable: false,
        value: function () {
        	function parseLibrary (contents) {
        		//
        		var lib = [];
        		//
        		
        		
        		
        		//Dispatching action ready event
    			var libraryEvent = document.createEvent("CustomEvent");
            	libraryEvent.initEvent('library', true, true);
            	libraryEvent.ninjaChromeLibrary = lib;
            	this.dispatchEvent(libraryEvent);
        	};
        	//
        	this.directoryContents(this.fileSystem.root, parseLibrary.bind(this));
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////   
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////



//window.webkitRequestFileSystem(window.PERSISTENT, 10*1024*1024 /*10MB*/, function (fs) {
				
				
				
				/*
for (var i=1; i<50; i++) {
				fs.root.getDirectory('montage0.0.0.'+i, {}, function(dirEntry) {
    				//
    				 dirEntry.removeRecursively(function() {
      					console.log('Directory removed.');
    				});
    			});
    			}
*/
			
			
			
			
			
			
				//
				/*
var xhr = new XMLHttpRequest(), dir, mjs;
               	//
            	xhr.open("GET", '/ninja-internal/node_modules/descriptor.json', false);
              	xhr.send();
				//
               	if (xhr.readyState === 4) {
               		//
               		mjs = JSON.parse(xhr.response);
          			//
          			if (mjs.version) {
          				//Checking for version to exist
						fs.root.getDirectory('montage'+mjs.version, {}, function(dirEntry) {
							//Already copied, nothing
							console.log('montage'+mjs.version+' has already been created');
						}, function (e) {
							//Not present, should be copied
							createFolder(false, {name: 'montage'+mjs.version});
          					//
               				for (var i in mjs.directories) {
               					createFolder('montage'+mjs.version, mjs.directories[i]);
               				}
               				//
               				
               				
               				for (var j in mjs.files) {
               					
               					var frqst = new XMLHttpRequest();
               					frqst.open("GET", '/ninja-internal/node_modules/montage/'+mjs.files[j], false);
              					frqst.send();
              					
              					if (frqst.readyState === 4) {
               						createFile('montage'+mjs.version+'/'+mjs.files[j], frqst.response);
               					}
               				}
               				
               				//
               				console.log('montage'+mjs.version+' was created');
						}, folderError);
               		}
               		
			    }
			   	//
			   	function createFile (path, content) {
			   		//
			   		fs.root.getFile(path, {create: true}, function(fileEntry) {
						//
						fileEntry.createWriter(function(fileWriter) {
							//
							//console.log(path);
							var bb = new window.WebKitBlobBuilder;
               				bb.append(content);
               				fileWriter.write(bb.getBlob('text/plain'));
						}, fileError);
					
					}, fileError);
			   	}
			    //
			    function createFolder(root, folder) {
			    	if (folder.name) {
			    		if (root) {
			    			dir = root+'/'+folder.name;
			    		} else {
			    			dir = folder.name;
			    		}
			    		//
			    		//console.log(dir);
			    		//
			    		fs.root.getDirectory(dir, {create: true}, function(dirEntry) {
			    			//
			    		}, folderError);
			    	}
			    	//
			    	if (folder.children) {
			    		for (var i in folder.children) {
			    			if (root) {
			    				createFolder(root+'/'+folder.name, folder.children[i]);
			    			} else {
			    				createFolder(folder.name, folder.children[i]);
			    			}
			    		}
			    	}
			    }
			    //
			    function folderError (e) {
			    	console.log(e);
			    }
			    function fileError (e) {
			    	console.log(e);
			    }
			    
			    
			    setTimeout( function () {
			    for (var m in mjs.files) {
								
					fs.root.getFile('montage'+mjs.version+'/'+mjs.files[m], {}, function(fileEntry) {
						
						console.log(mjs.files[m]);
						
						fileEntry.file(function(file) {
						
							var reader = new FileReader();
							reader.onloadend = function(e) {
         						//console.log(e.target.file.name);
         						var test = this.createFile({uri: '/Users/kgq387/Desktop/Ninja Cloud/Disk/'+e.target.file.name, contents: e.target.result});
      		 				}.bind(this);
							
							reader.file = file;
       						reader.readAsText(file);
							
						}.bind(this));
						
					}.bind(this));
				
				}}.bind(this), 5000);
*/
			    
			    
			    
			    
			    
			//}.bind(this));
			
			
			
			
			
			
			
			////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////
			//TODO: Remove, this is only for testing
		
			
			/*
window.webkitRequestFileSystem(window.PERSISTENT, 10*1024*1024 , function (fs) {
				
				
				var start = new Date().getTime();
				
				for (var i=0; i<250; i++) {
					
					fs.root.getFile('test'+i+'.txt', {create: true}, function(fileEntry) {
					
						fileEntry.createWriter(function(fileWriter) {
						
						
							var xhr = new XMLHttpRequest();
               				//
            				xhr.open("GET", '/ninja-internal/js/io/templates/descriptor.json', false);
              				xhr.send();
							//
               				if (xhr.readyState === 4) {
               					var bb = new window.WebKitBlobBuilder;
               					bb.append(xhr.response);
               					fileWriter.write(bb.getBlob('text/plain'));
			               	}
      							
						});
					
					});
				
				}
				
				var end = new Date().getTime();
				var time = end - start;
				console.log('Create execution time: ' + time);
				
				start = new Date().getTime();
				
				for (var j=0; j<250; j++) {
				
					fs.root.getFile('test'+j+'.txt', {create: true}, function(fileEntry) {
						
						
						
						fileEntry.file(function(file) {
						
							var reader = new FileReader();
							reader.onloadend = function(e) {
         						//console.log(this, e.target);
         						var test = this.createFile({uri: '/Users/kgq387/Desktop/Ninja Cloud/Disk/'+e.target.file.name, contents: e.target.result});
         						console.log(e.target.file.name);
         						
      		 				}.bind(this);
							
							reader.file = file;
       						reader.readAsText(file);
							
						}.bind(this));
						
					}.bind(this));
				
				}
				
				
				end = new Date().getTime();
				time = end - start;
				console.log('Read execution time: ' + time);
				
				for (var k=0; k<250; k++) {
					
					fs.root.getFile('test'+k+'.txt', {create: true}, function(fileEntry) {
					
						fileEntry.remove(function(fileWriter) {
						
							      							
						});
					
					});
				
				}
				
				
				
			}.bind(this));
*/