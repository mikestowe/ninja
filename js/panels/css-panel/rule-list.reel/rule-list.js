/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.RuleList = Montage.create(Component, {
    hasTemplate: {
        value: true
    },
    listElement : {
        value: null
    },
    _rules: {
        value: null
    },
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
            this.needsDraw = true;
            this._needsAppend = true;
        }
    },
    templateDidLoad : {
        value: function() {
            console.log("Rule List : template did load");
            //this.condition = true;
            this.needsDraw = true;
            //debugger;
        }
    },
    prepareForDraw : {
        value: function() {
            console.log("Rule List : prepare for draw");
        }
    },
    draw : {
        value: function() {
            console.log("Rule List - Draw");
            if(this._needsAppend) {
                this._rules.forEach(function(rule) {
                    var componentBase = this.supportedRules[rule.type],
                        instance, el;

                    if(componentBase) {
                        el = document.createElement(this.ruleNodeName);
                        instance = Montage.create(componentBase);
                        instance.element = el;
                        instance.rule = rule;
                        this.element.appendChild(instance.element);
                        instance.needsDraw = true;
                    }


                }, this);
            }
            console.log("Rule List : draw");
        }
    },
    _createRuleComponent: {
        value: function(ruleType) {

        }
    },
    ruleNodeName : {
        value: 'li'
    },
    ruleComponents : {
        value: {
            "1"  : 'css-style-rule',
            "3"  : 'css-import-rule',
            "4"  : 'css-media-rule',
            "5"  : 'css-font-face-rule',
            "6"  : 'css-page-rule',
            "10" : 'namespace-rule'
        }
    }
});
