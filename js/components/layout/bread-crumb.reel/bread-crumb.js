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

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.Breadcrumb = Montage.create(Component, {

    breadcrumbBt: {
        value: null,
        serializable: true
    },

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

    containerElements: {
        value: []
    },

    prepareForDraw: {
        value: function() {
            this.breadcrumbBt.addEventListener("action", this, false);
            this.addPropertyChangeListener("currentDocument.model.domContainer", this)
        }
    },

    handleChange: {
        value: function() {
            if(this.currentDocument && this.currentDocument.model.getProperty("domContainer")) {
                this.createContainerElements(this.currentDocument.model.getProperty("domContainer"));
            }
        }
    },

    createContainerElements: {
        value: function(container) {

//            delete this.containerElements;
                this.containerElements = [];

            while(container !== this.currentDocument.model.documentRoot) {
                this.containerElements.unshift({"node": container, "nodeUuid":container.uuid, "label": container.nodeName});
                container = container.parentNode;
            }

            // This is always the top container which is now hardcoded to body
            this.containerElements.unshift({"node": container, "nodeUuid":container.uuid, "label": container.nodeName});
        }
    },

    handleAction: {
        value: function(evt) {
            if(evt.target.value === this.currentDocument.model.domContainer.uuid) {
                return;
            }

            for(var i = this.containerElements.length - 1; i >= 0; i--) {
                if(evt.target.value === this.containerElements[i].nodeUuid) break;

                this.containerElements.pop();
            }

            // TODO: This is bound 2 ways, update the internal property
            this.currentDocument.model.domContainer = this.containerElements[i].node;
            this.application.ninja.selectionController.executeSelectElement();
        }
    }
});

