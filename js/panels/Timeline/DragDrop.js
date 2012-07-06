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
var Composer = require("montage/ui/composer/composer").Composer;

exports.DragDropComposer = Montage.create(Composer, {

    draggable: {
        value: true
    },

    droppable: {
        value: true
    },

    identifier: {
        value: "generic"
    },

    _dragover: {
        value: false
    },

    load: {
        value: function() {
            //TODO: to make this work even better check to see if this is a component or not
            //right now it does not support data-montage id's
            this.element.addEventListener("mouseover", this, true);
            this.element.addEventListener("mouseout", this, true);
            this.component.element.addEventListener("dragenter", this, true);
            this.component.element.addEventListener("dragleave", this, true);
            this.component.element.addEventListener("dragend", this, true);
            this.component.element.addEventListener("drop", this, true);
            this.component.element.addEventListener("dragover", this, true);
            this.component.element.addEventListener("dragstart", this, true);
        }
    },

    unload: {
        value: function() {
            this.element.removeEventListener("mouseover", this, true);
            this.element.removeEventListener("mouseout", this, true);
            this.component.element.removeEventListener("dragenter", this, true);
            this.component.element.removeEventListener("dragleave", this, true);
            this.component.element.removeEventListener("dragend", this, true);
            this.component.element.removeEventListener("drop", this, true);
            this.component.element.removeEventListener("dragover", this, true);
            this.component.element.removeEventListener("dragstart", this, true);
        }
    },

    captureMouseover: {
        value: function(e) {
            if(this.draggable) {
                this.component.element.draggable = true;
            }
        }
    },

    captureMouseout: {
        value: function(e) {
            this.component.element.draggable = false;
        }
    },

    /* ------ Drag Drop Events ------- */

    // This Function will determine what is being moved
    captureDragstart: {
        value:function(e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('Text', this.identifier);
            this.component.element.classList.add("dragging");
            this.component.application.ninja.componentBeingDragged = this.component;
        }
    },

    captureDragenter: {
        value: function(e) {

        }
    },

    captureDragover: {
        value:function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (!this._dragover) {
                this._dragover = true;
                this.component.element.classList.add("dragOver");
            }
        }
    },

    captureDragleave: {
        value: function(e) {
            if (this._dragover) {
                this._dragover = false;
                this.component.element.classList.remove("dragOver");
            }
        }
    },

    captureDrop: {
        value:function(e) {
            e.stopPropagation(); // Stops some browsers from redirecting.
            e.preventDefault();
            if (this._dragover) {
                this._dragover = false;
                this.component.element.classList.remove("dragOver");
                if (this.identifier === e.dataTransfer.getData("Text")) {
                    if(this.component.application.ninja.componentBeingDragged !== this.component) {
                        dropEvent = document.createEvent("CustomEvent");
                        dropEvent.initCustomEvent("dropped", true, false, null);
                        dropEvent.draggedComponent = this.component.application.ninja.componentBeingDragged;
                        dropEvent.droppedComponent = this.component;
                        this.component.dispatchEvent(dropEvent);
                    }
                }
                this.component.application.ninja.componentBeingDragged = null;
            }

        }
    },

    captureDragend: {
        value:function(e) {
            this.component.element.classList.remove("dragging");
        }
    }

});
