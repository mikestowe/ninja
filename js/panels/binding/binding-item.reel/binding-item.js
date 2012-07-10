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

var Montage   = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;


exports.BindingItem = Montage.create(Component, {
    sourceObjectLabel : { value: null },
    boundObjectLabel : { value: null },

    bindingArgs : {
        value: null
    },

    _sourceObject : { value: null },
    sourceObject : {
        get: function() {
            return this._sourceObject;
        },
        set: function(value) {
            if(value === this._sourceObject) { return; }

            if(value && value.identifier) {
                this.sourceObjectLabel = value.identifier;
            }

            this._sourceObject = value;
        }
    },
    _boundObject : { value: null },
    boundObject : {
        get: function() {
            return this._boundObject;
        },
        set: function(value) {
            if(value === this._boundObject) { return; }

            if(value && value.identifier) {
                this.boundObjectLabel = value.identifier;
            }

            this._boundObject = value;
        }
    },

    _sourceObjectPropertyPath : { value: null },
    sourceObjectPropertyPath : {
        get: function() {
            return this._sourceObjectPropertyPath;
        },
        set: function(value) {
            if(value === this._sourceObjectPropertyPath) { return; }
            this._sourceObjectPropertyPath = value;
            this.needsDraw = true;
        }
    },
    _boundObjectPropertyPath : { value: null },
    boundObjectPropertyPath : {
        get: function() {
            return this._boundObjectPropertyPath;
        },
        set: function(value) {
            if(value === this._boundObjectPropertyPath) { return; }
            this._boundObjectPropertyPath = value;
            this.needsDraw = true;
        }
    },

    _oneway : { value: null },
    oneway : {
        get: function() {
            return this._oneway;
        },
        set: function(value) {
            if(value === this._oneway) { return; }

            this._oneway = value;

            this.needsDraw = true;
        }
    },

    /* -------------- Events -------------- */

    handleDirectionToggleButtonAction : {
        value: function(e) {
            var controller = this.application.ninja.objectsController;

            this.oneway = !this.oneway;
            controller.editBinding(this.bindingArgs, {
                oneway: !this.bindingArgs.oneway
            });
            controller.currentItem = controller.currentItem;
        }
    },

    handleEditButtonAction : {
        value: function(e) {
            this.parentComponent.parentComponent.displayEditView(this.bindingArgs);
        }
    },

    /* -------------- Component Draw Cycle -------------- */

    draw : {
        value: function() {
            if(this.oneway) {
                this.directionToggleButton.element.classList.remove('two-way');
            } else {
                this.directionToggleButton.element.classList.add('two-way');
            }
        }
    }
});
