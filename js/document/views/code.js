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
exports.CodeDocumentView = Montage.create(BaseDocumentView, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
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
        set: function(value) {this._editor = value;}
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
        set: function(value) {this._textArea = value;}
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
        set: function(value) {this._textViewContainer = value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    initialize:{
        value: function(parentContainer){
            //create contianer
            this.textViewContainer = document.createElement("div");
            //this.textViewContainer.id = "codemirror_" + uuid;
            this.textViewContainer.style.display = "block";
            parentContainer.appendChild(this.textViewContainer);
            //create text area
            this.textArea = this.createTextAreaElement();
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Creates a textarea element which will contain the content of the opened text document
    createTextAreaElement: {
        value: function() {
            var textArea = document.createElement("textarea");
            //textArea.id = "code";
            //textArea.name = "code";
            this.textViewContainer.appendChild(textArea);
            //Returns textarea element
            return textArea;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Creates a new instance of a code editor
    initializeTextView: {
        value: function(file, textDocument) {
        	//
            var type;
            //
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
            //
            this.textViewContainer.style.display="block";
            //
            this.editor = this.application.ninja.codeEditorWrapper.createEditor(this, type, file.extension, textDocument);
            this.editor.hline = this.editor.setLineClass(0, "activeline");
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    show: {
        value: function (callback) {
        	//
            this.textViewContainer.style.display = "block";
            //
            if (callback) callback();
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    hide: {
        value: function (callback) {
        	//
            this.textViewContainer.style.display = "none";
            //
            if (callback) callback();
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    applyTheme:{
        value:function(themeClass){
            //Todo: change for bucket structure of documents
            this.textViewContainer.className = "codeViewContainer "+themeClass;
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////