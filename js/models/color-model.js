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

////////////////////////////////////////////////////////////////////////
//
var Montage = 			require("montage/core/core").Montage,
	Component = 		require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//
exports.ColorModel = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
    //
	hasTemplate: {
		enumerable: false,
    	value: false
	},
	////////////////////////////////////////////////////////////////////
    //HSV Value of current color selected
    _gradient: {
    	enumerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //HSV Value of current color selected
    gradient: {
    	enumerable: true,
        get: function() {
            return this._gradient;
        },
        set: function(value) {
        	this._gradient = value;
        	//Updating color selected (converting to all modes)
        	this.updateColorSelected('gradient', value);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //HSV Value of current color selected
    _hsv: {
    	enumerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //HSV Value of current color selected
    hsv: {
    	enumerable: true,
        get: function() {
            return this._hsv;
        },
        set: function(value) {
        	this._hsv = value;
        	//Updating color selected (converting to all modes)
        	this.updateColorSelected('hsv', value);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //RGB Value of current color selected
    _rgb: {
    	enumerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //RGB Value of current color selected
    rgb: {
    	enumerable: true,
        get: function() {
            return this._rgb;
        },
        set: function(value) {
        	this._rgb = value;
        	//Updating color selected (converting to all modes)
        	this.updateColorSelected('rgb', value);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //HSL Value of current color selected
    _hsl: {
    	enumerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //HSL Value of current color selected
    hsl: {
    	enumerable: true,
        get: function() {
            return this._hsl;
        },
        set: function(value) {
        	this._hsl = value;
        	//Updating color selected (converting to all modes)
        	this.updateColorSelected('hsl', value);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //HEX Value of current color selected
    _hex: {
    	numerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //HEX Value of current color selected
    hex: {
    	enumerable: true,
        get: function() {
            return this._hex;
        },
        set: function(value) {
        	this._hex = value;
            //Updating color selected (converting to all modes)
        	this.updateColorSelected('hex', value);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //ALPHA Value of current color selected
    _alpha: {
    	enumerable: false,
    	value: {value: 1, type: 'change', wasSetByCode: true}
    },
    ////////////////////////////////////////////////////////////////////
    //ALPHA Value of current color selected
    alpha: {
    	enumerable: true,
        get: function() {
            return this._alpha;
        },
        set: function(value) {
        	value.value = Math.ceil(value.value*100)/100;
        	this._alpha = value;
        	//
        	if (this.rgb || this.hsl) {
        		this._dispatchChangeEvent('alpha', value);     	
        	}
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Input (fill or stroke) Value of current color selected
    _input: {
    	enumerable: false,
    	value: 'fill'
    },
    ////////////////////////////////////////////////////////////////////
    //Input Value of current color selected
    input: {
    	enumerable: true,
        get: function() {
            return this._input;
        },
        set: function(value) {
        	this._input = value;
        	//Dispatching change event
            this._dispatchChangeEvent('input', value);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Color mode of current color selected
    _mode: {
    	enumerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //Color mode of current color selected
    mode: {
    	enumerable: true,
        get: function() {
            return this._mode;
        },
        set: function(value) {
        	this._mode = value;
        	//Dispatching change event
            this._dispatchChangeEvent('mode', value);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Stroke Color Value of current color selected
    _stroke: {
    	enumerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //Stroke Color Value of current color selected
    stroke: {
    	enumerable: true,
        get: function() {
            return this._stroke;
        },
        set: function(value) {
        	this._stroke = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Fill Color Value of current color selected
    _fill: {
    	enumerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //Fill Color Value of current color selected
    fill: {
    	enumerable: true,
        get: function() {
            return this._fill;
        },
        set: function(value) {
        	this._fill = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //History Value array of current color selected
    colorHistory: {
    	enumerable: false,
    	value: {stroke: [{m: 'rgb', c: {r: 0, g: 0, b: 0}, a: 1}, {m: 'rgb', c: {r: 0, g: 0, b: 0}, a: 1}], fill: [{m: 'rgb', c: {r: 0, g: 0, b: 0}, a: 1}, {m: 'rgb', c: {r: 0, g: 0, b: 0}, a: 1}]}
    },
    ////////////////////////////////////////////////////////////////////
    //History Value array of current color selected
    _addColorHistory: {
    	enumerable: true,
        value: function(input, mode, color, alpha) {
        	//TODO: Add limit
        	if (this.colorHistory[input.toLowerCase()].length > 1) {
        		if (this.colorHistory[input.toLowerCase()][this.colorHistory[input.toLowerCase()].length-1].c !== color || this.colorHistory[input.toLowerCase()][this.colorHistory[input.toLowerCase()].length-1].a !== alpha.value) {
        			this.colorHistory[input.toLowerCase()].push({m: mode, c: color, a: alpha.value});
        		}
        	} else {
        		this.colorHistory[input.toLowerCase()].push({m: mode, c: color, a: alpha.value});
        	}
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    applyNoColor: {
    	enumerable: true,
        value: function (code) {
        	//
        	var nocolor = {};
        	nocolor.wasSetByCode = code;
    		nocolor.type = 'change';
        	this.updateColorSelected('nocolor', nocolor);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Method to update color selected and convert to other modes
    updateColorSelected: {
    	enumerable: true,
    	//value: function (input, mode, color, alpha) {
    	value: function (mode, color) {
    		////////////////////////////////////////////////////////////
    		//Checking for color mode to convert colors
    		switch (mode.toLocaleLowerCase()) {
    			////////////////////////////////////////////////////////
    			case 'gradient':
    				//Checking for match of previous gradient
    				if (color !== this.gradient) {
    					//Setting value and breaking out of function
    					this.gradient = color;
    					return;
    				}
    				//
    				this._hex = '------';
    				this._rgb = null;
    				this._hsv = null;
    				this._hsl = null;
    				break;
    			////////////////////////////////////////////////////////
    			case 'rgb':
    				//Checking for match of previous (RGB)
    				if (color.r !== this.rgb.r && color.g !== this.rgb.g && color.b !== this.rgb.b) {
    					//Setting value and breaking out of function
    					this.rgb = color;
    					return;
    				}
    				//Setting other color mode values
    				this._hsv = this.rgbToHsv(color.r, color.g, color.b);
    				this._hsl = this.rgbToHsl(color.r, color.g, color.b);
    				this._hex = this.rgbToHex(color.r, color.g, color.b);
    				this._gradient = null;
    				break;
    			////////////////////////////////////////////////////////
    			case 'hsv':
    				//Checking for match of previous (HSV)
    				if (color.h !== this.hsv.h && color.s !== this.hsv.s && color.v !== this.hsv.v) {
    					//Setting value and breaking out of function
    					this.hsv = color;
    					return;
    				}
    				//Setting other color mode values
    				this._rgb = this.hsvToRgb(color.h/(2*Math.PI), color.s, color.v);
    				this._hsl = this.rgbToHsl(this.rgb.r, this.rgb.g, this.rgb.b);
    				this._hex = this.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
    				this._gradient = null;
    				break;
    			////////////////////////////////////////////////////////
    			case 'hsl':
    				//Checking for match of previous (HSV)
    				if (color.h !== this.hsl.h && color.s !== this.hsl.s && color.l !== this.hsl.l) {
    					//Setting value and breaking out of function
    					this.hsl = color;
    					return;
    				}
    				//Setting other color mode values
    				this._rgb = this.hslToRgb(color.h/360, color.s/100, color.l/100);
    				//This is a hack to keep the values of color spectrum the same on limits (B/W)
    				var hsvTemp = this.rgbToHsv(this.rgb.r, this.rgb.g, this.rgb.b);
    				this._hsv = {h: (this._hsl.h/360)*(2*Math.PI), s: hsvTemp.s, v: hsvTemp.v};
    				this._hex = this.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
    				this._gradient = null;
    				break;
    			////////////////////////////////////////////////////////
    			case 'hex':
    				switch (color.length) {
    					case 1:
    						this.applyNoColor(false);
    						return;
    						break;
    					case 2:
    						this.applyNoColor(false);
    						return;
    						break;
    					case 3:
    						color = color[0]+color[0]+color[1]+color[1]+color[2]+color[2];
    						break;
    					case 4:
    						this.applyNoColor(false);
    						return;
    						break;
    					case 5:
    						this.applyNoColor(false);
    						return;
    						break;
    					case 6:
    						//Nothing
    						break;
    					default:
    						this.applyNoColor(false);
    						return;
    						break;
    				}
    				//Checking for match of previous (HEX)
    				if (color !== this.hex) {
    					//Setting value and breaking out of function
    					this.hex = color;
    					return;
    				}
    				//Setting other color mode values
    				this._rgb = this.hexToRgb(color);
    				this._hsv = this.rgbToHsv(this.rgb.r, this.rgb.g, this.rgb.b);
    				this._hsl = this.rgbToHsl(this.rgb.r, this.rgb.g, this.rgb.b);
    				this._gradient = null;
    				break;
    			////////////////////////////////////////////////////////
    			case 'nocolor':
    				//
    				this._hex = '------';
    				this._rgb = null;
    				this._hsv = null;
    				this._hsl = null;
    				this._gradient = null;
    				break;
    			////////////////////////////////////////////////////////
    			default:
    				console.log('ERROR: An error occurred in ColorManager. '+mode+' was not identified in updateColorSelected');
    				break;
    			////////////////////////////////////////////////////////
    		}
    		//Dispatching change event
    		this._dispatchChangeEvent(mode, color);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //Dispatching "Change" event
    _dispatchChangeEvent: {
    	//Modes: rgb, hsl, hsv, hex, alpha, input, mode
        value: function(mode, value) {
        	//Creating custom event to dispatch and include values
            var colorEvent = document.createEvent("CustomEvent");
            //
            if (value && value.type) {
            	if (value.type === "change") {
            		//
            		colorEvent.initEvent("change", true, true);
    				//Storing the selected color in the history array
    				if ((mode === 'rgb' || mode === 'hsv' || mode === 'hsl' || mode === 'hex' || mode === 'nocolor' || mode === 'gradient') && this.input !== 'chip') {
		    			this._addColorHistory(this.input, mode, value, this.alpha);
		    		} else if (mode === 'alpha' && this.input !== 'chip') {
		    			var c = this.colorHistory[this.input][this.colorHistory[this.input].length-1];
		    			this._addColorHistory(this.input, c.m, c.c, this.alpha);
		    		}
            	} else if (value.type === "changing") {
            		//
            		colorEvent.initEvent("changing", true, true);
            	} else {
            		//
            		colorEvent.initEvent("error", true, true);
            	}
            } else {
            	//
            	colorEvent.initEvent("error", true, true);
            }
            //Checking for event to be color, if so, adding color data
            if (mode === 'rgb' || mode === 'hsv' || mode === 'hsl' || mode === 'hex' || mode === 'alpha' || mode === 'nocolor' || mode === 'gradient') {
            	//Returning color history of input
            	if (this.input === 'stroke') {
            		colorEvent.history = this.colorHistory.stroke;
            	} else if (this.input === 'fill') {
            		colorEvent.history = this.colorHistory.fill;
            	} else {
            		colorEvent.history = null;
            	}
            }
            //Also returning other color mode values
			if (this.input)
	            colorEvent.input = this.input;
			if (this.alpha)
	            colorEvent.alpha = this.alpha.value;
           	if (this.hsl)
           		colorEvent.hsla = {h: this.hsl.h, s: this.hsl.s, l: this.hsl.l, a: this.alpha.value, css: 'hsla('+this.hsl.h+', '+this.hsl.s+'%, '+this.hsl.l+'%, '+this.alpha.value+')'};
            if (this.rgb) {
	            colorEvent.rgba = {r: this.rgb.r, g: this.rgb.g, b: this.rgb.b, a: this.alpha.value, css: 'rgba('+ this.rgb.r +', '+this.rgb.g+', '+this.rgb.b+', '+this.alpha.value+')'};
                colorEvent.webGlColor = [this.rgb.r/255, this.rgb.g/255, this.rgb.b/255, this.alpha.value];
            }
           	if (this.hex)
	           	colorEvent.hex = this.hex;
			//Standard values that apply to any event	           
            colorEvent.value = value;
            colorEvent.mode = mode;
            if (value && value.wasSetByCode) {
            	colorEvent.wasSetByCode = value.wasSetByCode;
            }
            this.dispatchEvent(colorEvent);
        }
    },
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    // COLOR CONVERTION METHODS (public)
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    //Convert RGB to HEX (RGB = 0 to 255)
	rgbToHex: {
		enumerable: true,
		value: function (r, g, b) {
			//Coverting color channel to Hex
			function getHex (c) {
				var filter = "0123456789ABCDEF";
				c = parseInt (c, 10);
				if (isNaN(c)) return "00";
 				c = Math.max(0,Math.min(c,255));
 				return filter.charAt((c-c%16)/16) + filter.charAt(c%16);
			}
			//Returning HEX string
			return (getHex(r)+getHex(g)+getHex(b));
		}
	},
	////////////////////////////////////////////////////////////////////
    //Convert HEX to RGB (no # symbol)
	hexToRgb: {
		enumerable: true,
		value: function (value) {
			//Spliting string converting to values
			var r = parseInt(value.substring(0,2), 16), g = parseInt(value.substring(2,4), 16), b = parseInt(value.substring(4,6), 16);
			//Checking for valid values
			if (isNaN(r)) return null;
			if (isNaN(g)) return null;
			if (isNaN(b)) return null;
			return {r: r, g: g, b: b};
		}
	},
	////////////////////////////////////////////////////////////////////
    //Convert HSV to RGB (HSV = 0 to 1)
    hsvToRgb: {
    	enumerable: true,
    	value: function (h, s, v) {
    		var r, g, b, i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    		//
    		switch (i % 6){
	       		case 0: r = v, g = t, b = p; break;
		    	case 1: r = q, g = v, b = p; break;
        		case 2: r = p, g = v, b = t; break;
			    case 3: r = p, g = q, b = v; break;
	        	case 4: r = t, g = p, b = v; break;
	        	case 5: r = v, g = p, b = q; break;
   			}
   			//Returning RGB object
   			return {r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255)};
    	}
    },
    ////////////////////////////////////////////////////////////////////
	//Convert RGB to HSV (RGB = 0 to 255)
	rgbToHsv: {
		enumerable: true,
    	value: function (r, g, b) {
			//RGB covertion to percentage
    		r = r/255, g = g/255, b = b/255;
    		var max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, v, d;
    		h = s = v = max;
    		d = max - min;
  	  		s = max == 0 ? 0 : d / max;
			//TODO: Check for Hue not to change if S or V = 0
			if (max == min) {
        		h = 0;
    		} else {
        		switch (max) {
            		case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            		case g: h = (b - r) / d + 2; break;
            		case b: h = (r - g) / d + 4; break;
        		}
        		h /= 6;
    		}
			//Returing HSV object
    		return {h: h*Math.PI*2, s: s, v: v};
		}
	},
    ////////////////////////////////////////////////////////////////////
	//Convert RGB TO HSL (RGB = 0 to 255)
	rgbToHsl: {
		enumerable: true,
    	value: function (r, g, b) {
    		//RGB covertion to percentage
    		r /= 255, g /= 255, b /= 255;
    		var max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, l, d;
			h = s = l = (max + min) / 2;
			//TODO: Check for Hue not to change if S or L = 0
			if (max == min) {
        		h = s = 0;
    		} else {
        		d = max - min;
        		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        		switch (max) {
            		case r: h = (g - b) / d + (g < b ? 6 : 0); break;
 	           		case g: h = (b - r) / d + 2; break;
            		case b: h = (r - g) / d + 4; break;
        		}
        		h /= 6;
    		}
    		//Returing HSL object
    		return {h: h*360, s: s*100, l: l*100};
    	}
	},
	////////////////////////////////////////////////////////////////////
	//Convert HSL to RGB (HSL = 0 to 1)
	hslToRgb: {
		enumerable: true,
    	value: function (h, s, l) {
		 	var r, g, b;
		 	if (s == 0) {
        		r = g = b = l;
    		} else {
        		function getRgb (p, q, t) {
            		if(t < 0) t += 1;
            		if(t > 1) t -= 1;
            		if(t < 1/6) return p + (q - p) * 6 * t;
            		if(t < 1/2) return q;
            		if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            		return p;
        		}
				var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        		var p = 2 * l - q;
        		r = getRgb(p, q, h + 1/3);
        		g = getRgb(p, q, h);
        		b = getRgb(p, q, h - 1/3);
    		}
			//Returning RGB object
			return {r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255)};
    	}
	},
    ////////////////////////////////////////////////////////////////////
    //Returns WebGL color array in [r, g, b, a] format where the values are [0,1] given a color object
    colorToWebGl: {
        enumerable: true,
        value: function (color) {
            var temp;
            if (color) {
                if(color.l !== undefined) {
                    temp = this.hslToRgb(color.h/360, color.s/100, color.l/100);
                } else if (color.r !== undefined) {
                    temp = color;
                } else if (color.gradientMode) {
                    // TODO - Need to handle gradients at some point
                    return null;
                }
                temp.a = color.a;
            }
            //WebGL uses array
            if (temp) {
                return [temp.r/255, temp.g/255, temp.b/255, temp.a];
            } else {
                return null;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Returns a color object given a WebGL color array/object with gradient stops
    webGlToColor: {
        enumerable: true,
        value: function (c) {
            if(c) {
                if(c.gradientMode) {
                    // Gradient
                    var i = 0,
                        len,
                        css,
                        stops = c.color,
                        gradient;

                    // Create the CSS string
                    if (c.gradientMode === 'radial') {
                        css = '-webkit-radial-gradient(center, ellipse cover';
                    } else {
                        css = '-webkit-gradient(linear, left top, right top';
                    }

                    //Sorting array (must be sorted for radial gradients, at least in Chrome
                    stops.sort(function(a,b){return a.position - b.position});
                    //Looping through stops in gradient to create CSS

                    len = stops.length;
                    for (i=0; i < len; i++) {
                        //Adding to CSS String
                        if (c.gradientMode === 'radial' && stops[i].value) {
                            css += ', '+stops[i].value.css+' '+stops[i].position+'% ';
                        } else if (stops[i].value){
                            css += ', color-stop('+stops[i].position+'%,'+stops[i].value.css+')';
                        }
                    }
                    //Closing the CSS strings
                    css += ')';

                    gradient = {stops: c.color, mode: c.gradientMode, gradientMode: c.gradientMode, css: css};
                    return {mode: 'gradient', value: gradient, color: gradient};
                } else if(c.length === 4) {
                    // CSS
                    return this.application.ninja.colorController.getColorObjFromCss('rgba(' + c[0]*255 + ', '
                                                                                             + c[1]*255 + ', '
                                                                                             + c[2]*255 + ', '
                                                                                             + c[3] +')');
                }
            }

            return null;
        }
    }
	////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////
});
