/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    HotText = require("js/components/hottext.reel").HotText,
    HotTextUnit = require("js/components/hottextunit.reel").HotTextUnit,
    Slider = require("js/components/slider.reel").Slider,
    Button = require("montage/ui/button.reel").Button,
    Checkbox = require("js/components/ui/label-checkbox.reel").LabelCheckbox,
    Combobox = require("js/components/combobox.reel").Combobox,
    TextField = require("js/components/TextField.reel").TextField,
    ColorChip = require("js/components/ui/color-chip.reel").ColorChip,
    FileInput = require("js/components/ui/file-input.reel").FileInput,
    InputGroup = require("js/components/ui/input-group.reel").InputGroup,
    GradientPicker = require("js/components/gradientpicker.reel").GradientPicker;

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
                if(data) {
                    this._label = data.label;
                    this._controlType = data.controlType;
                } else {
                    this._label = "";
                    this._controlType = null;
                }
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
            if(event.wasSetByCode) {
                return;
            }
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
                case "GradientPicker":
                    this._control = GradientPicker.create();
                    this._control.addEventListener("change", this, false);
                    this._prop = "value";
                    break;
                default:
                    break;
            }
            this._control.element = this._controlField;
        }
    }

});
