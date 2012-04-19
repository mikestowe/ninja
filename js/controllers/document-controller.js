/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 		require("montage/core/core").Montage,
    Component = 	require("montage/ui/component").Component,
    Uuid = 			require("montage/core/uuid").Uuid,
    HTMLDocument =	require("js/document/html-document").HTMLDocument,
    TextDocument =	require("js/document/text-document").TextDocument;
////////////////////////////////////////////////////////////////////////
//
var DocumentController = exports.DocumentController = Montage.create(Component, {
    hasTemplate: {
        value: false
    },

    webTemplate: {
        value: false
    },

    _documents: {
        value: []
    },
    
    _hackRootFlag: {
    	value: false
    },

    _activeDocument: { value: null },
    _iframeCounter: { value: 1, enumerable: false },
    _iframeHolder: { value: null, enumerable: false },
    _textHolder: { value: null, enumerable: false },
    _codeMirrorCounter: {value: 1, enumerable: false},
    
    activeDocument: {
        get: function() {
            return this._activeDocument;
        },
        set: function(doc) {
            if(!!this._activeDocument){ this._activeDocument.isActive = false;}
            this._activeDocument = doc;
            if(!!this._activeDocument){
                if(this._documents.indexOf(doc) === -1) this._documents.push(doc);
                this._activeDocument.isActive = true;

                if(!!this._activeDocument.editor){
                    this._activeDocument.editor.focus();
                }
            }
        }
    },

    deserializedFromTemplate: {
        value: function() {
            this.eventManager.addEventListener("appLoaded", this, false);
            this.eventManager.addEventListener("executeFileOpen", this, false);
            this.eventManager.addEventListener("executeNewFile", this, false);
            this.eventManager.addEventListener("executeSave", this, false);
            this.eventManager.addEventListener("executeSaveAs", this, false);
            this.eventManager.addEventListener("executeSaveAll", this, false);
            this.eventManager.addEventListener("executeFileClose", this, false);
            this.eventManager.addEventListener("executeFileCloseAll", this, false);

            this.eventManager.addEventListener("styleSheetDirty", this, false);
            
            this.eventManager.addEventListener("addComponentFirstDraw", this, false);

            // Temporary add listeners for the new stage templates
            this.eventManager.addEventListener("executeWebpageOpen", this, false);
            this.eventManager.addEventListener("executeNewWebpage", this, false);
        }
    },
    
    handleAddComponentFirstDraw: {
    	value: function (e) {
    		//TODO: Add logic to reparse the document for dynamically added styles
    		//console.log(e);
    	}
    },
    
    			
    			
    			

////////////////////////////////////////////////////////////////////
	//
    handleWebRequest: {
    	value: function (request) {
    		//TODO: Check if frameId is proper
    		if (this._hackRootFlag && request.parentFrameId !== -1) {
    			//TODO: Optimize creating string
    			//console.log(request);
    			//console.log(this.application.ninja.coreIoApi.rootUrl+this.application.ninja.documentController.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1], request.url);
				//return {redirectUrl: this.application.ninja.coreIoApi.rootUrl+this.application.ninja.documentController.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1]+request.url.split('/')[request.url.split('/').length-1]};
				return {redirectUrl: this.application.ninja.coreIoApi.rootUrl+this.application.ninja.documentController.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1]+request.url.split(chrome.extension.getURL('js/document/templates/montage-html/'))[1]};
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

    handleExecuteWebpageOpen: {
        value: function(event) {
            this.webTemplate = true;
            this.handleExecuteFileOpen(event);
        }
    },

    handleExecuteNewWebpage: {
        value: function(event) {
            this.webTemplate = true;
            this.handleExecuteNewFile(event);
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
	//TODO: Check for appropiate structures
    handleExecuteSave: {
    	value: function(event) {
            if((typeof this.activeDocument !== "undefined") && this.application.ninja.coreIoApi.cloudAvailable()){
                //Text and HTML document classes should return the same save object for fileSave
                this.application.ninja.ioMediator.fileSave(this.activeDocument.save(), this.fileSaveResult.bind(this));
            }
		}
    },
    ////////////////////////////////////////////////////////////////////
	//TODO: Check for appropiate structures
    handleExecuteSaveAll: {
    	value: function(event) {
            if((typeof this.activeDocument !== "undefined") && this.application.ninja.coreIoApi.cloudAvailable()){
                //Text and HTML document classes should return the same save object for fileSave
                this.application.ninja.ioMediator.fileSave(this.activeDocument.saveAll(), this.fileSaveResult.bind(this));
            }
		}
    },
    ////////////////////////////////////////////////////////////////////
    handleExecuteSaveAs: {
        value: function(event) {
            var saveAsSettings = event._event.settings || {};
            if((typeof this.activeDocument !== "undefined") && this.application.ninja.coreIoApi.cloudAvailable()){
                saveAsSettings.fileName = this.activeDocument.name;
                saveAsSettings.folderUri = this.activeDocument.uri.substring(0, this.activeDocument.uri.lastIndexOf("/"));
                saveAsSettings.callback = this.saveAsCallback.bind(this);
                this.application.ninja.newFileController.showSaveAsDialog(saveAsSettings);
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    handleExecuteFileClose:{
        value: function(event) {
            if(this.activeDocument && this.application.ninja.coreIoApi.cloudAvailable()){
                this.closeDocument(this.activeDocument.uuid);
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    handleExecuteFileCloseAll:{
            value: function(event) {
                var i=0;
                if(this.activeDocument && this.application.ninja.coreIoApi.cloudAvailable()){
                    while(this._documents.length > 0){
                        this.closeDocument(this._documents[this._documents.length -1].uuid);
                    }
                }
            }
        },
        ////////////////////////////////////////////////////////////////////
    //
    fileSaveResult: {
    	value: function (result) {
            if((result.status === 204) || (result.status === 404)){//204=>existing file || 404=>new file... saved
                this.activeDocument.needsSave = false;
                if(this.application.ninja.currentDocument !== null){
                    //clear Dirty StyleSheets for the saved document
                    this.application.ninja.stylesController.clearDirtyStyleSheets(this.application.ninja.currentDocument);
                }
            }
    	}
    },
	
    createNewFile:{
        value:function(newFileObj){
            //console.log(newFileObj);//contains the template uri and the new file uri
            if(!newFileObj) return;
            this.application.ninja.ioMediator.fileNew(newFileObj.newFilePath, newFileObj.fileTemplateUri, this.openNewFileCallback.bind(this));

            if((newFileObj.fileExtension !== ".html") && (newFileObj.fileExtension !== ".htm")){//open code view

                } else {
                //open design view
                }
        }
    },

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
            this.activeDocument._userDocument.name=filename;
            this.activeDocument._userDocument.root=destination;
            this.activeDocument._userDocument.uri=fileUri;
            this.application.ninja.ioMediator.fileSave(this.activeDocument.save(), this.fileSaveResult.bind(this));
            //
        }
    },

    ////////////////////////////////////////////////////////////////////
	openDocument: {
		value: function(doc) {
			
			//
			this.documentHackReference = doc;
			//
			switch (doc.extension) {
				case 'html':
					//Open in designer view
					Montage.create(HTMLDocument).initialize(doc, Uuid.generate(), this._createIframeElement(), this._onOpenDocument.bind(this), this.webTemplate);
					break;
				default:
					//Open in code view
					var code = Montage.create(TextDocument, {"source": {value: doc.content}}), docuuid = Uuid.generate(), textArea;
					textArea = this.application.ninja.stage.stageView.createTextAreaElement(docuuid);
					code.initialize(doc, docuuid, textArea, textArea.parentNode);
					//code.init(doc.name, doc.uri, doc.extension, null, docuuid);
					code.textArea.value = doc.content;
					this.application.ninja.stage.stageView.createTextView(code);
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
    
    textDocumentOpened: {
       value: function(doc) {



           this.application.ninja.stage.stageView.createTextView(doc);

           /*
           DocumentManager._hideCurrentDocument();
           stageManagerModule.stageManager._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
           DocumentManager.activeDocument = doc;

           var type;

           switch(doc.documentType) {
               case  "css" :
                   type = "css";
                   break;
               case "js" :
                   type = "javascript";
                   break;
           }

           DocumentManager._codeEditor.editor = CodeMirror.fromTextArea(doc.textArea, {
                            lineNumbers: true,
                       mode: type,
                            onCursorActivity: function() {
                                DocumentManager._codeEditor.editor.setLineClass(DocumentManager._codeEditor.hline, null);
                                DocumentManager._codeEditor.hline = DocumentManager._codeEditor.editor.setLineClass(DocumentManager._codeEditor.editor.getCursor().line, "activeline");
                            }
                });
           DocumentManager._codeEditor.hline = DocumentManager._codeEditor.editor.setLineClass(0, "activeline");
           */

            }
   },

    closeDocument: {
        value: function(id) {
            if(this.activeDocument.needsSave === true){
                //if file dirty then alert user to save
        }

            var doc = this._findDocumentByUUID(id);

            var closeDocumentIndex = this._findIndexByUUID(id);
            this._documents.splice(this._findIndexByUUID(id), 1);

            if(this.activeDocument.uuid === id && this._documents.length > 0) {//closing the active document tab
                var nextDocumentIndex = -1 ;
                if((this._documents.length > 0) && (closeDocumentIndex === 0)){
                    nextDocumentIndex = 0;
                }else if((this._documents.length > 0) && (closeDocumentIndex > 0)){
                    nextDocumentIndex = closeDocumentIndex - 1;
                }
                this.application.ninja.stage.stageView.switchDocument(this._documents[nextDocumentIndex]);
                if(typeof doc.stopVideos !== "undefined"){doc.stopVideos();}
                this._removeDocumentView(doc.container);
            }else if(this._documents.length === 0){
                if(typeof this.activeDocument.pauseAndStopVideos !== "undefined"){
                    this.activeDocument.pauseAndStopVideos();
                }
                this.activeDocument = null;
                this._removeDocumentView(doc.container);
                this.application.ninja.stage.stageView.hideRulers();
                document.getElementById("iframeContainer").style.display="block";

                this.application.ninja.stage.hideCanvas(true);
            }else{//closing inactive document tab - just clear DOM
                if(typeof doc.pauseAndStopVideos !== "undefined"){
                    doc.pauseAndStopVideos();
                }
                this._removeDocumentView(doc.container);
            }

            NJevent("closeDocument", doc.uri);

            doc=null;
        }
    },

    // Document has been loaded into the Iframe. Dispatch the event.
    // Event Detail: Contains the current ActiveDocument
    _onOpenDocument: {
        value: function(doc){
            this.webTemplate = false;
            this.application.ninja.currentDocument = doc;
            this._hideCurrentDocument();
            this.application.ninja.stage.stageView.hideOtherDocuments(doc.uuid);

            this.application.ninja.stage.hideCanvas(false);

            this.activeDocument = doc;

            this._showCurrentDocument();

            NJevent("onOpenDocument", doc);
//            appDelegateModule.MyAppDelegate.onSetActiveDocument();

        }
    },


    _onOpenTextDocument: {
        value: function(doc) {
            this._hideCurrentDocument();
            this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
            this.activeDocument = doc;

            var type;

            switch(doc.documentType) {
                case  "css" :
                    type = "css";
                    break;
                case "js" :
                    type = "javascript";
                    break;
            }

            DocumentController._codeEditor.editor = CodeMirror.fromTextArea(doc.textArea, {
                        lineNumbers: true,
                        mode: type,
                        onCursorActivity: function() {
                            DocumentController._codeEditor.editor.setLineClass(DocumentController._codeEditor.hline, null);
                            DocumentController._codeEditor.hline = DocumentController._codeEditor.editor.setLineClass(DocumentController._codeEditor.editor.getCursor().line, "activeline");
                        }
            });
            DocumentController._codeEditor.hline = DocumentController._codeEditor.editor.setLineClass(0, "activeline");

        }
    },

    /**
     * VIEW Related Methods
     */
    // PUBLIC
    ShowActiveDocument: {
        value: function() {
            this.activeDocument.iframe.style.opacity = 1.0;
        }
    },

    // PRIVATE
    _findDocumentByUUID: {
        value: function(uuid) {
            var len =  this._documents.length;
            for(var i = 0; i < len; i++) {
                if(this._documents[i].uuid === uuid) return this._documents[i];
            }

            return false;
        }
    },

    _findIndexByUUID: {
        value: function(uuid) {
            var len =  this._documents.length;
            for(var i = 0; i < len; i++) {
                if(this._documents[i].uuid === uuid) return i;
            }

            return false;
        }
    },

    _hideCurrentDocument: {
        value: function() {
            if(this.activeDocument) {
                if(this.activeDocument.currentView === "design"){
                    this.activeDocument.saveAppState();
                    this.activeDocument.container.parentNode.style["display"] = "none";
                    this.application.ninja.stage.hideCanvas(true);
                    this.application.ninja.stage.stageView.hideRulers();
                }

                this.activeDocument.container.style["display"] = "none";
            }
        }
    },

    _showCurrentDocument: {
        value: function() {
            if(this.activeDocument) {
                this.activeDocument.container.style["display"] = "block";
                if(this.activeDocument.currentView === "design"){
                    this.activeDocument.container.parentNode.style["display"] = "block";
                    this.activeDocument.restoreAppState();
                    this.application.ninja.stage.hideCanvas(false);
                    this.application.ninja.stage.stageView.showRulers();
                }else{
                    //hide the iframe when switching to code view
                    document.getElementById("iframeContainer").style.display="none";
                }
        }
        }
    },

    _removeDocumentView: {
        value: function(node) {
            node.parentNode.removeChild(node);
        }
    },

    reloadDocumentContent: {
        value: function() {
            this.activeDocument._window.location.reload();
        }
    },

    /**
     * Creates a new iFrame element using a new unique ID for it. Returns the iframe ID.
     */
    _createIframeElement: {
        value: function() {
            var e = document.createElement("iframe");
            e.id = this._createIframeID();
            e.style.border = "none";
            e.style.opacity = 0;
            e.height = 1000;
            e.width = 2000;
            e.src = "";

            if(!this._iframeHolder) this._iframeHolder = document.getElementById("iframeContainer");
            
            this._iframeHolder.appendChild(e);

            return e;
        }
    },


    _createIframeID: {
        value: function() {
            return "userDocument_" + (this._iframeCounter++);
        }
    },

    handleStyleSheetDirty:{
        value:function(){
            this.activeDocument.needsSave = true;
        }
    }
});
