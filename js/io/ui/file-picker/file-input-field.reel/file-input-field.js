/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

var FileInputField = exports.FileInputField = Montage.create(Component, {

    didDraw: {
        enumerable: false,
        value: function() {
            var that = this;
            this.findDirectory.identifier = "findDirectory";

            this.findDirectory.addEventListener("click", this, false);

            this.eventManager.addEventListener("pickerSelectionsDone", function(evt){that.handleFileInputPickerSelectionsDone(evt);}, false);

            this.newFileDirectory.addEventListener("keyup", function(evt){that.handleNewFileDirectoryOnkeyup(evt);}, false);
            this.newFileDirectory.addEventListener("paste", this, false);
        }
    },

    /**
     * Either selectDirectory OR selectFile can be true
     * If both are false then the file picker will default to file selection mode
     */

    selectDirectory:{
        writable: true,
        enumerable:false,
        value: false
    },

    pickerName:{
        writable: true,
        enumerable:false,
        value: null
    },

    selectFile:{
        writable: true,
        enumerable:false,
        value: false
    },


    handleFindDirectoryClick: {
        value: function(evt){
            var settings = {};
            if(this.selectDirectory === true){
                settings.inFileMode = false;
                settings.pickerName = this.pickerName || "newFileDirectorySelector";
            }else{
                settings.inFileMode = true;
                settings.pickerName = this.pickerName || "fileSelector";
            }
            settings.callback = this.filePickerCallback.bind(this);

            NJevent("openFilePicker", settings);
        }
    },

    handlePaste:{
        value:function(evt){
            evt.preventDefault();
            evt.target.value = evt.clipboardData.getData("Text");
            this.handleNewFileDirectoryOnkeyup(evt);
        }
    },

    handleNewFileDirectoryOnkeyup:{
          value:function(evt){
              if(this.newFileDirectory.value !== ""){
                  var newFileDirectorySetEvent = document.createEvent("Events");
                  newFileDirectorySetEvent.initEvent("newFileDirectorySet", false, false);
                  newFileDirectorySetEvent.newFileDirectory = this.newFileDirectory.value;
                  newFileDirectorySetEvent.keyCode = evt.keyCode;
                  this.eventManager.dispatchEvent(newFileDirectorySetEvent);
              }
          }
    },

    handleFileInputPickerSelectionsDone:{
        value: function(evt){
            var selectedUri = "";
            if(!!evt._event.selectedItems && evt._event.selectedItems.length > 0){
                selectedUri = evt._event.selectedItems[0];
                this.newFileDirectory.value = selectedUri;

                var newFileDirectorySetEvent = document.createEvent("Events");
                  newFileDirectorySetEvent.initEvent("newFileDirectorySet", false, false);
                  newFileDirectorySetEvent.newFileDirectory = this.newFileDirectory.value;
                  this.eventManager.dispatchEvent(newFileDirectorySetEvent);
            }
        }
    },

    filePickerCallback:{
        value: function(obj){
            var selectedUri = "";
            if(!!obj && obj.uri && obj.uri.length > 0){
                selectedUri = obj.uri[0];
                this.newFileDirectory.value = selectedUri;

                var newFileDirectorySetEvent = document.createEvent("Events");
                  newFileDirectorySetEvent.initEvent("newFileDirectorySet", false, false);
                  newFileDirectorySetEvent.newFileDirectory = this.newFileDirectory.value;
                  this.eventManager.dispatchEvent(newFileDirectorySetEvent);
            }
        }
    }

});