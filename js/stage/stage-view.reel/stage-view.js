/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/**
@requires montage/core/core
@requires montage/ui/component
*/
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.StageView = Montage.create(Component, {
    _documents: {
        value : []
    },

    docs: {
        get: function() {
            return this._documents;
        },
        set: function(value) {
            //console.log(value);
        }
    },

    templateDidLoad: {
        value: function() {
            this.eventManager.addEventListener("appLoaded", this, false);
        }
    },

    didDraw:{
        value: function() {
            if(!this.application.ninja.documentController._textHolder) this.application.ninja.documentController._textHolder = this.element;
        }
    },

    handleAppLoaded: {
        value: function() {

            // Don't bind for now
            /*
            Object.defineBinding(this, "docs", {
              boundObject: this.application.ninja.documentController,
              boundObjectPropertyPath: "_documents"
            });
            */

        }
    },

    /**
     * Creates a text area which will contain the content of the opened text document.
     */
    createTextAreaElement: {
        value: function(uuid) {


            var codeMirrorDiv = document.createElement("div");
            codeMirrorDiv.id = "codeMirror_"  + uuid;
            codeMirrorDiv.style.display = "block";
            this.element.appendChild(codeMirrorDiv);

            var textArea = document.createElement("textarea");
            textArea.id = "code";
            textArea.name = "code";

            codeMirrorDiv.appendChild(textArea);

            return textArea;
        }
    },

    // Temporary function to create a Codemirror text view
    createTextView: {
        value: function(doc) {
            this.application.ninja.documentController._hideCurrentDocument();
            this.hideOtherDocuments(doc.uuid);
            var type;
            switch(doc.documentType) {
                case  "css" :
                    type = "css";
                    break;
                case "js" :
                    type = "javascript";
                    break;
            }

            //fix hack
            document.getElementById("codeMirror_"+doc.uuid).style.display="block";

            var documentController = this.application.ninja.documentController;
            doc.editor = CodeMirror.fromTextArea(doc.textArea, {
                lineNumbers: true,
                       mode: type,
                       onChange: function(){
                           var historySize = doc.editor.historySize();
                           if(historySize.undo>0){
                                doc.markEdited();
                           }else if(historySize.undo===0 && historySize.redo>0){
                               doc.markUnedited();
                           }
                       },
                       onCursorActivity: function() {
                           //documentController._codeEditor.editor.setLineClass(documentController._codeEditor.hline, null);
                           //documentController._codeEditor.hline = documentController._codeEditor.editor.setLineClass(documentController._codeEditor.editor.getCursor().line, "activeline");
                       }
           });

           //this.application.ninja.documentController._codeEditor.hline = this.application.ninja.documentController._codeEditor.editor.setLineClass(0, "activeline");
            this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
            this.application.ninja.documentController.activeDocument = doc;
            this.application.ninja.stage.hideCanvas(true);

            document.getElementById("iframeContainer").style.display="none";//hide the iframe when switching to code view
        }
    },



    switchDocument:{
        value: function(doc){
            //save editor cursor position
            if(!!this.application.ninja.documentController.activeDocument && !!this.application.ninja.documentController.activeDocument.editor){
                this.application.ninja.documentController.activeDocument.hline = this.application.ninja.documentController.activeDocument.editor.getCursor(true);
            }
            this.application.ninja.documentController._hideCurrentDocument();

            this.application.ninja.documentController.activeDocument = doc;

            this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
            this.application.ninja.documentController._showCurrentDocument();

            var documentController = this.application.ninja.documentController;

            //restore editor cursor position
            if(!!this.application.ninja.documentController.activeDocument && !!this.application.ninja.documentController.activeDocument.editor){
                this.application.ninja.documentController.activeDocument.editor.setCursor(this.application.ninja.documentController.activeDocument.hline);
                document.getElementById("codeMirror_"+this.application.ninja.documentController.activeDocument.uuid).getElementsByClassName("CodeMirror")[0].focus();
            }

            if(this.application.ninja.documentController.activeDocument.currentView === "design") {
                this.application.ninja.stage._scrollFlag = true; // TODO HACK to prevent type error on Hide/Show Iframe
               this.application.ninja.currentDocument = this.application.ninja.documentController.activeDocument;

                // TODO dispatch event here
    //                appDelegateModule.MyAppDelegate.onSetActiveDocument();
            }

        }
    },

    refreshCodeDocument:{
        value:function(doc){

        }
    },
    addCodeDocument:{
        value:function(doc){
            var type;
            switch(doc.documentType) {
                case  "css" :
                    type = "css";
                    break;
                case "js" :
                    type = "javascript";
                    break;
            }

            var codeM = CodeMirror.fromTextArea(doc.textArea, {
                lineNumbers: true,
                       mode: type,
                       onCursorActivity: function() {
                           //documentController._codeEditor.editor.setLineClass(documentController._codeEditor.hline, null);
                           //documentController._codeEditor.hline = documentController._codeEditor.editor.setLineClass(documentController._codeEditor.editor.getCursor().line, "activeline");
                       }
           });
        }
    },
    hideCodeDocument:{
        value:function(docUuid){
            //hide the previous Codemirror div

        }
    },
    hideOtherDocuments:{
        value:function(docUuid){
            this.application.ninja.documentController._documents.forEach(function(aDoc){
                if(aDoc.currentView === "design"){
                    aDoc.container.parentNode.style["display"] = "none";
                }else if((aDoc.currentView === "code") && (aDoc.uuid !== docUuid)){
                    aDoc.container.style["display"] = "none";
                }
            }, this);
        }
    },
    showRulers:{
        value:function(){
            this.application.ninja.rulerTop.style.background = "url('../images/temp/ruler-top.png')";
            this.application.ninja.rulerLeft.style.background = "url('../images/temp/ruler-left.png')";
        }
    },
    hideRulers:{
        value:function(){
            this.application.ninja.rulerTop.style.background = "rgb(128,128,128)";
            this.application.ninja.rulerLeft.style.background = "rgb(128,128,128)";
        }
    },

    switchViews: {
        value: function() {

            //save file if dirty

            this.application.ninja.stage.saveStageScroll();
            this.application.ninja.documentController._hideCurrentDocument();

            if(this.application.ninja.documentController.activeDocument.currentView === "design") {
                this.application.ninja.documentController._textHolder.style.display = "none";
                this.application.ninja.documentController.activeDocument.container.style["display"] = "block";
                this.application.ninja.stage._scrollFlag = true;
                //this._showCurrentDocument();
                this.application.ninja.stage.applySavedScroll();

            } else {
                this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe

                var codeview = this.application.ninja.documentController.activeDocument.container;
                //this._textHolder.style.display = "block";
                //codeview.firstChild.innerHTML = this.activeDocument.iframe.contentWindow.document.body.parentNode.innerHTML;

//                this._codeEditor.editor = CodeMirror.fromTextArea(codeview.firstChild, {
//                            lineNumbers: true,
//                            mode: "htmlmixed",
//                            onCursorActivity: function() {
//                                DocumentController._codeEditor.editor.setLineClass(DocumentController._codeEditor.hline, null);
//                                DocumentController._codeEditor.hline = DocumentController._codeEditor.editor.setLineClass(DocumentController._codeEditor.editor.getCursor().line, "activeline");
//                            }
//                });
//                this._codeEditor.hline = DocumentController._codeEditor.editor.setLineClass(0, "activeline");
            }
        }
    }
});