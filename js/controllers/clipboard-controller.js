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
    Component =     require("montage/ui/component").Component,
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
