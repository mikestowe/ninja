/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.ToolsProperties = Montage.create(Component, {

    selectionProperties: {
        value: null,
        serializable: true
    },

    object3DProperties: {
        value: null,
        serializable: true
    },
    tagProperties: {
        value: null,
        serializable: true
    },

    penProperties: {
        value: null,
        serializable: true
    },

    textProperties: {
        value: null,
        serializable: true
    },

    shapeProperties: {
        value: null,
        serializable: true
    },

    brushProperties: {
        value: null,
        serializable: true
    },

    fillProperties: {
        value: null,
        serializable: true
    },

    inkbottleProperties: {
        value: null,
        serializable: true
    },

    eraserProperties: {
        value: null,
        serializable: true
    },

    rotateStageProperties: {
        value: null,
        serializable: true
    },

    panProperties: {
        value: null,
        serializable: true
    },

    zoomProperties: {
        value: null,
        serializable: true
    },

    rotate3DProperties: {
        value: null,
        serializable: true
    },

    translate3DProperties: {
        value: null,
        serializable: true
    },

    toolsData: {
        value: null,
        serializable: true
    },

    _currentDocument: {
        enumerable: false,
        value: null
    },

    currentDocument: {
        enumerable: false,
        get: function() {
            return this._currentDocument;
        },
        set: function(value) {
            if (value === this._currentDocument) {
                return;
            }

            this._currentDocument = value;

            this.disabled = !this._currentDocument;

        },
        serializable: true
    },

    _disabled: {
        value: true
    },

    disabled: {
        get: function() {
            return this._disabled;
        },
        set: function(value) {
            if(value !== this._disabled) {
                this._disabled = value;
            }
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