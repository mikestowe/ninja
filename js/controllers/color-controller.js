/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */
 
////////////////////////////////////////////////////////////////////////
//
var Montage =           	require("montage/core/core").Montage,
    Component =         	require("montage/ui/component").Component,
    ColorModel =        	require("js/models/color-model").ColorModel,
    ColorToolbar =      	require("js/panels/Color/colortoolbar.reel").ColorToolbar,
    ColorPanelBase =    	require("js/panels/Color/colorpanelbase.reel").ColorPanelBase,
    ElementsMediator =  	require("js/mediators/element-mediator").ElementMediator,
    ColorPopupManager =		require("js/panels/Color/colorpopup-manager").ColorPopupManager,
    ColorButtonManager =	require("js/panels/Color/colorbutton-manager").ColorButtonManager;
////////////////////////////////////////////////////////////////////////
//Exporting as ColorController
exports.ColorController = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //
    hasTemplate: {
        enumerable: true,
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    deserializedFromTemplate: {
    	enumerable: true,
    	value: function () {
    		//Setting up colorManager in other classes
    		this.colorPanelBase.colorManager = this.colorModel;
    		this.colorPopupManager.colorManager = this.colorModel;
    		this.colorButtonManager.colorManager = this.colorModel;
    		//Listening for color changes
    		this.colorModel.addEventListener('change', this, false);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorModel: {
        enumerable: true,
        value: ColorModel
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorPanelBase: {
        enumerable: true,
        value: ColorPanelBase
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorPopupManager: {
        enumerable: true,
        value: ColorPopupManager
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorButtonManager: {
        enumerable: true,
        value: ColorPopupManager
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorView: {
        enumerable: true,
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorToolbar: {
        enumerable: true,
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _popupTab: {
    	enumerable: false,
    	value: 'wheel'
    },
    ////////////////////////////////////////////////////////////////////
    //
    popupTab: {
    	enumerable: true,
        get: function() {
            return this._popupTab;
        },
        set: function(value) {
        	this._popupTab = value.toLowerCase();
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    addButton: {
        enumerable: true,
        value: function (type, button) {
            if (this.colorView) {
                this.colorView.addButton(type, button);
                return true;
            } else if (this.ColorPanelBase) {
                this.ColorPanelBase.addButton(type, button);
                return true;
            } else {
                return false;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    removeButton: {
        enumerable: true,
        value: function (type, button) {
            if (this.colorView) {
                this.colorView.removeButton(type, button);
                return true;
            } else if (this.ColorPanelBase) {
                this.ColorPanelBase.removeButton(type, button);
                return true;
            } else {
                return false;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _fill: {
    	enumerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
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
    //
    _stroke: {
    	enumerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
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
    //
    getBackground: {
        enumerable: true,
        value: function (element) {
        	//TODO: Return object with all background properties
        	console.log(ElementsMediator.getProperty(element, 'background-color'));
        	console.log(ElementsMediator.getProperty(element, 'background-image'));
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    getBorder: {
        enumerable: true,
        value: function (element) {
        	
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    setBackground: {
        enumerable: true,
        value: function (type, background, selection) {
            //TODO: Remove hack
            var elements, i, hack = [], hackNone = [];
            //The selection is optional, if none, it asks for the currently selected elements
            if (selection) {
                elements = selection;
            } else {
                elements = this.application.ninja.selectedElements;
            }
            //
            for (i=0; elements[i]; i++) {
            	hack[i] = background;
            	hackNone[i] = 'none';
            }
            //
            if (elements && elements.length > 0) {
                switch (type) {
                    case 'image':
                    	ElementsMediator.setProperty(elements, "background-image", hack, {"background-image": background}, "Change", "color-controller");
                    	ElementsMediator.setProperty(elements, "background-color", hackNone, {"background-color": 'none'}, "Change", "color-controller");
                        break;
                    case 'color':
                    	//TODO: Add logic to handle setting color when image (like gradients) is applied
                    	//TODO: Handle applying to multiple items, currently, we need to create a dummy array of the same value
                    	ElementsMediator.setProperty(elements, "background-image", hackNone, {"background-image": 'none'}, "Change", "color-controller");
                        ElementsMediator.setProperty(elements, "background-color", hack, {"background-color": background}, "Change", "color-controller");
                        break;
                    case 'background':
                        break;
                }
                //
                //console.log(this.getColorObjFromCss('#333'));
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    setBorder: {
        enumerable: true,
        value: function (type, border, selection) {
            //
            var elements, i, hack = [], hackNone = [];
            //The selection is optional, if none, it asks for the currently selected elements
            if (selection) {
                elements = selection;
            } else {
                elements = this.application.ninja.selectedElements;
            }
            //
            for (i=0; elements[i]; i++) {
            	hack[i] = border;
            	hackNone[i] = 'none';
            }
            //
            if (elements && elements.length > 0) {
                switch (type) {
                    case 'image':
                    	//TODO: Figure out why color must be removed, might be related to the CSS
                    	ElementsMediator.setProperty(elements, "border-color", hackNone, {"border-color": 'none'}, "Change", "color-controller");
                    	ElementsMediator.setProperty(elements, "border-image", hack, {"border-image": border}, "Change", "color-controller");
                        break;
                    case 'color':
                    	ElementsMediator.setProperty(elements, "border-image", hackNone, {"border-image": 'none'}, "Change", "color-controller");
                        ElementsMediator.setProperty(elements, "border-color", hack, {"border-color": border}, "Change", "color-controller");
                        break;
                    case 'border':
                        break;
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleChange: {
    	enumerable: true,
        value: function (e) {

        	//
            var actionEvent, color, input = e._event.input, panelMode, mode = e._event.mode;
            if (this.colorView) {
            	panelMode = this.colorView.panelMode;
            }
            //
            if (mode === 'nocolor') {
            	color = {value: null, css: 'none'};
            } else if (panelMode === 'rgb' && e._event.rgba && mode !== 'gradient') {
                color = e._event.rgba;
            } else if (panelMode === 'hsl' && e._event.hsla && mode !== 'gradient') {
                color = e._event.hsla;
            } else if (mode !== 'gradient'){
                color = {value: e._event.hex, css: '#'+e._event.hex};
            } else if (mode === 'gradient'){
            	color = e._event.value.value;
            }
            ////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////
            //
            if (input === 'fill') {
            	//
            	this.fill = color;
                //
                if(e._event.wasSetByCode) return;
            	//
            	if (mode === 'nocolor') {
            		//TODO: Add a check instead of setting properties
            		this.setBackground('image', color.css, false);
            		this.setBackground('color', color.css, false);
            		this.setBackground('background', color.css, false);
            	} else if (mode === 'gradient') {
            		this.setBackground('image', color.css, false);
            	} else {
                	this.setBackground('color', color.css, false);
                }
            } else if (input === 'stroke') {
            	//
            	this.stroke = color;
                //
                if(e._event.wasSetByCode) return;
            	//
               	if (mode === 'nocolor') {
            		//TODO: Add a check instead of setting properties
            		this.setBorder('image', color.css, false);
            		this.setBorder('color', color.css, false);
            		this.setBorder('border', color.css, false);
            	} else if (mode === 'gradient') {
                	this.setBorder('image', color.css, false);
                } else {
                	this.setBorder('color', color.css, false);
                }
            }
            ////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Converts CSS to a color object to be used by the color model
    getColorObjFromCss: {
    	enumerable: true,
        value: function (css) {
        	//
        	var color, arr, i, j, temp, c, gradient;
        	//console.log(css.indexOf('-webkit'), css);
        	if (css && css.indexOf('-webkit') >= 0) {
        		//
        		gradient = {mode: null, stops: null};
        		//Checking for gradient type
        		if (css.indexOf('-webkit-radial-gradient') >= 0) {
        			//Radial gradient
        			gradient.stops = [];
        			gradient.mode = 'radial';
        			gradient.css = css;
        			//
        			arr = css.split('%,');
        			//
        			for (j=1; arr[j]; j++) {
        				//TODO: Add HSL support
        				if (arr[j].indexOf('rgb') >= 0 && arr[j].indexOf('rgba') < 0) {
    		    			temp = arr[j].split('rgb');
    		    			temp = temp[1].replace(/\(/i, "");
    		    			temp = temp.split(')');
    		    			c = this.parseCssToColor('rgb('+temp[0]+')');
    		    			gradient.stops.push({css: c.css, value: c.value, mode: c.mode, position: parseInt(temp[1].replace(/\%/i, ""))});
	    	    		} else if (css.indexOf('rgba') >= 0) {
	    	    			
	    	    			temp = arr[j].split('rgba');
    		    			temp = temp[1].replace(/\(/i, "");
    		    			temp = temp.split(')');
    		    			c = this.parseCssToColor('rgba('+temp[0]+')');
    		    			gradient.stops.push({css: c.css, value: c.value, mode: c.mode, position: parseInt(temp[1].replace(/\%/i, ""))});
		        		}
        			}	
        		} else if (css.indexOf('-webkit-gradient') >= 0) {
        			//Linear gradient
        			gradient.stops = [];
        			gradient.mode = 'linear';
        			gradient.css = css;
        			//
        			arr = css.split('from(');
        			arr = arr[1].split('),');
        			//
        			for (i=0; arr[i]; i++) {
        				arr[i] = arr[i].replace(/ color-stop\(/i, "");
        				//
        				if (arr[i].indexOf('to(') >= 0) {
        					arr[i] = arr[i].replace(/ to\(/i, "");
        					arr[i] = arr[i].replace(/\)\)/i, "");
        				}
        				//
        				if (i === 0) {
        					arr[i] = {css: arr[i], percent: 0};
        				} else if (i === arr.length-1) {
        					arr[i] = {css: arr[i], percent: 100};
        				} else {
        					//
        					if (arr[i].indexOf('rgb') >= 0 && arr[i].indexOf('rgba') < 0) {
        						temp = arr[i].split(', rgb');
	        					arr[i] = {css: 'rgb'+temp[1], percent: Math.round(parseFloat(temp[0])*100)};
        					} else if (arr[i].indexOf('rgba') >= 0) {
    	    					temp = arr[i].split(', rgba');
	        					arr[i] = {css: 'rgba'+temp[1], percent: Math.round(parseFloat(temp[0])*100)};
	        				}
        				}
        				//
        				c = this.parseCssToColor(arr[i].css);
        				gradient.stops.push({css: c.css, value: c.value, mode: c.mode, position: arr[i].percent});
        			}
        		}
        		//Creating gradient object
        		color = {mode: 'gradient', value: {stops: gradient.stops, mode: gradient.mode, css: css}};
        	} else if (css){
        		//Simple solid color
        		color = this.parseCssToColor(css);
        	}
        	//Returning color object (or null if none)
        	return color;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Parses simple solid CSS string into color object
    parseCssToColor: {
    	enumerable: true,
        value: function (css) {
        	var color, r, p;
        	//Parsing string and converting into color object
        	if (css.indexOf('#') >= 0) {
        		color = {mode: 'hex', css: css, value: css.split('#')[1]};
        	} else if (css.indexOf('rgb') >= 0 && css.indexOf('rgba') < 0) {
        		r = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
               	p = css.match(r);
                color = {mode: 'rgb', css: css, value: {css: css, r: parseInt(p[1]), g: parseInt(p[2]), b: parseInt(p[3]), a: 1}};
        	} else if (css.indexOf('rgba') >= 0) {
        		r = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d+)\)$/;
               	p = css.match(r);
               	color = {mode: 'rgb', css: css, value: {css: css, r: parseInt(p[1]), g: parseInt(p[2]), b: parseInt(p[3]), a: parseFloat(p[4])}};
       		} else if (css.indexOf('hsl') >= 0 && css.indexOf('hsla') < 0) {
       			r = /^hsl\((\d+),\s*(\d+),\s*(\d+)\)$/;
               	p = css.match(r);
               	color = {mode: 'hsl', css: css, value: {css: css, h: parseInt(p[1]), s: parseInt(p[2]), l: parseInt(p[3]), a: 1}};
        	} if (css.indexOf('hsla') >= 0) {
        		r = /^hsla\((\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d+)\)$/;
               	p = css.match(r);
               	color = {mode: 'hsl', css: css, value: {css: css, h: parseInt(p[1]), s: parseInt(p[2]), l: parseInt(p[3]), a: parseFloat(p[4])}};
       		}
       		//Must be a valid CSS or null will be returned
       		return color;
        }
    },
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    //TODO: Remove, add via toolbar repetition
    createToolbar: {
        enumerable: true,
        value: function () {
            this.colorToolbar = ColorToolbar.create();
            this.colorToolbar.element = document.getElementById("colortoolbar");
            this.colorToolbar.needsDraw = true;
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});