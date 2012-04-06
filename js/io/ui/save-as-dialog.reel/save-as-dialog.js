/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

var SaveAsDialog = exports.SaveAsDialog = Montage.create(Component, {

	hasReel: {
        value: true
    },

    fileName : {
        enumerable: true,
        writable: true,
        value: null
    },

    folderUri:{
        enumerable: true,
        writable: true,
        value: null
    },

    callback : {
        enumerable: true,
        writable: true,
        value: null
    },

    callbackScope : {
        enumerable: true,
        writable: true,
        value: null
    },

    willDraw: {
        enumerable: false,
        value: function() {}
    },
    draw: {
        enumerable: false,
        value: function() {}
    },
    didDraw: {
        enumerable: false,
        value: function() {
            var self = this;
            this.fileInputField.selectDirectory = true;
            this.fileInputField.pickerName = "saveAsDirectoryPicker";
            this.newFileName.value = this.fileName;
            this.fileInputField.newFileDirectory.value = this.folderUri;

            this.newFileName.addEventListener("keyup", function(evt){self.handleNewFileNameOnkeyup(evt);}, false);
            this.newFileName.addEventListener("paste", this, false);
            this.newFileName.addEventListener("search", this, false);
            this.eventManager.addEventListener("newFileDirectorySet", function(evt){self.handleNewFileDirectorySet(evt);}, false);

            this.okButton.addEventListener("click", function(evt){self.handleOkButtonAction(evt);}, false);
            this.cancelButton.addEventListener("click", function(evt){self.handleCancelButtonAction(evt);}, false);

            this.newFileName.focus();
            this.newFileName.select();

            this.enableOk();

            this.element.addEventListener("keyup", function(evt){
                if(evt.keyCode == 27) {//ESC key
                    if(self.application.ninja.newFileController.saveAsDialog !== null){
                        self.handleCancelButtonAction();
                    }
                }else if((evt.keyCode == 13) && !(evt.ctrlKey || evt.metaKey)){//ENTER key
                    if((self.application.ninja.newFileController.saveAsDialog !== null)
                        && !self.okButton.hasAttribute("disabled")){

                        self.handleOkButtonAction();
                    }
                }
            }, true);

        }
    },

    handleNewFileDirectorySet:{
         value:function(evt){
             if(evt.keyCode === 13){
                 if(!this.okButton.hasAttribute("disabled")) this.handleOkButtonAction(evt);
             }else if(evt.keyCode === 27){
                 this.handleCancelButtonAction(evt);
             }
             else{
                 this.folderUri = evt._event.newFileDirectory;
                 if(this.isValidUri(this.folderUri)){
                     this.enableOk();
                 }
             }
         }
     },

    handlePaste:{
        value:function(evt){
            evt.preventDefault();
            evt.target.value = evt.clipboardData.getData("Text");
            this.handleNewFileNameOnkeyup(evt);
        }
    },

    handleNewFileNameOnkeyup:{
          value:function(evt){
              this.fileName = this.newFileName.value;
              if(this.isValidFileName(this.fileName)){
                      this.enableOk();
              }
              if(evt.keyCode === 13){
                  if(!this.okButton.hasAttribute("disabled")){
                      this.handleOkButtonAction(evt);
                  }
              }else if(evt.keyCode === 27){
                  this.handleCancelButtonAction(evt);
              }
          }
    },

    handleSearch:{
        value:function(evt){
            this.handleNewFileNameOnkeyup(evt);
        }
    },

    enableOk:{
        value: function(){
            if(this.isValidFileName(this.fileName) && this.isValidUri(this.folderUri)){
                this.okButton.removeAttribute("disabled");
                this.error.innerHTML="";
            }
        }
    },

    handleCancelButtonAction :{
        value:function(evt){
            //clean up memory
            this.cleanup();

            if(this.popup){
                this.popup.hide();
            }

        }
    },

    handleOkButtonAction:{
        value: function(evt){
            var filename = this.fileName,
                newFileDirectory = this.folderUri,
                success = true;
            if(this.isValidFileName(this.fileName) && this.isValidUri(this.folderUri) && !this.checkFileExists(this.fileName, this.folderUri)){
                try{
                    //validate file name and folder path
                    //check if file already exists
                    if(!!this.callback){//inform document-controller if save successful
                        this.callback({"filename":filename, "destination": newFileDirectory});//document-controller api
                    }else{
                        //send save as event
                        var saveAsEvent = document.createEvent("Events");
                        saveAsEvent.initEvent("saveAsFile", false, false);
                        saveAsEvent.saveAsOptions = {"filename":filename, "destination": newFileDirectory};
                        this.eventManager.dispatchEvent(saveAsEvent);
                    }
                }catch(e){
                        success = false;
                        console.log("[ERROR] Failed to save:  "+ this.fileName + " at "+ newFileDirectory);
                        console.log(e.stack);
                }

                if(success){
                    //clean up memory
                    this.cleanup();

                    if(this.popup){
                        this.popup.hide();
                    }
                }
            }else{
                if(this.error.innerHTML === ""){
                    this.showError("! Name and Location should be valid.");
                }
                //disable ok
                if(!this.okButton.hasAttribute("disabled")){
                    this.okButton.setAttribute("disabled", "true");
                }
            }
        }
    },

    isValidUri:{
        value: function(uri){
            var status= this.application.ninja.coreIoApi.isValidUri(uri);
            if((uri !== null) && !status){
                    this.showError("! Invalid directory.");
            }
            return status;
        }
    },
    isValidFileName:{
        value: function(fileName){
            var status = this.validateFileName(fileName);
            if((fileName !== null) && !status){
                    this.showError("! Invalid file name.");
            }
            return status;
        }
    },
    checkFileExists:{
        value: function(fileName, folderUri, fileType){
            var uri = "", response=null, status=true;
            //prepare absolute uri
            if(/[^/\\]$/g.test(folderUri)){
                folderUri = folderUri + "/";
            }
            if(!!fileType && (fileName.lastIndexOf(fileType) !== (fileName.length - fileType.length))){
                fileName = fileName+fileType;
            }
            uri = ""+folderUri+fileName;
            response= this.application.ninja.coreIoApi.fileExists({"uri":uri});
            if(!!response && response.success && (response.status === 204)){
                status = true;
            }else if(!!response && response.success && (response.status === 404)){
                status = false;
            }else{
                status = false;
            }

            if(status){
                this.showError("! File already exists.");
            }
            return status;
        }
    },

    showError:{
        value:function(errorString){
            this.error.innerHTML = "";
            this.error.innerHTML=errorString;
            //disable ok
            if(!this.okButton.hasAttribute("disabled")){
                this.okButton.setAttribute("disabled", "true");
            }
        }
    },

       /***
         * file name validation
         */
       validateFileName:{
            value: function(fileName){
                var status = false;
                if((fileName !== null) && (fileName !== "")){
                    fileName = fileName.replace(/^\s+|\s+$/g,"");
                    status = !(/[/\\]/g.test(fileName));
                    if(status && navigator.userAgent.indexOf("Macintosh") != -1){//for Mac files beginning with . are hidden
                        status = !(/^\./g.test(fileName));
                    }
                }
                return status;
            }
        },

    cleanup:{
        value:function(){
            var self = this;

            //remove event listener
            this.newFileName.removeEventListener("keyup", function(evt){self.handleNewFileNameOnkeyup(evt);}, false);
            this.eventManager.removeEventListener("newFileDirectorySet", function(evt){self.handleNewFileDirectorySet(evt);}, false);
            this.okButton.removeEventListener("click", function(evt){self.handleOkButtonAction(evt);}, false);
            this.cancelButton.removeEventListener("click", function(evt){self.handleCancelButtonAction(evt);}, false);

            this.application.ninja.newFileController.saveAsDialog = null;
        }
    }

});