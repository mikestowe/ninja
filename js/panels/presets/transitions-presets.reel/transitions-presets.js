/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    DefaultPresets = require("js/panels/presets/default-transition-presets").transitionPresets;

exports.TransitionsLibrary = Montage.create(Component, {
    hasTemplate: {
        value: true
    },
    presetData : {
        value: null
    },
    deserializedFromTemplate : {
        value: function() {
            this.presetData = DefaultPresets;
        }
    },
    handleNodeActivation: {
        value: function(presetData) {
            var selection = this.application.ninja.selectedElements,
                stylesController = this.application.ninja.stylesController,
                selectorBase = presetData.selectorBase,
                self = this;

            if(!selection || !selection.length || selection.length === 0) {
                return false;
            }

            selectorBase = stylesController.generateClassName(selectorBase);

            presetData.rules.forEach(function(rule) {
                this.application.ninja.stylesController.addRule('.' + selectorBase + rule.selectorSuffix, rule.styles);
            }, this);

            selection.forEach(function(el) {
                el._element.classList.add(selectorBase);
            }, this);

    	}
 	}
});
