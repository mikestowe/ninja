/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
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

var PropertyTrack = exports.PropertyTrack = Montage.create(Component, {

    hasTemplate:{
        value: true
    },

    prepareForDraw:{
        value:function(){
            this.element.addEventListener("click", this, false);
            this.trackID = this.parentComponent.parentComponent.parentComponent.parentComponent.trackID;
            this.animatedElement = this.parentComponent.parentComponent.parentComponent.parentComponent.animatedElement;
            this.ninjaStylesContoller = this.application.ninja.stylesController;
        }
    },

    draw:{
        value:function(){

        }
    },

    didDraw:{
        value:function () {
            if(this.currentKeyframeRule){
                this.retrieveStoredStyleTweens();
            }
        }
    },

    trackEditorProperty:{
        value:""
    },

    animatedElement:{
        value:null
    },

    isSubproperty:{
        value:true
    },

    _propTweenRepetition:{
        value:null
    },

    propTweenRepetition:{
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
            this.currentKeyframeRule = this.propTrackData.existingRule;
            this.needsDraw = true;
        }
    },

    handleClick:{
        value:function (ev) {
            if (ev.shiftKey) {

                if (this.trackType == "position") {
                    this.parentComponent.parentComponent.parentComponent.parentComponent.handleNewTween(ev);
                }

                if (this.propTweens.length < 1) {

                    // check if there is an editor property assigned yet
                    // get this property track's editor prop name from layer data arrays
                    var selectIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID),
                        currentSelectedStyleIndex = this.getCurrentSelectedStyleIndex(selectIndex);

                    if (this.trackType == "style") {
                        //console.log("PropertyTrack.handleClick; selectIndex = ", selectIndex, "; styleIndex = ", currentSelectedStyleIndex)
                        if (this.application.ninja.timeline.arrLayers[selectIndex].layerData.arrLayerStyles[currentSelectedStyleIndex].editorProperty == null) {
                            console.log("Please enter a style property for this track before adding keyframes.");
                            return;
                        } else {
                            this.trackEditorProperty = this.application.ninja.timeline.arrLayers[selectIndex].layerData.arrLayerStyles[currentSelectedStyleIndex].editorProperty;
                            //console.log("Property track editorProperty set to: " + this.trackEditorProperty);
                        }
                        this.insertPropTween(0);
                        this.addPropAnimationRuleToElement(ev);
                        this.updatePropKeyframeRule();
                    } else if (this.trackType == "position") {
                        //console.log("Property track editorProperty set to: " + this.trackEditorProperty);
                    }
                } else {
                    this.handleNewPropTween(ev);
                    if (this.trackType == "style") {
                        this.updatePropKeyframeRule();
                    }
                }
            }
        }
    },

    getCurrentSelectedStyleIndex: {
        value: function(layerIndex) {
            var returnVal = false,
                i = 0,
                arrLayerStylesLength = this.application.ninja.timeline.arrLayers[layerIndex].layerData.arrLayerStyles.length;
            for (i = 0; i < arrLayerStylesLength; i++) {
                var currItem =  this.application.ninja.timeline.arrLayers[layerIndex].layerData.arrLayerStyles[i];
                if (currItem.isSelected === true) {
                    returnVal = i;
                }
            }
            return returnVal;
        }
    },

    handleNewPropTween:{
        value:function (ev) {
            if (ev.offsetX > this.propTweens[this.propTweens.length - 1].tweenData.keyFramePosition) {
                this.insertPropTween(ev.offsetX);
            } else {
                // We will be splitting a tween.  Get the x-coordinate of the mouse click within the target element.
                // You'd think you could use the event.x info for that, right? NO. We must use page values, calculating offsets and scrolling.

                // Here's an easy function that adds up offsets and scrolls and returns the page x value of an element
                var findXOffset = function (obj) {
                    var curleft = 0;
                    if (obj.offsetParent) {
                        do {
                            curleft += (obj.offsetLeft - obj.scrollLeft);

                        } while (obj = obj.offsetParent);
                    }
                    return curleft;
                }
                var targetElementOffset = findXOffset(ev.currentTarget),
                    position = event.pageX - targetElementOffset;

                this.splitPropTweenAt(position - 18);
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
            newTween.tweenData.tweenedProperties = [];

            // TODO - check for color values vs px values and set the correct default
            var propVal = this.ninjaStylesContoller.getElementStyle(this.animatedElement, this.trackEditorProperty);
            if(propVal == null){
                propVal = "1px";
            }
            newTween.tweenData.tweenedProperties[this.trackEditorProperty] = propVal;

            if (clickPos == 0) {
                newTween.tweenData.spanWidth = 0;
                newTween.tweenData.keyFramePosition = 0;
                newTween.tweenData.keyFrameMillisec = 0;
                newTween.tweenData.tweenID = 0;
                newTween.tweenData.spanPosition = 0;

                this.propTweens.push(newTween);

            } else {
                newTween.tweenData.spanWidth = clickPos - this.propTweens[this.propTweens.length - 1].tweenData.keyFramePosition;
                newTween.tweenData.keyFramePosition = clickPos;
                newTween.tweenData.keyFrameMillisec = currentMillisec;
                newTween.tweenData.tweenID = this.nextKeyframe;
                newTween.tweenData.spanPosition = clickPos - newTween.tweenData.spanWidth;

                this.propTweens.push(newTween);

                this.nextKeyframe += 1;
            }

            this.application.ninja.currentDocument.model.needsSave = true;
        }
    },

    splitPropTweenAt:{
        value:function (position) {
            var i, j, nextComponentIndex,
                tweensLength = this.propTweens.length - 1,
                prevTween,
                nextTween,
                splitTweenIndex;

            // Search through the tweens and find the pair whose keyframes bracket position.
            for (i = 0; i < tweensLength; i++) {
                prevTween = this.propTweens[i].tweenData.keyFramePosition;
                nextTween = this.propTweens[i + 1].tweenData.keyFramePosition;
                if (position > prevTween && position < nextTween) {

                    // We will insert a new tween at this index
                    splitTweenIndex = i + 1;

                    // Update the next tween to have new span position and width.
                    this.propTweens[i + 1].tweenData.spanPosition = position;
                    this.propTweens[i + 1].spanPosition = position;
                    this.propTweens[i + 1].tweenData.spanWidth = this.propTweens[i + 1].tweenData.keyFramePosition - position;
                    this.propTweens[i + 1].spanWidth = this.propTweens[i + 1].keyFramePosition - position;

                    // You'd think that would be enough to make the component associated with that part of the array redraw, wouldn't you?
                    // Turns out we have to manually poke the desired childComponent in the repetition to register its new changes.
                    // So we have to get the index of the actual componentin the repetition, which may not match our iteration index.
                    for (j = 0; j < tweensLength + 1; j++) {
                        if (this.propTweenRepetition.childComponents[j].keyFramePosition === nextTween) {
                            nextComponentIndex = j;
                        }
                    }
                    this.propTweenRepetition.childComponents[nextComponentIndex].setData();

                    // Create the new tween and splice it into the model
                    var newTweenToInsert = {};
                    newTweenToInsert.tweenData = {};
                    newTweenToInsert.tweenData.spanWidth = position - prevTween;
                    newTweenToInsert.tweenData.keyFramePosition = position;
                    newTweenToInsert.tweenData.keyFrameMillisec = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80) * position;
                    newTweenToInsert.tweenData.tweenID = this.propTweens.length;
                    newTweenToInsert.tweenData.spanPosition = position - newTweenToInsert.tweenData.spanWidth;
                    newTweenToInsert.tweenData.tweenedProperties = [];
                    newTweenToInsert.tweenData.tweenedProperties[this.trackEditorProperty] = this.ninjaStylesContoller.getElementStyle(this.animatedElement, this.trackEditorProperty);
                    this.propTweens.splice(splitTweenIndex, 0, newTweenToInsert);

                    // We are done, so end the loop.
                    i = tweensLength;
                }
            }

            // We've made a change, so set the needsSave flag
            this.application.ninja.currentDocument.model.needsSave = true;

            // Our tween IDs are now all messed up.  Fix them.
            for (i = 0; i <= tweensLength + 1; i++) {
                this.propTweens[i].tweenID = i;
                this.propTweens[i].tweenData.tweenID = i;
            }
        }
    },

    retrieveStoredStyleTweens:{
        value:function(){
            var percentValue, fraction, splitValue;
            var currentMilliSec, currentMilliSecPerPixel, clickPosition, tempTiming, tempTimingFloat, trackTiming, i = 0;

            if (this.animatedElement !== undefined) {
                this.animationName = this.currentKeyframeRule.name;
                if (this.animationName) {

                    trackTiming = this.application.ninja.stylesController.getElementStyle(this.animatedElement, "-webkit-animation-duration");
                    this.nextKeyframe = 0;

                    for (i = 0; this.currentKeyframeRule[i]; i++) {
                        var newTween = {};
                        newTween.tweenData = {};

                        var j, styleLength = this.currentKeyframeRule[i].style.length, keyframeStyles = [];

                        for (j = 0; j < styleLength; j++) {

                            // check for vendor prefixes and skip them for now
                            var firstChar = this.currentKeyframeRule[i].style[j].charAt(0);
                            if (firstChar === "-") {
                                break;
                            } else {
                                var currProp = this.currentKeyframeRule[i].style[j];
                                var propVal = this.currentKeyframeRule[i].style[currProp];
                                keyframeStyles.push([currProp, propVal]);
                            }
                        }

                        // recreate tween properties array for timeline tween
                        newTween.tweenData.tweenedProperties = [];
                        for (var k in keyframeStyles) {
                            newTween.tweenData.tweenedProperties[keyframeStyles[k][0]] = keyframeStyles[k][1];
                        }

                        if (this.currentKeyframeRule[i].keyText === "0%") {
                            newTween.tweenData.spanWidth = 0;
                            newTween.tweenData.keyFramePosition = 0;
                            newTween.tweenData.keyFrameMillisec = 0;
                            newTween.tweenData.tweenID = 0;
                            newTween.tweenData.spanPosition = 0;
                            this.propTweens.push(newTween);
                        }
                        else {
                            tempTiming = trackTiming.split("s");
                            tempTimingFloat = parseFloat(tempTiming[0]);
                            this.trackDuration = tempTimingFloat * 1000;
                            percentValue = this.currentKeyframeRule[i].keyText;
                            splitValue = percentValue.split("%");
                            fraction = splitValue[0] / 100;
                            currentMilliSec = fraction * this.trackDuration;
                            currentMilliSecPerPixel = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80);
                            clickPosition = currentMilliSec / currentMilliSecPerPixel;
                            newTween.tweenData.spanWidth = clickPosition - this.propTweens[this.propTweens.length - 1].tweenData.keyFramePosition;
                            newTween.tweenData.keyFramePosition = clickPosition;
                            newTween.tweenData.keyFrameMillisec = currentMilliSec;
                            newTween.tweenData.tweenID = this.nextKeyframe;
                            newTween.tweenData.spanPosition = clickPosition - newTween.tweenData.spanWidth;
                            this.propTweens.push(newTween);
                        }
                        this.nextKeyframe += 1;
                    }
                }
            }
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
                // trackDur should be parseFloat rounded to significant digits
                var trackDur = parseInt(this.trackDuration);
                var keyframePercent = Math.round((keyMill / trackDur) * 100) + "%";
                var keyframePropertyString = " " + keyframePercent + " {";
                for(var prop in this.propTweens[i].tweenData.tweenedProperties){
                    keyframePropertyString += prop + ": " + this.propTweens[i].tweenData.tweenedProperties[prop] + ";";
                }
                keyframePropertyString += "}";
                keyframeString += keyframePropertyString;
            }
            keyframeString += " }";
            // set the keyframe string as the new rule
            this.currentKeyframeRule = this.ninjaStylesContoller.addRule(keyframeString);
            this.application.ninja.currentDocument.model.needsSave = true;
        }
    },

    addPropAnimationRuleToElement:{
        value:function(tweenEvent){
            var currentStyleValue = this.ninjaStylesContoller.getElementStyle(this.animatedElement, this.trackEditorProperty);
            if (currentStyleValue == null) {
                currentStyleValue = "1px";
            }

            this.propTweens[0].tweenData.tweenedProperties[this.trackEditorProperty] = currentStyleValue;

            this.animationName = this.animatedElement.classList[0] + "_" + this.trackEditorProperty;
            var currentAnimationNameString = this.parentComponent.parentComponent.parentComponent.parentComponent.animationNamesString;
            var newAnimationNames = "";
            if(currentAnimationNameString.length == 0){
                newAnimationNames = this.animationName;
            } else {
                newAnimationNames = currentAnimationNameString + "," + this.animationName;
            }
            var currentAnimationDuration = this.ninjaStylesContoller.getElementStyle(this.animatedElement, "-webkit-animation-duration");
            var newAnimationDuration = currentAnimationDuration + "," + currentAnimationDuration;
            var currentIterationCount = this.ninjaStylesContoller.getElementStyle(this.animatedElement, "-webkit-animation-iteration-count");
            var newIterationCount = currentIterationCount + ",1";

            this.parentComponent.parentComponent.parentComponent.parentComponent.animationNamesString = newAnimationNames;

            this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-name", newAnimationNames);
            this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-duration", newAnimationDuration);
            this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-fill-mode", "forwards");
            this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-iteration-count", newIterationCount);

            var initRule = "@-webkit-keyframes " + this.animationName + " { 0% {" + this.trackEditorProperty + ": " + currentStyleValue + ";} 100% {" + this.trackEditorProperty + ": " + currentStyleValue + ";} }";
            this.currentKeyframeRule = this.ninjaStylesContoller.addRule(initRule);
            this.insertPropTween(tweenEvent.offsetX);
        }
    }
});
