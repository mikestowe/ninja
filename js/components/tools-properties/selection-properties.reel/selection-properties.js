/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.SelectionProperties = Montage.create(ToolProperties, {

    transform: {
        value: null,
        serializable: true
    },

    topAlign: {
        value: null,
        serializable: true
    },

    middleAlign: {
        value: null,
        serializable: true
    },

    bottomAlign: {
        value: null,
        serializable: true
    },

    leftAlign: {
        value: null,
        serializable: true
    },

    centerAlign: {
        value: null,
        serializable: true
    },

    rightAlign: {
        value: null,
        serializable: true
    },

    distTop: {
        value: null,
        serializable: true
    },

    distMiddle: {
        value: null,
        serializable: true
    },

    distBottom: {
        value: null,
        serializable: true
    },

    distLeft: {
        value: null,
        serializable: true
    },

    distCenter: {
        value: null,
        serializable: true
    },

    distRight: {
        value: null,
        serializable: true
    },

    arrangeBringForward: {
        value: null,
        serializable: true
    },

    arrangeSendBackward: {
        value: null,
        serializable: true
    },

    arrangeBringToFront: {
        value: null,
        serializable: true
    },

    arrangeSendToBack: {
        value: null,
        serializable: true
    },

    _controls: { value: false },

    _subPrepare: {
        value: function () {
            this.transform.addEventListener("change", this, false);

            // The functionality for these buttons is not currently implemented
            // Until it is we will make them all disabled by default.
            this.topAlign.disabled = true;

            this.middleAlign.disabled = true;
            this.bottomAlign.disabled = true;

            this.leftAlign.disabled = true;
            this.centerAlign.disabled = true;
            this.rightAlign.disabled = true;

            this.distTop.disabled = true;
            this.distMiddle.disabled = true;
            this.distBottom.disabled = true;

            this.distLeft.disabled = true;
            this.distCenter.disabled = true;
            this.distRight.disabled = true;

            this.arrangeBringForward.disabled = true;
            this.arrangeSendBackward.disabled = true;
            this.arrangeBringToFront.disabled = true;
            this.arrangeSendToBack.disabled = true;
        }
    },

    handleChange: {
        value: function (event) {
            this._controls = this.transform.checked;
            NJevent("toolOptionsChange", { source: "SelectionProperties", inTransformMode: this.transform.checked });
        }
    }

});