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
        value: ""
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
            this.fileInputField.selectDirectory = true;
            this.fileInputField.pickerName = "saveAsDirectoryPicker";
            this.newFileName.value = this.fileName;
            this.fileInputField.newFileDirectory.value = this.folderUri;
        }
    },

    handleCancelButtonAction :{
        value:function(evt){
            //clean up memory
            //this.cleanup();

            if(this.popup){
                this.popup.hide();
            }

        }
    },

    handleOkButtonAction:{
        value: function(evt){
            var filename = this.fileName,
                newFileDirectory = this.newFileDirectory,
                success = true;
            try{
                //validate file name and folder path
                //check if file already exists
                if(!!this.callback && !!this.callbackScope){//inform document-controller if save successful
                    this.callback.call(this.callbackScope, {"filename":filename, "destination": newFileDirectory});//document-controller api
                }else{
                    //send save as event
                    var saveAsEvent = document.createEvent("Events");
                    saveAsEvent.initEvent("saveAsFile", false, false);
                    saveAsEvent.saveAsOptions = {"filename":filename, "destination": newFileDirectory};
                    this.eventManager.dispatchEvent(saveAsEvent);
                }
            }catch(e){
                    success = false;
                    console.log("[ERROR] Failed to save:  "+ this.fileName + " at "+ this.newFileDirectory);
            }

            if(success){
                //clean up memory
                //this.cleanup();

                if(this.popup){
                    this.popup.hide();
                }
            }
        }
    },

    isValidUri:{
        value: function(uri){
            var isWindowsUri=false, isUnixUri=false,status=false;
            if(uri !== ""){
                uri = uri.replace(/^\s+|\s+$/g,"");  // strip any leading or trailing spaces

                //for local machine folder uri
                isWindowsUri = /^([a-zA-Z]:)(\\[^<>:"/\\|?*]+)*\\?$/gi.test(uri);
                isUnixUri = /^(\/)?(\/(?![.])[^/]*)*\/?$/gi.test(uri);//folders beginning with . are hidden on Mac / Unix
                status = isWindowsUri || isUnixUri;
                if(isWindowsUri && isUnixUri){status = false;}
            }
            return status;
        }
    },
    isValidFileName:{
        value: function(fileName){
            var status = false;
            if(fileName !== ""){
                fileName = fileName.replace(/^\s+|\s+$/g,"");
                status = !(/[/\\]/g.test(fileName));
                if(status && navigator.userAgent.indexOf("Macintosh") != -1){//for Mac files beginning with . are hidden
                    status = !(/^\./g.test(fileName));
                }
            }
            return status;
        }
    }

});