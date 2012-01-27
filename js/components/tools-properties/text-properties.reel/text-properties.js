/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.TextProperties = Montage.create(ToolProperties, {
    className: {value: null},
    tagType: {value: null},
    fontSelection: {value: null},
    fontSettings: {value: null},
    fontSize: {value: null},
    fontColor: {value: null},
    btnBold: {value: null},
    btnItalic: {value: null},
    btnUnderline: {value: null},
    btnStrikethrough: {value: null},
    txtLink: {value: null},
    linkTarget: {value: null},
    alignLeft: {value: null},
    alignCenter: {value: null},
    alignRight: {value: null},
    alignJustify: {value: null},
    indentRight: {value: null},
    indentLeft: {value: null},
    numberedList: {value: null},
    bulletedList: {value: null},

    prepareForDraw: {
        value: function() {
            this.linkTarget.items = ["Target","_blank","_self","_parent", "_top"];
            this.fontSettings.label = "Settings";
            this.btnBold.label = "Bold";
            this.btnItalic.label = "Italic";
            this.btnUnderline.label = "Underline";
            this.btnStrikethrough.label = "Strikethrough";
            this.alignLeft.label = "Left";
            this.alignCenter.label = "Center";
            this.alignRight.label = "Right";
            this.alignJustify.label = "Justify";
        }
    },
    
    _subPrepare: {
        value: function() {
            //this.divElement.addEventListener("click", this, false);
        }
    },

    handleClick: {
        value: function(event) {
           // this.selectedElement = event._event.target.id;
        }
    }
});