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

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.SelectionProperties = Montage.create(ToolProperties, {

    transform: {
        value: null,
        serializable: true
    },

    topAlign: {
        value: null,
        serializable: true
    },

    middleAlign: {
        value: null,
        serializable: true
    },

    bottomAlign: {
        value: null,
        serializable: true
    },

    leftAlign: {
        value: null,
        serializable: true
    },

    centerAlign: {
        value: null,
        serializable: true
    },

    rightAlign: {
        value: null,
        serializable: true
    },

    distTop: {
        value: null,
        serializable: true
    },

    distMiddle: {
        value: null,
        serializable: true
    },

    distBottom: {
        value: null,
        serializable: true
    },

    distLeft: {
        value: null,
        serializable: true
    },

    distCenter: {
        value: null,
        serializable: true
    },

    distRight: {
        value: null,
        serializable: true
    },

    arrangeBringForward: {
        value: null,
        serializable: true
    },

    arrangeSendBackward: {
        value: null,
        serializable: true
    },

    arrangeBringToFront: {
        value: null,
        serializable: true
    },

    arrangeSendToBack: {
        value: null,
        serializable: true
    },

    _controls: { value: false },

    _subPrepare: {
        value: function () {
            this.transform.addEventListener("change", this, false);

            // The functionality for these buttons is not currently implemented
            // Until it is we will make them all disabled by default.
            this.topAlign.disabled = true;

            this.middleAlign.disabled = true;
            this.bottomAlign.disabled = true;

            this.leftAlign.disabled = true;
            this.centerAlign.disabled = true;
            this.rightAlign.disabled = true;

            this.distTop.disabled = true;
            this.distMiddle.disabled = true;
            this.distBottom.disabled = true;

            this.distLeft.disabled = true;
            this.distCenter.disabled = true;
            this.distRight.disabled = true;

            this.arrangeBringForward.disabled = true;
            this.arrangeSendBackward.disabled = true;
            this.arrangeBringToFront.disabled = true;
            this.arrangeSendToBack.disabled = true;
        }
    },

    handleChange: {
        value: function (event) {
            this._controls = this.transform.checked;
            NJevent("toolOptionsChange", { source: "SelectionProperties", inTransformMode: this.transform.checked });
        }
    }

});
