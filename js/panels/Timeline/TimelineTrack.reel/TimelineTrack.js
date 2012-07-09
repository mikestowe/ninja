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
var defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;

var TimelineTrack = exports.TimelineTrack = Montage.create(Component, {

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

    _tween:{
        value:[]
    },

    tween:{
        serializable:true,
        get:function () {
            return this._tween;
        },
        set:function (newVal) {
            this._tween = newVal;
        }
    },

    positionPropertyTrack:{
        value:null
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
    
    _stageElement: {
    	value: null
    },
    stageElement: {
    	get: function() {
    		return this._stageElement;
    	},
    	set: function(newVal) {
    		this._stageElement = newVal;
    		this.trackData.stageElement = newVal;
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

    _ruleList:{
        value:[]
    },

    ruleList:{
        get:function () {
            return this._ruleList;
        },
        set:function (val) {
            this._ruleList = val;
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
    positionCollapser:{
        serializable:true,
        get:function(){
            return this._positionCollapser;
        },
        set:function(val){
            this._positionCollapser = val;
        }
    },
    _mainCollapser:{
        value:null
    },
    mainCollapser:{
        serializable:true,
        get:function () {
            return this._mainCollapser;
        },
        set:function (val) {
            this._mainCollapser = val;
        }
    },
    _transformCollapser:{
        value:null
    },
    transformCollapser:{
        serializable:true,
        get:function () {
            return this._transformCollapser;
        },
        set:function (val) {
            this._transformCollapser = val;
        }
    },
    _styleCollapser:{
        value:null
    },
    styleCollapser:{
        serializable:true,
        get:function () {
            return this._styleCollapser;
        },
        set:function (val) {
            this._styleCollapser = val;
        }
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
    	serializable: true,
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
            this.arrPositionTracks = this.trackData.arrPositionTracks;
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
            this.stageElement = this.trackData.stageElement;
            this.trackEditorProperty = "master";
            this.needsDraw = true;
        }
    },

    createTrackData: {
    	value: function() {
    		tempData = {};
            tempData.bypassAnimation = this.bypassAnimation;
            tempData.trackID = this.layerID;
            tempData.tweens = this.tweens;
            tempData.animatedElement = this.animatedElement; 
            tempData.arrStyleTracks = this.arrStyleTracks;
            tempData.arrPositionTracks = this.arrPositionTracks;
            tempData.isTrackAnimated = this.isTrackAnimated;
            tempData.trackDuration = this.trackDuration;
            tempData.animationName = this.animationName;
            tempData.currentKeyframeRule = this.currentKeyframeRule;
            tempData.isMainCollapsed = this.isMainCollapsed;
            tempData.isPositionCollapsed = this.isPositionCollapsed;
            tempData.isTransformCollapsed = this.isTransformCollapsed;
            tempData.isStyleCollapsed = this.isStyleCollapsed;
            tempData.trackPosition = this.trackPosition;
            tempData.isVisible = this.isVisible;
            this.trackData = tempData;
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
            this.trackData.triggerBinding = !this.trackData.triggerBinding;
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
                if (this.application.ninja.currentDocument.model.documentRoot.children[0]) {
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

            var targetElementOffset = this.findXOffset(ev.currentTarget),
            	position = (event.pageX - targetElementOffset) - 18;

            this.application.ninja.timeline.playheadmarker.style.left = position + "px";
            var currentMillisecPerPixel = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80);
            var currentMillisec = currentMillisecPerPixel * position;
            this.application.ninja.timeline.updateTimeText(currentMillisec);

            if (ev.shiftKey) {
	            var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
	            this.application.ninja.timeline.selectLayer(selectedIndex, true);
                if (this.tweens.length < 1) {
                    this.insertTween(0);
                    this.addAnimationRuleToElement(ev);
                    this.updateKeyframeRule();
                } else {
                    if (ev.target.className === "tracklane") {
                        this.handleNewTween(ev);
                        this.updateKeyframeRule();
                    } else if (ev.target.className === "tween_span_bar" && ev.target.parentElement.parentElement.parentElement.className === "tracklane") {
                        this.handleNewTween(ev);
                        this.updateKeyframeRule();
                    }
                }
            }
        }
    },

    handleKeyboardShortcut:{
        value:function(ev){
            if(ev.actionType == "insert"){
                if (this.tweens.length < 1) {
                    this.insertTween(0);
                    this.addAnimationRuleToElement(ev);
                    this.updateKeyframeRule();
                } else {
                    this.handleNewTween(ev);
                    this.updateKeyframeRule();
                }
            } else if(ev.actionType == "remove"){
                this.removeTween();
                this.updateKeyframeRule();
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
            	// We will be splitting a tween.  Get the x-coordinate of the mouse click within the target element.
            	// You'd think you could use the event.x info for that, right? NO. We must use page values, calculating offsets and scrolling.
	            if (typeof(ev.currentTarget) === "undefined") {
	            	this.splitTweenAt(ev.offsetX);
	            } else {
					var targetElementOffset = this.findXOffset(ev.currentTarget),
						position = event.pageX - targetElementOffset;
	                this.splitTweenAt(position-18);
	            }
            }
        }
    },

    findXOffset:{
        value:function (obj) {
            // Here's an easy function that adds up offsets and scrolls and returns the page x value of an element
            var curleft = 0;
            if (typeof(obj) === "undefined") {
            	//debugger;
            }
            if (obj.offsetParent) {
                do {
                    curleft += (obj.offsetLeft - obj.scrollLeft);

                } while (obj = obj.offsetParent);
            }
            return curleft;
        }
    },

    insertTween:{
        value:function (clickPos) {
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
                newTween.tweenData.easing = "none";
                newTween.tweenData.tweenedProperties = [];
                newTween.tweenData.tweenedProperties["top"] = this.animatedElement.offsetTop + "px";
                newTween.tweenData.tweenedProperties["left"] = this.animatedElement.offsetLeft + "px";
                newTween.tweenData.tweenedProperties["width"] = this.animatedElement.offsetWidth + "px";
                newTween.tweenData.tweenedProperties["height"] = this.animatedElement.offsetHeight + "px";
                this.tweens.push(newTween);

                this.createMatchingPositionSizeTween(newTween);

            } else {
                newTween.tweenData.spanWidth = clickPos - this.tweens[this.tweens.length - 1].tweenData.keyFramePosition;
                newTween.tweenData.keyFramePosition = clickPos;
                newTween.tweenData.keyFrameMillisec = currentMillisec;
                newTween.tweenData.tweenID = this.nextKeyframe;
                newTween.tweenData.spanPosition = clickPos - newTween.tweenData.spanWidth;
                newTween.tweenData.easing = "none";
                newTween.tweenData.tweenedProperties = [];
                newTween.tweenData.tweenedProperties["top"] = this.animatedElement.offsetTop + "px";
                newTween.tweenData.tweenedProperties["left"] = this.animatedElement.offsetLeft + "px";
                newTween.tweenData.tweenedProperties["width"] = this.animatedElement.offsetWidth + "px";
                newTween.tweenData.tweenedProperties["height"] = this.animatedElement.offsetHeight + "px";
                this.tweens.push(newTween);

                // update the animation duration
                var animationDuration = (this.trackDuration / 1000) + "s";
                this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-duration", animationDuration);
                this.nextKeyframe += 1;

                this.createMatchingPositionSizeTween(newTween);
            }

            this.application.ninja.currentDocument.model.needsSave = true;
        }
    },

    removeTween:{
        value:function(){
            var tweenIDToRemove = this.application.ninja.timeline.selectedTweens[0].tweenID,
                oldPosition = this.application.ninja.timeline.selectedTweens[0].spanPosition,
                oldSpanWidth = this.application.ninja.timeline.selectedTweens[0].spanWidth;

            if(tweenIDToRemove == this.tweens[this.tweens.length-1].tweenData.tweenID){
                this.trackDuration = this.tweens[this.tweens.length-2].tweenData.keyFrameMillisec;
                this.tweens.pop();
                return;
            }

            // Update the next tween to have new span position and width.
            this.tweens[tweenIDToRemove + 1].tweenData.spanPosition = oldPosition;
            this.tweens[tweenIDToRemove + 1].spanPosition = oldPosition;
            this.tweens[tweenIDToRemove + 1].tweenData.spanWidth = this.tweens[tweenIDToRemove + 1].tweenData.spanWidth + oldSpanWidth;
            this.tweens[tweenIDToRemove + 1].spanWidth = this.tweens[tweenIDToRemove + 1].spanWidth + oldSpanWidth;

            // redraw the tweens
            for(var i in this.tweenRepetition.childComponents){
                this.tweenRepetition.childComponents[i].setData();
            }

            // remove the selected tween
            this.tweens.splice(tweenIDToRemove, 1);
            this.application.ninja.currentDocument.model.needsSave = true;

            // update the tween ids
            for (var j = 0; j < this.tweens.length; j++) {
                this.tweens[j].tweenID = j;
                this.tweens[j].tweenData.tweenID = j;
            }
        }
    },

    createMatchingPositionSizeTween:{
        value:function (newTween) {
            var i;
            var posTracks = this.positionTracksRepetition.childComponents.length;
            for (i = 0; i < posTracks; i++) {
                this.positionTracksRepetition.childComponents[i].propTweens.push(newTween);
            }
        }
    },

	// splitTweenAt: Split a tween at a particular position (x coordinate)
    splitTweenAt: {
        value:function (position) {
            var i, j, nextComponentIndex,
            	tweensLength = this.tweens.length-1,
            	prevTween, 
            	nextTween, 
            	splitTweenIndex;

			// Search through the tweens and find the pair whose keyframes bracket position.
            for(i=0; i<tweensLength; i++){
                prevTween = this.tweens[i].tweenData.keyFramePosition;
                nextTween = this.tweens[i+1].tweenData.keyFramePosition;
                if(position > prevTween && position < nextTween) {
                	
                	// We will insert a new tween at this index
                    splitTweenIndex = i+1;

					// Update the next tween to have new span position and width.
                    this.tweens[i+1].tweenData.spanPosition = position;
                    this.tweens[i+1].spanPosition = position;
                    this.tweens[i+1].tweenData.spanWidth = this.tweens[i+1].tweenData.keyFramePosition - position;
                    this.tweens[i+1].spanWidth = this.tweens[i+1].keyFramePosition - position;
                    
                    // You'd think that would be enough to make the component associated with that part of the array redraw, wouldn't you?
                    // Turns out we have to manually poke the desired childComponent in the repetition to register its new changes.
                    // So we have to get the index of the actual componentin the repetition, which may not match our iteration index.
                    for (j = 0; j < tweensLength +1; j++) {
                    	if (this.tweenRepetition.childComponents[j].keyFramePosition === nextTween) {
                    		nextComponentIndex = j;
                    	}
                    }
                    this.tweenRepetition.childComponents[nextComponentIndex].setData();

					// Create the new tween and splice it into the model
                    var newTweenToInsert = {};
                    newTweenToInsert.tweenData = {};
                    newTweenToInsert.tweenData.spanWidth = position - prevTween;
                    newTweenToInsert.tweenData.keyFramePosition = position;
                    newTweenToInsert.tweenData.keyFrameMillisec = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80) * position;
                    newTweenToInsert.tweenData.tweenID = this.tweens.length;
                    newTweenToInsert.tweenData.spanPosition = position - newTweenToInsert.tweenData.spanWidth;
                    newTweenToInsert.tweenData.tweenedProperties = [];
                    newTweenToInsert.tweenData.tweenedProperties["top"] = this.animatedElement.offsetTop + "px";
                    newTweenToInsert.tweenData.tweenedProperties["left"] = this.animatedElement.offsetLeft + "px";
                    newTweenToInsert.tweenData.tweenedProperties["width"] = this.animatedElement.offsetWidth + "px";
                    newTweenToInsert.tweenData.tweenedProperties["height"] = this.animatedElement.offsetHeight + "px";
                    this.tweens.splice(splitTweenIndex, 0, newTweenToInsert);
                    
                    // We are done, so end the loop.
                    i = tweensLength;
                }
            }
            
            // We've made a change, so set the needsSave flag
            this.application.ninja.currentDocument.model.needsSave = true;
            
            // Our tween IDs are now all messed up.  Fix them.
            for (i = 0; i <= tweensLength+1; i++) {
				this.tweens[i].tweenID = i;
				this.tweens[i].tweenData.tweenID = i;
			}
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
                // build tweens for this tracks's keyframe rule
                if(this.animationName){
                    // check for multiple animation names
                    var animationNameList = this.animationName.split(",");
                    if (animationNameList.length > 1) {
                        this.animationNamesString = this.animationName;
                        this.animationName = animationNameList[0];
                        this.getAllAnimationRules(animationNameList);
                    } else {
                        this.animationNamesString = this.animationName;
                    }

                    trackTiming = this.application.ninja.stylesController.getElementStyle(this.animatedElement, "-webkit-animation-duration");
                    this.nextKeyframe = 0;

                    this.currentKeyframeRule = this.application.ninja.stylesController.getAnimationRuleWithName(this.animationName, this.application.ninja.currentDocument.model.views.design.document);

                    for (i =0; this.currentKeyframeRule[i] ;i++) {
                        var newTween = {};
                        newTween.tweenData = {};

                        var j, styleLength = this.currentKeyframeRule[i].style.length, keyframeStyles = [];

                        for(j=0; j<styleLength; j++){
                            // check for vendor prefixes and skip them for now
                            var firstChar = this.currentKeyframeRule[i].style[j].charAt(0);
                            if(firstChar === "-"){
                                break;
                            } else {
                                var currProp = this.currentKeyframeRule[i].style[j];
                                var propVal = this.currentKeyframeRule[i].style[currProp];
                                keyframeStyles.push([currProp, propVal]);
                            }
                        }

                        // recreate tween properties array for timeline tween
                        newTween.tweenData.tweenedProperties = [];
                        for(var k in keyframeStyles){
                            newTween.tweenData.tweenedProperties[keyframeStyles[k][0]] = keyframeStyles[k][1];
                        }

                        if (this.currentKeyframeRule[i].keyText === "0%") {
                            newTween.tweenData.spanWidth = 0;
                            newTween.tweenData.keyFramePosition = 0;
                            newTween.tweenData.keyFrameMillisec = 0;
                            newTween.tweenData.tweenID = 0;
                            newTween.tweenData.spanPosition = 0;
                            this.tweens.push(newTween);
                            this.createMatchingPositionSizeTween(newTween);
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
                            newTween.tweenData.easing = this.currentKeyframeRule[i].style.webkitAnimationName;
                            if (newTween.tweenData.easing == "") {
                            	newTween.tweenData.easing = "none";
                            }
                            this.tweens.push(newTween);
                            this.createMatchingPositionSizeTween(newTween);
                        }
                        this.nextKeyframe += 1;
                    }
                    this.isTrackAnimated = true;
                }
            }
        }
    },

    getAllAnimationRules:{
        value:function(ruleNames){
            ruleNames.splice(0,1); // temp remove first animation already retrieved for main track

            for(var i in ruleNames){
                var currentName = ruleNames[i].replace(/^\s+|\s+$/g,"");  // trim whitespace
                var currentRule = this.application.ninja.stylesController.getAnimationRuleWithName(currentName, this.application.ninja.currentDocument._document);
                this.ruleList[currentName] = currentRule;
            }

            this.recreatePropertyTracks(this.ruleList);
        }
    },

    recreatePropertyTracks:{
        value:function(ruleSet){
            for(var i in ruleSet){
                var styleProp = ruleSet[i][0].style[0];
                this.application.ninja.timeline.layerRepetition.childComponents[0].addStyle(styleProp, ruleSet[i]);
            }
        }
    },

    addAnimationRuleToElement:{
        value:function (tweenEvent) {
            this.tweens[0].tweenData.tweenedProperties["top"] = this.animatedElement.offsetTop + "px";
            this.tweens[0].tweenData.tweenedProperties["left"] = this.animatedElement.offsetLeft + "px";
            this.tweens[0].tweenData.tweenedProperties["width"] = this.animatedElement.offsetWidth + "px";
            this.tweens[0].tweenData.tweenedProperties["height"] = this.animatedElement.offsetHeight + "px";
            var animationDuration = Math.round(this.trackDuration / 1000) + "s";
            this.animationName = this.animatedElement.classList[0] + "_PositionSize";
            if(this.animationNamesString.length == 0){
                this.animationNamesString = this.animationName;
            } else {
                this.animationNamesString = this.animationName + ", " + this.animationNamesString;
            }
            this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-name", this.animationNamesString);
            this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-duration", animationDuration);
            this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-fill-mode", "forwards");
            this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-iteration-count", 1);

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

            //console.log(this.animationName);

            for (var i = 0; i < this.tweens.length; i++) {
                var keyMill = parseInt(this.tweens[i].tweenData.keyFrameMillisec);
                // TODO - trackDur should be parseFloat rounded to significant digits
                var trackDur = parseInt(this.trackDuration);
                var keyframePercent = Math.round((keyMill / trackDur) * 100) + "%";
                var keyframePropertyString = " " + keyframePercent + " {";
                for(var prop in this.tweens[i].tweenData.tweenedProperties){
                    //console.log(prop + " - " + this.tweens[i].tweenData.tweenedProperties[prop]);
                    keyframePropertyString += prop + ": " + this.tweens[i].tweenData.tweenedProperties[prop] + ";";
                }
                keyframePropertyString += "}";
                keyframeString += keyframePropertyString;
            }
            keyframeString += " }";
            //console.log(keyframeString);
            // set the keyframe string as the new rule
            this.currentKeyframeRule = this.ninjaStylesContoller.addRule(keyframeString);
            //console.log(this.currentKeyframeRule);
            this.application.ninja.currentDocument.model.needsSave = true;
        }
    },

    // Init and event handler for layer expand/collapse
    init:{
        value:function () {
            this.createPositionTracks();
            // Register event handler for layer events.
            //defaultEventManager.addEventListener("layerEvent", this, false);
            this.element.addEventListener("layerEvent", this, false);
        }
    },

    createPositionTracks:{
        value:function(){
            // create track objects for position and transform tracks and push into arrays
            
            // ... but only do it if we haven't already.
            if (this.arrPositionTracks.length > 0) {
            	return;
            }

            // create 'left' track
            var newLeftTrack = {};
            newLeftTrack.propTrackData = {};
            newLeftTrack.propTrackData.propTweens = [];
            newLeftTrack.propTrackData.styleIndex = 1;
            newLeftTrack.propTrackData.trackType = "position";
            newLeftTrack.propTrackData.trackEditorProperty = "left";
            this.arrPositionTracks.push(newLeftTrack);

             // create 'top' track
            var newTopTrack = {};
            newTopTrack.propTrackData = {};
            newTopTrack.propTrackData.propTweens = [];
            newTopTrack.propTrackData.styleIndex = 0;
            newTopTrack.propTrackData.trackType = "position";
            newTopTrack.propTrackData.trackEditorProperty = "top";
            this.arrPositionTracks.push(newTopTrack);

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
                var newStyleTrack = {};
                newStyleTrack.propTrackData = {};
                newStyleTrack.propTrackData.styleSelection = layerEvent.styleSelection;
                newStyleTrack.propTrackData.propTweens = [];
                newStyleTrack.propTrackData.trackType = "style";
                newStyleTrack.propTrackData.trackEditorProperty = "";
                newStyleTrack.propTrackData.styleIndex = layerEvent.styleIndex;
                newStyleTrack.propTrackData.existingRule = "";

            	this.arrStyleTracks.push(newStyleTrack);

            } else if (layerEvent.layerEventType === "restoreStyle") {
                var restoredStyleTrack = {};
                restoredStyleTrack.propTrackData = {};
                restoredStyleTrack.propTrackData.styleSelection = layerEvent.styleSelection;
                restoredStyleTrack.propTrackData.propTweens = [];
                restoredStyleTrack.propTrackData.trackType = "style";
                restoredStyleTrack.propTrackData.trackEditorProperty = layerEvent.trackEditorProperty;
                restoredStyleTrack.propTrackData.styleIndex = layerEvent.styleIndex;
                restoredStyleTrack.propTrackData.existingRule = layerEvent.existingRule;

                this.arrStyleTracks.push(restoredStyleTrack);
            }
            else if (layerEvent.layerEventType === "deleteStyle") {
            	// We are deleting a style, so delete the associated track
            	this.arrStyleTracks.splice(layerEvent._event.selectedStyleIndex, 1);
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
            this._dragAndDropHelper.style.top = "5px";
            this._dragAndDropHelper.style.left = "0px";
            this._dragAndDropHelper.style.zIndex = 700;
            this._dragAndDropHelper.classList.add("keyframeSelected");
            
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
