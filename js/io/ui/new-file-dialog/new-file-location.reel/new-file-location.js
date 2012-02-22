/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var newFileWorkflowControllerModule = require("js/io/ui/new-file-dialog/new-file-workflow-controller");

var NewFileLocation = exports.NewFileLocation = Montage.create(Component, {

    templateHeight:{
        value:"25 px"
    },

    templateWidth:{
        value:"25 px"
    },

    prepareForDraw: {
        value: function() {
            // Populate the file input field by using the session storage or the default user folder
            var defaultSaveDirectory;

            if(window.sessionStorage) {
                var storedFolder = window.sessionStorage.getItem("lastOpenedFolderURI_folderSelection");
                if(storedFolder)  defaultSaveDirectory = decodeURI(window.sessionStorage.getItem("lastOpenedFolderURI_folderSelection"));
            }

            if(!defaultSaveDirectory) {
                var driveData = this.application.ninja.coreIoApi.getDirectoryContents({uri:"", recursive:false, returnType:"all"});
                if(driveData.success){
                    var topLevelDirectories = (JSON.parse(driveData.content)).children;
                    defaultSaveDirectory = topLevelDirectories[0].uri;
                } else {
                    console.log("** Error ** Cannot get directory listing");
                    defaultSaveDirectory = "";
                }
            }

            this.fileInputField.newFileDirectory.value = defaultSaveDirectory;
        }
    },

    didDraw: {
        value: function() {
            this.fileInputField.selectDirectory = true;

            this.newFileName.addEventListener("keyup", this, false);
        }
    },

    handleKeyup:{
        value:function(evt){
            if(this.newFileName.value !== "") {
                var newFileNameSetEvent = document.createEvent("Events");
                newFileNameSetEvent.initEvent("newFileNameSet", false, false);
                newFileNameSetEvent.newFileName = this.newFileName.value;
                this.eventManager.dispatchEvent(newFileNameSetEvent);
            }
        }
    }

});