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
    HTMLDocument =	require("js/io/document/html-document").HTMLDocument,
    TextDocument =	require("js/io/document/text-document").TextDocument,
    DocumentController;
////////////////////////////////////////////////////////////////////////
//
DocumentController = exports.DocumentController = Montage.create(Component, {
    hasTemplate: {
        value: false
    },

    _documents: {
        value: []
    },

    _activeDocument: { value: null },
    _iframeCounter: { value: 1, enumerable: false },
    _iframeHolder: { value: null, enumerable: false },
    _textHolder: { value: null, enumerable: false },
    _codeMirrorCounter: {value: 1, enumerable: false},

    tmpSourceForTesting: {
        value: "function CodeMirror(place, givenOptions) {" +
                "// Determine effective options based on given values and defaults." +
                "var options = {}, defaults = CodeMirror.defaults; }"
            },

    activeDocument: {
        get: function() {
            return this._activeDocument;
        },
        set: function(doc) {
            if(this._activeDocument)  this._activeDocument.isActive = false;
                
            if(this._documents.indexOf(doc) === -1) this._documents.push(doc);

            this._activeDocument = doc;
            this._activeDocument.isActive = true;

            if(!!this._activeDocument.editor){
                this._activeDocument.editor.focus();
            }

        }
    },

    deserializedFromTemplate: {
        value: function() {
            this.eventManager.addEventListener("appLoaded", this, false);
            this.eventManager.addEventListener("executeFileOpen", this, false);
            this.eventManager.addEventListener("executeNewFile", this, false);
            this.eventManager.addEventListener("executeSave", this, false);

            this.eventManager.addEventListener("recordStyleChanged", this, false);

			// Temporary testing opening a new file after Ninja has loaded
			this.eventManager.addEventListener("executeNewProject", this, false);
        }
    },

    handleAppLoaded: {
        value: function() {
            //this.openDocument({"type": "html"});
        }
    },
	
	handleExecuteNewProject: {
        value: function() {
            this.openDocument({"type": "html"});
        }
    },

    handleExecuteFileOpen: {
        value: function(event) {
            var pickerSettings = event._event.settings || {};
            pickerSettings.callback = this.openFileWithURI.bind(this);
            pickerSettings.pickerMode = "read";
            pickerSettings.inFileMode = true;
            this.application.ninja.filePickerController.showFilePicker(pickerSettings);
        }
    },

    handleExecuteNewFile: {
            value: function(event) {
                var newFileSettings = event._event.settings || {};
                newFileSettings.callback = this.createNewFile.bind(this);
                this.application.ninja.newFileController.showNewFileDialog(newFileSettings);
            }
    },

    handleExecuteSave: {
            value: function(event) {
                this.activeDocument.save();
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
            if(!!response && response.success && !!response.uri){
                this.application.ninja.ioMediator.fileOpen(response.uri, this.openFileCallback.bind(this));
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
	openDocument: {
		value: function(doc) {
			//
			switch (doc.extension) {
				case 'html': case 'html':
					//Open in designer view
					Montage.create(HTMLDocument).initialize(doc, Uuid.generate(), this._createIframeElement(), this._onOpenDocument);
					break;
				default:
					//Open in code view
					break;
			}
			
			return;
            
            
            
            
            
            var newDoc;

            if(!doc) return false;

           // try {
                if (doc.type === 'html' || doc.type === 'htm') {
                	console.log('hello');
                    newDoc = Montage.create(HTMLDocument);
                    newDoc.initialize(doc, Uuid.generate(), this._createIframeElement(), this._onOpenDocument);
                } else {
                    newDoc = Montage.create(TextDocument, {
                        "source": { value: doc.source }
                    });
                    var docUuid = Uuid.generate();
                    var textArea = this.application.ninja.stage.stageView.createTextAreaElement(docUuid);
                    newDoc.initialize(doc, docUuid, textArea, textArea.parentNode);

                    // Tmp this will be filled with the real content
                    newDoc.textArea.value = doc.source; //this.tmpSourceForTesting;

                    this.textDocumentOpened(newDoc);

            }

           // } catch (err) {
           //     console.log("Could not open Document ",  err);
           // }
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
            if(this.activeDocument.dirtyFlag === true){
                //if file dirty then alert user to save
        }

            var doc = this._findDocumentByUUID(id);
            this._removeDocumentView(doc.container);

            var closeDocumentIndex = this._findIndexByUUID(id);
            this._documents.splice(this._findIndexByUUID(id), 1);

            if(this.activeDocument.uuid === id && this._documents.length > 0) {
                var nextDocumentIndex = -1 ;
                if((this._documents.length > 0) && (closeDocumentIndex === 0)){
                    nextDocumentIndex = 1;
                }else if((this._documents.length > 0) && (closeDocumentIndex > 0)){
                    nextDocumentIndex = closeDocumentIndex - 1;
                }
                this.application.ninja.stage.stageView.switchDocument(this._documents[nextDocumentIndex]);
            }
        }
    },

    // Document has been loaded into the Iframe. Dispatch the event.
    // Event Detail: Contains the current ActiveDocument
    _onOpenDocument: {
        value: function(doc){
            //var data = DocumentManager.activeDocument;
            //DocumentManager._hideCurrentDocument();

            //stageManagerModule.stageManager.toggleCanvas();

            DocumentController.activeDocument = doc;

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
                    this.application.ninja.stage.saveScroll();
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
                    this.application.ninja.stage.restoreScroll();
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
        }
});
