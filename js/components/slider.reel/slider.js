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
var SliderBase = require("js/components/sliderbase").SliderBase;

var Slider = exports.Slider = Montage.create(SliderBase, {

    parentDiv: {
        value: null,
        serializable: true
    },

    track: {
        value: null,
        serializable: true
    },

    knob: {
        value: null,
        serializable: true
    },

    // "horizontal" or "vertical"
    _direction: {
        enumerable: true,
        value: "horizontal"
    },

    direction: {
        enumerable: true,
        get: function() {
            return this._direction;
        },
        set: function(value) {

            if (value !== this._direction) {
                this._direction = value;
                this.needsDraw = true;
            }
        }
    },

    customBackground: {
        enumerable: true,
        serializable:true,
        value: null
    },

    _sliderTrack: {
        enumerable: false,
        value: null
    },

    // Should support clicking on the track
    _allowTrackClick: {
        enumerable: true,
        value: true
    },

    allowTrackClick: {
        enumerable: true,
        get: function() {
            return this._allowTrackClick;
        },
        set: function(value) {

            if (value !== this._allowTrackClick) {
                this._allowTrackClick = value;
            }
        }
    },

    _knob: {
        enumerable: false,
        value: null
    },

    _positionValue: {
        enumerable: false,
        value: 0
    },

    _previousPositionValue: {
        enumerable: false,
        value: 0
    },

    _percentValue: {
        enumerable: false,
        value: 0
    },

    _knobPercentWidth: {
        enumerable: false,
        value: 0
    },

    _knobOffsetWidth: {
        enumerable: false,
        value: 0
    },

    _length: {
        enumerable: false,
        value: 0
    },

    _deltaLeft: {
        enumerable: false,
        value: 0
    },

    _valueFromPageOffset: {
        value: function(offset, pageY, isShiftKeyPressed) {
            var clickPoint;
            if(this._direction === "horizontal")
            {
                clickPoint = webkitConvertPointFromPageToNode(this.element, new WebKitPoint(offset,pageY)).x;
            }
            else
            {
                clickPoint = webkitConvertPointFromPageToNode(this.element, new WebKitPoint(offset,pageY)).y;
            }
            this.value = (clickPoint*this._valueCoef)+this._minValue;
            
            if(!this._isMouseDown && (this._previousValue !== this._value))
            {
                this._dispatchActionEvent();
            }
        }
    },

    setPercentValueFromValue: {
        value: function () {
            this._percentValue = (this._value-this._minValue)/(this._maxValue-this._minValue)*(100 - this._knobPercentWidth);
        }
    },

    willDraw: {
        enumerable: false,
        value: function() {
            if(this._firstTime)
            {

                if(this._direction === "horizontal")
                {
                    this._length = parseInt(this.element.offsetWidth);
                    //this._length = this.element.offsetWidth;
                    this._knobPercentWidth = parseInt(document.defaultView.getComputedStyle(this.knob, null).getPropertyValue("margin-left")) / this._length;

                }
                else
                {
                    this._length = this.element.offsetHeight;
                    this._knobPercentWidth = parseInt(document.defaultView.getComputedStyle(this.knob, null).getPropertyValue("margin-top")) / this._length;
                }

                this.track.width = parseInt(this.element.offsetWidth);
                //this.track.width = this.element.offsetWidth;
                this.track.height = parseInt(this.element.offsetHeight);
                //this.track.height = this.element.offsetHeight;

                this._valueCoef = (this._maxValue-this._minValue)/this._length;
                this._firstTime = false;
            }
        }
    },

    draw: {
        value: function() {
            this.setPercentValueFromValue();
            
            if(this._direction === "horizontal")
            {
                this.knob.style.left = this._percentValue +"%";
            }
            else
            {
                this.knob.style.top = this._percentValue +"%";
            }
            if(this.customBackground)
            {
                this.customBackground(this.track);
            }
        }
    },

    _handleTrackClick: {
        enumerable: false,
        value: function(event) {
            event.preventDefault();
            this._setEventFlags("change", false);
            this._valueFromPageOffset(event.pageX,event.pageY,false);
        }
    },

    prepareForDraw: {
        enumerable: false,
        value: function() {

//            var sliderParent = document.createElement('div');
//            this._sliderTrack = document.createElement('canvas');
//            this._knob = document.createElement('div');


//            sliderParent.classList.add("slider-parent");
//            this._sliderTrack.classList.add("slider-track");
//            this._knob.classList.add("knob");



//            sliderParent.appendChild(this._sliderTrack);
//            sliderParent.appendChild(this._knob);
//            this.element.appendChild(sliderParent);




            if(this._direction === "horizontal")
            {
                this.parentDiv.classList.add("horizontal");
                this.track.classList.add("horizontal");
                this.knob.classList.add("horizontal");
                //sliderParent.classList.add("horizontal");
                //this._sliderTrack.classList.add("horizontal");
                //this._knob.classList.add("horizontal");
            }
            else
            {
                this.parentDiv.classList.add("vertical");
                this.track.classList.add("vertical");
                this.knob.classList.add("vertical");

                //sliderParent.classList.add("vertical");
                //this._sliderTrack.classList.add("vertical");
                //this._knob.classList.add("vertical");
            }


            

            if(this._enabled)
            {
    //            if (window.Touch) {
                    this.knob.addEventListener("touchstart", this, false);
    //            } else {
                    this.knob.addEventListener("mousedown", this, false);
    //            }
                if(this._allowTrackClick)
                {
                    this.track.addEventListener("click", this._handleTrackClick.bind(this), false);
                }
                if (this.value === null) {
                    this.value = this._minValue;
                }
            }
            
        }
    }
    
});
