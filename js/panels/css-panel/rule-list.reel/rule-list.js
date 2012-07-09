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

exports.RuleList = Montage.create(Component, {
    supportedRules: {
        value: null,
        serializable: true
    },

    focusDelegate : { value: null },
    ruleNodeName : { value: 'li' },
    _needsScrollToBottom: { value: null },

    _hide : {
        value: null
    },
    hide : {
        get: function() {
            return this._hide;
        },
        set: function(value) {
            if(value === this._hide) { return; }

            this._hide = value;
            this.needsDraw = true;
        }
    },

    childComponents : {
        value: [],
        distinct: true
    },

    rulesToDraw : {
        value: [],
        distinct: true
    },
    rulesToRemove : {
        value: [],
        distinct: true
    },

    update : {
        value: function(rules) {
            this.childComponents.forEach(function(component) {
                component.update();
            }, this);
        }
    },

    _rules: { value: null },
    rules: {
        get: function() {
            return this._rules;
        },
        set: function(list) {
            if(!list) {
                return null;
            }

            var foundIndices = [];

            //// Iterate existing rules, update those which rule exists in new
            //// rule list
            this.childComponents.forEach(function(ruleComponent, i, drawnRules) {
                //// If rule exists in new list, update it
                var index = list.indexOf(ruleComponent.rule);

                if(ruleComponent.rule.type === 'inline') {
                    //// Let's emulate finding the line rule at the first index
                    index = 0;
                }

                if(index !== -1) {
                    // found rule in our component list, or it's the inline rule
                    ruleComponent.update();
                    foundIndices.push(index);
                } else if(!ruleComponent.applied) { /// remove rule (unless unapplied)
                    this.rulesToRemove.push(ruleComponent);
                }
            }, this);

            //// Find rules to add
            list.forEach(function(rule, index) {
                //// If we haven't updated the rule already,
                //// we're dealing with a new rule to add
                if(foundIndices.indexOf(index) === -1) {
                    this.addRule(rule, index);
                }
            }, this);

            this._rules = list;

            this.needsDraw = true;

        }
    },

    addRule: {
        value: function(rule, atIndex, applies, drawCallback) {
            var insertIndex = atIndex || this.childComponents.length;

            this.rulesToDraw.push({
                rule: rule,
                index: insertIndex,
                instance : null,
                applies : applies,
                callback : drawCallback
            });

            this.needsDraw = true;
        }
    },

    removeRule: {
        value: function(ruleComponent) {
            this.rulesToRemove.push(ruleComponent);
            this.needsDraw = true;
        }
    },

    willDraw : {
        value: function() {
            this.rulesToDraw.forEach(function(ruleObj) {
                var el = document.createElement(this.ruleNodeName);

                var componentBase = this.supportedRules[ruleObj.rule.type],
                    instance;

                ///// Draw the rule if we have a template for the rule type
                if(!componentBase) { return false; }

                instance = Montage.create(componentBase);
                instance.element = document.createElement(this.ruleNodeName);
                instance.rule = ruleObj.rule;
                instance.applied = ruleObj.applies;

                if(this.focusDelegate) {
                    instance.focusDelegate = this.focusDelegate;
                }

                ruleObj.instance = instance;

            }, this);

        }
    },

    draw : {
        value: function() {
            ///// If needed, scroll to bottom
            if(this._needsScrollToBottom) {
                ///// Make sure the appended rule item is visible (scrolled-to)
                this.element.scrollTop = this.element.offsetHeight;
                this._needsScrollToBottom = false;
            }

            //// Iterate through all rules needing removal
            this.rulesToRemove.forEach(function(ruleComponent) {
                var componentIndex = this.childComponents.indexOf(ruleComponent);
                this.childComponents.splice(componentIndex, 1);
                this.element.removeChild(ruleComponent.element);
            }, this);

            //// Iterate through all rules that need draw and append them
            this.rulesToDraw.forEach(function(ruleObj) {
                var ruleAtIndex = this.childComponents[ruleObj.index];

                if(ruleAtIndex) {
                    //// Insert rule at appropriate index
                    this.element.insertBefore(ruleObj.instance.element, ruleAtIndex.element);
                } else {
                    this.element.appendChild(ruleObj.instance.element);
                }

                this._needsScrollToBottom = this.needsDraw = true;
                this.childComponents.push(ruleObj.instance);
                ruleObj.instance.needsDraw = true;
            }, this);

            if(this.hide) {
                this.element.classList.add('hidden-rule-list');
            } else {
                this.element.classList.remove('hidden-rule-list');
            }

        }
    },

    didDraw : {
        value: function() {
            this.rulesToDraw.forEach(function(ruleObj) {
                if(typeof ruleObj.callback === 'function') {
                    ruleObj.callback(ruleObj.instance);
                }
            });

            this.rulesToRemove.forEach(function(ruleObj) {
                ruleObj.instance = null;
            }, this);

            ///// Null out any rules that were just drawn
            this.rulesToDraw.length = 0;
            this.rulesToRemove.length = 0;

            if(!this.parentComponent.ruleListDrawn) {
                this.parentComponent.ruleListDrawn = true;
                this.parentComponent.needsDraw = true;
            }
        }
    }
});
