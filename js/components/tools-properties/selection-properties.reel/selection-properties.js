/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.SelectionProperties = Montage.create(ToolProperties, {

    transform: { value: null },
    _controls: { value: false },

    _subPrepare: {
        value: function() {
            this.transform.addEventListener("change", this, false);
        }
    },

    handleChange: {
        value: function(event) {
            this._controls = this.transform.checked;
            NJevent("toolOptionsChange", {source: "SelectionProperties", inTransformMode: this.transform.checked});
        }
    }

});