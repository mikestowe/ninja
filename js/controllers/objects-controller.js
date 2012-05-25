/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component        = require("montage/ui/component").Component;

var objectsController = exports.ObjectsController = Montage.create(Component, {

    _activeDocument : {
        value : null,
        enumerable : false
    },
    activeDocument : {
        get : function() {
            return this._activeDocument;
        },
        set : function(doc) {
            if(!doc) { return false; }

            // TODO: remove setTimeout when timing of montage initialization is done
            setTimeout(function() {
                this.bindToModelObjects();
            }.bind(this), 1000);

            this._activeDocument = doc;
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
                boundObject: this.activeDocument.model,
                boundObjectPropertyPath: 'objects',
                oneway: false
            });
        }
    },
    
    /* --------------------------
          Binding Methods
    ----------------------------- */
    
    addBinding : {
        value: function(bindingDescriptor) {
            if(!bindingDescriptor.sourceObject || !bindingDescriptor.sourceObjectPropertyPath || !bindingDescriptor) { return; }

            Object.defineBinding(bindingDescriptor.sourceObject, bindingDescriptor.sourceObjectPropertyPath, bindingDescriptor);
        }
    },

    removeBinding : {
        value: function(bindingDescriptor) {
            if(!bindingDescriptor) { return; }

            Object.deleteBinding(bindingDescriptor.sourceObject, bindingDescriptor.sourceObjectPropertyBindingPath);
        }
    },

    editBindingPropertyPath : {
        value: function(bindingDescriptor, newPropertyPath) {
            this.removeBinding(bindingDescriptor);

            //this.addBinding()


        }
    }

});