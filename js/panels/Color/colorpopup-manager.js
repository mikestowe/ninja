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
	ColorPanelPopup =	require("js/panels/Color/colorpanelpopup.reel").ColorPanelPopup;
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
    	enumerable: false,
    	value: function () {
    		////////////////////////////////////////////////////////////
            //TODO: Improve logic on handling closing the popup
            ////////////////////////////////////////////////////////////
            //Hiding popup on any panel(s) actions
            this.eventManager.addEventListener("panelOrderChanged", function (e) {
                this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            }.bind(this));
            //
            this.eventManager.addEventListener("panelClose", function (e) {
                this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            }.bind(this));
            //
            this.eventManager.addEventListener("panelCollapsed", function (e) {
                this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            }.bind(this));
            //
            this.eventManager.addEventListener("panelSelected", function (e) {
                this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            }.bind(this));
            //
            this.eventManager.addEventListener("togglePanel", function (e) {
                this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            }.bind(this));
            //
            this.eventManager.addEventListener("panelResizing", function (e) {
                this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            }.bind(this));
            //
            this.eventManager.addEventListener("panelResizedStart", function (e) {
                this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            }.bind(this));
            //
            this.eventManager.addEventListener("panelResizedEnd", function (e) {
                this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            }.bind(this));
            //
            window.addEventListener('resize', function (e) {
                this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            }.bind(this));
            //
            document.addEventListener('click', function (e) {
                //
                if (e._event.srcElement.id === 'stageCanvas' || e._event.srcElement.id === 'mainContainer' || e._event.srcElement.id === 'drawingCanvas') {
                	this.application.ninja.colorController.colorPopupManager.hideColorPopup();
                }
            }.bind(this));
            ////////////////////////////////////////////////////////////
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _popupPanel: {
    	enumerable: false,
        value: {}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _popupChip: {
    	enumerable: false,
        value: {}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _popupBase: {
    	enumerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _popupChipBase: {
    	enumerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //Storing color manager
    _colorManager: {
        enumerable: false,
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorManager: {
    	enumerable: true,
        get: function() {
            return this._colorManager;
        },
        set: function(value) {
        	this._colorManager = value;
        }
    },
    
    
    
    //TODO: Remove, figure out offset bug
    _hackOffset: {
    	enumerable: true,
    	value: false
    },
    
    
    _colorPopupDrawing: {
    	enumerable: true,
    	value: false
    },
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
    		if (this._popupPanel.opened) {
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
    			//
    			this._popupBase = ColorPanelPopup.create();
    			this._popupBase.content = document.createElement('div');
    			this._popupBase.props = {x: x, y: y, side: side, align: align};
    			
    			if (this._hackOffset) {
    				this._popupBase.hack = {x: 53, y: 235};
    			} else {
    				this._hackOffset = true;
    				this._popupBase.hack = {x: 0, y: 0};
    			}
    			//
    			document.body.appendChild(popup);
    			document.body.appendChild(this._popupBase.content);
    			//Setting color panel for reference when drawing
   				//this._popupBase.colorPanel = this;
    			this._popupBase.colorManager = this.colorManager;	
    			//Setting up events
    			this._popupBase.addEventListener('change', this, false);
		    	this._popupBase.addEventListener('changing', this, false);	
    			//TODO: Use m-js popup or check m-js fix of nested drawing components
    			this._popupBase.element = popup;
   				this._popupBase.needsDraw = true;
   				//Adding drawn element to container
    			this._popupBase.content.appendChild(this._popupBase.element);
    			//Waiting for content to drawn before loading popup
    			this._popupBase.addEventListener('firstDraw', this, false);
        	}		
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    hideColorPopup: {
    	enumerable: true,
    	value: function () {
    		if (this._popupPanel.opened) {
    			//
    			this._popupPanel.popup.removeEventListener('didDraw', this, false);
    			//
    			this.hideColorChipPopup();
    			//Making sure to return color manager to either stroke or fill (might be a Hack for now)
    			if (this.colorManager.input !== 'stroke' && this.colorManager.input !== 'fill' && this.application.ninja.colorController.colorView.previousInput) {
    				this.colorManager.input = this.application.ninja.colorController.colorView.previousInput;
    			}
    			//
                this.application.ninja.popupManager.removePopup(this._popupPanel.popup.element);
	    		this._popupPanel.opened = false;
	    		//TODO: Fix HACK of removing popup
	    		this._popupPanel.popup.base.destroy();
	    		this._popupPanel.popup = null;
	    	} else if (this._popupChip.opened) {
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
    		//e._event.srcElement.style.backgroundColor = '#'+e._event.hex;
    		//this.colorManager.removeEventListener('change', this, false);
    		//
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
    		//
    		if (this.application.ninja.colorController.colorView.panelMode === 'hsl') {
    			this.application.ninja.colorController.colorView.color('hsl', e._event.hsla);
    		} else if (this.application.ninja.colorController.colorView.panelMode === 'rgb'){
    			this.application.ninja.colorController.colorView.currentChip.color('rgb', e._event.rgba);
    		} else {
    			this.application.ninja.colorController.colorView.currentChip.color('hex', e._event.hex);
    		}
    		//
    		
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
    		if (this._popupChip.opened) {
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
    			//
    			this._popupChipBase = ColorChipPopup.create();
    			this._popupChipBase.content = document.createElement('div');
    			this._popupChip.event = e._event;
    			//
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
    			document.body.appendChild(popup);
    			document.body.appendChild(this._popupChipBase.content);
    			//Setting color panel for reference when drawing
   				//popupBase.colorPanel = this;
    			this._popupChipBase.colorManager = this.colorManager;
    			//
    			this._popupChipBase.popupModes.gradient = this.colorChipProps.gradient;
    			this._popupChipBase.popupModes.image = this.colorChipProps.image;
    			this._popupChipBase.popupModes.wheel = this.colorChipProps.wheel;
    			this._popupChipBase.popupModes.palette = this.colorChipProps.palette;
    			this._popupChipBase.popupModes.nocolor = this.colorChipProps.nocolor; 			
    			//Setting up events
    			this._popupChipBase.addEventListener('change', this, false);
		    	this._popupChipBase.addEventListener('changing', this, false);	
    			//TODO: Use m-js popup or check m-js fix of nested drawing components
    			this._popupChipBase.element = popup;
   				this._popupChipBase.needsDraw = true;
   				//Adding drawn element to container
    			this._popupChipBase.content.appendChild(this._popupChipBase.element);
    			//Waiting for content to drawn before loading popup
    			this._popupChipBase.addEventListener('firstDraw', this, false);
        	}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    hideColorChipPopup: {
    	enumerable: true,
    	value: function () {
    		if (this._popupChip.opened) {
    			//
    			this._popupChip.popup.removeEventListener('didDraw', this, false);
    			//Making sure to return color manager to either stroke or fill (might be a Hack for now)
    			if (this.colorManager.input !== 'stroke' && this.colorManager.input !== 'fill' && this.application.ninja.colorController.colorView.previousInput) {
    				this.colorManager.input = this.application.ninja.colorController.colorView.previousInput;
    			}
    			//
                this.application.ninja.popupManager.removePopup(this._popupChip.popup.element);
	    		this._popupChip.opened = false;
	    		//TODO: Fix HACK of removing popup
	    		this._popupChip.popup.base.destroy();
	    		this._popupChip.popup = null;
	    	}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //Reworking logic, firstDraw bubbles up, so target must be checked
    handleFirstDraw: {
    	enumerable: false,
    	value: function (e) {
    		if (e._target._element.className === 'cpp_popup') {
    			this._popupBase.removeEventListener('firstDraw', this, false);
	    		//Creating an instance of the popup and sending in created color popup content
				this._popupPanel.popup = this.application.ninja.popupManager.createPopup(this._popupBase.content, {x: this._popupBase.props.x, y: this._popupBase.props.y}, {side: this._popupBase.props.side, align: this._popupBase.props.align});
				//Displaying popup once it's drawn
				this._popupPanel.popup.addEventListener('firstDraw', this, false);
				//Hiding popup while it draws
				this._popupPanel.popup.element.style.opacity = 0;
				//Storing popup for use when closing
				this._popupPanel.popup.base = this._popupBase;
			} else if (e._target._element.className === 'default_popup' && e._target._content.firstChild.className === 'cpp_popup') {
				//
				this._colorPopupDrawing = false;
	    		//
    			this._popupPanel.popup.removeEventListener('firstDraw', this, false);
    			//Fades in with CSS transition
				this._popupPanel.popup.element.style.opacity = 1;
				//Popup was added, so it's opened
		        this._popupPanel.opened = true;
	        } else if (e._target._element.className === 'cc_popup') {
	        	//Creating an instance of the popup and sending in created color popup content
    			if (this.colorChipProps.offset) {
			       	this._popupChip.popup = this.application.ninja.popupManager.createPopup(this._popupChipBase.content, {x: (this._popupChip.event.clientX - this._popupChip.event.offsetX + this.colorChipProps.offset)+'px', y: (this._popupChip.event.target.clientHeight/2+this._popupChip.event.clientY - this._popupChip.event.offsetY)+'px'}, {side: this.colorChipProps.side, align: this.colorChipProps.align});
		     	} else {
			        this._popupChip.popup = this.application.ninja.popupManager.createPopup(this._popupChipBase.content, {x: (this._popupChip.event.clientX - this._popupChip.event.offsetX)+'px', y: (this._popupChip.event.target.clientHeight/2+this._popupChip.event.clientY - this._popupChip.event.offsetY)+'px'}, {side: this.colorChipProps.side, align: this.colorChipProps.align});
		        }
			    //
		    	if (!this.colorChipProps.panel) {
		       		this.colorManager.input = 'chip';
		     	}
		    	//Hiding popup while it draws
				this._popupChip.popup.element.style.opacity = 0;
		   	    //Storing popup for use when closing
				this._popupChip.popup.base = this._popupChipBase;
				//Displaying popup once it's drawn
				this._popupChip.popup.addEventListener('firstDraw', this, false);
	        } else if (e._target._element.className === 'default_popup' && e._target._content.firstChild.className === 'cc_popup') {
	        	//
	        	this._colorChipPopupDrawing = false;
	        	//
				var hsv, color = this._popupChip.event.srcElement.colorValue;
				//
				this._popupChip.popup.element.style.opacity = 1;
				//
				this._popupChip.opened = true;
	        	//
	        	if (this._popupChip.event.srcElement.colorMode === 'rgb') {
		        	if (this._popupChip.event.srcElement.colorValue && this._popupChip.event.srcElement.colorValue.r) {
		        		color = this._popupChip.event.srcElement.colorValue;
	    	    	} else if (this._popupChip.event.srcElement.colorValue && this._popupChip.event.srcElement.colorValue.color){
	        			color = this._popupChip.event.srcElement.colorValue.color;
	        		} else {
	        			return;
	        		}
		   			hsv = this.colorManager.rgbToHsv(color.r, color.g, color.b);
	     			hsv.wasSetByCode = false;
	    	    	hsv.type = 'change';
	        		this._popupChip.popup.base._colorChipWheel.value = hsv;
	        	} else if (this._popupChip.event.srcElement.colorMode === 'hsl') {
	        		if (this._popupChip.event.srcElement.colorValue.h) {
	       				color = this._popupChip.event.srcElement.colorValue;
	    			} else{
		        		color = this._popupChip.event.srcElement.colorValue.color;
	    	    	}
	        		color = this.colorManager.hslToRgb(color.h/360, color.s/100, color.l/100);
	        		hsv = this.colorManager.rgbToHsv(color.r, color.g, color.b);
	   				hsv.wasSetByCode = false;
     				hsv.type = 'change';
		        	this._popupChip.popup.base._colorChipWheel.value = hsv;
	    		}
	        }
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleChange: {
    	enumerable: false,
    	value: function (e) {
    		if (e._event.input && e._event.input === 'chip') {
    			this.colorChipChange(e);
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