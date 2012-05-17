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

exports.Object = Montage.create(Component, {
    _needsPropertyInspection : { value: null },

    _sourceObject : { value: null },
    sourceObject : {
        get: function() {
            return this._sourceObject;
        },
        set: function(object) {
            if(this._sourceObject === object) { return false; }

            if(object._montage_metadata) {
                this.montageMetaData = object._montage_metadata;
            }

            this._needsPropertyInspection = this.needsDraw = true;
        }

    },

    _identifier : {
        value: null
    },
    identifier : {
        get: function() {
            return this._identifier;
        },
        set: function(value) {
            if(this._identifier === value || !value) { return false; }

            this._identifier = value;

            this.label = value;

            this.needsDraw = true;
        }
        
    },

    _montageMetaData : {
        value: null
    },
    montageMetaData : {
        get: function() {
            return this._montageLabel;
        },
        set: function(value) {
            if(this._montageMetaData === value) { return false; }

            this._montageMetaData = value;

            if(!this.identifier && value.label) {
                this.label = value.label;
                this.needsDraw = true;
            }
        }

    },

    templateDidLoad: {
        value: function() {
            console.log('object loaded');
        }
    },

    prepareForDraw : {
        value: function() {

        }
    },
    
    willDraw : {
        value: function() {
            if(this._needsPropertyInspection) {
                
            }

            console.log("This label ", this.label);
        }
    },

    draw : {
        value: function() {

        }
    }

});