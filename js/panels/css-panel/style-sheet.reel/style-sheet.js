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
    prepareForDraw : {
        value: function() {
            console.log("style sheet view - prepare for draw");
        }
    },
    draw : {
        value: function() {
            console.log("styles sheet view - draw");

            this.mediaInput.value = this._source.media.mediaText;
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