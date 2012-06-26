/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 		require("montage/core/core").Montage,
    Component = 	require("montage/ui/component").Component;

exports.CodeEditorViewOptions = Montage.create(Component, {

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

            if(!value || this._currentDocument.currentView === "design") {
                this.visible = false;
            } else {
                this.visible = true;
                this.autocomplete = !this.codeCompletionSupport[this._currentDocument.model.file.extension];
            }

        }
    },

    _visible: {
        value: false
    },

    visible: {
        get: function() {
            return this._visible;
        },
        set: function(value) {
            if(this._visible !== value) {
                this._visible = value;
                this.needsDraw = true;
            }
        }
    },

    autoCompleteLabel: {
        value: null,
        serializable: true
    },

    _autocomplete: {
        value: false
    },

    autocomplete: {
        get: function() {
            return this._autocomplete;
        },
        set: function(value) {
            if(this._autocomplete !== value) {
                this._autocomplete = value;
                this.needsDraw = true;
            }
        }
    },

    codeCompletionSupport : {
        value: {"js": true}
    },

    codeCompleteCheck: {
        value: null,
        serializable: true
    },

    zoomHottext: {
        value: null,
        serializable: true
    },

    comment: {
        value: null,
        serializable: true
    },

    uncomment: {
        value: null,
        serializable: true
    },

    themeSelect: {
        value: null,
        serializable: true
    },

    shortKeys: {
        value: null,
        serializable: true
    },

    prepareForDraw: {
        value: function() {
            //this.format.addEventListener("click", this.handleFormat.bind(this), false);
            this.comment.addEventListener("click", this.handleComment.bind(this), false);
            this.uncomment.addEventListener("click", this.handleUncomment.bind(this), false);
            this.themeSelect.addEventListener("change", this.handleThemeSelection.bind(this), false);
            this.shortKeys.addEventListener("click", this.handleShortKeys.bind(this), false);

            Object.defineBinding(this.zoomHottext , "value", {
              boundObject: this.application.ninja.codeEditorController,
              boundObjectPropertyPath: "zoomFactor",
              oneway : false
            });

            Object.defineBinding(this.codeCompleteCheck , "checked", {
              boundObject: this.application.ninja.codeEditorController,
              boundObjectPropertyPath: "automaticCodeComplete",
              oneway : false
            });

        }
    },

    draw: {
        value: function() {
            if(this.visible) {
                this.element.style.display = "block";
            } else {
                this.element.style.display = "none";
            }

            if(this.autocomplete) {
                this.autoCompleteLabel.classList.add("disabled");
            } else {
                this.autoCompleteLabel.classList.remove("disabled");
            }

            this.codeCompleteCheck.checked = false;
        }
    },

    getSelectedRange:{
        value:function(editor){
            return { from: editor.getCursor(true), to: editor.getCursor(false) };
        }
    },

    handleFormat:{
        value: function(evt){
            var range = this.getSelectedRange(this.currentDocument.model.views.code.editor);
            this.currentDocument.model.views.code.editor.autoFormatRange(range.from, range.to);
        }
    },

    handleComment:{
        value: function(evt){
            this.application.ninja.codeEditorController.commentSelection(true);
        }
    },

    handleUncomment:{
        value: function(evt){
            this.application.ninja.codeEditorController.commentSelection(false);
        }
    },

    handleThemeSelection:{
        value: function(evt){
            this.application.ninja.codeEditorController.editorTheme = this.themeSelect.options[this.themeSelect.selectedIndex].value;
            this.application.ninja.codeEditorController.handleThemeSelection();
        }
    },

    handleShortKeys:{
        value:function(evt){
            var list = this.shortKeys.querySelector(".list");
            if(list && list.classList.contains("hide")){
                list.classList.remove("hide");
                list.classList.add("show");
            }else if(list && list.classList.contains("show")){
                list.classList.remove("show");
                list.classList.add("hide");
            }
        }
    }

});