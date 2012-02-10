/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
Component = require("montage/ui/component").Component;

var Button = exports.Button = Montage.create(Component, {
    // Button state
    _focused: {
        value: false
    },

    _pressed: {
        value: false
    },

    _isToggleButton: {
        value: false
    },

    isToggleButton: {
        serializable: true,
        enumerable: true,
        get: function() {
            return this._isToggleButton;
        },
        set: function(value) {
            if (value !== this._isToggleButton) {
                this._isToggleButton = value;
                this.needsDraw = true;
            }
        }
    },

    _value: {
        value: false
    },

    value: {
        serializable: true,
        enumerable: true,
        get: function() {
            return this._value;
        },
        set: function(value) {
            if ( (value !== null) && (value !== this._value) ) {
                this._value = value;
                this.needsDraw = true;
            }
        }
    },

    _label: {
        value: ""
    },

    label: {
        serializable: true,
        enumerable: true,
        get: function() {
            return this._label;
        },
        set: function(value) {
            if (value !== this._label) {
                this._label = value;
                this.needsDraw = true;
            }
        }
    },

    // TODO - Allow user to specify up, over and down states
    _onState: {
        value: "on"
    },

    onState: {
        serializable: true,
        enumerable: true,
        get: function() {
            return this._onState;
        },
        set: function(value) {
            if (value !== this._onState) {
                this._onState = value;
                this.needsDraw = true;
            }
        }
    },

    _offState: {
        value: "off"
    },

    offState: {
        serializable: true,
        enumerable: true,
        get: function() {
            return this._offState;
        },
        set: function(value) {
            if (value !== this._offState) {
                this._offState = value;
                this.needsDraw = true;
            }
        }
    },

    // Low-level event listeners
    handleTouchstart: {
        value: function(event) {
            // TODO preventingDefault disables the magnifying class
            // sadly it also disables double tapping on the button to zoom...
            event.preventDefault();
            this._acknowledgeIntent();
        }
    },

    handleMousedown: {
        value: function(event) {
            this._acknowledgeIntent();
        }
    },

    handleTouchend: {
        value: function(event) {
            this._interpretInteraction(event);
        }
    },

    handleTouchcancel: {
        value: function(event) {
            console.log("cancel!")
            // this._interpretInteraction(event);
        }
    },

    handleMouseup: {
        value: function(event) {
            this._interpretInteraction(event);
        }
    },

    // Internal state management
    _acknowledgeIntent: {
        value: function() {
            this._pressed = true;
            this.element.classList.add("pressed");
        }
    },

    _interpretInteraction: {
        value: function(event) {

            if (!this._pressed) {
                return;
            }

            this.value = !this.value;

            this._pressed = false;
            this._dispatchActionEvent();
        }
    },

    _dispatchActionEvent: {
        value: function() {
            var actionEvent = document.createEvent("CustomEvent");
            actionEvent.initCustomEvent("action", true, true);
            actionEvent.type = "action";
            this.dispatchEvent(actionEvent);
        }
    },

    draw: {
        enumerable: false,
        value: function() {
            if(this.isToggleButton)
            {
                if(this._value === true)
                {
                    this.element.classList.remove(this.offState);
                    this.element.classList.add(this.onState);
                }
                else
                {
                    this.element.classList.remove(this.onState);
                    this.element.classList.add(this.offState);
                }
            }
            
            if(this.label && this.label !== "")
            {
                this.element.textContent = this.label;
            }
        }
    },

    prepareForDraw: {
        value: function() {

            // TODO only install low level event listeners for high level
            // events others listen to us for

            this.element.addEventListener("touchstart", this);
            // TODO listen to mouseup anywhere within the app
            document.addEventListener("touchend", this);
            document.addEventListener("touchcancel", this);


            this.element.addEventListener("mousedown", this);

            // TODO listen to mouseup anywhere within the app
            document.addEventListener("mouseup", this);

            // TODO accept space or enter as a way to trigger action
            // if element targeted; balancing demans of multitouch
            // with traditional single focus model
            document.addEventListener("keydown", this, true);
        }
    }

});
