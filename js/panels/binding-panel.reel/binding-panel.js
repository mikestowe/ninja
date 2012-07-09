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
var Montage         = require("montage/core/core").Montage,
    Component       = require("montage/ui/component").Component;


exports.BindingPanel = Montage.create(Component, {

    bindings : { value: null },
    editView : { value: null },

    _dockEditView : { value: null },
    dockEditView : {
        get : function() { return this._dockEditView; },
        set : function(value) {
            if(value === this._dockEditView) { return; }

            this._dockEditView = value;

            this.needsDraw = true;
        }
    },

    _editing: { value: null },
    editing: {
        get: function() {
            return this._editing;
        },
        set: function(value) {
            if(value === this._editing) { return; }
            this._editing = value;

            if(!value) {
                this.dockEditView = false;
            }

            this.needsDraw = true;
        }
    },
    _translateDistance : {
        value: null
    },

    displayEditView : {
        value: function(bindingArgs) {
            this.editView.bindingArgs = bindingArgs;
            this.editing = true;
        }
    },

    /* -------------------------
       Event handlers
     ------------------------- */

    handleWebkitTransitionEnd : {
        value: function(e) {
            console.log("trans end");

            this.dockEditView = this.editing;
        }
    },

    /* -------------------------
     Toolbar Button Actions
     ------------------------- */

    handleAddAction : {
        value: function(e) {
            var sourceObject = this.application.ninja.objectsController.currentObject;

            if(sourceObject) {
                this.displayEditView({
                    sourceObject: sourceObject
                });
            } else {
                this.displayEditView();
            }
        }
    },



    templateDidLoad : {
        value: function() {
            Object.defineBinding(this, 'bindings', {
                boundObject: this.application.ninja.objectsController,
                boundObjectPropertyPath: "currentObjectBindings",
                oneway: true
            });
        }
    },

    prepareForDraw : {
        value: function() {

        }
    },

    willDraw: {
        value: function() {
            this.editView.element.addEventListener('webkitTransitionEnd', this, false);

            if(this.editing) {
                this._translateDistance = this.element.offsetWidth;
            }
        }
    },

    draw : {
        value: function() {
            var transStr = '-webkit-transform',
                editViewEl = this.editView.element;

            if(this.dockEditView) {
                editViewEl.classList.add('edit-view-docked');
                editViewEl.style.removeProperty(transStr);
            } else {
                editViewEl.classList.remove('edit-view-docked');
                if(this.editing) {
                    editViewEl.style.setProperty(transStr, 'translate3d(-'+ this._translateDistance + 'px,0,0)');
                } else {
                    editViewEl.style.removeProperty(transStr);
                }
            }

        }
    }
});
