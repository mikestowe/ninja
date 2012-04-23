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
    _buttons : { value: null },
    buttons : {
        get: function() {
            return this._buttons;
        },
        set: function(btns) {
            this._buttons = btns;
            this._needsButtonProperties = true;
            console.log("buttons set");
        }
    },
    prepareForDraw : {
        value: function() {
            console.log("toolbar - prepare for draw");
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
            console.log("toolbar - draw - repetition ", this.repetition);
            if(this._needsClass) {

                this.repetition.childComponents.forEach(function(button) {
                    button.element.classList.add('toolbar-' + button.sourceObject.identifier + '-button');
                }, this);
            }

            if(this._needsButtonProperties) {
                this._needsClass = this.needsDraw = true;
                this._needsButtonProperties = false;
            }


        }
    },
    _needsClass : {
        value: null
    }
});