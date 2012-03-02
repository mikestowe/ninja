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
            console.log('list: ', list);
            this._rules = list;
            this.needsDraw = this._needsAppend = true;
        }
    },
    _contentController: {
        value: null
    },
    contentController: {
        get: function() {
            return this._contentController;
        },
        set: function(controller) {

            Object.defineBinding(this, 'rules', {
                "boundObject": controller,
                "boundObjectPropertyPath": "ruleList",
                "oneway": true

            });

            this._contentController = controller;
        }
    },
    templateDidLoad : {
        value: function() {
            console.log("Rule List : template did load");
            //this.condition = true;
        }
    },
    prepareForDraw : {
        value: function() {
            console.log("Rule List : prepare for draw");
        }
    },
    draw : {
        value: function() {
            if(this._needsAppend) {
                this._rules.forEach(function(rule) {
                    var componentBase = this.supportedRules[rule.type],
                        instance, el;

                    if(componentBase) {
                        el = document.createElement(this.ruleNodeName);
                        instance = componentBase.create();
                        instance.element = el;
                        instance.rule = rule;
                        this.listElement.appendChild(el);
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
