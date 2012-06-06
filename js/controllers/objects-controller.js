/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component        = require("montage/ui/component").Component;

var objectsController = exports.ObjectsController = Montage.create(Component, {

    _currentDocument : {
        value : null,
        enumerable : false
    },
    currentDocument : {
        get : function() {
            return this._currentDocument;
        },
        set : function(doc) {
            if(!doc) { return false; }

            // TODO: remove setTimeout when timing of montage initialization is done
            setTimeout(function() {
                this.bindToModelObjects();
            }.bind(this), 1000);

            this._currentDocument = doc;
        },
        enumerable : false
    },

    objects : {
        value: []
    },

    _isBoundToModelObjects : {
        value: null
    },
    bindToModelObjects : {
        value: function() {
            //// Remove any previous bindings if previously bound
            if(!this._isBoundToModelObjects) {
                Object.deleteBinding(this, 'objects');
                this._isBoundToModelObjects = true;
            }

            Object.defineBinding(this, 'objects', {
                boundObject: this.currentDocument.model,
                boundObjectPropertyPath: 'objects',
                oneway: false
            });
        }
    },
    
    /* --------------------------
          Binding Methods
    ----------------------------- */
    
    addBinding : {
        value: function(bindingArgs) {
            if(!bindingArgs.sourceObject || !bindingArgs.sourceObjectPropertyPath || !bindingArgs) { return; }

            Object.defineBinding(bindingArgs.sourceObject, bindingArgs.sourceObjectPropertyPath, bindingArgs);
        }
    },

    removeBinding : {
        value: function(bindingArgs) {
            if(!bindingArgs) { return; }

            Object.deleteBinding(bindingArgs.sourceObject, bindingArgs.sourceObjectPropertyPath);
        }
    },

    editBindingPropertyPath : {
        value: function(bindingArgs, newPropertyPath) {
            this.removeBinding(bindingArgs);

            bindingArgs.boundObjectPropertyPath = 'newPropertyPath';

            this.addBinding(bindingArgs);
        }
    },
    
    getObjectBindings : {
        value: function(object) {
            var descriptors = object._bindingDescriptors,
                bindingsArray = [],
                property, descriptor, bindingArgsObject;

            if(descriptors) {
                for(property in descriptors) {
                    if(descriptors.hasOwnProperty(property)) {
                        descriptor = descriptors[property];

                            bindingArgsObject = {
                                sourceObject : object,
                                sourceObjectPropertyPath : property,
                                boundObject : descriptor.boundObject,
                                boundObjectPropertyPath : descriptor.boundObjectPropertyPath,
                                oneway : descriptor.oneway
                            };

                            bindingsArray.push(bindingArgsObject);
                    }
                }
            }

            return bindingsArray;
        }
    },

    /* ---- Bindable Properties ---- */

    getPropertyList : {
        value: function(object, excludeUnderscoreProperties) {
            var object_i = object,
                prototypes = [object_i];

            ///// Collect prototypes
            while(Object.getPrototypeOf(object_i)) {
                object_i = Object.getPrototypeOf(object_i);
                prototypes.push(object_i);
            }

            return prototypes.map(function(proto) {

                var metadata = proto._montage_metadata,
                    objectName = (metadata) ? metadata.objectName : "Object";

                return {
                    category : objectName,
                    properties : this.getPropertiesFromObject(proto)
                };
            }, this);

        }
    },

    getPropertiesFromObject : {
        value: function (object, excludeUnderscoreProperties) {
            var properties = [];

            for(var key in object) {
                debugger;
                if(object.hasOwnProperty(key)) {
                    if(key.serializable) {
                        properties.push(key);
                    }
                }
            }

            if(excludeUnderscoreProperties) {
                properties = properties.filter(function(property) {
                    return property[0] !== '_';
                }, this);
            }

            return properties.sort();
        }
    },

    /* ---- Bindable controller properties ---- */

    currentObjectBindings : {
        value: null
    },
    _currentObject : {
        value: null
    },
    currentObject : {
        get: function() {
            return this._currentObject;
        },
        set: function(value) {
            if(value === this._currentObject) { return; }

            if(value) {
                this.currentObjectBindings = this.getObjectBindings(value);
                console.log("Property list", this.getPropertyList(value, true));
            } else {
                this.currentObjectBindings = [];
            }

            this._currentObject = value;
        }
    }

});