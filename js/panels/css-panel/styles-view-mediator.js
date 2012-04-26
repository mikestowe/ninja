/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    Keyboard = require("js/mediators/keyboard-mediator").Keyboard;

exports.StylesViewMediator = Montage.create(Component, {
    stylesController : {
        get: function() {
            return this.application.ninja.stylesController;
        },
        set: function(){
            return;
        }
    },
    handleAddAction : {
        value: function(e) {
            var selector, newRule;

            ///// Add rule to the container

            ///// Get selection prefix
            if(this.ruleListContainer.displayedList.selection.length > 1) {
                selector = this.stylesController.generateClassName(null, true);
            } else {
                selector = this.stylesController.generateClassName(this.ruleListContainer.displayedList.selection[0].nodeName);
            }

            newRule = this.application.ninja.stylesController.addRule('.'+selector, ' { }');

            this.ruleListContainer.displayedList.component.addRule(newRule);

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
                style.treeView.parentComponent.addNewStyle();
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