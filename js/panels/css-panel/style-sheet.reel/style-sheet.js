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
        }
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
    _styleSheet : {
        value: null
    },
    styleSheet : {
        get: function() {
            return this._styleSheet;
        },
        set: function(sheet) {
            if(sheet.href) {
                this.name = sheet.href.substring(sheet.href.lastIndexOf('/'));
            } else {
                this.name = 'Style Tag';
            }
        }
    }
});