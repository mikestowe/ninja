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

var CATEGORIES  = {

};

var objectsController = exports.ObjectsController = Montage.create(Montage, {

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
            this.currentObjectBindings = [];
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
        }
    },
    
    /* --------------------------
          Binding Methods
    ----------------------------- */
    
    addBinding : {
        value: function(bindingArgs) {
            if(!bindingArgs.sourceObject || !bindingArgs.sourceObjectPropertyPath || !bindingArgs) { return; }

            var sourceObject = bindingArgs.sourceObject,
                sourcePath = bindingArgs.sourceObjectPropertyPath,
                sourceDescriptor = sourceObject._bindingDescriptors;

            if(sourceDescriptor && sourceDescriptor[sourcePath]) {
                this.removeBinding(bindingArgs);
            }

            Object.defineBinding(sourceObject, sourcePath, bindingArgs);
            this.currentObjectBindings = this.getObjectBindings(bindingArgs.sourceObject);
        }
    },

    removeBinding : {
        value: function(bindingArgs) {
            if(!bindingArgs) { return; }



            Object.deleteBinding(bindingArgs.sourceObject, bindingArgs.sourceObjectPropertyPath);
            this.currentObjectBindings = this.getObjectBindings(bindingArgs.sourceObject);
        }
    },

    editBinding : {
        value: function(bindingArgs, newProperties) {
            var property;

            this.removeBinding(bindingArgs);

            if(newProperties) {
                for(property in newProperties) {
                    bindingArgs[property] = newProperties[property];
                }
            }

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

    /* ---- Get Bindable Properties ---- */

    getPropertyList : {
        value: function(object, excludeUnderscoreProperties) {
            return this.getPrototypes(object).map(function(proto) {

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
                //if(object.hasOwnProperty(key)) {
                        properties.push(key);
                //}
            }

            if(excludeUnderscoreProperties) {
                properties = properties.filter(function(property) {
                    return property[0] !== '_';
                }, this);
            }

            return properties.sort();
        }
    },

    getPrototypes : {
        value: function(object) {
            var object_i = object,
                prototypes = [object_i];

            ///// Collect prototypes
            while(Object.getPrototypeOf(object_i)) {
                object_i = Object.getPrototypeOf(object_i);
                prototypes.push(object_i);
            }

            return prototypes;
        }
    },

    /* ----- Category properties ----- */

    getObjectCategory : {
        value: function(object) {
            if(this._hasPrototype(object, 'Component')) {
                return 'Component';
            }

            return null;
        }
    },

    /* ----- Utils ----- */

    _hasPrototype : {
        value: function(object, prototypeName) {
            var prototypes = this.getPrototypes(object).map(function(proto) {
                var metadata = proto._montage_metadata;
                return (metadata) ? metadata.objectName : "Object";
            });

            return prototypes.indexOf(prototypeName) !== -1;
        }
    },

    ///// Returns true if the element is "non-visual", i.e. is not a component,
    ///// and has not element property

    isOffStageObject : {
        value: function(object) {
            var isComponent = this._hasPrototype(object, "Component"),
                hasValidElement = object.element && object.element.parentNode;

            return !isComponent || !hasValidElement;
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
            //if(value === this._currentObject) { return; }

            if(value) {
                this.currentObjectBindings = this.getObjectBindings(value);
                //console.log("Property list", this.getPropertyList(value, true));
            } else {
                this.currentObjectBindings = [];
            }

            this._currentObject = value;
        }
    }

});
