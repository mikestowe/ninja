/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;


exports.EditBindingView = Montage.create(Component, {

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

            this.sourceObjectIdentifier = value.sourceObject.identifier;
            this.sourceObjectPropertyPath = value.sourceObjectPropertyPath;
            this.boundObjectIdentifier = value.boundObject.identifier;
            this.boundObjectPropertyPath = value.boundObjectPropertyPath;
            this.oneway = value.oneway;

            this.needsDraw = true;
        }
    },

    /* -------------------
     Save/Close button handlers
     ------------------- */

    handleCloseButtonAction : {
        value: function(e) {
            this.parentComponent.editing = false;
        }
    },

    prepareForDraw : {
        value: function() {
            console.log("Preparing to draw edit view");
        }
    }
});