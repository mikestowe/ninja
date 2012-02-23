/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

var FileInput = exports.FileInput = Montage.create(Component, {

    _filePath: {
        enumerable: false,
        value: ""
    },

    filePath: {
        enumerable: true,
        serializable: true,
        get: function () {
            return this._filePath;
        },
        set: function (value) {
            if (value !== this._filePath) {
                this._filePath = value;
                this.needsDraw = true;
            }
        }
    },

    draw: {
        value: function() {
            this.filePathField.value = this._filePath;
        }
    },

    handleChange:
    {
        value:function(event)
		{
            if(event.currentTarget.id === "fileInputControl")
            {
                this.filePath = this.inputField.value;
            }
            else
            {
                this.filePath = this.filePathField.value;
            }

            var e = document.createEvent("CustomEvent");
            e.initEvent("change", true, true);
            e.type = "change";
            e.filePath = this.filePath;
            this.dispatchEvent(e);
		}
    },

    prepareForDraw: {
        value: function() {
            this.inputField.addEventListener("change", this, false);
            this.filePathField.addEventListener("change", this, false);
        }
    }

});
