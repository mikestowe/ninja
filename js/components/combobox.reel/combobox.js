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

exports.Combobox = Montage.create(Component, {

    _valueSyncedWithInputField: {
        enumerable: false,
        value: false
    },

    _wasSetByCode: {
        enumerable: true,
        value: true
    },

    labelField: {
        value: null,
        serializable: true
    },

    labelFunction: {
        value: null
    },

    dataField: {
        value: null,
        serializable: true
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

                this._wasSetByCode = true;
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

    _visible: {
        enumerable: false,
        value: true
    },

    visible: {
        enumerable: true,
        serializable: true,
        get: function() {
            return this._visible;
        },
        set: function(value) {
            if(value !== this._visible)
            {
                this._visible = value;
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
                if(this._visible)
                {
                    this.element.style.visibility = "visible";
                }
                else
                {
                    this.element.style.visibility = "hidden";
                }
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
            if( (this._value === null) && this._items.length )
            {
                var current = this._items[0];
                if(this.dataFunction)
                {
                    this.value = this.dataFunction(current);
                }
                else if(this.dataField)
                {
                    this.value = current[this.dataField];
                }
                else
                {
                    this.value = current;
                }
            }
            this.element.addEventListener("change", this, false);
        }
    }

});
