/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

//Custom Rows
var SingleRow = require("js/panels/properties.reel/sections/custom-rows/single-row.reel").SingleRow;
var DualRow = require("js/panels/properties.reel/sections/custom-rows/dual-row.reel").DualRow;
var ColorSelect = require("js/panels/properties.reel/sections/custom-rows/color-select.reel").ColorSelect;

// Components Needed to make this work
var Hottext = require("js/components/hottextunit.reel").HotTextUnit;
var HT = require("js/components/hottext.reel").HotText;
var Dropdown = require("js/components/combobox.reel").Combobox;
var TextField = require("js/components/textfield.reel").TextField;
var LabelCheckbox = require("js/components/ui/label-checkbox.reel").LabelCheckbox;
var ColorChip = require("js/components/ui/color-chip.reel").ColorChip;
var Button = require("montage/ui/native/button.reel").Button;

exports.CustomSection = Montage.create(Component, {

    repeat: {
        value: null
    },

    _fields: {

    },

    fields: {
        get:  function() {
            return this._fields;
        },
        set: function(val) {
            this.controls = {};
            this.rows = [];
            this._fields = val;
            for(var i=0; i < this._fields.length; i++) {
                var tmpRow, fields;
                if(this._fields[i].length === 1) {
                    fields = this._fields[i][0];
                    tmpRow = SingleRow.create();
                    tmpRow.content = this.generateObject(fields);
                    if (fields.label)       tmpRow.label = fields.label;
                    if (fields.divider)     tmpRow.divider = fields.divider;
                    this.rows.push(tmpRow);
                } else if(this._fields[i].length === 2) {

                    var obj1 = this._fields[i][0];
                    var obj2 = this._fields[i][1];


                    if (obj1.type == "color" && obj2.type == "color") {
                        tmpRow = Montage.create(ColorSelect);
                        if(obj1.visible === false) tmpRow.colorVisible = obj1.visible;
                        if(obj2.visible === false) tmpRow.color2Visible = obj2.visible;

                        // TODO - Hack for now to reference the color select object to unregister color chips
                        this.controls["colorSelect"] = tmpRow;
                    }
                    else
                    {
                        tmpRow = DualRow.create();
                        if (obj1.label) tmpRow.label = obj1.label;
                        if (obj2.label) tmpRow.label2 = obj2.label;
                        tmpRow.content = this.generateObject(obj1);
                        tmpRow.content2 = this.generateObject(obj2);
                    }

                    if (obj1.divider === true || obj2.divider === true) tmpRow.divider = true;
                    this.rows.push(tmpRow);

                } else if(this._fields[i].length === 3) {

                }

            }
        }

    },

    rows: {
        value: []
    },

    controls: {
        value:{}
    },

    handleChanging: {
		value:function(event) {
            var obj = event.currentTarget;
            this._dispatchPropEvent({"type": "changing", "id": obj.id, "prop": obj.prop, "value": obj.value, "control": obj});
		}
	},

    handleChange: {
		value:function(event) {
            if(event._event.wasSetByCode) return;

            var obj = event.currentTarget;
            this._dispatchPropEvent({"type": "change", "id": obj.id, "prop": obj.prop, "value": obj.value, "control": obj});
		}
	},

    /**
     * Color change handler. Hard coding the stage for now since only the stage PI uses this color chip
     */
    handleColorChange: {
        value: function(event) {
            // Change the stage color for now
            //console.log(this, event);
            
            if (event._event.colorMode !== 'gradient' && event._event.color) {
	            ElementsMediator.setProperty([this.application.ninja.currentDocument.model.documentRoot], 'background-color', [event._event.color.css], "Change", "pi", '');
	            ElementsMediator.setProperty([this.application.ninja.currentDocument.model.documentRoot], 'background-image', ['none'], "Change", "pi", '');
            } else if (event._event.color) {
	            ElementsMediator.setProperty([this.application.ninja.currentDocument.model.documentRoot], 'background-image', [event._event.color.css], "Change", "pi", '');
	            ElementsMediator.setProperty([this.application.ninja.currentDocument.model.documentRoot], 'background-color', ['none'], "Change", "pi", '');
            } else {
	            ElementsMediator.setProperty([this.application.ninja.currentDocument.model.documentRoot], 'background-image', ['none'], "Change", "pi", '');
	            ElementsMediator.setProperty([this.application.ninja.currentDocument.model.documentRoot], 'background-color', ['none'], "Change", "pi", '');
            }
            
            /*
if (event._event.color && event._event.color.css) {
            	ElementsMediator.setProperty([this.application.ninja.currentDocument.model.documentRoot], this.id, [event._event.color.css], "Change", "pi", '');
            } else {
	            ElementsMediator.setProperty([this.application.ninja.currentDocument.model.documentRoot], this.id, ['none'], "Change", "pi", '');
            }
*/
            /*
            var propEvent = document.createEvent("CustomEvent");
            propEvent.initEvent("propertyChange", true, true);
            propEvent.type = "propertyChange";

            propEvent.prop = "background";//event.prop;
            propEvent.value = event._event.color.css;

            this.dispatchEvent(propEvent);
            */
        }
    },

    handleAction: {
        value:function(event) {
            if(event._event.wasSetByCode) return;

            var obj = event.currentTarget;
            this._dispatchPropEvent({"type": "change", "id": obj.id, "prop": obj.prop, "value": obj.value, "control": obj});
        }
    },

    _dispatchPropEvent: {
        value: function(event) {
//            console.log(event);
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

            propEvent.id = event.id;
            propEvent.prop = event.prop;
            propEvent.text = event.text;
            propEvent.value = event.value;

            event.control.units ? propEvent.units = event.control.units : propEvent.units = "";

            this.dispatchEvent(propEvent);
        }
    },

    generateObject: {
        value: function(fields) {
            switch(fields.type) {
                case "hottext"  : return this.createHottext(fields);
                case "ht"  : return this.createHT(fields);
                case "dropdown" : return this.createDropdown(fields);
                case "textbox"  : return this.createTextField(fields);
                case "file"     : return this.createFileInput(fields);
                case "checkbox" : return this.createCheckbox(fields);
                case "chip"     : return this.createColorChip(fields);
                case "button"     : return this.createButton(fields);
            }
        }
    },

    createHT: {
        value: function(aField) {

            // Generate Hottext
            var obj = HT.create();

            // Set Values for HottextRow
            if (aField.id)          obj.id = aField.id;
            if (aField.value)       obj.value = aField.value;
            if (aField.min)         obj._minValue = aField.min;
            if (aField.max)         obj._maxValue = aField.max;
            if (aField.prop)        obj.prop = aField.prop;

            //Initiate onChange Events
            obj.addEventListener("change", this, false);
            obj.addEventListener("changing", this, false);

            //Bind object value to controls list so it can be manipulated
            Object.defineBinding(this.controls, aField.id, {
              boundObject: obj,
              boundObjectPropertyPath: "value"
            });

            return obj;
        }
    },

    //Breaking Up Switch Case Statement to functions to return a row
    createHottext: {
        value: function(aField) {

            // Generate Hottext
            var obj = Hottext.create();

            // Set Values for HottextRow
            if (aField.id)          obj.id = aField.id;
            if (aField.value)       obj.value = aField.value;
            if (aField.acceptableUnits)   obj.acceptableUnits = aField.acceptableUnits;
            if (aField.unit)        obj.units = aField.unit;
            if (aField.min)         obj._minValue = aField.min;
            if (aField.max)         obj._maxValue = aField.max;
            if (aField.prop)        obj.prop = aField.prop;

            //Initiate onChange Events
            obj.addEventListener("change", this, false);
            obj.addEventListener("changing", this, false);

            //Bind object value to controls list so it can be manipulated
            Object.defineBinding(this.controls, aField.id, {
              boundObject: obj,
              boundObjectPropertyPath: "value"
            });

            //Bind object value to controls list so it can be manipulated
            Object.defineBinding(this.controls, aField.id + "Units", {
              boundObject: obj,
              boundObjectPropertyPath: "units"
            });

            return obj;
        }
    },

    createDropdown: {
        value: function(aField) {

            //Generate Dropdown
            var obj = Dropdown.create();

            // Set Values for Dropdown
            if (aField.id)          obj.id = aField.id;
            if (aField.prop)        obj.prop = aField.prop;
            if (aField.value)       obj.value = aField.value;
            if (aField.labelField)  obj.labelField = aField.labelField;
            if (aField.labelFunction)  obj.labelFunction = aField.labelFunction;
            if (aField.dataField)  obj.dataField = aField.dataField;
            if (aField.dataFunction)  obj.dataFunction = aField.dataFunction;
            if (aField.items) {
                if(aField.items.boundObject) {
                    obj.items = eval(aField.items.boundObject)[aField.items.boundProperty];
                } else {
                    obj.items = aField.items;
                }
            }
            if (aField.enabled) {
                if(aField.enabled.boundObject) {
                    // TODO - For now, always bind to this.controls[someProperty]
                    Object.defineBinding(obj, "enabled", {
                        boundObject: this.controls,
                        boundObjectPropertyPath: aField.enabled.boundProperty,
                        oneway: false
                    });
                } else {
                    obj.enabled = aField.enabled;
                }
            }

            obj.addEventListener("change", this, false);
//
//            Object.defineBinding(obj, "value", {
//                boundObject: this.controls,
//                boundObjectPropertyPath: aField.id,
//                oneway: false,
//                boundValueMutator: function(value) {
//                    console.log("In the binding ", value);
//                    return value;
//                }
//            });

            Object.defineBinding(this.controls, aField.id, {
                boundObject: obj,
                boundObjectPropertyPath: "value",
                oneway: false
            });


            obj.needsDraw = true;

            return obj;
        }
    },

    createTextField: {
        value: function(aField) {

            // Generate Textfield
            var obj = TextField.create();

            // Set Values for TextField
            if (aField.id)          obj.id = aField.id;
            if (aField.value)       obj.value = aField.value;
            if (aField.prop)        obj.prop = aField.prop;

            //Initiate onChange Events
            obj.addEventListener("change", this, false);

            //Bind object value to controls list so it can be manipulated
            Object.defineBinding(this.controls, aField.id, {
                boundObject: obj,
                boundObjectPropertyPath: "value",
                oneway: false
            });

            return obj;
        }
    },

    createFileInput: {
        value: function(aField) {

            // Generate Textfield
            var obj = TextField.create();

            // Set Values for TextField
            if (aField.id)          obj.id = aField.id;
            if (aField.value)       obj.value = aField.value;
            if (aField.prop)        obj.prop = aField.prop;


            //Initiate onChange Events
            obj.addEventListener("change", this, false);

            //Bind object value to controls list so it can be manipulated
            Object.defineBinding(this.controls, aField.id, {
              boundObject: obj,
              boundObjectPropertyPath: "value"
            });

            return obj;
        }
    },

    createCheckbox: {
        value: function(aField) {

            // Generate Textfield
            var obj = LabelCheckbox.create();

            // Set Values for TextField
            if (aField.id)          obj.id = aField.id;
            if (aField.checked)     obj.checked = aField.checked;
            if (aField.value)       obj.label = aField.value;
            if (aField.prop)        obj.prop = aField.prop;

            if (aField.enabled) {
                if(aField.enabled.boundObject) {
                    // TODO - For now, always bind to this.controls[someProperty]
                    Object.defineBinding(obj, "enabled", {
                                    boundObject: this.controls,
                                    boundObjectPropertyPath: aField.enabled.boundProperty,
                                    oneway: false
                                });
                } else {
                    obj.enabled = aField.enabled;
                }
            }

            //Initiate onChange Events
            obj.addEventListener("change", this, false);

            //Bind object value to controls list so it can be manipulated
            Object.defineBinding(this.controls, aField.id, {
              boundObject: obj,
              boundObjectPropertyPath: "checked"
            });

            return obj;
        }
    },

    createColorChip: {
        value: function(aField) {
            var obj = ColorChip.create();

            obj.chip = true;
            obj.iconType = "fillIcon";
            obj.mode = "chip";
            obj.offset = 0;

            if (aField.id)          obj.id = aField.id;
            if (aField.prop)        obj.prop = aField.prop;

            obj.changeDelegate = this.handleColorChange;

            this.controls[aField.id] = obj;

            // TODO - Hack for now to reference the color select object to unregister color chips
            this.controls["background-color"] = obj;

            return obj;
        }
    },

    createButton: {
        value: function(aField) {
            var obj = Button.create();

            // Set Values for Button
            if (aField.id)                  obj.id = aField.id;
            if (aField.label)               obj.label = aField.label;
            if (aField.prop)                obj.prop = aField.prop;

            // Special casing button so slot uses "button" tag instead of "div"
            obj.type = "button";

            if (aField.enabled) {
                if(aField.enabled.boundObject) {
                    // TODO - For now, always bind to this.controls[someProperty]
                    Object.defineBinding(obj, "enabled", {
                                    boundObject: this.controls,
                                    boundObjectPropertyPath: aField.enabled.boundProperty,
                                    oneway: true
                                });
                } else {
                    obj.enabled = aField.enabled;
                }
            }

            obj.addEventListener("action", this, false);

            this.controls[aField.id] = obj;

            return obj;
        }
    }

});
