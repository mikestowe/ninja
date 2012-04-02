/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.BrushProperties = Montage.create(ToolProperties, {
    _subPrepare: {
        value: function() {
            this.handleChange(null);
            this._useCalligraphic.addEventListener("change", this, false);
            this._doSmoothing.addEventListener("change", this, false);
        }
    },
    handleChange: {
        value: function(event) {
            if(this._useCalligraphic.checked) {
                this._strokeAngle.element.style["display"] = "";
                this._strokeAngle.visible = true;
                this._angleLabel.style["display"] = "";
            } else {
                this._strokeAngle.element.style["display"] = "none";
                this._strokeAngle.visible = false;
                this._angleLabel.style["display"] = "none";
            }
            if(this._doSmoothing.checked) {
                this._smoothingAmount.element.style["display"] = "";
                this._smoothingAmount.visible = true;
            } else {
                this._smoothingAmount.element.style["display"] = "none";
                this._smoothingAmount.visible = false;
            }
        }
    },
    strokeSize: {
        get: function() { return this._strokeSize; }
    },
    strokeHardness: {
        get: function() { return this._strokeHardness; }
    },
    doSmoothing:{
        get: function() {return this._doSmoothing.checked; }
    },
    smoothingAmount:{
        get: function() {return this._smoothingAmount;}
    },
    useCalligraphic: {
        get: function() {return this._useCalligraphic.checked;}
    },
    strokeAngle: {
        get: function() {return this._strokeAngle;}
    }
});
