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
        	var i, files = e.dataTransfer.files, position = {x: e.offsetX, y: e.offsetY},
        		rootUrl = this.application.ninja.coreIoApi.rootUrl+escape((this.application.ninja.documentController.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1])),
        		rootUri = this.application.ninja.documentController.documentHackReference.root;

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
        			var reader = new FileReader(), file = reader.readAsArrayBuffer(files[i]);
        			reader.fileName = files[i].name, reader.fileType = files[i].type, reader.rootUrl = rootUrl, reader.rootUri = rootUri, reader.filePosition = position;
        			reader.onload = function (e) {
        				//
        				var url, uri, dir, save, counter, tempName, element, rules, fileName;
        				if (this.application.ninja.coreIoApi.directoryExists({uri: e.currentTarget.rootUri+'images'}).status === 204) {
        					uri = e.currentTarget.rootUri+'images';
        					url = e.currentTarget.rootUrl+'images';
        				} else if (this.application.ninja.coreIoApi.directoryExists({uri: e.currentTarget.rootUri+'img'}).status === 204) {
        					uri = e.currentTarget.rootUri+'img';
        					url = e.currentTarget.rootUrl+'img';
        				} else {
        					dir = this.application.ninja.coreIoApi.createDirectory({uri: e.currentTarget.rootUri+'images'});
        					if (dir.success && dir.status === 201) {
        						uri = e.currentTarget.rootUri+'images';
        						url = e.currentTarget.rootUrl+'images';
        					} else {
        						//TODO: HANDLE ERROR ON CREATING FOLDER
        					}
        				}
        				//
        				if (this.application.ninja.coreIoApi.fileExists({uri: uri+'/'+e.currentTarget.fileName}).status === 404) {
        					save = this.application.ninja.coreIoApi.createFile({uri: uri+'/'+e.currentTarget.fileName, contents: e.currentTarget.result, contentType: e.currentTarget.fileType});
        					fileName = e.currentTarget.fileName;
        				} else {
        					counter = 1;
        					tempName = e.currentTarget.fileName.split('.'+(e.currentTarget.fileName.split('.')[e.currentTarget.fileName.split('.').length-1]))[0];
        					tempName += '_'+counter+'.'+(e.currentTarget.fileName.split('.')[e.currentTarget.fileName.split('.').length-1]);
        					while (this.application.ninja.coreIoApi.fileExists({uri: uri+'/'+tempName}).status !== 404) {
        						counter++;
        						tempName = e.currentTarget.fileName.split('.'+(e.currentTarget.fileName.split('.')[e.currentTarget.fileName.split('.').length-1]))[0];
        						tempName += '_'+counter+'.'+(e.currentTarget.fileName.split('.')[e.currentTarget.fileName.split('.').length-1]);
        					}
        					save = this.application.ninja.coreIoApi.createFile({uri: uri+'/'+tempName, contents: e.currentTarget.result, contentType: e.currentTarget.fileType});
        					fileName = tempName;
        				}
        				if (save && save.success && save.status === 201) {
                            var self = this;
        					//
        					if (e.currentTarget.fileType.indexOf('svg') !== -1) {
        						element = NJUtils.makeNJElement('embed', 'SVG', 'block');//TODO: Verify this is proper
        						element.type = 'image/svg+xml';
                    			element.src = url+'/'+fileName;
        					} else {
        						element = NJUtils.makeNJElement('image', 'image', 'image');
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
                    					'top' : (parseInt(e.currentTarget.filePosition.y) - parseInt(this.application.ninja.stage.userContentTop)) + 'px',
                    					'left' : (parseInt(e.currentTarget.filePosition.x) - parseInt(this.application.ninja.stage.userContentLeft)) + 'px'
                			};
                			//
                			self.application.ninja.elementMediator.addElements(element, rules, false);
        				} else {
        					//TODO: HANDLE ERROR ON SAVING FILE TO BE ADDED AS ELEMENT
        				}
        			}.bind(this);
        		} else {
        			//TODO: NOT AN IMAGE, HANDLE SPECIAL CASE
        		}
        	}
        	//Not sure why return value should be, seemed as false to work
        	return false;
        }
    }
});
