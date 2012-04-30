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

    _rules: { value: null },
    rules: {
        get: function() {
            return this._rules;
        },
        set: function(list) {
            if(!list) {
                return null;
            }
            //debugger;
            console.log('list: ', list);
            this._rules = list;

            ///// remove previsouly added rules
            if(this.childComponents){
                this.childComponents.forEach(function(ruleComponent) {
                    this.removeRule(ruleComponent);
                }, this);
            }

            this._rules.forEach(function(rule) {
                this.addRule(rule);
            }, this);

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

    addRule: {
        value: function(rule) {
            var componentBase = this.supportedRules[rule.type],
                instance, el;

            ///// Draw the rule if we have a template for the rule type
            if(componentBase) {
                instance = Montage.create(componentBase);
                instance.rule = rule;

                if(this.focusDelegate) {
                    instance.focusDelegate = this.focusDelegate;
                }

                this.rulesToDraw.push(instance);
                this.needsDraw = true;
            }

            return instance;
        }
    },

    update : {
        value: function() {
            this.childComponents.forEach(function(component) {
                component.update();
            }, this);

            //// TODO: find new styles based on selection
        }
    },

    willDraw : {
        value: function() {
            this.rulesToDraw.forEach(function(component) {
                component.element = document.createElement(this.ruleNodeName);
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

            //// Iterate through all rules that need draw and append them
            this.rulesToDraw.forEach(function(component) {
                this.element.appendChild(component.element);
                this._needsScrollToBottom = this.needsDraw = true;
                component.needsDraw = true;
            }, this);

            ///// Null out any rules that were just drawn
            this.rulesToDraw.length = 0;
        }
    }
});
