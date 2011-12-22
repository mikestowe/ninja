/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.RadioGroup = Montage.create(Component, {
    radios: {
        value: []
    },

    _selectedItem: {
        value: null
    },

    selectedIndex: {
        value: null
    },

    selectedItem: {
        enumerable: true,
        serializable: true,
        get: function() {
            return this._value;
        },
        set: function(value) {
            var e,
                i = 0,
                len = this.radios.length;

            for(i=0; i < len; i++)
            {
                if(this.radios[i] === value)
                {
                    this.selectedIndex = i;
                    this._selectedItem = value;

                    e = document.createEvent("CustomEvent");
                    e.initEvent("change", true, true);
                    e.type = "change";
                    e._wasSetByCode = this._wasSetByCode;
                    e.selectedIndex = i;
                    e.selectedItem = value;
                    this.dispatchEvent(e);

                    this._wasSetByCode = false;

                    return;
                }
            }
        }
    },

    name: {
        value: "RadioGroup0"
    },

    addRadio:
    {
        value:function(radio)
        {
            radio.element.setAttribute("name", this.name);
            radio.addEventListener("change", this, false);
            this.radios.push(radio);
        }
    },

    _wasSetByCode: {
        enumerable: false,
        value: true
    },

    handleChange:
    {
        value:function(event)
        {
            this._wasSetByCode = event._event._wasSetByCode;
            this.selectedItem = event._event.value;
        }
    }

});

exports.Radio = Montage.create(Component, {

    _valueSyncedWithInputField: {
        enumerable: false,
        value: false
    },

    _wasSetByCode: {
        enumerable: false,
        value: true
    },

    prependLabel: {
        value: false
    },

    label: {
        value: null
    },

    _checked: {
        enumerable: false,
        value: false
    },

    group: {
        value: null
    },

    checked: {
        enumerable: true,
        serializable: true,
        get: function() {
            return this._checked;
        },
        set: function(value) {
            this._checked = true;
            this.needsDraw = true;

            var e = document.createEvent("CustomEvent");
            e.initEvent("change", true, true);
            e.type = "change";
            e._wasSetByCode = this._wasSetByCode;
            e.value = this;
            this.dispatchEvent(e);

            this._wasSetByCode = false;
        }
    },

    handleChange:
    {
        value:function(event)
		{
            this._valueSyncedWithInputField = true;
            this._wasSetByCode = false;
            this.checked = this.element.checked;
		}
    },
    handleClick: {
        value: function() {
            this._wasSetByCode = false;
            this.checked = !this.element.checked;
        }
    },
    
    draw: {
        value: function() {
            if(!this._valueSyncedWithInputField)
            {
                this.element.checked = this._checked;
            }
            this._valueSyncedWithInputField = false;
        }
    },

    prepareForDraw: {
        value: function() {
            if (this.label !== null) {
                var b = document.createElement("label");
                b.innerHTML = this.label;
                this.element.appendChild(b);
                b.addEventListener("click", this, false);
            }
            if (this.group !== null) {
                this.group.addRadio(this);
            }
            this.element.addEventListener("change", this, false);
        }
    }

});