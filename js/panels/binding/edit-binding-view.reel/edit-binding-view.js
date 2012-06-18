/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    Converter = require("montage/core/converter/converter").Converter;


var editBindingView = exports.EditBindingView = Montage.create(Component, {
    sourceObjectIconElement : { value: null },
    boundObjectIconElement  : { value: null },

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
     Object Identifier (for associating with object)
     ------------------- */

    _sourceObjectIdentifier : { value: null },
    sourceObjectIdentifier : {
        get : function() { return this._sourceObjectIdentifier; },
        set : function(value) {
            console.log("Source object IDENTIFIER changed");
            if(value === this._sourceObjectIdentifier) { return; }

            this._sourceObjectIdentifier = value;

            this.needsDraw = true;
        }
    },

    _boundObjectIdentifier : { value: null },
    boundObjectIdentifier : {
        get : function() { return this._boundObjectIdentifier; },
        set : function(value) {
            console.log("Bound object IDENTIFIER changed");
            if(value === this._boundObjectIdentifier) { return; }

            this._boundObjectIdentifier = value;

            this.needsDraw = true;
        }
    },


    /* -------------------
       Binding Properties
     ------------------- */

    _sourceObject : { value: null },
    sourceObject : {
        get : function() { return this._sourceObject; },
        set : function(value) {
            if(value === this._sourceObject) { return; }

            this._sourceObject = value;

            if(value) {
                this.sourceObjectPropertyPathField.hints = this.application.ninja.objectsController.getPropertiesFromObject(value);
                console.log("Setting hints to: ", this.sourceObjectPropertyPathField.hints);
            }

            this.needsDraw = true;
        }
    },

    _boundObject : { value: null },
    boundObject : {
        get : function() { return this._boundObject; },
        set : function(value) {
            if(value === this._boundObject) { return; }
            console.log("Bound Object being set to ", value);
            this._boundObject = value;

            if(value) {
                this.boundObjectPropertyPathField.hints = this.application.ninja.objectsController.getPropertiesFromObject(value);
                console.log("Setting hints to: ", this.boundObjectPropertyPathField.hints);
            }

            this.needsDraw = true;
        }
    },

    _sourceObjectPropertyPath : { value: null },
    sourceObjectPropertyPath : {
        get : function() { return this._sourceObjectPropertyPath; },
        set : function(value) {
            console.log("Source Object Property Path being set to ", value);

            if(value === this._sourceObjectPropertyPath) { return; }



            this._sourceObjectPropertyPath = value;

            this.needsDraw = true;
        }
    },

    _boundObjectPropertyPath : { value: null },
    boundObjectPropertyPath : {
        get : function() { return this._boundObjectPropertyPath; },
        set : function(value) {
            if(value === this._boundObjectPropertyPath) { return; }

            this._boundObjectPropertyPath = value;

            this.needsDraw = true;
        }
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
            debugger;

            var controller = this.application.ninja.objectsController,
                newBindingArgs = {
                    sourceObject             : this.sourceObject,
                    sourceObjectPropertyPath : this.sourceObjectPropertyPathField.value, // TODO: shouldn't need to do this (get from bound property)
                    boundObject              : this.boundObject,
                    boundObjectPropertyPath  : this.boundObjectPropertyPathField.value, // TODO: shouldn't need to do this
                    oneway: this.oneway
            };

            if(this.isNewBinding) {
                controller.addBinding(newBindingArgs);
            } else {
                controller.editBinding(this.bindingArgs, newBindingArgs);
            }

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
                console.log("here we are");
                this.dirty = true;
            }
        }
    },

    /* -------------------
     Draw Cycle
     ------------------- */

    templateDidLoad : {
        value: function() {


            Object.defineBinding(this, 'sourceObject', {
                boundObject: this,
                boundObjectPropertyPath: 'sourceObjectIdentifier',
                oneway: false,
                converter : objectIdentifierConverter.create()
            });

            Object.defineBinding(this, 'boundObject', {
                boundObject: this,
                boundObjectPropertyPath: 'boundObjectIdentifier',
                oneway: false,
                converter : objectIdentifierConverter.create()
            });

        }
    },

    prepareForDraw : {
        value: function() {

        }
    },
    
    draw : {
        value: function() {
            var defaultIconClass = 'object-icon',
                controller = this.application.ninja.objectsController,
                category;

            this.sourceObjectIconElement.className = defaultIconClass;
            this.boundObjectIconElement.className = defaultIconClass;

            if(this.sourceObject) {
                this.sourceObjectIconElement.classList.remove('no-object');
                category = controller.getObjectCategory(this.sourceObject).toLowerCase();

                if(category) {
                    this.sourceObjectIconElement.classList.add('object-icon-'+category);
                }
            } else {
                this.sourceObjectIconElement.classList.add('no-object');
            }

            if(this.boundObject) {
                this.boundObjectIconElement.classList.remove('no-object');
                category = controller.getObjectCategory(this.boundObject).toLowerCase() || null;

                if(category) {
                    this.boundObjectIconElement.classList.add('object-icon-'+category);
                }
            } else {
                this.boundObjectIconElement.classList.add('no-object');
            }
        }
    }
});

var objectIdentifierConverter = exports.ObjectIdentifierConverter = Montage.create(Converter, {
    convert: {
        value: function(identifier) {
            if(!identifier) { return null; }

            var identifiers = editBindingView.getObjectIdentifiers(),
                objects = editBindingView.application.ninja.objectsController.objects;

            return objects[identifiers.indexOf(identifier)];
        }
    },
    revert: {
        value: function(object) {
            console.log("converter revert");
            return object.identifier;
        }
    }
});