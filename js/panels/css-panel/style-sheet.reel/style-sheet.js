/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.StyleSheet = Montage.create(Component, {
    deserializedFromTemplate : {
        value: function() {
            console.log("style sheet view - deserialized");
        }
    },
    willDraw : {
        value: function() {
            console.log("style sheet view - will draw");

            if(this.editing) {
                document.body.addEventListener('click', this, false);
            } else {
                document.body.removeEventListener('click', this, false);
            }
        }
    },
    draw : {
        value: function() {
            console.log("styles sheet view - draw");

            this.mediaInput.value = this._source.media.mediaText;

            if(this.editing) {
                this.editView.classList.add('expanded');
            } else {
                this.editView.classList.remove('expanded');
            }
        }
    },

    handleEditButtonAction: {
        value: function(e) {
            console.log('handle edit button action');
            this.editing = true;
        }
    },
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

    handleClick : {
        value: function(e) {
            console.log("handle click");
            if(e.target !== this.editView) {
                this.editing = false;
            }
        }
    },

    mediaInput: {
        value: null
    },

    _name: {
        value: null
    },
    name : {
        get: function() {
            return this._name;
        },
        set: function(text) {
            this._name = text;
        }
    },
    _source : {
        value: null
    },
    source : {
        get: function() {
            return this._source;
        },
        set: function(sheet) {
            console.log('sheet being set');
            if(sheet.href) {
                this.name = sheet.href.substring(sheet.href.lastIndexOf('/')+1);
            } else {
                this.name = 'Style Tag';
            }
            this._source = sheet;
        }
    }
});