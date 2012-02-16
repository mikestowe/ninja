/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 	require("montage/core/core").Montage,
	Component = require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//
exports.ColorWheel = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
		enumerable: false,
        value: true
    },
    ////////////////////////////////////////////////////////////////////
    //Value of wheel in HSV (360, 100, 100)
    _value: {
        enumerable: false,
        value: {h: 0, s: 0, v: 0}
    },
	////////////////////////////////////////////////////////////////////
    //Value of wheel in HSV (360, 100, 100)
    value: {
        enumerable: false,
        get: function() {
            return this._value;
        },
        set: function(value) {
            this._value = value;
            if (this._wheelData) {
            	if (value && !value.wasSetByCode) {
            		this.wheelSelectorAngle(value.h/this.element._component.math.TAU*360);
					this.drawSwatchColor(value.h/this.element._component.math.TAU*360);
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
    	enumerable: false,
    	value: 2
    },
    ////////////////////////////////////////////////////////////////////
    //Size must be set in digits and interpreted as pixel
    strokeWidth: {
    	enumerable: false,
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
    	enumerable: false,
    	value: 'rgb(255, 255, 255)'
    },
    ////////////////////////////////////////////////////////////////////
    //Stroke only apply to wheel rim
    strokeColor: {
    	enumerable: false,
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
    	enumerable: false,
    	value: 2
    },
    ////////////////////////////////////////////////////////////////////
    //Width must be set using digits interpreted as pixel
    rimWidth: {
    	enumerable: false,
    	 get: function() {
            return this._rimWidth;
        },
        set: function(value) {
        	this._rimWidth = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    prepareForDraw: {
    	enumerable: false,
    	value: function() {
    		//
    		this.element._component = {wheel: {}, swatch: {}, wheel_select: {}, swatch_select: {}, math: {}};
    		//
    		this.element._component.math.PI = Math.PI,
    		this.element._component.math.TAU = Math.PI*2,
    		this.element._component.math.RADIANS = Math.PI/180;
		}
    },
    ////////////////////////////////////////////////////////////////////
    //
    willDraw: {
    	enumerable: false,
    	value: function() {
    		//
    		this.element.style.opacity = 0;
    		//
    		var cnvs = this.element.getElementsByTagName('canvas');
    		//
    		this.element._component.wheel.canvas = cnvs[0];
    		this.element._component.swatch.canvas = cnvs[1];
    		this.element._component.wheel_select.canvas = cnvs[3];
    		this.element._component.swatch_select.canvas = cnvs[2];
    		//
    		this.element._component.wheel.context = this.element._component.wheel.canvas.getContext("2d");
    		this.element._component.swatch.context = this.element._component.swatch.canvas.getContext("2d");
    		this.element._component.wheel_select.context = this.element._component.wheel_select.canvas.getContext("2d");
    		this.element._component.swatch_select.context = this.element._component.swatch_select.canvas.getContext("2d");
		}
    },
    ////////////////////////////////////////////////////////////////////
    //
    draw: {
    	enumerable: false,
    	value: function() {
    		//
    		var slice, i, whlctx = this.element._component.wheel.context, math = this.element._component.math,
    			whlcvs = this.element._component.wheel.canvas, swhcvs = this.element._component.swatch.canvas,
    			wslcvs = this.element._component.wheel_select.canvas, swscvs = this.element._component.swatch_select.canvas;
    		//Determing radius by smallest factor of width or height
    		if (this.element.offsetWidth > this.element.offsetHeight) {
    			math.diameter = this.element.offsetWidth;
    		} else {
    			math.diameter = this.element.offsetHeight;
    		}
    		//Setting the radius from diameter
    		math.radius = math.diameter/2;
    		//Inner radius of wheel
    		math.innerRadius = math.radius - this.rimWidth;
    		//Setting the widths and heights to match the container's
    		whlcvs.width = whlcvs.height = wslcvs.width = wslcvs.height = swscvs.width = swscvs.height = math.diameter;
    		//
    		math.swatchLength = Math.floor((math.radius - this.rimWidth - this.strokeWidth*4) * Math.sin(45 * math.RADIANS) * 2);
    		math.swatchPosition = Math.round(math.radius - (math.swatchLength/2))+this.strokeWidth* Math.sin(45 * math.RADIANS);
    		//
    		//swhcvs.width = swhcvs.height = math.swatchLength; //TODO: Figure out why this breaks on WINDOWS ONLY
    		swhcvs.style.top = swhcvs.style.left = math.swatchPosition+'px';
    		//Clearing wheel for redraw
			whlctx.clearRect(0, 0, math.diameter, math.diameter);
			////////////////////////////////////////////////////////////////
			//Drawing color wheel circle
			whlctx.save();
			whlctx.beginPath();
			whlctx.moveTo(0,0);
			whlctx.lineTo(math.diameter,0);
			whlctx.lineTo(math.diameter,math.diameter);
			whlctx.lineTo(0,math.diameter);
			whlctx.closePath();
			whlctx.clip();
			whlctx.strokeStyle = 'rgba(0,0,0,0)';
			whlctx.lineCap = 'butt';
			whlctx.lineJoin = 'miter';
			whlctx.miterLimit = 4;
			whlctx.save();
    		////////////////////////////////////////////////////////////////
			//Looping through set intervals
			math.radius = math.radius - this.strokeWidth/2;
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
			math.radius = math.radius + this.strokeWidth/2;
			//
			whlctx.strokeStyle = this.strokeColor;
			whlctx.lineWidth = this.strokeWidth;
			whlctx.globalAlpha = 1;
			whlctx.beginPath();
			whlctx.arc(math.radius, math.radius, math.radius-this.strokeWidth/2, 0, math.TAU, true);
			whlctx.closePath();
			whlctx.stroke();
			whlctx.restore();
			//
			whlctx.strokeStyle = this.strokeColor;
			whlctx.lineWidth = this.strokeWidth;
			whlctx.globalAlpha = 1;
			whlctx.beginPath();
			whlctx.arc(math.innerRadius+this.rimWidth, math.innerRadius+this.rimWidth, math.innerRadius-this.strokeWidth/2, 0, math.TAU, true);
			whlctx.closePath();
			whlctx.stroke();
			whlctx.restore();
			//
			whlctx.beginPath();
			whlctx.moveTo(math.swatchPosition-this.strokeWidth/2, math.swatchPosition-this.strokeWidth/2);
			whlctx.lineTo(math.swatchLength+math.swatchPosition-this.strokeWidth/2, math.swatchPosition-this.strokeWidth/2);
			whlctx.lineTo(math.swatchLength+math.swatchPosition-this.strokeWidth/2, math.swatchLength+math.swatchPosition-this.strokeWidth/2);
			whlctx.lineTo(math.swatchPosition-this.strokeWidth/2, math.swatchLength+math.swatchPosition-this.strokeWidth/2);
			whlctx.closePath();
			whlctx.strokeStyle = "rgba(0, 0, 0, .25)";
			whlctx.shadowColor = "rgba(0, 0, 0, 1)";
			whlctx.shadowBlur = 2;
			whlctx.stroke();
			//
			this._wheelData = whlctx.getImageData(0, 0, math.diameter, math.diameter);
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
				this.wheelSelectorAngle(this.value.h/math.TAU*360);
				this.drawSwatchColor(this.value.h/math.TAU*360);
				this.drawSwatchSelector(this.value.s*100, this.value.v*100);
			}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
   	didDraw: {
    	enumerable: false,
    	value: function() {
    		//
			this.element.style.opacity = 1;
			//
			this.element._component.wheel_select.canvas.style.cursor = 'pointer';
			//
	    	this.element._component.wheel_select.canvas.addEventListener('mouseup', this, false);
    		this.element._component.wheel_select.canvas.addEventListener('mousedown', this, false);
    		this.element._component.wheel_select.canvas.addEventListener('mousemove', this, false);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _scanningMode: {
    	enumerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _isMouseDown: {
    	enumerable: false,
    	value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleMousedown: {
    	enumerable: false,
    	value: function(e) {
    		//
    		this._isMouseDown = true;
    		//
    		if ((e.offsetY < this.element._component.math.swatchPosition || e.offsetY > this.element._component.math.swatchLength+this.element._component.math.swatchPosition) || (e.offsetX < this.element._component.math.swatchPosition || e.offsetX > this.element._component.math.swatchLength+this.element._component.math.swatchPosition)) {	
				this._scanningMode = 'wheel';
			} else {
				this._scanningMode = 'swatch';
			}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleMouseup: {
    	enumerable: false,
    	value: function(e) {
    		var math = this.element._component.math;
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
    	enumerable: false,
    	value: function(e) {
    		var math = this.element._component.math;
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
					this.element._component.wheel_select.canvas.style.cursor = 'pointer';
				} else {
					this.element._component.wheel_select.canvas.style.cursor = 'crosshair';
				}
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    mouseSetWheelAngle: {
    	enumerable: false,
    	value: function(e) {
    		var angle = (2 * Math.atan2(e.offsetY - (this.element._component.math.radius - Math.sqrt(Math.pow(Math.abs(e.offsetX - this.element._component.math.radius),2) + Math.pow(Math.abs(e.offsetY - this.element._component.math.radius), 2))), e.offsetX - this.element._component.math.radius))/this.element._component.math.TAU*360;
			if (this._value) {
				this.value = {h: angle*this.element._component.math.TAU/360, s: this._value.s, v: this._value.v};
			} else {
				this.value = {h: angle*this.element._component.math.TAU/360, s: 1, v: 1};
			}
			this.wheelSelectorAngle(0);
			this.wheelSelectorAngle(angle);
			this.drawSwatchColor(angle);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    mouseSetSwatch: {
    	enumerable: false,
    	value: function(e) {
    		//
    		var s, v, math = this.element._component.math;;
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
    	enumerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _previousDegree: {
    	enumerable: false,
    	value: 0
    },
    ////////////////////////////////////////////////////////////////////
    //
    drawSwatchSelector: {
    	enumerable: false,
    	value: function (s, v) {
    		var context = this.element._component.swatch_select.context, strokeWidth = this.strokeWidth/2, radius = this.element._component.math.radius/28, math = this.element._component.math;
    		context.clearRect(0, 0, math.diameter, math.diameter);
			//White outline
			context.beginPath();
			context.strokeStyle = '#FFF';
			context.lineWidth = strokeWidth;
			context.globalAlpha = 1;
			//context.arc(this.element._component.math.swatchPosition+(this.element._component.math.swatchLength*(s/100)) - radius/2, this.element._component.math.swatchPosition+(this.element._component.math.swatchLength*(1-v/100))- radius/2, radius-strokeWidth, 0, this.element._component.math.TAU, true);
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
    	enumerable: false,
    	value: function (angle) {
    		var context = this.element._component.swatch.context, gradient, math = this.element._component.math;
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
    	enumerable: false,
    	value: function (s, r, g, b) {
    		//
    		var context = this.element._component.wheel.context, radius = this.element._component.math.radius;
    		context.beginPath();
    		context.fillStyle = 'rgb('+r+','+g+','+b+')';
			context.scale(1,1);
			context.translate(radius + this.strokeWidth/2, radius + this.strokeWidth/2);
			context.rotate(s*this.element._component.math.RADIANS);
			context.translate(-radius, -radius);
			context.moveTo(radius, radius);
			context.translate(radius, radius);
			context.arc(0, 0, radius, -1.59, -1.53, 0);
			context.translate(-radius, -radius);
			context.lineTo(radius, this.rimWidth);
			context.translate(radius, radius);
			context.arc(0, 0, this.element._component.math.innerRadius, -1.53, -1.59, 1);
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
    	enumerable: false,
    	value: function (angle) {
    		angle *= this.element._component.math.RADIANS;
    		//
    		var context = this.element._component.wheel_select.context, radius = this.element._component.math.radius,
    			radiusOffsetPositive = this.element._component.math.radius+this.rimWidth/3,
    			rimPositiveStrokeOffset = this.rimWidth + this.strokeWidth,
    			strokeTotalWidth = this.strokeWidth*2,
    			rimNegativeStrokeOffset = this.rimWidth - this.strokeWidth,
    			radiusOffsetNagative = this.element._component.math.radius-this.rimWidth/3;
    		//
    		context.clearRect(0, 0, this.element._component.wheel_select.canvas.width, this.element._component.wheel_select.canvas.height);
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