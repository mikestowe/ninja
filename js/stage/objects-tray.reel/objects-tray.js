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

/**
 @requires montage/core/core
 @requires montage/ui/component
 */
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.ObjectsTray = Montage.create(Component, {
    hideClass : { value: 'hide-objects-tray'},
    _empty : { value: null },
    _workspaceMode : { value: null },

    iconsRepetition : {
        value: null
    },
    offStageObjectsController : {
        value: null
    },

    _showAllObjects : { value: null },
    showAllObjects : {
        get : function() { return this._showAllObjects; },
        set : function(value) {
            if(value === this._showAllObjects) { return; }

            this._showAllObjects = value;

            this.needsDraw = true;
        }
    },

    workspaceMode : {
        get : function() { return this._workspaceMode; },
        set : function(value) {
            if(value === this._workspaceMode) { return; }

            var toHide = (value !== 'binding');

            setTimeout(function() {
                this.hide = toHide;
            }.bind(this), 200);

            this._workspaceMode = value;

            this.needsDraw = true;
        }
    },

    _objects: { value: null },
    objects: {
        get: function() {
            return this._objects;
        },
        set: function(value) {
            this._objects = value;
            this.needsDraw = true;
        }
    },

    offStageObjectFilter : {
        value: function(obj) {
            if(this.showAllObjects) {
                return true;
            }

            return this.application.ninja.objectsController.isOffStageObject(obj);
        }
    },

    _hide : { value: null },
    hide : {
        get : function() { return this._hide; },
        set : function(value) {
            if(value === this._hide) { return; }

            this._hide = value;

            this.needsDraw = true;
        }
    },

    displayHUDForObject : {
        value: function(object) {
            this.parentComponent.boundComponents.push(object);
        }
    },

    /* ---------------------
     Draw Cycle
     --------------------- */

    templateDidLoad: {
        value: function() {
            this.offStageObjectsController.filterFunction = this.offStageObjectFilter.bind(this);
        }
    },

    prepareForDraw : {
        value: function() {

            Object.defineBinding(this, 'workspaceMode', {
                "boundObject": this.application.ninja,
                "boundObjectPropertyPath": "workspaceMode",
                "oneway": true
            });

            Object.defineBinding(this, 'objects', {
                "boundObject": this.application.ninja.objectsController,
                "boundObjectPropertyPath": "objects",
                "oneway": true
            });

        }
    },
    willDraw : {
        value: function() {
            if(this.objects) {
                this._empty = !this.offStageObjectsController.organizedObjects.length;
            } else {
                this._empty = true;
            }
        }
    },
    draw : {
        value: function() {
            if(this.hide || this._empty) {
                this.element.classList.add(this.hideClass);
            } else {
                this.element.classList.remove(this.hideClass);
            }
        }
    }

});
