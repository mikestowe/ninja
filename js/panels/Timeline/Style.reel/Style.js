/*
 * Style component:  Edits and manages a single style rule for a Layer in the Timeline.
 * Public Properties:
 * 		editorProperty:  The CSS property for the style.
 * 		editorValue: 	The value for the editorProperty. 
 * 		whichView:  Which view to show, the hintable view (where a new property can be typed in)
 * 					or the propval view (where the property's value can be set with the tweener).
 * 					Valid values are "hintable" and "propval", defaults to "hintable".
 * 
 */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

var LayerStyle = exports.LayerStyle = Montage.create(Component, {

    hasTemplate:{
        value: true
    },
    
    /* === BEGIN: Models === */
   
   // Property for this editor
    _editorProperty: {
    	serializable: true,
    	value: ""
    },
    editorProperty: {
    	serializable: true,
    	get: function() {
    		return this._editorProperty;
    	},
    	set: function(newVal) {
    		this._editorProperty = newVal;
    		this.needsDraw = true;
    	}
    },
    
    // Value for the property for this editor.
    _editorValue: {
    	serializable: true,
    	value: ""
    },
    editorValue: {
    	serializable: true,
    	get: function() {
    		return this._editorValue;
    	},
    	set: function(newVal) {
    		this._editorValue = newVal;
    		this.needsDraw = true;
    	}
    },
    
	// The tweener used to change the value for this property. 
    _ruleTweener: {
    	serializable: true,
    	value: false
    },
    ruleTweener: {
    	serializable: true,
    	get: function() {
    		return this._ruleTweener;
    	},
    	set: function(newVal) {
    		this._ruleTweener = newVal;
    		this.needsDraw = true;
    	}
    },
    
    // The hintable we use to change the Property
    _myHintable: {
    	value: ""
    },
    myHintable: {
    	get: function() {
    		return this._myHintable;
    	},
    	set: function(newVal) {
    		this._myHintable = newVal;
    	}
    },
    _myHintableValue : {
    	value: null
    },
    myHintableValue: {
    	get: function() {
    		return this._myHintableValue;
    	},
    	set: function(newVal) {
    		this._myHintableValue = newVal;
    	}
    },
    
    // swapViews: Is a view swap happening?
    _swapViews : {
    	value: true
    },
    
    // whichView: which view should we show: hintable or propval
    _whichView : {
    	serializable: true,
    	value: "hintable"
    },
    whichView: {
    	serializable: true,
    	get: function() {
    		return this._whichView;
    	},
    	set: function(newVal) {
    		if (this._whichView !== newVal) {
    			if ((newVal !== "hintable") && (newVal !== "propval")) {
    				this.log("Error: Unknown view -"+newVal+"- requested for style.js.");
    				return;
    			}
    			this._whichView = newVal;
    			this._swapViews = true;
    			this.needsDraw = true;
    		}
    	}
    },
 
 	// styleID: the id for this style;
 	// Used to publish events
 	_styleID : {
 		serializable: true,
 		value: null
 	},
 	styleID: {
 		serializable: true,
 		get: function() {
 			return this._styleID;
 		},
 		set: function(newVal) {
 			this._styleID = newVal;
 			this.needsDraw = true;
 		}
 	},
    
    /* === END: Models === */
    
	/* === BEGIN : Draw cycle === */
    prepareForDraw: {
        value: function() {
        	this.init();
        }
    },
    draw: {
    	value: function() {
    		
    		if (this._swapViews === true) {
    			// Show the right thing
    			this._showView();
    		}
    	}
    },
    didDraw: {
    	value: function() {
    		if (this._swapViews === true) {
    			// View swap has been completed.
    			this._swapViews === false;
    		}
    	}
    },
	/* === END: Draw cycle === */
	
	/* === BEGIN: controllers === */
	
	// handleStylePropertyDblClick: What happens when the user double-clicks on the style property
	handleStylePropertyDblclick: {
		value: function(event) {
			this.whichView = "hintable";
		}
	},
	
	// handleHintableStop: What happens when the hintable issues its stop event
	handleHintableStop: {
		value: function(event) {
			// this should be handled via binding, but somehow is not. Setting manually for now.
		    this.editorProperty = this.myHintable.value;
		    
		    // Change views.
		    this.whichView = "propval";
		}
	},
	
	// Init: Initialize the component with some useful selectors and other defaults.
	init : {
		value: function() {

        	var arrHints = [],
        		i = 0;
        	
        	// Get the array of hints from _myTweenables:
        	for (i = 0; i < this._myTweenables.length; i++) {
        		arrHints.push(this._myTweenables[i].property)
        	}

			// Set useful information for the hintable
        	this.myHintable.editingClass = "editable2";
        	this.myHintable.hints = arrHints;
        	
        	// Bind a handler to the Hintable's change event
        	this.myHintable.identifier = "hintable";
        	this.myHintable.addEventListener("stop", this, false);
        	
        	// Add the click handler to the styleProperty: When the user double-clicks on it, we want to start the editor.
        	this.styleProperty.identifier = "styleProperty";
        	this.styleProperty.addEventListener("dblclick", this, false);
        	
        	// Get some selectors that we'll be using
			this.editorHottextContainer = this.element.querySelector(".editor-hottext");
			this.editorInputContainer = this.element.querySelector(".editor-input");
			this.editorColorContainer = this.element.querySelector(".editor-color");
			this.containerHintable = this.element.querySelector(".row-hintable");
			this.containerPropvals = this.element.querySelector(".container-propvals");
			this.valueEditorInput = this.element.querySelector(".editor-input input");
        	
		}
	},
	
	// showView: Show the appropriate view
	_showView : {
		value: function() {
			if (this.whichView === "hintable") {
				this.containerHintable.classList.remove("hidden");
				this.containerPropvals.classList.add("hidden");
				this.myHintable.start();
			} else {
				this.containerHintable.classList.add("hidden");
				this.containerPropvals.classList.remove("hidden");
				this._showTweener();
			}
		}
	},
	
	// showTweener: show the appropriate tweener
	_showTweener : {
		value: function() {
			// Which tweener should we show?
			// First, get the appropriate editor type from the data structure.
			var tweenable = {},
				i = 0;
				
			tweenable.tweener = "input";

			for (i = 0; i < this._myTweenables.length; i++) {
				if (this._myTweenables[i].property === this.editorProperty) {
					tweenable = this._myTweenables[i];
				}
			}

			if (tweenable.tweener === "hottext" ) {
				this.editorInputContainer.classList.add("hidden");
				this.editorColorContainer.classList.add("hidden");
				this.editorHottextContainer.classList.remove("hidden");
				this.valueEditorHottext.acceptableUnits = [tweenable.units];
				this.valueEditorHottext.units = tweenable.units;
				this.valueEditorHottext.minValue = tweenable.min;
				this.valueEditorHottext.maxValue = tweenable.max;
				this.valueEditorHottext.needsDraw = true;
			} else if (tweenable.tweener === "color" ) {
				this.editorInputContainer.classList.add("hidden");
				this.editorColorContainer.classList.remove("hidden");
				this.editorHottextContainer.classList.add("hidden");
				// TODO: set up color chip here.
			} else if (tweenable.tweener === "input"){
				this.editorInputContainer.classList.remove("hidden");
				this.editorColorContainer.classList.add("hidden");
				this.editorHottextContainer.classList.add("hidden");
				this.valueEditorInput.value = this.editorValue;
			} else {
				this.log("Warning: unknown tweenable -"+tweenable.tweener+"- specified in style.js.")
			}
		}
	},
	
	/* === END: Controllers === */
    
    _myTweenables: {
    	value: [
    		{
    			"property" : "background-color",
    			"tweener" : "color",
    			"units" : "",
    			"min" : "",
    			"max" : "",
    			"default" :"#FFFFFF"
    		},
    		{
    			"property" : "background-position-x",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : -9999,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "background-position-y",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : -9999,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "border-color",
    			"tweener" : "color",
    			"units" : "",
    			"min" : "",
    			"max" : "",
    			"default" : "#FFFFFF"
    		},
    		{
    			"property" : "border-width",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "border-bottom-color",
    			"tweener" : "color",
    			"units" : "",
    			"default" : "#FFFFFF"
    		},
    		{
    			"property" : "border-bottom-width",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "border-left-color",
    			"tweener" : "color",
    			"units" : "",
    			"default" : "#FFFFFF"
    		},
    		{
    			"property" : "border-left-width",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "border-top-color",
    			"tweener" : "color",
    			"units" : "",
    			"default" : "#FFFFFF"
    		},
    		{
    			"property" : "border-top-width",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "border-right-color",
    			"tweener" : "color",
    			"units" : "",
    			"default" : "#FFFFFF"
    		},
    		{
    			"property" : "border-right-width",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "border-radius",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "bottom",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : -9999,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "color",
    			"tweener" : "color",
    			"units" : "",
    			"default" : "#FFFFFF"
    		},
    		{
    			"property" : "margin",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : -9999,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "margin-left",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : -9999,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "margin-right",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : -9999,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "margin-top",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : -9999,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "margin-bottom",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : -9999,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "padding",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "padding-left",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "padding-right",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "padding-top",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "padding-bottom",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "max-height",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "max-width",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "min-height",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "min-width",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "opacity",
    			"tweener" : "hottext",
    			"units" : "%",
    			"min" : 0,
    			"max" : 100,
    			"default" : 100
    		},
    		{
    			"property" : "text-indent",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "top",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : -9999,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "right",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : -9999,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "left",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : -9999,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "width",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		},
    		{
    			"property" : "height",
    			"tweener" : "hottext",
    			"units" : "px",
    			"min" : 0,
    			"max" : 9999,
    			"default" : 0
    		}
    	]
    	
    },
	
	/* Begin: Logging routines */
    _boolDebug: {
    	enumerable: false,
    	value: false // set to true to enable debugging to console; false for turning off all debugging.
    },
    boolDebug: {
    	get: function() {
    		return this._boolDebug;
    	},
    	set: function(boolDebugSwitch) {
    		this._boolDebug = boolDebugSwitch;
    	}
    },
    log: {
    	value: function(strMessage) {
    		if (this.boolDebug) {
    			console.log(this.getLineNumber() + ": " + strMessage);
    		}
    	}
    },
    getLineNumber: {
    	value: function() {
			try {
			   throw new Error('bazinga')
			}catch(e){
				return e.stack.split("at")[3].split(":")[2];
			}
    	}
    }
	/* End: Logging routines */

});