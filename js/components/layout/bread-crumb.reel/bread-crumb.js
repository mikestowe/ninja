/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.Breadcrumb = Montage.create(Component, {

    disabled: {
        value: true
    },

    handleOpenDocument: {
        value: function(){
            this.disabled = false;
        }
    },

    handleCloseDocument: {
        value: function(){
            if(!this.application.ninja.documentController.activeDocument) {
                this.disabled = true;
                this.application.ninja.currentSelectedContainer = (this.application.ninja.currentDocument ? this.application.ninja.currentDocument.documentRoot : null);
            }
        }
    },

    _container:{
        value:null
    },

    container: {
        set: function(value) {
            if(this._container !== value) {
                this._container = value;
                this.createContainerElements();
            }
        },
        get: function() {
            return this._container;
        }
    },

    containerElements: {
        value: []
    },

    prepareForDraw: {
        value: function() {
            this.eventManager.addEventListener("openDocument", this, false);
            this.eventManager.addEventListener("closeDocument", this, false);
            this.breadcrumbBt.addEventListener("action", this, false);
        }
    },

    createContainerElements: {
        value: function() {
            var parentNode;

            this.containerElements.length = 0;

            parentNode = this.container;

            // This is for the old template support.
            // TODO: Remove marker for old template: NINJA-STAGE-REWORK
            if(this.application.ninja.currentDocument.documentRoot.id === "UserContent") {
                while(parentNode.id !== "UserContent") {
                    this.containerElements.unshift({"node": parentNode, "nodeUuid":parentNode.uuid, "label": parentNode.nodeName});
                    parentNode = parentNode.parentNode;
                }

                // This is always the top container which is now hardcoded to body
                this.containerElements.unshift({"node": parentNode, "nodeUuid":parentNode.uuid, "label": "Body"});
            } else {
                while(parentNode !== this.application.ninja.currentDocument.documentRoot) {
                    this.containerElements.unshift({"node": parentNode, "nodeUuid":parentNode.uuid, "label": parentNode.nodeName});
                    parentNode = parentNode.parentNode;
                }

                // This is always the top container which is now hardcoded to body
                this.containerElements.unshift({"node": parentNode, "nodeUuid":parentNode.uuid, "label": parentNode.nodeName});
            }

        }
    },

    handleAction: {
        value: function(evt) {
            if(evt.target.value === this.container.uuid) {
                return;
            }

            for(var i = this.containerElements.length - 1; i >= 0; i--) {
                if(evt.target.value === this.containerElements[i].nodeUuid) break;

                this.containerElements.pop();
            }

            this.application.ninja.currentSelectedContainer = this.containerElements[i].node;
        }
    }
});

