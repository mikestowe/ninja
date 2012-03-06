/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var Collapser = require("js/panels/Timeline/Collapser").Collapser;
var Hintable = require("js/components/hintable.reel").Hintable;
var LayerStyle = require("js/panels/Timeline/Style.reel").LayerStyle;
var DynamicText = require("montage/ui/dynamic-text.reel").DynamicText;
var defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;
var nj = require("js/lib/NJUtils").NJUtils;

var Layer = exports.Layer = Montage.create(Component, {

    hasTemplate:{
        value: true
    },
    
    /* Begin: Models */
   
	/* Main collapser model: the main collapser for the layer */
    _mainCollapser : {
    	value: false
    },
    mainCollapser: {
    	get: function() {
    		return this._mainCollapser;
    	},
    	set: function(newVal) {
    		this._mainCollapser = newVal;
    	}
    },
    
    /* Style models: the array of styles, and the repetition that uses them */
    _arrLayerStyles : {
    	serializable: true,
		enumerable: true,
        serializable: true,
	    value: []
    },
    arrLayerStyles : {
    	serializable: true,
        enumerable: true,
        serializable: true,
    	get: function() {
    		return this._arrLayerStyles;
    	},
    	set: function(newVal) {
    		this._arrLayerStyles = newVal;
    	}
    },
    _styleRepetition : {
    	value: false
    },
    styleRepetition : {
    	get: function() {
    		return this._styleRepetition;
    	},
    	set: function(newVal) {
    		this._styleRepetition = newVal;
    	}
    },
    _styleCounter : {
    	value: 0
    },

	/* Layer models: the name, ID, and selected and animation booleans for the layer */
    _layerName:{
    	serializable: true,
        value:null,
        writable:true,
        enumerable:true
    },
    
    layerName:{
    	serializable: true,
        get:function(){
            return this._layerName;
        },
        set:function(newVal){
        	if (newVal !== this._layerName) {
        		this._layerEditable.value = newVal;
	        	this._layerName = newVal;
	        	this._layerEditable.needsDraw = true;
	        	this.needsDraw = true;
        	}
        	
        }
    },
    _layerID:{
        value:null,
        writable:true,
    	serializable: true,
        enumerable:true
    },

    layerID:{
    	serializable: true,
        get:function(){
            return this._layerID;
        },
        set:function(value){
            this._layerID = value;
        }
    },
    
    /* Position and Transform hottext values */
    _dtextPositionX : {
        value:null,
    	serializable: true,
    },

    dtextPositionX:{
    	serializable: true,
        get:function(){
            return this._dtextPositionX;
        },
        set:function(value){
        	if (this._dtextPositionX !== value) {
        		this._dtextPositionX = value;
        		this.needsDraw = true;
        	}
            
        }
    },
    
    _dtextPositionY : {
        value:null,
    	serializable: true,
    },

    dtextPositionY:{
    	serializable: true,
        get:function(){
            return this._dtextPositionY;
        },
        set:function(value){
        	if (this._dtextPositionY !== value) {
        		this._dtextPositionY = value;
        		this.needsDraw = true;
        	}
            
        }
    },
    
    _dtextScaleX : {
        value:null,
    	serializable: true,
    },

    dtextScaleX:{
    	serializable: true,
        get:function(){
            return this._dtextScaleX;
        },
        set:function(value){
        	if (this._dtextScaleX !== value) {
        		this._dtextScaleX = value;
        		this.needsDraw = true;
        	}
            
        }
    },
    
    _dtextScaleY : {
        value:null,
    	serializable: true,
    },

    dtextScaleY:{
    	serializable: true,
        get:function(){
            return this._dtextScaleY;
        },
        set:function(value){
        	if (this._dtextScaleY !== value) {
        		this._dtextScaleY = value;
        		this.needsDraw = true;
        	}
            
        }
    },
    
    _dtextSkewX : {
        value:null,
    	serializable: true,
    },

    dtextSkewX:{
    	serializable: true,
        get:function(){
            return this._dtextSkewX;
        },
        set:function(value){
        	if (this._dtextSkewX !== value) {
        		this._dtextSkewX = value;
        		this.needsDraw = true;
        	}
            
        }
    },
    
    _dtextSkewY : {
        value:null,
    	serializable: true,
    },

    dtextSkewY:{
    	serializable: true,
        get:function(){
            return this._dtextSkewY;
        },
        set:function(value){
        	if (this._dtextSkewY !== value) {
        		this._dtextSkewY = value;
        		this.needsDraw = true;
        	}
            
        }
    },
    
    _dtextRotate : {
        value:null,
    	serializable: true,
    },

    dtextRotate:{
    	serializable: true,
        get:function(){
            return this._dtextRotate;
        },
        set:function(value){
        	if (this._dtextRotate !== value) {
        		this._dtextRotate = value;
        		this.needsDraw = true;
        	}
            
        }
    },
    
    /* isSelected: whether or not the layer is currently selected. */
    _isSelected:{
        value: false,
        writable: true,
        serializable: true,
        enumerable: false
    },

    isSelected:{
        get:function(){
            return this._isSelected;
        },
        set:function(value){
        	if (value !== this._isSelected) {
        		// Only concerned about different values
        		if (value === false) {
        			// If changing from false to true, we need to deselect any associated styles
        			this.selectStyle(false);
        		}
        		this._isSelected = value;
        		this.needsDraw = true;
        	}
            
        }
    },
    
    /* isActive:  Whether or not the user is actively clicking within the layer; used to communicate state with
     * TimelinePanel.
     */
    _isActive: {
    	value: false
    },
    isActive: {
    	get: function() {
    		return this._isActive;
    	},
    	set: function(newVal) {
    		this._isActive = newVal;
    	}
    },
    
    
    _isAnimated:{
        value: false,
        writable: true,
        enumerable: false
    },

    isAnimated:{
        get:function(){
            return this._isAnimated;
        },
        set:function(value){
            this._isAnimated = value;
        }
    },
    _justAdded: {
    	value: false
    },
    _layerEditable : {
    	value: false
    },
    
    // Are the various collapsers collapsed or not
    _isMainCollapsed : {
    	serializable: true,
    	value: true
    },
    isMainCollapsed : {
    	serializable: true,
    	get: function() {
    		return this._isMainCollapsed;
    	},
    	set: function(newVal) {
    		this.log('layer.js: isMainCollapsed: ' + newVal);
    		if (newVal !== this._isMainCollapsed) {
    			this._isMainCollapsed = newVal;
    		}
    	}
    },
    
    _isTransformCollapsed : {
    	serializable: true,
    	value: true
    },
    isTransformCollapsed : {
    	serializable: true,
    	get: function() {
    		return this._isTransformCollapsed;
    	},
    	set: function(newVal) {
    		if (newVal !== this._isTransformCollapsed) {
    			this._isTransformCollapsed = newVal;
    			this.needsDraw = true;
    		}
    	}
    },
    
    _isPositionCollapsed : {
    	serializable: true,
    	value: true
    },
    isPositionCollapsed : {
    	serializable: true,
    	get: function() {
    		return this._isPositionCollapsed;
    	},
    	set: function(newVal) {
    		if (newVal !== this._isPositionCollapsed) {
    			this._isPositionCollapsed = newVal;
    			this.needsDraw = true;
    		}
    	}
    },
    
    _isStyleCollapsed : {
    	serializable: true,
    	value: true
    },
    isStyleCollapsed : {
    	serializable: true,
    	get: function() {
    		return this._isStyleCollapsed;
    	},
    	set: function(newVal) {
    		if (newVal !== this._isStyleCollapsed) {
    			this._isStyleCollapsed = newVal;
    			this.needsDraw = true;
    		}
    	}
    },
    _animateCollapser : {
    	serializable: true,
    	value: false
    },
    animateCollapser : {
    	serializable: true,
    	get: function() {
    		return this._animateCollapser;
    	},
    	set: function(newVal) {
    		this._animateCollapser = newVal;
    	}
    },
    

	/* END: Models */

	/* Begin: Draw cycle */
    prepareForDraw: {
        value: function() {
        	
        	// Initialize myself
			this.init();
			
        	var that = this;
        	
			this.positionCollapser = Collapser.create();
    		this.transformCollapser = Collapser.create();
    		this.styleCollapser = Collapser.create();
    		
        	// Make it editable!
        	this._layerEditable = Hintable.create();
        	this._layerEditable.element = this.titleSelector;
        	this.titleSelector.identifier = "selectorEditable";
        	this.titleSelector.addEventListener("click", this, false);
        	this._layerEditable.addEventListener("blur", function(event) {
        		that.handleSelectorEditableBlur(event);
        	}, false);
        	this._layerEditable.addEventListener("change", function(event) {
				that.dynamicLayerName.value = that._layerEditable.value;
				that.needsDraw = true;
        	}, false);
        	this._layerEditable.editingClass = "editable2";
        	this._layerEditable.value = this.layerName;
        	this._layerEditable.needsDraw = true;
        	
        	// Change the markup into collapsible sections using the nifty Collapser component!
        	this.mainCollapser = Collapser.create();
        	this.mainCollapser.clicker = this.clicker;
        	this.mainCollapser.myContent = this.myContent;
        	this.mainCollapser.contentHeight = 60;
        	this.myContent.style.height = "0px";
            this.mainCollapser.element = this.myContent;
            this.mainCollapser.isCollapsed = this.isMainCollapsed;
            this.mainCollapser.isAnimated = true;
            this.element.setAttribute("data-layerid", this.layerID);
            // Bind the collapser's isToggling property to the isMainCollapsed property,
            // so a change in one will affect the other.
            Object.defineBinding(this.mainCollapser, "isToggling", {
   				boundObject: this,
       		    boundObjectPropertyPath: "isMainCollapsed",
       		    oneway: false
   			});
            this.mainCollapser.clicker.addEventListener("click", this.handleMainCollapserClick.bind(this), false);
            
            /*
            this.mainCollapser.labelClickEvent = function(boolBypass) {
				var newEvent = document.createEvent("CustomEvent");
				newEvent.initCustomEvent("layerEvent", false, true);
				newEvent.layerEventLocale = "content-main";
				newEvent.layerEventType = "labelClick";
				newEvent.layerID = that.layerID;
				newEvent.bypassAnimation = boolBypass;
				defaultEventManager.dispatchEvent(newEvent);
				that.isMainCollapsed = that.mainCollapser.isCollapsed;
            }
            */
    		//this.mainCollapser.needsDraw = true;

            this.positionCollapser.clicker = this.clickerPosition;
            this.positionCollapser.myContent = this.contentPosition;
            this.positionCollapser.element = this.contentPosition;
            this.positionCollapser.contentHeight = 40;
            this.positionCollapser.isCollapsed = this.isPositionCollapsed;
            this.positionCollapser.isAnimated = false;
            // Bind the collapser's isToggling property to the isPositionCollapsed property,
            // so a change in one will affect the other.
            Object.defineBinding(this.positionCollapser, "isToggling", {
   				boundObject: this,
       		    boundObjectPropertyPath: "isPositionCollapsed",
       		    oneway: false
   			});
            this.positionCollapser.clicker.addEventListener("click", this.handlePositionCollapserClick.bind(this), false);
            
            /*
            this.positionCollapser.labelClickEvent = function(boolBypass) {
				var newEvent = document.createEvent("CustomEvent");
				newEvent.initCustomEvent("layerEvent", false, true);
				newEvent.layerEventLocale = "content-position";
				newEvent.layerEventType = "labelClick";
				newEvent.layerID = that.layerID;
				newEvent.bypassAnimation = boolBypass;
				defaultEventManager.dispatchEvent(newEvent);
				that.isPositionCollapsed = that.positionCollapser.isCollapsed;
            }
            */
            //this.positionCollapser.needsDraw = true;
            
            this.transformCollapser.clicker = this.clickerTransform;
            this.transformCollapser.myContent = this.contentTransform;
            this.transformCollapser.element = this.contentTransform;
            this.transformCollapser.contentHeight = 100;
            this.transformCollapser.isCollapsed = this.isTransformCollapsed;
            this.transformCollapser.isAnimated = false;
            // Bind the collapser's isToggling property to the isTransformCollapsed property,
            // so a change in one will affect the other.
            Object.defineBinding(this.transformCollapser, "isToggling", {
   				boundObject: this,
       		    boundObjectPropertyPath: "isTransformCollapsed",
       		    oneway: false
   			});
            this.transformCollapser.clicker.addEventListener("click", this.handleTransformCollapserClick.bind(this), false);
            
            
            /*
            this.transformCollapser.labelClickEvent = function(boolBypass) {
				var newEvent = document.createEvent("CustomEvent");
				newEvent.initCustomEvent("layerEvent", false, true);
				newEvent.layerEventLocale = "content-transform";
				newEvent.layerEventType = "labelClick";
				newEvent.layerID = that.layerID;
				newEvent.bypassAnimation = boolBypass;
				defaultEventManager.dispatchEvent(newEvent);
				that.isTransformCollapsed = that.transformCollapser.isCollapsed;
            }
            */
            //this.transformCollapser.needsDraw = true;
            
            this.styleCollapser.clicker = this.clickerStyle;
            this.styleCollapser.myContent = this.contentStyle;
            this.styleCollapser.element = this.contentStyle;
            this.styleCollapser.isCollapsed = this.isStyleCollapsed;
            this.styleCollapser.contentHeight = 0;
            this.styleCollapser.isAnimated = false;
            // Bind the collapser's isToggling property to the isStyleCollapsed property,
            // so a change in one will affect the other.
            Object.defineBinding(this.styleCollapser, "isToggling", {
   				boundObject: this,
       		    boundObjectPropertyPath: "isStyleCollapsed",
       		    oneway: false
   			});
            this.styleCollapser.clicker.addEventListener("click", this.handleStyleCollapserClick.bind(this), false);
            
            
            /*
            this.styleCollapser.labelClickEvent = function(boolBypass) {
				var newEvent = document.createEvent("CustomEvent");
				newEvent.initCustomEvent("layerEvent", false, true);
				newEvent.layerEventLocale = "content-style";
				newEvent.layerEventType = "labelClick";
				newEvent.layerID = that.layerID;
				newEvent.bypassAnimation = boolBypass;
				defaultEventManager.dispatchEvent(newEvent);
				that.isStyleCollapsed = that.styleCollapser.isCollapsed;
            }
            */
            //this.styleCollapser.needsDraw = true;

            // Add event listeners to add and delete style buttons
            this.buttonAddStyle.identifier = "addStyle";
            this.buttonAddStyle.addEventListener("click", this, false);
            
            this.buttonDeleteStyle.identifier = "deleteStyle";
            this.buttonDeleteStyle.addEventListener("click", this, false);
            
            // Add mousedown listener to set isActive
            this.element.addEventListener("mousedown", this, false);
            this.element.addEventListener("click", this, false);

        }
    },
    draw: {
    	value: function() {

    		// Coordinate the collapsers
    		this.log('layer.js draw')
            if (this.mainCollapser.isCollapsed !== this.isMainCollapsed) {
            	this.log('layer.js draw: this.animateCollapser ' + this.animateCollapser)
            	this.mainCollapser.bypassAnimation = this.animateCollapser;
            	this.mainCollapser.toggle();
            }
            if (this.positionCollapser.isCollapsed !== this.isPositionCollapsed) {
            	this.positionCollapser.bypassAnimation = this.animateCollapser;
            	this.positionCollapser.toggle();
            }
            if (this.transformCollapser.isCollapsed !== this.isTransformCollapsed) {
            	this.transformCollapser.bypassAnimation = this.animateCollapser;
            	this.transformCollapser.toggle();
            }
            if (this.styleCollapser.isCollapsed !== this.isStyleCollapsed) {
            	this.styleCollapser.bypassAnimation = this.animateCollapser;
            	this.styleCollapser.toggle();
            }
            if (this.isSelected) {
            	this.element.classList.add("selected");
            } else {
            	this.element.classList.remove("selected");
            }
    	}
    },
	/* End: Draw cycle */
	
	/* Begin: Controllers */
	
	// Initialize a just-created layer with some basic defaults and needed selectors.
	init: {
		value: function() {
			// Default some vars
			//this.arrLayerStyles = [];
			
			// Get some selectors.
        	this.label = this.element.querySelector(".label-layer");
        	this.titleSelector = this.label.querySelector(".collapsible-label");
        	this.clicker = this.element.querySelector(".collapsible-clicker");
        	this.myContent = this.element.querySelector(".content-layer");
        	this.clickerPosition = this.element.querySelector(".clicker-position");
        	this.contentPosition = this.element.querySelector(".content-position");
        	this.clickerTransform = this.element.querySelector(".clicker-transform");
        	this.contentTransform = this.element.querySelector(".content-transform");
        	this.clickerStyle = this.element.querySelector(".clicker-style");
        	this.contentStyle = this.element.querySelector(".content-style");
        	this.buttonAddStyle = this.element.querySelector(".button-add");
        	this.buttonDeleteStyle = this.element.querySelector(".button-delete");
		}
	},
    selectLayer:{
        value:function(){
            // this.mainCollapser.header.classList.add("layerSelected");
            this.element.classList.add("layerSelected");
            this.isSelected = true;
        }
    },
    deselectLayer:{
        value:function(){
            // this.mainCollapser.header.classList.remove("layerSelected");
            this.element.classList.remove("layerSelected");
            this.isSelected = false;
        }
    },
	addStyle : {
		value: function() {
			// Add a new style rule.  It should be added above the currently selected rule, 
			// Or at the end, if no rule is selected.

			var newLength = 0, 
				mySelection = 0,
				// newStyle = LayerStyle.create(),
				newStyle = {},
				newEvent = document.createEvent("CustomEvent");
			
			this.isStyleCollapsed = false;
			
			newEvent.initCustomEvent("layerEvent", false, true);
			newEvent.layerEventLocale = "styles";
			newEvent.layerEventType = "newStyle";
			newEvent.layerID = this.layerID;
			newEvent.styleID = this.layerID + "@" + this._styleCounter;
			
			newStyle.styleID = newEvent.styleID;
			newStyle.whichView = "hintable";
			newStyle.editorProperty = "";
			newStyle.editorValue = "";
			newStyle.ruleTweener = false;
			newStyle.isSelected = false;

			if (!!this.styleRepetition.selectedIndexes) {
				mySelection = this.styleRepetition.selectedIndexes[0];
				this.arrLayerStyles.splice(mySelection, 0, newStyle);
				//this.styleRepetition.selectedIndexes = [mySelection];
				this.selectStyle(mySelection);
			} else {
				newLength = this.arrLayerStyles.length;
				this.arrLayerStyles.push(newStyle);
				mySelection = this.arrLayerStyles.length;
				// this.styleRepetition.selectedIndexes = [mySelection-1];
				this.selectStyle(mySelection-1);
			}
			
			// Set up the event info and dispatch the event

			newEvent.styleSelection = mySelection;
			//defaultEventManager.dispatchEvent(newEvent);

		}
	},
	deleteStyle : {
		value: function() {
			var newEvent = document.createEvent("CustomEvent"),
				selectedIndex = 0;
			if (this.arrLayerStyles.length > 0) {
				if (!!this.styleRepetition.selectedIndexes) {
					
					selectedIndex = this.styleRepetition.selectedIndexes[0];

					// Set up the event info and dispatch the event
					newEvent.initCustomEvent("layerEvent", false, true);
					newEvent.layerEventLocale = "styles";
					newEvent.layerEventType = "deleteStyle";
					newEvent.layerID = this.layerID;
					newEvent.styleID = this.arrLayerStyles[selectedIndex].styleID;
					newEvent.styleSelection = selectedIndex;
					//defaultEventManager.dispatchEvent(newEvent);
					
					// Delete the style from the view
					this.arrLayerStyles.splice(selectedIndex, 1);
					
					// Was that the last style?
					if (this.arrLayerStyles.length === 0) {
						this.buttonDeleteStyle.classList.add("disabled");
					}
					
				}
			}
		}
	},
	selectStyle : {
		value: function(styleIndex) {

    		// Select a style based on its index.
    		// use layerIndex = false to deselect all styles.
    		var i = 0,
    			arrLayerStylesLength = this.arrLayerStyles.length;

    		// First, update this.arrStyles[].isSelected
    		for (i = 0; i < arrLayerStylesLength; i++) {
    			if (i === styleIndex) {
    				this.arrLayerStyles[i].isSelected = true;
    			} else {
    				this.arrLayerStyles[i].isSelected = false;
    			}
    		}
    		
    		// Next, update this.styleRepetition.selectedIndexes.
    		if (styleIndex !== false) {
    			this.styleRepetition.selectedIndexes = [styleIndex];
    			this.buttonDeleteStyle.classList.remove("disabled");
    		} else {
    			this.styleRepetition.selectedIndexes = null;
    			if (typeof(this.buttonDeleteStyle) !== "undefined") {
    				this.buttonDeleteStyle.classList.add("disabled");
    			}
    		}
			
		}
	},
    getActiveStyleIndex : {
    	value: function() {
    		// Searches through the styles and looks for one that has
    		// set its isActive flag to true.
    		var i = 0, 
    			returnVal = false,
    			arrLayerStylesLength = this.arrLayerStyles.length;
    		
    		for (i = 0; i < arrLayerStylesLength; i++) {
    			if (this.arrLayerStyles[i].isActive === true) {
    				returnVal = i;
    				this.arrLayerStyles[i].isActive = false;
    			}
    		}
    		return returnVal;
    	}
    },
	/* End: Controllers */
    
	/* Begin: Event handlers */
	handleAddStyleClick: {
		value: function(event) {
			this.addStyle();
		}
	},
	handleDeleteStyleClick: {
		value: function(event) {
			this.deleteStyle();
		}
	},
	handleSelectorEditableClick: {
		value: function(event) {
		}
	},
	handleSelectorEditableBlur : {
		value: function(event) {
        	this.titleSelector.scrollLeft = 0;
		}
	},
	handleSelectorEditableChange: {
		value: function(event) {
			this.layerName = this.dynamicLayerName.value;
			this.needsDraw = true;
		}
	},
	handleMousedown: {
		value: function(event) {
			this.isActive = true;
			var ptrParent = nj.queryParentSelector(event.target, ".content-style");
			if (ptrParent !== false) {
				this.selectStyle(this.getActiveStyleIndex());
			}
		}
	},
	handleLayerClick : {
		value: function(event) {
			var ptrParent = nj.queryParentSelector(event.target, ".content-style");
			if (ptrParent !== false) {
				var myIndex = this.getActiveStyleIndex();
				this.selectStyle(myIndex);
			}
		}
	},
	handleMainCollapserClick : {
		value: function(event) {
			this.mainCollapser.bypassAnimation = false;
			this.animateCollapser = true;
			if (this.isMainCollapsed) {
				this.isMainCollapsed = false;
			} else {
				this.isMainCollapsed = true;
			}
		}
	},
	handlePositionCollapserClick : {
		value: function(event) {
			this.positionCollapser.bypassAnimation = false;
			//this.animateCollapser = true;
			if (this.isPositionCollapsed) {
				this.isPositionCollapsed = false;
			} else {
				this.isPositionCollapsed = true;
			}
		}
	},
	handleTransformCollapserClick : {
		value: function(event) {
			this.transformCollapser.bypassAnimation = false;
			//this.animateCollapser = true;
			if (this.isTransformCollapsed) {
				this.isTransformCollapsed = false;
			} else {
				this.isTransformCollapsed = true;
			}
		}
	},
	handleStyleCollapserClick : {
		value: function(event) {
			this.styleCollapser.bypassAnimation = false;
			//this.animateCollapser = true;
			if (this.isStyleCollapsed) {
				this.isStyleCollapsed = false;
			} else {
				this.isStyleCollapsed = true;
			}
		}
	},
	/* End: Event handlers */
	
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