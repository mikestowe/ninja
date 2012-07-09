/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
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
var Montage =       require("montage/core/core").Montage,
    Component =     require("montage/ui/component").Component;

exports.CodeEditorWrapper = Montage.create(Component, {
    hasTemplate: {
        value: false
    },

    _currentDocument: {
        value : null
    },

    currentDocument : {
        get : function() {
            return this._currentDocument;
        },
        set : function(value) {
            if (value === this._currentDocument) {
                return;
            }

            this._currentDocument = value;

            if(!value) {

            } else if(this._currentDocument.currentView === "code") {
                this.autocomplete = this.codeCompletionSupport[this._currentDocument.model.file.extension];
                this._currentDocument.model.views.code.editor.focus();

                this.applySettings();
            }
        }
    },

    _codeEditor : {
        value:null
    },

    codeEditor:{
        get: function(){return this._codeEditor;},
        set: function(value){this._codeEditor = value;}
    },

    codeCompletionSupport : {
        value: {"js": true}
    },

    autocomplete: {
        value: false
    },

    _editorTheme: {
        value:"default"
    },

    editorTheme:{
        get: function(){
            return this._editorTheme;
        },
        set: function(value){
            this._editorTheme = value;
        }
    },

    _zoomFactor: {
        value:100
    },

    zoomFactor:{
        get: function() {
            return this._zoomFactor;
        },
        set: function(value) {
            if(value !== this._zoomFactor){
                this._zoomFactor = value;
                this.handleZoom(value);
            }
        }
    },

    deserializedFromTemplate: {
        value: function() {
            this.codeEditor = CodeMirror;
        }
    },

    /**
     * Public method
     * Creates an editor instance
     */
    createEditor : {
        value:function(codeDocumentView, type, documentType, textDocument){
            var self = this, editorOptions = null;

            if(!this.application.ninja.editorViewOptions.codeEditorWrapper){
                this.application.ninja.editorViewOptions.codeEditorWrapper = this;
            }

            editorOptions = {
                               lineNumbers: true,
                               matchBrackets:true,
                               mode: type,
                               onChange: function(){
                                   var historySize = codeDocumentView.editor.historySize();
                                   if(historySize.undo>0){
                                       textDocument.model.needsSave = true;
                                   }else if(historySize.undo===0 && historySize.redo>0){
                                       textDocument.model.needsSave = false;
                                   }
                               },
                               onCursorActivity: function() {
                                   codeDocumentView.editor.matchHighlight("CodeMirror-matchhighlight");
                                   codeDocumentView.editor.setLineClass(codeDocumentView.editor.hline, null, null);
                                   codeDocumentView.editor.hline = codeDocumentView.editor.setLineClass(codeDocumentView.editor.getCursor().line, null, "activeline");
                               }
                           };

            //configure auto code completion if it is supported for that document type

            this.autocomplete = this.codeCompletionSupport[documentType];

            if(this.autocomplete) {

                editorOptions.onKeyEvent = function(cm, keyEvent){
                    self._codeCompletionKeyEventHandler.call(self, cm, keyEvent, documentType)
                };

            }

            return self.codeEditor.fromTextArea(codeDocumentView.textArea, editorOptions);
        }
    },

    /**
     * Private method
     * key event handler for showing code completion dropdown
     */
    _codeCompletionKeyEventHandler:{
        enumerable:false,
        value: function(cm, keyEvent, documentType) {
            //comment shortkeys
            if((keyEvent.metaKey || keyEvent.ctrlKey) && !keyEvent.shiftKey && keyEvent.keyCode === 191){//ctrl+/
                this.commentSelection(true);
                return;
            }
            //uncomment shortkeys
            if((keyEvent.metaKey || keyEvent.ctrlKey) && keyEvent.shiftKey && keyEvent.keyCode === 191){//ctrl+shift+/
                this.commentSelection(false);
                return;
            }

            //===manually triggered code completion
            if((this.currentDocument.model.views.code.editor.automaticCodeHint === false)){
                if(keyEvent.ctrlKey && keyEvent.keyCode === 32){//Ctrl+Space
                    this.codeEditor.simpleHint(cm, this.codeEditor.javascriptHint);
                }
            }
            //===automatic auto complete [performance is slower]
            else if(this._showAutoComplete(documentType, keyEvent)){
                this.codeEditor.simpleHint(cm, this.codeEditor.javascriptHint);
            }
       }
    },

    /**
     * Private method
     * checks for valid keyset to show code completion dropdown
     */
    _showAutoComplete : {
        enumerable:false,
        value:function(documentType, keyEvent){
            var status=false;

            if((keyEvent.metaKey || keyEvent.ctrlKey) &&  (keyEvent.keyCode === 83)){//ctrl+s
                return false;
            }

            switch(documentType){
                case "js":
                    if((keyEvent.type === "keyup")//need seperate keycode set per mode
                        && ((keyEvent.keyCode > 47 && keyEvent.keyCode < 57)//numbers
                            || (keyEvent.keyCode > 64 && keyEvent.keyCode <91)//letters
                            || (keyEvent.keyCode === 190)//period
                            || (keyEvent.keyCode === 189)//underscore, dash
                           )
                        && !(keyEvent.ctrlKey //ctrl
                            || keyEvent.metaKey//cmd
                            || (keyEvent.keyCode === 219)//open bracket [
                            || (keyEvent.keyCode === 221)//close bracket ]
                            || (keyEvent.shiftKey && keyEvent.keyCode === 219)//open bracket {
                            || (keyEvent.shiftKey && keyEvent.keyCode === 221)//close bracket }
                            || (keyEvent.shiftKey && keyEvent.keyCode === 57)//open bracket (
                            || (keyEvent.shiftKey && keyEvent.keyCode === 48)//close bracket )
                           )
                    ){
                        status = true;
                        break;
                    }
                default :
                    status = false;
            }

            return status;
        }
    },

    getSelectedRange:{
        value:function(editor){
            return { from: editor.getCursor(true), to: editor.getCursor(false) };
        }
    },

    commentSelection:{
        value: function(isComment){
            var range = this.getSelectedRange(this.currentDocument.model.views.code.editor);
            this.currentDocument.model.views.code.editor.commentRange(isComment, range.from, range.to);
        }
    },

    handleThemeSelection:{
        value: function(){
            this.currentDocument.model.views.code.editor.setOption("theme", this.editorTheme);
            this.currentDocument.model.views.code.applyTheme("cm-s-"+this.editorTheme);
        }
    },

    handleZoom:{
        value:function(value){
            var originalFont=13,originalLineHeight=16;
            this._zoomFactor = value;
            this.currentDocument.model.views.code.textViewContainer.style.fontSize = ""+((value/100)*originalFont)+"px";
            this.currentDocument.model.views.code.textViewContainer.style.cursor = "text";
            this.currentDocument.model.views.code.textViewContainer.querySelector(".CodeMirror").style.lineHeight = ""+((value/100)*originalLineHeight)+"px";
            this.currentDocument.model.views.code.editor.refresh();//refresh editor display for xoom
        }
    },

    applySettings:{
        value:function(){
            //set theme
            this.handleThemeSelection();
            //set zoom
            this.handleZoom(this._zoomFactor);
        }
    }
});
