/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.ToolsProperties = Montage.create(Component, {

    disabled: {
        value: true
    },

    handleCloseDocument: {
        value: function(){
            if(!this.application.ninja.documentController.activeDocument) {
                this.disabled = true;
            }
        }
    },

    handleOpenDocument: {
        value: function() {
            this.disabled = false;
        }
    },

    prepareForDraw: {
        enumerable: false,
        value: function() {
            this.eventManager.addEventListener( "openDocument", this, false);
            this.eventManager.addEventListener( "closeDocument", this, false);
        }
    },

    draw: {
        enumerable: false,
        value: function() {
            //this.selectionProperties.needsDraw = true;
        }
    },

    _currentSelectedTool : {
      value: null
    },

    currentSelectedTool : {
        get: function() { return this._currentSelectedTool;},
        set: function(value) {

            if(this._currentSelectedTool) {
                this[this._currentSelectedTool.properties].visible = false;
            }

            if(value) {
                this._currentSelectedTool = value;
                this[this._currentSelectedTool.properties].visible = true;

            }

            /*
            if(this._selectedTool) this[this._selectedTool.properties].visible = false;

            this._selectedTool = value;
            this[this._selectedTool.properties].visible = true;
            */
            

        }
    }

});