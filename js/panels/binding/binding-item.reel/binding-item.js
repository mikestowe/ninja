/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage   = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;


exports.BindingItem = Montage.create(Component, {
    sourceObjectLabel : { value: null },
    boundObjectLabel : { value: null },

    _sourceObject : { value: null },
    sourceObject : {
        get: function() {
            return this._sourceObject;
        },
        set: function(value) {
            if(value === this._sourceObject) { return; }

            this.sourceObjectLabel = value.identifier;
            
            this._sourceObject = value;
        }
    },
    _boundObject : { value: null },
    boundObject : {
        get: function() {
            return this._boundObject;
        },
        set: function(value) {
            if(value === this._boundObject) { return; }

            this.boundObjectLabel = value.identifier;

            this._boundObject = value;
        }
    },

    _sourceObjectPropertyPath : { value: null },
    sourceObjectPropertyPath : {
        get: function() {
            return this._sourceObjectPropertyPath;
        },
        set: function(value) {
            if(value === this._sourceObjectPropertyPath) { return; }
            this._sourceObjectPropertyPath = value;
            this.needsDraw = true;
        }
    },
    _boundObjectPropertyPath : { value: null },
    boundObjectPropertyPath : {
        get: function() {
            return this._boundObjectPropertyPath;
        },
        set: function(value) {
            if(value === this._boundObjectPropertyPath) { return; }
            this._boundObjectPropertyPath = value;
            this.needsDraw = true;
        }
    },

    _oneway : { value: null },
    oneway : {
        get: function() {
            return this._oneway;
        },
        set: function(value) {
            if(value === this._oneway) { return; }
            this._oneway = value;
            this.needsDraw = true;
        }
    },

    /* -------------- Events -------------- */

    handleDirectionToggleButtonAction : {
        value: function(e) {
            this.oneway = !this.oneway;
        }
    },

    handleEditButtonAction : {
        value: function(e) {
            this.parentComponent.parentComponent.displayEditView();
        }
    },

    /* -------------- Component Draw Cycle -------------- */

    templateDidLoad : {
        value: function() {
            console.log("loaded binding item");
        }
    },

    prepareForDraw: {
        value: function() {
            console.log("preparing to draw binding item");
        }
    },

    draw : {
        value: function() {
            if(this.oneway) {
                this.directionToggleButton.element.classList.remove('two-way');
            } else {
                this.directionToggleButton.element.classList.add('two-way');
            }
        }
    }
});