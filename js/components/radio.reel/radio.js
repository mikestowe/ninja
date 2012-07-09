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

exports.RadioGroup = Montage.create(Component, {
    radios: {
        value: []
    },

    _selectedItem: {
        value: null,
        serializable: true
    },

    selectedIndex: {
        value: null,
        serializable: true
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
                    e.wasSetByCode = this._wasSetByCode;
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
        value: "RadioGroup0",
        serializable: true
    },

    addRadio:
    {
        value:function(radio)
        {
            radio.radioField.setAttribute("name", this.name);
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
            this._wasSetByCode = event._event.wasSetByCode;
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
        value: null,
        serializable: true
    },

    labelField: {
        value: null,
        serializable: true
    },

    radioField: {
        value: null,
        serializable: true
    },

    _checked: {
        enumerable: false,
        value: false
    },

    group: {
        value: null,
        serializable: true
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
            e.wasSetByCode = this._wasSetByCode;
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
            this.checked = this.radioField.checked;
        }
    },
    handleClick: {
        value: function() {
            this._wasSetByCode = false;
            this.checked = !this.radioField.checked;
        }
    },

    draw: {
        value: function() {
            if(!this._valueSyncedWithInputField)
            {
                this.radioField.checked = this._checked;
            }
            this._valueSyncedWithInputField = false;
        }
    },

    prepareForDraw: {
        value: function() {
            if (this.label !== null) {
                this.labelField.innerHTML = this.label;
            }
            this.element.addEventListener("click", this, false);
            if (this.group !== null) {
                this.group.addRadio(this);
            }
            this.radioField.addEventListener("change", this, false);
        }
    }

});
