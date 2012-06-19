/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.Object3DProperties = Montage.create(ToolProperties, {
    rotateLocally: {
        value: null,
        serializable: true
    },

    rotateGlobally: {
        value: null,
        serializable: true
    },

    _subPrepare: {
        value: function () {
            this.rotateLocally.addEventListener("click", this, false);
            this.rotateGlobally.addEventListener("click", this, false);
        }
    },

    handleClick: {
        value: function (event) {
            if (event._event.target === this.rotateLocally) {
                this.selectedMode = "rotateLocally";
            } else {
                this.selectedMode = "rotateGlobally";
            }

            NJevent("toolOptionsChange", { source: "Object3DProperties", mode: (this.selectedMode === "rotateLocally") });
        }
    },

    _selectedMode: {
        value: "rotateLocally", enumerable: false
    },

    selectedMode: {
        get: function () { return this._selectedMode; },
        set: function (value) { this._selectedMode = value; }
    }


});