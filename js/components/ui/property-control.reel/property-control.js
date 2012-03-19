/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    HotText = require("js/components/hottext.reel").HotText,
    HotTextUnit = require("js/components/hottextunit.reel").HotTextUnit,
    Slider = require("js/components/slider.reel").Slider,
    Button = require("montage/ui/button.reel").Button,
    Checkbox = require("js/components/checkbox.reel").Checkbox,
    Combobox = require("js/components/combobox.reel").Combobox,
    TextField = require("js/components/TextField.reel").TextField,
    ColorChip = require("js/components/ui/color-chip.reel").ColorChip,
    FileInput = require("js/components/ui/file-input.reel").FileInput,
    InputGroup = require("js/components/ui/input-group.reel").InputGroup;

var PropertyControl = exports.PropertyControl = Montage.create(Component, {

    _labelField: {
        enumerable: true,
        serializable: true,
        value: null
    },

    labelField: {
        enumerable: true,
        serializable: true,
        get: function () {
            return this._labelField;
        },
        set: function (value) {
            if (value !== this._labelField) {
                this._labelField = value;
                this.needsDraw = true;
            }
        }
    },

    _control: {
        enumerable: true,
        value: null
    },

    // set this to the getter of each control type's "value" accessor,
    // which could be value, selected, color, checked, etc.
    _prop: {
        enumerable: true,
        value: ""
    },

    _controlField: {
        enumerable: true,
        value: null
    },

    controlField: {
        enumerable: true,
        serializable: true,
        get: function () {
            return this._controlField;
        },
        set: function (value) {
            if (value !== this._controlField) {
                this._controlField = value;
            }
        }
    },

    _label: {
        enumerable: false,
        value: "Label:"
    },

    label: {
        enumerable: true,
        serializable: true,
        get: function () {
            return this._label;
        },
        set: function (value) {
            if (value !== this._label) {
                this._label = value + ":";
                this.needsDraw = true;
            }
        }
    },

    _controlType: {
        enumerable: false,
        value: null
    },

    controlType: {
        enumerable: true,
        serializable: true,
        get: function () {
            return this._controlType;
        },
        set: function (value) {
            if (value !== this._controlType) {
                this._controlType = value;
            }
        }
    },

    _data: {
        enumerable: false,
        value: null
    },

    data: {
        enumerable: true,
        serializable: true,
        get: function () {
            return this._data;
        },
        set: function (data) {
            if (data !== this._data) {
                this._data = data;
                this.label = data.label;
                this.controlType = data.controlType;
                this.needsDraw = true;
            }
        }
    },

    didDraw :{
        value: function() {
            var defaults = this._data.defaults;
            for(var n in defaults)
            {
                this._control[n] = defaults[n];
            }
            this._labelField.innerHTML = this._label;
            this._control.needsDraw = true;
        }
    },

    handleEvent:
	{
		value:function(event)
		{
            this._dispatchPropEvent(event);
		}
	},

    _dispatchPropEvent: {
        value: function(event) {
            var propEvent = document.createEvent("CustomEvent");
            if(event.type === "changing")
            {
                propEvent.initEvent("propertyChanging", true, true);
                propEvent.type = "propertyChanging";
            }
            else
            {
                propEvent.initEvent("propertyChange", true, true);
                propEvent.type = "propertyChange";
            }
            propEvent.propertyLabel = this.label;
            propEvent.propertyValue = event.currentTarget[this._prop];
            propEvent.propertyEvent = event;
            
            this.dispatchEvent(propEvent);
        }
    },

    prepareForDraw: {
        value: function() {
            switch(this._controlType)
            {
                case "HotText":
                    this._control = HotText.create();
                    this._control.addEventListener("change", this, false);
                    this._control.addEventListener("changing", this, false);
                    this._prop = "value";
                    break;
                case "HotTextUnit":
                    this._control = HotTextUnit.create();
                    this._control.addEventListener("change", this, false);
                    this._control.addEventListener("changing", this, false);
                    this._prop = "value";
                    break;
                case "Slider":
                    this._control = Slider.create();
                    this._control.addEventListener("change", this, false);
                    this._control.addEventListener("changing", this, false);
                    this._prop = "value";
                    break;
                case "Button":
                    this._control = Button.create();
                    this._control.addEventListener("action", this, false);
                    this._prop = "value";
                    break;
                case "ColorChip":
                    this._control = ColorChip.create();
                    this._control.chip = true;
                    this._control.hasIcon = false;
                    this._control.mode = "chip";
                    this._control.addEventListener("change", this, false);
                    this._prop = "color";
                    break;
                case "TextField":
                    this._control = TextField.create();
                    this._control.addEventListener("change", this, false);
                    this._prop = "text";
                    break;
                case "Checkbox":
                    this._control = Checkbox.create();
                    this._control.addEventListener("change", this, false);
                    this._prop = "checked";
                    break;
                case "Combobox":
                    this._control = Combobox.create();
                    this._control.addEventListener("change", this, false);
                    this._prop = "value";
                    break;
                case "FileInput":
                    this._control = FileInput.create();
                    this._control.addEventListener("change", this, false);
                    this._prop = "filePath";
                    break;
                case "InputGroup":
                    this._control = InputGroup.create();
                    this._control.addEventListener("change", this, false);
                    this._control.addEventListener("changing", this, false);
                    this._prop = "value";
                    break;
                default:
                    break;
            }
            this._control.element = this._controlField;
        }
    }

});
