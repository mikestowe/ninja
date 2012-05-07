/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

var TagProperties = exports.TagProperties = Montage.create(ToolProperties, {
    divElement:     { value: null, enumerable: false },
    imageElement:   { value: null, enumerable: false },
    videoElement:   { value: null, enumerable: false },
    canvasElement:  { value: null, enumerable: false },
    customElement:  { value: null, enumerable: false },
    classField:     { value: null, enumerable: false },
    customName:     { value: null, enumerable: false },
    customLabel:    { value: null, enumerable: false },
    addedColorChips: { value: false },

    _fill: {
        enumerable: false,
        value: { colorMode: 'nocolor', color: null, webGlColor: null }
    },

    fill: {
        enumerable: true,
        get: function () {
            return this._fill;
        },
        set: function (value) {
            if (value !== this._fill) {
                this._fill = value;
            }
        }
    },

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

    draw: {
        enumerable: false,
        value: function () {
            Object.getPrototypeOf(TagProperties).draw.call(this);

            if (this.addedColorChips === false && this.application.ninja.colorController.colorPanelDrawn) {
                this._fillColorCtrl.props = { side: 'top', align: 'center', wheel: true, palette: true, gradient: false, image: false, nocolor: true, offset: -80 };
                this.application.ninja.colorController.addButton("chip", this._fillColorCtrl);

                this._fillColorCtrl.addEventListener("change", this.handleFillColorChange.bind(this), false);

                this.addedColorChips = true;
            }

            if (this.addedColorChips) {
                this._fillColorCtrl.color(this._fill.colorMode, this._fill.color);
            }
        }
    },

    handleFillColorChange: {
        value: function (e) {
            this.fill = e._event;
            this.fill.webGlColor = this.application.ninja.colorController.colorModel.colorToWebGl(e._event.color);
        }
    },

    handleClick: {
        value: function(event) {
            this.selectedElement = event._event.target.id;

            if(this.selectedElement === "customTool") {
                this.customName.style["display"] = "";
                this.customLabel.style["display"] = "";
            } else {
                this.customName.style["display"] = "none";
                this.customLabel.style["display"] = "none";
            }
        }
    },

    _selectedElement: {
        value: "divTool", enumerable: false
    },

    selectedElement: {
        get: function() { return this._selectedElement;},
        set: function(value) { this._selectedElement = value; }
    }

});