/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
