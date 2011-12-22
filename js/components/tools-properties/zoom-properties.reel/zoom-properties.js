/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.ZoomProperties = Montage.create(ToolProperties, {

    zoomIn:     { value: null },
    zoomOut:    { value: null },
    zoomInCursor:{value:"url('images/cursors/zoom.png'), default"},
    zoomOutCursor:{value:"url('images/cursors/zoom_minus.png'), default"},
    _subPrepare: {
        value: function() {
            this.zoomIn.addEventListener("click", this, false);
            this.zoomOut.addEventListener("click", this, false);
        }
    },

    handleClick: {
        value: function(event) {
            this.selectedElement = event._event.target.id;
            if(this.selectedElement==="zoomInTool"){
                this.application.ninja.stage.drawingCanvas.style.cursor = this.zoomInCursor;
            }else{
                this.application.ninja.stage.drawingCanvas.style.cursor = this.zoomOutCursor;
            }
        }
    },

    _selectedElement: {
        value: "zoomInTool", enumerable: false
    },

    selectedElement: {
        get: function() { return this._selectedElement;},
        set: function(value) { this._selectedElement = value; }
    }
});