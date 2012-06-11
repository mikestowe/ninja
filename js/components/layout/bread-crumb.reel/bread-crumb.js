/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.Breadcrumb = Montage.create(Component, {

    _currentDocument: {
        enumerable: false,
        value: null
    },

    currentDocument: {
        enumerable: false,
        get: function() {
            return this._currentDocument;
        },
        set: function(value) {
            if (value === this._currentDocument) {
                return;
            }

            this._currentDocument = value;

            if(!value) {
                this.disabled = true;
            } else {
                this.disabled = this._currentDocument.currentView !== "design";
            }

        }
    },


    _disabled: {
        value: true
    },

    disabled: {
        get: function() {
            return this._disabled;
        },
        set: function(value) {
            if(value !== this._disabled) {
                this._disabled = value;
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
            this.breadcrumbBt.addEventListener("action", this, false);
        }
    },

    createContainerElements: {
        value: function() {
            var parentNode;

//            delete this.containerElements;
                this.containerElements = [];

            parentNode = this.container;

            while(parentNode !== this.currentDocument.model.documentRoot) {
                this.containerElements.unshift({"node": parentNode, "nodeUuid":parentNode.uuid, "label": parentNode.nodeName});
                parentNode = parentNode.parentNode;
            }

            // This is always the top container which is now hardcoded to body
            this.containerElements.unshift({"node": parentNode, "nodeUuid":parentNode.uuid, "label": parentNode.nodeName});
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

            // TODO: This is bound 2 ways, update the internal property
            this.application.ninja.currentSelectedContainer = this.containerElements[i].node;
        }
    }
});

