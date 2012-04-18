/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 		require("montage/core/core").Montage,
    Component = 	require("montage/ui/component").Component;

var CodeEditorViewOptions = exports.CodeEditorViewOptions = Montage.create(Component, {
        hasReel: {
            value: true
        },

        prepareForDraw: {
            value: function() {
                Object.defineBinding(this.codeCompleteCheck , "checked", {
                  boundObject: this.application.ninja.codeEditorController,
                  boundObjectPropertyPath: "automaticCodeComplete",
                  oneway : false
                });

                Object.defineBinding(this.zoomHottext , "value", {
                  boundObject: this.application.ninja.codeEditorController,
                  boundObjectPropertyPath: "editorFont",
                  oneway : false
                });

            }
        },

        willDraw: {
            enumerable: false,
            value: function() {}
        },
        draw: {
            enumerable: false,
            value: function() {}
        },
        didDraw: {
            enumerable: false,
            value: function() {
                this.format.addEventListener("click", this.handleFormat.bind(this), false);
                this.comment.addEventListener("click", this.handleComment.bind(this), false);
                this.uncomment.addEventListener("click", this.handleUncomment.bind(this), false);
                this.themeSelect.addEventListener("change", this.handleThemeSelection.bind(this), false);
            }
        },

        handleFormat:{
            value: function(evt){
                this.application.ninja.codeEditorController.autoFormatSelection();
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
        }

});