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

exports.BindingView = Montage.create(Component, {
    //private Properties
    _selectedElement: {
        value: null
    },
    _bindables: {
        value: []
    },
    _nonVisualComponents: {
        value:null
    },

    //Public Objects
    hudRepeater: { value: null },


    //Public Properties
    selectedElement: {
        get: function() {
            return this._selectedElement;
        },
        set: function(val) {
            this._selectedElement = val;
            this.needsDraw = true;
        }
    },
    bindables: {
        get: function() {
            return this._bindables;
        },
        set: function(val) {
            this._bindables = val;
        }
    },
    nonVisualComponents: {
        get: function() {
            return this._nonVisualComponents;
        },
        set: function(val) {
            this._nonVisualComponents = val;
        }
    },

    //Methods

    //Montage Draw Cycle
    prepareForDraw: {
        value: function() {

        }
    },

    draw: {
        value: function() {
            if(this.selectedElement !== null) {
                this.bindables = [
                    {"objectName": "Input1", "objectTitle": ""},
                ]
            }
        }
    },

    didDraw: {
        value: function() {

        }
    }

});