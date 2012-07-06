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
var defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;

var Track = exports.Track = Montage.create(Component, {

    track_lane: {
        value: null,
        serializable: true
    },

    _trackID:{
        value:null
    },

    trackID:{
        get:function(){
            return this._trackID;
        },
        set:function(value){
            this._trackID = value;
        }
    },

    _spans:{
        value:[]
    },

    spans:{
        serializable:true,
        get:function () {
            return this._spans;
        },
        set:function (newVal) {
            this._spans = newVal;
        }
    },

    _spanRepetition:{
        value:null
    },

    spanRepetition:{
        get:function () {
            return this._spanRepetition;
        },
        set:function (newVal) {
            this._spanRepetition = newVal;
        }
    },

    trackDuration:{
        value:0
    },

    currentKeyframe:{
        value:0
    },

    currentMillisecClicked:{
        value: 0
    },

    isAnimated:{
        value:false
    },

    animatedElement:{
        value:null
    },

    ninjaStylesContoller:{
        value: null
    },

    //TEMP
    keyFrames:{
        serializable: true,
        value:[]
    },

    prepareForDraw: {
        value: function() {
            this.keyFrames = new Array();
            this.spans = new Array();
            this.track_lane.addEventListener("click", this, false);
            this.addNewEndPoint(0);

            this.ninjaStylesContoller = this.application.ninja.stylesController;
        }
    },

    handleNewTween:{
        value: function(event){
            var newTween = Tween.create();
        }
    },

    handleClick:{
        value:function (ev) {
            var currentMillisecPerPixel = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80);
            this.currentMillisecClicked = currentMillisecPerPixel * (ev.offsetX + parseInt(ev.target.style.left));

            // TEMP - if the SHIFT key is down, add a new keyframe or split an existing span
            // This needs to move to a keyboard shortcut that is TBD
            if (ev.shiftKey) {
                var prevFrame = this.keyFrames[this.keyFrames.length - 1][0];
                if (ev.offsetX > prevFrame) {
                    this.addNewEndPoint(ev.offsetX);
                    this.currentMillisecClicked = currentMillisecPerPixel * ev.offsetX;
                } else {
                    this.currentMillisecClicked = currentMillisecPerPixel * (ev.offsetX + parseInt(ev.target.style.left));
                    this.splitSpan(ev);
                }
            }

            console.log("currentMillisecClicked = " + this.currentMillisecClicked);
        }
    },

    addNewEndPoint : {
        value: function(xpos){
            var newKeyFrame = document.createElement("div");
            newKeyFrame.className = "keyframe";
            newKeyFrame.style.left = (xpos - 2) + "px";
            this.track_lane.appendChild(newKeyFrame);

            if(xpos > 0){
                var prevFrame = this.keyFrames[this.keyFrames.length - 1][0];

                var newDefaultSpan = document.createElement("div");
                newDefaultSpan.className = "defaultSpan";
                newDefaultSpan.style.left = prevFrame + "px";
                newDefaultSpan.style.width = (xpos - prevFrame) + "px";
                this.track_lane.appendChild(newDefaultSpan);

                this.spans.push(newDefaultSpan);
            }

            var keyframePercent = this.currentMillisecClicked / this.application.ninja.timeline.totalDuration;
            var keyframeProperties;

            //console.log(keyframePercent);

            this.keyFrames.push([xpos, keyframePercent, keyframeProperties]);
            //console.log(this.keyFrames)
        }
    },

    splitSpan: {
        value: function(ev){
            console.log("splitting span at span offsetX: " + ev.offsetX);

            //this.track_lane.removeChild(ev.target);
        }
    },

    updateKeyframePercents:{
        value:function(){

        }
    },

    addAnimationRuleToElement:{
        value: function(){

        }
    },

    calculateKeyframePercent:{
        value:function() {

        }
    },

    buildKeyframesString:{
        value:function(){

        }
    }
});
