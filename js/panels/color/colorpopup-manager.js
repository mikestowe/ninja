/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */
 
////////////////////////////////////////////////////////////////////////
//
var Montage =			require("montage/core/core").Montage,
	Component =			require("montage/ui/component").Component,
	ColorChipPopup =	require("js/panels/Color/colorchippopup.reel").ColorChipPopup,
	ColorPanelPopup =	require("js/panels/Color/colorpanelpopup.reel").ColorPanelPopup,
	ColorModel =        require("js/models/color-model").ColorModel;
////////////////////////////////////////////////////////////////////////
//Exporting as ColorPopupManager
exports.ColorPopupManager = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //
    hasTemplate: {
    	value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    _hasInit: {
    	value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    init: {
    	value: function () {
    		////////////////////////////////////////////////////////////
            //Closing popups on resize
            window.addEventListener('resize', function (e) {
                this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            }.bind(this));
            
            //Closing popups if outside limits
            document.addEventListener('mousedown', function (e) {
            	//
            	if (this._popupBase && !this._popupChipBase) {
            		if(!this.popupHitCheck(this._popupBase, e)) {
	            		this.hideColorPopup();
            		}
            	} else if (!this._popupBase && this._popupChipBase) {
	            	if(!this.popupHitCheck(this._popupChipBase, e)) {
	            		this.hideColorChipPopup();
            		}
            	} else if (this._popupBase && this._popupChipBase) {
	            	if(!this.popupHitCheck(this._popupBase, e) && !this.popupHitCheck(this._popupChipBase, e)) {
	            		this.hideColorPopup();
            		}
            	}
            }.bind(this));
            ////////////////////////////////////////////////////////////
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    popupHitCheck: {
	  	value: function (element, e) {
	  		//Storing limits of popup 
	  		var top, bottom, left, right;
	  		//Checking for popup to be opened otherwise nothing happens
	  		if (element && element.opened && element.popup && element.popup.element) {
            	//Getting horizontal limits	
               	left = parseInt(element.popup.element.style.left) + parseInt(element.popup.element.style.marginLeft);
               	right = left + parseInt(element.popup.element.offsetWidth);
               	//Getting vertical limits
               	top = parseInt(element.popup.element.style.top) + parseInt(element.popup.element.style.marginTop);
               	bottom = left + parseInt(element.popup.element.offsetHeight);
               	//Checking click position in relation to limits
               	if ((e._event.clientX < left || e._event.clientX > right) || (e._event.clientY < top || e._event.clientY > bottom)) {
               		//Hides popups since click is outside limits
	               	return false;
               	} else {
	               	return true;
               	}
            } else {
	            return false;
            }
	  	}  
    },
    ////////////////////////////////////////////////////////////////////
    //
    _popupBase: {
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _popupChipBase: {
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //Storing color manager
    _colorManager: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorManager: {
        get: function() {
            return this._colorManager;
        },
        set: function(value) {
        	this._colorManager = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _colorPopupDrawing: {
    	enumerable: true,
    	value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
	_colorChipPopupDrawing: {
    	enumerable: true,
    	value: false
    },
    ////////////////////////////////////////////////////////////////////
    //TODO: Remove and use montage's built in component
    showColorPopup: {
    	enumerable: true,
    	value: function (x, y, side, align) {
    		if (this._colorPopupDrawing) {
    			return;
    		}
    		if (this._popupBase && this._popupBase.opened) {
    			//Toogles if called and opened
    			this.hideColorPopup();
    		} else {
    			this._colorPopupDrawing = true;
    			////////////////////////////////////////////////////
    			//Initializing events
    			if (!this._hasinit) {
    				this.init();
    				this._hasinit = true;
    			}
    			////////////////////////////////////////////////////
    			//Creating popup from m-js component
    			var popup = document.createElement('div');
    			document.body.appendChild(popup);
    			//
    			this._popupBase = ColorPanelPopup.create();
    			this._popupBase.element = popup;
    			this._popupBase.props = {x: x, y: y, side: side, align: align, wheel: true, palette: true, gradient: true, image: true, nocolor: true, history: true};
    			this._popupBase.colorManager = this.colorManager;
    			//
    			this._popupBase.addEventListener('change', this, false);
		    	this._popupBase.addEventListener('changing', this, false);
    			//
    			this._popupBase.needsDraw = true;
    			this._popupBase.addEventListener('firstDraw', this, false);
        	}		
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    hideColorPopup: {
    	enumerable: true,
    	value: function () {
    		if (this._popupBase && this._popupBase.opened) {
    			//
    			this._popupBase.popup.removeEventListener('didDraw', this, false);
    			//
    			this.hideColorChipPopup();
    			//Making sure to return color manager to either stroke or fill (might be a Hack for now)
    			if (this.colorManager.input !== 'stroke' && this.colorManager.input !== 'fill' && this.application.ninja.colorController.colorView.previousInput) {
    				this.colorManager.input = this.application.ninja.colorController.colorView.previousInput;
    			}
    			//
                this.application.ninja.popupManager.removePopup(this._popupBase.popup.element);
	    		this._popupBase.opened = false;
	    		//TODO: Fix HACK of removing popup
	    		this._popupBase.popup.base.destroy();
	    		this._popupBase.popup = null;
	    	} else if (this._popupChipBase && this._popupChipBase.opened) {
	    		this.hideColorChipPopup();
	    		//Making sure to return color manager to either stroke or fill (might be a Hack for now)
    			if (this.colorManager.input !== 'stroke' && this.colorManager.input !== 'fill' && this.application.ninja.colorController.colorView.previousInput) {
    				this.colorManager.input = this.application.ninja.colorController.colorView.previousInput;
    			}
	    	}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorChipChange: {
    	enumerable: true,
    	value: function (e) {
    		//
    		var ctx,
    			cvs = this.application.ninja.colorController.colorView.currentChip.getElementsByTagName('canvas')[0],
    			rgb = this._popupChipBase.colorManager.rgb,
				hsl = this._popupChipBase.colorManager.hsl,
				alpha = this._popupChipBase.colorManager.alpha.value;
    		//
    		if (cvs) {
	    		ctx = cvs.getContext('2d');
    			ctx.clearRect(0, 0, cvs.width, cvs.height);
    			ctx.beginPath();
    			ctx.lineWidth = 2;
	    		ctx.strokeStyle = "#666";
    			ctx.moveTo(0, 0);
	  			ctx.lineTo(cvs.width, 0);
	  			ctx.lineTo(cvs.width, cvs.height);
	  			ctx.lineTo(0, cvs.height);
	  			ctx.lineTo(0, 0);
				ctx.stroke();
				ctx.beginPath();
    			ctx.lineWidth = 2;
    			ctx.strokeStyle = "#333";
    			ctx.moveTo(2, 2);
		  		ctx.lineTo(cvs.width-2, 2);
	  			ctx.lineTo(cvs.width-2, cvs.height-2);
		 		ctx.lineTo(2, cvs.height-2);
	  			ctx.lineTo(2, 1);
				ctx.stroke();
			}
    		//
    		this.application.ninja.colorController.colorView.currentChip.color('rgb', {r: rgb.r, g: rgb.g, b: rgb.b, a: alpha, css: 'rgba('+rgb.r+', '+rgb.g+', '+rgb.b+', '+alpha+')'});
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    showColorChipPopup: {
    	enumerable: true,
    	value: function (e) {
    		if (this._colorChipPopupDrawing) {
    			return;
    		}
    		if (this._popupChipBase && this._popupChipBase.opened) {
    			//Toogles if called and opened
    			this.hideColorChipPopup();
    		} else {
    			this._colorChipPopupDrawing = true;
    			////////////////////////////////////////////////////
    			//Initializing events
    			if (!this._hasinit) {
    				this.init();
    				this._hasinit = true;
    			}
    			
    			
    			////////////////////////////////////////////////////
    			//Creating popup from m-js component
    			var popup = document.createElement('div');
    			document.body.appendChild(popup);
    			//
    			this._popupChipBase = ColorPanelPopup.create();
    			this._popupChipBase.element = popup;
    			this._popupChipBase.isPopupChip = true;
    			if (e._event.srcElement.props) {
    				this._popupChipBase.props = e._event.srcElement.props;
    			} else {
    				this._popupChipBase.props = {side: 'top', align: 'center', wheel: true, palette: true, gradient: false, image: false, nocolor: true, panel: false, history: false};
    			}
    			//
    			if (this._popupChipBase.props.offset) {
			    	this._popupChipBase.props.x = (e._event.clientX - e._event.offsetX + this._popupChipBase.props.offset)+'px';
			       	this._popupChipBase.props.y = (e._event.target.clientHeight/2+e._event.clientY - e._event.offsetY)+'px';
		     	} else {
			        this._popupChipBase.props.x = (e._event.clientX - e._event.offsetX)+'px';
			        this._popupChipBase.props.y = (e._event.target.clientHeight/2+e._event.clientY - e._event.offsetY)+'px';
		        }
    			this._popupChipBase.colorManager = ColorModel.create();
    			//
    			this._popupChipBase.addEventListener('change', this, false);
		    	this._popupChipBase.addEventListener('changing', this, false);
    			//
    			this._popupChipBase.needsDraw = true;
    			this._popupChipBase.addEventListener('firstDraw', this, false);
    			
    			
    			
    			
    			
    			
    			/*
////////////////////////////////////////////////////
    			//Creating popup from m-js component
    			var popup = document.createElement('div');
    			document.body.appendChild(popup);
    			//
    			this._popupChipBase.event = e._event;
    			this._popupChipBase = ColorChipPopup.create();
    			this._popupChipBase.element = popup;
    			this._popupChipBase.colorManager = this.colorManager;
    			if (e._event.srcElement.props) {
    				this.colorChipProps = e._event.srcElement.props;
    			} else {
    				this.colorChipProps = {side: 'top', align: 'center', wheel: true, palette: true, gradient: true, image: true, panel: false};
    			}
    			//
    			if (!this.colorChipProps.panel) {
			    	this.hideColorPopup();
			    }
    			//
    			this._popupChipBase.popupModes = {};
    			this._popupChipBase.popupModes.gradient = this.colorChipProps.gradient;
    			this._popupChipBase.popupModes.image = this.colorChipProps.image;
    			this._popupChipBase.popupModes.wheel = this.colorChipProps.wheel;
    			this._popupChipBase.popupModes.palette = this.colorChipProps.palette;
    			this._popupChipBase.popupModes.nocolor = this.colorChipProps.nocolor; 	
    			//
    			this._popupChipBase.addEventListener('change', this, false);
		    	this._popupChipBase.addEventListener('changing', this, false);
    			//
    			this._popupChipBase.needsDraw = true;
    			this._popupChipBase.addEventListener('firstDraw', this, false);
*/
        	}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    hideColorChipPopup: {
    	enumerable: true,
    	value: function () {
    		//
    		if (this._popupChipBase && this._popupChipBase.opened) {
    			//
    			this._popupChipBase.popup.removeEventListener('didDraw', this, false);
    			//Making sure to return color manager to either stroke or fill (might be a Hack for now)
    			if (this.colorManager.input !== 'stroke' && this.colorManager.input !== 'fill' && this.application.ninja.colorController.colorView.previousInput) {
    				this.colorManager.input = this.application.ninja.colorController.colorView.previousInput;
    			}
    			//
                this.application.ninja.popupManager.removePopup(this._popupChipBase.popup.element);
	    		this._popupChipBase.opened = false;
	    		//TODO: Fix HACK of removing popup
	    		this._popupChipBase.popup.base.destroy();
	    		this._popupChipBase.popup = null;
	    	}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //Reworking logic, firstDraw bubbles up, so target must be checked
    handleFirstDraw: {
    	enumerable: false,
    	value: function (e) {
    		if (e._target._element.className === 'cpp_popup') {
    			e._target.removeEventListener('firstDraw', this, false);
	    		//Creating an instance of the popup and sending in created color popup content
				e._target.popup = this.application.ninja.popupManager.createPopup(e._target.element, {x: e._target.props.x, y: e._target.props.y}, {side: e._target.props.side, align: e._target.props.align});
				//Displaying popup once it's drawn
				e._target.popup.addEventListener('firstDraw', this, false);
				//Hiding popup while it draws
				e._target.popup.element.style.opacity = 0;
				//Storing popup for use when closing
				e._target.popup.base = e._target;
			} else if (e._target._element.className === 'default_popup' && e._target._content.className === 'cpp_popup') {
				if (!e._target.base.isPopupChip) {
					this._colorPopupDrawing = false;
				} else {
					this._colorChipPopupDrawing = false;
				}
	    		//
    			e._target.base.popup.removeEventListener('firstDraw', this, false);
    			//Fades in with CSS transition
				e._target.base.popup.element.style.opacity = 1;
				//Popup was added, so it's opened
		        e._target.base.opened = true;
	        }/*
 else if (e._target._element.className === 'cc_popup') {
	        	this._popupChipBase.removeEventListener('firstDraw', this, false);
	        	//Creating an instance of the popup and sending in created color popup content
    			if (this.colorChipProps.offset) {
			       	this._popupChipBase.popup = this.application.ninja.popupManager.createPopup(this._popupChipBase.element, {x: (this._popupChipBase.event.clientX - this._popupChipBase.event.offsetX + this.colorChipProps.offset)+'px', y: (this._popupChipBase.event.target.clientHeight/2+this._popupChipBase.event.clientY - this._popupChipBase.event.offsetY)+'px'}, {side: this.colorChipProps.side, align: this.colorChipProps.align});
		     	} else {
			        this._popupChipBase.popup = this.application.ninja.popupManager.createPopup(this._popupChipBase.element, {x: (this._popupChipBase.event.clientX - this._popupChipBase.event.offsetX)+'px', y: (this._popupChipBase.event.target.clientHeight/2+this._popupChipBase.event.clientY - this._popupChipBase.event.offsetY)+'px'}, {side: this.colorChipProps.side, align: this.colorChipProps.align});
		        }
			    //
		    	if (!this.colorChipProps.panel) {
		       		this.colorManager.input = 'chip';
		     	}
		    	//Hiding popup while it draws
				this._popupChipBase.popup.element.style.opacity = 0;
		   	    //Storing popup for use when closing
				this._popupChipBase.popup.base = this._popupChipBase;
				//Displaying popup once it's drawn
				this._popupChipBase.popup.addEventListener('firstDraw', this, false);
	        } else if (e._target._element.className === 'default_popup' && e._target._content.className === 'cc_popup') {
	        	this._popupChipBase.popup.removeEventListener('firstDraw', this, false);
	        	//
	        	this._colorChipPopupDrawing = false;
	        	//
				var hsv, color = this._popupChipBase.event.srcElement.colorValue;
				//
				this._popupChipBase.popup.element.style.opacity = 1;
				//
				this._popupChipBase.opened = true;
	        	//
	        	if (this._popupChipBase.event.srcElement.colorMode === 'rgb') {
		        	if (this._popupChipBase.event.srcElement.colorValue && this._popupChipBase.event.srcElement.colorValue.r) {
		        		color = this._popupChipBase.event.srcElement.colorValue;
	    	    	} else if (this._popupChipBase.event.srcElement.colorValue && this._popupChipBase.event.srcElement.colorValue.color){
	        			color = this._popupChipBase.event.srcElement.colorValue.color;
	        		} else {
	        			return;
	        		}
		   			hsv = this.colorManager.rgbToHsv(color.r, color.g, color.b);
	     			hsv.wasSetByCode = false;
	    	    	hsv.type = 'change';
	        		this._popupChipBase.popup.base._colorChipWheel.value = hsv;
	        	} else if (this._popupChipBase.event.srcElement.colorMode === 'hsl') {
	        		if (this._popupChipBase.event.srcElement.colorValue.h) {
	       				color = this._popupChipBase.event.srcElement.colorValue;
	    			} else{
		        		color = this._popupChipBase.event.srcElement.colorValue.color;
	    	    	}
	        		color = this.colorManager.hslToRgb(color.h/360, color.s/100, color.l/100);
	        		hsv = this.colorManager.rgbToHsv(color.r, color.g, color.b);
	   				hsv.wasSetByCode = false;
     				hsv.type = 'change';
		        	this._popupChipBase.popup.base._colorChipWheel.value = hsv;
	    		}
	        }
*/
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleChange: {
    	enumerable: false,
    	value: function (e) {
    		if (this._popupChipBase && this._popupChipBase.opened) {
    			if (e._event.hsv) {
    				this._popupChipBase.colorManager.hsv = {h: e._event.hsv.h, s: e._event.hsv.s, v: e._event.hsv.v, type: e._event.type, wasSetByCode: e._event.wasSetByCode};
    				this.colorChipChange(e);
    			} else {
	    			console.log(e._event);
    			}
    			return;
    		}
    		//
    		if (!e._event.wasSetByCode) {
    			if (e._event.hsv) {
    				if(e._target._colorBarCanvas && this.colorManager.input !== 'chip') {
    					this.application.ninja.colorController.colorPopupManager.hideColorPopup();
    				}
	    			//
	    			if (this.colorManager.input !== 'chip') {
    					this.colorManager.hsv = {h: e._event.hsv.h, s: e._event.hsv.s, v: e._event.hsv.v, type: e._event.type, wasSetByCode: e._event.wasSetByCode};
    				} else {
    					//this.colorChipChange(e);
    				}
    			}
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleChanging: {
    	enumerable: false,
    	value: function (e) {
    		if (e._event.hsv) {
    			//
    			if(e._target._colorBarCanvas && this.colorManager.input !== 'chip') {
    				this.application.ninja.colorController.colorPopupManager.hideColorPopup();
    			}
    			//Converting color to RGB to update buttons background colors (affecting only view)
				var color = this.colorManager.hsvToRgb(e._event.hsv.h/(Math.PI*2), e._event.hsv.s, e._event.hsv.v), i, input = this.colorManager.input;
				
				if (input === 'chip') {
					var ctx, cvs = this.application.ninja.colorController.colorView.currentChip.getElementsByTagName('canvas')[0];
    				//if (cvs && color) {
		    		if (cvs) {
	    				ctx = cvs.getContext('2d');
    					ctx.clearRect(0, 0, cvs.width, cvs.height);
		    			ctx.beginPath();
    					ctx.lineWidth = 2;
	    				ctx.strokeStyle = "#666";
		    			ctx.moveTo(0, 0);
	  					ctx.lineTo(cvs.width, 0);
	  					ctx.lineTo(cvs.width, cvs.height);
			  			ctx.lineTo(0, cvs.height);
	  					ctx.lineTo(0, 0);
						ctx.stroke();
						ctx.beginPath();
    					ctx.lineWidth = 2;
    					ctx.strokeStyle = "#333";
		    			ctx.moveTo(2, 2);
				  		ctx.lineTo(cvs.width-2, 2);
	  					ctx.lineTo(cvs.width-2, cvs.height-2);
				 		ctx.lineTo(2, cvs.height-2);
	  					ctx.lineTo(2, 1);
						ctx.stroke();
					}
					//Updating background color
    				if (this.colorManager.alpha && this.colorManager.alpha.value) {
	    				this.application.ninja.colorController.colorView.currentChip.style.backgroundImage = 'none';
	    				this.application.ninja.colorController.colorView.currentChip.style.backgroundColor = 'rgba('+color.r+','+color.g+','+color.b+', '+this.colorManager.alpha.value+')';
	    			} else {
	    				this.application.ninja.colorController.colorView.currentChip.style.backgroundImage = 'none';
	    				this.application.ninja.colorController.colorView.currentChip.style.backgroundColor = 'rgba('+color.r+','+color.g+','+color.b+', '+this.colorManager.alpha+')';
	    			}
	    			return;
				}
				
				
    			//Applying color to all buttons in array
    			for(i=0; this.application.ninja.colorController.colorView._buttons[input][i]; i++) {
    				//TODO: Remove this and combine to single method for live updating colors
    				//Combines with drawing routing in 'selectInputHighlight'
    				var ctx, cvs = this.application.ninja.colorController.colorView._buttons[input][i].getElementsByTagName('canvas')[0];
    				if (cvs) {
	    				ctx = cvs.getContext('2d');
    					ctx.clearRect(0, 0, cvs.width, cvs.height);
    					ctx.beginPath();
    					ctx.lineWidth = 2;
	    				ctx.strokeStyle = "#666";
    					ctx.moveTo(0, 0);
	  					ctx.lineTo(cvs.width, 0);
	  					ctx.lineTo(cvs.width, cvs.height);
	  					ctx.lineTo(0, cvs.height);
		  				ctx.lineTo(0, 0);
						ctx.stroke();
						ctx.beginPath();
    					ctx.lineWidth = 2;
    					ctx.strokeStyle = "#333";
	    				ctx.moveTo(2, 2);
		  				ctx.lineTo(cvs.width-2, 2);
	  					ctx.lineTo(cvs.width-2, cvs.height-2);
	 					ctx.lineTo(2, cvs.height-2);
	  					ctx.lineTo(2, 1);
						ctx.stroke();
    				}
    				//Updating background color
    				if (this.colorManager.alpha && this.colorManager.alpha.value) {
	    				this.application.ninja.colorController.colorView._buttons[input][i].style.backgroundImage = 'none';
	    				this.application.ninja.colorController.colorView._buttons[input][i].style.backgroundColor = 'rgba('+color.r+','+color.g+','+color.b+', '+this.colorManager.alpha.value+')';
	    			} else {
	    				this.application.ninja.colorController.colorView._buttons[input][i].style.backgroundImage = 'none';
	    				this.application.ninja.colorController.colorView._buttons[input][i].style.backgroundColor = 'rgba('+color.r+','+color.g+','+color.b+', '+this.colorManager.alpha+')';
	    			}
    			}
    		}
    	}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});