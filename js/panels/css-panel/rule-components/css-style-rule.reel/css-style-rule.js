/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.CssStyleRule = Montage.create(Component, {

    selectorField: {
        value: null
    },

    addClassNameOnChange : {
        value: null
    },
    unappliedClass : {
        value: 'unapplied-css-rule'
    },
    cssText: {
        value: null
    },
    hasTemplate: {
        value: true
    },
    focusDelegate : {
        value: null
    },
    _applied : {
        value: true,
        distinct: true
    },
    applied : {
        get: function() {
            return this._applied;
        },
        set: function(value) {
            if(this._applied === value || value === undefined || value === null) { return false; }

            this._applied = value;
            this.needsDraw = true;
        }
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

            if(rule.type === 'inline') {
                this.sheetName = 'Inline Style';
            } else {
                this.sheetName = rule.href || 'Style Tag';
            }

            this.selector = rule.selectorText;
            this.declaration = rule.style;

            //console.log('Rule with selector "' +rule.selectorText+ '" is set on componenet.');

            this._rule = rule;
        }
    },
    declarationComponent: {
        value: null
    },
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

    handleChange : {
        value: function(e) {
            if(this.focusDelegate) {
                this.focusDelegate.handleSelectorChange(this.rule, this.selectorField.value, this);
            }
        }
    },
    handleStop : {
        value: function(e) {
            if(this.focusDelegate) {
                if(e._event.detail.preventDefault) {
                    e._event.detail.preventDefault();
                }

                this.focusDelegate.handleSelectorStop(this.rule, this.selectorField.value, this);
            }
        }
    },
    handleMouseover: {
        value: function(e) {
            if(this.focusDelegate) {
                this.focusDelegate.handleSelectorHover(this.selectorField.value, 'over');
            }
        }
    },
    handleMouseout: {
        value: function(e) {
            if(this.focusDelegate) {
                this.focusDelegate.handleSelectorHover(this.selectorField.value, 'out');
            }
        }
    },
    update: {
        value: function() {
            if(this.cssText !== this.rule.cssText) {
                // TODO: add update for selector and stylesheet name
                this.declarationComponent.update();
            }
        }
    },

    templateDidLoad : {
        value: function() {
            //console.log("css style rule : template did load");
        }
    },
    prepareForDraw : {
        value: function() {
            this.selectorField.keyActions = this.keyActions;

            if(this.rule.type === 'inline') {
                this.selectorField.readOnly = true;
                this.declarationComponent.type = 'inline';
            } else {
                this.selectorField.addEventListener('change', this, false);
                this.selectorField.addEventListener('stop', this, false);
                this.selectorField.element.addEventListener('mouseover', this, false);
                this.selectorField.element.addEventListener('mouseout', this, false);
            }
        }
    },

    willDraw : {
        value: function() {
            if(this.applied) {
                this.element.removeAttribute('title');
            } else {
                this.element.title = "Rule does not apply to selection";
            }
        }
    },
    draw : {
        value: function() {
            //console.log("css style rule : draw");
            if(this.applied) {
                this.element.classList.remove(this.unappliedClass);
            } else {
                this.element.classList.add(this.unappliedClass);
            }
        }
    },

    keyActions : {
        value : {
            hint : {
                accept : [9,13], // accept hint
                stop   : [27],   // stop editing
                next   : [40],   // cycle to next hint
                prev   : [38],   // cycle to prev hint
                revert : [27],   // revert value
                backsp : [8]     // backspace hit
            },
            noHint : {
                stop   : [27,9,13],
                next   : [40],
                prev   : [38],
                revert : [27],
                backsp : [8]
            }
        },
        distinct: true
    }
});
