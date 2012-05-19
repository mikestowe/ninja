/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component        = require("montage/ui/component").Component;

var objectsController = exports.ObjectsController = Montage.create(Component, {
    objects : {
        value: []
    },

    handleAppLoaded : {
        value: function() {
            ///// Bind app's activeDocument property to
            ///// objects controller's _activeDocument property
        }
    },

    deserializedFromTemplate : {
        value: function() {
            this.eventManager.addEventListener( "appLoaded", this, false);
        },
        enumerable : false
    },

    _activeDocument : {
        value : null,
        enumerable : false
    },

    activeDocument : {
        get : function() {
            return this._activeDocument;
        },
        set : function(document) {
            ///// If the document is null set default stylesheets to null
            if(!document) { return false; }

            setTimeout(function() {
                this.objects = document._document.application._template._deserializer.getObjectsFromLastDeserialization();
            }.bind(this), 1000);


            ///// setting document via binding
            this._activeDocument = document;
        },
        enumerable : false
    }

});