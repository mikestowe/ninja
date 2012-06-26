/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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