/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.TagProperties = Montage.create(ToolProperties, {
    divElement:     { value: null, enumerable: false },
    imageElement:   { value: null, enumerable: false },
    videoElement:   { value: null, enumerable: false },
    canvasElement:  { value: null, enumerable: false },
    customElement:  { value: null, enumerable: false },
    classField:     { value: null, enumerable: false },
    customName:     { value: null, enumerable: false },
    customLabel:    { value: null, enumerable: false },

    _subPrepare: {
        value: function() {
            this.customName.style["display"] = "none";
            this.customLabel.style["display"] = "none";
            
            this.divElement.addEventListener("click", this, false);
            this.imageElement.addEventListener("click", this, false);
            this.videoElement.addEventListener("click", this, false);
            this.canvasElement.addEventListener("click", this, false);
            this.customElement.addEventListener("click", this, false);
        }
    },

    handleClick: {
        value: function(event) {
            this.selectedElement = event._event.target.value;

            if(this.selectedElement === "custom") {
                this.customName.style["display"] = "";
                this.customLabel.style["display"] = "";
            } else {
                this.customName.style["display"] = "none";
                this.customLabel.style["display"] = "none";
            }
        }
    },

    _selectedElement: {
        value: "div", enumerable: false
    },

    selectedElement: {
        get: function() { return this._selectedElement;},
        set: function(value) { this._selectedElement = value; }
    }

});