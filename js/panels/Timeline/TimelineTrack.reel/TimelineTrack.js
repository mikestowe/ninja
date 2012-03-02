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
            this._trackID = value;
            this.needsDraw = true;
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
    		this.log('TimelineTrack.js: isMainCollapsed: ', newVal);
            if (newVal !== this._isMainCollapsed) {
                this._isMainCollapsed = newVal;
            }

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
            if (newVal !== this._isTransformCollapsed) {
                this._isTransformCollapsed = newVal;
                this.needsDraw = true;
            }
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
            if (newVal !== this._isPositionCollapsed) {
                this._isPositionCollapsed = newVal;
                this.needsDraw = true;
            }
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
    		this.needsDraw = true;
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
    		this.needsDraw = true;
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
    		this.needsDraw = true;
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
    		this.needsDraw = true;
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
    		this.needsDraw = true;
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
    		this.needsDraw = true;
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
            this.needsDraw=true;
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
        }
    },

    _animatedElement:{
        serializable:true,
        value:null
    },

    animatedElement:{
        serializable:true,
        get:function () {
            return this._animatedElement;
        },
        set:function (val) {
            this._animatedElement = val;
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
    prepareForDraw:{
        value:function () {
            this.init();
            this.ninjaStylesContoller = this.application.ninja.stylesController;
            this.element.addEventListener("click", this, false);
        }
    },

    draw:{
        value:function () {
            this.ninjaStylesContoller = this.application.ninja.stylesController;
            return;
            if (this._mainCollapser.isCollapsed !== this.isMainCollapsed) {
                this._mainCollapser.toggle(false);
            }
            if (this._positionCollapser.isCollapsed !== this.isPositionCollapsed) {
                this._positionCollapser.toggle(false);
            }
            if (this._transformCollapser.isCollapsed !== this.isTransformCollapsed) {
                this._transformCollapser.toggle(false);
            }
            if (this._styleCollapser.isCollapsed !== this.isStyleCollapsed) {
                this._styleCollapser.toggle(false);
            }

        }
    },

    didDraw:{
        value:function () {
            if(!this.application.ninja.documentController.creatingNewFile){
                if(this.application.ninja.currentDocument.documentRoot.children[0]){
                    var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
                     if(!this.application.ninja.timeline.arrLayers[selectedIndex].created){
                        this.retrieveStoredTweens();
                     }
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
                if (this.application.ninja.timeline.arrLayers[selectedIndex].elementsList.length == 1) {
                    if (this.tweens.length < 1) {
                        this.insertTween(0);
                        this.addAnimationRuleToElement(ev);
                    } else {
                        this.handleNewTween(ev);
                    }
                } else {
                    console.log("There must be exactly one element in an animated layer.");
                }
            }
        }
    },

    handleNewTween:{
        value:function (ev) {
            if (ev.offsetX > this.tweens[this.tweens.length - 1].keyFramePosition) {
                this.insertTween(ev.offsetX);
            } else {
                this.splitTween(ev);
            }
        }
    },

    insertTween:{
        value:function (clickPos) {
            // calculate new tween's keyframe milliseconds by clickPos
            var currentMillisecPerPixel = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80);
            var currentMillisec = currentMillisecPerPixel * clickPos;

            // need to check timeline master duration if greater than this track duration
            this.trackDuration = currentMillisec;
            var newTween = {};

            if (clickPos == 0) {
                this.animatedElement = this.application.ninja.timeline.currentLayerSelected.elementsList[0];
                newTween.spanWidth = 0;
                newTween.keyFramePosition = 0;
                newTween.keyFrameMillisec = 0;
                newTween.tweenID = 0;
                newTween.spanPosition = 0;
                newTween.tweenedProperties = [];
                newTween.tweenedProperties["top"] = this.animatedElement.offsetTop;
                newTween.tweenedProperties["left"] = this.animatedElement.offsetLeft;
                this.tweens.push(newTween);
            } else {
                newTween.spanWidth = clickPos - this.tweens[this.tweens.length - 1].keyFramePosition;
                newTween.keyFramePosition = clickPos;
                newTween.keyFrameMillisec = currentMillisec;
                newTween.tweenID = this.nextKeyframe;
                newTween.spanPosition = clickPos - newTween.spanWidth;
                newTween.tweenedProperties = [];
                newTween.tweenedProperties["top"] = this.animatedElement.offsetTop;
                newTween.tweenedProperties["left"] = this.animatedElement.offsetLeft;
                this.tweens.push(newTween);

                // update the animation duration
                var animationDuration = Math.round(this.trackDuration / 1000) + "s";
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
            var currentMilliSec,currentMilliSecPerPixel,clickPosition,tempTiming,tempTimingInt,trackTiming,i = 0;

            var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
            this.application.ninja.timeline.arrLayers[selectedIndex].created=true;
            this.animatedElement = this.application.ninja.timeline.arrLayers[selectedIndex].elementsList[0];
            if(this.animatedElement!==undefined){
                this.animationName = this.application.ninja.stylesController.getElementStyle(this.animatedElement, "-webkit-animation-name");
                if(this.animationName){
                    trackTiming = this.application.ninja.stylesController.getElementStyle(this.animatedElement, "-webkit-animation-duration");
                    this.nextKeyframe = 0;

                    this.currentKeyframeRule = this.application.ninja.stylesController.getAnimationRuleWithName(this.animationName, this.application.ninja.currentDocument._document);

                    for (i =0; this.currentKeyframeRule[i] ;i++) {
                        var newTween = {};

                        offsetAttribute = this.currentKeyframeRule[i].cssText.split(" ");
                        topOffSetAttribute = offsetAttribute[3].split("px");
                        leftOffsetAttribute = offsetAttribute[5].split("px");

                        var tempTopOffset = parseInt(topOffSetAttribute[0]);
                        var tempLeftOffset =parseInt(leftOffsetAttribute[0]);

                        if (this.currentKeyframeRule[i].keyText === "0%") {
                            newTween.spanWidth = 0;
                            newTween.keyFramePosition = 0;
                            newTween.keyFrameMillisec = 0;
                            newTween.tweenID = 0;
                            newTween.spanPosition = 0;
                            newTween.tweenedProperties = [];
                            newTween.tweenedProperties["top"] = tempTopOffset;
                            newTween.tweenedProperties["left"] = tempLeftOffset;
                            this.tweens.push(newTween);
                        }
                        else {
                            tempTiming = trackTiming.split("s");
                            tempTimingInt = parseInt(tempTiming[0]);
                            this.trackDuration = tempTimingInt *1000;
                            percentValue = this.currentKeyframeRule[i].keyText;
                            splitValue = percentValue.split("%");
                            fraction = splitValue[0] / 100;
                            currentMilliSec = fraction * this.trackDuration;
                            currentMilliSecPerPixel = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80);
                            clickPosition = currentMilliSec / currentMilliSecPerPixel;
                            newTween.spanWidth = clickPosition - this.tweens[this.tweens.length - 1].keyFramePosition;
                            newTween.keyFramePosition = clickPosition;
                            newTween.keyFrameMillisec = currentMilliSec;
                            newTween.tweenID = this.nextKeyframe;
                            newTween.spanPosition =clickPosition - newTween.spanWidth;
                            newTween.tweenedProperties=[];
                            newTween.tweenedProperties["top"] = tempTopOffset;
                            newTween.tweenedProperties["left"] = tempLeftOffset;
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
            this.tweens[0].tweenedProperties["top"] = this.animatedElement.offsetTop;
            this.tweens[0].tweenedProperties["left"] = this.animatedElement.offsetLeft;
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
                var keyMill = parseInt(this.tweens[i].keyFrameMillisec);
                // TODO - trackDur should be parseFloat rounded to significant digits
                var trackDur = parseInt(this.trackDuration);
                var keyframePercent = Math.round((keyMill / trackDur) * 100) + "%";
                var keyframePropertyString = " " + keyframePercent + " {";
                for(var prop in this.tweens[i].tweenedProperties){
                    keyframePropertyString += prop + ": " + this.tweens[i].tweenedProperties[prop] + "px;";
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
            var that = this;
            
            this.arrPositionTracks = [0, 1];
            this.arrTransformTracks = [0, 1, 2, 3, 4];
            
            this.label = this.element.querySelector(".label-main");
            this.myContent = this.element.querySelector(".content-main");
            this.labelPosition = this.element.querySelector(".label-position");
            this.contentPosition = this.element.querySelector(".content-position");
            this.labelTransform = this.element.querySelector(".label-transform");
            this.contentTransform = this.element.querySelector(".content-transform");
            this.labelStyles = this.element.querySelector(".label-styles");
            this.contentStyles = this.element.querySelector(".content-styles");

            this._mainCollapser = Collapser.create();
            this._mainCollapser.clicker = this.label;
            this._mainCollapser.myContent = this.myContent;
            this._mainCollapser.contentHeight = 60;
            this._mainCollapser.isLabelClickable = false;
            this._mainCollapser.element = this.myContent;
            this._mainCollapser.isCollapsed = this.isMainCollapsed;
            this._mainCollapser.isAnimated = true;
            Object.defineBinding(this._mainCollapser, "isToggling", {
   				boundObject: this,
       		    boundObjectPropertyPath: "isMainCollapsed",
       		    oneway: false
   			});
            Object.defineBinding(this._mainCollapser, "bypassAnimation", {
   				boundObject: this,
       		    boundObjectPropertyPath: "animateCollapser",
       		    oneway: false,
               	boundValueMutator: function(value) {
                   	return !value;
                }
   			});
            
            /*
            this._mainCollapser.labelClickEvent = function () {
                that.isMainCollapsed = that._mainCollapser.isCollapsed;
            };
            */
            //this._mainCollapser.needsDraw = true;

            this._positionCollapser = Collapser.create();
            this._positionCollapser.clicker = this.labelPosition;
            this._positionCollapser.myContent = this.contentPosition;
            this._positionCollapser.contentHeight = 40;
            this._positionCollapser.isLabelClickable = true;
            this._positionCollapser.element = this.contentPosition;
            this._positionCollapser.isCollapsed = this.isPositionCollapsed;
            this._positionCollapser.isAnimated = true;
            Object.defineBinding(this._positionCollapser, "isToggling", {
   				boundObject: this,
       		    boundObjectPropertyPath: "isPositionCollapsed",
       		    oneway: false
   			});
            
            
            /*
            this._positionCollapser.labelClickEvent = function () {
                that.isPositionCollapsed = that._positionCollapser.isCollapsed;
            };
            */
            //this._positionCollapser.needsDraw = true;

            this._transformCollapser = Collapser.create();
            this._transformCollapser.clicker = this.labelTransform;
            this._transformCollapser.myContent = this.contentTransform;
            this._transformCollapser.contentHeight = 100;
            this._transformCollapser.isLabelClickable = false;
            this._transformCollapser.element = this.contentTransform;
            this._transformCollapser.isCollapsed = this.isTransformCollapsed;
            this._transformCollapser.isAnimated = true;
            Object.defineBinding(this._transformCollapser, "isToggling", {
   				boundObject: this,
       		    boundObjectPropertyPath: "isTransformCollapsed",
       		    oneway: false
   			});
   			
   			
            /*
            this._transformCollapser.labelClickEvent = function () {
                that.isTransformCollapsed = that._transformCollapser.isCollapsed;
            };
            */
            //this._transformCollapser.needsDraw = true;

            this._styleCollapser = Collapser.create();
            this._styleCollapser.clicker = this.labelStyles;
            this._styleCollapser.myContent = this.contentStyles;
            this._styleCollapser.contentHeight = 0;
            this._styleCollapser.isLabelClickable = false;
            this._styleCollapser.element = this.contentStyles;
            this._styleCollapser.isCollapsed = this.isStyleCollapsed;
            this._styleCollapser.isAnimated = true;
            Object.defineBinding(this._styleCollapser, "isToggling", {
   				boundObject: this,
       		    boundObjectPropertyPath: "isStyleCollapsed",
       		    oneway: false
   			});
   			
   			
            /*
            this._styleCollapser.labelClickEvent = function () {
                that.isStyleCollapsed = that._styleCollapser.isCollapsed;
            };
            */
            //this._styleCollapser.needsDraw = true;

            // Register event handler for layer events.
            //defaultEventManager.addEventListener("layerEvent", this, false);

        }
    },

    handleLayerEvent:{
        value:function (layerEvent) {
            if (layerEvent.layerID !== this.trackID) {
                return;
            }
            if (layerEvent.layerEventType === "labelClick") {
                if (layerEvent.layerEventLocale === "content-main") {
                    this._mainCollapser.bypassAnimation = layerEvent.bypassAnimation;
                    this._mainCollapser.toggle();
                } else if (layerEvent.layerEventLocale === "content-position") {
                    this._positionCollapser.bypassAnimation = layerEvent.bypassAnimation;
                    this._positionCollapser.handleCollapserLabelClick();
                } else if (layerEvent.layerEventLocale === "content-transform") {
                    this._transformCollapser.bypassAnimation = layerEvent.bypassAnimation;
                    this._transformCollapser.handleCollapserLabelClick();
                } else if (layerEvent.layerEventLocale === "content-style") {
                    this._styleCollapser.bypassAnimation = layerEvent.bypassAnimation;
                    this._styleCollapser.handleCollapserLabelClick();
                }
            } else if (layerEvent.layerEventType === "newStyle") {
            	this.arrStyleTracks.push("1");
            	if (this._styleCollapser.isCollapsed === true) {
	                this._styleCollapser.bypassAnimation = layerEvent.bypassAnimation;
	                this._styleCollapser.handleCollapserLabelClick();
            	}
            } else if (layerEvent.layerEventType === "deleteStyle") {
            	this.arrStyleTracks.pop();
            }
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
