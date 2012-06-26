/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

/**
 @requires montage/core/core
 @requires montage/ui/component
 */
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.ObjectsPanel = Montage.create(Component, {
    _objects: { value: null },
    objects: {
        get: function() {
            return this._objects;
        },
        set: function(value) {
            this._objects = value;
            this.needsDraw = true;
        }
    },

    prepareForDraw : {
        value: function() {

            Object.defineBinding(this, 'objects', {
                "boundObject": this.application.ninja.objectsController,
                "boundObjectPropertyPath": "objects",
                "oneway": true
            });

        }
    }

});