/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.FocusManager = Montage.create(Component, {

    hasTemplate: {
        value: false
    },

    element: {
        serializable: true,
        enumerable: true,
        get: function() {
            return this._element;
        },
        set: function(value) {
            // call super set
            Object.getPropertyDescriptor(Component, "element").set.call(this, value);
        }
    },

    hiddenInput: {
        value: null
    },

    prepareForDraw: {
        value: function() {
            this.hiddenInput = document.createElement("input");
            this.hiddenInput.type = "text";

            this.element.appendChild(this.hiddenInput);

        }
    },

    setFocus: {
        value: function() {
            this.hiddenInput.focus();
        }
    }

});

