/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 		require("montage/core/core").Montage,
    Component = 	require("montage/ui/component").Component;

var CodeEditorController = exports.CodeEditorController = Montage.create(Component, {
    hasTemplate: {
        value: false
    },

    _codeEditor : {
        value:null
    },

    codeEditor:{
        get: function(){return this._codeEditor;},
        set: function(value){this._codeEditor = value;}
    },

    codeCompletionSupport : {
        value: {"javascript": true}
    },

    _automaticCodeComplete: {
        value:false
    },

    automaticCodeComplete:{
        get: function(){return this._automaticCodeComplete;},
        set: function(value){this._automaticCodeComplete = value;}
    },

    _editorTheme: {
        value:"default"
    },

    editorTheme:{
        get: function(){return this._editorTheme;},
        set: function(value){this._editorTheme = value;}
    },

    _zoomFactor:{
        value:100
    },

    zoomFactor:{
        get: function(){return this._zoomFactor;},
        set: function(value){
            this.handleZoom(value);
        }
    },

    deserializedFromTemplate: {
        value: function() {
            //TODO:add logic to check some configuration file to load the right code editor
            this.codeEditor = CodeMirror;
        }
    },

    /**
     * Public method
     * Creates an editor instance
     */
    createEditor : {
        value:function(doc, type){
            var self = this, editorOptions = null;

            editorOptions = {
                               lineNumbers: true,
                               matchBrackets:true,
                               mode: type,
                               onChange: function(){
                                   var historySize = doc.editor.historySize();
                                   if(historySize.undo>0){
                                        doc.needsSave = true;
                                   }else if(historySize.undo===0 && historySize.redo>0){
                                       doc.needsSave = false;
                                   }
                               },
                               onCursorActivity: function() {
                                   doc.editor.matchHighlight("CodeMirror-matchhighlight");
                                   doc.editor.setLineClass(doc.editor.hline, null, null);
                                   doc.editor.hline = doc.editor.setLineClass(doc.editor.getCursor().line, null, "activeline");
                               }
                           };

            //configure auto code completion if it is supported for that document type
            if(this.codeCompletionSupport[type] === true){
                editorOptions.onKeyEvent = function(cm, keyEvent){self._codeCompletionKeyEventHandler.call(self, cm, keyEvent, type)};
            }

            var editor = self.codeEditor.fromTextArea(doc.textArea, editorOptions);

            //editor.setOption("theme", "night");

            return editor;
        }
    },

    /**
     * Private method
     * key event handler for showing code completion dropdown
     */
    _codeCompletionKeyEventHandler:{
        enumerable:false,
        value: function(cm, keyEvent, type) {
            //===manually triggered code completion
            if((this.automaticCodeComplete === false)){
                if(keyEvent.ctrlKey && keyEvent.keyCode === 32){//Ctrl+Space
                    this.codeEditor.simpleHint(cm, this.codeEditor.javascriptHint);
                }
            }
            //===automatic auto complete [performance is slower]
            else if(this._showAutoComplete(type, keyEvent)){
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
        value:function(type, keyEvent){
            var status=false;

            switch(type){
                case "javascript":
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

    handleCodeCompletionSupport:{
        value:function(fileType){
            var autoCodeCompleteElem = document.getElementsByClassName("autoCodeComplete")[0], elems=null, i=0;
            if(autoCodeCompleteElem){
                elems = autoCodeCompleteElem.getElementsByTagName("*");
            }

            if(elems && (this.codeCompletionSupport[fileType] === true)){
                //enable elements
                for(i=0;i<elems.length;i++){
                    if(elems[i].hasAttribute("disabled")){
                        elems[i].removeAttribute("disabled");
                    }
                    if(elems[i].classList.contains("disabled")){
                        elems[i].classList.remove("disabled");
                    }
                }
            }else if(elems && !this.codeCompletionSupport[fileType]){
                //disable elements
                for(i=0;i<elems.length;i++){
                    if(!elems[i].hasAttribute("disabled")){
                        elems[i].setAttribute("disabled", "disabled");
                    }
                    if(!elems[i].classList.contains("disabled")){
                        elems[i].classList.add("disabled");
                    }
                }
            }
        }
    },

    getSelectedRange:{
        value:function(editor){
            return { from: editor.getCursor(true), to: editor.getCursor(false) };
        }
    },

    autoFormatSelection:{
        value: function(){
            var range = this.getSelectedRange(this.application.ninja.documentController.activeDocument.editor);
            this.application.ninja.documentController.activeDocument.editor.autoFormatRange(range.from, range.to);
        }
    },

    commentSelection:{
        value: function(isComment){
            var range = this.getSelectedRange(this.application.ninja.documentController.activeDocument.editor);
            this.application.ninja.documentController.activeDocument.editor.commentRange(isComment, range.from, range.to);
        }
    },

    handleThemeSelection:{
        value: function(){
            this.application.ninja.documentController.activeDocument.editor.setOption("theme", this.editorTheme);
            this.application.ninja.stage.stageView.applyTheme("cm-s-"+this.editorTheme);
        }
    },

    handleZoom:{
        value:function(value){
            var originalFont=13,originalLineHeight=16;
            this._zoomFactor = value;
            this.application.ninja.documentController.activeDocument.container.style.fontSize = ""+((value/100)*originalFont)+"px";
            this.application.ninja.documentController.activeDocument.container.style.cursor = "text";
            this.application.ninja.documentController.activeDocument.container.querySelector(".CodeMirror").style.lineHeight = ""+((value/100)*originalLineHeight)+"px";
            this.application.ninja.documentController.activeDocument.editor.refresh();//refresh editor display for xoom
        }
    },

    applySettings:{
        value:function(){
            //set theme
            this.handleThemeSelection();
            //check autocomplete support
            this.handleCodeCompletionSupport(this.application.ninja.documentController.activeDocument.editor.getOption("mode"));
            //set zoom
            this.handleZoom(this._zoomFactor);
        }
    }
});