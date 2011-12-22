/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var FileIo = require("js/io/system/fileio").FileIo,
	ProjectIo = 				require("js/io/system/projectio").ProjectIo,
	ShellApi =					require("js/io/system/shellapi").ShellApi,
	ComponentsPanelBase = 		require("js/panels/Components/ComponentsPanelBase.reel").ComponentsPanelBase;
////////////////////////////////////////////////////////////////////////
//Exporting as File System
exports.FileSystem = (require("montage/core/core").Montage).create(Object.prototype, {
    ////////////////////////////////////////////////////////////////////
    //
    init: {
    	enumerable: false,
    	value: function () {
    		//Called by NinjaMain
    		
    		
    		
    		//Calling Shell API to initialize
    		ShellApi.init();
    	}
    },
    
    shellApiHandler :{
        enumerable:true,
        writable:false,
        value:ShellApi
    },
    
    
    ////////////////////////////////////////////////////////////////////
    //
    cloud: {
    	enumerable: false,
    	value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    cloud: {
    	enumerable: false,
    	get: function() {
            return this._cloud;
        },
        set: function(value) {
        	this._cloud = value
        }
    },
    
    
    
    
    
    
    ////////////////////////////////////////////////////////////////////
    //
    _documentType: {
    	enumerable: false,
    	value: function () {
    		//return DocumentManagerModule.DocumentManager.activeDocument.documentType; // this._documentType()
    	}
    },
    
    
    
    ////////////////////////////////////////////////////////////////////
    //
    newFile: {
    	enumerable: false,
    	value: function (template) {
    		//Checking for cloud (to be added later)
    		if (this.cloud) {
    			//TODO: Add cloud integration
                console.log("[CLOUD] New File");
                //documentManagerModule.DocumentManager.openDocument({"type": "html"});
    		} else {
    			//
	    		var file = {uri: ShellApi.openShellDialog({type: 'file', action: 'new'})}, type;
    			var check = ShellApi.fileExists(file);
    			
    			
    			
    			
    			
    			
    			
    			
    			
    			
    			
    			
    			
    			
    			//TODO: implement createFile to avoid duplicate funtionality
    			if (check.success) {
    				switch (check.status) {
    					case 204:
    						//TODO: Add logic for already existing file
    						window.alert('Error Code 204: File already exists.');
    						break;
    					case 404:
    						//File does not exists, ready to be created
    						
    						
    						//TODO: The type (template) should be sent into this routine via the UI of file I/O (not by file extension as now)
    						if (template) {
    							type = template;
    						} else {
    							type = file.uri.split('.');
    							type = type[type.length-1];
    						}
    						//
    						
    						
    						//TODO: Improve logic
    						//Checking for file to exist in files template folder
    						var templateCheck = ShellApi.fileExists({uri: window.NativeShellApp.GetKnownFolder('appsource')+'\\document-templates\\files\\template.'+type}), content;
    						//
    						if (templateCheck.success) {
    							switch (check.status) {
    								case 204:
    									//Template exists, so opening and getting contents to be used when creating file
    									content = ShellApi.openFile({uri: 'template.'+type});
    									if (content.content) {
    										file.content = content.content;
    									} else {
    										file.content = "";
    									}
    									break;
    								case 404:
    									//No template
    									file.content = "";
    									break;
    								case 500:
    									//Error
    									break;
    								default:
    									//Error
    									break;
    							}
    						} else {
    						
    						}
    						
    						
    						/*
switch (type.toLowerCase()) {
    							case 'html':
    								break;
    							case 'css':
    								break;
    							case 'js':
    								break;
    							case 'xml':
    								break;
    							case 'json':
    								break;
    							default:
    								break;
    						}
*/
    						
    						
    						
    						
    						
    						
    						
    						var create = ShellApi.createFile(file);
    						if (create.success) {
    							switch (create.status) {
    								case 201:
    									//File was created, opening created file
    									this.openFile(file);
    									break;
    								case 400:
    									//TODO: Add error handling
    									//window.alert('Error Code 400: File already exists.');
    									break;
    								case 500:
    									//TODO: Add error handling
    									//window.alert('Error Code 500: An error occurred while creating a new file.');
    									break;
    								default:
    									//TODO: Add error handling
    									//window.alert('Unknown Error: An error occurred while creating a new file.');
    									break;
    							}
    						} else {
    							//window.alert('Unknown Error: An error occurred while creating a new file.');
    						}
    						
    						
    						
    						
    						
    						
    						
    						
    						
    						
    						
    						
    						break;
    					case 500:
    						//TODO: Add error handling
    						//window.alert('Error Code 500: An error occurred while creating a new file.');
    						break;
    					default:
    						//TODO: Add error handling
    						//window.alert('Unknown Error: An error occurred while creating a new file.');
    						break;
    				}
	    		} else {
	    			//TODO: Add error handling
    				//window.alert('Unknown Error: An error occurred while creating a new file.');
    			}
    		}
    		
    	}
    },
    
    
    
    
    
    ////////////////////////////////////////////////////////////////////
    //
    newProject: {
    	enumerable: false,
    	value: function () {	
    		//Checking for cloud (to be added later)
    		if (this.cloud) {
    			//TODO: Add cloud integration
				console.log("[CLOUD] : New Project");
                //documentManagerModule.DocumentManager.openDocument({"type": "html"});
    		} else {
    			//
	    		var directory = {uri: ShellApi.openShellDialog({type: 'directory', action: 'new'})};
    			var check = ShellApi.directoryExists(directory);
    			//
    			if (check.success) {
    				switch (check.status) {
    					case 204:
    						this.createProject(directory);
    						break;
    					case 404:
    						//Directory does not exists, ready to be created
    						var create = ShellApi.createDirectory(directory);
    						if (create.success) {
    							switch (create.status) {
    								case 201:
    									this.createProject(directory);
    									break;
    								case 400:
    									window.alert('Error Code 400: Directory already exists.');
    									break;
    								case 500:
    									window.alert('Error Code 500: An error occurred while creating a new directory.');
    									break;
    								default:
    									window.alert('Unknown Error: An error occurred while creating a new directory.');
    									break;
    							}
    						} else {
    							window.alert('Unknown Error: An error occurred while creating a new directory.');
    						}
    						break;
    					case 500:
    						//TODO: Add error handling
    						window.alert('Error Code 500: An error occurred while creating a new directory.');
    						break;
    					default:
    						//TODO: Add error handling
    						window.alert('Unknown Error: An error occurred while creating a new directory.');
    						break;
    				}
	    		} else {
	    			//TODO: Add error handling
    				window.alert('Unknown Error: An error occurred while creating a new directory.');
    			}
    		}
    	}
    },
    
    
    
    ////////////////////////////////////////////////////////////////////
    //
    createFile: {
    	enumerable: false,
    	value: function (file) {
    		//Checking for file to exist
    		var check = ShellApi.fileExists(file), createdFile = null;
    		//
    		if (check.success) {
    			switch (check.status) {
    				case 204:
    					//TODO: Add logic for already existing file
    					break;
    				case 404:
    					//File does not exists, ready to be created
    					var create = ShellApi.createFile(file);
    					if (create.success) {
    						switch (create.status) {
    							case 201:
    								//File was created
    								createdFile = file;
    								break;
    							case 400:
    								//File already exists
    								createdFile = file;
    								break;
    							case 500:
    								//Error while creating
    								break;
    							default:
    								//TODO: Add error handling
    								break;
    						}
    					} else {
    						//Error creating file via API
    					}
    					break;
    				case 500:
    					//TODO: Add error handling
    					break;
    				default:
    					//TODO: Add error handling
    					break;
    			}
	    	} else {
	    		//TODO: Add error handling
    		}
    		//
    		return createdFile;
    	}
    },
    
    
    
    ////////////////////////////////////////////////////////////////////
    //
    openFile: {
    	enumerable: false,
    	value: function (file) {
    		var uri, i;
    		//Checking for file to defined (otherwise prompts for URI)
    		if (file && file.uri) {
    			uri = file.uri;
    		} else {
    			//Checking to prompt user depending on mode
    			if (this.cloud) {
    				//TODO: Add cloud integration
    			} else {
    				//Getting file URI from native prompt
    				uri = ShellApi.openShellDialog({type: 'file', action: 'open'});
    			}
    		}
    		//Checking for a valid URI
    		if (uri && uri.length>0) {
    			//Checking for URI to be single or array of URIs
    			if (uri.constructor.toString().indexOf('Array') == -1) {
    				//Opening single URI
    				shellOpenFile(uri);
    			} else {
    				//Opening via loop of URIs
    				for (i=0; uri[i]; i++) {
    					shellOpenFile (uri[i]);
    				}		
    			}
       		} else {
       			//No file was selected to be opened, nothing happens
       		}
       		//Opening file via shell
       		function shellOpenFile (f) {
       			//Getting string from file
	       		var doc = ShellApi.openFile({uri: f}), type = f.split('.');
	       		//Splitting to get file extension
	       		type = type[type.length-1];
	       		//TODO: Fix this HACK to generate string
	       		var dir = f.split('\\'), dir_str = '', server;
	       		for (var i=0; i < dir.length-1; i++) {
	       			dir_str += dir[i] + '\\';
	       		}
	       		//Starting an instance of the shell server on directory
	       		server = ShellApi.startServer(dir_str);
    			//Opening file in app
    			FileIo.open(doc, type, f, server);
       		}
    	}
    },
    
    ////////////////////////////////////////////////////////////////////
    //Creating unified method to check for success
    //FOR: Move, Copy, Rename
    directoryMCRCheck: {
    	enumerable: false,
    	value: function (r, code) {
    		//TODO: Add error handling for unsuccessful attempts
    		var outcome;
    		//
    		if (r.success) {
    			//
    			outcome = {};
    			//
    			switch (r.status) {
  					case 204:
  						//Success
    					break;
    				case 400:
    					//Already exists
    					break;
    				case 404:
    					//Source does not exists
    					break;
    				case 500:
    					//Unknonwn
    					break;
    				default:
    					break;
    			}
    		} else {
    			//TODO: Add error handling
    		}
    		//
    		return outcome;
    	}
    },
    
    
    ////////////////////////////////////////////////////////////////////
    //
    createProject: {
    	enumerable: false,
    	value: function (directory) {
    		var mjs_dir = {uri: directory.uri};
    		mjs_dir.uri += '\\m-js';
    		var mjs_check = ShellApi.directoryExists(mjs_dir);
    		//
    		if (mjs_check.success) {
    			switch (mjs_check.status) {
    				case 204:
    					//TODO: Add logic to check for the correct version of m-js
    					break;
    				case 404:
    					//m-js does not exists, ready to be created
    					
    					
    					
    					
    					
    					
    					//Creating m-js folder and copying contents
    					var mjs_folder = ShellApi.createDirectory(mjs_dir);
    					if (mjs_folder.success) {
    						switch (mjs_folder.status) {
    							case 201:
    								//TODO: Add error handling for error on copy sub directories
    								
    								
    								var temp_dir = window.NativeShellApp.GetKnownFolder('appsource')+'\\user-document-templates\\montage-application\\systemio\\new\\project\\montage';
    								var mjs_deps = ShellApi.createDirectory({uri: mjs_dir.uri+'\\deps'});
    								
    								//Folder created, now copying contents
    								var copy_lib 	= ShellApi.copyDirectory({sourceUri: window.NativeShellApp.GetKnownFolder('frameworksource')+'\\lib', destUri: mjs_dir.uri+'\\lib'}),
    									copy_deps 	= ShellApi.copyDirectory({sourceUri: window.NativeShellApp.GetKnownFolder('frameworksource')+'\\deps\\require', destUri: mjs_dir.uri+'\\deps\\require'}),
    									copy_components = ShellApi.copyDirectory({sourceUri: window.NativeShellApp.GetKnownFolder('appsource')+'\\montage-components', destUri: directory.uri+'\\montage-components'});
    								
    								//Checking for lib operation's result
    								if (copy_lib.success) {
    									//Successful copy of directory
    								} else {
    									//Error, checking to see reason for error and this method should handling error state
    									var check_lib = this.directoryMCRCheck(copy_lib, true);
    								}
    								
    								//Checking for deps operation's result
    								if (copy_deps.success) {
    									//Successful copy of directory
    								} else {
    									//Error, checking to see reason for error and this method should handling error state
    									var check_deps = this.directoryMCRCheck(copy_deps, true);
    								}
    								
    								//Checking for components operation's result
    								if (copy_components.success) {
    									//Successful copy of directory
    								} else {
    									//Error, checking to see reason for error and this method should handling error state
    									var check_components = this.directoryMCRCheck(copy_components, true);
    								}
    								
    								var prj_tmplt = window.NativeShellApp.GetKnownFolder('appsource')+'\\document-templates\\projects\\montage';
    								//TODO: Add error handling for file copying, clean up this HACK
    								var copy_packagemjs = ShellApi.copyFile({sourceUri: window.NativeShellApp.GetKnownFolder('frameworksource')+'\\package.json', destUri: mjs_dir.uri+'\\package.json'}),
    									copy_styles = ShellApi.copyFile({sourceUri: prj_tmplt+'\\styles.css', destUri: directory.uri+'\\styles.css'}),
    									copy_appdelegate = ShellApi.copyFile({sourceUri: prj_tmplt+'\\appdelegate.js', destUri: directory.uri+'\\appdelegate.js'}),
    									copy_package = ShellApi.copyFile({sourceUri: prj_tmplt+'\\package.json', destUri: directory.uri+'\\package.json'}),
    									copy_index = ShellApi.copyFile({sourceUri: prj_tmplt+'\\index.html', destUri: directory.uri+'\\index.html'});
    								
    								//
    								this.openProject(directory);
    								
    								
    								
    								
    								break;
    							case 400:
    								//TODO: Add logic to handle already existing copy of m-js
    								break;
    							case 500:
    								//TODO: Add error handling
    								break;
    							default:
    								//TODO: Add error handling
    								break;
    						}
    					} else {
    						//TODO: Add error handling
    					}
    					
    					
    					
    					
    					
    					
    					
    					
    					break;
    				case 500:
    					//TODO: Add error handling
    					break;
    				default:
    					//TODO: Add error handling
    					break;
    			}
	    	} else {
	    		//TODO: Add error handling
    		}
    	}
    },
    
    
    
    ////////////////////////////////////////////////////////////////////
    //
    openProject: {
    	enumerable: false,
    	value: function (directory) {
    		//TODO: Add functionality, this is a HACK
    		
    		
    		
    		
    		
    		var uri, i;
    		//Checking for directory to defined (otherwise prompts for URI)
    		if (directory && directory.uri) {
    			uri = directory.uri;
    		} else {
    			//Checking to prompt user depending on mode
    			if (this.cloud) {
    				//TODO: Add cloud integration
    			} else {
    				//Getting file URI from native prompt
    				uri = ShellApi.openShellDialog({type: 'directory', action: 'open'});
    			}
    		}
    		//Checking for a valid URI
    		if (uri && uri.length>0) {
    			
    			this.openFile({uri: uri+'\\index.html'});
    			
    			
       		} else {
       			//No file was selected to be opened, nothing happens
       		}    		
    		
    		
    		
    		
    		
    	}
    },
    
    
    
    
    
    ////////////////////////////////////////////////////////////////////
    //
    saveFile: {
    	enumerable: false,
    	value: function (f) {
    		//console.log(f);
    		//TODO: Add functionality
    		//console.log('FileSystem: saveFile');
    		//HACK

			////////////////////////////////////////////////////////////////////
			// DEBUG CODE TO TEST WebGL I/O
			//var glData = DocumentManagerModule.DocumentManager.activeDocument.glData;
			//DocumentManagerModule.DocumentManager.activeDocument.glData = glData;
			////////////////////////////////////////////////////////////////////
    		
    		if (f) {
    			var s = ShellApi.updateFile(f);
    		} else {
    			//HACK
				this.saveProject();    		
    		}

    	}
    },
    
    
    
    
    ////////////////////////////////////////////////////////////////////
    //
    saveFileAs: {
    	enumerable: false,
    	value: function () {
    		//TODO: Add functionality
    		//console.log('FileSystem: saveFileAs');
    		//HACK
    		this.saveProject();
    	}
    },
    
    
    
    
    
    ////////////////////////////////////////////////////////////////////
    //
   	saveProject: {
    	enumerable: false,
    	value: function () {
    		//FileIo.save('project');
    		//console.log(DocumentManagerModule.DocumentManager.activeDocument._userComponentSet);
    		//DocumentManagerModule.DocumentManager.activeDocument.server.root
    		
			////////////////////////////////////////////////////////////////////
			// DEBUG CODE TO TEST WebGL I/O
			//var glData = DocumentManagerModule.DocumentManager.activeDocument.glData;
			//DocumentManagerModule.DocumentManager.activeDocument.glData = glData;
			////////////////////////////////////////////////////////////////////

//    		var root = DocumentManagerModule.DocumentManager.activeDocument.server.root;
//
//    		//
//    		var project = ProjectIo.save('montageapp',
//                    DocumentManagerModule.DocumentManager.activeDocument.iframe.id,
//                    DocumentManagerModule.DocumentManager.activeDocument._userComponentSet);
//
//
//
//    		//
//    		var cssSave = this.saveFile({uri: root+'styles.css', contents: project.css});
//    		var htmlSave = this.saveFile({uri: root+'index.html', contents: project.html});
    		
    	}
    },
    
    
    
    
    ////////////////////////////////////////////////////////////////////
    //
   	saveAll: {
    	enumerable: false,
    	value: function () {
    		//TODO: Add functionality
    		//console.log('FileSystem: saveAll');
    		//HACK
    		this.saveProject();
    	}
    },
    
    
    
    
    
    ////////////////////////////////////////////////////////////////////
    //
    closeFile: {
    	enumerable: false,
    	value: function () {
    		//TODO: Add functionality
    		console.log('FileSystem: closeFile');
    	}
    },
    
    
    
    
    
    ////////////////////////////////////////////////////////////////////
    //
   	closeProject: {
    	enumerable: false,
    	value: function () {
    		//TODO: Add functionality
    		console.log('FileSystem: closeProject');
    	}
    }
    
    
    
    
    
    
    
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////