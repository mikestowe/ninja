/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var Collapser = require("js/panels/Timeline/Collapser").Collapser;
var defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;

var TimelineTrack = exports.TimelineTrack = Montage.create(Component, {

    hasTemplate:{
        value:true
    },

    _trackID:{
        value:null
    },

    trackID:{
        serializable:true,
        get:function () {
            return this._trackID;
        },
        set:function (value) {
        	if (value !== this._trackID) {
        		this._trackID = value;
                this.trackData.layerID = value;
        	}
        }
    },
    
    _isFirstDraw: {
    	value: true
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
        		if (this.element !== null) {
	        		if (value === true) {
	        			this.element.classList.remove("layer-hidden");
	        		} else {
	        			this.element.classList.add("layer-hidden");
	        		}
        		}
        	}
        	this.trackData.isVisible = value;
        }
    },

    // Are the various collapsers collapsed or not
    _isMainCollapsed:{
        value: true
    },
    isMainCollapsed:{
        get:function () {
            return this._isMainCollapsed;
        },
        set:function (newVal) {
            this._isMainCollapsed = newVal;
            this.trackData.isMainCollapsed = newVal;
        }
    },
    _isTransformCollapsed:{
        value:true
    },
    isTransformCollapsed:{
        get:function () {
            return this._isTransformCollapsed;
        },
        set:function (newVal) {
            this._isTransformCollapsed = newVal;
            this.trackData.isTransformCollapsed = newVal;
        }
    },
    _isPositionCollapsed:{
        value:true
    },
    isPositionCollapsed:{
        get:function () {
            return this._isPositionCollapsed;
        },
        set:function (newVal) {
            this._isPositionCollapsed = newVal;
            this.trackData.isPositionCollapsed = newVal;
        }
    },
    _isStyleCollapsed:{
        value:true
    },
    isStyleCollapsed:{
        get:function () {
            return this._isStyleCollapsed;
        },
        set:function (newVal) {
            this._isStyleCollapsed = newVal;
            this.trackData.isStyleCollapsed = newVal;
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
    		if (typeof(this.trackData) !== "undefined") {
    			this._bypassAnimation = newVal;
                this.trackData.bypassAnimation = newVal;
    		}
    	}
    },
    
    _arrStyleTracks : {
    	value: []
    },
    arrStyleTracks: {
        serializable:true,
    	get: function() {
    		return this._arrStyleTracks;
    	},
    	set: function(newVal) {
    		this._arrStyleTracks = newVal;
            this.trackData.arrStyleTracks = newVal;
    	}
    },
    _styleTracksRepetition: {
    	value: null
    },
    styleTracksRepetition : {
        serializable:true,
    	get: function() {
    		return this._styleTracksRepetition;
    	},
    	set: function(newVal) {
    		this._styleTracksRepetition = newVal;
    	}
    },
    
    /* Position Property Tracks */
    _arrPositionTracks : {
    	value: []
    },
    arrPositionTracks: {
        serializable:true,
    	get: function() {
    		return this._arrPositionTracks;
    	},
    	set: function(newVal) {
    		this._arrPositionTracks = newVal;
            this.trackData.arrPositionTracks = newVal;
    	}
    },
    _positionTracksRepetition: {
    	value: null
    },
    positionTracksRepetition : {
    	get: function() {
    		return this._positionTracksRepetition;
    	},
    	set: function(newVal) {
    		this._positionTracksRepetition = newVal;
    	}
    },
    
    
    /* Transform Property Tracks */
    _arrTransformTracks : {
    	value: []
    },
    arrTransformTracks: {
        serializable:true,
    	get: function() {
    		return this._arrTransformTracks;
    	},
    	set: function(newVal) {
    		this._arrTransformTracks = newVal;
            this.trackData.arrTransformTracks = newVal;
    	}
    },

    _tweens:{
        value:[]
    },

    tweens:{
    	serializable: true,
        get:function () {
            return this._tweens;
        },
        set:function (newVal) {
            this._tweens = newVal;
            this.trackData.tweens = newVal;
        }
    },

    _tweenRepetition:{
        value:null
    },

    tweenRepetition:{
        get:function () {
            return this._tweenRepetition;
        },
        set:function (newVal) {
            this._tweenRepetition = newVal;
        }
    },

    _trackDuration:{
        value:0
    },

    trackDuration:{
        serializable:true,
        get:function () {
            return this._trackDuration;
        },
        set:function (val) {
            this._trackDuration = val;
            if(this._trackDuration > this.application.ninja.timeline.masterDuration){
                this.application.ninja.timeline.masterDuration = this._trackDuration;
            }
            this.trackData.trackDuration = val;
        }
    },

    _trackPosition:{
        value:0
    },

    trackPosition:{
        serializable:true,
        get:function () {
            return this._trackPosition;
        },
        set:function (val) {
            this._trackPosition = val;
            this.trackData.trackPosition = val;
        }
    },

    _currentKeyframeRule:{
        value:null
    },

    currentKeyframeRule:{
        serializable: true,
        get:function(){
            return this._currentKeyframeRule;
        },
        set:function(val){
            this._currentKeyframeRule = val;
            this.trackData.currentKeyframeRule = val;
        }
    },

    nextKeyframe:{
        value:1
    },

    currentMillisecClicked:{
        value:0
    },

    _isTrackAnimated:{
        value:null
    },

    isTrackAnimated:{
        serializable: true,
        get:function(){
            return this._isTrackAnimated;
        },
        set:function(val){
            this._isTrackAnimated = val;
            this.trackData.isTrackAnimated = val;
        }
    },

    // should be unneeded with one element per layer restriction
    _animatedElement:{
        value:null
    },
    animatedElement:{
        serializable:true,
        get:function () {
            return this._animatedElement;
        },
        set:function (val) {
            this._animatedElement = val;
            this.trackData.animatedElement = val;
        }
    },

    _animationName:{
        value:null
    },

    animationName:{
        serializable:true,
        get:function () {
            return this._animationName;
        },
        set:function (val) {
            this._animationName = val;
            this.trackData.animationName = val;
        }
    },

    animationNamesString:{
        value:""
    },

    ninjaStylesContoller:{
        value:null
    },

    _positionCollapser:{
        value:null
    },
    _mainCollapser:{
        value:null
    },
    _transformCollapser:{
        value:null
    },
    _styleCollapser:{
        value:null
    },

	// Drag and Drop properties
    _dragAndDropHelper : {
    	value: false
    },
    _dragAndDropHelperCoords: {
    	value: false
    },
    dragAndDropHelperCoords: {
    	get: function() {
    		return this._dragAndDropHelperCoords;
    	},
    	set: function(newVal) {
    		this._dragAndDropHelperCoords = newVal;
    	}
    },
    _draggingIndex: {
    	value: false
    },
    draggingIndex: {
    	get: function() {
    		return this._draggingIndex;
    	},
    	set: function(newVal) {
    		this._draggingIndex = newVal;
    	}
    },
    _dragAndDropHelperOffset : {
    	value: false
    },
    _appendHelper: {
    	value: false
    },
    _deleteHelper: {
    	value: false
    },

    _trackData:{
		value: false
    },

    trackData:{
        get:function(){
            return this._trackData;
        },
        set:function(val){
            this._trackData = val;
            if(this._trackData){
                 this.setData();
            }
        }
    },
    
    _setDataTimestamp : {
    	value: false
    },

    setData:{
        value:function(){
        	if (typeof(this.trackData) === "undefined") {
        		return;
        	}
            this.bypassAnimation = this.trackData.bypassAnimation;
            this.trackID = this.trackData.layerID;
            this.tweens = this.trackData.tweens;
            this.animatedElement = this.trackData.animatedElement;
            this.arrStyleTracks = this.trackData.arrStyleTracks;
            this.isTrackAnimated = this.trackData.isTrackAnimated;
            this.trackDuration = this.trackData.trackDuration;
            this.animationName = this.trackData.animationName;
            this.currentKeyframeRule = this.trackData.currentKeyframeRule;
            this.isMainCollapsed = this.trackData.isMainCollapsed;
            this.isPositionCollapsed = this.trackData.isPositionCollapsed;
            this.isTransformCollapsed = this.trackData.isTransformCollapsed;
            this.isStyleCollapsed = this.trackData.isStyleCollapsed;
            this.trackPosition = this.trackData.trackPosition;
            this.isVisible = this.trackData.isVisible;
            this.needsDraw = true;
        }
    },
    
    // Data binding observation point and trigger method
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
	    		this.setData();
    		}
    	}
    },
    
    triggerOutgoingBinding : {
    	value: function() {
    		if (this.trackData.triggerBinding === true) {
    			this.trackData.triggerBinding = false;
    		} else {
    			this.trackData.triggerBinding = true;
    		}
    	}
    },

    prepareForDraw:{
        value:function () {
            this.init();
            this.ninjaStylesContoller = this.application.ninja.stylesController;
            this.element.addEventListener("click", this, false);
            this.eventManager.addEventListener("tlZoomSlider", this, false);
            
            // Drag and Drop event handlers 
			//this.element.addEventListener("dragover", this.handleKeyframeDragover.bind(this), false);
			this.element.addEventListener("dragstart", this.handleKeyframeDragstart.bind(this), false);
			this.element.addEventListener("dragend", this.handleKeyframeDragend.bind(this), false);
			//this.element.addEventListener("drop", this.handleKeyframeDrop.bind(this), false);
        }
    },

    draw:{
        value:function () {
            this.ninjaStylesContoller = this.application.ninja.stylesController;
            var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
            if (selectedIndex !== false) {
	            if(this.application.ninja.timeline.arrLayers[selectedIndex].layerData.stageElement){
	                this.animatedElement = this.application.ninja.timeline.arrLayers[selectedIndex].layerData.stageElement;
	            }
            }

    		// Drag and Drop:
    		// Do we have a helper to append?
            if (this._appendHelper === true) {
            	this.track_lanes.appendChild(this._dragAndDropHelper);
            	this._appendHelper = false;
            }
            // Do we need to move the helper?
    		if (this._dragAndDropHelperCoords !== false) {
    			if (this._dragAndDropHelper !== null) {
    				if (typeof(this._dragAndDropHelper.style) !== "undefined") {
    					this._dragAndDropHelper.style.left = this._dragAndDropHelperCoords;
    				}
    			}
    			this._dragAndDropHelperCoords = false;
    		}
    		// Do we have a helper to delete?
    		if (this._deleteHelper === true) {
    			if (this._dragAndDropHelper === null) {
    				// Problem....maybe a helper didn't get appended, or maybe it didn't get stored.
    				// Try and recover the helper so we can delete it.
    				var myHelper = this.element.querySelector(".track-dnd-helper");
    				if (myHelper != null) {
    					this._dragAndDropHelper = myHelper;
    				}
    			}
	            if (this._dragAndDropHelper !== null) {
	            	// We need to delete the helper.  Can we delete it from track_lanes?
	            	if (this._dragAndDropHelper && this._dragAndDropHelper.parentNode === this.track_lanes) {
	            		this.track_lanes.removeChild(this._dragAndDropHelper);
	            		this._dragAndDropHelper = null;
	            		this._deleteHelper = false;
	            	}
	            }
    		}

        }
    },

    didDraw:{
        value:function () {
            if ((!this.application.ninja.documentController.creatingNewFile)||(!this.application.ninja.currentDocument.setLevel)) {
                if (this.application.ninja.currentDocument.documentRoot.children[0]) {
                    var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
                    if (selectedIndex !== false) {
	                    if (!this.application.ninja.timeline.arrLayers[selectedIndex].layerData.created) {
	                        this.retrieveStoredTweens();
	                    }
                    }
                }
            }
            
    		if (this._isFirstDraw === true) {
	    		
	    		if (this.isMainCollapsed === false) {
					this._mainCollapser.myContent.style.height = "auto";
					this._mainCollapser.myContent.classList.remove(this._mainCollapser.collapsedClass);
					this._mainCollapser.clicker.classList.remove(this._mainCollapser.collapsedClass);
	    		}
	    		if (this.isPositionCollapsed === false) {
					this._positionCollapser.myContent.style.height = "auto";
					this._positionCollapser.myContent.classList.remove(this._positionCollapser.collapsedClass);
					this._positionCollapser.clicker.classList.remove(this._positionCollapser.collapsedClass);
	    		}
	    		if (this.isTransformCollapsed === false) {
					this._transformCollapser.myContent.style.height = "auto";
					this._transformCollapser.myContent.classList.remove(this._transformCollapser.collapsedClass);
					this._transformCollapser.clicker.classList.remove(this._transformCollapser.collapsedClass);
	    		}
	    		if (this.isStyleCollapsed === false) {
					this._styleCollapser.myContent.style.height = "auto";
					this._styleCollapser.myContent.classList.remove(this._styleCollapser.collapsedClass);
					this._styleCollapser.clicker.classList.remove(this._styleCollapser.collapsedClass);
	    		}
    			this._isFirstDraw = false;
    		}
            
        }
    },

	handleTlZoomSlider: {
		value: function(event) {
			
	        var currentMilliSecPerPixel , currentMilliSec , clickPos,thingToPush;
	        var i = 0,
	        	tweensLength = this.tweens.length;

	        for (i = 0; i < tweensLength; i++) {
	        	
	        	if (i === 0) {
					// Exception: 0th item does not depend on anything
					// TODO: If 0th tween is draggable, this will need to be fixed.
			        this.tweens[i].tweenData.spanWidth=0;
		            this.tweens[i].tweenData.spanPosition=0;
		            this.tweens[i].tweenData.keyFramePosition=0;
		            this.tweens[i].tweenData.keyFrameMillisec=0;
	
	        	} else {
					var prevKeyFramePosition = this.tweens[i - 1].tweenData.keyFramePosition,
						myObj = {},
						thing = {};

			        currentMilliSecPerPixel = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80);
		            currentMilliSec = this.tweens[i].tweenData.keyFrameMillisec;
		            clickPos = currentMilliSec / currentMilliSecPerPixel;

		            for (thing in this.tweens[i].tweenData) {
		            	myObj[thing] = this.tweens[i].tweenData[thing];
		            }
					myObj.spanWidth = clickPos - prevKeyFramePosition;
		            myObj.keyFramePosition = clickPos;
		            myObj.spanPosition = clickPos - (clickPos - prevKeyFramePosition);

		            this.tweens[i].tweenData = myObj;
	        	}
	        }
		}
	},

    handleClick:{
        value:function (ev) {
            // TEMP - if the SHIFT key is down, add a new keyframe or split an existing span
            // This needs to move to a keyboard shortcut that is TBD
            var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
            if (ev.shiftKey) {
                //if (this.application.ninja.timeline.arrLayers[selectedIndex].layerData.elementsList.length == 1) {
                    if (this.tweens.length < 1) {
                        this.insertTween(0);
                        this.addAnimationRuleToElement(ev);
                        this.updateKeyframeRule();
                    } else {
                        //console.log(ev);
                        if (ev.target.className === "tracklane") {
                            this.handleNewTween(ev);
                            this.updateKeyframeRule();
                        } else if (ev.target.className === "tween_span" && ev.target.parentElement.parentElement.className === "tracklane"){
                            this.handleNewTween(ev);
                            this.updateKeyframeRule();
                        }
                    }
                //} else {
                    // TEMP error check
                    //console.log("There must be exactly one element in an animated layer.");
                //}
            }
        }
    },

    handleNewTween:{
        value:function (ev) {
            if (ev.offsetX > this.tweens[this.tweens.length - 1].tweenData.keyFramePosition) {
                var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
                this.application.ninja.timeline.selectLayer(selectedIndex, false);
                this.insertTween(ev.offsetX);
            } else {
                this.splitTween(ev);
            }
        }
    },

    insertTween:{
        value:function (clickPos) {
            var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
            this.application.ninja.timeline.selectLayer(selectedIndex, true);

            var currentMillisecPerPixel = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80);
            var currentMillisec = currentMillisecPerPixel * clickPos;
            this.trackDuration = currentMillisec;
            var newTween = {};
            newTween.tweenData = {};

            if (clickPos == 0) {
                this.animatedElement = this.application.ninja.timeline.arrLayers[this.application.ninja.timeline.currentLayersSelected[0]].layerData.stageElement;
                newTween.tweenData.spanWidth = 0;
                newTween.tweenData.keyFramePosition = 0;
                newTween.tweenData.keyFrameMillisec = 0;
                newTween.tweenData.tweenID = 0;
                newTween.tweenData.spanPosition = 0;
                newTween.tweenData.tweenedProperties = [];
                newTween.tweenData.tweenedProperties["top"] = this.animatedElement.offsetTop;
                newTween.tweenData.tweenedProperties["left"] = this.animatedElement.offsetLeft;
                newTween.tweenData.tweenedProperties["width"] = this.animatedElement.offsetWidth;
                newTween.tweenData.tweenedProperties["height"] = this.animatedElement.offsetHeight;
                this.tweens.push(newTween);
            } else {
                newTween.tweenData.spanWidth = clickPos - this.tweens[this.tweens.length - 1].tweenData.keyFramePosition;
                newTween.tweenData.keyFramePosition = clickPos;
                newTween.tweenData.keyFrameMillisec = currentMillisec;
                newTween.tweenData.tweenID = this.nextKeyframe;
                newTween.tweenData.spanPosition = clickPos - newTween.tweenData.spanWidth;
                newTween.tweenData.tweenedProperties = [];
                newTween.tweenData.tweenedProperties["top"] = this.animatedElement.offsetTop;
                newTween.tweenData.tweenedProperties["left"] = this.animatedElement.offsetLeft;
                newTween.tweenData.tweenedProperties["width"] = this.animatedElement.offsetWidth;
                newTween.tweenData.tweenedProperties["height"] = this.animatedElement.offsetHeight;
                this.tweens.push(newTween);

                // update the animation duration
                var animationDuration = (this.trackDuration / 1000) + "s";
                this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-duration", animationDuration);
                this.nextKeyframe += 1;
            }

            this.application.ninja.documentController.activeDocument.needsSave = true;
        }
    },

    splitTween:{
        value:function (ev) {
            var clickPos = ev.target.parentElement.offsetLeft + ev.offsetX;
            var i;
            var tweensLength = this.tweens.length-1;
            var prevTween, nextTween, splitTweenIndex;
            for(i=0; i<tweensLength; i++){
                prevTween = this.tweens[i].tweenData.keyFramePosition;
                nextTween = this.tweens[i+1].tweenData.keyFramePosition;
                if(clickPos > prevTween && clickPos < nextTween){
                    //console.log(clickPos + " found on tween: "+ this.tweens[i+1].tweenData.tweenID);
                    splitTweenIndex = this.tweens[i+1].tweenData.tweenID;
                    this.tweens[i+1].tweenData.spanWidth = this.tweens[i+1].tweenData.keyFramePosition - clickPos;
                    this.tweens[i+1].tweenData.spanPosition = ev.target.parentElement.offsetLeft + ev.offsetX;
                    if (ev.target.className != "tween-span") {
                        // don't set styles on timeline track if event is coming from the track
                    } else {
                        ev.target.style.width = this.tweens[i + 1].tweenData.spanWidth + "px";
                        ev.target.parentElement.style.left = clickPos + "px";
                        ev.target.parentElement.children[1].style.left = (this.tweens[i + 1].tweenData.spanWidth - 3) + "px";
                    }
                    var newTweenToInsert = {};
                    newTweenToInsert.tweenData = {};
                    newTweenToInsert.tweenData.spanWidth = clickPos - prevTween;
                    newTweenToInsert.tweenData.keyFramePosition = clickPos;
                    newTweenToInsert.tweenData.keyFrameMillisec = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80) * clickPos;
                    newTweenToInsert.tweenData.tweenID = splitTweenIndex - 1;
                    newTweenToInsert.tweenData.spanPosition = clickPos - newTweenToInsert.tweenData.spanWidth;
                    newTweenToInsert.tweenData.tweenedProperties = [];
                    newTweenToInsert.tweenData.tweenedProperties["top"] = this.animatedElement.offsetTop;
                    newTweenToInsert.tweenData.tweenedProperties["left"] = this.animatedElement.offsetLeft;
                    newTweenToInsert.tweenData.tweenedProperties["width"] = this.animatedElement.offsetWidth;
                    newTweenToInsert.tweenData.tweenedProperties["height"] = this.animatedElement.offsetHeight;
                    this.tweens.splice(splitTweenIndex, 0, newTweenToInsert);
                    break;
                }
            }
            this.application.ninja.documentController.activeDocument.needsSave = true;
        }
    },

    retrieveStoredTweens:{
        value:function () {
            var percentValue, fraction, splitValue,offsetAttribute,topOffSetAttribute,leftOffsetAttribute,widthOffsetAttribute,heightOffsetAttribute;
            var currentMilliSec,currentMilliSecPerPixel,clickPosition,tempTiming,tempTimingFloat,trackTiming,i = 0;

            var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
            this.application.ninja.timeline.arrLayers[selectedIndex].layerData.created=true;
            this.animatedElement = this.application.ninja.timeline.arrLayers[selectedIndex].layerData.stageElement;
            if(this.animatedElement!==undefined){
                this.animationName = this.application.ninja.stylesController.getElementStyle(this.animatedElement, "-webkit-animation-name");

                // check for multiple animation names
                var animationNameList = this.animationName.split(",");
                if(animationNameList.length > 1){
                    this.animationName = animationNameList[0];
                    this.extractKeyframesFromRules(animationNameList);
                }

                this.animationNamesString = this.animationName;

                // build tweens for this tracks's keyframe rule
                if(this.animationName){
                    trackTiming = this.application.ninja.stylesController.getElementStyle(this.animatedElement, "-webkit-animation-duration");
                    this.nextKeyframe = 0;

                    this.currentKeyframeRule = this.application.ninja.stylesController.getAnimationRuleWithName(this.animationName, this.application.ninja.currentDocument._document);

                    for (i =0; this.currentKeyframeRule[i] ;i++) {
                        var newTween = {};
                        newTween.tweenData = {};

                        offsetAttribute = this.currentKeyframeRule[i].cssText.split(" ");
                        
                        topOffSetAttribute = offsetAttribute[3].split("px");
                        leftOffsetAttribute = offsetAttribute[5].split("px");
                        widthOffsetAttribute = offsetAttribute[7].split("px");
                        heightOffsetAttribute = offsetAttribute[9].split("px");

                        var tempTopOffset = parseInt(topOffSetAttribute[0]);
                        var tempLeftOffset = parseInt(leftOffsetAttribute[0]);
                        var tempWidthOffset = parseInt(widthOffsetAttribute[0]);
                        var tempHeightOffset = parseInt(heightOffsetAttribute[0]);

                        if (this.currentKeyframeRule[i].keyText === "0%") {
                            newTween.tweenData.spanWidth = 0;
                            newTween.tweenData.keyFramePosition = 0;
                            newTween.tweenData.keyFrameMillisec = 0;
                            newTween.tweenData.tweenID = 0;
                            newTween.tweenData.spanPosition = 0;
                            newTween.tweenData.tweenedProperties = [];
                            newTween.tweenData.tweenedProperties["top"] = tempTopOffset;
                            newTween.tweenData.tweenedProperties["left"] = tempLeftOffset;
                            newTween.tweenData.tweenedProperties["width"] = tempWidthOffset;
                            newTween.tweenData.tweenedProperties["height"] = tempHeightOffset;
                            this.tweens.push(newTween);
                        }
                        else {
                            tempTiming = trackTiming.split("s");
                            tempTimingFloat = parseFloat(tempTiming[0]);
                            this.trackDuration = tempTimingFloat *1000;
                            percentValue = this.currentKeyframeRule[i].keyText;
                            splitValue = percentValue.split("%");
                            fraction = splitValue[0] / 100;
                            currentMilliSec = fraction * this.trackDuration;
                            currentMilliSecPerPixel = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80);
                            clickPosition = currentMilliSec / currentMilliSecPerPixel;
                            newTween.tweenData.spanWidth = clickPosition - this.tweens[this.tweens.length - 1].tweenData.keyFramePosition;
                            newTween.tweenData.keyFramePosition = clickPosition;
                            newTween.tweenData.keyFrameMillisec = currentMilliSec;
                            newTween.tweenData.tweenID = this.nextKeyframe;
                            newTween.tweenData.spanPosition =clickPosition - newTween.tweenData.spanWidth;
                            newTween.tweenData.tweenedProperties=[];
                            newTween.tweenData.tweenedProperties["top"] = tempTopOffset;
                            newTween.tweenData.tweenedProperties["left"] = tempLeftOffset;
                            newTween.tweenData.tweenedProperties["width"] = tempWidthOffset;
                            newTween.tweenData.tweenedProperties["height"] = tempHeightOffset;
                            this.tweens.push(newTween);
                        }
                        this.nextKeyframe += 1;
                    }
                    this.isTrackAnimated = true;
                }
            }
        }
    },

    extractKeyframesFromRules:{
        value:function(ruleNames){
            //console.log(ruleNames);
            for(var i in ruleNames){
                console.log(ruleNames[i].replace(/^\s+|\s+$/g,""));
                var currName = ruleNames[i].replace(/^\s+|\s+$/g,"");
                var test = this.application.ninja.stylesController.getAnimationRuleWithName(currName, this.application.ninja.currentDocument._document);
                console.log(test);
            }
        }
    },

    addAnimationRuleToElement:{
        value:function (tweenEvent) {
            this.tweens[0].tweenData.tweenedProperties["top"] = this.animatedElement.offsetTop;
            this.tweens[0].tweenData.tweenedProperties["left"] = this.animatedElement.offsetLeft;
            var animationDuration = Math.round(this.trackDuration / 1000) + "s";
            this.animationName = this.animatedElement.classList[0] + "_PositionSize";
            this.animationNamesString = this.animationName;
            this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-name", this.animationName);
            this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-duration", animationDuration);
            this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-iteration-count", 1);
            this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-fill-mode", "both");
            this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-transition-timing-function", "linear");
            var initRule = "@-webkit-keyframes " + this.animationName + " { 0% {top: " + this.animatedElement.offsetTop + "px; left: " + this.animatedElement.offsetLeft + "px;} 100% {top: " + this.animatedElement.offsetTop + "px; left: " + this.animatedElement.offsetLeft + "px;} }";

            this.currentKeyframeRule = this.ninjaStylesContoller.addRule(initRule);

            this.insertTween(tweenEvent.offsetX);
            this.isTrackAnimated = true;
        }
    },

    updateKeyframeRule:{
        value:function () {
            // delete the current rule
            this.ninjaStylesContoller.deleteRule(this.currentKeyframeRule);

            // build the new keyframe string
            var keyframeString = "@-webkit-keyframes " + this.animationName + " {";

            for (var i = 0; i < this.tweens.length; i++) {
                var keyMill = parseInt(this.tweens[i].tweenData.keyFrameMillisec);
                // TODO - trackDur should be parseFloat rounded to significant digits
                var trackDur = parseInt(this.trackDuration);
                var keyframePercent = Math.round((keyMill / trackDur) * 100) + "%";
                var keyframePropertyString = " " + keyframePercent + " {";
                for(var prop in this.tweens[i].tweenData.tweenedProperties){
                    keyframePropertyString += prop + ": " + this.tweens[i].tweenData.tweenedProperties[prop] + "px;";
                }
                keyframePropertyString += "}";
                keyframeString += keyframePropertyString;
            }
            keyframeString += " }";
            // set the keyframe string as the new rule
            this.currentKeyframeRule = this.ninjaStylesContoller.addRule(keyframeString);
            this.application.ninja.documentController.activeDocument.needsSave = true;
        }
    },

    // Init and event handler for layer expand/collapse
    init:{
        value:function () {
            this.createPositionTracks();
            // Register event handler for layer events.
            defaultEventManager.addEventListener("layerEvent", this, false);
        }
    },

    createPositionTracks:{
        value:function(){
            // create track objects for position and transform tracks and push into arrays

            // create 'top' track
            var newTopTrack = {};
            newTopTrack.propTrackData = {};
            newTopTrack.propTrackData.propTweens = [];
            newTopTrack.propTrackData.styleIndex = 0;
            newTopTrack.propTrackData.trackType = "position";
            newTopTrack.propTrackData.trackEditorProperty = "top";
            this.arrPositionTracks.push(newTopTrack);

            // create 'left' track
            var newLeftTrack = {};
            newLeftTrack.propTrackData = {};
            newLeftTrack.propTrackData.propTweens = [];
            newLeftTrack.propTrackData.styleIndex = 1;
            newLeftTrack.propTrackData.trackType = "position";
            newLeftTrack.propTrackData.trackEditorProperty = "left";
            this.arrPositionTracks.push(newLeftTrack);

            // create 'width' track
            var newWidthTrack = {};
            newWidthTrack.propTrackData = {};
            newWidthTrack.propTrackData.propTweens = [];
            newWidthTrack.propTrackData.styleIndex = 2;
            newWidthTrack.propTrackData.trackType = "position";
            newWidthTrack.propTrackData.trackEditorProperty = "width";
            this.arrPositionTracks.push(newWidthTrack);

            // create 'height' track
            var newHeightTrack = {};
            newHeightTrack.propTrackData = {};
            newHeightTrack.propTrackData.propTweens = [];
            newHeightTrack.propTrackData.styleIndex = 3;
            newHeightTrack.propTrackData.trackType = "position";
            newHeightTrack.propTrackData.trackEditorProperty = "height";
            this.arrPositionTracks.push(newHeightTrack);
        }
    },

    handleLayerEvent:{
        value:function (layerEvent) {
            if (layerEvent.layerID !== this.trackID) {
                return;
            }
            if (layerEvent.layerEventType === "newStyle") {
            	// TODO: Add a real track of tweens.  Probably need a method for that.

                var newStyleTrack = {};
                newStyleTrack.propTrackData = {};
                newStyleTrack.propTrackData.styleSelection = layerEvent.styleSelection;
                newStyleTrack.propTrackData.propTweens = [];
                newStyleTrack.propTrackData.trackType = "style";
                newStyleTrack.propTrackData.trackEditorProperty = "";
                newStyleTrack.propTrackData.styleIndex = layerEvent.styleIndex;

            	this.arrStyleTracks.push(newStyleTrack);

            } else if (layerEvent.layerEventType === "deleteStyle") {
            	// TODO: Delete the right track.  Index can be passed in event object, use that for splice().
            	this.arrStyleTracks.pop();
            }
        }
    },
    getTweenIndexById: {
    	value: function(intID) {
    		var i = 0,
    			arrTweensLength = this.tweens.length;
			for (i = 0; i < arrTweensLength; i++) {
			    if (this.tweens[i].tweenData.tweenID === intID) {
			        returnVal = i;
			    }
			}
			return returnVal;
    	}
    },
    
    // Drag and drop event handlers
    handleKeyframeDragstart : {
    	value: function(event) {
            var dragIcon = document.createElement("img"), 
            	minPosition = 0,
            	maxPosition = 100000000000;
            	
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('Text', this.identifier);
            dragIcon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAA1JREFUGFdj+P//PwMACPwC/ohfBuAAAAAASUVORK5CYII="
            dragIcon.width = 1;
            event.dataTransfer.setDragImage(dragIcon, 0, 0);
            
            // Clone the element we're dragging
            this._dragAndDropHelper = event.target.cloneNode(true);
            this._dragAndDropHelper.style.opacity = 0.8;
            this._dragAndDropHelper.style.position = "absolute";
            this._dragAndDropHelper.style.top = "2px";
            this._dragAndDropHelper.style.left = "0px";
            this._dragAndDropHelper.style.zIndex = 700;
            
            //this._dragAndDropHelper.style.width = window.getComputedStyle(this.container_layers, null).getPropertyValue("width");
            this._dragAndDropHelper.classList.add("track-dnd-helper");
 
    		if (this.draggingIndex < (this.tweens.length -1)) {
    			maxPosition = this.tweenRepetition.childComponents[this.draggingIndex+1].keyFramePosition;
    		}
    		if (this.draggingIndex > 1) {
    			minPosition = this.tweenRepetition.childComponents[this.draggingIndex-1].keyFramePosition;
    		}
    		this._keyframeMinPosition = minPosition+2;
    		this._keyframeMaxPosition = maxPosition-9;
    		this._appendHelper = true;
    		this._deleteHelper = false;
    		
    		// Get my index in the track array
    		var i = 0,
    			arrLayersLength = this.parentComponent.parentComponent.arrLayers.length,
    			myId = null;
    		for (i = 0; i < arrLayersLength; i++) {
    			var currUuid = this.parentComponent.parentComponent.trackRepetition.childComponents[i].uuid;
    			if ( currUuid === this.uuid) {
    				myId = i;
    			}
    		}
    		this.parentComponent.parentComponent.draggingTrackId = myId;
    		this.parentComponent.parentComponent.draggingType = "keyframe";
    	}
    },
    handleKeyframeDragend : {
    	value: function(event) {
    		if (this.parentComponent.parentComponent.draggingType !== "keyframe") {
    			return;
    		}
    		this._deleteHelper = true;
    		this.needsDraw = true;
           
    	}
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
