/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    DefaultPresets = require("js/panels/presets/default-animation-presets").animationPresets;

exports.AnimationsLibrary = Montage.create(Component, {
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
            //debugger;
            var selection = this.application.ninja.selectedElements,
                stylesController = this.application.ninja.stylesController,
                selectorBase = presetData.selectorBase,
                self = this;

            if(!selection || !selection.length || selection.length === 0) {
                return false;
            }

            selectorBase = stylesController.generateClassName(selectorBase);

            presetData.rules.forEach(function(rule) {
                if(rule.isKeyFrameRule) {
                    this.application.ninja.stylesController.addRule(
                        '@-webkit-keyframes ' + presetData.selectorBase,
                        this.stringifyKeys(rule.keys)
                    );
                } else {
                    this.application.ninja.stylesController.addRule('.' + selectorBase + rule.selectorSuffix, rule.styles);
                }

            }, this);

            selection.forEach(function(el) {
                el._element.classList.add(selectorBase);
            }, this);

        }
    },

    stringifyKeys : {
        value: function(keysArray) {
            var keysString = '';

            keysArray.forEach(function(key) {
                var styles = '', style;

                for(style in key.styles) {
                    styles += style + ':' + key.styles[style] + '; ';
                }

                keysString += key.keyText + ' {' + styles + ' }';
            });

            return keysString;
        }
    }
});
