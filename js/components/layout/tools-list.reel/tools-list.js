/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.ToolsList = Montage.create(Component, {

    SelectionTool:          { value: null },
    SubselectionTool:       { value: null },
    Rotate3DTool:           { value: null },
    Translate3DTool:        { value: null },
    TagTool:                { value: null },
    PenTool:                { value: null },
    TextTool:               { value: null },
    ShapeTool:              { value: null },
    OvalTool:               { value: null },
    RectTool:               { value: null },
    LineTool:               { value: null },
    BrushTool:              { value: null },
    FillTool:               { value: null },
    InkBottleTool:          { value: null },
    EraserTool:             { value: null },
    RotateStageTool3D:      { value: null },
    PanTool:                { value: null },
    ZoomTool:               { value: null },
    disabled:               { value: true},

    handleOpenDocument: {
        value: function(){
            this.disabled = false;
        }
    },

    handleCloseDocument: {
        value: function(){
            if(!this.application.ninja.documentController.activeDocument) {
                this.disabled = true;
            }
        }
    },

    prepareForDraw: {
        enumerable: false,
        value: function() {
            this.eventManager.addEventListener( "openDocument", this, false);
            this.eventManager.addEventListener( "closeDocument", this, false);
            this.PenTool.options = this.application.ninja.toolsProperties.shapeProperties.lineProperties;//this.application.Ninja.toolsProperties.penProperties;

            this.SelectionTool.options = this.application.ninja.toolsProperties.selectionProperties;
            this.SubselectionTool.options = this.application.ninja.toolsProperties.subSelectionProperties;

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