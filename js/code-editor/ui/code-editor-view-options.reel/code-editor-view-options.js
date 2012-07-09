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
                this._currentDocument.model.views.code.editor.automaticCodeHint = this.codeCompleteCheck.checked;
            }

        }
    },

    _codeEditorWrapper:{
        value: null
    },

    codeEditorWrapper:{
        get : function() {
            return this._codeEditorWrapper;
        },
        set : function(value) {
            if(this._codeEditorWrapper !== value){
                this._codeEditorWrapper = value;
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

    _zoomFactor:{
        value: 100
    },

    zoomFactor:{
        get: function(){
            return this._zoomFactor;
        },
        set: function(value){
            this._zoomFactor = value;
            if(this.codeEditorWrapper){this.codeEditorWrapper.handleZoom(value)};
        }
    },

    _automaticCodeHint:{
        value: false
    },

    automaticCodeHint:{
        get: function(){
            return this._automaticCodeHint;
        },
        set: function(value){
            this._automaticCodeHint = value;
            //additing additional meta properties on the editor
            this._currentDocument.model.views.code.editor.automaticCodeHint = value;
        }
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
            if(this.codeEditorWrapper){this.codeEditorWrapper.commentSelection(true)};
        }
    },

    handleUncomment:{
        value: function(evt){
            if(this.codeEditorWrapper){this.codeEditorWrapper.commentSelection(false)};
        }
    },

    handleThemeSelection:{
        value: function(evt){
            if(this.codeEditorWrapper){
                this.codeEditorWrapper.editorTheme = this.themeSelect.options[this.themeSelect.selectedIndex].value;
                this.codeEditorWrapper.handleThemeSelection();
            }
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
