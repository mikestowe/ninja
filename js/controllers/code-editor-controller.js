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

    deserializedFromTemplate: {
        value: function() {
            //TODO:add logic to check some configuration file to load the right code editor
            this.codeEditor = CodeMirror;
        }
    },

    createEditor : {
        value:function(doc, type){
            var self = this;
            var editor = self.codeEditor.fromTextArea(doc.textArea, {
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
                               },
                               //extraKeys: {"Ctrl-Space": function(cm) {CodeMirror.simpleHint(cm, CodeMirror.javascriptHint);}}
                               onKeyEvent: function(cm, keyEvent) {
                                    if((keyEvent.type === "keyup")//need seperate keycode set per mode
                                        && ((keyEvent.keyCode > 47 && keyEvent.keyCode < 57)//numbers
                                            || (keyEvent.keyCode > 64 && keyEvent.keyCode <91)//letters
                                            || (keyEvent.keyCode === 190)//period
                                            || (keyEvent.keyCode === 189)//underscore, dash
                                           )
                                        && !( (keyEvent.keyCode === 219)//open bracket [
                                                || (keyEvent.keyCode === 221)//close bracket ]
                                                || (keyEvent.shiftKey && keyEvent.keyCode === 219)//open bracket {
                                                || (keyEvent.shiftKey && keyEvent.keyCode === 221)//close bracket }
                                                || (keyEvent.shiftKey && keyEvent.keyCode === 57)//open bracket (
                                                || (keyEvent.shiftKey && keyEvent.keyCode === 48)//close bracket )
                                           )
                                    ){

                                        self.codeEditor.simpleHint(cm, self.codeEditor.javascriptHint);
                                    }
                               }
                       });

            return editor;
        }
    }

});