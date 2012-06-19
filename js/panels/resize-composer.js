/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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