/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ShapesController = require("js/controllers/elements/shapes-controller").ShapesController,
    ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

var InkBottleProperties = exports.InkBottleProperties = Montage.create(ToolProperties, {
    addedColorChips: { value: false },

    _strokeColorCtrl: {
        value: null,
        serializable: true
    },

    useBorderWidth: {
        value: null,
        serializable: true
    },

    borderWidthLabel: {
        value: null,
        serializable: true
    },

    _borderWidth: {
        value: null,
        serializable: true
    },

    useBorderStyle: {
        value: null,
        serializable: true
    },

    borderStyleLabel: {
        value: null,
        serializable: true
    },

    _borderStyle: {
        value: null,
        serializable: true
    },

    useStrokeSize: {
        value: null,
        serializable: true
    },

    strokeSizeLabel: {
        value: null,
        serializable: true
    },

    _strokeSize: {
        value: null,
        serializable: true
    },

    _useWebGL: {
        value: null,
        serializable: true
    },

    _materialsContainer: {
        value: null,
        serializable: true
    },

    _strokeMaterial: {
        value: null,
        serializable: true
    },

    _stroke: {
        enumerable: false,
        value: { colorMode: 'rgb', color: { r: 255, g: 255, b: 255, a: 1, css: 'rgb(255,255,255)', mode: 'rgb', wasSetByCode: true, type: 'change' }, webGlColor: [1, 1, 1, 1] }
    },

    stroke: {
        enumerable: true,
        get: function () {
            return this._stroke;
        },
        set: function (value) {
            if (value !== this._stroke) {
                this._stroke = value;
            }
        }
    },

        draw: {
        enumerable: false,
        value: function () {
            Object.getPrototypeOf(InkBottleProperties).draw.call(this);

            if (this.addedColorChips === false && this.application.ninja.colorController.colorPanelDrawn) {
                // setup stroke color
                this._strokeColorCtrl.props = { side: 'top', align: 'center', wheel: true, palette: true, gradient: false, image: false, nocolor: true, offset: -80 };
                this.application.ninja.colorController.addButton("chip", this._strokeColorCtrl);

                this._strokeColorCtrl.addEventListener("change", this.handleStrokeColorChange.bind(this), false);

                this.addedColorChips = true;
            }

            if (this.addedColorChips) {
                this._strokeColorCtrl.color(this._stroke.colorMode, this._stroke.color);
            }
        }
    },

    handleStrokeColorChange: {
        value: function (e) {
            this.stroke = e._event;
            this.stroke.webGlColor = this.application.ninja.colorController.colorModel.colorToWebGl(e._event.color);
        }
    },

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