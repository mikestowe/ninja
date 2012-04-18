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
     * Public method
     * Creates a textarea element which will contain the content of the opened text document.
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

    /**
     * Public method
     * Creates a new instance of a code editor
     */
    createTextView: {
        value: function(doc) {
            var type;
            this.application.ninja.documentController._hideCurrentDocument();
            this.hideOtherDocuments(doc.uuid);

            switch(doc.documentType) {
                case  "css" :
                    type = "css";
                    break;
                case "js" :
                    type = "javascript";
                    break;
            }
            document.getElementById("codeMirror_"+doc.uuid).style.display="block";

            doc.editor = this.application.ninja.codeEditorController.createEditor(doc, type);
            doc.editor.hline = doc.editor.setLineClass(0, "activeline");

            this.showCodeViewBar(true);

            this.application.ninja.codeEditorController.handleCodeCompletionSupport(type);

            this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
            this.application.ninja.documentController.activeDocument = doc;
            this.application.ninja.stage.hideCanvas(true);
            document.getElementById("iframeContainer").style.display="none";//hide the iframe when switching to code view
            this.collapseAllPanels();
        }
    },

    /**
     * Public method
     * Switches between documents. Document state data is saved and restored whereever applicable
     */
    switchDocument:{
        value: function(doc){
            this.application.ninja.documentController._hideCurrentDocument();
            this.application.ninja.documentController.activeDocument = doc;

            if(this.application.ninja.documentController.activeDocument.currentView === "design") {
                this.application.ninja.currentDocument = this.application.ninja.documentController.activeDocument;

                this.showCodeViewBar(false);
            }else{
                this.showCodeViewBar(true);
                this.application.ninja.codeEditorController.handleCodeCompletionSupport(this.application.ninja.documentController.activeDocument.editor.getOption("mode"));
            }

            this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
            this.application.ninja.documentController._showCurrentDocument();
            //focus editor
            if(!!this.application.ninja.documentController.activeDocument && !!this.application.ninja.documentController.activeDocument.editor){
                this.application.ninja.documentController.activeDocument.editor.focus();
                this.application.ninja.codeEditorController.handleThemeSelection();
                this.collapseAllPanels();
            }

            if(this.application.ninja.documentController.activeDocument.currentView === "design") {
                this.application.ninja.stage._scrollFlag = true; // TODO HACK to prevent type error on Hide/Show Iframe
                this.application.ninja.stage.stageDeps.reinitializeForSwitchDocument();//reinitialize draw-util, snapmanager and view-util
                this.restoreAllPanels();
            }

            NJevent("switchDocument");
        }
    },

    /**
     * Public method
     * Switches between different views of a design document, like HTML design view, HTML code view
     */
    switchDesignDocViews: {
        value: function() {
            //TODO
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
            this.application.ninja.rulerTop.style.display = "block";
            this.application.ninja.rulerLeft.style.display = "block";
        }
    },
    hideRulers:{
        value:function(){
            this.application.ninja.rulerTop.style.display = "none";
            this.application.ninja.rulerLeft.style.display = "none";
        }
    },
    showCodeViewBar:{
        value:function(isCodeView){
            if(isCodeView === true) {
                this.application.ninja.editorViewOptions.element.style.display = "block";
                this.application.ninja.documentBar.element.style.display = "none";
            }else{
                this.application.ninja.documentBar.element.style.display = "block";
                this.application.ninja.editorViewOptions.element.style.display = "none";
            }
        }
    },

    collapseAllPanels:{
        value:function(){
            this.application.ninja.panelSplitter.collapse();
            this.application.ninja.timelineSplitter.collapse();
            this.application.ninja.toolsSplitter.collapse();
            this.application.ninja.optionsSplitter.collapse();
        }
    },
    restoreAllPanels:{
        value:function(){
            this.application.ninja.panelSplitter.restore();
            this.application.ninja.timelineSplitter.restore();
            this.application.ninja.toolsSplitter.restore();
            this.application.ninja.optionsSplitter.restore();
        }
    }
});