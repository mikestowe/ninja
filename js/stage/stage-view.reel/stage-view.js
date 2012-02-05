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
            //save current document
            if(this.application.ninja.documentController.activeDocument.currentView === "code"){
                this.application.ninja.documentController.activeDocument.save(true);
            }
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

            doc.editor = CodeMirror.fromTextArea(doc.textArea, {
                lineNumbers: true,
                       mode: type,
                       onCursorActivity: function() {
                           //documentController._codeEditor.editor.setLineClass(documentController._codeEditor.hline, null);
                           //documentController._codeEditor.hline = documentController._codeEditor.editor.setLineClass(documentController._codeEditor.editor.getCursor().line, "activeline");
                       }
           });

           //this.application.ninja.documentController._codeEditor.hline = this.application.ninja.documentController._codeEditor.editor.setLineClass(0, "activeline");
            this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
            this.application.ninja.documentController.activeDocument = doc;
            this.application.ninja.stage.hideCanvas(true);
        }
    },



    switchDocument:{
        value: function(doc){

            //if dirty SAVE codemirror into textarea
            if(this.application.ninja.documentController.activeDocument.currentView === "code"){
                this.application.ninja.documentController.activeDocument.save(true);
            }

            this.application.ninja.documentController._hideCurrentDocument();

            this.application.ninja.documentController.activeDocument = doc;

            this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
            this.application.ninja.documentController._showCurrentDocument();

            if(this.application.ninja.documentController.activeDocument.currentView === "code"){
                var type;
                switch(doc.documentType) {
                    case  "css" :
                        type = "css";
                        break;
                    case "js" :
                        type = "javascript";
                        break;
                }

                //add the codemirror div again for editting
                doc.editor = CodeMirror.fromTextArea(doc.textArea, {
                               lineNumbers: true,
                               mode: type,
                               onCursorActivity: function() {
                                   //documentController._codeEditor.editor.setLineClass(documentController._codeEditor.hline, null);
                                   //documentController._codeEditor.hline = documentController._codeEditor.editor.setLineClass(documentController._codeEditor.editor.getCursor().line, "activeline");
                               }
                   });

                //this.application.ninja.documentController._codeEditor.hline = this.application.ninja.documentController._codeEditor.editor.setLineClass(0, "activeline");
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
            //use CodeMirror toTextArea() to remove editor and save content into textarea
            this.application.ninja.documentController._documents.forEach(function(aDoc){
                if(aDoc.currentView === "design"){
                    aDoc.container.parentNode.style["display"] = "none";
                }else if((aDoc.currentView === "code") && (aDoc.uuid !== docUuid)){
                    aDoc.container.style["display"] = "none";
                }
            }, this);
        }
    }
});