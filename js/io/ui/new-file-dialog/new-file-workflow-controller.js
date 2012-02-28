/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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

            var newFileOptionsNav = newFileOptionsNavigatorModule.NewFileOptionsNavigator.create();
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

            //render modal dialog
            var saveAsDialogContainer = document.createElement("div");
            saveAsDialogContainer.id = "saveAsDialog";

            //elements needs to be on DOM to be drawn
            document.getElementById('modalContainer').appendChild(saveAsDialogContainer);

            var saveAsDialog = saveAsModule.SaveAsDialog.create();
            saveAsDialog.fileName = fileName;
            saveAsDialog.folderUri = folderUri;
            saveAsDialog.callback = data.callback;
            saveAsDialog.element = saveAsDialogContainer;

            //remove after rendering and add in modal dialog
            document.getElementById('modalContainer').removeChild(saveAsDialogContainer);

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