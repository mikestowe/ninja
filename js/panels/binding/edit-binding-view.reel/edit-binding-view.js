/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;


exports.EditBindingView = Montage.create(Component, {

    objectIdentifiers : {
        value: null
    },
    getObjectIdentifiers : {
        value: function() {
            return this.application.ninja.objectsController.objects.map(function(object) {
                return object.identifier;
            });
        }
    },

    /* -------------------
       Binding Properties
     ------------------- */

    sourceObjectIdentifier : {
        value: "",
        distinct: true
    },
    sourceObjectPropertyPath : {
        value: "",
        distinct: true
    },
    boundObjectIdentifier : {
        value: "",
        distinct: true
    },
    boundObjectPropertyPath : {
        value: "",
        distinct: true
    },
    _oneway: {
        value: null
    },
    oneway: {
        get: function() {
            return this._oneway;
        },
        set: function(value) {
            if(value === this._oneway) { return; }

            this._oneway = !!value;

            this.needsDraw = true;
        }
    },

    /* -------------------
     Binding Args Object
     ------------------- */

    _bindingArgs : {
        value: null
    },
    bindingArgs :{
        get: function() {
            return this._bindingArgs;
        },
        set: function(value) {
            if(value === this._bindingArgs) { return; }

            this._bindingArgs = value;

            // clear form values
            this.clearForm();

            // set up hints for hintable components
            this.objectIdentifiers = this.getObjectIdentifiers();
            console.log("setting hints to ", this.objectIdentifiers);
            this.boundObjectField.hints = this.objectIdentifiers;
            this.sourceObjectField.hints = this.objectIdentifiers;

            if(value.sourceObject) {
                this.sourceObjectIdentifier = value.sourceObject.identifier || value.sourceObject._montage_metadata.label;
                this.sourceObjectPropertyPath = value.sourceObjectPropertyPath || '';
            }

            if(value.boundObject) {
                this.boundObjectIdentifier = value.boundObject.identifier || '';
                this.boundObjectPropertyPath = value.boundObjectPropertyPath || '';
                this.isNewBinding = false;
            } else {
                this.isNewBinding = true;
            }

            this.oneway = value.oneway;

            this.needsDraw = true;
        }
    },

    /* -------------------
     Form properties
     ------------------- */

    dirty: { value: null },
    isNewBinding : { value: null },

    "sourceObjectField"             : {value: null, enumerable: true },
    "boundObjectField"              : {value: null, enumerable: true },
    "sourceObjectPropertyPathField" : {value: null, enumerable: true },
    "boundObjectPropertyPathField"  : {value: null, enumerable: true },
    "directionCheckbox"             : {value: null, enumerable: true },
    "deleteButton"                  : {value: null },
    "saveButton"                    : {value: null },
    "cancelButton"                  : {value: null },

    clearForm : {
        value: function() {
            for(var field in this) {
                if(this.hasOwnProperty(field)) {
                    field.value = '';
                }
            }
            this.dirty = false;
        }
    },

    saveForm : {
        value: function() {
            var controller = this.application.ninja.objectsController,
                newBindingArgs = {
                sourceObject : this.getObjectFromIdentifierValue(this.sourceObjectField.value),
                sourceObjectPropertyPath : this.sourceObjectPropertyPathField.value,
                boundObject : this.getObjectFromIdentifierValue(this.boundObjectField.value),
                boundObjectPropertyPath : this.boundObjectPropertyPathField.value,
                oneway: this.oneway
            };

            if(this.isNewBinding) {
                controller.addBinding(newBindingArgs);
            } else {
                controller.editBinding(this.bindingArgs, newBindingArgs);
            }

            controller.currentObject = controller.currentObject;
        }
    },

    getObjectFromIdentifierValue : {
        value: function(id) {
            var identifiers = this.getObjectIdentifiers(),
                objects = this.application.ninja.objectsController.objects;

            return objects[identifiers.indexOf(id)];
        }
    },

    /* -------------------
     Save/Cancel/Delete button handlers
     ------------------- */

    handleCancelButtonAction : {
        value: function(e) {
            this.clearForm();
            this.parentComponent.editing = false;
        }
    },

    handleDeleteButtonAction : {
        value: function(e) {
            var controller = this.application.ninja.objectsController;

            controller.removeBinding(this.bindingArgs);
            controller.currentObject = controller.currentObject;

            this.parentComponent.editing = false;
        }
    },
    handleSaveButtonAction : {
        value: function(e) {
            this.saveForm();
            this.parentComponent.editing = false;
        }
    },


    /* -------------------
     Dirty handler
     ------------------- */

    handleEvent : {
        value: function(e) {
            if(e._event.type === 'change') {
                this.dirty = true;
            }
        }
    },

    /* -------------------
     Draw Cycle
     ------------------- */

    prepareForDraw : {
        value: function() {

        }
    }
});