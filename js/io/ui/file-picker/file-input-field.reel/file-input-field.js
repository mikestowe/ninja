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

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

var FileInputField = exports.FileInputField = Montage.create(Component, {

    findDirectory: {
        value: null,
        serializable: true
    },

    newFileDirectory: {
        value: null,
        serializable: true
    },

    didDraw: {
        enumerable: false,
        value: function() {
            var that = this;
            this.findDirectory.identifier = "findDirectory";
            this.findDirectory.addEventListener("click", this, false);
            this.eventManager.addEventListener("pickerSelectionsDone", this.handleFileInputPickerSelectionsDone, false);
            this.addPropertyChangeListener("newFileDirectory.value", this.handleNewFileDirectoryChange, false);
            this.newFileDirectory.element.addEventListener("keyup", this, false);
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

    handleNewFileDirectoryChange:{
          value:function(evt){
              var newFileDirectorySetEvent = document.createEvent("Events");
              newFileDirectorySetEvent.initEvent("newFileDirectorySet", false, false);
              newFileDirectorySetEvent.newFileDirectory = this.newFileDirectory.value;
              newFileDirectorySetEvent.keyCode = evt.keyCode;
              this.eventManager.dispatchEvent(newFileDirectorySetEvent);
          }
    },


    handleKeyup:{
        value: function(evt){
            if(evt.keyCode === 13){
                var enterKeyupEvent = document.createEvent("Events");
                enterKeyupEvent.initEvent("enterKey", false, false);
                this.eventManager.dispatchEvent(enterKeyupEvent);
            }else if(evt.keyCode === 27){
                var escKeyupEvent = document.createEvent("Events");
                escKeyupEvent.initEvent("escKey", false, false);
                this.eventManager.dispatchEvent(escKeyupEvent);
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
                this.newFileDirectory.element.focus();
                var newFileDirectorySetEvent = document.createEvent("Events");
                  newFileDirectorySetEvent.initEvent("newFileDirectorySet", false, false);
                  newFileDirectorySetEvent.newFileDirectory = this.newFileDirectory.value;
                  this.eventManager.dispatchEvent(newFileDirectorySetEvent);
            }
        }
    }

});
