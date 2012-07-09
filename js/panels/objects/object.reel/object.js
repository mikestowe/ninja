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

exports.Object = Montage.create(Component, {
    _needsPropertyInspection : { value: null },
    iconElement              : { value: null },
    type                     : { value: null },


    _name : { value: null },
    name: {
        get: function() {
            return this._name;
        },
        set: function(val) {
            this.name = val;
        }
    },

    _sourceObject : { value: null },
    sourceObject : {
        get: function() {
            return this._sourceObject;
        },
        set: function(object) {
            if(this._sourceObject === object) { return false; }

            this._sourceObject = object;

            if(object._montage_metadata) {
                this.montageMetaData = object._montage_metadata;
                this.type = this.application.ninja.objectsController.getObjectCategory(object);
            }

            this._needsPropertyInspection = this.needsDraw = true;
        }

    },

    _identifier : {
        value: null
    },
    identifier : {
        get: function() {
            return this._identifier;
        },
        set: function(value) {
            if(this._identifier === value || !value) { return false; }

            this._identifier = value;

            this.needsDraw = true;
        }

    },

    _montageMetaData : {
        value: null
    },
    montageMetaData : {
        get: function() {
            return this._montageLabel;
        },
        set: function(data) {
            if(this._montageMetaData === data) { return false; }

            this._montageMetaData = data;

            if(data.label) {
                this.name = data.label;
                this.needsDraw = true;
            }
        }

    },

    /* ---------------------
     Event Handlers
     --------------------- */

    handleClick: {
        value: function(e) {
            this.parentComponent.parentComponent.displayHUDForObject(this.sourceObject);
        }
    },

    prepareForDraw : {
        value: function() {
            this.iconElement.addEventListener('click', this, false);
        }
    },

    draw : {
        value: function() {
            if(this.type) {
                this.iconElement.classList.add('object-icon-'+this.type.toLowerCase());
            } else{
                this.iconElement.classList.add('object-icon-default');
            }


        }
    }

});
