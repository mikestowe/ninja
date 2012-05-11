/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.RuleList = Montage.create(Component, {
    focusDelegate : { value: null },
    ruleNodeName : { value: 'li' },
    _needsScrollToBottom: { value: null },

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
                } else {
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
                console.log("Scroll top:", this.element.scrollTop);
                this._needsScrollToBottom = false;
            }

            //// Iterate through all rules needing removal
            console.log("Rule List :: Rules to draw:,", this.rulesToDraw.length);
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
        }
    }
});
