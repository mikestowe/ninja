/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Popup = require("montage/ui/popup/popup.reel").Popup,
    newFileOptionsNavigatorModule = require("js/io/ui/new-file-dialog/new-file-options-navigator.reel"),
    newFileWorkflowModelModule = require("js/io/ui/new-file-dialog/new-file-workflow-model");
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
            var that = this;
            this.eventManager.addEventListener("executeNewFile", function(evt){
                var data = evt._event.data || {};//data will contain callback
                that.showNewFileDialog(data);
            }, false);

            this.eventManager.addEventListener("saveAs", function(evt){
                var data = evt._event.data || {};//data will contain the current file name, directory location and callback
                that.showSaveAsDialog(data);
            }, false);
        }
    },

    model:{
        writable: true,
        enumerable:true,
        value: newFileWorkflowModelModule.NewFileWorkflowModel
    },

    showNewFileDialog:{
        writable:false,
        enumerable:true,
        value:function(data){
            //get default project type
            this.model.defaultProjectType = "htmlTemplate";
            this.model.callback = data.callback || null;
            this.model.callbackScope = data.callbackScope || null;

            //populate the last opened folder first, if none then populate default root
            var sessionStorage = window.sessionStorage;
            var lastSelectedProjectType = sessionStorage.getItem("lastSelectedProjectType");

            if(!!lastSelectedProjectType){
                this.model.defaultProjectType = lastSelectedProjectType;
            }

            //render modal dialog
            var newFileNavContent = document.createElement("div");
            newFileNavContent.id = "newFileDialog";

            //elements needs to be on DOM to be drawn
            document.getElementById('modalContainer').appendChild(newFileNavContent);

            var newFileOptionsNav = newFileOptionsNavigatorModule.NewFileOptionsNavigator.create();
            newFileOptionsNav.newFileModel = this.model;
            newFileOptionsNav.element = newFileNavContent;

            //remove after rendering and add in modal dialog
            document.getElementById('modalContainer').removeChild(newFileNavContent);

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
            saveAsDialog.callbackScope = data.callbackScope;
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
    }
});