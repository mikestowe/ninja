/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage =           require("montage/core/core").Montage,
    Component =         require("montage/ui/component").Component,
    BaseDocumentView =  require("js/document/views/base").BaseDocumentView;
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
