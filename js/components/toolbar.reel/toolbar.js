/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.Toolbar = Montage.create(Component, {
    repetition: {
        value: null,
        serializable: true
    },

    _needsButtonProperties : {
        value: null
    },
    _sourceObject : {
        value: null
    },
    sourceObject : {
        get: function() {
            return this._sourceObject;
        },
        set: function(value) {
            if(value === this._sourceObject) { return; }
            this._sourceObject = value;
        },
        serializable: true
    },
    leftAlignClass  : { value: "left-button" },
    hideButtonClass : { value: "hide-button" },
    _buttons : { value: [], distinct: true },
    buttons : {
        get: function() {
            return this._buttons;
        },
        set: function(btns) {
            this._buttons = btns;
            this._needsButtonProperties = this.needsDraw = true;
        },
        serializable: true
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
