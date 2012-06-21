/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 		require("montage/core/core").Montage,
    Component = 	require("montage/ui/component").Component,
    ElementsClipboardAgent =         require("js/clipboard/internal-ops/elements-clipboard-agent").ElementsClipboardAgent,
    ExternalAppsClipboardAgent= require("js/clipboard/external-apps-clipboard-agent").ExternalAppsClipboardAgent;

var ClipboardController = exports.ClipboardController = Montage.create(Component, {

    deserializedFromTemplate: {
        value: function() {
            document.body.addEventListener("copy", this, false);
            document.body.addEventListener("cut", this, false);
            document.body.addEventListener("paste", this, false);

            //ninja menu events
            this.eventManager.addEventListener("executeCut", this, false);
            this.eventManager.addEventListener("executeCopy", this, false);
            this.eventManager.addEventListener("executePaste", this, false);

        }
    },

    clipboardContext:{
        value : "stage" /* cleanup: formulate better context representation */
    },

    operationsAgent:{//appropriate agent instant required for execution of cut/copy/paste
        value: null
    },

    handleExecuteCopy:{
        value: function(){document.execCommand('copy',false,null);}
    },

    handleExecuteCut:{
        value: function(){document.execCommand('cut',false,null);}
    },

    handleExecutePaste:{
        value: function(){document.execCommand('paste',false,null);}
    },

    handleCopy:{
        value:function(clipboardEvent){
            if(!this.application.ninja.currentDocument
                || (this.application.ninja.currentDocument && this.application.ninja.currentDocument.currentView === "code")){

                return;
            }//for design view only

            // Don't do anything if an input or other control is focused
            if(document.activeElement.nodeName !== "BODY") {
                return;
            }

            if(this.clipboardContext === "stage"){
                ElementsClipboardAgent.copy(clipboardEvent);
            }

            clipboardEvent.preventDefault();
        }
    },

    handleCut:{
        value:function(clipboardEvent){
            if(this.application.ninja.currentDocument.currentView === "code") return;

            // Don't do anything if an input or other control is focused
            if(document.activeElement.nodeName !== "BODY") {
                return;
            }

            if(this.clipboardContext === "stage"){
                ElementsClipboardAgent.cut(clipboardEvent);
            }

            clipboardEvent.preventDefault();
        }
    },

    handlePaste:{
        value:function(clipboardEvent){
            var clipboardData = clipboardEvent.clipboardData,
                ninjaData = clipboardData.getData("ninja");

            if(!this.application.ninja.currentDocument
                || (this.application.ninja.currentDocument && this.application.ninja.currentDocument.currentView === "code")){

                return;
            }//for design view only

            // Don't do anything if an input or other control is focused
            if(document.activeElement.nodeName !== "BODY") {
                return;
            }

            //TODO: return if stage is not focussed

            if(this.clipboardContext === "stage"){
                if(ninjaData){
                    ElementsClipboardAgent.pasteInternal();
                }
                else{
                    ExternalAppsClipboardAgent.paste(clipboardEvent);
                }
            }

            clipboardEvent.preventDefault();
        }
    }


});