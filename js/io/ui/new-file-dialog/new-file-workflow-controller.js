/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Popup = require("montage/ui/popup/popup.reel").Popup,
    newFileOptionsNavigatorModule = require("js/io/ui/new-file-dialog/new-file-options-navigator.reel"),
    newFileWorkflowModelModule = require("js/io/ui/new-file-dialog/new-file-workflow-model").NewFileWorkflowModel;
    saveAsModule = require("js/io/ui/save-as-dialog.reel");

//singleton
var NewFileWorkflowController =  exports.NewFileWorkflowController = Montage.create(require("montage/ui/component").Component, {
    /**
     * Register a listener for showPicker event
     */
    deserializedFromTemplate:{
        writable:false,
        enumerable:true,
        value:function(){
        }
    },

    model:{
        enumerable:true,
        value: null
    },

    newFileOptionsNav:{
        enumerable:true,
        value: null
    },

    saveAsDialog:{
        enumerable:true,
        value: null
    },

    showNewFileDialog:{
        writable:false,
        enumerable:true,
        value:function(data){
            this.model = newFileWorkflowModelModule;

            //read file descriptor to populate model
            this.model.projectTypeData = this.loadDescriptor("js/io/templates/descriptor.json");

            //get default project type
            this.model.defaultProjectType = "js/io/templates/files/html.txt";
            this.model.callback = data.callback || null;
            this.model.callbackScope = data.callbackScope || null;

            //populate the last opened folder first, if none then populate default root
            var sessionStorage = window.sessionStorage;
            var lastSelectedProjectType = sessionStorage.getItem("lastSelectedProjectType");

            if(!!lastSelectedProjectType){
                this.model.defaultProjectType = lastSelectedProjectType;
            }

            var newFileOptionsNav = this.newFileOptionsNav = newFileOptionsNavigatorModule.NewFileOptionsNavigator.create();
            newFileOptionsNav.newFileModel = this.model;

            var popup = Popup.create();
            popup.content = newFileOptionsNav;
            popup.modal = true;
            popup.type = "newFileDialog";
            popup.show();

            newFileOptionsNav.popup = popup;//handle to be used for hiding the popup

        }
    },

    showSaveAsDialog:{
        writable:false,
        enumerable:true,
        value:function(data){
            var fileName = data.fileName || "filename.txt";
            var folderUri = data.folderUri || "/Documents";

            var saveAsDialog = this.saveAsDialog = saveAsModule.SaveAsDialog.create();
            saveAsDialog.fileName = fileName;
            saveAsDialog.folderUri = folderUri;
            saveAsDialog.callback = data.callback;

            var popup = Popup.create();
            popup.content = saveAsDialog;
            popup.modal = true;
            popup.type = "saveAsDialog";
            popup.show();

            saveAsDialog.popup = popup;//handle to be used for hiding the popup
        }
    },

    loadDescriptor:{
        value: function(descriptorPath){
            var content = null, descriptorObj=null;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", descriptorPath, false);
            xhr.send();
            if (xhr.readyState === 4) {
                if(xhr.status == 200) {
                    content = xhr.responseText;
                }
            }
            if(!!content && (content.length > 0)){
                try{
                    descriptorObj = JSON.parse(content);
                }catch(e){
                    console.log(e,stack);
                }
            }
            return descriptorObj;
        }
    }
});
