/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.ToolsList = Montage.create(Component, {

    toolsData: {
        value: null,
        serializable: true
    },

    SelectionTool: {
        value: null,
        serializable: true
    },

    Rotate3DTool: {
        value: null,
        serializable: true
    },

    Translate3DTool: {
        value: null,
        serializable: true
    },

    TagTool: {
        value: null,
        serializable: true
    },

    PenTool: {
        value: null,
        serializable: true
    },

    TextTool: {
        value: null,
        serializable: true
    },

    ShapeTool: {
        value: null,
        serializable: true
    },

    OvalTool: {
        value: null,
        serializable: true
    },

    RectTool: {
        value: null,
        serializable: true
    },

    LineTool: {
        value: null,
        serializable: true
    },

    BrushTool: {
        value: null,
        serializable: true
    },

    FillTool: {
        value: null,
        serializable: true
    },

    InkBottleTool: {
        value: null,
        serializable: true
    },

    EraserTool: {
        value: null,
        serializable: true
    },

    RotateStageTool3D: {
        value: null,
        serializable: true
    },

    PanTool: {
        value: null,
        serializable: true
    },

    ZoomTool: {
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

        }
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

    prepareForDraw: {
        enumerable: false,
        value: function() {
            this.PenTool.options = this.application.ninja.toolsProperties.shapeProperties.lineProperties;//this.application.Ninja.toolsProperties.penProperties;

            this.SelectionTool.options = this.application.ninja.toolsProperties.selectionProperties;

            this.Rotate3DTool.options = this.application.ninja.toolsProperties.rotate3DProperties;
            this.Translate3DTool.options = this.application.ninja.toolsProperties.rotate3DProperties;
            this.TagTool.options = this.application.ninja.toolsProperties.tagProperties;
            this.PenTool.options = this.application.ninja.toolsProperties.penProperties;
            this.TextTool.options = this.application.ninja.toolsProperties.textProperties;

            this.FillTool.options = this.application.ninja.toolsProperties.fillProperties;
            this.InkBottleTool.options = this.application.ninja.toolsProperties.inkbottleProperties;

            this.ShapeTool.options = this.application.ninja.toolsProperties.shapeProperties;
            this.OvalTool.options = this.application.ninja.toolsProperties.shapeProperties.ovalProperties;
            this.RectTool.options = this.application.ninja.toolsProperties.shapeProperties.rectProperties;
            this.LineTool.options = this.application.ninja.toolsProperties.shapeProperties.lineProperties;
            this.BrushTool.options = this.application.ninja.toolsProperties.brushProperties;
            
            this.EraserTool.options = this.application.ninja.toolsProperties.eraserProperties;
            this.RotateStageTool3D.options = this.application.ninja.toolsProperties.rotateStageProperties;
            this.PanTool.options = this.application.ninja.toolsProperties.panProperties;
            this.ZoomTool.options = this.application.ninja.toolsProperties.zoomProperties;

        }
    },

    action: {
        value: function(value, args) {
            if(this.application.toolsData.selectedTool.container) {
                this[this.application.toolsData.selectedTool.subtools[this.application.toolsData._selectedSubToolIndex].action][value](args);
            } else {
                this[this.application.toolsData.selectedTool.action][value](args);
            }

        }
    },

    prop: {
        value: function(value, args) {
            if(this.application.toolsData.selectedTool.container) {
                return this[this.application.toolsData.selectedTool.subtools[this.application.toolsData._selectedSubToolIndex].action][value];
            } else {
                return this[this.application.toolsData.selectedTool.action][value];
            }

        }
    }

});