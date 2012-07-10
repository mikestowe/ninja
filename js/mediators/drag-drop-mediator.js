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

var Montage     = require("montage/core/core").Montage,
    Component   = require("montage/ui/component").Component,
    NJUtils     = require("js/lib/NJUtils").NJUtils;

exports.DragDropMediator = Montage.create(Component, {
    dropTarget: {
        value: null,
        writable: true
    },

    dropDelegate: {
        value: null
    },

    deserializedFromTemplate: {
        value: function() {
            this.eventManager.addEventListener("appLoaded", this, false);
        }
    },

    handleAppLoaded: {
        value: function() {
            this.dropTarget = this.application.ninja.stage.drawingCanvas;

            this.dropTarget.addEventListener("dragover", this, false);
            this.dropTarget.addEventListener("dragend", this, false);
            this.dropTarget.addEventListener("drop", this, false);
        }
    },

    handleEvent: {
        value: function(event){
            event.preventDefault();
            event.stopImmediatePropagation();

            switch(event.type) {
                case "dragover":
                    return false;
                case "dragend":
                    return false;
                case "drop":
                    this.handleDropEvent(event);
                    break;
                default:
                    console.log("Default");
                    break;
            }
        }
    },

    handleDropEvent: {
        value: function(e){
            //
            var i, files = e.dataTransfer.files, position = {x: e.offsetX, y: e.offsetY}, self = this;

            var xferString = e.dataTransfer.getData("text/plain");
            if(xferString) {
                // If the drop is a component, call the delegate with the top,left coordinates
                if(xferString.indexOf("componentDrop") > -1) {
                    if(this.dropDelegate && typeof this.dropDelegate === 'object') {
                        this.dropDelegate.handleComponentDrop(e.offsetX - this.application.ninja.stage.userContentLeft, e.offsetY - this.application.ninja.stage.userContentTop);
                        return;
                    }
                }
            }
            //
            for (i=0; files[i]; i++) {
                if (files[i].type.indexOf('image') !== -1) {
                        this.application.ninja.ioMediator.createFileFromBinary(files[i], {"addFileToStage" : self.addImageElement.bind(self), "position": position});

                } else {
                    //TODO: NOT AN IMAGE, HANDLE SPECIAL CASE
                }
            }
            //Not sure why return value should be, seemed as false to work
            return false;
        }
    },

    addImageElement:{
        value: function(status){
            var save = status.save,
                fileName = status.filename,
                url = status.url,
                element, rules, self = this,
                fileType = status.fileType,
                filePosition = status.filePosition ? status.filePosition : {x: "100", y: "100"};

            if (save && save.success && save.status === 201) {
                //
                if (fileType.indexOf('svg') !== -1) {
                    element = NJUtils.make('embed', null, this.application.ninja.currentDocument);//TODO: Verify this is proper
                    element.type = 'image/svg+xml';
                    element.src = url+'/'+fileName;
                } else {
                    element = NJUtils.make('image', null, this.application.ninja.currentDocument);
                    element.src = url+'/'+fileName;
                }
                //Adding element once it is loaded
                element.onload = function () {
                    element.onload = null;
                    self.application.ninja.elementMediator.addElements(element, rules, true);
                };
                //Setting rules of element
                rules = {
                    'position': 'absolute',
                    'top' : (parseInt(filePosition.y) - parseInt(this.application.ninja.stage.userContentTop)) + 'px',
                    'left' : (parseInt(filePosition.x) - parseInt(this.application.ninja.stage.userContentLeft)) + 'px'
                };
                //
                self.application.ninja.elementMediator.addElements(element, rules, false);
            } else {
                //TODO: HANDLE ERROR ON SAVING FILE TO BE ADDED AS ELEMENT
            }
        }
    }
});
