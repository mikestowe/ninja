/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.BrushProperties = Montage.create(ToolProperties, {
    strokeSize: {
        get: function() { return this._strokeSize; }
    },
    strokeHardness: {
        get: function() { return this._strokeHardness; }
    },
    doSmoothing:{
        get: function() {return this._doSmoothing.checked; }
    },
    useCalligraphic: {
        get: function() {return this._useCalligraphic.checked;}
    },
    strokeAngle: {
        get: function() {return this._strokeAngle;}
    }
});
