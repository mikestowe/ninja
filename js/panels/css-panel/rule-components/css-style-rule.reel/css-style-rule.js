/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.CssStyleRule = Montage.create(Component, {
    hasTemplate: {
        value: true
    },
    _rule : {
        value : null
    },
    rule : {
        get: function() {
            return this._rule;
        },
        set: function(rule) {
            this.cssText = rule.cssText;
            this.sheetName = rule.href || 'Style Tag';
            this.selector = rule.selectorText;
console.log('Rule with selector "' +rule.selectorText+ '" is set on componenet.');
            this._rule = rule;
        }
    },
    condition: {
        value: false
    },
    templateDidLoad : {
        value: function() {
            console.log("css style rule : template did load");
            //this.condition = true;
        }
    },
    prepareForDraw : {
        value: function() {
            console.log("css panel : prepare for draw");
        }
    },
    draw : {
        value: function() {
            console.log("css panel : draw");
        }
    }
});
