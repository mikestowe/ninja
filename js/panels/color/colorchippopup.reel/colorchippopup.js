/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 			require("montage/core/core").Montage,
	Component = 		require("montage/ui/component").Component,
	Slider = 			require("js/components/slider.reel").Slider,
	HotText = 			require("js/components/hottext.reel").HotText,
	ColorWheel = 		require("js/components/colorwheel.reel").ColorWheel,
	GradientPicker = 	require("js/components/gradientpicker.reel").GradientPicker;
////////////////////////////////////////////////////////////////////////
//Exporting as ColorPanelPopup
exports.ColorChipPopup = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
        value: true
    },
    ////////////////////////////////////////////////////////////////////
    //Storing color manager
    _colorManager: {
        enumerable: false,
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //Color manager
    colorManager: {
    	enumerable: true,
        get: function() {
            return this._colorManager;
        },
        set: function(value) {
        	if (value !== this._colorManager) {
        		this._colorManager = value;
        	}
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    setNoColor: {
    	enumerable: true,
    	value: function (code) {
    		this.colorManager.applyNoColor(code);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _colorChipWheel: {
    	enumerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    popupContainers: {
    	enumerable: true,
    	value: {wheel: null, palette: null, gradient: null, image: null}
    },
   	////////////////////////////////////////////////////////////////////
    //
    popupModes: {
    	enumerable: true,
    	value: {wheel: true, palette: true, gradient: true, image: true, nocolor: true}
    },
    ////////////////////////////////////////////////////////////////////
    //
    hexInput: {
    	enumerable: true,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    prepareForDraw: {
    	enumerable: false,
    	value: function () {
    		//Storing containers for reference
    		this.popupContainers.wheel = document.getElementById('cc_pu_wheel_container');
    		this.popupContainers.palette = document.getElementById("cc_pu_palette_container");
    		this.popupContainers.gradient = document.getElementById("cc_pu_gradient_container");
    		this.popupContainers.image = document.getElementById("cc_pu_image_container");
    		this.popupContainers.alpha = document.getElementById("cc_pu_alpha");
    		//
    		
    		this.colorManager.addEventListener('change', function (e) {
    			//
    		}.bind(this));
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
    		this.combo = {};
    		this.combo.slider = Slider.create();
	   		this.combo.hottext = HotText.create();
    		this.combo.slider.element = document.getElementById('cc_pu_a_slider');
   			this.combo.hottext.element = document.getElementById('cc_pu_a_hottext');
   			//
   			this.cc_hexinput = HotText.create();
   			this.cc_hexinput.element = document.getElementById('cc_pu_hottext_hex');
   			this.cc_hexinput.labelFunction = this._hexLabel.bind(this);
    		this.cc_hexinput.inputFunction = this._hexInput.bind(this);
   			//
   			if (this.application.ninja.colorController.colorView.currentChip && this.application.ninja.colorController.colorView.currentChip.colorValue && this.application.ninja.colorController.colorView.currentChip.colorValue.a) {
   				this.combo.slider.value = Math.round(this.application.ninja.colorController.colorView.currentChip.colorValue.a*100);
   			} else {
   				this.combo.slider.value = 100;
   			}
   			this.application.ninja.colorController.colorModel._alpha = {value: this.combo.slider.value/100, wasSetByCode: true, type: 'change'};
   			//
    		Object.defineBinding(this.combo.hottext, "value", {
   				boundObject: this.combo.slider,
       		    boundObjectPropertyPath: "value",
       		    oneway: false,
               	boundValueMutator: function(value) {
                   	return Math.round(value);
                }
   			});
	       	//
	       	this.combo.slider.maxValue = this.combo.hottext.maxValue = 100;
    		this.combo.slider.customBackground = this.application.ninja.colorController.colorView._slider3Background.bind(this.application.ninja.colorController.colorView);
    		//
   			this.combo.slider.addEventListener('change', this.alphaChange.bind(this));
   			this.combo.hottext.addEventListener('change', this.alphaChange.bind(this));
   			//
   			this._colorChipWheel = ColorWheel.create();
		    this._colorChipWheel.element = this.popupContainers.wheel;
	        this._colorChipWheel.element.style.display = 'block';
	        this._colorChipWheel.rimWidth = 14;
		    this._colorChipWheel.strokeWidth = 2;
		    //
	        this._colorChipWheel.addEventListener('firstDraw', this, false);
		    this._colorChipWheel.addEventListener('change', this, false);
		    this._colorChipWheel.addEventListener('changing', this, false);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    draw: {
    	enumerable: false,
    	value: function() {
    		//
    		this.drawPalette(this.defaultPalette);
    		//
    		//this.cc_hexinput = this.application.ninja.colorController.colorView.addButton('hexinput', document.getElementById('cc_pu_hottext_hex'));
	       	//
	       	this.combo.slider.needsDraw = true;
	       	this.combo.hottext.needsDraw = true;
	       	this.cc_hexinput.needsDraw = true;
    		//
    		var ncButton = document.getElementById('cc_pu_nocolor'),
    			plButton = document.getElementById('cc_pu_palettes'),
    			wlButton = document.getElementById('cc_pu_wheel'),
    			gdButton = document.getElementById('cc_pu_gradients'),
    			imButton = document.getElementById('cc_pu_images');
   			//
   			if (this.popupModes.nocolor) {
   				ncButton.addEventListener('click', function () {
   					this.setNoColor();
	    		}.bind(this));
    		} else {
    			ncButton.style.display = 'none';
    		}
    		//
    		if (this.popupModes.palette) {
    			plButton.addEventListener('click', function () {
   					this.popupSwitchInputTo(this.popupContainers.palette);
    			}.bind(this));
    		} else {
    			plButton.style.display = 'none';
    		}
    		//
    		if (this.popupModes.wheel) {
	    		wlButton.addEventListener('click', function () {
   					this.popupSwitchInputTo(this.popupContainers.wheel);
    			}.bind(this));
    		} else {
    			wlButton.style.display = 'none';
    		}
    		//
    		if (this.popupModes.gradient) {
    			gdButton.addEventListener('click', function () {
   					this.popupSwitchInputTo(this.popupContainers.gradient);
	    		}.bind(this));
    		} else {
    			gdButton.style.display = 'none';
    		}
    		//
    		if (this.popupModes.image) {
    			imButton.style.opacity = .2;//TODO: Remove, visual feedback for disable button
    			imButton.addEventListener('click', function () {
   					//this.popupSwitchInputTo(this.popupContainers.image);
	    		}.bind(this));
    		} else {
    			imButton.style.display = 'none';
    		}
    		//
    		this.element.style.opacity = 1;
    		//
    		this._colorChipWheel.needsDraw = true;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    didDraw: {
    	enumerable: false,
    	value: function() {
    		//
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    popupSwitchInputTo: {
    	enumerable: true,
    	value: function (tab) {
    		//
    		if (tab !== this.popupContainers.palette) {
    			this.popupContainers.palette.style.display = 'none';
    		} else {
    			this.popupContainers.palette.style.display = 'block';
    			this.popupContainers.alpha.style.display = 'block';
    			//
    			this.application.ninja.colorController.popupTab = 'palette';
    		}
    		//
    		if (tab !== this.popupContainers.wheel && this._colorChipWheel.element) {
    			this._colorChipWheel.element.style.display = 'none';
    		} else if (this._colorChipWheel.element && this._colorChipWheel.element.style.display !== 'block'){
    			this._colorChipWheel.element.style.display = 'block';
    			this.popupContainers.alpha.style.display = 'block';
    			//
    			this.application.ninja.colorController.popupTab = 'wheel';
    		}
    		//
    		if (tab !== this.popupContainers.image) {
    			this.popupContainers.image.style.display = 'none';
    		} else {
    			this.popupContainers.image.style.display = 'block';
    			this.popupContainers.alpha.style.display = 'block';
    			//
    			this.application.ninja.colorController.popupTab = 'image';
    		}
    		//
    		if (tab !== this.popupContainers.gradient) {
    			this.popupContainers.gradient.style.display = 'none';
    		} else {
    			this.popupContainers.gradient.style.display = 'block';
    			//TODO: Add fixed size to avoid jump
    			//this.popupContainers.alpha.style.display = 'none';
    			//
    			this.application.ninja.colorController.popupTab = 'gradient';
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    drawPalette: {
    	enumerable: true,
    	value: function (c) {
    		var i, button;
    		//
    		this.popupContainers.palette.style.display = 'block';
    		//
    		for (i in c) {
    			button = document.createElement('button');
    			button.style.background = c[i].css;
    			button.title = c[i].css.toUpperCase();
    			button.colorMode = c[i].mode;
    			button.colorValue = c[i].value;
    			this.popupContainers.palette.appendChild(button);
    			button.addEventListener('click', function (b) {
    				var rgb, color, hex;
    				//
    				if (b._event.srcElement.colorMode !== 'hex') {
    					//TODO: Add logic to update hex input field for non-hex values
    					color = b._event.srcElement.colorValue;
	    				color.wasSetByCode = false;
    					color.type = 'change';
    					this.colorManager[b._event.srcElement.colorMode] = color;
    				} else {
    					if (this.colorManager.mode === 'hsl') {
    						rgb = this.colorManager.hexToRgb(b._event.srcElement.colorValue);
    						if (rgb) {
			    				color = this.colorManager.rgbToHsl(rgb.r, rgb.g, rgb.b);
    							color.wasSetByCode = false;
			    				color.type = 'change';
    							//
    							hex = b._event.srcElement.colorValue;
    							if (this.popupModes.wheel) {
    								this._colorChipWheel.value = this.colorManager.rgbToHsv(color.r, color.g, color.b);
			    				} else {
			    					this.colorManager.hsl = color;
			    				}
    						} else {
			    				this.setNoColor();
			    				hex = '------';
    						}
			    		} else {
    						color = this.colorManager.hexToRgb(b._event.srcElement.colorValue);
			    			if (color) {
    							color.wasSetByCode = false;
    							color.type = 'change';
			    				//
			    				hex = b._event.srcElement.colorValue;
			    				if (this.popupModes.wheel) {
    								this._colorChipWheel.value = this.colorManager.rgbToHsv(color.r, color.g, color.b);
			    				} else {
			    					this.colorManager.rgb = color;
			    				}
    						} else {
    							this.setNoColor();
    							hex = '------';
			    			}
    					}
    				}
    				if (hex) {
    					this._hexString = hex;
    					this.updateHex();
    				}
    			}.bind(this));
    		}
    		this.popupContainers.palette.style.display = 'none';
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _hexLabel: {
    	enumerable: false,
    	value: function (v) {
    		return this._hexString;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _hexString: {
    	enumerable: false,
    	value: '000000'
    },
    ////////////////////////////////////////////////////////////////////
    //
    updateHex: {
    	value: function (e) {
    		//
    		this.cc_hexinput._valueSyncedWithInputField = false;
			this.cc_hexinput.needsDraw = true;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _hexInput: {
    	enumerable: false,
    	value: function (color) {
    		//If invalid input, no color will be applied
    		var update, rgb, hex;
    		//Allowing multiple hex mode inputs (3 and 6 characters)
    		switch (color.length) {
    			case 3:
    				color = color[0]+color[0]+color[1]+color[1]+color[2]+color[2];
    				break;
    			case 6:
    				//Nothing
    				break;
    			default:
    				//this._colorManager.applyNoColor();
    				return;
    				break;
    		}
    		//Checking for panel mode and converting the color to the panel mode
    		if (this.colorManager.mode === 'hsl') {
    			rgb = this.colorManager.hexToRgb(color);
    			if (rgb) {
    				update = this.colorManager.rgbToHsl(rgb.r, rgb.g, rgb.b);
    				update.wasSetByCode = false;
    				update.type = 'change';
    				//
    				hex = color;
    				//
    				if (this.popupModes.wheel) {
    					this._colorChipWheel.value = this.colorManager.rgbToHsv(update.r, update.g, update.b);
    				} else {
    					this.colorManager.hsl = update;
    				}
    			} else {
    				//this.colorManager.applyNoColor();
    				hex = '------';
    			}
    		} else {
    			update = this.colorManager.hexToRgb(color);
    			if (update) {
    				update.wasSetByCode = false;
    				update.type = 'change';
    				//
    				hex = color;
    				//
    				if (this.popupModes.wheel) {
		    			this._colorChipWheel.value = this.colorManager.rgbToHsv(update.r, update.g, update.b);
    				} else {
    					this.colorManager.rgb = update;
    				}
    			} else {
    				//this.colorManager.applyNoColor();
    				hex = '------';
    			}
    		}
    		//
    		if (hex) {
	    		this._hexString = hex;
    			this.updateHex();
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    defaultPalette: {
    	enumerable: true,
    	value: [{mode: 'hex', value: '000000', css: '#000000'}, {mode: 'hex', value: '808080', css: '#808080'}, {mode: 'hex', value: '000000', css: '#000000'}, {mode: 'hex', value: '003300', css: '#003300'}, {mode: 'hex', value: '006600', css: '#006600'}, {mode: 'hex', value: '009900', css: '#009900'}, {mode: 'hex', value: '00cc00', css: '#00cc00'}, {mode: 'hex', value: '00ff00', css: '#00ff00'}, {mode: 'hex', value: '330000', css: '#330000'}, {mode: 'hex', value: '333300', css: '#333300'}, {mode: 'hex', value: '336600', css: '#336600'}, {mode: 'hex', value: '339900', css: '#339900'}, {mode: 'hex', value: '33cc00', css: '#33cc00'}, {mode: 'hex', value: '33ff00', css: '#33ff00'}, {mode: 'hex', value: '660000', css: '#660000'}, {mode: 'hex', value: '663300', css: '#663300'}, {mode: 'hex', value: '666600', css: '#666600'}, {mode: 'hex', value: '669900', css: '#669900'}, {mode: 'hex', value: '66cc00', css: '#66cc00'}, {mode: 'hex', value: '66ff00', css: '#66ff00'},
    			{mode: 'hex', value: '333333', css: '#333333'}, {mode: 'hex', value: '808080', css: '#808080'}, {mode: 'hex', value: '000033', css: '#000033'}, {mode: 'hex', value: '003333', css: '#003333'}, {mode: 'hex', value: '006633', css: '#006633'}, {mode: 'hex', value: '009933', css: '#009933'}, {mode: 'hex', value: '00cc33', css: '#00cc33'}, {mode: 'hex', value: '00ff33', css: '#00ff33'}, {mode: 'hex', value: '330033', css: '#330033'}, {mode: 'hex', value: '333333', css: '#333333'}, {mode: 'hex', value: '336633', css: '#336633'}, {mode: 'hex', value: '339933', css: '#339933'}, {mode: 'hex', value: '33cc33', css: '#33cc33'}, {mode: 'hex', value: '33ff33', css: '#33ff33'}, {mode: 'hex', value: '660033', css: '#660033'}, {mode: 'hex', value: '663333', css: '#663333'}, {mode: 'hex', value: '666633', css: '#666633'}, {mode: 'hex', value: '669933', css: '#669933'}, {mode: 'hex', value: '66cc33', css: '#66cc33'}, {mode: 'hex', value: '66ff33', css: '#66ff33'},
    			{mode: 'hex', value: '666666', css: '#666666'}, {mode: 'hex', value: '808080', css: '#808080'}, {mode: 'hex', value: '000066', css: '#000066'}, {mode: 'hex', value: '003366', css: '#003366'}, {mode: 'hex', value: '006666', css: '#006666'}, {mode: 'hex', value: '009966', css: '#009966'}, {mode: 'hex', value: '00cc66', css: '#00cc66'}, {mode: 'hex', value: '00ff66', css: '#00ff66'}, {mode: 'hex', value: '330066', css: '#330066'}, {mode: 'hex', value: '333366', css: '#333366'}, {mode: 'hex', value: '336666', css: '#336666'}, {mode: 'hex', value: '339966', css: '#339966'}, {mode: 'hex', value: '33cc66', css: '#33cc66'}, {mode: 'hex', value: '33ff66', css: '#33ff66'}, {mode: 'hex', value: '660066', css: '#660066'}, {mode: 'hex', value: '663366', css: '#663366'}, {mode: 'hex', value: '666666', css: '#666666'}, {mode: 'hex', value: '669966', css: '#669966'}, {mode: 'hex', value: '66cc66', css: '#66cc66'}, {mode: 'hex', value: '66ff66', css: '#66ff66'},
    			{mode: 'hex', value: '999999', css: '#999999'}, {mode: 'hex', value: '808080', css: '#808080'}, {mode: 'hex', value: '000099', css: '#000099'}, {mode: 'hex', value: '003399', css: '#003399'}, {mode: 'hex', value: '006699', css: '#006699'}, {mode: 'hex', value: '009999', css: '#009999'}, {mode: 'hex', value: '00cc99', css: '#00cc99'}, {mode: 'hex', value: '00ff99', css: '#00ff99'}, {mode: 'hex', value: '330099', css: '#330099'}, {mode: 'hex', value: '333399', css: '#333399'}, {mode: 'hex', value: '336699', css: '#336699'}, {mode: 'hex', value: '339999', css: '#339999'}, {mode: 'hex', value: '33cc99', css: '#33cc99'}, {mode: 'hex', value: '33ff99', css: '#33ff99'}, {mode: 'hex', value: '660099', css: '#660099'}, {mode: 'hex', value: '663399', css: '#663399'}, {mode: 'hex', value: '666699', css: '#666699'}, {mode: 'hex', value: '669999', css: '#669999'}, {mode: 'hex', value: '66cc99', css: '#66cc99'}, {mode: 'hex', value: '66ff99', css: '#66ff99'},
    			{mode: 'hex', value: 'cccccc', css: '#cccccc'}, {mode: 'hex', value: '808080', css: '#808080'}, {mode: 'hex', value: '0000cc', css: '#0000cc'}, {mode: 'hex', value: '0033cc', css: '#0033cc'}, {mode: 'hex', value: '0066cc', css: '#0066cc'}, {mode: 'hex', value: '0099cc', css: '#0099cc'}, {mode: 'hex', value: '00cccc', css: '#00cccc'}, {mode: 'hex', value: '00ffcc', css: '#00ffcc'}, {mode: 'hex', value: '3300cc', css: '#3300cc'}, {mode: 'hex', value: '3333cc', css: '#3333cc'}, {mode: 'hex', value: '3366cc', css: '#3366cc'}, {mode: 'hex', value: '3399cc', css: '#3399cc'}, {mode: 'hex', value: '33cccc', css: '#33cccc'}, {mode: 'hex', value: '33ffcc', css: '#33ffcc'}, {mode: 'hex', value: '6600cc', css: '#6600cc'}, {mode: 'hex', value: '6633cc', css: '#6633cc'}, {mode: 'hex', value: '6666cc', css: '#6666cc'}, {mode: 'hex', value: '6699cc', css: '#6699cc'}, {mode: 'hex', value: '66cccc', css: '#66cccc'}, {mode: 'hex', value: '66ffcc', css: '#66ffcc'},
    			{mode: 'hex', value: 'ffffff', css: '#ffffff'}, {mode: 'hex', value: '808080', css: '#808080'}, {mode: 'hex', value: '0000ff', css: '#0000ff'}, {mode: 'hex', value: '0033ff', css: '#0033ff'}, {mode: 'hex', value: '0066ff', css: '#0066ff'}, {mode: 'hex', value: '0099ff', css: '#0099ff'}, {mode: 'hex', value: '00ccff', css: '#00ccff'}, {mode: 'hex', value: '00ffff', css: '#00ffff'}, {mode: 'hex', value: '3300ff', css: '#3300ff'}, {mode: 'hex', value: '3333ff', css: '#3333ff'}, {mode: 'hex', value: '3366ff', css: '#3366ff'}, {mode: 'hex', value: '3399ff', css: '#3399ff'}, {mode: 'hex', value: '33ccff', css: '#33ccff'}, {mode: 'hex', value: '33ffff', css: '#33ffff'}, {mode: 'hex', value: '6600ff', css: '#6600ff'}, {mode: 'hex', value: '6633ff', css: '#6633ff'}, {mode: 'hex', value: '6666ff', css: '#6666ff'}, {mode: 'hex', value: '6699ff', css: '#6699ff'}, {mode: 'hex', value: '66ccff', css: '#66ccff'}, {mode: 'hex', value: '66ffff', css: '#66ffff'},
    			{mode: 'hex', value: 'ff0000', css: '#ff0000'}, {mode: 'hex', value: '808080', css: '#808080'}, {mode: 'hex', value: '990000', css: '#990000'}, {mode: 'hex', value: '993300', css: '#993300'}, {mode: 'hex', value: '996600', css: '#996600'}, {mode: 'hex', value: '999900', css: '#999900'}, {mode: 'hex', value: '99cc00', css: '#99cc00'}, {mode: 'hex', value: '99ff00', css: '#99ff00'}, {mode: 'hex', value: 'cc0000', css: '#cc0000'}, {mode: 'hex', value: 'cc3300', css: '#cc3300'}, {mode: 'hex', value: 'cc6600', css: '#cc6600'}, {mode: 'hex', value: 'cc9900', css: '#cc9900'}, {mode: 'hex', value: 'cccc00', css: '#cccc00'}, {mode: 'hex', value: 'ccff00', css: '#ccff00'}, {mode: 'hex', value: 'ff0000', css: '#ff0000'}, {mode: 'hex', value: 'ff3300', css: '#ff3300'}, {mode: 'hex', value: 'ff6600', css: '#ff6600'}, {mode: 'hex', value: 'ff9900', css: '#ff9900'}, {mode: 'hex', value: 'ffcc00', css: '#ffcc00'}, {mode: 'hex', value: 'ffff00', css: '#ffff00'},
    			{mode: 'hex', value: '00ff00', css: '#00ff00'}, {mode: 'hex', value: '808080', css: '#808080'}, {mode: 'hex', value: '990033', css: '#990033'}, {mode: 'hex', value: '993333', css: '#993333'}, {mode: 'hex', value: '996633', css: '#996633'}, {mode: 'hex', value: '999933', css: '#999933'}, {mode: 'hex', value: '99cc33', css: '#99cc33'}, {mode: 'hex', value: '99ff33', css: '#99ff33'}, {mode: 'hex', value: 'cc0033', css: '#cc0033'}, {mode: 'hex', value: 'cc3333', css: '#cc3333'}, {mode: 'hex', value: 'cc6633', css: '#cc6633'}, {mode: 'hex', value: 'cc9933', css: '#cc9933'}, {mode: 'hex', value: 'cccc33', css: '#cccc33'}, {mode: 'hex', value: 'ccff33', css: '#ccff33'}, {mode: 'hex', value: 'ff0033', css: '#ff0033'}, {mode: 'hex', value: 'ff3333', css: '#ff3333'}, {mode: 'hex', value: 'ff6633', css: '#ff6633'}, {mode: 'hex', value: 'ff9933', css: '#ff9933'}, {mode: 'hex', value: 'ffcc33', css: '#ffcc33'}, {mode: 'hex', value: 'ffff33', css: '#ffff33'},
    			{mode: 'hex', value: '0000ff', css: '#0000ff'}, {mode: 'hex', value: '808080', css: '#808080'}, {mode: 'hex', value: '990066', css: '#990066'}, {mode: 'hex', value: '993366', css: '#993366'}, {mode: 'hex', value: '996666', css: '#996666'}, {mode: 'hex', value: '999966', css: '#999966'}, {mode: 'hex', value: '99cc66', css: '#99cc66'}, {mode: 'hex', value: '99ff66', css: '#99ff66'}, {mode: 'hex', value: 'cc0066', css: '#cc0066'}, {mode: 'hex', value: 'cc3366', css: '#cc3366'}, {mode: 'hex', value: 'cc6666', css: '#cc6666'}, {mode: 'hex', value: 'cc9966', css: '#cc9966'}, {mode: 'hex', value: 'cccc66', css: '#cccc66'}, {mode: 'hex', value: 'ccff66', css: '#ccff66'}, {mode: 'hex', value: 'ff0066', css: '#ff0066'}, {mode: 'hex', value: 'ff3366', css: '#ff3366'}, {mode: 'hex', value: 'ff6666', css: '#ff6666'}, {mode: 'hex', value: 'ff9966', css: '#ff9966'}, {mode: 'hex', value: 'ffcc66', css: '#ffcc66'}, {mode: 'hex', value: 'ffff66', css: '#ffff66'},
    			{mode: 'hex', value: 'ffff00', css: '#ffff00'}, {mode: 'hex', value: '808080', css: '#808080'}, {mode: 'hex', value: '990099', css: '#990099'}, {mode: 'hex', value: '993399', css: '#993399'}, {mode: 'hex', value: '996699', css: '#996699'}, {mode: 'hex', value: '999999', css: '#999999'}, {mode: 'hex', value: '99cc99', css: '#99cc99'}, {mode: 'hex', value: '99ff99', css: '#99ff99'}, {mode: 'hex', value: 'cc0099', css: '#cc0099'}, {mode: 'hex', value: 'cc3399', css: '#cc3399'}, {mode: 'hex', value: 'cc6699', css: '#cc6699'}, {mode: 'hex', value: 'cc9999', css: '#cc9999'}, {mode: 'hex', value: 'cccc99', css: '#cccc99'}, {mode: 'hex', value: 'ccff99', css: '#ccff99'}, {mode: 'hex', value: 'ff0099', css: '#ff0099'}, {mode: 'hex', value: 'ff3399', css: '#ff3399'}, {mode: 'hex', value: 'ff6699', css: '#ff6699'}, {mode: 'hex', value: 'ff9999', css: '#ff9999'}, {mode: 'hex', value: 'ffcc99', css: '#ffcc99'}, {mode: 'hex', value: 'ffff99', css: '#ffff99'},
    			{mode: 'hex', value: '00ffff', css: '#00ffff'}, {mode: 'hex', value: '808080', css: '#808080'}, {mode: 'hex', value: '9900cc', css: '#9900cc'}, {mode: 'hex', value: '9933cc', css: '#9933cc'}, {mode: 'hex', value: '9966cc', css: '#9966cc'}, {mode: 'hex', value: '9999cc', css: '#9999cc'}, {mode: 'hex', value: '99cccc', css: '#99cccc'}, {mode: 'hex', value: '99ffcc', css: '#99ffcc'}, {mode: 'hex', value: 'cc00cc', css: '#cc00cc'}, {mode: 'hex', value: 'cc33cc', css: '#cc33cc'}, {mode: 'hex', value: 'cc66cc', css: '#cc66cc'}, {mode: 'hex', value: 'cc99cc', css: '#cc99cc'}, {mode: 'hex', value: 'cccccc', css: '#cccccc'}, {mode: 'hex', value: 'ccffcc', css: '#ccffcc'}, {mode: 'hex', value: 'ff00cc', css: '#ff00cc'}, {mode: 'hex', value: 'ff33cc', css: '#ff33cc'}, {mode: 'hex', value: 'ff66cc', css: '#ff66cc'}, {mode: 'hex', value: 'ff99cc', css: '#ff99cc'}, {mode: 'hex', value: 'ffcccc', css: '#ffcccc'}, {mode: 'hex', value: 'ffffcc', css: '#ffffcc'},
    			{mode: 'hex', value: 'ff00ff', css: '#ff00ff'}, {mode: 'hex', value: '808080', css: '#808080'}, {mode: 'hex', value: '9900ff', css: '#9900ff'}, {mode: 'hex', value: '9933ff', css: '#9933ff'}, {mode: 'hex', value: '9966ff', css: '#9966ff'}, {mode: 'hex', value: '9999ff', css: '#9999ff'}, {mode: 'hex', value: '99ccff', css: '#99ccff'}, {mode: 'hex', value: '99ffff', css: '#99ffff'}, {mode: 'hex', value: 'cc00ff', css: '#cc00ff'}, {mode: 'hex', value: 'cc33ff', css: '#cc33ff'}, {mode: 'hex', value: 'cc66ff', css: '#cc66ff'}, {mode: 'hex', value: 'cc99ff', css: '#cc99ff'}, {mode: 'hex', value: 'ccccff', css: '#ccccff'}, {mode: 'hex', value: 'ccffff', css: '#ccffff'}, {mode: 'hex', value: 'ff00ff', css: '#ff00ff'}, {mode: 'hex', value: 'ff33ff', css: '#ff33ff'}, {mode: 'hex', value: 'ff66ff', css: '#ff66ff'}, {mode: 'hex', value: 'ff99ff', css: '#ff99ff'}, {mode: 'hex', value: 'ffccff', css: '#ffccff'}, {mode: 'hex', value: 'ffffff', css: '#ffffff'}]
    },
    ////////////////////////////////////////////////////////////////////
    //
    drawGradient: {
    	enumerable: true,
    	value: function (g) {
    		//
    	}
    },
     ////////////////////////////////////////////////////////////////////
    //
    defaultGradient: {
    	enumerable: true,
    	value: []
    },
    ////////////////////////////////////////////////////////////////////
    //
    alphaChange: {
    	enumerable: false,
    	value: function (e) {
	    	if (!e._event.wasSetByCode) {
    			var update = {value: this.combo.slider.value/100, wasSetByCode: false, type: 'change'};
    			this.colorManager.alpha = update;
    			//TODO: Remove, temp fix
    			if (this.application.ninja.colorController.colorView.currentChip.colorValue && this.application.ninja.colorController.colorView.currentChip.colorValue.r) {
    				this.application.ninja.colorController.colorView.currentChip.colorValue.a = this.combo.slider.value/100;
    				this.application.ninja.colorController.colorView.currentChip.colorValue.wasSetByCode = false;
    				this.application.ninja.colorController.colorView.currentChip.colorValue.type = 'change';
    				this.colorManager.rgb = this.application.ninja.colorController.colorView.currentChip.colorValue;
    			}
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //Reworking logic, firstDraw bubbles up, so target must be checked
    handleFirstDraw: {
    	enumerable: false,
    	value: function (e) {
    		//
    		var modeSet = false;
    		//
    		if (this._colorChipWheel) {
	    		//Only using it for one instance, no need to check target
    			this._colorChipWheel.removeEventListener('firstDraw', this, false);
    		}
    		//
    		switch (this.application.ninja.colorController.popupTab) {
	   			case 'wheel':
    				if (this.popupModes.wheel) {
    					this.popupSwitchInputTo(this.popupContainers.wheel);
    					modeSet = true;
   					}
   					break;
	   			case 'palette':
   					if (this.popupModes.palette) {
    					this.popupSwitchInputTo(this.popupContainers.palette);
    					modeSet = true;
    				}
    				break;
	    		case 'image':
    				if (this.popupModes.image) {
    					this.popupSwitchInputTo(this.popupContainers.image);
    					modeSet = true;
    				}
   					break;
	    		default:
    				if (this.popupModes.wheel) {
    					this.popupSwitchInputTo(this.popupContainers.wheel);
   						modeSet = true;
   					}
   					break;
   			}
    		//
	   		if (!modeSet) {
   				if (this.popupModes.wheel) {
   					this.popupSwitchInputTo(this.popupContainers.wheel);
   				} else if (this.popupModes.palette) {
    				this.popupSwitchInputTo(this.popupContainers.palette);
	    		} else if (this.popupModes.gradient) {
    				this.popupSwitchInputTo(this.popupContainers.gradient);
   				} else if (this.popupModes.gradient) {
    				this.popupSwitchInputTo(this.popupContainers.image);
   				} else {
   					console.log("Error: No mode is available in the color popup!");
   				}
    		}
    		//Checking for a gradient to be current color
    		if (this.colorManager.gradient && this.popupModes.gradient) {
    			if (this.colorManager.colorHistory[this.colorManager.input] && this.colorManager.colorHistory[this.colorManager.input][this.colorManager.colorHistory[this.colorManager.input].length-1].m !== 'gradient') {
    				//If no gradient set, using default
    				this.drawGradient(this.defaultGradient);
    			} else {
    				//Gradient has been set, so opening gradient tab with gradient
	   				this.drawGradient(this.colorManager.gradient);
   					//this.popupSwitchInputTo(this.popupContainers.gradient);
   				}
    		} else {
    			
    		}
    		//Displaying element once it's been drawn
	   		this.element.style.opacity = 1;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleChange: {
    	enumerable: false,
    	value: function (e) {
    		//
    		if (e._event.hsv) {
    			var temp;
	    		this.colorManager.hsv = {h: e._event.hsv.h, s: e._event.hsv.s, v: e._event.hsv.v, wasSetByCode: true, type: 'change'};
	    		temp = this.colorManager.hsvToRgb(e._event.hsv.h, e._event.hsv.s, e._event.hsv.v);
	    		this._hexString = this.colorManager.rgbToHex(temp.r, temp.g, temp.b);
	    		this.updateHex();
	    	}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleChanging: {
    	enumerable: false,
    	value: function (e) {
    		//
    		this.dispatchEvent(e._event);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _handleWheelEvent: {
    	enumerable: false,
    	value: function (e) {
    		if (!e._event.wasSetByCode) {
    			//
    			this.dispatchEvent(e);
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    //Garbage collection (Manual method)
    destroy: {
    	enumerable: false,
    	value: function() {
    		//
    		/* this.application.ninja.colorController.colorView.removeButton('hexinput', document.getElementById('cc_pu_hottext_hex')); */
    		Object.deleteBinding(this.combo.hottext, "value");
    		this._colorChipWheel = null;
    	}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////