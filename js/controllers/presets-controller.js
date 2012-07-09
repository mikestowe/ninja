/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
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
