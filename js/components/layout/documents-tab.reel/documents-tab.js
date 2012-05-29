/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.DocumentsTab = Montage.create(Component, {

    /*
    openDocuments: {
        value: []
    },

    prepareForDraw: {
        enumerable: false,
        value: function() {
//            console.log("Change this to be inside the Ninja Reel");
            this.openDocuments = this.application.ninja.documentController._documents;
//            this.eventManager.addEventListener( "appLoaded", this, false);
        }
    },

    handleAppLoaded: {
        value: function() {
//            this.openDocuments = this.application.ninja.currentDocument;
        }
    },

    draw: {
        enumerable: false,
        value: function() {

        }
    },

    handleClick: {
        value: function(event) {
            
        }
    }
    */
    contentController: {
        value: null
    }
});