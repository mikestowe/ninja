/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    Keyboard = require("js/mediators/keyboard-mediator").Keyboard;

exports.StylesViewDelegate = Montage.create(Component, {

    ruleListContainer: {
        value: null,
        serializable: true
    },

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

            var elements = this.stylesController.currentDocument.model.views.design.document.querySelectorAll(selector),
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

            if(ruleComponent.addClassNameOnChange) {
                var lastClass = this._getClassNameFromSelector(newSelector);

                if(lastClass) {
                    ///// Add the generated class to each element in selection
                    ///// and check whether it applies to the element
                    this.ruleListContainer.displayedList.selection.forEach(function(el) {
                        this.stylesController.addClass(el, lastClass);
                    },this);
                }
                ruleComponent.addClassNameOnChange = false;
            }

            rule.selectorText = newSelector;

            ruleComponent.applied = this.ruleListContainer.displayedList.selection.every(function(el) {
                return this._doesSelectorTargetElement(newSelector, el);
            }, this);

            this._dispatchChange();
        }
    },

    handleSelectorStop : {
        value: function(rule, newSelector, ruleComponent) {
            ruleComponent.declarationComponent.repetition.childComponents[0].propertyField.start()
        }
    },

    _getClassNameFromSelector : {
        value: function(selectorText) {
            var results = /.*\.([A-Za-z0-9_-]+)\:?[A-Za-z0-9_"=-]*$/.exec(selectorText);
            return (results) ? results[1] : null;
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

            if(e._event.detail.type === 'keydown' && !style.deleting) {
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
            var key, nextFocus;

            if(e._event.detail.type === 'keydown' && !style.deleting) {
                key = e._event.detail.keyCode;

                if(key === Keyboard.ENTER || key === Keyboard.TAB) {
                    e._event.detail.preventDefault();

                    if(e._event.detail.shiftKey) {
                        style.propertyField.start();
                    } else {

                        nextFocus = style.getSiblingStyle('next');
                        if(nextFocus) {
                            nextFocus.propertyField.start();
                        } else if(style.dirty) {
                            style.parentComponent.parentComponent.addNewStyle(true);
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
            var declaration = style.parentComponent.parentComponent,
                browserValue;

            if(style.editingNewStyle) {
                if(property === '') {
                    style.propertyField.value = 'property';
                    style.propertyField.isDirty = false;
                    style.editingNewStyle = false;
                }
                return false;
            }

            ///// Remove old property
            this.stylesController.deleteStyle(rule, oldProperty);

            if(property === '') {
                style.deleting = true;
                declaration.removeStyle(style.source);
                this._dispatchChange(oldProperty);
                return false;
            }

            // now add new property
            browserValue = this.stylesController.setStyle(rule, property, value);

            //// Update the css text so it knows when to update
            declaration.cssText = rule.style.cssText;

            ///// Mark style as invalid if the browser doesn't accept it
            style.invalid = (browserValue === null);

            this._dispatchChange(property, browserValue);
        }
    },
    handleValueChange : {
        value: function(rule, property, value, style) {
            var declaration = style.parentComponent.parentComponent,
                browserValue, units;

            if(value === '') {
                ///// Remove old property
                style.deleting = true;
                this.stylesController.deleteStyle(rule, property);
                declaration.removeStyle(style.source);

                //// Update the css text so it knows when to update
                declaration.cssText = rule.style.cssText;

                this._dispatchChange(property, browserValue);
                return false;
            }

            ///// update value
            browserValue = this.stylesController.setStyle(rule, property, value);
            style.browserValue = browserValue;

            //// Update the css text so it knows when to update
            declaration.cssText = rule.style.cssText;

            ///// Mark style as invalid if the browser doesn't accept it
            style.invalid = (browserValue === null);

            this._dispatchChange(property, browserValue);
        }
    },

    handlePaste : {
        value: function(e) {
//            var text = document.execCommand('insertHTML', null, e._event.clipboardData.getData("Text")).trim();
//
//            if(text.matches(/([a-zA-Z-]+:[a-zA-Z-]+){,1}/)) {
//
//            }
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

            ///// Add rule directly to the rule list
            this.ruleListContainer.displayedList.component.addRule(newRule, null, applies, function(ruleComponent) {
                var rC = ruleComponent;

                // TODO: use stop event to apply class to element
                rC.addClassNameOnChange = true;

                setTimeout(function() {
                    rC.selectorField.start();
                    rC.selectorField._preEditValue = "";
                },50);

            });

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
            container.handleSelectionChange();
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