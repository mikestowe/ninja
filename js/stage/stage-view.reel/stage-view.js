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

    didDraw:{
        value: function() {
            if(!this.application.ninja.documentController._textHolder) this.application.ninja.documentController._textHolder = this.element;
        }
    },

    /**
     * Public method
     * Switches between documents. Document state data is saved and restored whereever applicable
     */
    switchDocument:{
        value: function(doc){
            this.application.ninja.documentController._hideCurrentDocument();
            this.application.ninja.documentController.activeDocument = doc;

            if(this.application.ninja.documentController.activeDocument.currentView === "design") {
                this.application.ninja.currentDocument = this.application.ninja.documentController.activeDocument;
            }

            this.application.ninja.stage._scrollFlag = false;    // TODO HACK to prevent type error on Hide/Show Iframe


//            this.application.ninja.documentController._showCurrentDocument();
            // Inline function below
            if(this.activeDocument) {
                this.activeDocument.container.style["display"] = "block";
                if(this.activeDocument.currentView === "design"){
                    this.activeDocument.container.parentNode.style["display"] = "block";
                    this.activeDocument.restoreAppState();
                } else {
                    //hide the iframe when switching to code view
                    document.getElementById("iframeContainer").style.display = "none";
                }
            }


            //focus editor
            if(!!this.application.ninja.documentController.activeDocument && !!this.application.ninja.documentController.activeDocument.editor){
                this.application.ninja.documentController.activeDocument.editor.focus();

                this.showCodeViewBar(true);
                this.application.ninja.codeEditorController.applySettings();
                this.collapseAllPanels();
            }

            if(this.application.ninja.documentController.activeDocument.currentView === "design") {
                this.application.ninja.stage._scrollFlag = true; // TODO HACK to prevent type error on Hide/Show Iframe
                this.application.ninja.stage.stageDeps.reinitializeForSwitchDocument();//reinitialize draw-util, snapmanager and view-util

                this.showCodeViewBar(false);
                this.restoreAllPanels();
            }

            NJevent("switchDocument");
        }
    },

    showRulers:{
        value:function(){
            this.application.ninja.rulerTop.style.display = "block";
            this.application.ninja.rulerLeft.style.display = "block";
        }
    },
    hideRulers:{
        value:function(){
            this.application.ninja.rulerTop.style.display = "none";
            this.application.ninja.rulerLeft.style.display = "none";
        }
    }

});