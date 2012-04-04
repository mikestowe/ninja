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
    templateDidLoad : {
        value: function() {
            this.presetData = DefaultPresets;
        }
    },
    handleNodeActivation: {
        value: function(presetData) {
            var selection = this.application.ninja.selectedElements,
                stylesController = this.application.ninja.stylesController,
                selectorBase = presetData.selectorBase,
                self = this, className;

            if(!selection || !selection.length || selection.length === 0) {
                return false;
            }

            function setStopRuleSelector(selector) {
                self.application.ninja
                    .currentDocument.documentRoot
                    .elementModel.controller
                    .changeSelector(self.application.ninja.currentDocument.documentRoot, null, selector);
            }

            selectorBase = stylesController.generateClassName(selectorBase);

            presetData.rules.forEach(function(rule) {
                stylesController.addRule('.'+selectorBase + rule.selectorSuffix, rule.styles);
            }, this);

            selection.forEach(function(el) {
                el._element.style.webkitTransition = "all 450ms linear";

                el._element.addEventListener("webkitTransitionEnd", function presetTransition(e) {
                    el._element.style.webkitTransition = '';
                    setStopRuleSelector("*");
                    this.removeEventListener("webkitTransitionEnd", presetTransition, true);

                }, true);
                setStopRuleSelector("transitionStopRule");
                el._element.classList.add(selectorBase);

                //// Keep track of elements with presets and don't add duplicates

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
