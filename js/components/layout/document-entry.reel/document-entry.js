/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

//var documentManagerModule = ("js/document/documentManager");

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
            this._uuid = value.uuid;
            //this.needsDraw = true;
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

    _active: {
        enumerable: false,
        value: null
    },

    active: {
        get: function() {
            return this._active;
        },
        set: function(value) {
            var previousValue = this._active;
            this._active = value;

            if (previousValue !== this._active) {
                this.needsDraw = true;
            }
        }
    },


    prepareForDraw: {
        enumerable: false,
        value: function() {
           this.element.addEventListener("click", this, false);
        }
    },


    draw: {
        enumerable: false,
        value: function() {
            this.label.innerText = this._name ? this._name : "";

            this._active ? this.element.classList.add("activeTab") : this.element.classList.remove("activeTab");
        }
    },

    handleClick: {
        value: function(event) {
            if(event._event.target.nodeName === "IMG") {
                this.application.ninja.documentController.closeDocument(this._uuid);
            } else {
                if(!this._document.isActive) {
                    this.application.ninja.stage.stageView.switchCodeView(this.application.ninja.documentController._findDocumentByUUID(this._uuid));
                }
            }
        }
    }

});
