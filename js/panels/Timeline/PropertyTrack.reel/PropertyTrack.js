/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

var PropertyTrack = exports.PropertyTrack = Montage.create(Component, {

    hasTemplate:{
        value: true
    },

    prepareForDraw:{
        value:function(){
            this.element.addEventListener("click", this, false);
            this.trackID = this.parentComponent.parentComponent.parentComponent.trackID;
            this.animatedElement = this.parentComponent.parentComponent.parentComponent.animatedElement;
            this.ninjaStylesContoller = this.application.ninja.stylesController;
        }
    },

    draw:{
        value:function(){

        }
    },

    didDraw:{
        value:function () {
            if ((!this.application.ninja.documentController.creatingNewFile) || (!this.application.ninja.currentDocument.setLevel)) {
                if (this.application.ninja.currentDocument.documentRoot.children[0]) {
                    var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
                    if (selectedIndex !== false) {
                        if (!this.application.ninja.timeline.arrLayers[selectedIndex].layerData.created) {
                            //this.retrieveStoredStyleTweens();
                        }
                    }
                }
            }
        }
    },

    trackEditorProperty:{
        value:""
    },

    _propTweenRepetition:{
        value:null
    },

    animatedElement:{
        value:null
    },

    isSubproperty:{
        value:true
    },

    propTweenRepetition:{
        serializable:true,
        get:function () {
            return this._propTweenRepetition;
        },
        set:function (newVal) {
            this._propTweenRepetition = newVal;
        }
    },

    _propTweens:{
        value:[]
    },

    propTweens:{
        serializable:true,
        get:function () {
            return this._propTweens;
        },
        set:function (newVal) {
            this._propTweens = newVal;
        }
    },

    _propTrackData:{
        value:false
    },

    propTrackData:{
        serializable:true,
        get:function () {
            return this._propTrackData;
        },
        set:function (val) {
            this._propTrackData = val;
            if (this._propTrackData) {
                this.setData();
            }
        }
    },

    nextKeyframe:{
        value:1
    },

    ninjaStylesContoller:{
        value:null
    },

    animationName:{
        value:null
    },

    currentKeyframeRule:{
        value:null
    },

    trackDuration:{
        value:0
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
            }
        }
    },

    _trackType:{
        value:null
    },

    trackType:{
        serializable:true,
        get:function () {
            return this._trackType;
        },
        set:function (value) {
            if (value !== this._trackType) {
                this._trackType = value;
            }
        }
    },

    _styleIndex:{
        value:null
    },

    styleIndex:{
        serializable:true,
        get:function () {
            return this._styleIndex;
        },
        set:function (value) {
            if (value !== this._styleIndex) {
                this._styleIndex = value;
            }
        }
    },

    setData:{
        value:function () {
            if (typeof(this.propTrackData) === "undefined") {
                return;
            }

            this.styleIndex = this.propTrackData.styleIndex;
            this.propTweens = this.propTrackData.propTweens;
            this.trackType = this.propTrackData.trackType;
            this.trackEditorProperty = this.propTrackData.trackEditorProperty;
            this.needsDraw = true;
        }
    },

    handleClick:{
        value:function(ev){
            if (ev.shiftKey) {

                if (this.propTweens.length < 1) {

                    // check if there is an editor property assigned yet
                    // get this property track's editor prop name from layer data arrays
                    var selectIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);

                    if (this.trackType === "style") {
                        if (this.application.ninja.timeline.arrLayers[selectIndex].layerData.arrLayerStyles[this.styleIndex].editorProperty == null) {
                            console.log("Please enter a style property for this track before adding keyframes.");
                            return;
                        } else {
                            this.trackEditorProperty = this.application.ninja.timeline.arrLayers[selectIndex].layerData.arrLayerStyles[this.styleIndex].editorProperty;
                            //console.log("Property track editorProperty set to: " + this.trackEditorProperty);
                        }
                    } else if (this.trackType === "position") {
                        //console.log("Property track editorProperty set to: " + this.trackEditorProperty);
                    }

                    this.insertPropTween(0);
                    this.addPropAnimationRuleToElement(ev);
                    this.updatePropKeyframeRule();
                } else {
                    this.handleNewPropTween(ev);
                    this.updatePropKeyframeRule();
                }
            }
        }
    },

    handleNewPropTween:{
        value:function(ev){
            if (ev.offsetX > this.propTweens[this.propTweens.length - 1].tweenData.keyFramePosition) {
                this.insertPropTween(ev.offsetX);
            } else {
                console.log("spitting sub keyframes not yet supported");
            }
        }
    },

    insertPropTween:{
        value:function(clickPos){
            var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
            this.application.ninja.timeline.selectLayer(selectedIndex, true);

            var currentMillisecPerPixel = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80);
            var currentMillisec = currentMillisecPerPixel * clickPos;
            this.trackDuration = currentMillisec;

            var newTween = {};
            newTween.tweenData = {};

            if (clickPos == 0) {
                newTween.tweenData.spanWidth = 0;
                newTween.tweenData.keyFramePosition = 0;
                newTween.tweenData.keyFrameMillisec = 0;
                newTween.tweenData.tweenID = 0;
                newTween.tweenData.spanPosition = 0;
                newTween.tweenData.tweenedProperties = [];
                newTween.tweenData.tweenedProperties[this.trackEditorProperty] = this.ninjaStylesContoller.getElementStyle(this.animatedElement, this.trackEditorProperty);

                this.propTweens.push(newTween);

            } else {
                newTween.tweenData.spanWidth = clickPos - this.propTweens[this.propTweens.length - 1].tweenData.keyFramePosition;
                newTween.tweenData.keyFramePosition = clickPos;
                newTween.tweenData.keyFrameMillisec = currentMillisec;
                newTween.tweenData.tweenID = this.nextKeyframe;
                newTween.tweenData.spanPosition = clickPos - newTween.tweenData.spanWidth;
                newTween.tweenData.tweenedProperties = [];
                newTween.tweenData.tweenedProperties[this.trackEditorProperty] = this.ninjaStylesContoller.getElementStyle(this.animatedElement, this.trackEditorProperty);
                this.propTweens.push(newTween);

                this.nextKeyframe += 1;
            }

            this.application.ninja.documentController.activeDocument.needsSave = true;
        }
    },

    retrieveStoredStyleTweens:{
        value:function(){
            console.log("retrieve style tweens");
        }
    },

    updatePropKeyframeRule:{
        value:function(){
            // delete the current rule
            this.ninjaStylesContoller.deleteRule(this.currentKeyframeRule);

            // build the new keyframe string
            var keyframeString = "@-webkit-keyframes " + this.animationName + " {";

            for (var i = 0; i < this.propTweens.length; i++) {
                var keyMill = parseInt(this.propTweens[i].tweenData.keyFrameMillisec);
                // TODO - trackDur should be parseFloat rounded to significant digits
                var trackDur = parseInt(this.trackDuration);
                var keyframePercent = Math.round((keyMill / trackDur) * 100) + "%";
                var keyframePropertyString = " " + keyframePercent + " {";
                for(var prop in this.propTweens[i].tweenData.tweenedProperties){
                    keyframePropertyString += prop + ": " + this.propTweens[i].tweenData.tweenedProperties[prop];
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

    addPropAnimationRuleToElement:{
        value:function(tweenEvent){
            var currentStyleValue = this.ninjaStylesContoller.getElementStyle(this.animatedElement, this.trackEditorProperty);
            this.propTweens[0].tweenData.tweenedProperties[this.trackEditorProperty] = currentStyleValue;

            this.animationName = this.animatedElement.classList[0] + "_" + this.trackEditorProperty;
            var currentAnimationNameString = this.parentComponent.parentComponent.parentComponent.animationNamesString;
            var newAnimationNames = currentAnimationNameString + "," + this.animationName;
            //var currentAnimationDuration = this.ninjaStylesContoller.getElementStyle(this.animatedElement, "-webkit-animation-duration");
            //var newAnimationDuration = currentAnimationDuration + "," + currentAnimationDuration;
            //var currentIterationCount = this.ninjaStylesContoller.getElementStyle(this.animatedElement, "-webkit-animation-iteration-count");
            //var newIterationCount = currentIterationCount + ",1";

            this.parentComponent.parentComponent.parentComponent.animationNamesString = newAnimationNames;

            this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-name", newAnimationNames);

            //this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-duration", newAnimationDuration);
            //this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-iteration-count", newIterationCount);
            //this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-fill-mode", "both");
            //this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-transition-timing-function", "linear");

            var initRule = "@-webkit-keyframes " + this.animationName + " { 0% {" + this.trackEditorProperty + ": " + currentStyleValue + ";} 100% {" + this.trackEditorProperty + ": " + currentStyleValue + ";} }";
            //console.log(initRule);
            this.currentKeyframeRule = this.ninjaStylesContoller.addRule(initRule);

            this.insertPropTween(tweenEvent.offsetX);
        }
    }
});
