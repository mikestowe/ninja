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

    // New Document Objects
var Document_HTML =      require("js/document/document-html").HtmlDocument;
var Document_Text =      require("js/document/document-text").TextDocument;
////////////////////////////////////////////////////////////////////////
//
var DocumentController = exports.DocumentController = Montage.create(Component, {
    hasTemplate: {
        value: false
    },

    _documents: {
        value: []
    },
    
    _hackRootFlag: {
    	value: false
    },

    _hackInitialStyles: {
        value: true
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
//            if(!!this._activeDocument){ this._activeDocument.isActive = false;}

            this._activeDocument = doc;

            if(!!this._activeDocument){
                if(this._documents.indexOf(doc) === -1) this._documents.push(doc);
                this._activeDocument.isActive = true;
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
        }
    },
    

	//TODO: Ensure these APIs are not needed
	////////////////////////////////////////////////////////////////////
	//
    handleWebRequest: {
    	value: function (request) {
    		//TODO: Check if frameId is proper
    		if (this._hackRootFlag && request.parentFrameId !== -1) {
    			//Checking for proper URL redirect (from different directories)
    			if (request.url.indexOf('js/document/templates/banner') !== -1) {
					return {redirectUrl: this.application.ninja.coreIoApi.rootUrl+this.application.ninja.documentController.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1]+request.url.split(chrome.extension.getURL('js/document/templates/banner/'))[1]};
				} else if (request.url.indexOf('js/document/templates/html')  !== -1) {
					return {redirectUrl: this.application.ninja.coreIoApi.rootUrl+this.application.ninja.documentController.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1]+request.url.split(chrome.extension.getURL('js/document/templates/html/'))[1]};
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
    		if((typeof this.activeDocument !== "undefined") && this.application.ninja.coreIoApi.cloudAvailable()){
    			//Currently we don't need a callback handler
    			//this.activeDocument.model.save(this.saveExecuted.bind(this));
    			this.activeDocument.model.save();
    		} else {
    			//Error: cloud not available and/or no active document
    		}
		}
    },
    ////////////////////////////////////////////////////////////////////
	//
    saveExecuted: {
    	value: function (value) {
    		//File saved, any callbacks or events should go here
    	}
    },
    ////////////////////////////////////////////////////////////////////
	//TODO: Check for appropiate structures
    handleExecuteSaveAll: {
    	value: function(event) {
           //
    		if((typeof this.activeDocument !== "undefined") && this.application.ninja.coreIoApi.cloudAvailable()){
    			//
    			this.activeDocument.model.saveAll(this.testCallback.bind(this)); //this.fileSaveResult.bind(this)
    		} else {
    			//Error:
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
        	if (this.activeDocument) {
//        		this.activeDocument.closeDocument();
                this.closeFile(this.activeDocument);
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
                this.activeDocument.model.needsSave = false;
                if(this.application.ninja.currentDocument !== null){
                    //clear Dirty StyleSheets for the saved document
                    this.application.ninja.stylesController.clearDirtyStyleSheets(this.application.ninja.currentDocument);
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
            this.activeDocument.model.file.name=filename;
            this.activeDocument.model.file.uri=fileUri;
            this.activeDocument.model.save();
            //
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
                    this._hackRootFlag = false;
                    Montage.create(Document_HTML).init(file, this, this._onOpenDocument, 'design', template);
					break;
				default:
                    //Open in code view
                    Montage.create(Document_Text).init(file, this, this._onOpenTextDocument, 'code');
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

    //todo: remove this funciton as it is not used
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

    closeFile: {
        value: function(document) {
            document.closeDocument(this, this.onCloseFile);
        }
    },

    onCloseFile: {
        value: function(doc) {

			this._documents.splice(this._documents.indexOf(doc), 1);

            this._activeDocument = null;

            this.application.ninja.stage.hideRulers();

//            document.getElementById("iframeContainer").style.display="block";

            this.application.ninja.stage.hideCanvas(true);

            if(this._documents.length === 0){
                document.getElementById("iframeContainer").style.display="block";
                document.getElementById("codeViewContainer").style.display="block";
            }


			NJevent("closeDocument", doc.model.file.uri);
			//TODO: Delete object here
        }
    },

    closeDocument: {
        value: function(id) {
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
                doc.container.parentNode.removeChild(doc.container);
            }else if(this._documents.length === 0){
                // See above
            }else{//closing inactive document tab - just clear DOM
                if(typeof doc.pauseAndStopVideos !== "undefined"){
                    doc.pauseAndStopVideos();
                }
                doc.container.parentNode.removeChild(doc.container);
            }

            NJevent("closeDocument", doc.uri);

            doc=null;
        }
    },

    // Open document callback
    _onOpenDocument: {
        value: function(doc){
            var currentDocument;
            if(this.activeDocument) {
                // There is a document currently opened
                currentDocument = this.activeDocument;

                //this.application.ninja.stage.stageView.restoreAllPanels();
            } else {
                // There is no document opened

                // Show the rulers
                // TODO: Move this indo design view
                this.application.ninja.stage.showRulers();

                // Show the canvas
                this.application.ninja.stage.hideCanvas(false);
            }

            // Set the active document
            this.activeDocument = doc;

            // Initialize the documentRoot styles
            this.initializeRootStyles(doc.documentRoot);
            // Flag to stop stylesheet dirty event
            this._hackInitialStyles = false;

            this.switchDocuments(currentDocument, doc, true);
        }
    },


    _onOpenTextDocument: {
        value: function(doc) {
            var currentDocument=null;
            if(this.activeDocument) {
                // There is a document currently opened
                currentDocument = this.activeDocument;
            }

            this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
            this.activeDocument = doc;
            document.getElementById("iframeContainer").style.display = "none";
            this.application.ninja.codeEditorController.applySettings();
            this.switchDocuments(currentDocument, doc, true);
        }
    },

    switchDocuments: {
        value: function(currentDocument, newDocument, didCreate) {

            if(currentDocument && currentDocument.currentView === "design") {
                currentDocument.serializeDocument();
                this.application.ninja.selectionController._selectionContainer = null;
                currentDocument.model.views.design.propertiesPanel.clear();
            }

            if(currentDocument) {
                currentDocument.model.currentView.hide();
                currentDocument.model.isActive = false;
            }
            if(currentDocument && newDocument && (currentDocument.model.parentContainer !== newDocument.model.parentContainer)){
                currentDocument.model.parentContainer.style["display"] = "none";
            }

            if(newDocument && newDocument.currentView === "code"){
                this.application.ninja.stage.showCodeViewBar(true);
                this.application.ninja.stage.collapseAllPanels();
                this.application.ninja.stage.hideCanvas(true);
                this.application.ninja.stage.hideRulers();

                newDocument.model.views.code.editor.focus();

            }else if(currentDocument && newDocument && newDocument.currentView === "design"){
                this.application.ninja.stage.showCodeViewBar(false);
                this.application.ninja.stage.restoreAllPanels();
                this.application.ninja.stage.hideCanvas(false);
                this.application.ninja.stage.showRulers();
            }

            this.application.ninja.stage.clearAllCanvas();

            if(didCreate) {
                newDocument.model.currentView.show();
                newDocument.model.parentContainer.style["display"] = "block";
                if(newDocument.currentView === "design") {
                    newDocument.model.views.design.iframe.style.opacity = 1;
                    NJevent("onOpenDocument", newDocument);
                }
            }
            else {
                this.activeDocument = newDocument;

                newDocument.model.currentView.show();
                if(currentDocument && newDocument && (currentDocument.model.parentContainer !== newDocument.model.parentContainer)){
                    newDocument.model.parentContainer.style["display"] = "block";
                }

                if(newDocument.currentView === "design") {
                    newDocument.deserializeDocument();
                    NJevent("onSwitchDocument");
                }else{
                    newDocument.model.isActive = true;
                    this.application.ninja.codeEditorController.applySettings();//should be called after activeDocument is updated
                }
            }
        }
    },

    /**
     * VIEW Related Methods
     */

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

    handleStyleSheetDirty:{
        value:function(){
            if(!this._hackInitialStyles) {
                this.activeDocument.model.needsSave = true;
            }
        }
    },

    // TODO: Move this into the design views
    initializeRootStyles: {
        value: function(documentRoot) {
            var sc = this.application.ninja.stylesController,
                styles = {},
                needsRule = false,
                rule;

            if(sc.getElementStyle(documentRoot, "width", false, false) == null) {
                styles['width'] = '100%';
                needsRule = true;
            }
            if(sc.getElementStyle(documentRoot, "height", false, false) == null) {
                styles['height'] = '100%';
                needsRule = true;
            }
            if(sc.getElementStyle(documentRoot, "-webkit-transform", false, false) == null) {
                styles['-webkit-transform'] = 'perspective(1400) matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)';
                needsRule = true;
            }
            if(sc.getElementStyle(documentRoot, "-webkit-transform-style", false, false) == null) {
                styles['-webkit-transform-style'] = 'preserve-3d';
                needsRule = true;
            }

            if(needsRule) {
                rule = sc.addRule('.ninja-body{}');
                sc.setStyles(rule, styles);
                sc.addClass(documentRoot, "ninja-body");
            }
        }
    }
});
