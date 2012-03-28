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

    didDraw: {
        value: function() {
            this.fileInputField.selectDirectory = true;

            this.newFileName.addEventListener("keyup", this, false);
            this.newFileName.addEventListener("paste", this, false);
			this.newFileName.focus();
            this.newFileName.select();
        }
    },

    handlePaste:{
        value:function(evt){
            var self=this;
            setTimeout(function(){
                self.handleKeyup(evt);
            }, 1);
        }
    },

    handleKeyup:{
        value:function(evt){
            if(this.newFileName.value !== "") {
                var newFileNameSetEvent = document.createEvent("Events");
                newFileNameSetEvent.initEvent("newFileNameSet", false, false);
                newFileNameSetEvent.newFileName = this.newFileName.value;
                newFileNameSetEvent.keyCode = evt.keyCode;
                this.eventManager.dispatchEvent(newFileNameSetEvent);
            }
        }
    }

});