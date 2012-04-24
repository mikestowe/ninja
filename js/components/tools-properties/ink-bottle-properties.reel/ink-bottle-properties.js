/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ShapesController = require("js/controllers/elements/shapes-controller").ShapesController,
    ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.InkBottleProperties = Montage.create(ToolProperties, {

    _subPrepare: {
        value: function() {
            Object.defineBinding(this._strokeMaterial, "items", {
                boundObject: this.application.ninja.appModel,
                boundObjectPropertyPath: "materials",
                oneway: false
            });
        }
    },

    handleAction: {
        value: function(event) {
            var ch = event.currentTarget,
                val = event.currentTarget.identifier;
            switch(val) {
                case "useBorderWidth":
                    if(ch.checked) {
                        this.borderWidthLabel.element.classList.remove("disabled");
                        this._borderWidth.enabled = true;
                    } else {
                        this.borderWidthLabel.element.classList.add("disabled");
                        this._borderWidth.enabled = false;
                    }
                    break;
                case "useBorderStyle":
                    if(ch.checked) {
                        this.borderStyleLabel.element.classList.remove("disabled");
                        this._borderStyle.removeAttribute("disabled")
                    } else {
                        this.borderStyleLabel.element.classList.add("disabled");
                        this._borderStyle.setAttribute("disabled", "disabled");
                    }
                    break;
                case "useStrokeSize":
                    if(ch.checked) {
                        this.strokeSizeLabel.element.classList.remove("disabled");
                        this._strokeSize.enabled = true
                    } else {
                        this.strokeSizeLabel.element.classList.add("disabled");
                        this._strokeSize.enabled = false;
                    }
                    break;
                case "useWebGl":
                    (ch.checked) ? this._materialsContainer.style["display"] = "" : this._materialsContainer.style["display"] = "none";
                    break;
            }
        }
    }
});