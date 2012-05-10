/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    Keyboard = require("js/mediators/keyboard-mediator").Keyboard;

exports.StylesViewMediator = Montage.create(Component, {
    newClassPrefix      : { value: "new-class" },
    elementOutlineClass : { value: "nj-element-highlight" },

    stylesController : {
        get: function() {
            return this.application.ninja.stylesController;
        },
        set: function(){
            return;
        }
    },

    ///// Selector Actions
    //// -------------------------------------

    ///// Show the targeted elements in the document by applying a class
    ///// temporarily
    handleSelectorHover : {
        value: function(selector, direction) {
            if(!selector) { return false; }

            var elements = this.stylesController._activeDocument._document.querySelectorAll(selector),
                method = (direction === "out") ? "remove" : "add";

            Array.prototype.slice.call(elements).forEach(function(el) {
                el.classList[method](this.elementOutlineClass);
            }, this);
        }
    },

    ///// Apply new selector to the rule
    //// Verify that it applies to the selected elements
    //// Remove rule if the selector is deleted
    handleSelectorChange : {
        value: function(rule, newSelector, ruleComponent) {
            if(newSelector === "") {
                ruleComponent.parentComponent.removeRule(ruleComponent);
                this.stylesController.deleteRule(rule);
                ///// Remove the hover style
                this.handleSelectorHover(rule.selectorText, 'out');
                this._dispatchChange();
                return false;
            }

            rule.selectorText = newSelector;

            ruleComponent.applied = this.ruleListContainer.displayedList.selection.every(function(el) {
                return this._doesSelectorTargetElement(newSelector, el);
            }, this);

            this._dispatchChange();
        }
    },

    ///// Returns true if the passed-in selector targets the passed-in element
    _doesSelectorTargetElement : {
        value: function doesSelectorTargetElement(selector, element) {
            var doc = element.ownerDocument,
                matchingEls = Array.prototype.slice.call(doc.querySelectorAll(selector));
            return matchingEls.indexOf(element) !== -1;
        }
    },

    ///// Style event handlers
    //// -------------------------------------

    ///// Enable/Disable Style when checkbox is clicked
    handleStyleToggle : {
        value: function(rule, enable, style) {
            if(enable) {
                this.stylesController.setStyle(rule, style.propertyText, style.browserValue, style.priority);
            } else {
                this.stylesController.deleteStyle(rule, style.propertyText);
            }

            this._dispatchChange();
        }
    },

    handlePropertyStop: {
        value: function(e, style) {
            var key, nextFocus;

            console.log("Handle Style Stop");

            if(e._event.detail.type === 'keydown') {
                key = e._event.detail.keyCode;

                if(key === Keyboard.ENTER || key === Keyboard.TAB) {
                    e._event.detail.preventDefault();

                    if(e._event.detail.shiftKey) {
                        nextFocus = style.getSiblingStyle('prev') || style.getSiblingStyle('last');
                        nextFocus.valueField.start();
                    } else {
                        style.valueField.start();
                    }
                }
            }
        }
    },
    handleValueStop: {
        value: function(e, style) {
            var key, nextFocus
            console.log("Handle Value Stop");
            console.log("Editing new style: ", style.editingNewStyle);

            if(e._event.detail.type === 'keydown') {
                key = e._event.detail.keyCode;

                if(key === Keyboard.ENTER || key === Keyboard.TAB) {
                    e._event.detail.preventDefault();

                    if(e._event.detail.shiftKey) {
                        style.propertyField.start();
                    } else {
                        nextFocus = style.getSiblingStyle('next');
                        if(nextFocus) {
                            nextFocus.propertyField.start();
                        } else {
                            //style.parentComponent.parentComponent.addNewStyleAfter(style);
                            style.parentComponent.parentComponent.addNewStyle();
                            style.editingNewStyle = false;
                            setTimeout(function() {
                                style.getSiblingStyle('next').propertyField.start();
                            }, 50);
                        }
                    }
                }
            }
        }
    },
    handlePropertyChange : {
        value: function(rule, property, value, oldProperty, style) {
            var browserValue;

            if(style.editingNewStyle) {
                return false;
            }

            if(property === '') {
                style.remove();
                this._dispatchChange(oldProperty, browserValue);
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

            if(value === '') {
                style.remove();
                this._dispatchChange(property, browserValue);
                return false;
            }

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
            style.browserValue = browserValue;

            ///// Mark style as invalid if the browser doesn't accept it
            style.invalid = (browserValue === null);

            console.log("BrowserValue: ", browserValue, rule);

            this._dispatchChange(property, browserValue);

            if(style.editingNewStyle) {
                style.parentComponent.parentComponent.addNewStyle();
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

    /// Toolbar Button Actions
    /// -----------------------

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

    ///// Show/hide computed style sub panel
    handleComputedAction : {
        value: function(e) {
            var container = this.ownerComponent,
                panelToShow = (container.contentPanel === "computed") ? "rules" : "computed";

            ///// Handle showing and hiding of the add button
            if(panelToShow === "computed") {
                container.toolbar.hideButton('add');
            } else {
                container.toolbar.showButton('add');
            }

            container.contentPanel = panelToShow;
            this.ownerComponent.handleSelectionChange();
        }
    },

    ///// Utilities
    //// -------------------------------------

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