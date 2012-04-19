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
	    value: []
    },
    arrLayerStyles : {
    	serializable: true,
        enumerable: true,
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
    	value: "Default Layer Name"
    },
    
    layerName:{
    	serializable: true,
        get:function(){
            return this._layerName;
        },
        set:function(newVal){

			this._layerEditable.value = newVal;
	    	this._layerName = newVal;
	    	this.layerData.layerName = newVal;
	    	if (typeof(this.dynamicLayerName) !== "undefined") {
	    		this.dynamicLayerName.value = newVal;
	    	}
        }
    },
    _layerID:{
    	value: "Default Layer ID"
    },

    layerID:{
    	serializable: true,
        get:function(){
            return this._layerID;
        },
        set:function(value){
            this._layerID = value;
            this.layerData.layerID = value;
        }
    },
    _layerTag:{
    	value: "tag"
    },
    
    layerTag:{
    	serializable: true,
        get:function(){
            return this._layerTag;
        },
        set:function(newVal){
	    	this._layerTag = newVal;
	    	this.layerData.layerTag = newVal;
        }
    },
    _docUUID : {
    	value: null
    },
    docUUID : {
    	serializable: true,
    	get: function() {
    		return this._docUUID;
    	},
    	set: function(newVal) {
    		this._docUUID = newVal;
    	}
    },
    /* Position and Transform hottext values */
    _dtextPositionX : {
        value:null,
    	serializable: true
    },

    dtextPositionX:{
    	serializable: true,
        get:function(){
            return this._dtextPositionX;
        },
        set:function(value){
        	if (this._dtextPositionX !== value) {
        		this._dtextPositionX = value;
        		this.layerData.dtextPositionX = value;
        	}
            
        }
    },
    
    _dtextPositionY : {
        value:null,
    	serializable: true
    },

    dtextPositionY:{
    	serializable: true,
        get:function(){
            return this._dtextPositionY;
        },
        set:function(value){
        	if (this._dtextPositionY !== value) {
        		this._dtextPositionY = value;
        		this.layerData.dtextPositionY = value;
        	}
            
        }
    },
    
    _dtextScaleX : {
        value:null,
    	serializable: true
    },

    dtextScaleX:{
    	serializable: true,
        get:function(){
            return this._dtextScaleX;
        },
        set:function(value){
        	if (this._dtextScaleX !== value) {
        		this._dtextScaleX = value;
        		this.layerData.dtextScaleX = value;
        	}
            
        }
    },
    
    _dtextScaleY : {
        value:null,
    	serializable: true
    },

    dtextScaleY:{
    	serializable: true,
        get:function(){
            return this._dtextScaleY;
        },
        set:function(value){
        	if (this._dtextScaleY !== value) {
        		this._dtextScaleY = value;
        		this.layerData.dtextScaleY = value;
        	}
            
        }
    },
    
    _dtextSkewX : {
        value:null,
    	serializable: true
    },

    dtextSkewX:{
    	serializable: true,
        get:function(){
            return this._dtextSkewX;
        },
        set:function(value){
        	if (this._dtextSkewX !== value) {
        		this._dtextSkewX = value;
        		this.layerData.dtextSkewX = value;
        	}
            
        }
    },
    
    _dtextSkewY : {
        value:null,
    	serializable: true
    },

    dtextSkewY:{
    	serializable: true,
        get:function(){
            return this._dtextSkewY;
        },
        set:function(value){
        	if (this._dtextSkewY !== value) {
        		this._dtextSkewY = value;
        		this.layerData.dtextSkewY = value;
        	}
            
        }
    },
    
    _dtextRotate : {
        value:null,
    	serializable: true
    },

    dtextRotate:{
    	serializable: true,
        get:function(){
            return this._dtextRotate;
        },
        set:function(value){
        	if (this._dtextRotate !== value) {
        		this._dtextRotate = value;
        		this.layerData.dtextRotate = value;
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
        			// If changing from true to false, we need to deselect any associated styles
        			this.selectStyle(false);
        		}
        		this._isSelected = value;
        		this.layerData.isSelected = value;
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
    		this.layerData.isActive = newVal;
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
            this.layerData.isAnimated = value;
        }
    },
    _isVisible:{
        value: true
    },

    isVisible:{
        get:function(){
            return this._isVisible;
        },
        set:function(value){
        	if (this._isVisible !== value) {
        		this._isVisible = value;
        		if (value === true) {
        			this.element.classList.remove("layer-hidden");
        		} else {
        			this.element.classList.add("layer-hidden");
        		}
        	}
        	this.layerData.isVisible = value;
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
			this._isMainCollapsed = newVal;
			this.layerData.isMainCollapsed = newVal;

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
			this._isTransformCollapsed = newVal;
			this.layerData.isTransformCollapsed = newVal;
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
			this._isPositionCollapsed = newVal;
			this.layerData.isPositionCollapsed = newVal;
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
			this._isStyleCollapsed = newVal;
			this.layerData.isStyleCollapsed = newVal;
    	}
    },
    _bypassAnimation : {
    	serializable: true,
    	value: false
    },
    bypassAnimation : {
    	serializable: true,
    	get: function() {
    		return this._bypassAnimation;
    	},
    	set: function(newVal) {
    		if (typeof(this.layerData) !== "undefined") {
	    		this._bypassAnimation = newVal;
	    		this.layerData.bypassAnimation = newVal;	
    		}
    	}
    },
    
    // Is this the first draw?
    _isFirstDraw : {
    	value: true
    },

    _layerData:{
        serializable:true,
        value:{}
    },

    layerData:{
        serializable:true,
        get:function(){
            return this._layerData;
        },
        set:function(val){
            this._layerData = val;
            if(this._layerData){
                this.setData(true);
            }
        }
    },

    setData:{
        value:function(boolNeedsDraw){
        	if (typeof(this._layerData) === "undefined")  {
        		return;
        	} 
        	
        	if (typeof(this._layerData.layerName) === "undefined") {
        		return;
        	}
        	
        	if (typeof(boolNeedsDraw) === "undefined") {
        		boolNeedsDraw = false;
        	}
        	
            this.layerName = this.layerData.layerName;
            this.layerID = this.layerData.layerID;
            this.arrLayerStyles = this.layerData.arrLayerStyles;
            this.isMainCollapsed = this.layerData.isMainCollapsed;
            this.isPositionCollapsed = this.layerData.isPositionCollapsed;
            this.isTransformCollapsed = this.layerData.isTransformCollapsed;
            this.isSelected = this.layerData.isSelected;
            this.isActive = this.layerData.isActive;
            this.isStyleCollapsed = this.layerData.isStyleCollapsed;
            this.bypassAnimation = this.layerData.bypassAnimation;
            this.dtextPositionX = this.layerData.dtextPositionX;
            this.dtextPositionY = this.layerData.dtextPositionY;
            this.dtextSkewX = this.layerData.dtextSkewX;
            this.dtextSkewY = this.layerData.dtextSkewY;
            this.dtextScaleX = this.layerData.dtextScaleX;
            this.dtextScaleY = this.layerData.dtextScaleY;
            this.dtextRotate = this.layerData.dtextRotate;
            this._isFirstDraw = this.layerData._isFirstDraw;
            this.layerTag = this.layerData.layerTag;
            this.isVisible = this.layerData.isVisible;
            this.isAnimated = this.layerData.isAnimated;
            this.needsDraw = boolNeedsDraw;
        }
    },
    
    /* Data binding point and outgoing binding trigger method */
    _bindingPoint : {
    	serializable: true,
    	value : {}
    },
    bindingPoint: {
    	serializable: true,
    	get: function() {
    		return this._bindingPoint;
    	},
    	set: function(newVal) {
    		if (newVal !== this._bindingPoint) {
	    		this._bindingPoint = newVal;
	    		this.setData(true);
    		}
    	}
    },
    
    triggerOutgoingBinding : {
    	value: function() {
    		if (this.layerData.triggerBinding === true) {
    			this.layerData.triggerBinding = false;
    		} else {
    			this.layerData.triggerBinding = true;
    		}
    	}
    },
	/* END: Models */

	/* Begin: Draw cycle */
    prepareForDraw: {
        value: function() {
        	
        	// Initialize myself
			this.init();
			
        	// Make it editable!
        	this._layerEditable = Hintable.create();
        	this._layerEditable.element = this.titleSelector;
        	this.titleSelector.identifier = "selectorEditable";
        	this.titleSelector.addEventListener("click", this, false);
        	this._layerEditable.addEventListener("blur", this.handleSelectorEditableBlur.bind(this), false);
        	this._layerEditable.addEventListener("change", this.handleLayerNameChange.bind(this), false);
        	this._layerEditable.editingClass = "editable2";
        	this._layerEditable.value = this.layerName;
        	
        	// Collapser event handlers.
            this.mainCollapser.clicker.addEventListener("click", this.handleMainCollapserClick.bind(this), false);
            this.positionCollapser.clicker.addEventListener("click", this.handlePositionCollapserClick.bind(this), false);
            this.transformCollapser.clicker.addEventListener("click", this.handleTransformCollapserClick.bind(this), false);
            this.styleCollapser.clicker.addEventListener("click", this.handleStyleCollapserClick.bind(this), false);

            // Add event listeners to add and delete style buttons
            this.buttonAddStyle.addEventListener("click", this.handleAddStyleClick.bind(this), false);
            this.buttonDeleteStyle.addEventListener("click", this.handleDeleteStyleClick.bind(this), false);
            
            // Add mousedown listener to set isActive
            this.element.addEventListener("mousedown", this, false);
            this.element.addEventListener("click", this, false);
            
			// Drag and drop event handlers
			this.myLabel.addEventListener("mouseover", this.handleMouseover.bind(this), false);
			this.myLabel.addEventListener("mouseout", this.handleMouseout.bind(this), false);
			this.element.addEventListener("dragover", this.handleDragover.bind(this), false);
			this.element.addEventListener("dragleave", this.handleDragleave.bind(this), false);
			this.element.addEventListener("dragstart", this.handleDragstart.bind(this), false);
			this.element.addEventListener("drop", this.handleDrop.bind(this), false);
        }
    },
    draw: {
    	value: function() {
            if (this.isSelected) {
            	this.element.classList.add("selected");
            } else {
            	this.element.classList.remove("selected");
            }
    	}
    },
    didDraw: {
    	value: function() {
    		if (this._isFirstDraw === true) {
    			if (this.isSelected === true) {
    				if (this.application.ninja.currentDocument._uuid === this._docUUID) {
		    			// Once we're done drawing the first time we need to tell the TimelinePanel if
		    			// this layer is supposed to be selected.
		    			//console.log('layerName ' +  this.layerName);
		    			this.parentComponent.parentComponent.selectedLayerID = this.layerID;
					}
    			}
    			this._isFirstDraw = false;
    		}
    	}
    },
	/* End: Draw cycle */
	
	/* Begin: Controllers */
	
	// Initialize a just-created layer
	init: {
		value: function() {
			// Get some selectors.
        	this.label = this.element.querySelector(".label-layer");
        	this.titleSelector = this.label.querySelector(".collapsible-label");
        	this.buttonAddStyle = this.element.querySelector(".button-add");
        	this.buttonDeleteStyle = this.element.querySelector(".button-delete");
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
			this.layerData.isStyleCollapsed = false;
			this.triggerOutgoingBinding();
			
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
			defaultEventManager.dispatchEvent(newEvent);


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
					defaultEventManager.dispatchEvent(newEvent);
					
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
	handleLayerNameChange: {
		value: function(event) {		
			this.dynamicLayerName.value = this._layerEditable.value;
			this.application.ninja.timeline.currentLayerSelected.layerData.elementsList[0].dataset.storedLayerName = this.dynamicLayerName.value;
			this.needsDraw = true;
			this.application.ninja.documentController.activeDocument.needsSave = true;
		}
	},
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
	handleSelectorEditableBlur : {
		value: function(event) {
        	this.titleSelector.scrollLeft = 0;
        	this.handleSelectorEditableChange(event);
		}
	},
	handleSelectorEditableChange: {
		value: function(event) {
			var newVal = this._layerEditable.enteredValue;
			if (this._layerEditable.enteredValue.length === 0) {
				newVal = this._layerEditable._preEditValue;
			}
			this.dynamicLayerName.value = newVal;
			this.layerName = newVal;
			this.application.ninja.timeline.currentLayerSelected.layerData.elementsList[0].dataset.storedLayerName = newVal;
			this.application.ninja.documentController.activeDocument.needsSave = true;
			this.needsDraw = true;
		}
	},
	handleMousedown: {
		value: function(event) {
			this.layerData.isActive = true;
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
			this.bypassAnimation = false;
			this.layerData.bypassAnimation = false;
			if (this.isMainCollapsed) {
				this.isMainCollapsed = false;
			} else {
				this.isMainCollapsed = true;
			}
			this.triggerOutgoingBinding();
		}
	},
	handlePositionCollapserClick : {
		value: function(event) {
			this.positionCollapser.bypassAnimation = false;
			this.bypassAnimation = false;
			this.layerData.bypassAnimation = false;
			if (this.isPositionCollapsed) {
				this.isPositionCollapsed = false;
			} else {
				this.isPositionCollapsed = true;
			}
			this.triggerOutgoingBinding();
		}
	},
	handleTransformCollapserClick : {
		value: function(event) {
			this.transformCollapser.bypassAnimation = false;
			this.bypassAnimation = false;
			this.layerData.bypassAnimation = false;
			if (this.isTransformCollapsed) {
				this.isTransformCollapsed = false;
			} else {
				this.isTransformCollapsed = true;
			}
			this.triggerOutgoingBinding();
		}
	},
	handleStyleCollapserClick : {
		value: function(event) {
			this.styleCollapser.bypassAnimation = false;
			this.bypassAnimation = false;
			this.layerData.bypassAnimation = false;
			if (this.isStyleCollapsed) {
				this.isStyleCollapsed = false;
			} else {
				this.isStyleCollapsed = true;
			}
			this.triggerOutgoingBinding();
		}
	},
	handleMouseover: {
		value: function(event) {
			this.element.draggable = true;
		}
	},
	handleMouseout: {
		value: function(event) {
			this.element.draggable = false;
		}
	},
	handleDragenter: {
		value: function(event) {
		}
	},
	handleDragleave: {
		value: function(event) {
			this.element.classList.remove("dragOver");
		}
	},
	handleDragstart: {
		value: function(event) {
			this.parentComponent.parentComponent.dragLayerID = this.layerID;
            event.dataTransfer.setData('Text', 'Layer');
		}
	},
	handleDragover: {
		value: function(event) {
			event.preventDefault();
			this.element.classList.add("dragOver");
			event.dataTransfer.dropEffect = "move";
			return false;
		}
	},
	
	handleDrop : {
		value: function(event) {
			event.stopPropagation();
			this.element.classList.remove("dragOver");
			if (this.parentComponent.parentComponent.dragLayerID !== this.layerID) {
				this.parentComponent.parentComponent.dropLayerID = this.layerID;
			}
			return false;
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
