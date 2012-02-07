/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.StylesLibrary = Montage.create(Component, {
    hasTemplate: {
        value: true
    },
    contentPanel : {
        value: "presets" // get from local storage
    },
    templateDidLoad : {
        value: function() {
            console.log('deserialized');
        }
    },
    treeList : {
        value : null
    },
    data2: {
        value: {
            "text": "styles",
            "children": [{
                "text": "Box Styles",
                "children": [
                    {
                        "text": "Border-Radius",
                        "classNameBase" : "border-radius",
                        "styles" : {
                            "border-radius": "100px",
                            "border" : "1px solid #333"
                        }
                    },
                    {
                        "text": "Drop Shadow",
                        "classNameBase" : "drop-shadow",
                        "styles" : {
                            "box-shadow": "2px 2px 50px rgba(0,0,0,0.5)",
                            "border" : "1px solid #CCC"
                        }
                    },
                    {
                        "text": "Fancy Box",
                        "classNameBase" : "fancy-box",
                        "styles" : {
                            "box-shadow": "inset 0 0 0 1px #666, inset 0 0 0 2px rgba(225, 225, 225, 0.4), 0 0 20px -10px #333",
                            "border" : "1px solid #FFF",
                            "border-radius": "30px",
                            "background-color": "#7db9e8",
                            "background-image": "-webkit-linear-gradient(top, rgba(255,255,255,0.74) 0%,rgba(255,255,255,0) 100%)"
                        }
                    }]
            }, {
                "text": "Text Styles",
                "children": [
                    { "text": "Italic" },
                    { "text": "Text Shadow" },
                    { "text": "Text Color" } ]
            }, {
                "text": "Color Styles",
                "children": [
                    { "text": "Background Gradient" },
                    { "text": "Background Color" },
                    { "text": "Text Highlight" } ]
            }]
        }
    },
    didDraw: {
        value : function() {
            console.log('Presets Panel prepare for draw.');
//            this.treeList.items.push({
//                label : "Box Style",
//                type : 'leaf'
//            });
        }
    },
    applyPresetSelection : {
        value: function(presetData) {
            var selection = this.application.ninja.selectedElements,
                self = this;

            function setStopRuleSelector(selector) {
                self.application.ninja
                    .currentDocument.documentRoot
                    .elementModel.controller
                    .changeSelector(self.application.ninja.currentDocument.documentRoot, null, selector);
            }

            selection.forEach(function(el) {
                el._element.style.webkitTransition = "all 450ms linear";

                el._element.addEventListener("webkitTransitionEnd", function(e) {
                    console.log("calling transition end");
                    setStopRuleSelector("*");
                });

                setStopRuleSelector("transitionStopRule");

                this.application.ninja.stylesController.setElementStyles(el._element, presetData.styles);
            }, this);

        }
    },
    shouldChangeSelection : {
        value : function(controller, newSelection, oldSelection) {
            //
            //debugger;
            console.log('1Handle should change selection');
            return false;
        }
    }


});
