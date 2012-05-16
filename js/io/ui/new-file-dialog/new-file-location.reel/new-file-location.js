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

            this.addPropertyChangeListener("newFileName.value", this.newFileNameChange, false);
            this.newFileName.element.addEventListener("keyup", this, false);
			this.newFileName.element.focus();
            this.newFileName.element.select();
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

    newFileNameChange:{
        value:function(evt){
            var newFileNameSetEvent = document.createEvent("Events");
            newFileNameSetEvent.initEvent("newFileNameSet", false, false);
            newFileNameSetEvent.newFileName = this.newFileName.value;
            newFileNameSetEvent.keyCode = evt.keyCode;
            this.eventManager.dispatchEvent(newFileNameSetEvent);
        }
    }
});