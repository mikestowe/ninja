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
        enumerable: true,
        value:"25 px"
    },

    templateWidth:{
        enumerable: true,
        value:"25 px"
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
            var that=this;

            this.fileInputField.selectDirectory = true;

            this.newFileName.addEventListener("blur", function(evt){that.handleNewFileNameOnblur(evt);}, false);
    }

    },

    handleNewFileNameOnblur:{
          value:function(evt){
              if(this.newFileName.value !== ""){
                  var newFileNameSetEvent = document.createEvent("Events");
                  newFileNameSetEvent.initEvent("newFileNameSet", false, false);
                  newFileNameSetEvent.newFileName = this.newFileName.value;
                  this.eventManager.dispatchEvent(newFileNameSetEvent);
              }
          }
    }

});