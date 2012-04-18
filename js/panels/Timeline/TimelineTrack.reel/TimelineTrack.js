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
        serializable:true,
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
    	serializable: true,
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
        serializable:true,
        enumerable:true,
    	value: []
    },
    arrStyleTracks: {
        serializable:true,
        enumerable:true,
    	get: function() {
    		return this._arrStyleTracks;
    	},
    	set: function(newVal) {
    		this._arrStyleTracks = newVal;
            this.trackData.arrStyleTracks = newVal;
    	}
    },
    _styleTracksRepetition: {
    	serializable: true,
    	value: null
    },
    styleTracksRepetition : {
    	serializable: true,
    	get: function() {
    		return this._styleTracksRepetition;
    	},
    	set: function(newVal) {
    		this._styleTracksRepetition = newVal;
    	}
    },
    
    /* Position Property Tracks */
    _arrPositionTracks : {
        serializable:true,
        enumerable:true,
    	value: []
    },
    arrPositionTracks: {
        serializable:true,
        enumerable:true,
    	get: function() {
    		return this._arrPositionTracks;
    	},
    	set: function(newVal) {
    		this._arrPositionTracks = newVal;
            this.trackData.arrPositionTracks = newVal;
    	}
    },
    _positionTracksRepetition: {
    	serializable: true,
    	value: null
    },
    positionTracksRepetition : {
    	serializable: true,
    	get: function() {
    		return this._positionTracksRepetition;
    	},
    	set: function(newVal) {
    		this._positionTracksRepetition = newVal;
    	}
    },
    
    
    /* Transform Property Tracks */
    _arrTransformTracks : {
        serializable:true,
        enumerable:true,
    	value: []
    },
    arrTransformTracks: {
        serializable:true,
        enumerable:true,
    	get: function() {
    		return this._arrTransformTracks;
    	},
    	set: function(newVal) {
    		this._arrTransformTracks = newVal;
            this.trackData.arrTransformTracks = newVal;
    	}
    },
    _transformTracksRepetition: {
    	serializable: true,
    	value: null
    },
    transformTracksRepetition : {
    	serializable: true,
    	get: function() {
    		return this._transformTracksRepetition;
    	},
    	set: function(newVal) {
    		this._transformTracksRepetition = newVal;
    	}
    },

    _tweens:{
        enumerable: false,
        value:[]
    },

    tweens:{
        serializable:true,
        get:function () {
            return this._tweens;
        },
        set:function (newVal) {
            this._tweens = newVal;
            this.trackData.tweens = newVal;
        }
    },

    _tweenRepetition:{
        serializable:true,
        value:null
    },

    tweenRepetition:{
        serializable:true,
        get:function () {
            return this._spanRepetition;
        },
        set:function (newVal) {
            this._spanRepetition = newVal;
        }
    },

    _trackDuration:{
        serializable: true,
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
        serializable:true,
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
        serializable: true,
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
        serializable: true,
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
        enumerable: true,
        serializable:true,
        value:null
    },
    animatedElement:{
        enumerable: true,
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
        serializable:true,
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

    _trackData:{
    	serializable: true,
		value: false
    },

    trackData:{
        serializable:true,
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
            this.animatedElement = this.trackData.animatedElement; // unneeded with one element per layer restriction
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
        }
    },

    draw:{
        value:function () {
            this.ninjaStylesContoller = this.application.ninja.stylesController;
            var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
            if (selectedIndex !== false) {
	            if(this.application.ninja.timeline.arrLayers[selectedIndex].layerData.elementsList[0]){
	                this.animatedElement = this.application.ninja.timeline.arrLayers[selectedIndex].layerData.elementsList[0];
	            }
            }

        }
    },

    didDraw:{
        value:function () {
            if ((!this.application.ninja.documentController.creatingNewFile) || (this.application.ninja.breadCrumbClick)) {
                if (this.application.ninja.currentDocument.documentRoot.children[0]) {
                    var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
                    if (selectedIndex !== false) {
	                    if (!this.application.ninja.timeline.arrLayers[selectedIndex].layerData.created) {
	                        this.retrieveStoredTweens();
	                        this.application.ninja.breadCrumbClick = false;
	                    }
                    }
                }
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
                if (this.application.ninja.timeline.arrLayers[selectedIndex].layerData.elementsList.length == 1) {
                    if (this.tweens.length < 1) {
                        this.insertTween(0);
                        this.addAnimationRuleToElement(ev);
                        this.updateKeyframeRule();
                    } else {
                        this.handleNewTween(ev);
                        this.updateKeyframeRule();
                    }
                } else {
                    console.log("There must be exactly one element in an animated layer.");
                }
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
                this.animatedElement = this.application.ninja.timeline.currentLayerSelected.layerData.elementsList[0];
                newTween.tweenData.spanWidth = 0;
                newTween.tweenData.keyFramePosition = 0;
                newTween.tweenData.keyFrameMillisec = 0;
                newTween.tweenData.tweenID = 0;
                newTween.tweenData.spanPosition = 0;
                newTween.tweenData.tweenedProperties = [];
                newTween.tweenData.tweenedProperties["top"] = this.animatedElement.offsetTop;
                newTween.tweenData.tweenedProperties["left"] = this.animatedElement.offsetLeft;
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
            console.log("Splitting an existing span with a new keyframe is not yet supported.");
        }
    },

    retrieveStoredTweens:{
        value:function () {
            var percentValue, fraction, splitValue,offsetAttribute,topOffSetAttribute,leftOffsetAttribute;
            var currentMilliSec,currentMilliSecPerPixel,clickPosition,tempTiming,tempTimingFloat,trackTiming,i = 0;

            var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
            this.application.ninja.timeline.arrLayers[selectedIndex].layerData.created=true;
            this.animatedElement = this.application.ninja.timeline.arrLayers[selectedIndex].layerData.elementsList[0];
            if(this.animatedElement!==undefined){
                this.animationName = this.application.ninja.stylesController.getElementStyle(this.animatedElement, "-webkit-animation-name");
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

                        var tempTopOffset = parseInt(topOffSetAttribute[0]);
                        var tempLeftOffset =parseInt(leftOffsetAttribute[0]);

                        if (this.currentKeyframeRule[i].keyText === "0%") {
                            newTween.tweenData.spanWidth = 0;
                            newTween.tweenData.keyFramePosition = 0;
                            newTween.tweenData.keyFrameMillisec = 0;
                            newTween.tweenData.tweenID = 0;
                            newTween.tweenData.spanPosition = 0;
                            newTween.tweenData.tweenedProperties = [];
                            newTween.tweenData.tweenedProperties["top"] = tempTopOffset;
                            newTween.tweenData.tweenedProperties["left"] = tempLeftOffset;
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
                            this.tweens.push(newTween);
                        }
                        this.nextKeyframe += 1;
                    }
                    this.isTrackAnimated = true;
                }
            }
        }
    },

    addAnimationRuleToElement:{
        value:function (tweenEvent) {
            this.tweens[0].tweenData.tweenedProperties["top"] = this.animatedElement.offsetTop;
            this.tweens[0].tweenData.tweenedProperties["left"] = this.animatedElement.offsetLeft;
            var animationDuration = Math.round(this.trackDuration / 1000) + "s";
            this.animationName = "animation_" + this.animatedElement.classList[0];
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
            
            this.arrPositionTracks = [0, 1];
            this.arrTransformTracks = [0, 1, 2, 3, 4];

            // Register event handler for layer events.
            defaultEventManager.addEventListener("layerEvent", this, false);

        }
    },

    handleLayerEvent:{
        value:function (layerEvent) {
            if (layerEvent.layerID !== this.trackID) {
                return;
            }
            if (layerEvent.layerEventType === "newStyle") {
            	// TODO: Add a real track of tweens.  Probably need a method for that.
            	this.arrStyleTracks.push("1");
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
