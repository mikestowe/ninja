/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.StylesViewContainer = Montage.create(Component, {
    noDocumentCondition : {
        value: true
    },
    contentPanel : {
        value: 'rules'
    },
    displayedList : {
        value: null
    },
    deserializedFromTemplate : {
        value: function() {
            console.log("styles view container - deserialized");
        }
    },
    prepareForDraw : {
        value: function() {
            console.log("styles view container - prepare for draw");
        }
    },
    draw : {
        value: function() {
            console.log("styles view container - draw");
        }
    }
});