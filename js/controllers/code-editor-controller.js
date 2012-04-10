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

    codeCompletionSupport : {"javascript": true},

    _automaticCodeComplete: {
        value:true
    },

    automaticCodeComplete:{
            get: function(){return this._automaticCodeComplete;},
            set: function(value){this._automaticCodeComplete = value;}
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
            if(true){
                editorOptions.onKeyEvent = function(cm, keyEvent){self._codeCompletionKeyEventHandler.call(self, cm, keyEvent, type)};
            }

            var editor = self.codeEditor.fromTextArea(doc.textArea, editorOptions);
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
                if((keyEvent.ctrlKey || keyEvent.metaKey) && keyEvent.keyCode === 32){//Ctrl-Space
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
            switch(type){
                case "javascript":
                    if((keyEvent.type === "keyup")//need seperate keycode set per mode
                        && ((keyEvent.keyCode > 47 && keyEvent.keyCode < 57)//numbers
                            || (keyEvent.keyCode > 64 && keyEvent.keyCode <91)//letters
                            || (keyEvent.keyCode === 190)//period
                            || (keyEvent.keyCode === 189)//underscore, dash
                           )
                        && !( (keyEvent.keyCode === 219)//open bracket [
                            || (keyEvent.ctrlKey || keyEvent.metaKey)//ctrl
                            || (keyEvent.keyCode === 221)//close bracket ]
                            || (keyEvent.shiftKey && keyEvent.keyCode === 219)//open bracket {
                            || (keyEvent.shiftKey && keyEvent.keyCode === 221)//close bracket }
                            || (keyEvent.shiftKey && keyEvent.keyCode === 57)//open bracket (
                            || (keyEvent.shiftKey && keyEvent.keyCode === 48)//close bracket )
                            || ((keyEvent.ctrlKey || keyEvent.metaKey) && keyEvent.keyCode === 83)//ctrl+S
                           )
                    ){return true;}
                default :
                    return false;
            }
        }
    }

});