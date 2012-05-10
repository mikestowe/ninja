/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.Toolbar = Montage.create(Component, {
    _needsButtonProperties : {
        value: null
    },
    leftAlignClass  : { value: "left-button" },
    hideButtonClass : { value: "hide-button" },
    _buttons : { value: null },
    buttons : {
        get: function() {
            return this._buttons;
        },
        set: function(btns) {
            this._buttons = btns;
            this._needsButtonProperties = true;
        }
    },

    _buttonToHide : {
        value: null
    },
    _buttonToShow : {
        value: null
    },
    getButton : {
        value: function(identifier) {
            var buttons = this.repetition.childComponents,
                buttonIds = buttons.map(function(component) {
                    return component.sourceObject.identifier;
                });

            return buttons[buttonIds.indexOf(identifier)];
        }
    },
    hideButton : {
        value: function(identifier) {
            var button = this.getButton(identifier);

            if(button) {
                this._buttonToHide = button;
                this.needsDraw = true;
            }
        }
    },
    showButton : {
        value: function(identifier) {
            var button = this.getButton(identifier);

            if(button) {
                this._buttonToShow = button;
                this.needsDraw = true;
            }
        }
    },

    prepareForDraw : {
        value: function() {
            if(this._needsButtonProperties) {
                this.repetition.childComponents.forEach(function(button) {
                    button.identifier = button.sourceObject.identifier;
                    button.addEventListener('action', this.delegate, false);
                }, this);
            }
        }
    },
    draw : {
        value: function() {
            if(this._needsClass) {

                this.repetition.childComponents.forEach(function(button) {
                    button.element.classList.add('toolbar-' + button.sourceObject.identifier + '-button');

                    ///// add left align class if specified in serialization
                    if(button.sourceObject.leftAlign) {
                        button.element.parentElement.classList.add(this.leftAlignClass);
                    }
                }, this);

                this._needsClass = false;
            }

            if(this._needsButtonProperties) {
                this._needsClass = this.needsDraw = true;
                this._needsButtonProperties = false;
            }

            if(this._buttonToHide) {
                this._buttonToHide.element.classList.add(this.hideButtonClass);
                this._buttonToHide = null;
            }
            if(this._buttonToShow) {
                this._buttonToShow.element.classList.remove(this.hideButtonClass);
                this._buttonToShow = null;
            }

        }
    },
    _needsClass : {
        value: null
    }
});