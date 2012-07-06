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
var ElementsMediator = require("js/mediators/element-mediator").ElementMediator;


var Tween = exports.Tween = Montage.create(Component, {

    keyframe: {
        value: null,
        serializable: true
    },

    tweenspan: {
        value: null,
        serializable: true
    },

    _tweenData:{
        value:{}
    },

    tweenData:{
        get:function(){
            return this._tweenData;
        },
        set:function(val){
            this._tweenData = val;
            if(this._tweenData){
                this.setData();
            }
        }
    },

    _spanWidth: {
        value: 0
    },

    spanWidth: {
        serializable:true,
        get: function(){
            return this._spanWidth;
        },
        set: function(value){
            this._spanWidth = value;
            this.tweenData.spanWidth = value;
            this.needsDraw=true;
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
            this.tweenData.spanPosition = value;
            this.needsDraw=true;
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
            this.tweenData.keyFramePosition = value;
            this.needsDraw=true;
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
            this.tweenData.tweenID = value;
        }
    },

    _tweenedProperties:{
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
        value:false
    },

    isTweenAnimated:{
        serializable:true,
        get:function () {
            return this._isTweenAnimated;
        },
        set:function (value) {
            this._isTweenAnimated = value;
        }
    },

    _isDragging: {
        value: false
    },
    isDragging: {
        serializable: true,
        get:function () {
            return this._isDragging;
        },
        set:function (newVal) {
            this._isDragging = newVal;
        }

    },

    _easing: {
        value: "none"
    },
    easing: {
        serializable: true,
        get:function () {
            return this._easing;
        },
        set:function (newVal) {
            this._easing = newVal;
        }

    },

    draw:{
        value:function () {
            this.tweenspan.element.style.width = this.spanWidth + "px";
            this.keyframe.element.style.left = (this.spanWidth -5) + "px";
            this.tweenspan.spanWidth = this.spanWidth;
            this.element.style.left = this.spanPosition + "px";
            this.keyframe.position = this.spanWidth;
            this.tweenspan.easing = this.easing;
            if(this.isTweenAnimated){
                this.tweenspan.highlightSpan();
            }
        }
    },

    setData:{
        value:function(){
            this.spanWidth = this.tweenData.spanWidth;
            this.keyFramePosition = this.tweenData.keyFramePosition;
            this.spanPosition = this.tweenData.spanPosition;
            this.keyFrameMillisec = this.tweenData.keyFrameMillisec;
            this.tweenID = this.tweenData.tweenID;
            this.tweenedProperties = this.tweenData.tweenedProperties;
            this.isTweenAnimated = this.tweenData.isTweenAnimated;
            this.easing = this.tweenData.easing;
            this.needsDraw = true;
        }
    },

    handleElementChange:{
        value:function (event) {
            // temp - testing var
            var useAbsolute = true;

            if(event.detail.type === "cssChange"){
                event.detail.source="cssPanelChange"
            }

            if (event.detail.source && event.detail.source !== "tween") {

                if(this.parentComponent.parentComponent.isSubproperty){
                    this.setStyleTweenProperty(event.detail);
                } else {
                    // check for correct element selection
                    if (this.application.ninja.selectedElements[0] != this.parentComponent.parentComponent.animatedElement) {
                        console.log("Wrong element selected for this keyframe track");
                    } else {
                        this.setTweenProperties(event.detail);
                    }
                }
            }
        }
    },

    setTweenProperties:{
        value:function (eventDetail) {

            if (eventDetail.source === "SelectionTool" || eventDetail.source === "timeline" || eventDetail.source === "pi" || eventDetail.source === "cssPanelChange") {
                if(this.parentComponent.parentComponent.animatedElement.offsetTop != this.tweenedProperties["top"]){
                    this.tweenedProperties["top"] = this.parentComponent.parentComponent.animatedElement.offsetTop + "px";
                }
                if(this.parentComponent.parentComponent.animatedElement.offsetLeft != this.tweenedProperties["left"]){
                    this.tweenedProperties["left"] = this.parentComponent.parentComponent.animatedElement.offsetLeft + "px";
                }
                if (this.parentComponent.parentComponent.animatedElement.offsetWidth != this.tweenedProperties["width"]){
                    this.tweenedProperties["width"] = this.parentComponent.parentComponent.animatedElement.offsetWidth + "px";
                }
                if (this.parentComponent.parentComponent.animatedElement.offsetHeight != this.tweenedProperties["height"]){
                    this.tweenedProperties["height"] = this.parentComponent.parentComponent.animatedElement.offsetHeight + "px";
                }
                // tell track to update css rule
                this.parentComponent.parentComponent.updateKeyframeRule();
                this.isTweenAnimated = true;
            }

            if (eventDetail.source === "translateTool") {
                var arrMat = eventDetail.data.value[0].properties.mat,
                    strTweenProperty = "perspective(1400) matrix3d(" + arrMat.join() + ")";

                this.tweenedProperties["-webkit-transform"] = strTweenProperty;
                this.parentComponent.parentComponent.updateKeyframeRule();
                this.isTweenAnimated = true;
            }
        }
    },

    setStyleTweenProperty:{
        value:function (eventDetail) {
            //console.log("Setting style tween properties for: " + this.parentComponent.parentComponent.trackEditorProperty);
            //console.log(eventDetail);
            if(eventDetail.type == "setProperties"){
                // need to ignore top, left, width, and height
                //console.log(eventDetail.data.value[0]);
                this.tweenedProperties[this.parentComponent.parentComponent.trackEditorProperty] = eventDetail.data.value[0];
                this.parentComponent.parentComponent.updatePropKeyframeRule();

            } else if(eventDetail.type == "setColor"){
                var prop = this.parentComponent.parentComponent.trackEditorProperty;
                this.tweenedProperties[prop] = eventDetail.data.value.color.css;
                this.parentComponent.parentComponent.updatePropKeyframeRule();

            } else if(eventDetail.type == "setProperty"){
                // need to ignore top, left, width, and height
                //console.log(eventDetail.data.value[0]);
                this.tweenedProperties[this.parentComponent.parentComponent.trackEditorProperty] = eventDetail.data.value[0];
                this.parentComponent.parentComponent.updatePropKeyframeRule();

            }else {
                console.log("TWEEN Unhandled type - setStyleTweenProperty : " + eventDetail.type);
            }
        }
    },

    setKeyframeEase:{
        value:function(easeType){
            // easeTypes - ease, ease-out, ease-in, ease-in-out, linear, cubic-bezier(x1, y1, x2, y2)
            this.tweenedProperties["-webkit-animation-timing-function"] = easeType;
            if(this.parentComponent.parentComponent.isSubproperty){
                if(this.parentComponent.parentComponent.trackType == "position"){
                    return;
                }
                this.parentComponent.parentComponent.updatePropKeyframeRule();
            } else {
                this.parentComponent.parentComponent.updateKeyframeRule();
            }
        }
    },

    selectTween:{
        value: function(){
            // turn on event listener for element change
            this.eventManager.addEventListener("elementChange", this, false);

            // select the containing layer
            var selectIndex = this.application.ninja.timeline.getLayerIndexByID(this.parentComponent.parentComponent.trackID);
            this.application.ninja.timeline.selectLayer(selectIndex, true);

            // tell timeline to deselect all other tweens and push this one into the selectedTweens in timeline
            this.application.ninja.timeline.deselectTweens();
            this.application.ninja.timeline.selectedTweens.push(this);

            // update playhead position and time text
            this.application.ninja.timeline.playhead.style.left = (this.keyFramePosition - 2) + "px";
            this.application.ninja.timeline.playheadmarker.style.left = this.keyFramePosition + "px";
            var currentMillisecPerPixel = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80);
            var currentMillisec = currentMillisecPerPixel * this.keyFramePosition;
            this.application.ninja.timeline.updateTimeText(currentMillisec);

            if(this.parentComponent.parentComponent.isSubproperty){
                // set property specific style on element
                var currentValue = this.tweenedProperties[this.parentComponent.parentComponent.trackEditorProperty];
                var el = this.parentComponent.parentComponent.animatedElement;
                var prop = this.parentComponent.parentComponent.trackEditorProperty;
                this.application.ninja.elementMediator.setProperty([el], prop, [currentValue], "Change", "tween");
            } else {
                // move animated element to correct position on stage
                var currentTop = this.tweenedProperties["top"];
                var currentLeft = this.tweenedProperties["left"];
                var currentWidth = this.tweenedProperties["width"];
                var currentHeight = this.tweenedProperties["height"];

                this.application.ninja.elementMediator.setProperty([this.parentComponent.parentComponent.animatedElement], "top", [currentTop], "Change", "tween");
                this.application.ninja.elementMediator.setProperty([this.parentComponent.parentComponent.animatedElement], "left", [currentLeft], "Change", "tween");
                this.application.ninja.elementMediator.setProperty([this.parentComponent.parentComponent.animatedElement], "width", [currentWidth], "Change", "tween");
                this.application.ninja.elementMediator.setProperty([this.parentComponent.parentComponent.animatedElement], "height", [currentHeight], "Change", "tween");
            }
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
