/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
	Component = require("montage/ui/component").Component,
	Popup = require("montage/ui/popup/popup.reel").Popup;

var EasingMenu = exports.EasingMenu = Montage.create(Component, {

    hasTemplate:{
        value: true
    },

	/* Begin: Models */
	
	// popup: the initialized component.
    _popup: {
		value: null
    },
    popup: {
    	get: function() {
    		return this._popup;
    	},
    	set: function(newVal) {
    		this._popup = newVal
    	}
    },
    
    // callingComponent: pointer to the span that called for the menu
    _callingComponent: {
    	value: null
    },
    callingComponent: {
    	get: function() {
    		return this._callingComponent;
    	},
    	set: function(newVal) {
    		this._callingComponent = newVal;
    	}
    },
    
    // anchor: pointer to the anchoring element
    _anchor: {
    	value: null
    },
    anchor: {
    	get: function() {
    		return this._anchor;
    	},
    	set: function(newVal) {
    		this._anchor = newVal;
    	}
    },
    
    
    _top: {
    	value: null
    },
    top: {
    	get: function() {
    		return this._top;
    	},
    	set: function(newVal) {
    		this._top = newVal;
    	}
    },
    _left: {
    	value: null
    },
    left: {
    	get: function() {
    		return this._left;
    	},
    	set: function(newVal) {
    		this._left = newVal;
    	}
    },
    
    // currentChoice: The data attribute of the current choice
    _currentChoice: {
    	value: null
    },
    currentChoice: {
    	get: function() {
    		return this._currentChoice;
    	},
    	set: function(newVal) {
    		this._currentChoice = newVal;
    	}
    },
    
    /* End: Models */
    
    /* Begin: Draw Cycle */
    willDraw: {
    	value: function() {
    		this.element.addEventListener("click", this.handleEasingChoicesClick.bind(this), false);
    	}
    },
    
    draw: {
    	value: function() {
    		// Update the selection classes.
            this.element.querySelector(".easing-selected").classList.remove("easing-selected");
            this.element.querySelector('[data-ninja-ease="'+this.currentChoice+'"]').classList.add("easing-selected");
    	}
    },
    didDraw: {
    	value: function() {
    	}
    },
	/* End Draw Cycle */
    
    /* Begin: Controllers */
	show: {
		value: function() {
			// Initialize the popup if it hasn't already been done
            if (this.popup == null) {
            	this.popup = Popup.create();
	            this.popup.modal = false;
	            this.popup.content = EasingMenu.create();
            }
            
            // Show the popup
            this.popup.anchor = this.anchor;
            var position = {};
            position.top = this.top;
            position.left = this.left;
            this.popup.position = position;
            this.popup.show();


            
            
            
            // Redraw the content (needed to reflect probable changes in selection from the last time we showed it)
            this.popup.content.needsDraw = true;
		}
	},
	handleEasingChoicesClick: {
    	value: function(event) {
    		event.stopPropagation();

			// Un-highlight the old choice and highlight the new choice
    		this.element.querySelector(".easing-selected").classList.remove("easing-selected");
    		event.target.classList.add("easing-selected");
    		
    		// Set the easing in the span that called us
    		this.callingComponent.easing = event.target.dataset.ninjaEase;
    		
    		// Hide the menu.
    		this.popup.hide();	
    	}
    }
    
    /* End: Controllers */
    
});
