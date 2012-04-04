/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
            this.element.element.addEventListener("mouseover", this, true);
            this.element.element.addEventListener("mouseout", this, true);
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
            this.element.element.removeEventListener("mouseover", this, true);
            this.element.element.removeEventListener("mouseout", this, true);
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
                if (this.component.application.ninja.componentBeingDragged) {
                    this.component.element.classList.add("dragOver");
                }
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