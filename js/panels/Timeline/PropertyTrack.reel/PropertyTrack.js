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
        }
    },

    draw:{
        value:function(){

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

    _styleSelection:{
        value:null
    },

    styleSelection:{
        serializable:true,
        get:function () {
            return this._styleSelection;
        },
        set:function (value) {
            if (value !== this._styleSelection) {
                this._styleSelection = value;
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
            this.styleSelection = this.propTrackData.styleSelection;
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
                    console.log(this.application.ninja.timeline.arrLayers[selectIndex].layerData.arrLayerStyles[this.styleIndex].editorProperty);

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
            this.insertPropTween(ev.offsetX);
        }
    },

    insertPropTween:{
        value:function(clickPos){
            var selectedIndex = this.application.ninja.timeline.getLayerIndexByID(this.trackID);
            this.application.ninja.timeline.selectLayer(selectedIndex, true);

            var currentMillisecPerPixel = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80);
            var currentMillisec = currentMillisecPerPixel * clickPos;

            var newTween = {};
            newTween.tweenData = {};

            if (clickPos == 0) {
                newTween.tweenData.spanWidth = 0;
                newTween.tweenData.keyFramePosition = 0;
                newTween.tweenData.keyFrameMillisec = 0;
                newTween.tweenData.tweenID = 0;
                newTween.tweenData.spanPosition = 0;
                newTween.tweenData.tweenedProperties = [];

                this.propTweens.push(newTween);

            } else {
                newTween.tweenData.spanWidth = clickPos - this.propTweens[this.propTweens.length - 1].tweenData.keyFramePosition;
                newTween.tweenData.keyFramePosition = clickPos;
                newTween.tweenData.keyFrameMillisec = currentMillisec;
                newTween.tweenData.tweenID = this.nextKeyframe;
                newTween.tweenData.spanPosition = clickPos - newTween.tweenData.spanWidth;
                newTween.tweenData.tweenedProperties = [];

                this.propTweens.push(newTween);

                this.nextKeyframe += 1;
            }

            this.application.ninja.documentController.activeDocument.needsSave = true;
        }
    },

    updatePropKeyframeRule:{
        value:function(){

        }
    },

    addPropAnimationRuleToElement:{
        value:function(tweenEvent){
            this.insertPropTween(tweenEvent.offsetX);
        }
    }
});
