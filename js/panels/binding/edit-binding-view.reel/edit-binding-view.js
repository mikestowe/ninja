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
            if(value === this._sourceObjectIdentifier) { return; }

            this._sourceObjectIdentifier = value;

            this.needsDraw = true;
        }
    },

    _boundObjectIdentifier : { value: null },
    boundObjectIdentifier : {
        get : function() { return this._boundObjectIdentifier; },
        set : function(value) {
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
            }

            this.needsDraw = true;
        }
    },

    _boundObject : { value: null },
    boundObject : {
        get : function() { return this._boundObject; },
        set : function(value) {
            if(value === this._boundObject) { return; }
            this._boundObject = value;

            if(value) {
                this.boundObjectPropertyPathField.hints = this.application.ninja.objectsController.getPropertiesFromObject(value);
            }

            this.needsDraw = true;
        }
    },

    _sourceObjectPropertyPath : { value: null },
    sourceObjectPropertyPath : {
        get : function() { return this._sourceObjectPropertyPath; },
        set : function(value) {
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

            // clear form values
            this.clearForm();

            this._bindingArgs = value;

            if(value) {
                // set up hints for hintable components
                this.objectIdentifiers = this.getObjectIdentifiers();
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
            }

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
            var fields = ["sourceObjectField",
                          "boundObjectField",
                          "sourceObjectPropertyPathField",
                          "boundObjectPropertyPathField"];

            fields.forEach(function(fieldName) {
                this[fieldName].value = "";
            }, this);

            this._bindingArgs = null;

            this.dirty = false;
        }
    },

    saveForm : {
        value: function() {
            var controller = this.application.ninja.objectsController,
                newBindingArgs = {
                    sourceObject             : this.sourceObject,
                    sourceObjectPropertyPath : this.sourceObjectPropertyPath,
                    boundObject              : this.boundObject,
                    boundObjectPropertyPath  : this.boundObjectPropertyPath,
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

    handleDirectionCheckboxAction : {
        value: function(e) {
            this.dirty = true;
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
            return object.identifier;
        }
    }
});
