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

////////////////////////////////////////////////////////////////////////
//
var Montage =   require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//
exports.ColorWheel = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //
    hasTemplate: {
        value: true
    },
    ////////////////////////////////////////////////////////////////////
    //Value of wheel in HSV (360, 100, 100)
    _value: {
        value: {h: 0, s: 0, v: 0}
    },
    ////////////////////////////////////////////////////////////////////
    //Value of wheel in HSV (360, 100, 100)
    value: {
        get: function() {
            return this._value;
        },
        set: function(value) {
            this._value = value;
            if (this._wheelData) {
                if (value && !value.wasSetByCode) {
                    this.wheelSelectorAngle(value.h/this._math.TAU*360);
                    this.drawSwatchColor(value.h/this._math.TAU*360);
                    this.drawSwatchSelector(value.s*100, value.v*100);
                }
                if (!this._isMouseDown) {
                    this._dispatchEvent('change', true);
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Stroke size of wheel
    _strokeWidth: {
        value: 2
    },
    ////////////////////////////////////////////////////////////////////
    //Size must be set in digits and interpreted as pixel
    strokeWidth: {
        get: function() {
            return this._strokeWidth;
        },
        set: function(value) {
            this._strokeWidth = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Stroke color of wheel
    _strokeColor: {
        value: 'rgb(255, 255, 255)'
    },
    ////////////////////////////////////////////////////////////////////
    //Stroke only apply to wheel rim
    strokeColor: {
        get: function() {
            return this._strokeColor;
        },
        set: function(value) {
            this._strokeColor = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Width of the rim
    _rimWidth: {
        value: 2
    },
    ////////////////////////////////////////////////////////////////////
    //Width must be set using digits interpreted as pixel
    rimWidth: {
        get: function() {
            return this._rimWidth;
        },
        set: function(value) {
            this._rimWidth = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _math: {
        value: {PI: Math.PI, TAU: Math.PI*2, RADIANS: Math.PI/180}
    },
    ////////////////////////////////////////////////////////////////////
    //
    prepareForDraw: {
        value: function() {
            //Hidding component while it is drawn
            this.element.style.opacity = 0;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    willDraw: {
        value: function() {
            //
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    draw: {
        value: function() {
            //
            var slice, i, whlctx = this.wheel.getContext("2d");
            //Determing radius by smallest factor of width or height
            if (this.element.offsetWidth > this.element.offsetHeight) {
                this._math.diameter = this.element.offsetWidth;
            } else {
                this._math.diameter = this.element.offsetHeight;
            }
            //Setting the radius from diameter
            this._math.radius = this._math.diameter/2;
            //Inner radius of wheel
            this._math.innerRadius = this._math.radius - this.rimWidth;
            //Setting the widths and heights to match the container's
            this.wheel.width = this.wheel.height = this.wheelSelect.width = this.wheelSelect.height = this.swatchSelect.width = this.swatchSelect.height = this._math.diameter;
            //
            this._math.swatchLength = Math.floor((this._math.radius - this.rimWidth - this.strokeWidth*4) * Math.sin(45 * this._math.RADIANS) * 2);
            this._math.swatchPosition = Math.round(this._math.radius - (this._math.swatchLength/2))+this.strokeWidth* Math.sin(45 * this._math.RADIANS);
            //
            this.swatch.style.top = this.swatch.style.left = this._math.swatchPosition+'px';
            //Clearing wheel for redraw
            whlctx.clearRect(0, 0, this._math.diameter, this._math.diameter);
            ////////////////////////////////////////////////////////////////
            //Drawing color wheel circle
            whlctx.save();
            whlctx.beginPath();
            whlctx.moveTo(0,0);
            whlctx.lineTo(this._math.diameter,0);
            whlctx.lineTo(this._math.diameter,this._math.diameter);
            whlctx.lineTo(0,this._math.diameter);
            whlctx.closePath();
            whlctx.clip();
            whlctx.strokeStyle = 'rgba(0,0,0,0)';
            whlctx.lineCap = 'butt';
            whlctx.lineJoin = 'miter';
            whlctx.miterLimit = 4;
            whlctx.save();
            ////////////////////////////////////////////////////////////////
            //Looping through set intervals
            this._math.radius = this._math.radius - this.strokeWidth/2;
            for (i=0; i<60; i++) {
                //Calculating slice number
                slice = Math.round(255*i/60);
                //Drawing 6 slices (6 colors in color theory)
                this._drawWheelSlice (i, 255, slice, 0);
                this._drawWheelSlice (i+60, 255-slice, 255, 0);
                this._drawWheelSlice (i+120, 0, 255, slice);
                this._drawWheelSlice (i+180, 0, 255-slice, 255);
                this._drawWheelSlice (i+240, slice, 0, 255);
                this._drawWheelSlice (i+300, 255, 0, 255-slice);
            }
            //
            this._math.radius = this._math.radius + this.strokeWidth/2;
            //TODO: Add parameter to allow for color specification of this inner 'empty' circle in wheel
            whlctx.beginPath();
            whlctx.arc(this._math.innerRadius+this.rimWidth, this._math.innerRadius+this.rimWidth, this._math.innerRadius-this.strokeWidth/2, 0, this._math.TAU, true);
            whlctx.fillStyle = '#494949';
            whlctx.fill();
            whlctx.restore();
            //
            whlctx.strokeStyle = this.strokeColor;
            whlctx.lineWidth = this.strokeWidth;
            whlctx.globalAlpha = 1;
            whlctx.beginPath();
            whlctx.arc(this._math.radius, this._math.radius, this._math.radius-this.strokeWidth/2, 0, this._math.TAU, true);
            whlctx.closePath();
            whlctx.stroke();
            whlctx.restore();
            //
            whlctx.strokeStyle = this.strokeColor;
            whlctx.lineWidth = this.strokeWidth;
            whlctx.globalAlpha = 1;
            whlctx.beginPath();
            whlctx.arc(this._math.innerRadius+this.rimWidth, this._math.innerRadius+this.rimWidth, this._math.innerRadius-this.strokeWidth/2, 0, this._math.TAU, true);
            whlctx.closePath();
            whlctx.stroke();
            whlctx.restore();
            //
            whlctx.beginPath();
            whlctx.moveTo(this._math.swatchPosition-this.strokeWidth/2, this._math.swatchPosition-this.strokeWidth/2);
            whlctx.lineTo(this._math.swatchLength+this._math.swatchPosition-this.strokeWidth/2, this._math.swatchPosition-this.strokeWidth/2);
            whlctx.lineTo(this._math.swatchLength+this._math.swatchPosition-this.strokeWidth/2, this._math.swatchLength+this._math.swatchPosition-this.strokeWidth/2);
            whlctx.lineTo(this._math.swatchPosition-this.strokeWidth/2, this._math.swatchLength+this._math.swatchPosition-this.strokeWidth/2);
            whlctx.closePath();
            whlctx.strokeStyle = "rgba(0, 0, 0, .25)";
            whlctx.shadowColor = "rgba(0, 0, 0, 1)";
            whlctx.shadowBlur = 2;
            whlctx.stroke();
            //
            this._wheelData = whlctx.getImageData(0, 0, this._math.diameter, this._math.diameter);
            //TODO: Fix redraw bug
            if(!this.value) {
                this.wheelSelectorAngle(0);
                this.drawSwatchColor(0);
                this.drawSwatchSelector(100, 100);
            } else {
                this.wheelSelectorAngle(0);
                this.drawSwatchColor(0);
                this.drawSwatchSelector(100, 100);
                //
                this.wheelSelectorAngle(this.value.h/this._math.TAU*360);
                this.drawSwatchColor(this.value.h/this._math.TAU*360);
                this.drawSwatchSelector(this.value.s*100, this.value.v*100);
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    didDraw: {
        value: function() {
            //
            this.element.style.opacity = 1;
            //
            this.wheelSelect.style.cursor = 'pointer';
            //
            this.wheelSelect.addEventListener('mouseup', this, false);
            this.wheelSelect.addEventListener('mousedown', this, false);
            this.wheelSelect.addEventListener('mousemove', this, false);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _scanningMode: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _isMouseDown: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleMousedown: {
        value: function(e) {
            //
            this._isMouseDown = true;
            //
            if ((e.offsetY < this._math.swatchPosition || e.offsetY > this._math.swatchLength+this._math.swatchPosition) || (e.offsetX < this._math.swatchPosition || e.offsetX > this._math.swatchLength+this._math.swatchPosition)) {
                this._scanningMode = 'wheel';
            } else {
                this._scanningMode = 'swatch';
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleMouseup: {
        value: function(e) {
            var math = this._math;
            //
            if ((e.offsetY < math.swatchPosition || e.offsetY > math.swatchLength+math.swatchPosition) || (e.offsetX < math.swatchPosition || e.offsetX > math.swatchLength+math.swatchPosition)) {
                if (this._scanningMode === 'wheel') {
                    this.mouseSetWheelAngle(e);
                }
            } else {
                if (this._scanningMode === 'swatch'){
                    this.mouseSetSwatch(e);
                }
            }
            this._dispatchEvent('change', false);
            this._isMouseDown = false;
            this._scanningMode = null;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleMousemove: {
        value: function(e) {
            var math = this._math;
            //
            if (this._isMouseDown) {
                if (this._scanningMode === 'wheel') {
                    this.mouseSetWheelAngle(e);
                } else if (this._scanningMode === 'swatch'){
                    this.mouseSetSwatch(e);
                }
                //
                this._dispatchEvent('changing', false);
            } else {
                if ((e.offsetY < math.swatchPosition || e.offsetY > math.swatchLength+math.swatchPosition) || (e.offsetX < math.swatchPosition || e.offsetX > math.swatchLength+math.swatchPosition)) {
                    this.wheelSelect.style.cursor = 'pointer';
                } else {
                    this.wheelSelect.style.cursor = 'crosshair';
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    mouseSetWheelAngle: {
        value: function(e) {
            var angle = (2 * Math.atan2(e.offsetY - (this._math.radius - Math.sqrt(Math.pow(Math.abs(e.offsetX - this._math.radius),2) + Math.pow(Math.abs(e.offsetY - this._math.radius), 2))), e.offsetX - this._math.radius))/this._math.TAU*360;
            if (this._value) {
                this.value = {h: angle*this._math.TAU/360, s: this._value.s, v: this._value.v};
            } else {
                this.value = {h: angle*this._math.TAU/360, s: 1, v: 1};
            }
            this.wheelSelectorAngle(0);
            this.wheelSelectorAngle(angle);
            this.drawSwatchColor(angle);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    mouseSetSwatch: {
        value: function(e) {
            //
            var s, v, math = this._math;;
            //
            if (e.offsetX > math.swatchLength+math.swatchPosition) {
                s = 100;
            } else if (e.offsetX < math.swatchPosition) {
                s = 0;
            } else {
                s = 100-100*(math.swatchLength-(e.offsetX-math.swatchPosition))/math.swatchLength;
            }
            //
            if (e.offsetY > math.swatchLength+math.swatchPosition) {
                v = 0;
            } else if (e.offsetY < math.swatchPosition) {
                v = 100;
            } else {
                v = 100-(e.offsetY-math.swatchPosition)/math.swatchLength*100;
            }
            //
            if (this._value) {
                this.value = {h: this._value.h, s: s/100, v: v/100};
            } else {
                this.value = {h: 0, s: s/100, v: v/100};
            }
            //
            this.drawSwatchSelector(s, v);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _wheelData: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _previousDegree: {
        value: 0
    },
    ////////////////////////////////////////////////////////////////////
    //
    drawSwatchSelector: {
        value: function (s, v) {
            var context = this.swatchSelect.getContext("2d"), strokeWidth = this.strokeWidth/2, radius = this._math.radius/28, math = this._math;
            context.clearRect(0, 0, math.diameter, math.diameter);
            //White outline
            context.beginPath();
            context.strokeStyle = '#FFF';
            context.lineWidth = strokeWidth;
            context.globalAlpha = 1;
            //context.arc(this._math.swatchPosition+(this._math.swatchLength*(s/100)) - radius/2, this._math.swatchPosition+(this._math.swatchLength*(1-v/100))- radius/2, radius-strokeWidth, 0, this._math.TAU, true);
            context.arc(math.swatchPosition+(math.swatchLength*(s/100)), math.swatchPosition+(math.swatchLength*(1-v/100)), radius-strokeWidth, 0, math.TAU, true);
            context.closePath();
            context.stroke();
            context.restore();
            //Black outline
            context.beginPath();
            context.strokeStyle = '#000';
            context.lineWidth = strokeWidth;
            context.globalAlpha = 1;
            context.arc(math.swatchPosition+(math.swatchLength*(s/100)), math.swatchPosition+(math.swatchLength*(1-v/100)), radius, 0, math.TAU, true);
            context.closePath();
            context.stroke();
            context.restore();
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    drawSwatchColor: {
        value: function (angle) {
            var context = this.swatch.getContext("2d"), gradient, math = this._math;
            context.clearRect(0, 0, math.swatchLength, math.swatchLength);
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(math.swatchLength, 0);
            context.lineTo(math.swatchLength, math.swatchLength);
            context.lineTo(0, math.swatchLength);
            context.closePath();
            context.fillStyle = 'hsl('+angle+', 100%, 50%)';
            context.fill();
            //
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(math.swatchLength, 0);
            context.lineTo(math.swatchLength, math.swatchLength);
            context.lineTo(0, math.swatchLength);
            gradient = context.createLinearGradient(0,0,math.swatchLength,0);
            gradient.addColorStop(0,"rgba(255, 255, 255, 255)");
            gradient.addColorStop(1,"rgba(255, 255, 255, 0)");
            context.fillStyle = gradient;
            context.fillRect(0 , 0, math.swatchLength, math.swatchLength);
            context.closePath();
            //
            context.beginPath();
            context.moveTo(0, math.swatchLength);
            context.lineTo(math.swatchLength, 0);
            context.lineTo(math.swatchLength, math.swatchLength);
            context.lineTo(0, math.swatchLength);
            gradient = context.createLinearGradient(0,math.swatchLength,0, 0);
            gradient.addColorStop(0,"rgba(0, 0, 0, 255)");
            gradient.addColorStop(1,"rgba(0, 0, 0, 0)");
            context.fillStyle = gradient;
            context.fillRect(0 , 0, math.swatchLength, math.swatchLength);
            context.closePath();
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _drawWheelSlice: {
        value: function (s, r, g, b) {
            //
            var context = this.wheel.getContext("2d"),
                radius = this._math.radius,
                trnslt = radius + this.strokeWidth/2;
            //
            context.beginPath();
            context.fillStyle = 'rgb('+r+','+g+','+b+')';
            context.scale(1,1);
            context.translate(trnslt, trnslt);
            context.rotate(s*this._math.RADIANS);
            context.translate(-radius, -radius);
            context.moveTo(radius, radius);
            context.translate(radius, radius);
            context.arc(0, 0, radius, -1.59, -1.53, 0);
            context.translate(-radius, -radius);
            context.lineTo(radius, this.rimWidth);
            context.translate(radius, radius);
            context.arc(0, 0, this._math.innerRadius, -1.53, -1.59, 1);
            context.closePath();
            context.fill();
            context.stroke();
            context.restore();
            context.save();
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    wheelSelectorAngle: {
        value: function (angle) {
            angle *= this._math.RADIANS;
            //
            var context = this.wheelSelect.getContext("2d"), radius = this._math.radius,
                radiusOffsetPositive = this._math.radius+this.rimWidth/3,
                rimPositiveStrokeOffset = this.rimWidth + this.strokeWidth,
                strokeTotalWidth = this.strokeWidth*2,
                rimNegativeStrokeOffset = this.rimWidth - this.strokeWidth,
                radiusOffsetNagative = this._math.radius-this.rimWidth/3;
            //
            context.clearRect(0, 0, this.wheelSelect.width, this.wheelSelect.height);
            //
            context.beginPath();
            context.fillStyle = "rgba(0, 0, 0, 0)";
            context.shadowColor = "rgba(0 , 0, 0, 1)";
            context.shadowBlur = this.strokeWidth;
            context.strokeStyle = this.strokeColor;
            context.lineWidth = this.strokeWidth;
            context.translate(radius, radius);
            context.rotate(angle - this._previousDegree);
            this._previousDegree = angle;
            context.translate(-radius, -radius);
            context.globalAlpha = 1;
            context.moveTo(radius, 0);
            context.lineTo(radius, 0);
            context.quadraticCurveTo(radiusOffsetPositive, 0, radiusOffsetPositive, strokeTotalWidth);
            context.lineTo(radiusOffsetPositive, rimNegativeStrokeOffset);
            context.quadraticCurveTo(radiusOffsetPositive, rimPositiveStrokeOffset, radius, rimPositiveStrokeOffset);
            context.lineTo(radius, rimPositiveStrokeOffset);
            context.quadraticCurveTo(radiusOffsetNagative, rimPositiveStrokeOffset, radiusOffsetNagative,rimNegativeStrokeOffset);
            context.lineTo(radiusOffsetNagative, strokeTotalWidth);
            context.quadraticCurveTo(radiusOffsetNagative, 0, radius, 0);
            context.stroke();
            context.closePath();
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Dispatching custom event
    _dispatchEvent: {
        value: function(type, userInitiated) {
            var actionEvent = document.createEvent("CustomEvent");
            actionEvent.initEvent(type, true, true);
            actionEvent.type = type;
            actionEvent.wasSetByCode = userInitiated;
            actionEvent.hsv = this.value;
            this.dispatchEvent(actionEvent);
        }
    }
    ////////////////////////////////////////////////////////////////////
});
