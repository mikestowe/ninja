/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ShapesController = require("js/controllers/elements/shapes-controller").ShapesController,
    ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.ShapeProperties = Montage.create(ToolProperties, {
    toolsData: { value: null },
    _use3D:    { value: false },

    _subPrepare: {
        value: function() {
            this.rectProperties.visible = true;

            ShapesController.DisplayMaterials(this._strokeMaterial);
            ShapesController.DisplayMaterials(this._fillMaterial);

            this.handleChange(null);
            this._useWebGL.addEventListener("change", this, false);
        }
    },

    _selectedSubTool: { value: null, enumerable: false},

    selectedSubTool : {
        get: function() { return this._selectedSubTool;},
        set: function(value) {
            if(value) {

                this._selectedSubTool? this[this._selectedSubTool.properties].visible = false : this.rectProperties.visible = false;

                this._selectedSubTool = value;
                this[this._selectedSubTool.properties].visible = true;

                if(this._selectedSubTool.id === "LineTool") {
                    this._fillIcon.style["display"] = "none";
                    this._fillMaterial.style["display"] = "none";
                } else {
                    this._fillIcon.style["display"] = "";
                    this._fillMaterial.style["display"] = "";
                }
                
            }
        }
    },

    handleChange: {
        value: function(event) {
            if(this._useWebGL.checked)
            {
                this._use3D = true;
                this._materialLabel.style["display"] = "";
                this._strokeIcon.style["display"] = "";
                this._strokeMaterial.style["display"] = "";
                if(this.selectedSubTool.id !== "LineTool")
                {
                    this._fillIcon.style["display"] = "";
                    this._fillMaterial.style["display"] = "";
                }
            }
            else
            {
                this._use3D = false;
                this._materialLabel.style["display"] = "none";
                this._strokeIcon.style["display"] = "none";
                this._strokeMaterial.style["display"] = "none";
                this._fillIcon.style["display"] = "none";
                this._fillMaterial.style["display"] = "none";
            }
        }
    }

});
