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

    baseX: {
        value: null,
        writable: true
    },

    baseY: {
        value: null,
        writable: true
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
        value: function(evt){
            var xferString, component;

            this.baseX = evt.offsetX - this.application.ninja.stage.userContentLeft;
            this.baseY = evt.offsetY - this.application.ninja.stage.userContentTop;

            xferString = evt.dataTransfer.getData("text/plain");
            if(xferString) {

                if(xferString.lastIndexOf("-Component") !== -1) {
                    component = xferString.substring(0, xferString.lastIndexOf("-Component"));
                    NJevent( "executeAddComponent", { "component": component, "dropX": this.baseX, "dropY": this.baseY });
//                    ComponentPanelModule.ComponentsPanelBase.addComponentToStage(componentStr.substring(0, compInd), this.baseX, this.baseY);
                }
                return;
            }

            // Verify that browser supports FileReader API.
            if (typeof(window.FileReader) === "undefined") {
                alert("File API and FileReader APIs are not supported.");
                // Exit function since there isn't anything else we can do.
                return;
            }

            var file;
            const files = evt.dataTransfer.files;
            var idx;
            const len = files.length;


            // Loop over all dragged files...
            for (idx = 0; idx < len; idx++) {
                file = files[idx];
                // Only do anything if the current file is an image (or has an image mime-type.
                if (file.type.match("^image/")) {
                    var reader = new FileReader();
                    // Create a LoadHandler to access each outer file var
                    reader.onload = this.createLoadHandler(file, this.baseX, this.baseY);

                    if(file.type.match("^image/svg\\+xml")) {// this is SVG
                        reader.readAsText(file);
                    } else{
                        reader.readAsDataURL(file);
                    }
                    
                }
            }

            return false;
        }
    },

    createLoadHandler: {
        value: function(file, baseX, baseY) {
            return function(evt2) {
                var domElem = null;

                if(file.type.match("^image/svg\\+xml")){ // this is an SVG file
                    var tempElem = document.createElement("div");
                    tempElem.innerHTML = evt2.currentTarget.result;
                    domElem = tempElem.children[0];

                    NJUtils.makeElementModel(domElem, "SVG", "block");
                } else { // treat as a regular image
                    domElem = NJUtils.makeNJElement("image", "Image", "block");
                    domElem.src = evt2.currentTarget.result;
                }


                // Not sure we need an ID for the image
                                /*
                // Use the Image filename if valid for the id
                var filename = file.fileName.substr(0, file.fileName.lastIndexOf('.')) || file.fileName;
                filename = filename.replace(/ /g,"_");


                if(this.isValidFilename(filename)) {
                    //domElem.id = filename;
                } else {
                    //domElem.id = DocumentControllerModule.DocumentController.CreateElementID(img.tagName);
                }
                */

                var rules = {
                    'position': 'absolute',
                    'top' : baseY + 'px',
                    'left' : baseX + 'px',
                    '-webkit-transform-style' : 'preserve-3d',
                    '-webkit-transform' : 'perspective(1400) matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
                };

                NJevent("elementAdding", {el: domElem, data:rules});
            };
        }
    },

    isValidFilename: {
        value: function(id){
            if(id && id !== "") {
                var regexID = /^([a-zA-Z])+([a-zA-Z0-9_\.\:\-])+/;
                return(regexID.test(id))
            } else {
                return false;
            }
        }
    }


});
