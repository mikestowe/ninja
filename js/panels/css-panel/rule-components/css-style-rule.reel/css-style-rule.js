/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.CssStyleRule = Montage.create(Component, {
    cssText: {
        value: null
    },
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

            this.declaration = rule.style;

            console.log('Rule with selector "' +rule.selectorText+ '" is set on componenet.');

            this._rule = rule;
        }
    },
    declarationComponent: {
        value: null
    } ,
//    declarationNodeName: {
//        value: "dl"
//    },
//    declarationElement: {
//        value: null
//    },
    _declaration: {
        value: null
    },
    declaration: {
        get: function() {
            return this._declaration;
        },
        set: function(dec) {
            this._declaration = dec;
        }
    },
    condition: {
        value: false
    },
    templateDidLoad : {
        value: function() {
            console.log("css style rule : template did load");
            if(this._declaration) {
                this.declarationComponent.declaration = this._declaration;
            }
        }
    },
    prepareForDraw : {
        value: function() {
            console.log("css style rule : prepare for draw");

            if(!this.declarationElement) {
                ///// Create element to contain declaration
                this.declarationElement = document.createElement(this.declarationNodeName);
            }

            if(!this._declaration && this._rule) {

            }
        }
    },
    draw : {
        value: function() {
            console.log("css style rule : draw");
        }
    }
});
