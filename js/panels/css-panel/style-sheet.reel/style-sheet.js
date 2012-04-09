/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.StyleSheet = Montage.create(Component, {
    _translateDistance: {
        value: null
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

            if(this._readOnly) {
                this._element.classList.add('ss-locked');
                this.importButton.element.classList.remove('ss-invisible');
            } else {
                this._element.classList.remove('ss-locked');
                this.importButton.element.classList.add('ss-invisible');
            }

        }
    },

    /* ------ Events------ */

    handleMousedown : {
        value: function(e) {
            var nonBlurringElements = [
                this.editView,
                this.deleteButton.element,
                this.disableButton.element,
                this.importButton.element];

            console.log("handle mousedown");

            if(nonBlurringElements.indexOf(e.target) === -1) {
                this.editing = false;
            }
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
            debugger;
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
            console.log('sheet being set: ', this);

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