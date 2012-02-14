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
            this.fontSelection.items = ["Arial", "Arial Black", "Courier New", "Garamond", "Georgia",  "Open Sans", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana"];
            this.tagType.items = ["div", "span", "p", "section", "article", "h1", "h2", "h3", "h4", "h5", "h6"];
            this.fontSize.items = ["8pt","10pt","12pt","14pt","18pt","24pt","36pt"];
        }
    },

    handleEditorSelect: {
        value: function(e) {
            this.application.ninja.stage.textTool.updateStates();
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
    },

    handleBtnBoldAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.doAction("bold");
        }
    },

    handleBtnItalicAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.doAction("italic");
        }
    },

    handleBtnUnderlineAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.doAction("underline");
        }
    },

    handleBtnStrikethroughAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.doAction("strikethrough");
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

    handleFontSizeChange: {
        value: function(e) {
            //We need the index of whats selected. This is a temporary solution til we can have a variable amount for font-size.
            for( var i = 0; i < this.fontSize.items.length; i++) {
                if (this.fontSize.value === this.fontSize.items[i]) {
                    this.application.ninja.stage.textTool.doAction("fontsize", (i +1));
                    break;
                }
            }
        }
    },

    defineInitialProperties: {
        value: function() {
            if (!this.initialized) {

                //Setup Font Selection tool
                this.fontColor = this.element.getElementsByClassName("fontColor")[0];
                this.fontColor.props = {side: 'top', align: 'center', wheel: true, palette: true, gradient: false, image: false, nocolor: true, offset: -80};
                this.application.ninja.colorController.addButton("chip", this.fontColor);
                this.fontColor.color('rgb', {wasSetByCode: true, type: 'change', color: {r: 0, g: 0, b: 0}, css: 'rgb(0,0,0)'});
                this.fontColor.addEventListener("change",this.handleFontColorChange.bind(this),false);

                this.application.ninja.stage.textTool.addEventListener("editorSelect", this, false);

                Object.defineBinding(this.btnBold, "pressed", {
                  boundObject: this.application.ninja.stage.textTool,
                  boundObjectPropertyPath: "states.bold",
                  boundValueMutator: this.validatePressed,
                  oneway: true
                });

                Object.defineBinding(this.btnItalic, "pressed", {
                  boundObject: this.application.ninja.stage.textTool,
                  boundObjectPropertyPath: "states.italic",
                  boundValueMutator: this.validatePressed,
                  oneway: true
                });

                Object.defineBinding(this.btnUnderline, "pressed", {
                  boundObject: this.application.ninja.stage.textTool,
                  boundObjectPropertyPath: "states.underline",
                  boundValueMutator: this.validatePressed,
                  oneway: true
                });

                Object.defineBinding(this.btnStrikethrough, "pressed", {
                  boundObject: this.application.ninja.stage.textTool,
                  boundObjectPropertyPath: "states.strikethrough",
                  boundValueMutator: this.validatePressed,
                  oneway: true
                });

                Object.defineBinding(this.alignLeft, "pressed", {
                  boundObject: this.application.ninja.stage.textTool,
                  boundObjectPropertyPath: "states.justifyleft",
                  boundValueMutator: this.validatePressed,
                  oneway: true
                });

                Object.defineBinding(this.alignCenter, "pressed", {
                  boundObject: this.application.ninja.stage.textTool,
                  boundObjectPropertyPath: "states.justifycenter",
                  boundValueMutator: this.validatePressed,
                  oneway: true
                });

                Object.defineBinding(this.alignRight, "pressed", {
                  boundObject: this.application.ninja.stage.textTool,
                  boundObjectPropertyPath: "states.justifyright",
                  boundValueMutator: this.validatePressed,
                  oneway: true
                });

                Object.defineBinding(this.alignJustify, "pressed", {
                  boundObject: this.application.ninja.stage.textTool,
                  boundObjectPropertyPath: "states.justifyfull",
                  boundValueMutator: this.validatePressed,
                  oneway: true
                });

                this.initialized = true;
            }

        }
    },

    validatePressed: {
        value: function(val) {
            if (val == "true") return true; else return false
        }
    },

    initialized: {
        value: false
    },

    handleFontSelectionChange: {
        value: function() {
            this.application.ninja.stage.textTool.doAction("fontname", this.fontSelection.value);
            this.application.ninja.stage.textTool.element.focus();
        }
    },

    handleNumberedListAction: {
        value: function(e) {
            //this.numberedList.value = false;
            this.bulletedList.value = false;
            this.application.ninja.stage.textTool.doAction("insertorderedlist");
            this.application.ninja.stage.textTool.element.focus();
        }
    },

    handleBulletedListAction: {
        value: function(e) {
            this.numberedList.value = false;
            //this.bulletedList.value = false;
            this.application.ninja.stage.textTool.doAction("insertunorderedlist");
            this.application.ninja.stage.textTool.element.focus();
        }
    },

    handleFontColorChange: {
        value: function(e) {
            this.application.ninja.stage.textTool.element.style.color = e._event.color.css;
            this.application.ninja.stage.textTool.element.focus();

            //this.application.ninja.stage.textTool.doAction("forecolor",e._event.color.css);

        }
    }


});