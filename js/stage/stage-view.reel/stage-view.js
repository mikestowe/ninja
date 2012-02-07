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
            this.application.ninja.documentController.activeDocument.save(true /*remove the codemirror div after saving*/);
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
                           if((historySize.undo===0 && historySize.redo===0) || (historySize.undo>0)){
                                doc.dirtyFlag=true;
                           }else if(historySize.undo===0 && historySize.redo>0){
                               doc.dirtyFlag=false;
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
        }
    },



    switchDocument:{
        value: function(doc){
            this.application.ninja.documentController.activeDocument.save(true /*remove the codemirror div after saving*/);

            this.application.ninja.documentController._hideCurrentDocument();


            if(this.application.ninja.documentController.activeDocument.currentView === "design"){
                console.log("scrollLeft: "+ this.application.ninja.stage._iframeContainer.scrollLeft);
                console.log("scrollTop: "+ this.application.ninja.stage._iframeContainer.scrollTop);
            }


            this.application.ninja.documentController.activeDocument = doc;

            this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
            this.application.ninja.documentController._showCurrentDocument();

            var documentController = this.application.ninja.documentController;

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
                               onChange: function(){doc.dirtyFlag=true;console.log("undo stack:",doc.editor.historySize());},
                               onCursorActivity: function() {
                                   //documentController._codeEditor.editor.setLineClass(documentController._codeEditor.hline, null);
                                   //documentController._codeEditor.hline = documentController._codeEditor.editor.setLineClass(documentController._codeEditor.editor.getCursor().line, "activeline");
                               }
                   });

                //this.application.ninja.documentController._codeEditor.hline = this.application.ninja.documentController._codeEditor.editor.setLineClass(0, "activeline");
            }

            if(this.application.ninja.documentController.activeDocument.documentType === "htm" || this.application.ninja.documentController.activeDocument.documentType === "html") {
                this.application.ninja.stage._scrollFlag = true; // TODO HACK to prevent type error on Hide/Show Iframe


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
            //use CodeMirror toTextArea() to remove editor and save content into textarea
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
            this.application.ninja.rulerTop.style.display = "block";
            this.application.ninja.rulerLeft.style.display = "block";
        }
    },
    hideRulers:{
        value:function(){
            this.application.ninja.rulerTop.style.display = "none";
            this.application.ninja.rulerLeft.style.display = "none";
        }
    }
});