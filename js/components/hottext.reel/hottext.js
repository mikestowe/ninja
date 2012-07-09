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
var SliderBase = require("js/components/sliderbase").SliderBase;

var HotText = exports.HotText = Montage.create(SliderBase, {
    /* Allow users to specify a function to format the display.
    * For example, the Color Picker can specify a function to map
    * the numeric hot text value to hex color values.
     */
    labelFunction: {
        serializable: true,
        enumerable: true,
        value: null
    },

    inputFunction: {
        serializable: true,
        enumerable: true,
        value: parseFloat
    },

    _numValue: {
        enumerable: false,
        value: 0
    },

    numValue: {
        serializable: false,
        enumerable: true,
        get: function() {
            return this._numValue;
        },
        set: function(value) {
            if (value < this._minValue) {
                value = this._minValue;
            }
            if (value > this._maxValue) {
                value = this._maxValue;
            }
            if (value !== this._numValue) {
                this._numValue = Math.round(value * this._decimalPlace)/this._decimalPlace;
            }
        }
    },

    _previousValue: {
        enumerable: false,
        value: null
    },

    _stepSize: {
        enumerable: false,
        value: 1
    },

    stepSize: {
        serializable: true,
        enumerable: true,
        get: function() {
            return this._stepSize;
        },
        set: function(value) {
            if (value !== this._stepSize) {
                this._stepSize = value;
                this.needsDraw = true;
            }
        }
    },

    _stepSizeShift: {
        enumerable: false,
        value: 10
    },

    _xStart: {
        enumerable: false,
        value: 0
    },

    _yStart: {
        enumerable: false,
        value: 0
    },

    // Needed to determine when to commit a value change
    _wasShiftKeyPressed: {
        enumerable: false,
        value: false
    },

    // for ones, use 1
    // for tenths, use 10
    // for hundredths, use 100, etc.
    _decimalPlace: {
        enumerable: false,
        value: 1
    },

    decimalPlace: {
        serializable: true,
        enumerable: true,
        get: function() {
            return this._decimalPlace;
        },
        set: function(value) {
            if (value !== this._decimalPlace) {
                this._decimalPlace = value;
                this.needsDraw = true;
            }
        }
    },

    // TODO - Need to set max value to 2000 for demo.
    _maxValue: {
        enumerable: false,
        value: 2000
    },

    // Flag used to dispatch a single change event if either or both of value and units are changed
    _unitsModified: {
        enumerable: false,
        value: false
    },

    value: {
        serializable: true,
        enumerable: true,
        get: function() {
            return this._value;
        },
        set: function(value) {
            if (isNaN(value)) {
                this._valueSyncedWithInputField = false;
                this.needsDraw = true;
                return;
            }
            if (value < this._minValue) {
                value = this._minValue;
                this._valueSyncedWithInputField = false;
                this.needsDraw = true;
            }
            else if (value > this._maxValue) {
                value = this._maxValue;
                this._valueSyncedWithInputField = false;
                this.needsDraw = true;
            }

            if (value !== this._value) {
                this._value = this._numValue = Math.round(value * this._decimalPlace)/this._decimalPlace;
                this._valueSyncedWithInputField = false;
                this.needsDraw = true;
                this._dispatchActionEvent();
            } else if(this._unitsModified) {
                // Need to dispatch change event if units changed
                this._dispatchActionEvent();
            }
        }
    },

    _valueSyncedWithInputField: {
        enumerable: false,
        value: false
    },

    // We don't want to handle every input; we only want to handle input from tab or enter
    // Thus, we don't listen for an input event; we call this from handleKeydown
    handleInput: {
        enumerable: false,
        value: function() {
            this._setEventFlags("change", false);
            this.value = this.inputFunction(this.element.value);
        }
    },


    _valueFromPageOffset: {
        value: function(offset, pageY, isShiftKeyPressed, wasSetByCode) {
            if(!this._isMouseDown)
            {
                this._handleMoveEnd();  // If the user has moused up, check if we should go into input mode
                return;
            }

            var clickPoint = webkitConvertPointFromPageToNode(this.element, new WebKitPoint(offset,pageY));

            var dX = clickPoint.x - this._xStart;
            var dY = clickPoint.y - this._yStart;

            var dXAbs = Math.abs(dX);
            var dYAbs = Math.abs(dY);

            if( (dXAbs < 5) && (dYAbs < 5) )
            {
                return; // Don't process unless the user moves at least 5 pixels
            }

            var incrementVal = dXAbs-4;     // otherwise, the first value change will be 5 pixels
            var multFactor = 1;

            if(dXAbs > dYAbs)
            {
                if(dX < 0)
                {
                    multFactor = -1;
                }
            }
            else
            {
                if(dY > 0)
                {
                    multFactor = -1;
                }
                incrementVal = dYAbs-4;
            }

            if(isShiftKeyPressed)
            {
                if(!this._wasShiftKeyPressed)
                {
                    this._xStart = clickPoint.x;
                    this._yStart = clickPoint.y;
                    this._previousValue = this._numValue;
                    incrementVal = 1;
                }
                this.numValue = this._previousValue + multFactor * incrementVal * this._stepSizeShift;
                this._wasShiftKeyPressed = true;
            }
            else
            {
                if(this._wasShiftKeyPressed)
                {
                    this._xStart = clickPoint.x;
                    this._yStart = clickPoint.y;
                    this._previousValue = this._numValue;
                    incrementVal = 1;
                    this._wasShiftKeyPressed = false;
                }
                this.numValue = this._previousValue + multFactor * incrementVal * this._stepSize;
            }

            this.value = this._numValue;
        }
    },

    handleKeydown: {
        enumerable: false,
        value: function(event) {
            switch(event.keyCode)
            {
                case 9: //tab
                case 13: // enter
                    this.handleInput();
                    break;
                case 27: // esc
                    this._valueSyncedWithInputField = false;
                    this.needsDraw = true;
                    break;
                case 38: // up
                    this._setEventFlags("change", false);
                    this.value += this._stepSize;
                    break;
                case 40: // down
                    this._setEventFlags("change", false);
                    this.value -= this._stepSize;
                    break;
                default:
//                    return;
            }
        }
    },

    handleBlur: {
        enumerable: false,
        value: function(event) {
            event.target = this;
            this._hasFocus = false;

            this.handleInput(); // Check if value has changed when focusing out
            this.needsDraw = true;

            this.dispatchEvent(event);
        }
    },

    handleFocus: {
        enumerable: false,
        value: function(event) {
            event.target = this;
            this._hasFocus = true;
            this.dispatchEvent(event);
        }
    },

    _handleMoveEnd: {
        value: function() {
            // If we don't change value (mouse up on ourself), we should go into text edit mode
            if(this._numValue === this._previousValue)
            {
                this._hasFocus = true;
            }
            else
            {
                this._hasFocus = false;
                this._dispatchActionEvent();
            }
            this.needsDraw = true;
        }
    },

    draw: {
        enumerable: false,
        value: function() {
            if(this._hasFocus)
            {
                if(!this._isMouseDown)
                {
                    this.element.classList.remove("hottext");
                    this.element.classList.add("hottextInput");

                    // if element targeted; balancing demands of multitouch
                    // with traditional single focus model
                    this.element.addEventListener("keydown", this, false);
                }
            }
            else
            {
                this.element.classList.remove("hottextInput");
                this.element.classList.add("hottext");
            }

            if (!this._valueSyncedWithInputField)
            {
                if(this.labelFunction)
                {
                    this.element.value = this.labelFunction(this._value);
                }
                else
                {
                    this.element.value = this._value;
                }
            }
        }
    },

    didDraw: {
        enumerable: false,
        value: function() {
            if(!this._isMouseDown && this._hasFocus)
            {
                var length = 0;
                if(this.labelFunction)
                {
                    length = this.labelFunction(this._value).length;
                }
                else
                {
                    length = this._value.toString().length;
                }
                this.element.setSelectionRange(0, length);
            }
            this._valueSyncedWithInputField = true;
        }
    },

    prepareForDraw: {
        value: function() {
            if(this._value)
            {
                this._numValue = this._value;
            }

            if(this._enabled)
            {
                this.element.addEventListener("blur", this);
                this.element.addEventListener("focus", this);

                // TODO only install low level event listeners for high level
                // events others listen to us for
                this.element.addEventListener("touchstart", this, false);
                this.element.addEventListener("mousedown", this, false);
            }
        }
    }

});
