/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */


var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.PresetsController = Montage.create(Component, {

    hasTemplate : {
        value: false
    },

    transitionClass : {
        value : "nj-preset-transition"
    },

    addTransition: {
        value: function(element) {
            element.classList.add(this.transitionClass);
            element.addEventListener("webkitTransitionEnd", this, true);
        }
    },

    captureWebkitTransitionEnd : {
        value : function(e) {
            var el = e.target;
            el.classList.remove(this.transitionClass);
            el.removeEventListener("webkitTransitionEnd", this, true);
        }
    },

    applyPreset : {
        value: function(presetData, useTransition) {
            var selection = this.application.ninja.selectedElements;

            if(!selection || !selection.length || selection.length === 0) { return false; }

            var stylesController = this.application.ninja.stylesController,
                selectorBase = presetData.selectorBase,
                rules = [];

            selectorBase = stylesController.generateClassName(selectorBase);

            presetData.rules.forEach(function(rule, i) {
                ///// Treat keyframed rules differently
                if(rule.isKeyFrameRule) {
                    this.application.ninja.stylesController.addRule(
                        '@-webkit-keyframes ' + presetData.selectorBase,
                        this.stringifyKeys(rule.keys)
                    );
                } else {
                    var suffix = rule.selectorSuffix || '';
                    rules.push(stylesController.addRule('.'+selectorBase + suffix, rule.styles));
                }
            }, this);

            selection.forEach(function(element) {
                var el = element._element;

                if(useTransition) {
                    this.addTransition(el);
                }

                el.classList.add(selectorBase);

                //// Keep track of elements with presets and don't add duplicates
                this.setCachedPreset(el, presetData.id, rules);

            }, this);

        }
    },

    setCachedPreset : {
        value: function(el, presetId, rules) {

        }
    },

    getPresets : {
        value: function(element) {

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