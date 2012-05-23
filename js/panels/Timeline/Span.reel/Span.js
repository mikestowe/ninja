/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

var Span = exports.Span = Montage.create(Component, {

    hasTemplate:{
        value: true
    },

	// BEGIN: Models
    _spanWidth:{
        value:0
    },
    spanWidth:{
        serializable:true,
        get:function () {
            return this._spanWidth;
        },
        set:function (value) {
            this._spanWidth = value;
            this.needsDraw = true;
        }
    },
    
    _isHighlighted: {
    	value: false
    },
    isHighlighted: {
    	get: function() {
    		return this._isHighlighted;
    	},
    	set: function(newVal) {
    		if (newVal !== this._isHighlighted) {
    			this._isHighlighted = newVal;
    			this.needsDraw = true;
    		}
    	}
    },
    
    _areChoicesVisible: {
    	value: false
    },
    areChoicesVisible: {
    	get: function() {
    		return this._areChoicesVisible;
    	},
    	set: function(newVal) {
    		if (newVal !== this._areChoicesVisible) {
    			this._areChoicesVisible = newVal;
    			this.needsDraw = true;
    		}
    	}
    },
	
	// BEGIN: draw cycle
	prepareForDraw: {
		value: function() {
			this.init();
		}
	},
	
    draw:{
        value: function(){
            this.element.style.width = this.spanWidth + "px";
            
            // Highlight the span?
            if (this.isHighlighted === true) {
            	this.element.classList.add("spanHighlight");
            } else {
            	this.element.classList.remove("spanHighlight");
            }
            
            // Hide or show the choices menu?
            if (this.areChoicesVisible === true) {
            	this.easing_choices.style.display = "block";
            } else {
            	this.easing_choices.style.display = "none";
            }
        }
    },

	// BEGIN: Controllers
	init: {
		value: function() {
			this.easing_choice.addEventListener("click", this.handleEasingChoiceClick.bind(this), false);
			this.easing_choices.addEventListener("click", this.handleEasingChoicesClick.bind(this), false);
		}
	},
	
    highlightSpan:{
        value: function(){
        	// Class add/remove should only be done in draw cycle.
            // this.element.classList.add("spanHighlight");
            this.isHighlighted = true;
        }
    },
    
    handleEasingChoiceClick: {
    	value: function(event) {
    		this.areChoicesVisible = true;
    	}
    },
    handleEasingChoicesClick: {
    	value: function(event) {
    		this.areChoicesVisible = false;
    	}
    }
});
