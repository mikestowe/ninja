/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage =       require("montage/core/core").Montage,
    Component =     require("montage/ui/component").Component,
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
            if((typeof this.currentDocument !== "undefined") && this.application.ninja.coreIoApi.cloudAvailable()){
                saveAsSettings.fileName = this.currentDocument.model.file.name;
                saveAsSettings.folderUri = this.currentDocument.model.file.uri.substring(0, this.currentDocument.model.file.uri.lastIndexOf("/"));
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
            if(this.currentDocument && this.application.ninja.coreIoApi.cloudAvailable()){
                while(this.currentDocument.length > 0){
                    this.closeDocument(this.currentDocument[this.currentDocument.length -1].uuid);
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
            this.currentDocument.model.file.name = ""+filename;
            //prepare new file uri
            if(destination && (destination.charAt(destination.length -1) !== "/")){
                destination = destination + "/";
            }
            fileUri = destination+filename;

            this.currentDocument.model.file.uri = fileUri;
            //save a new file
            //use the ioMediator.fileSaveAll when implemented
            this.currentDocument.model.file.name = filename;
            this.currentDocument.model.file.uri = fileUri;
            this.currentDocument.model.save();
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
