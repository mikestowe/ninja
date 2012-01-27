/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/**
@requires montage/core/core
@requires montage/ui/component
*/
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.StageView = Montage.create(Component, {
    _documents: {
        value : []
    },

    docs: {
        get: function() {
            return this._documents;
        },
        set: function(value) {
            //console.log(value);
        }
    },

    templateDidLoad: {
        value: function() {
            this.eventManager.addEventListener("appLoaded", this, false);
            //console.log(this.application.ninja.documentController._documents);
        }
    },

    handleAppLoaded: {
        value: function() {

            // Don't bind for now
            /*
            Object.defineBinding(this, "docs", {
              boundObject: this.application.ninja.documentController,
              boundObjectPropertyPath: "_documents"
            });
            */

        }
    },

    // Temporary function to create a Codemirror text view
    createTextView: {
        value: function(doc) {
//            DocumentManager._hideCurrentDocument();

            this.application.ninja.currentDocument.container.parentNode.style["display"] = "none";

//            stageManagerModule.stageManager._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe
//            DocumentManager.activeDocument = doc;

            this.element.appendChild(doc.textArea);


            var codeM = CodeMirror.fromTextArea(doc.textArea, {
                lineNumbers: true,
                       mode: "javascript"
//                       onCursorActivity: function() {
//                           DocumentManager._codeEditor.editor.setLineClass(DocumentManager._codeEditor.hline, null);
//                           DocumentManager._codeEditor.hline = DocumentManager._codeEditor.editor.setLineClass(DocumentManager._codeEditor.editor.getCursor().line, "activeline");
//                       }
           });

//           DocumentManager._codeEditor.hline = DocumentManager._codeEditor.editor.setLineClass(0, "activeline");

            this.application.ninja.stage.hideCanvas(true);

        }
    }
});