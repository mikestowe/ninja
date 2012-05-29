/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.DocumentEntry = Montage.create(Component, {

    dirty: { value: null },

    _uuid: {
        value: null,
        enumerable: false
    },

    _document: {
        enumerable: false,
        value: null
    },

    document: {
        enumerable: false,
        get: function() {
            return this._document;
        },
        set: function(value) {

            if (this._document === value) {
                return;
            }

            this._document = value;

            if(value) {
                this._uuid = value.uuid;
            }
        }
    },

    _name: { value: null },

    name: {
        enumerable: false,
        get: function() {
            return this._name;
        },
        set: function(value) {

            if (this._name === value) {
                return;
            }

            this._name = value;
            this.needsDraw = true;
        }
    },

    _saveFlag: {
        value: false
    },

    saveFlag: {
        get: function() {
            return this._saveFlag;
        },
        set: function(value) {
            if(this._saveFlag !== value) {
                this._saveFlag = value;
                this.needsDraw = true;
            }
        }
    },

    prepareForDraw: {
        enumerable: false,
        value: function() {
//           this.element.addEventListener("click", this, false);
//            this.closeBtn.addEventListener("click", this, true);
        }
    },


    draw: {
        enumerable: false,
        value: function() {
            this.label.innerText = this._name ? this._name : "";

//            this._active ? this.element.classList.add("activeTab") : this.element.classList.remove("activeTab");

            if(this.saveFlag) {
                this.label.classList.add("dirty");
            } else {
                this.label.classList.remove("dirty");
            }
        }
    },

    captureClick: {
        value: function(event) {
            console.log("clicked on the X");
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
//            if(event._event.target.nodeName === "IMG") {
//                this.application.ninja.documentController.closeFile(this.application.ninja.documentController._findDocumentByUUID(this._uuid));
//            } else {
//                if(!this.active) {
//                    this.application.ninja.documentController.switchDocuments(this.application.ninja.currentDocument, this.application.ninja.documentController._findDocumentByUUID(this._uuid));
//                }
//            }
        }
    }

});
