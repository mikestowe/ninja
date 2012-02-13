/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    DefaultPresets = require("js/panels/presets/default-style-presets").stylePresets;

exports.StylesLibrary = Montage.create(Component, {
    hasTemplate: {
        value: true
    },
    presetData : {
        value : null
    },
    contentPanel : {
        value: "presets" // get from local storage
    },
    templateDidLoad : {
        value: function() {
            this.presetData = DefaultPresets;
        }
    },
    treeList : {
        value : null
    },
    didDraw: {
        value : function() {
        }
    },
    handleNodeActivation: {
        value: function(presetData) {
            var selection = this.application.ninja.selectedElements,
                self = this;

            if(!selection || !selection.length || selection.length === 0) {
                return false;
            }

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
    handleDragEnd : {
        value: function(sourceObject) {
            console.log(sourceObject);
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
