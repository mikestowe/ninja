/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 		require("montage/core/core").Montage,
    Component = 	require("montage/ui/component").Component,
    HTMLDocument =  require("js/document/document-html").HtmlDocument,
    TextDocument =  require("js/document/document-text").TextDocument;
////////////////////////////////////////////////////////////////////////
//
exports.DocumentController = Montage.create(Component, {
	//
    hasTemplate: {
        value: false
    },

    iframeContainer: {
        value: null
    },

    codeContainer: {
        value: null
    },

    documents: {
        value: []
    },

    _currentDocument: {
            value : null
    },

    currentDocument : {
        get : function() {
            return this._currentDocument;
        },
        set : function(value) {
            if (value === this._currentDocument) {
                return;
            }

            if(this._currentDocument) {
                this._currentDocument.model.currentView.hide();
            }

            this._currentDocument = value;

            if(!value) {
                document.getElementById("iframeContainer").style.display = "block";
                document.getElementById("codeViewContainer").style.display = "block";
            } else if(this._currentDocument.currentView === "design") {
                document.getElementById("codeViewContainer").style.display = "none";
                document.getElementById("iframeContainer").style.display = "block";
                this._currentDocument.model.currentView.show();
                this._currentDocument.model.views.design._liveNodeList = this._currentDocument.model.documentRoot.getElementsByTagName('*');
            } else {
                document.getElementById("iframeContainer").style.display = "none";
                this._currentDocument.model.parentContainer.style["display"] = "block";
                this._currentDocument.model.currentView.show();
            }

        }
    },

    deserializedFromTemplate: {
        value: function() { //TODO: Add event naming consistency (save, fileOpen and newFile should be consistent, all file events should be executeFile[operation name])
            this.eventManager.addEventListener("appLoaded", this, false);
            this.eventManager.addEventListener("executeFileOpen", this, false);
            this.eventManager.addEventListener("executeNewFile", this, false);
            this.eventManager.addEventListener("executeSave", this, false);
            this.eventManager.addEventListener("executeSaveAs", this, false);
            this.eventManager.addEventListener("executeSaveAll", this, false);
            this.eventManager.addEventListener("executeFileClose", this, false);
            this.eventManager.addEventListener("executeFileCloseAll", this, false);
        }
    },

    didCreate: {
        value: function() {
            this.iframeContainer = document.getElementById("iframeContainer");
            this.codeContainer = document.getElementById("codeViewContainer");
        }
    },

	//TODO: Ensure these APIs are not needed
	redirectRequests: {
    	value: false
    },
	////////////////////////////////////////////////////////////////////
	//
    handleWebRequest: {
    	value: function (request) {
    		//TODO: Check if frameId is proper
    		if (this.redirectRequests && request.parentFrameId !== -1) {
    			//Checking for proper URL redirect (from different directories)
    			if (request.url.indexOf('js/document/templates/banner') !== -1) {
					return {redirectUrl: this.application.ninja.coreIoApi.rootUrl+this.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1]+request.url.split(chrome.extension.getURL('js/document/templates/banner/'))[1]};
				} else if (request.url.indexOf('js/document/templates/html')  !== -1) {
					return {redirectUrl: this.application.ninja.coreIoApi.rootUrl+this.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1]+request.url.split(chrome.extension.getURL('js/document/templates/html/'))[1]};
				} else if (request.url.indexOf('js/document/templates/app')  !== -1) {
					return {redirectUrl: this.application.ninja.coreIoApi.rootUrl+this.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1]+request.url.split(chrome.extension.getURL('js/document/templates/app/'))[1]};
				} else {
					//Error, not a valid folder
				}
			}
		}
    },
    ////////////////////////////////////////////////////////////////////
	//
    handleAppLoaded: {
        value: function() {
            //Checking for app to be loaded through extension
            var check;
            if (chrome && chrome.app) {
            	check = chrome.app.getDetails();
            }
            if (check !== null) {
            	//Adding an intercept to resources loaded to ensure user assets load from cloud simulator
            	chrome.webRequest.onBeforeRequest.addListener(this.handleWebRequest.bind(this), {urls: ["<all_urls>"]}, ["blocking"]);
            }
        }
    },
	////////////////////////////////////////////////////////////////////


    handleExecuteFileOpen: {
        value: function(event) {
            var pickerSettings = event._event.settings || {};
            if (this.application.ninja.coreIoApi.cloudAvailable()) {
                pickerSettings.callback = this.openFileWithURI.bind(this);
                pickerSettings.pickerMode = "read";
                pickerSettings.inFileMode = true;
                this.application.ninja.filePickerController.showFilePicker(pickerSettings);
            }
        }
    },

    handleExecuteNewFile: {
        value: function(event) {
            var newFileSettings = event._event.settings || {};
            if (this.application.ninja.coreIoApi.cloudAvailable()) {
                newFileSettings.callback = this.createNewFile.bind(this);
                this.application.ninja.newFileController.showNewFileDialog(newFileSettings);
            }
        }
    },
	////////////////////////////////////////////////////////////////////
	//
    handleExecuteSave: {
    	value: function(event) {
    		//
    		if((typeof this.currentDocument !== "undefined") && this.application.ninja.coreIoApi.cloudAvailable()){
    			//Currently we don't need a callback handler
    			//this.activeDocument.model.save(this.saveExecuted.bind(this));
    			this.currentDocument.model.save();
    		} else {
    			//Error: cloud not available and/or no active document
    		}
		}
    },
    ////////////////////////////////////////////////////////////////////
	//
    saveExecuted: {
    	value: function (value) {
    		//File saved, any callbacks or events should go here (must be added in handleExecuteSave passed as callback)
    	}
    },
    ////////////////////////////////////////////////////////////////////
	//TODO: Check for appropiate structures
    handleExecuteSaveAll: {
    	value: function(event) {
           //
    		if((typeof this.currentDocument !== "undefined") && this.application.ninja.coreIoApi.cloudAvailable()){
    			//
    			this.currentDocument.model.saveAll();
    		} else {
    			//TODO: Add error handling
    		}
		}
    },
    ////////////////////////////////////////////////////////////////////
    handleExecuteSaveAs: {
        value: function(event) {
            var saveAsSettings = event._event.settings || {};
            if((typeof this.activeDocument !== "undefined") && this.application.ninja.coreIoApi.cloudAvailable()){
                saveAsSettings.fileName = this.activeDocument.model.file.name;
                saveAsSettings.folderUri = this.activeDocument.model.file.uri.substring(0, this.activeDocument.model.file.uri.lastIndexOf("/"));
                saveAsSettings.callback = this.saveAsCallback.bind(this);
                this.application.ninja.newFileController.showSaveAsDialog(saveAsSettings);
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    handleExecuteFileClose:{
        value: function(event) {
            this.closeFile(this.currentDocument);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //TODO: Is this used, should be cleaned up
    handleExecuteFileCloseAll:{
		value: function(event) {
			if(this.activeDocument && this.application.ninja.coreIoApi.cloudAvailable()){
				while(this._documents.length > 0){
					this.closeDocument(this._documents[this._documents.length -1].uuid);
				}
			}
		}
	},
	////////////////////////////////////////////////////////////////////
	//
    createNewFile:{
        value:function(newFileObj){
            //
            if(!newFileObj) return;
            //
            this.application.ninja.ioMediator.fileNew(newFileObj.newFilePath, newFileObj.fileTemplateUri, this.openNewFileCallback.bind(this), newFileObj.template);
        }
    },
	////////////////////////////////////////////////////////////////////
	
    /**
     * Public method
     * doc contains:
     *      type : file type, like js, css, etc
     *      name : file name
     *      source : file content
     *      uri : file uri
     */
    openNewFileCallback:{
        value:function(doc){
            var response = doc || null;//default just for testing
            if(!!response && response.success && (response.status!== 500) && !!response.uri){

                this.isNewFilePath = true;//path identifier flag
                this.creatingNewFile = true;//flag for timeline to identify new file flow

                this.application.ninja.ioMediator.fileOpen(response.uri, this.openFileCallback.bind(this));
            } else if(!!response && !response.success){
                //Todo: restrict directory path to the sandbox, in the dialog itself
                alert("Unable to create file.\n [Error: Forbidden directory]");
            }
        }
    },

    openFileWithURI: {
        value: function(uriArrayObj) {
            var uri = "", fileContent = "", response=null, filename="", fileType="js";
            if(!!uriArrayObj && !!uriArrayObj.uri && (uriArrayObj.uri.length > 0)){
                uri = uriArrayObj.uri[0];
            }
            //console.log("URI is: ", uri);
            if(!!uri){
                this.application.ninja.ioMediator.fileOpen(uri, this.openFileCallback.bind(this));
            }
        }
    },

    ////////////////////////////////////////////////////////////////////
    //
    openFileCallback:{
        value:function(response){
            //TODO: Add UI to handle error codes, shouldn't be alert windows
            if(!!response && (response.status === 204)) {

                if((typeof this.isNewFilePath === 'undefined') || (this.isNewFilePath !== true)){//not from new file flow
                    this.creatingNewFile = false;
                }
                this.isNewFilePath = false;//reset path identifier flag

            	//Sending full response object
                this.openDocument(response);

            } else if (!!response && (response.status === 404)){
                alert("Unable to open file.\n [Error: File does not exist]");
            } else if (!!response && (response.status === 500)){
                alert("Unable to open file.\n Check if Ninja Local Cloud is running.");
            } else{
                alert("Unable to open file.");
            }

        }
    },
	////////////////////////////////////////////////////////////////////
	//
    saveAsCallback:{
        value:function(saveAsDetails){
            var fileUri = null, filename = saveAsDetails.filename, destination = saveAsDetails.destination;
            //update document metadata
            this.activeDocument.name = ""+filename;
            //prepare new file uri
            if(destination && (destination.charAt(destination.length -1) !== "/")){
                destination = destination + "/";
            }
            fileUri = destination+filename;

            this.activeDocument.uri = fileUri;
            //save a new file
            //use the ioMediator.fileSaveAll when implemented
            this.activeDocument.model.file.name = filename;
            this.activeDocument.model.file.uri = fileUri;
            this.activeDocument.model.save();
        }
    },

    ////////////////////////////////////////////////////////////////////
    openDocument: {
        value: function(file) {
        	var template, dimensions;

            // TODO: HACKS to remove
			this.documentHackReference = file;
            document.getElementById("iframeContainer").style.overflow = "hidden";
			//
			switch (file.extension) {
				case 'html':

                    if (file.content.body.indexOf('Ninja-Banner Dimensions@@@') !== -1) {
                        dimensions = (file.content.body.split('Ninja-Banner Dimensions@@@'))[1].split('-->')[0].split('x');
                        dimensions = {width: parseInt(dimensions[0]), height: parseInt(dimensions[1])};
                        template = {type: 'banner', size: dimensions};
                    }

					//Open in designer view
                    this.redirectRequests = false;
                    Montage.create(HTMLDocument).init(file, this.application.ninja, this.application.ninja.openDocument, 'design', template);
					break;
				default:
                    //Open in code view
                    Montage.create(TextDocument).init(file, this.application.ninja, this.application.ninja.openDocument, 'code');
                    break;
			}
        }
    },
	////////////////////////////////////////////////////////////////////
	
	openProjectWithURI: {
        value: function(uri) {
            console.log("URI is: ", uri);
        }
    },

    closeFile: {
        value: function(document) {
            document.closeDocument(this.application.ninja, this.application.ninja.closeFile);
        }
    }
});
