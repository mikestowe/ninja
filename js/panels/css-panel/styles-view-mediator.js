/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    Keyboard = require("js/mediators/keyboard-mediator").Keyboard;

exports.StylesViewMediator = Montage.create(Component, {
    newClassPrefix : {
        value: "new-class"
    },
    stylesController : {
        get: function() {
            return this.application.ninja.stylesController;
        },
        set: function(){
            return;
        }
    },

    handleSelectorChange : {
        value: function(rule, newSelector, ruleComponent) {
            rule.selectorText = newSelector;

            ruleComponent.applied = this.ruleListContainer.displayedList.selection.every(function(el) {
                return this._doesSelectorTargetElement(newSelector, el);
            }, this);

        }
    },

    ///// Add rule button action
    handleAddAction : {
        value: function(e) {
            var selector,
                newRule,
                applies = true;

            ///// Get selection prefix
            if(this.ruleListContainer.displayedList.selection.length > 1) {
                selector = this.stylesController.generateClassName(null, true);
            } else {
                selector = this.stylesController.generateClassName(this.newClassPrefix);
            }

            ///// Create the rule with generated selector
            newRule = this.application.ninja.stylesController.addRule('.'+selector, ' { }');

            ///// Add the generated class to each element in selection
            ///// and check whether it applies to the element
            this.ruleListContainer.displayedList.selection.forEach(function(el) {
                this.stylesController.addClass(el, selector);
                
                if(applies) {
                    applies = (this._doesSelectorTargetElement('.'+selector, el));
                }
            },this);

            ///// Add rule directly to the rule list
            this.ruleListContainer.displayedList.component.addRule(newRule).applied = applies;

        }
    },

    _doesSelectorTargetElement : {
        value: function doesSelectorTargetElement(selector, element) {
            var doc = element.ownerDocument,
                matchingEls = Array.prototype.slice.call(doc.querySelectorAll(selector));
            return matchingEls.indexOf(element) !== -1;
        }
    },

    ///// Enable/Disable Style when checkbox is clicked
    handleStyleToggle : {
        value: function(rule, enable, style) {
            if(enable) {
                this.stylesController.setStyle(rule, style.propertyText, style.valueText, style.priority);
            } else {
                this.stylesController.deleteStyle(rule, style.propertyText);
            }

            this._dispatchChange();
        }
    },

    handleStyleStop: {
        value: function(e) {
            console.log("Handle Style Stop");
            //debugger;
            if(e._event.detail.type === 'keydown') {

            }
        }
    },
    handlePropertyChange : {
        value: function(rule, property, value, oldProperty, style) {
            var browserValue;

            if(style.editingNewStyle) {
                return false;
            }

                ///// Remove old property and add new one
            this.stylesController.deleteStyle(rule, oldProperty);
            browserValue = this.stylesController.setStyle(rule, property, value);

            ///// Mark style as invalid if the browser doesn't accept it
            style.invalid = (browserValue === null);

            console.log("BrowserValue: ", browserValue, rule);

            this._dispatchChange(property, browserValue);
        }
    },
    handleValueChange : {
        value: function(rule, property, value, style) {
            var browserValue, units;

            ///// Auto-fill units if not provided and units
            ///// not previously stored
            units = style.getUnits(value);
            if(style.units && units === null && parseInt(value)) {
                value += style.units;
                style.valueField.value = value;
            } else if (value !== '0') {
                style.units = units;
            }

            ///// update value
            browserValue = this.stylesController.setStyle(rule, property, value);

            ///// Mark style as invalid if the browser doesn't accept it
            style.invalid = (browserValue === null);

            console.log("BrowserValue: ", browserValue, rule);

            this._dispatchChange(property, browserValue);

            if(style.editingNewStyle) {
                style.treeView.parentComponent.addNewStyleAfter(style);
                style.editingNewStyle = false;
            }
        }
    },

    handlePaste : {
        value: function(e) {
            var text = document.execCommand('insertHTML', null, e._event.clipboardData.getData("Text")).trim();

            if(text.matches(/([a-zA-Z-]+:[a-zA-Z-]+){,1}/)) {

            }
        }
    },

    _dispatchChange : {
        value: function(property, value) {
            this.application.ninja.stage.updatedStage = true;
            NJevent('elementChange', {
                type : 'cssChange',
                data: {
                    "prop": property,
                    "value": value
                },
                redraw: null
            });
        }
    }
});