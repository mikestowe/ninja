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
            console.log("style sheet view - will draw");

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
            console.log("styles sheet view - draw");

            this.mediaInput.value = this._source.media.mediaText;

            if(this.editing) {
                this.editView.classList.add('expanded');
                this.editView.style.setProperty(transStr, 'translate3d(-'+ this._translateDistance + 'px,0,0)');
            } else {
                this.editView.classList.remove('expanded');
                this.editView.style.removeProperty(transStr);
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

    handleMousedown : {
        value: function(e) {
            console.log("handle mousedown");
            if(e.target !== this.editView && e.target !== this.editButton) {
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
            console.log('sheet being set: ', sheet.ownerNode);
            if(sheet.href) {
                this.name = sheet.href.substring(sheet.href.lastIndexOf('/')+1);
            } else {
                this.name = 'Style Tag';
            }
            this._source = sheet;
        }
    }
});