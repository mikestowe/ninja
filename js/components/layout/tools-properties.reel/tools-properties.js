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

exports.ToolsProperties = Montage.create(Component, {

    selectionProperties: {
        value: null,
        serializable: true
    },

    object3DProperties: {
        value: null,
        serializable: true
    },
    tagProperties: {
        value: null,
        serializable: true
    },

    penProperties: {
        value: null,
        serializable: true
    },

    textProperties: {
        value: null,
        serializable: true
    },

    shapeProperties: {
        value: null,
        serializable: true
    },

    brushProperties: {
        value: null,
        serializable: true
    },

    fillProperties: {
        value: null,
        serializable: true
    },

    inkbottleProperties: {
        value: null,
        serializable: true
    },

    eraserProperties: {
        value: null,
        serializable: true
    },

    rotateStageProperties: {
        value: null,
        serializable: true
    },

    panProperties: {
        value: null,
        serializable: true
    },

    zoomProperties: {
        value: null,
        serializable: true
    },

    rotate3DProperties: {
        value: null,
        serializable: true
    },

    translate3DProperties: {
        value: null,
        serializable: true
    },

    toolsData: {
        value: null,
        serializable: true
    },

    _currentDocument: {
        enumerable: false,
        value: null
    },

    currentDocument: {
        enumerable: false,
        get: function() {
            return this._currentDocument;
        },
        set: function(value) {
            if (value === this._currentDocument) {
                return;
            }

            this._currentDocument = value;

            this.disabled = !this._currentDocument;

        },
        serializable: true
    },

    _disabled: {
        value: true
    },

    disabled: {
        get: function() {
            return this._disabled;
        },
        set: function(value) {
            if(value !== this._disabled) {
                this._disabled = value;
            }
        }
    },

    _currentSelectedTool : {
      value: null
    },

    currentSelectedTool : {
        get: function() { return this._currentSelectedTool;},
        set: function(value) {

            if(this._currentSelectedTool) {
                this[this._currentSelectedTool.properties].visible = false;
            }

            if(value) {
                this._currentSelectedTool = value;
                this[this._currentSelectedTool.properties].visible = true;

            }

            /*
            if(this._selectedTool) this[this._selectedTool.properties].visible = false;

            this._selectedTool = value;
            this[this._selectedTool.properties].visible = true;
            */
            

        }
    }

});
