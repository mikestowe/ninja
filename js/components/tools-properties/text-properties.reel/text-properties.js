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
    indent: {value: null},
    outdent: {value: null},
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
            this.indent.label = "-->"
            this.outdent.label = "<--";
            this.numberedList.label = "1 2 3";
            this.bulletedList.label = "• • •";
            this.fontSelection.items = ["Arial", "Arial Black", "Courier New", "Garamond", "Georgia",  "Open Sans", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana"];
            this.tagType.items = ["div", "span", "p", "section", "article", "h1", "h2", "h3", "h4", "h5", "h6"];


            this.application.ninja.stage.textTool.addEventListener("editorSelect", this, false);
            Object.defineBinding(this.application.ninja.stage.textTool.states, "bold", {
              boundObject: this.btnBold,
              boundObjectPropertyPath: "value"
            });

        }
    },

    handleEditorSelect: {
        value: function(e) {
            console.log("hello");
            this.application.ninja.stage.textTool.updateStates();
        }
    },

    defaultFontSize: {
        value: "12px"
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
    },

    handleFontSizeChange: {
        
    },

    handleBtnBoldAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.doAction("bold", true);
        }
    },

    handleBtnItalicAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.doAction("italic", true);
        }
    },

    handleBtnUnderlineAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.doAction("underline", true);
        }
    },

    handleBtnStrikethroughAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.doAction("strikethrough", true);
        }
    },
    
    handleAlignLeftAction: {
        value: function(e) {
            //this.alignLeft.value = false;
            this.alignCenter.value = false;
            this.alignRight.value = false;
            this.alignJustify.value = false;
            this.application.ninja.stage.textTool.doAction("justifyLeft", true);
        }
    },

    handleAlignCenterAction: {
        value: function(e) {
            this.alignLeft.value = false;
            //this.alignCenter.value = false;
            this.alignRight.value = false;
            this.alignJustify.value = false;
            this.application.ninja.stage.textTool.doAction("justifyCenter", true);
        }
    },

    handleAlignRightAction: {
        value: function(e) {
            this.alignLeft.value = false;
            this.alignCenter.value = false;
            //this.alignRight.value = false;
            this.alignJustify.value = false;
            this.application.ninja.stage.textTool.doAction("justifyRight", true);
        }
    },

    handleAlignJustifyAction: {
        value: function(e) {
            this.alignLeft.value = false;
            this.alignCenter.value = false;
            this.alignRight.value = false;
            //this.alignJustify.value = false;
            this.application.ninja.stage.textTool.doAction("strikethrough", null);
        }
    },

    handleIndentAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.doAction("indent", null);
        }
    },

    handleOutdentAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.doAction("outdent", null);
        }
    },

    handleFontSizeChange: {
        value: function(e) {
           
        }
    },

    handleFontSizeChanging: {
        value: function(e) {

        }
    },

    handleFontSelectionChange: {
        value: function() {
            this.application.ninja.stage.textTool.doAction("fontname", this.fontSelection.value);
        }
    },

    handleNumberedListAction: {
        value: function(e) {
            //this.numberedList.value = false;
            this.bulletedList.value = false;
            this.application.ninja.stage.textTool.doAction("insertnumberedlist", true);
        }
    },

    handleOrderedListAction: {
        value: function(e) {
            this.numberedList.value = false;
            //this.bulletedList.value = false;
            this.application.ninja.stage.textTool.doAction("insertnumberedlist", true);
        }
    },

});