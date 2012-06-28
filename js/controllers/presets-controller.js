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
            var transitionDuration;

            element.classList.add(this.transitionClass);
            element.addEventListener("webkitTransitionEnd", this, true);


            //// TODO: replace this hack when webkit supports transitionStart event
            transitionDuration = this.application.ninja.stylesController.getElementStyle(element, '-webkit-transition-duration', true);
            element.njTimeout = window.setTimeout(function() {
                this.captureWebkitTransitionEnd({
                    'target': element
                });
            }.bind(this), this._getMilliseconds(transitionDuration) + 100);
        }
    },

    _getMilliseconds : {
        value: function(duration) {
            if(duration.indexOf('ms') !== -1) {
                return parseInt(duration);
            } else {
                return parseFloat(duration)*1000;
            }
        }
    },

    captureWebkitTransitionEnd : {
        value : function(e) {
            var el = e.target;

            //// TODO: replace this hack when webkit supports transitionStart event (see above)
            window.clearTimeout(el.njTimeout);

            this._dispatchChange();

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
                rules = [],
                animationNames = [];

            selectorBase = stylesController.generateClassName(selectorBase);

            selection.forEach(function(element) {
                var animationName;

                if(useTransition) {
                    this.addTransition(element);
                }

                ///// TODO: remove when we find out what to do with competing animations
                animationName = stylesController.getElementStyle(element, '-webkit-animation-name');
                if(animationName) {
                    animationNames.push(animationName);
                }

                element.classList.add(selectorBase);

            }, this);

            presetData.rules.forEach(function(rule, i) {
                ///// Treat keyframed rules differently
                if(rule.isKeyFrameRule) {
                    this.application.ninja.stylesController.addRule(
                        '@-webkit-keyframes ' + presetData.selectorBase,
                        this.stringifyKeys(rule.keys)
                    );
                } else {
                    var suffix = rule.selectorSuffix || '';

                    ///// TODO: remove when we find out what to do with competing animations
                    if(rule.styles['-webkit-animation-name'] && animationNames.length) {
                        rule.styles['-webkit-animation-name'] += ',' + animationNames.join(',');
                    }

                    rules.push(stylesController.addRule('.'+selectorBase + suffix, rule.styles));
                }
            }, this);

            if(!useTransition) {
                this._dispatchChange();
            }

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
    },

    _dispatchChange : {
        value: function(property, value) {
            this.application.ninja.stage.updatedStage = true;
            NJevent('elementChange', {
                type : 'presetChange',
                data: {
                    "prop": property,
                    "value": value
                },
                redraw: null
            });
        }
    }
});