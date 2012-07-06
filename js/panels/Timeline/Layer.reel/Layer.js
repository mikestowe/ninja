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

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var Collapser = require("js/panels/Timeline/Collapser").Collapser;
var Hintable = require("js/components/hintable.reel").Hintable;
var LayerStyle = require("js/panels/Timeline/Style.reel").LayerStyle;
var DynamicText = require("montage/ui/dynamic-text.reel").DynamicText;
var defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;
var nj = require("js/lib/NJUtils").NJUtils;
var ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

var Layer = exports.Layer = Montage.create(Component, {

    dynamicLayerTag: {
        value: null,
        serializable: true
    },

    positionCollapser: {
        value: null,
        serializable: true
    },

    transformCollapser: {
        value: null,
        serializable: true
    },

    styleCollapser: {
        value: null,
        serializable: true
    },

    clickerMain: {
        value: null,
        serializable: true
    },

    myLabel: {
        value: null,
        serializable: true
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
    	},
        serializable: true
    },
    
    /* Style models: the array of styles, and the repetition that uses them */
    _arrLayerStyles : {
	    value: []
    },
    arrLayerStyles : {
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
        serializable: true,
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
    styleCounter:{
        serializable:true,
        get:function () {
            return this._styleCounter;
        },
        set:function (newVal) {
            this._styleCounter = newVal;
        }
    },
    _selectedStyleIndex: {
    	value: false
    },
    selectedStyleIndex: {
    	get: function() {
    		return this._selectedStyleIndex;
    	},
    	set: function(newVal) {
    		if (typeof(newVal) === "undefined") {
    			return;
    		}
    		if (newVal !== this._selectedStyleIndex) {
    			this._selectedStyleIndex = newVal;
    			this.layerData.selectedStyleIndex = newVal;
    		}
    	}
    },
    _storedStyleIndex : {
        value: false
    },

    /* Layer models: the name, ID, and selected and animation booleans for the layer */
    _layerName:{
    	value: ""
    },
    
    layerName:{
    	serializable: true,
        get:function(){
            return this._layerName;
        },
        set:function(newVal){
			if (this._layerEditable.value !== newVal) {
				this._layerEditable.value = newVal;
			}
			if (this._layerName !== newVal) {
				this._layerName = newVal;
			}
			if (this.layerData.layerName !== newVal) {
				this.layerData.layerName = newVal;
			}

	    	if (typeof(this.dynamicLayerName) !== "undefined") {
	    		if (this.dynamicLayerName.value !== newVal) {
	    			this.dynamicLayerName.value = newVal;
	    		}
	    	}
	    	this.needsDraw = true;
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
    
    _stageElement: {
    	value: null
    },
    
    stageElement: {
    	get: function() {
    		return this._stageElement;
    	},
    	set: function(newVal) {
    		this._stageElement = newVal;
    		this.layerData.stageElement = newVal;
    	}
    },
    
    
    _elementsList : {
    	value: []
    },
    elementsList : {
    	serializable: true,
    	get: function() {
    		return this._elementsList;
    	},
    	set: function(newVal) {
    		this._elementsList = newVal;
    	}
    },
    
    /* Position and Size hottext values */
    _dtextPositionX : {
        value:null
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
        value:null
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
        value:null
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
        value:null
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
    
    /* isSelected: whether or not the layer is currently selected. */
    _isSelected:{
        value: false
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
        		} else {
        		    if (this._storedStyleIndex !== false) {
        		        this.selectStyle(this._storedStyleIndex);
        		    }
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
        serializable:true,
    	get: function() {
    		return this._isActive;
    	},
    	set: function(newVal) {
    		this._isActive = newVal;
    		this.layerData.isActive = newVal;
    	}
    },
    
    
    _isAnimated:{
        value: false
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

    _isLock:{
        value: false
    },

    isLock:{
        get:function(){
            return this._isLock;
        },
        set:function(value){
            if (this._isLock !== value) {
                this._isLock = value;

            }
            this.layerData.isLock = value;
        }
    },

    _isHidden:{
        value: false
    },

    isHidden:{
        get:function(){
            return this._isHidden;
        },
        set:function(value){
            if (this._isHidden !== value) {
                this._isHidden = value;

            }
            this.layerData._isHidden = value;
        }
    },

    
    _justAdded: {
    	value: false
    },
    _layerEditable : {
    	value: false
    },

    _dynamicLayerName:{
        value:true
    },
    dynamicLayerName:{
        serializable:true,
        get:function () {
            return this._dynamicLayerName;
        },
        set:function (newVal) {
            this._dynamicLayerName = newVal;
        }
    },
    
    // Are the various collapsers collapsed or not
    _isMainCollapsed : {
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
    
    _isPositionCollapsed : {
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
        value:{}
    },

    layerData:{
    	serializable: true,
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
            this.stageElement = this.layerData.stageElement
            this.arrLayerStyles = this.layerData.arrLayerStyles;
            this.isMainCollapsed = this.layerData.isMainCollapsed;
            this.isPositionCollapsed = this.layerData.isPositionCollapsed;
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
            //this._isFirstDraw = this.layerData._isFirstDraw;
            this.layerTag = this.layerData.layerTag;
            this.isVisible = this.layerData.isVisible;
            this.isAnimated = this.layerData.isAnimated;
            this.docUUID = this.layerData.docUUID;
            this.selectedStyleIndex = this.layerData.selectedStyleIndex;
            this.needsDraw = boolNeedsDraw;
            this.isLock = this.layerData.isLock;
            this.isHidden = this.layerData.isHidden;
        }
    },
    
    /* Data binding point and outgoing binding trigger method */
    _bindingPoint : {
    	value : {}
    },
    bindingPoint: {
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
            this.layerData.triggerBinding = !this.layerData.triggerBinding;
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
            this.styleCollapser.clicker.addEventListener("click", this.handleStyleCollapserClick.bind(this), false);
            this.layerLock.addEventListener("click",this.handleLayerLock.bind(this),false);
            this.visibilityButton.addEventListener("click",this.handleLayerVisibility.bind(this),false);

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

            this.eventManager.addEventListener("elementChange",this,false);

            this.leftControl.identifier = "left";
            this.leftControl.addEventListener("changing",this,false);
            this.leftControl.addEventListener("change",this,false);

            this.topControl.identifier = "top";
            this.topControl.addEventListener("changing",this,false);
            this.topControl.addEventListener("change",this,false);

            this.widthControl.identifier = "width";
            this.widthControl.addEventListener("changing",this,false);
            this.widthControl.addEventListener("change",this,false);

            this.heightControl.identifier = "height";
            this.heightControl.addEventListener("changing",this,false);
            this.heightControl.addEventListener("change",this,false);

            el=this.layerData.stageElement;
            this.dtextPositionX = parseFloat(ElementsMediator.getProperty(el, "left"));
            this.dtextPositionY = parseFloat(ElementsMediator.getProperty(el, "top"));
            this.dtextScaleY = parseFloat(ElementsMediator.getProperty(el, "height"));
            this.dtextScaleX= parseFloat(ElementsMediator.getProperty(el, "width"));
        }
    },

    draw: {
    	value: function() {
    		var boolHasClass = this.element.classList.contains("layerSelected");
            if (this.isSelected && !boolHasClass) {
            	//console.log('Layer.draw, adding selection for layer ', this.layerName)
            	this.element.classList.add("layerSelected");
            	
            }
			if (!this.isSelected && boolHasClass) {
            	//console.log('Layer.draw, removing selection for layer ', this.layerName)
            	this.element.classList.remove("layerSelected");
            }
            // Enable or disable the delete style button as appropriate
            if (this.isSelected) {
            	if (this.selectedStyleIndex !== false) {
            		this.selectStyle(this.selectedStyleIndex);
            		this.buttonDeleteStyle.classList.remove("disabled");
            	}
            } else {
            	this.buttonDeleteStyle.classList.add("disabled");
            }
            
            // Update layer name?
            if (this.layerName !== this.layer_label_text.innerText) {
            	this.layer_label_text.innerText = this.layerName;
            }
    	}
    },
    didDraw: {
    	value: function() {
    		// console.log("Layer.didDraw: Layer "+ this.layerID );
    		if (this._isFirstDraw === true) {
    			this._isFirstDraw = false;
    			this.layerData._isFirstDraw = false;
	    		
	    		if (this.isMainCollapsed === false) {
					this.mainCollapser.myContent.style.height = "auto";
					this.mainCollapser.myContent.classList.remove(this.mainCollapser.collapsedClass);
					this.mainCollapser.clicker.classList.remove(this.mainCollapser.collapsedClass);
	    		}
	    		if (this.isPositionCollapsed === false) {
					this.positionCollapser.myContent.style.height = "auto";
					this.positionCollapser.myContent.classList.remove(this.positionCollapser.collapsedClass);
					this.positionCollapser.clicker.classList.remove(this.positionCollapser.collapsedClass);
	    		}
	    		if (this.isStyleCollapsed === false) {
					this.styleCollapser.myContent.style.height = "auto";
					this.styleCollapser.myContent.classList.remove(this.styleCollapser.collapsedClass);
					this.styleCollapser.clicker.classList.remove(this.styleCollapser.collapsedClass);
	    		}
    			
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
		value: function(styleProperty, existingRule) {
			// Add a new style rule.  It should be added above the currently selected rule, 
			// Or at the end, if no rule is selected.

			var newLength = 0, 
				// mySelection = 0,
				// newStyle = LayerStyle.create(),
				newStyle = {},
				newEvent = document.createEvent("CustomEvent");
			/*
			this.isStyleCollapsed = false;
			this.layerData.isStyleCollapsed = false;
			this.triggerOutgoingBinding();
			*/
			
			newEvent.initCustomEvent("layerEvent", false, true);
			newEvent.layerEventLocale = "styles";
			newEvent.layerEventType = "newStyle";
			newEvent.layerID = this.layerID;
            newEvent.styleIndex = this.styleCounter;
			newEvent.styleID = this.layerID + "@" + this.styleCounter; // is this property needed?
			
			newStyle.styleID = newEvent.styleID;
			newStyle.whichView = "hintable";
            newStyle.editorProperty = "";
            if(styleProperty){
                newStyle.editorProperty = styleProperty;
                newEvent.layerEventType = "restoreStyle";
                newEvent.trackEditorProperty = styleProperty;
                if(existingRule){
                    newEvent.existingRule = existingRule;
                }
            }
			newStyle.editorValue = "";
			newStyle.ruleTweener = false;
			newStyle.isSelected = false;
            newStyle.colorelement = "";
            this.arrLayerStyles.push(newStyle);
            this.selectStyle(this.arrLayerStyles.length -1);

			// Set up the event info and dispatch the event
            this.styleCounter += 1;
			// newEvent.styleSelection = mySelection;
			//defaultEventManager.dispatchEvent(newEvent);
			
			// Dispatch the event to the TimelineTrack component associated with this Layer.
			var myIndex = false,
				i = 0, 
				arrLayersLength = this.parentComponent.parentComponent.arrLayers.length,
				arrTracks = document.querySelectorAll('[data-montage-id="track"]');
			
			for (i = 0; i < arrLayersLength; i++) {
				if (this.stageElement == this.parentComponent.parentComponent.arrLayers[i].layerData.stageElement) {
					myIndex = i;
				}
			}
			
			if (myIndex !== false) {
				arrTracks[myIndex].dispatchEvent(newEvent);
			} 
		}
	},

	deleteStyle : {
		value: function() {
		
			// Only delete a style if we have one or more styles, and one of them is selected
			if ((this.arrLayerStyles.length > 0) && (this.selectedStyleIndex !== false)) {
				var newEvent = document.createEvent("CustomEvent");

				// Set up the event info and dispatch the event
				newEvent.initCustomEvent("layerEvent", false, true);
				newEvent.layerEventLocale = "styles";
				newEvent.layerEventType = "deleteStyle";
				newEvent.layerID = this.layerID;
				newEvent.styleID = this.selectedStyleIndex;
				newEvent.selectedStyleIndex = this.selectedStyleIndex;

				// Dispatch the event to the TimelineTrack component associated with this Layer.
				var myIndex = this.application.ninja.timeline.getActiveLayerIndex(),
					arrTracks = document.querySelectorAll('[data-montage-id="track"]');
	
				if (myIndex !== false) {
					arrTracks[myIndex].dispatchEvent(newEvent);
				}
					
				// Delete the style from the view
				this.arrLayerStyles.splice(this.selectedStyleIndex, 1);
				
				// Set selection to none
				this.selectedStyleIndex = false;
				
				// Disable the delete style button, because now nothing is selected
				this.buttonDeleteStyle.classList.add("disabled");
			}	
		}
	},
	selectStyle : {
		value: function(styleIndex) {
    		// Select a style based on its index.
    		// use layerIndex = false to deselect all styles.
    		var i = 0,
    			arrLayerStylesLength = this.arrLayerStyles.length;
    			
            if (styleIndex === false) {
                if (arrLayerStylesLength === 0) {
                    // No styles selected, so do nothing.
                    return;
                }
                for (i = 0; i < arrLayerStylesLength; i++) {
                    if (this.arrLayerStyles[i].isSelected === true) {
                        this.arrLayerStyles[i].isSelected = false;
                    }
                }
            } else {
                for (i = 0; i < arrLayerStylesLength; i++) {
                    if (i === styleIndex) {
                        this.arrLayerStyles[i].isSelected = true;
                    } else {
                        if (this.arrLayerStyles[i].isSelected === true) {
                            this.arrLayerStyles[i].isSelected = false;
                        }
                    }
                }
                this.selectedStyleIndex = styleIndex;
                this._storedStyleIndex = styleIndex;
            }
            
            
            
    		/*
    		// Next, update this.styleRepetition.selectedIndexes.
    		if (styleIndex !== false) {
    			//this.styleRepetition.selectedIndexes = [styleIndex];
    			this.buttonDeleteStyle.classList.remove("disabled");
    		} else {
    			//this.styleRepetition.selectedIndexes = null;
    			if (typeof(this.buttonDeleteStyle) !== "undefined") {
    				this.buttonDeleteStyle.classList.add("disabled");
    			}
    		}
    		*/
			
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
    		//console.log("Layer.getActiveStyleIndex, returnVal ", returnVal)
    		return returnVal;
    	}
    },
	/* End: Controllers */
    
	/* Begin: Event handlers */
	handleLayerNameChange: {
		value: function(event) {
			
			if (this._layerEditable.value !== this.layerName) {
				this.layerName = this._layerEditable.value;
				this.application.ninja.currentDocument.model.needsSave = true;
				this.layerData.stageElement.setAttribute("id",this._layerEditable.value);
			}
		}
	},
	handleAddStyleClick: {
		value: function(event) {

			this.isStyleCollapsed = false;
			this.layerData.isStyleCollapsed = false;
			this.triggerOutgoingBinding();

			this.addStyle();

		}
	},
	handleDeleteStyleClick: {
		value: function(event) {
		    if (event.target.classList.contains("disabled")) {
		        return;
		    }
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
			this.layerName = newVal;
			if (newVal !== this.layerName) {
				this.layerName = newVal;
				this.application.ninja.currentDocument.model.needsSave = true;
				this.layerData.stageElement.setAttribute("id", newVal);
			}
		}
	},
	handleMousedown: {
		value: function(event) {
			if (event.target.classList.contains("button-delete")) {
				return;
			}
			this.layerData.isActive = true;
			var ptrParent = nj.queryParentSelector(event.target, ".content-style"),
				activeStyleIndex = this.getActiveStyleIndex();
			this.selectedStyleIndex = activeStyleIndex;
			if (ptrParent !== false) {
				this.selectStyle(this.selectedStyleIndex);
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
				this.application.ninja.timeline.synchScrollbars(43);
			}
			this.triggerOutgoingBinding();
		}
	},
	handlePositionCollapserClick : {
		value: function(event) {
			var myHeight = this.positionCollapser.element.offsetHeight;
			this.positionCollapser.bypassAnimation = false;
			this.bypassAnimation = false;
			this.layerData.bypassAnimation = false;
			if (this.isPositionCollapsed) {
				this.isPositionCollapsed = false;
			} else {
				this.isPositionCollapsed = true;
				this.application.ninja.timeline.synchScrollbars(myHeight);
			}
			this.triggerOutgoingBinding();
		}
	},
	handleStyleCollapserClick : {
		value: function(event) {
			var myHeight = this.styleCollapser.element.offsetHeight;
			this.styleCollapser.bypassAnimation = false;
			this.bypassAnimation = false;
			this.layerData.bypassAnimation = false;
			if (this.isStyleCollapsed) {
				this.isStyleCollapsed = false;
			} else {
				this.isStyleCollapsed = true;
				this.application.ninja.timeline.synchScrollbars(myHeight);
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
			if (this.parentComponent.parentComponent.draggingType !== "layer") {
				return;
			}
			this.element.classList.remove("dragOver");
		}
	},
	handleDragstart: {
		value: function(event) {
			//this.parentComponent.parentComponent.dragLayerID = this.layerID;
            event.dataTransfer.setData('Text', 'Layer');
            this.parentComponent.parentComponent.draggingType = "layer";
		}
	},
	handleDragover: {
		value: function(event) {
			if (this.parentComponent.parentComponent.draggingType !== "layer") {
				return;
			}
			event.preventDefault();
			this.element.classList.add("dragOver");
			event.dataTransfer.dropEffect = "move";
			return false;
		}
	},
	
	handleDrop : {
		value: function(event) {
			if (this.parentComponent.parentComponent.draggingType !== "layer") {
				return;
			}
			event.stopPropagation();
			this.element.classList.remove("dragOver");
			if (this.parentComponent.parentComponent.dragLayerID !== this.layerID) {
				this.parentComponent.parentComponent.dropLayerID = this.layerID;
			}
			return false;
		}
	},

    handleLeftChange: {
        value: function(event) {
            var prevPosition;
            if(this.application.ninja.timeline.selectedStyle==="left" ||this.application.ninja.timeline.selectedStyle==="master" ){
                if(!event.wasSetByCode) {
                    if(this.savedPosition) prevPosition = [this.savedPosition + "px"];
                        this.application.ninja.elementMediator.setProperty([this.layerData.stageElement], "left", [this.leftControl.value + "px"] , "Change", "timeline", prevPosition);
                        this.savedPosition = null;
                }

            }
        }
    },

    handleTopChange: {
        value: function(event) {
            var prevPosition;
            if(this.application.ninja.timeline.selectedStyle==="top" ||this.application.ninja.timeline.selectedStyle==="master" ){
                if(!event.wasSetByCode) {
                    if(this.savedPosition) prevPosition = [this.savedPosition + "px"];

                    this.application.ninja.elementMediator.setProperty([this.layerData.stageElement], "top", [this.topControl.value + "px"] , "Change", "timeline", prevPosition);
                    this.savedPosition = null;
                }
            }
        }
    },

    handleWidthChange:{
        value: function(event) {
            var prevPosition;
            if(this.application.ninja.timeline.selectedStyle==="width" ||this.application.ninja.timeline.selectedStyle==="master" ){
                if(!event.wasSetByCode) {
                    if(this.savedPosition) prevPosition = [this.savedPosition + "px"];

                    this.application.ninja.elementMediator.setProperty([this.layerData.stageElement], "width", [this.dtextScaleX + "px"] , "Change", "timeline", prevPosition);
                    this.savedPosition = null;
                }
            }
        }
    },

    handleHeightChange:{
        value: function(event) {
            var prevPosition;
            if(this.application.ninja.timeline.selectedStyle==="height" ||this.application.ninja.timeline.selectedStyle==="master" ){
                if(!event.wasSetByCode) {
                    if(this.savedPosition) prevPosition = [this.savedPosition + "px"];

                    this.application.ninja.elementMediator.setProperty([this.layerData.stageElement], "height", [this.dtextScaleY + "px"] , "Change", "timeline", prevPosition);
                    this.savedPosition = null;
                }
            }
        }
    },

    handleLeftChanging: {
        value: function(event) {

            if(this.application.ninja.timeline.selectedStyle==="left" ||this.application.ninja.timeline.selectedStyle==="master" ){
                if(!event.wasSetByCode) {
                    if(!this.savedPosition) this.savedPosition = this.leftPosition;
                    this.application.ninja.elementMediator.setProperty([this.layerData.stageElement], "left", [this.leftControl.value + "px"] , "Changing", "timeline");
                }
            }

        }
    },

    handleTopChanging: {
        value: function(event) {
            if(this.application.ninja.timeline.selectedStyle==="top" ||this.application.ninja.timeline.selectedStyle==="master" ){
                if(!event.wasSetByCode) {
                    if(!this.savedPosition) this.savedPosition = this.topPosition;
                    this.application.ninja.elementMediator.setProperty([this.layerData.stageElement], "top", [this.topControl.value + "px"] , "Changing", "timeline");
                }
            }

        }
    },

    handleWidthChanging:{
        value: function(event) {
            if(this.application.ninja.timeline.selectedStyle==="width" ||this.application.ninja.timeline.selectedStyle==="master" ){
                if(!event.wasSetByCode) {
                    if(!this.savedPosition) this.savedPosition = this.dtextScaleX;
                    this.application.ninja.elementMediator.setProperty([this.layerData.stageElement], "width", [this.dtextScaleX + "px"] , "Changing", "timeline");
                }
            }

        }
    },

    handleHeightChanging:{
        value: function(event) {
            if(this.application.ninja.timeline.selectedStyle==="height" ||this.application.ninja.timeline.selectedStyle==="master" ){
                if(!event.wasSetByCode) {
                    if(!this.savedPosition) this.savedPosition = this.dtextScaleY;
                    this.application.ninja.elementMediator.setProperty([this.layerData.stageElement], "height", [this.dtextScaleY + "px"] , "Changing", "timeline");
                }
            }

        }
    },


    handleElementChange:{
        value:function(event){
            if(this.layerData){
                var el =this.layerData.stageElement;
                var length = this.arrLayerStyles.length , i , k=0;

                    this.dtextPositionX = parseFloat(ElementsMediator.getProperty(el, "left"));
                    this.dtextPositionY = parseFloat(ElementsMediator.getProperty(el, "top"));
                    this.dtextScaleY = parseFloat(ElementsMediator.getProperty(el, "height"));
                    this.dtextScaleX= parseFloat(ElementsMediator.getProperty(el, "width"));


                    for(i=0; i<length; i++){
                        if (event.detail.data.prop === "color"){
                            var currentValue1 = ElementsMediator.getColor(this.layerData.stageElement,event.detail.data.isFill,event.detail.data.borderSide);
                            if(event.detail.data.isFill){
                                while(k <length){
                                    if(this.arrLayerStyles[k].editorProperty === "background-color"){
                                        this.arrLayerStyles[k].colorelement.color(currentValue1.colorMode, currentValue1.color);
                                        this.application.ninja.timeline.selectedStyle = this.arrLayerStyles[k].editorProperty;
                                        break;
                                    }
                                    k++;
                                }
                            }else if (event.detail.data.borderSide === "bottom"){
                                k=0;
                                    while(k <length){
                                        if(this.arrLayerStyles[k].editorProperty  === "bottom-border-color"){
                                        this.arrLayerStyles[k].colorelement.color(currentValue1.colorMode, currentValue1.color);
                                        this.application.ninja.timeline.selectedStyle = this.arrLayerStyles[k].editorProperty;
                                        break;
                                        }
                                    k++;
                                    }
                                }else if (event.detail.data.borderSide === "top"){
                                    k=0;
                                    while(k <length){
                                        if(this.arrLayerStyles[k].editorProperty  === "top-border-color"){
                                        this.arrLayerStyles[k].colorelement.color(currentValue1.colorMode, currentValue1.color);
                                        this.application.ninja.timeline.selectedStyle = this.arrLayerStyles[k].editorProperty;
                                        break;
                                        }
                                    k++;
                                    }
                                }else if(event.detail.data.borderSide === "left"){
                                    k=0;
                                    while(k <length){
                                        if(this.arrLayerStyles[k].editorProperty  === "left-border-color"){
                                        this.arrLayerStyles[k].colorelement.color(currentValue1.colorMode, currentValue1.color);
                                        this.application.ninja.timeline.selectedStyle = this.arrLayerStyles[k].editorProperty;
                                        break;
                                        }
                                    k++;
                                    }
                                }else if(event.detail.data.borderSide === "right"){
                                    k=0;
                                    while(k <length){
                                        if(this.arrLayerStyles[k].editorProperty  === "right-border-color"){
                                        this.arrLayerStyles[k].colorelement.color(currentValue1.colorMode, currentValue1.color);
                                        this.application.ninja.timeline.selectedStyle = this.arrLayerStyles[k].editorProperty;
                                        break;
                                        }
                                    k++;
                                    }
                                }
                            break;
                        }else if (event.detail.source === "tween" || event.detail.data.prop === "background-color" ||event.detail.data.prop === "border-top-color"|| event.detail.data.prop === "border-right-color"|| event.detail.data.prop === "border-left-color" || event.detail.data.prop === "border-bottom-color" ){

                            k=0;
                            while(k <length){
                                if(this.arrLayerStyles[k].editorProperty === event.detail.data.prop){
                                   var tempElement = this.arrLayerStyles[k];

                                break;
                                }
                            k++;
                            }
                            if(event.detail.data.prop === "background-color"){

                                var currentValue = ElementsMediator.getColor(this.layerData.stageElement,true);
                                tempElement.colorelement.color(currentValue.colorMode, currentValue.color);
                                this.application.ninja.timeline.selectedStyle = event.detail.data.prop;
                            }else {
                                if(event.detail.data.prop === "border-bottom-color"){
                                    currentValue = ElementsMediator.getColor(this.layerData.stageElement,false,"bottom");
                                    tempElement.colorelement.color(currentValue.colorMode, currentValue.color);
                                    this.application.ninja.timeline.selectedStyle = event.detail.data.prop;
                                }else if(event.detail.data.prop === "border-top-color"){
                                    currentValue = ElementsMediator.getColor(this.layerData.stageElement,false,"top");
                                    tempElement.colorelement.color(currentValue.colorMode, currentValue.color);
                                    this.application.ninja.timeline.selectedStyle = event.detail.data.prop;
                                }else if (event.detail.data.prop === "border-left-color"){
                                     currentValue = ElementsMediator.getColor(this.layerData.stageElement,false,"left");
                                     tempElement.colorelement.color(currentValue.colorMode, currentValue.color);
                                     this.application.ninja.timeline.selectedStyle = event.detail.data.prop;
                                }else if (event.detail.data.prop === "border-right-color"){
                                     currentValue = ElementsMediator.getColor(this.layerData.stageElement,false,"right");
                                     tempElement.colorelement.color(currentValue.colorMode, currentValue.color);
                                     this.application.ninja.timeline.selectedStyle = event.detail.data.prop;
                                }
                            }
                        }else{
                            this.arrLayerStyles[i].editorValue = parseFloat(ElementsMediator.getProperty(el, this.arrLayerStyles[i].editorProperty))
                            this.application.ninja.timeline.selectedStyle = this.arrLayerStyles[k].editorProperty;
                        }
                    }
            }
        }
    },

    handleUpdatedID:{
        value:function(event){
            var i= this.application.ninja.timeline.arrLayers.length;
            if(event.detail.id){
                for(var k=0;k<i;k++){
                    if(this.application.ninja.timeline.arrLayers[k].layerData.layerID=== this.application.ninja.timeline.currentLayerSelected.layerData.layerID){
                        this.application.ninja.timeline.currentLayerSelected.layerData.layerName = event.detail.id;
                        this.application.ninja.timeline.triggerLayerBinding(k);
                        this.needsDraw=true;
                    }
                }

            }
        }
    },

    handleLayerLock: {
        value: function() {
           var i = 0;
           var arrlength = this.application.ninja.timeline.arrLayers.length;
           var lockElementArrLength = this.application.ninja.currentDocument.lockedElements.length;
           if(!this.layerData.isLock){
               for(i = 0; i < arrlength; i++){
                  if(this.application.ninja.timeline.arrLayers[i].layerData.isLock){
                      this.application.ninja.timeline.arrLayers[i].layerData.isLock = false;
                      this.application.ninja.timeline.arrLayers[i].layerData.isSelected = false;
                      for(var k = 0; k < lockElementArrLength; k++){
                          if(this.application.ninja.currentDocument.lockedElements[k] === this.application.ninja.timeline.arrLayers[i].layerData.stageElement){
                              this.application.ninja.currentDocument.lockedElements.splice(k,1);
                              break;
                          }
                      }
                  }
               }
               this.layerData.isSelected = false;
               this.application.ninja.timeline.selectLayers([]);
               this.application.ninja.currentDocument.lockedElements.push(this.layerData.stageElement);
           } else {
               this.layerData.isSelected = true;
               for(k = 0; k<lockElementArrLength; k++){
                 if(this.application.ninja.currentDocument.lockedElements[k] === this.layerData.stageElement){
                     this.application.ninja.currentDocument.lockedElements.splice(k,1);
                     break;
                 }
               }

           }
           this.layerData.isLock = !this.layerData.isLock;

        }
    },

    handleLayerVisibility:{
        value:function(){
            var i = 0;
            var arrlength = this.application.ninja.timeline.arrLayers.length;
            var lockElementArrLength=this.application.ninja.currentDocument.lockedElements.length;
            if(!this.layerData.isHidden){
                for(i = 0; i<arrlength; i++){
                    if(this.application.ninja.timeline.arrLayers[i].layerData.isHidden){
                        this.application.ninja.timeline.arrLayers[i].layerData.isHidden = false;
                        this.application.ninja.timeline.arrLayers[i].layerData.stageElement.style.visibility = "visible";
                        for(var k = 0;k < lockElementArrLength;k++){
                            if(this.application.ninja.currentDocument.lockedElements[k] === this.application.ninja.timeline.arrLayers[i].layerData.stageElement){
                                this.application.ninja.currentDocument.lockedElements.splice(k,1);
                                break;
                            }
                        }
                    }

                }
             this.layerData.stageElement.style.visibility = "hidden";
             this.application.ninja.currentDocument.lockedElements.push(this.layerData.stageElement);

            } else {
                this.layerData.stageElement.style.visibility = "visible";
                for(var k = 0; k < lockElementArrLength; k++){
                    if(this.application.ninja.currentDocument.lockedElements[k] === this.application.ninja.timeline.arrLayers[i].layerData.stageElement){
                        this.application.ninja.currentDocument.lockedElements.splice(k,1);
                        break;
                    }
                }
            }
            this.layerData.isHidden = !this.layerData.isHidden;

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
