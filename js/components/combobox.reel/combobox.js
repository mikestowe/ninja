/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.Combobox = Montage.create(Component, {

    _valueSyncedWithInputField: {
        enumerable: false,
        value: false
    },

    _wasSetByCode: {
        enumerable: false,
        value: true
    },

    labelField: {
        value: null
    },

    labelFunction: {
        value: null
    },

    dataField: {
        value: null
    },

    dataFunction: {
        value: null
    },

    _items: {
        value: []
    },

    items: {
        enumerable: true,
        serializable: true,
        get: function() {
            return this._items;
        },
        set: function(value) {
            if (value !== this._items)
            {
                this._items = value;
                this._valueSyncedWithInputField = false;
                this.needsDraw = true;
            }
        }
    },
    
    _value: {
        enumerable: false,
        value: null
    },

    value: {
        enumerable: true,
        serializable: true,
        get: function() {
            return this._value;
        },
        set: function(value) {
            if (value !== this._value)
            {
                this._value = value;
                this.needsDraw = true;

                var e = document.createEvent("CustomEvent");
                e.initEvent("change", true, true);
                e.type = "change";
                e.wasSetByCode = this._wasSetByCode;
                e.value = this._value;
                this.dispatchEvent(e);

                this._wasSetByCode = false;
            }
        }
    },

    _enabled: {
        enumerable: false,
        value: true
    },

    enabled: {
        enumerable: true,
        serializable: true,
        get: function() {
            return this._enabled;
        },
        set: function(value) {
            if(value !== this._enabled)
            {
                this._enabled = value;
                this.needsDraw = true;
            }
        }
    },

    handleChange:
    {
        value:function(event)
		{
            this._valueSyncedWithInputField = true;
            this._wasSetByCode = false;
            this.value = this.element.value;
            this.needsDraw = true;
		}
    },

    willDraw: {
        value: function() {
            if(!this._valueSyncedWithInputField)
            {
                this.element.innerHTML = "";
                
                var optionItem = document.createElement("option");
                var items = this._items;
                var len = items.length;

                var i;
                for (i = 0; i < len; i++)
                {
                    var current = items[i];
                    optionItem = document.createElement("option");
                    if(this.dataFunction)
                    {
                        optionItem.value = this.dataFunction(current);
                    }
                    else if(this.dataField)
                    {
                        optionItem.value = current[this.dataField];
                    }
                    else
                    {
                        optionItem.value = current;
                    }

                    if(this.labelFunction)
                    {
                        optionItem.innerText = this.labelFunction(current);
                    }
                    else if(this.labelField)
                    {
                        optionItem.innerText = current[this.labelField];
                    }
                    else
                    {
                        optionItem.innerText = current;
                    }
                    this.element.appendChild(optionItem);
                }
                this.element.disabled = !this._enabled;
            }
        }
    },

    draw: {
        value: function() {
            if(!this._valueSyncedWithInputField)
            {
                this.element.value = this._value;
            }
            this._valueSyncedWithInputField = false;
        }
    },

    prepareForDraw: {
        value: function() {
            this.element.addEventListener("change", this, false);
        }
    }

});