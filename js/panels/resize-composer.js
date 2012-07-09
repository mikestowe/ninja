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
var Composer = require("montage/ui/composer/composer").Composer;

exports.ResizeComposer = Montage.create(Composer, {

    xAxis: {
        value: true,
        serializable: true
    },

    yAxis: {
        value: true,
        serializable: true
    },

    enabled : {
        enumerable: false,
        value: true
    },

    inversed : {
        enumarable: false,
        value: false
    },

    _startX: {
        enumerable: false,
        value: 0
    },

    _startY: {
        enumerable: false,
        value: 0
    },

    _deltaX: {
        enumerable: false,
        value: 0
    },

    _deltaY: {
        enumerable: false,
        value: 0
    },

    _startTimestamp: {
        enumerable: false,
        value: 0
    },

    _reset: {
        enumerable: false,
        value: function() {
            this._startX = 0;
            this._startY = 0;
            this._deltaX = 0;
            this._deltaY = 0;
        }
    },

    _executeEvent: {
        value: function(eventName) {
            resizeEvent = document.createEvent("CustomEvent");
            resizeEvent.initCustomEvent(eventName, true, false, null);
            resizeEvent.startX = this._startX;
            resizeEvent.startY = this._startY;
            resizeEvent.dX = this._deltaX;
            resizeEvent.dY = this._deltaY;
            this.dispatchEvent(resizeEvent);
        }
    },

    load: {
        value: function() {
            this.element.addEventListener("mousedown", this, true);
            this.element.addEventListener("dblclick", this, true);
        }
    },

    unload: {
        value: function() {
            this.element.removeEventListener("mousedown", this, true);
        }
    },

    captureMousedown: {
        value: function(e) {
            e.preventDefault();
            if (this.enabled) {
                this._reset();
                this._startX = e.clientX;
                this._startY = e.clientY;
                this._startTimestamp = e.timeStamp;
                window.addEventListener("mousemove", this, true);
                window.addEventListener("mouseup", this, true);
                this._executeEvent("resizeStart");
            }
        }
    },

    captureMouseup: {
        value: function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
            window.removeEventListener("mousemove", this, true);
            window.removeEventListener("mouseup", this, true);
            this._executeEvent("resizeEnd");
        }
    },

    captureMousemove: {
        value: function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
            if (this.xAxis) {
                this._deltaX = e.clientX - this._startX;
            }
            else {
                this._deltaX = 0;
            }
            if (this.yAxis) {
                this._deltaY = e.clientY - this._startY;
            }
            else {
                this._deltaY = 0;
            }
            this._executeEvent("resizeMove");
        }
    },

    captureDblclick: {
        value:function(e) {
            this._reset();
            this._executeEvent("resizeReset");
        }
    }



});
