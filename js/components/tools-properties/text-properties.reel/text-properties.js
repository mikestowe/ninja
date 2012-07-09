/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ArrayController = require("montage/ui/controller/array-controller").ArrayController;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.TextProperties = Montage.create(ToolProperties, {

    fontName: {value: null, serializable: true},
    fontSize: {value: null, serializable: true},
    fontColor: {value: null, serializable: true},

    btnBold: {value: null, serializable: true},
    btnItalic: {value: null, serializable: true},
    btnUnderline: {value: null, serializable: true},
    btnStrikethrough: {value: null, serializable: true},

    alignLeft: {value: null, serializable: true},
    alignCenter: {value: null, serializable: true},
    alignRight: {value: null, serializable: true},
    alignJustify: {value: null, serializable: true},

    indent: {value: null, serializable: true},
    outdent: {value: null, serializable: true},

    numberedList: {value: null, serializable: true},
    bulletedList: {value: null, serializable: true},

    // Events
    handleEditorSelect: {
        value: function(e) {
            this.alignLeft.pressed = false;
            this.alignCenter.pressed = false;
            this.alignRight.pressed = false;
            this.alignJustify.pressed = false;
            this.bulletedList.pressed = false;
            this.numberedList.pressed = false;


            switch(this.application.ninja.stage.textTool.justify) {
                case "left":
                    this.alignLeft.pressed = true;
                    break;
                case "center":
                    this.alignCenter.pressed = true;
                    break;
                case "right":
                    this.alignRight.pressed = true;
                    break;
                case "full":
                    this.alignJustify.pressed = true;
        }

            switch(this.application.ninja.stage.textTool.listStyle) {
                case "ordered":
                    this.numberedList.pressed = true;
                    break;
                case "unordered":
                    this.bulletedList.pressed = true;
        }
        }
    },

    handleEditorBlur: {
        value: function(e) {

        }
    },


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

    // Actions
    handleJustifyLeftAction: {
        value: function(e) {
            this.alignCenter.pressed = false;
            this.alignRight.pressed = false;
            this.alignJustify.pressed = false;
            this.application.ninja.stage.textTool.justify = "left";
            }
    },

    handleJustifyCenterAction: {
        value: function(e) {
            this.alignLeft.pressed = false;
            this.alignRight.pressed = false;
            this.alignJustify.pressed = false;
            this.application.ninja.stage.textTool.justify = "center"
        }
    },

    handleJustifyRightAction: {
        value: function(e) {
            this.alignLeft.pressed = false;
            this.alignCenter.pressed = false;
            this.alignJustify.pressed = false;
            this.application.ninja.stage.textTool.justify = "right";
        }
    },

    handleJustifyAction: {
        value: function(e) {
            this.alignLeft.pressed = false;
            this.alignCenter.pressed = false;
            this.alignRight.pressed = false;
            this.application.ninja.stage.textTool.justify = "full";
        }
    },

    handleIndentAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.indent();
        }
    },

    handleOutdentAction: {
        value: function(e) {
            this.application.ninja.stage.textTool.outdent();
        }
    },

    handleBulletedListAction: {
        value: function(e) {
            this.numberedList.pressed = false;
            if(e._currentTarget.pressed) {
                this.application.ninja.stage.textTool.listStyle = "unordered";
            } else {
                this.application.ninja.stage.textTool.listStyle = "none";
            }
        }
    },

    handleNumberedListAction: {
        value: function(e) {
            this.bulletedList.pressed = false;
            if(e._currentTarget.pressed) {
                this.application.ninja.stage.textTool.listStyle = "ordered";
            } else {
                this.application.ninja.stage.textTool.listStyle = "none";
        }
        }
    },


    handleFontColorChange: {
        value: function(e) {
            this.application.ninja.stage.textTool.element.style.color = e._event.color.css;
        }
    }

});
