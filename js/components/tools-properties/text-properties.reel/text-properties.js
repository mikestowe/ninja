/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ArrayController = require("montage/ui/controller/array-controller").ArrayController;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;
var Converter = require("montage/core/converter/converter").Converter;

exports.TextProperties = Montage.create(ToolProperties, {

    fontName: {value: null, serializable: true},
    fontSize: {value: null, serializable: true},

    fontSettings: {value: null, serializable: true}, // Note: Isn't used currently will need fontSettings Popup

    fontColor: {value: null, serializable: true},
    btnBold: {value: null, serializable: true},
    btnItalic: {value: null, serializable: true},
    btnUnderline: {value: null, serializable: true},
    btnStrikethrough: {value: null, serializable: true},
    txtLink: {value: null, serializable: true},
    linkTarget: {value: null, serializable: true},
    alignLeft: {value: null, serializable: true},
    alignCenter: {value: null, serializable: true},
    alignRight: {value: null, serializable: true},
    alignJustify: {value: null, serializable: true},
    indent: {value: null, serializable: true},
    outdent: {value: null, serializable: true},
    numberedList: {value: null, serializable: true},
    bulletedList: {value: null, serializable: true},
    fontTypes: {value: null, serializable: true},
    fontSizes: {value: null, serializable: true},

    // Draw Cycle
    prepareForDraw: {
        value: function() {

            this.fontColor.props = {side: 'top', align: 'center', wheel: true, palette: true, gradient: false, image: false, nocolor: true, offset: -80};
            this.application.ninja.colorController.addButton("chip", this.fontColor);
            this.fontColor.color('rgb', {wasSetByCode: true, type: 'change', color: {r: 0, g: 0, b: 0}, css: 'rgb(0,0,0)'});
            this.fontColor.addEventListener("change",this.handleFontColorChange.bind(this),false);

            this.application.ninja.stage.textTool.addEventListener("editorSelect", this.handleEditorSelect.bind(this), false);

            //Bind to Rich Text editor that lives on the stage component
            Object.defineBinding(this.application.ninja.stage.textTool, "fontName", {
                boundObject: this.fontName,
                boundObjectPropertyPath: "value",
                oneway: false
            });

            Object.defineBinding(this.application.ninja.stage.textTool, "fontSize", {
                boundObject: this.fontSize,
                boundObjectPropertyPath: "value",
                oneway: false
            });

            Object.defineBinding(this.btnBold, "pressed", {
                boundObject: this.application.ninja.stage.textTool,
                boundObjectPropertyPath: "bold",
                oneway: false
            });

            Object.defineBinding(this.btnItalic, "pressed", {
                boundObject: this.application.ninja.stage.textTool,
                boundObjectPropertyPath: "italic",
                oneway: false
            });

            Object.defineBinding(this.btnUnderline, "pressed", {
                boundObject: this.application.ninja.stage.textTool,
                boundObjectPropertyPath: "underline",
                oneway: false
            });

            Object.defineBinding(this.btnStrikethrough, "pressed", {
                boundObject: this.application.ninja.stage.textTool,
                boundObjectPropertyPath: "strikeThrough",
                oneway: false
            });
        }
    },

    // Events
    handleEditorSelect: {
        value: function(e) {

        }
    },
    
    handleAlignLeftAction: {
        value: function(e) {
            //this.alignLeft.value = false;
            this.alignCenter.value = false;
            this.alignRight.value = false;
            this.alignJustify.value = false;
            this.application.ninja.stage.textTool.doAction("justifyleft");
        }
    },

    handleAlignCenterAction: {
        value: function(e) {
            this.alignLeft.value = false;
            //this.alignCenter.value = false;
            this.alignRight.value = false;
            this.alignJustify.value = false;
            this.application.ninja.stage.textTool.doAction("justifycenter");
        }
    },

    handleAlignRightAction: {
        value: function(e) {
            this.alignLeft.value = false;
            this.alignCenter.value = false;
            //this.alignRight.value = false;
            this.alignJustify.value = false;
            this.application.ninja.stage.textTool.doAction("justifyright");
        }
    },

    handleAlignJustifyAction: {
        value: function(e) {
            this.alignLeft.value = false;
            this.alignCenter.value = false;
            this.alignRight.value = false;
            //this.alignJustify.value = false;
            this.application.ninja.stage.textTool.doAction("justifyfull");
        }
    },

    handleIndentAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.doAction("indent");
        }
    },

    handleOutdentAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.doAction("outdent");
        }
    },

    handleBulletedListAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.doAction("insertunorderedlist");
        }
    },

    handleNumberedListAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.doAction("insertorderedlist");
        }
    },


    handleFontColorChange: {
        value: function(e) {
            this.application.ninja.stage.textTool.foreColor = e._event.color.css;
        }
    }

});

