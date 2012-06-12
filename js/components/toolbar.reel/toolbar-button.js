/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    Button = require("montage/ui/button.reel/button").Button;

var ToolbarButton = exports.ToolbarButton = Montage.create(Button, {
    hasTemplate : {
        value: false
    },
    _sourceObject : {
        value: null
    },
    sourceObject : {
        get: function() {
            return this._sourceObject;
        },
        set: function(value) {
            if(value === this._sourceObject) { return; }

            this._sourceObject = value;
        }
    }
});