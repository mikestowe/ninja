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

    didDraw:{
        value: function() {
            if(!this.application.ninja.documentController._textHolder) this.application.ninja.documentController._textHolder = this.element;
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
                case "html" :
                    type = "htmlmixed";
                    break;
                case "json" :
                    type = "javascript";
                    break;
                case "php" :
                    type = "php";
                    break;
                case "pl" :
                    type = "perl";
                    break;
                case "py" :
                    type = "python";
                    break;
                case "rb" :
                    type = "ruby";
                    break;
                case "xml" :
                    type = "xml";
                    break;
            }
            document.getElementById("codeMirror_"+doc.uuid).style.display="block";

            doc.editor = this.application.ninja.codeEditorController.createEditor(doc, type, doc.documentType);
            doc.editor.hline = doc.editor.setLineClass(0, "activeline");

            this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
            this.application.ninja.documentController.activeDocument = doc;
            this.application.ninja.stage.hideCanvas(true);
            document.getElementById("iframeContainer").style.display="none";//hide the iframe when switching to code view

            this.showCodeViewBar(true);
            this.application.ninja.codeEditorController.applySettings();
            this.collapseAllPanels();
        }
    },

    /**
     * Public method
     * Switches between documents. Document state data is saved and restored whereever applicable
     */
    switchDocument:{
        value: function(doc){


            //focus editor
            if(!!this.application.ninja.documentController.activeDocument && !!this.application.ninja.documentController.activeDocument.editor){
                this.application.ninja.documentController.activeDocument.editor.focus();

                this.showCodeViewBar(true);
                this.application.ninja.codeEditorController.applySettings();
                this.collapseAllPanels();
            }

            if(this.application.ninja.documentController.activeDocument.currentView === "design") {
                this.application.ninja.stage._scrollFlag = true; // TODO HACK to prevent type error on Hide/Show Iframe
                this.application.ninja.stage.stageDeps.reinitializeForSwitchDocument();//reinitialize draw-util, snapmanager and view-util

                this.showCodeViewBar(false);
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
            } else {
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
    },

    applyTheme:{
        value:function(themeClass){
            this.element.className = "codeViewContainer "+themeClass;
        }
    }
});