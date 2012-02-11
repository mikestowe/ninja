var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

var Tween = exports.Tween = Montage.create(Component, {

    hasTemplate:{
        value: true
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

    _keyframeID:{
        value:0
    },

    keyframeID:{
        serializable:true,
        get:function () {
            return this._keyframeID;
        },
        set:function (value) {
            this._keyframeID = value;
        }
    },

    _timelineTrack:{
        value:0
    },

    timelineTrack:{
        serializable:true,
        get:function () {
            return this._timelineTrack;
        },
        set:function (value) {
            this._timelineTrack = value;
        }
    },

    prepareForDraw:{
        value:function () {
            this.keyframe.containingTrack = this.timelineTrack;
            this.keyframe.position = this.spanWidth;
            this.keyframe.timelinePosition = this.keyFramePosition;
            this.keyframe.id = this.keyframeID;
        }
    },

    draw:{
        value:function () {
            this.span.spanWidth = this.spanWidth;
            this.tweencontainer.style.left = this.spanPosition + "px";
        }
    }
});
