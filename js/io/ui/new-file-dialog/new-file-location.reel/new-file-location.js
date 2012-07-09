/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var newFileWorkflowControllerModule = require("js/io/ui/new-file-dialog/new-file-workflow-controller");

var NewFileLocation = exports.NewFileLocation = Montage.create(Component, {

    fileInputField: {
        value: null,
        serializable: true
    },

    newFileName: {
        value: null,
        serializable: true
    },

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
