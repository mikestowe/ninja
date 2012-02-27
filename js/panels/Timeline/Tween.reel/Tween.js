/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

var Tween = exports.Tween = Montage.create(Component, {

    hasTemplate:{
        value: true
    },

    _spanWidth: {
        serializable: true,
        value: 0
    },

    spanWidth: {
        serializable:true,
        get: function(){
            return this._spanWidth;
        },
        set: function(value){
            this._spanWidth = value;
            this.needsDraw = true;
        }
    },

    _spanPosition:{
        value: 0
    },

    spanPosition:{
        serializable:true,
        get:function () {
            return this._spanPosition;
        },
        set:function (value) {
            this._spanPosition = value;
            this.needsDraw = true;
        }
    },

    _keyFramePosition:{
        value:0
    },

    keyFramePosition:{
        serializable:true,
        get:function () {
            return this._keyFramePosition;
        },
        set:function (value) {
            this._keyFramePosition = value;
            this.needsDraw = true;
        }
    },

    _keyFrameMillisec:{
        value:0
    },

    keyFrameMillisec:{
        serializable:true,
        get:function () {
            return this._keyFrameMillisec;
        },
        set:function (value) {
            this._keyFrameMillisec = value;
        }
    },

    _tweenID:{
        value:0
    },

    tweenID:{
        serializable:true,
        get:function () {
            return this._tweenID;
        },
        set:function (value) {
            this._tweenID = value;
        }
    },

    _tweenedProperties:{
        serializable: true,
        value:[]
    },

    tweenedProperties:{
        serializable:true,
        get:function(){
            return this._tweenedProperties;
        },
        set:function(val){
            this._tweenedProperties = val;
        }
    },

    _isTweenAnimated:{
        serializable:true,
        value:false
    },

    isTweenAnimated:{
        serializable:true,
        get:function () {
            return this._isTweenAnimated;
        },
        set:function (value) {
            this._isTweenAnimated = value;
            this.needsDraw = true;
        }
    },

    prepareForDraw:{
        value:function () {

        }
    },

    draw:{
        value:function () {
            this.element.style.left = this.spanPosition + "px";
            this.keyframe.position = this.spanWidth;
            this.tweenspan.spanWidth = this.spanWidth;
            if(this.isTweenAnimated){
                this.tweenspan.highlightSpan();
            }
        }
    },

    handleElementChange:{
        value:function (event) {
            if (event.detail.source && event.detail.source !== "tween") {
                // check for correct element selection
                if (this.application.ninja.selectedElements[0]._element != this.parentComponent.parentComponent.animatedElement) {
                    alert("Wrong element selected for this keyframe track");
                } else {
                    // update tweenedProperties and tell containing track to update CSS rule
                    // temp read only top and left.  need to change to loop over event details for prop changes generically
                    if (this.parentComponent.parentComponent.animatedElement.offsetTop != this.tweenedProperties["top"] && this.parentComponent.parentComponent.animatedElement.offsetLeft != this.tweenedProperties["left"]) {
                        this.tweenedProperties["top"] = this.parentComponent.parentComponent.animatedElement.offsetTop;
                        this.tweenedProperties["left"] = this.parentComponent.parentComponent.animatedElement.offsetLeft;
                        this.parentComponent.parentComponent.updateKeyframeRule();
                    }
                    // highlight the tween's span
                    this.tweenspan.highlightSpan();
                    this.isTweenAnimated = true;
                }
            }
        }
    },

    selectTween:{
        value: function(){
            // turn on event listener for element change
            this.eventManager.addEventListener("elementChange", this, false);

            // select the containing layer
            var selectIndex = this.application.ninja.timeline.getLayerIndexByID(this.parentComponent.parentComponent.trackID);
            this.application.ninja.timeline.selectLayer(selectIndex);

            // tell timeline to deselect all other tweens and push this one as the currentSelectedTweens in timeline
            this.application.ninja.timeline.deselectTweens();
            this.application.ninja.timeline.selectedTweens.push(this);

            // update playhead position and time text
            this.application.ninja.timeline.playhead.style.left = (this.keyFramePosition - 2) + "px";
            this.application.ninja.timeline.playheadmarker.style.left = this.keyFramePosition + "px";
            var currentMillisecPerPixel = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80);
            var currentMillisec = currentMillisecPerPixel * this.keyFramePosition;
            this.application.ninja.timeline.updateTimeText(currentMillisec);

            // move animated element to correct position on stage
            var currentTop = this.tweenedProperties["top"] + "px";
            var currentLeft = this.tweenedProperties["left"] + "px";
            ElementsMediator.setProperty([this.parentComponent.parentComponent.animatedElement], "top", [currentTop], "Change", "tween");
            ElementsMediator.setProperty([this.parentComponent.parentComponent.animatedElement], "left", [currentLeft], "Change", "tween");

        }
    },

    deselectTween:{
        value:function(){
            // turn off event listener for element change
            this.eventManager.removeEventListener("elementChange", this, false);

            // deselect the keyframe for this tween
            this.keyframe.deselectKeyframe();
        }
    }
});
