/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.MouseMediator = Montage.create(Component, {
    hasTemplate: {
        value: false
    },

    deserializedFromTemplate: {
        value: function() {
            document.addEventListener("mouseup", this, false);
        }
    },

    handleMouseup: {
        value: function(event) {

            if(event._event.target.id !== "drawingCanvas") {
                NJevent( "appMouseUp");
            }

            return true;
        }
    }
});
