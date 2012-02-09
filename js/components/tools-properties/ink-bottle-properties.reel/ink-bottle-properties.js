/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ShapesController = require("js/controllers/elements/shapes-controller").ShapesController,
    ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.InkBottleProperties = Montage.create(ToolProperties, {

    _use3D:    { value: false },

    _subPrepare: {
        value: function() {
            Object.defineBinding(this._strokeMaterial, "items", {
                boundObject: this.application.ninja.appModel,
                boundObjectPropertyPath: "materials",
                oneway: false
            });

            this.handleChange(null);
            this._useWebGL.addEventListener("change", this, false);
        }
    },

    handleChange: {
        value: function(event) {
            if(this._useWebGL.checked)
            {
                this._use3D = true;
                this._materialsContainer.style["display"] = "";
            }
            else
            {
                this._use3D = false;
                this._materialsContainer.style["display"] = "none";
            }
        }
    }
});