/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 			require("montage/core/core").Montage,
	Component = 		require("montage/ui/component").Component,
	BaseDocumentView = 	require("js/document/views/base").BaseDocumentView;
////////////////////////////////////////////////////////////////////////
//	
var CodeDocumentView = exports.CodeDocumentView = Montage.create(BaseDocumentView, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
		enumerable: false,
        value: false
    },

    ////////////////////////////////////////////////////////////////////
    //
    _editor: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    editor: {
        get: function() {return this._editor;},
        set: function(value) {this._editor= value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _textArea: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    textArea: {
        get: function() {return this._textArea;},
        set: function(value) {this._textArea= value;}
    },

     ////////////////////////////////////////////////////////////////////
    //remove _extParentContainer after moving to bucket structure for documents
    _textParentContainer: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    textParentContainer: {
        get: function() {return this._textParentContainer;},
        set: function(value) {this._textParentContainer= value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _textViewContainer: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    textViewContainer: {
        get: function() {return this._textViewContainer;},
        set: function(value) {this._textViewContainer= value;}
    },
    ////////////////////////////////////////////////////////////////////
    //

    /**
     * Public method
     */
    initialize:{
        value: function(){
            //populate _textParentContainer
            this.textParentContainer = document.getElementById("codeViewContainer");

            //create contianer
            this.textViewContainer = document.createElement("div");
            //this.textViewContainer.id = "codemirror_" + uuid;
            this.textViewContainer.style.display = "block";
            this.textParentContainer.appendChild(this.textViewContainer);

            //create text area
            this.textArea = this.createTextAreaElement();
        }
    },

    /**
     * Public method
     * Creates a textarea element which will contain the content of the opened text document.
     */
    createTextAreaElement: {
        value: function() {
            var textArea = document.createElement("textarea");
//            textArea.id = "code";
//            textArea.name = "code";
            this.textViewContainer.appendChild(textArea);

            return textArea;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    /**
     * Public method
     * Creates a new instance of a code editor
     */
    initializeTextView: {
        value: function(file, textDocument) {
            var type;

            if(this.activeDocument) {
                //need to hide only if another document was open before
//                this.application.ninja.documentController._hideCurrentDocument();
//                this.hideOtherDocuments(doc.uuid);
            }

            switch(file.extension) {
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
            this.textViewContainer.style.display="block";

            this.editor = this.application.ninja.codeEditorController.createEditor(this, type, file.extension, textDocument);
            this.editor.hline = this.editor.setLineClass(0, "activeline");


        }
    },
    ////////////////////////////////////////////////////////////////////
    //

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
            //Todo: change for bucket structure of documents
            this.textParentContainer.className = "codeViewContainer "+themeClass;
        }
    }


////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////