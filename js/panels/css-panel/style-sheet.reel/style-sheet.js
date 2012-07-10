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

exports.StyleSheet = Montage.create(Component, {

    nameText: {
        value: null,
        serializable: true
    },

    mediaInput: {
        value: null,
        serializable: true
    },

    editButton: {
        value: null,
        serializable: true
    },

    editView: {
        value: null,
        serializable: true
    },

    disableButton: {
        value: null,
        serializable: true
    },

    deleteButton: {
        value: null,
        serializable: true
    },

    _translateDistance: {
        value: null
    },

    prepareForDraw : {
        value: function() {
            this.nameText.element.addEventListener('click', this, false);
        }
    },

    willDraw : {
        value: function() {
            if(this.editing) {
                document.body.addEventListener('mousedown', this, false);
                this._translateDistance = this._element.offsetWidth - this.editButton._element.offsetWidth;

            } else {
                document.body.removeEventListener('mousedown', this, false);
            }
        }
    },
    draw : {
        value: function() {
            var transStr = '-webkit-transform';

            this.mediaInput.value = this._source.media.mediaText;

            if(this.editing) {
                this.editView.classList.add('expanded');
                this.editView.style.setProperty(transStr, 'translate3d(-'+ this._translateDistance + 'px,0,0)');
            } else {
                this.editView.classList.remove('expanded');
                this.editView.style.removeProperty(transStr);
            }

            if(this.default) {
                this._element.classList.add('default-style-sheet');
            } else {
                this._element.classList.remove('default-style-sheet');
            }

            if(this.dirty) {
                this.nameText.element.classList.add('ss-dirty');
            } else {
                this.nameText.element.classList.remove('ss-dirty');
            }

            if(this.disabled) {
                this.element.classList.add('ss-disabled');
            } else {
                this.element.classList.remove('ss-disabled');
            }

        }
    },

    /* ------ Events------ */

    handleMousedown : {
        value: function(e) {
            var nonBlurringElements = [
                this.editView,
                this.deleteButton.element,
                this.disableButton.element];

            if(nonBlurringElements.indexOf(e.target) === -1) {
                this.editing = false;
            }
        }
    },

    handleClick : {
        value: function(e) {
            this.parentComponent.parentComponent.defaultStyleSheet = this.source;
        }
    },

    handleEditButtonAction: {
        value: function(e) {
            this.editing = true;
        }
    },

    handleImportButtonAction: {
        value: function(e) {
            e.stopPropagation();
        }
    },

    handleDisableButtonAction: {
        value: function(e) {
            e.stopPropagation();
            this.disabled = !this.disabled;
        }
    },

    handleDeleteButtonAction : {
        value: function(e) {
            e.stopPropagation();
            this.parentComponent.parentComponent.handleDeleteAction(this);
        }
    },

    /* ------ State properties ------ */

    _editing : {
        value: null
    },
    editing : {
        get: function() {
            return this._editing;
        },
        set: function(enterEditingMode) {
            this._editing = enterEditingMode;
            this.needsDraw = true;
        }
    },

    _name: {
        value: "Style Tag",
        distinct: true
    },
    name : {
        get: function() {
            return this._name;
        },
        set: function(text) {
            this._name = text;
        }
    },
    _dirty : {
        value: null
    },
    dirty : {
        get: function() {
            return this._dirty;
        },
        set: function(value) {
            if(value === this._dirty) { return false; }

            this._dirty = value;
            this.needsDraw = true;
        }
    },

    _readOnly : { value: null },
    readOnly : {
        get: function() {
            return this._readOnly;
        },
        set: function(isReadOnly) {
            this._readOnly = isReadOnly;
            this.needsDraw = true;
        }
    },

    _default : { value: null },
    default : {
        get: function() {
            return this._default;
        },
        set: function(value) {
            this._default = value;
            this.needsDraw = true;
        }
    },

    _disabled : {
        value: null
    },
    disabled: {
        get: function() {
            return this._disabled;
        },
        set: function(disable) {
            var label = (disable) ? "Enable" : "Disable";
            this._source.ownerNode.disabled = disable;
            this.disableButton.label = label;

            this._disabled = disable;
            this.needsDraw = true;
        }
    },

    external : {
        value: null
    },

    _source : {
        value: null
    },
    source : {
        get: function() {
            return this._source;
        },
        set: function(sheet) {
            if(!sheet || sheet === this._source) { return; }

            this._extractData(sheet.ownerNode);
            this._source = sheet;
        }
    },

    _extractData : {
        value: function(sheetNode) {
            var data = sheetNode.dataset, key;

            for(key in data) {
                this[key] = data[key];
            }
        }
    },

    /* ------ Data Attribute Properties ------ */

    _ninjaExternalUrl: { value: null },
    ninjaExternalUrl : {
        get: function() { return this._ninjaExternalUrl; },
        set: function(url) {
            this.external = true;
            this._ninjaExternalUrl = url;
        }
    },

    _ninjaFileName: { value: null },
    ninjaFileName : {
        get: function() { return this._ninjaFileName; },
        set: function(fileName) {
            this.name = fileName;
            this._ninjaFileName = fileName;
        }
    },

    _ninjaFileUrl: { value: null },
    ninjaFileUrl : {
        get: function() { return this._ninjaFileUrl; },
        set: function(fileUrl) {
            this._ninjaFileUrl = fileUrl;
        }
    },

    _ninjaFileReadOnly: { value: null },
    ninjaFileReadOnly : {
        get: function() { return this._ninjaFileReadOnly; },
        set: function(isReadOnly) {
            this._ninjaFileReadOnly = this.readOnly = isReadOnly === "true";
        }
    },

    _ninjaUri: { value: null },
    ninjaUri : {
        get: function() { return this._ninjaUri; },
        set: function(uri) {
            this._ninjaUri = uri;
        }
    }
});
