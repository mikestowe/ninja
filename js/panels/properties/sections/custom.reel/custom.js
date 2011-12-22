/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

//Custom Rows
var SingleRow = require("js/panels/properties/sections/custom-rows/single-row.reel").SingleRow;
var DualRow = require("js/panels/properties/sections/custom-rows/dual-row.reel").DualRow;
var ColorSelect = require("js/panels/properties/sections/custom-rows/color-select.reel").ColorSelect;

// Components Needed to make this work
var Hottext = require("js/components/hottextunit.reel").HotTextUnit;
var Dropdown = require("js/components/combobox.reel").Combobox;
var TextField = require("js/components/textfield.reel").TextField;
var FileInput = require("js/components/ui/file-input.reel").FileInput;
var Checkbox = require("js/components/checkbox.reel").Checkbox;


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

    handleChanging:
	{
		value:function(event)
		{
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
                case "dropdown" : return this.createDropdown(fields);
                case "textbox"  : return this.createTextField(fields);
                case "file"     : return this.createFileInput(fields);
                case "checkbox" : return this.createCheckbox(fields);
            }
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
            if (aField.items) {
                if(aField.items.boundObject) {
                    obj.items = eval(aField.items.boundObject)[aField.items.boundProperty];
                } else {
                    obj.items = aField.items;
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
              boundObjectPropertyPath: "value"
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
            var obj = Checkbox.create();

            // Set Values for TextField
            if (aField.id)          obj.id = aField.id;
            if (aField.checked)     obj.checked = aField.checked;
            if (aField.value)       obj.label = aField.value;
            if (aField.prop)        obj.prop = aField.prop;

            //Initiate onChange Events
            obj.addEventListener("change", this, false);

            //Bind object value to controls list so it can be manipulated
            Object.defineBinding(this.controls, aField.id, {
              boundObject: obj,
              boundObjectPropertyPath: "checked"
            });

            return obj;
        }
    }

});