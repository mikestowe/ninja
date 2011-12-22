/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/**
@module js/document/documentManager
@requires montage/core/core
@requires montage/ui/component
@requires js/document/html-document
@requires js/document/text-document
*/

// TODO : Fix deps from Montage V4 Archi

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    Uuid = require("montage/core/uuid").Uuid;

var HTMLDocument = require("js/io/document/html-document").HTMLDocument;
var TextDocument = require("js/io/document/text-document").TextDocument;

var DocumentController = exports.DocumentController = Montage.create(Component, {
    hasTemplate: { value: false },

    _documents: { value: [] },
    _documentsHash: { value: {} },
    _activeDocument: { value: null },
    _iframeCounter: { value: 1, enumerable: false },
    _iframeHolder: { value: null, enumerable: false },
    _textHolder: { value: null, enumerable: false },
    _codeMirrorCounter: {value: 1, enumerable: false},

    _codeEditor: {
        value: {
            "editor": {
                value: null,
                enumerable: false
            },
            "hline": {
                value: null,
                enumerable: false
            }
        }
    },

    activeDocument: {
        get: function() {
            return this._activeDocument;
        },
        set: function(doc) {
            if(this._activeDocument) {
                if(this.activeDocument.documentType === "htm" || this.activeDocument.documentType === "html") {
                    // TODO selection should use the document own selectionModel
                    //this._activeDocument.selectionModel = selectionManagerModule.selectionManager._selectedItems;
                }
                
                this._activeDocument.isActive = false;
            }

            if(this._documents.indexOf(doc) === -1) {
                //this._documentsHash[doc.uuid] = this._documents.push(doc) - 1;
                this._documents.push(doc);
            }

            this._activeDocument = doc;
            this._activeDocument.isActive = true;

            if(this.activeDocument.documentType === "htm" || this.activeDocument.documentType === "html") {
                // TODO selection should use the document own selectionModel
                //selectionManagerModule.selectionManager._selectedItems = this._activeDocument.selectionModel;
            }
        }
    },

    deserializedFromTemplate: {
        value: function() {
            this.eventManager.addEventListener("appLoaded", this, false);
        }
    },

    handleAppLoaded: {
        value: function() {
            this.openDocument({"type": "html"});
        }
    },

    /** Open a Document **/
    openDocument: {
        value: function(doc) {
            var d;

            if(!doc) return false;

            try {
                if (doc.type === 'html' || doc.type === 'htm') {
                    d = Montage.create(HTMLDocument);
                    d.initialize(doc, Uuid.generate(), this._createIframeElement(), this._onOpenDocument);
                } else {
                    d = Montage.create(TextDocument);
                    d.initialize(doc, Uuid.generate(), this._createTextAreaElement(), this._onOpenTextDocument);
                }

            } catch (err) {
                console.log("Could not open Document ",  err);
            }
        }
    },

    closeDocument: {
        value: function(id) {
            var doc = this._findDocumentByUUID(id);
            this._removeDocumentView(doc.container);

            this._documents.splice(this._findIndexByUUID(id), 1);

            if(this.activeDocument.uuid === id && this._documents.length > 0) {
                this.switchDocument(this._documents[0].uuid)
            }
        }
    },

    switchDocument: {
        value: function(id) {
            this._hideCurrentDocument();
            this.activeDocument = this._findDocumentByUUID(id);

            this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
            this._showCurrentDocument();

            if(this.activeDocument.documentType === "htm" || this.activeDocument.documentType === "html") {
                this.application.ninja.stage._scrollFlag = true; // TODO HACK to prevent type error on Hide/Show Iframe
                // TODO dispatch event here
//                appDelegateModule.MyAppDelegate.onSetActiveDocument();
            }
        }
    },

    switchViews: {
        value: function() {
            this.application.ninja.stage.saveScroll();
            this._hideCurrentDocument();

            if(this.activeDocument.currentView === "design") {
                this._textHolder.style.display = "none";
                this.activeDocument.container.style["display"] = "block";
                this.application.ninja.stage._scrollFlag = true;
                //this._showCurrentDocument();
                this.application.ninja.stage.restoreScroll();

            } else {
                this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
                var codeview = this._createTextAreaElement();
                this._textHolder.style.display = "block";
                codeview.firstChild.innerHTML = this.activeDocument.iframe.contentWindow.document.body.parentNode.innerHTML;

                this._codeEditor.editor = CodeMirror.fromTextArea(codeview.firstChild, {
                            lineNumbers: true,
                            mode: "htmlmixed",
                            onCursorActivity: function() {
                                DocumentManager._codeEditor.editor.setLineClass(DocumentManager._codeEditor.hline, null);
                                DocumentManager._codeEditor.hline = DocumentManager._codeEditor.editor.setLineClass(DocumentManager._codeEditor.editor.getCursor().line, "activeline");
                            }
                });
                this._codeEditor.hline = DocumentManager._codeEditor.editor.setLineClass(0, "activeline");
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
            DocumentManager._hideCurrentDocument();
            this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
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
                this.activeDocument.container.style["display"] = "none";
                if(this.activeDocument.documentType === "htm" || this.activeDocument.documentType === "html") this.application.ninja.stage.toggleCanvas();
            }
        }
    },

    _showCurrentDocument: {
        value: function() {
            if(this.activeDocument) {
                this.activeDocument.container.style["display"] = "block";
                if(this.activeDocument.documentType === "htm" || this.activeDocument.documentType === "html") this.application.ninja.stage.toggleCanvas();
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

    _createTextAreaElement: {
        value: function() {
            var codeMirrorDiv = document.createElement("div");
            codeMirrorDiv.id = "codeMirror_"  + (this._codeMirrorCounter++);

            var textArea = document.createElement("textarea");
            textArea.id = "code";
            textArea.name = "code";

            codeMirrorDiv.appendChild(textArea);

            if(!this._textHolder) this._textHolder = document.getElementById("codeViewContainer");
            this._textHolder.appendChild(codeMirrorDiv);

            return codeMirrorDiv;
        }
    }
});
