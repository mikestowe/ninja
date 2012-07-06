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
var defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;


exports.ToolButton = Montage.create(Component, {

    data:       { value: null },

    _selected:  { value: null },

    selected: {
        get: function() { return this._selected; },
        set: function(value) {
            this._selected = value;
            this.needsDraw = true;
        }
    },

    _subselected: { value: 1 },

    subselected: {
        get: function() { return this._subselected; },
        set: function(value) {

            var len = value.length;
            for(var i=0; i < len; i++) {
                if(value[i]) {
                    this._subselected = i;
                    this.needsDraw = true;
                }
            }
        }
    },

    _currentSubSelected: { value: 0},

    prepareForDraw: {
        enumerable: false,
        value: function() {
            this.element.title = this.data.toolTip;
            this.element.addEventListener("mousedown", this, false);
            this.element.addEventListener("dblclick", this, false);

            if(this.data.container) {
                this.element.title = this.data.subtools[this._subselected].toolTip;
            }

            this.element.classList.add(this.data.id)
        }
    },

    draw: {
        enumerable: false,
        value: function() {
            if(this.data.container) {
                this.element.title = this.data.subtools[this._subselected].toolTip;
                this.element.classList.remove(this.data.subtools[this._currentSubSelected].id);
                this.element.classList.add(this.data.subtools[this._subselected].id);
                this._currentSubSelected = this._subselected;
            }

            if(this._selected) {
                this.element.classList.add("active");
            } else {
                this.element.classList.remove("active");
            }
        }
    },

    handleMousedown: {
        value: function(event) {
            if(!this._selected) {
                NJevent("selectTool", this.data);
            }
        }
    },

    handleDblclick: {
        value: function(event) {
            NJevent("toolDoubleClick", this.data);
        }
    }


});
