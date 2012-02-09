var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var Collapser = require("js/panels/Timeline/Collapser").Collapser;
var defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;

var TimelineTrack = exports.TimelineTrack = Montage.create(Component, {

    hasTemplate:{
        value:true
    },

    _trackID:{
        value:null,
        writable:true,
        serializable:true,
        enumerable:true
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
        value:""
    },
    isMainCollapsed:{
        get:function () {
            return this._isMainCollapsed;
        },
        set:function (newVal) {
            if (newVal !== this._isMainCollapsed) {
                this._isMainCollapsed = newVal;
                this.needsDraw = true;
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

    _tweens:{
        serializable:true,
        enumerable:true,
        value:[]
    },

    tweens:{
        serializable:true,
        enumerable:true,
        get:function () {
            return this._spans;
        },
        set:function (newVal) {
            this._spans = newVal;
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

    trackDuration:{
        value:0
    },

    currentKeyframeRule:{
        value:null
    },

    nextKeyframe:{
        value:1
    },

    currentMillisecClicked:{
        value:0
    },

    isAnimated:{
        value:false
    },

    animatedElement:{
        value:null
    },

    animationName:{
        value:null
    },

    keyFramePropertyData:{
        value:[]
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
            this.track_lane.addEventListener("click", this, false);
            this.keyFramePropertyData = new Array();
        }
    },

    draw:{
        value:function () {
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

    handleClick:{
        value:function (ev) {
            // TEMP - if the SHIFT key is down, add a new keyframe or split an existing span
            // This needs to move to a keyboard shortcut that is TBD
            if (ev.shiftKey) {
                if (this.application.ninja.timeline.arrLayers[this.trackID - 1].element.length == 1) {
                    if (this.tweens.length < 1) {
                        this.insertTween(0);
                        this.addAnimationRuleToElement(ev);
                    } else {
                        this.handleNewTween(ev);
                    }
                } else {
                    alert("There must be exactly one element in an animated layer.")
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

            // calculate new tween's keyframe percent by clickPos
            var currentMillisecPerPixel = Math.floor(this.application.ninja.timeline.millisecondsOffset / 80);
            var currentMillisec = currentMillisecPerPixel * clickPos;

            // need to check timeline master duration if greater than this track duration
            this.trackDuration = currentMillisec;

            var newTween = {};
            if (clickPos == 0) {
                newTween.spanWidth = 0;
                newTween.keyFramePosition = 0;
                newTween.keyFrameMillisec = 0;
                newTween.keyframeID = 0;
                newTween.spanPosition = 0;
                newTween.timelineTrack = this;
                this.tweens.push(newTween);
            } else {
                newTween.spanWidth = clickPos - this.tweens[this.tweens.length - 1].keyFramePosition;
                newTween.keyFramePosition = clickPos;
                newTween.keyFrameMillisec = currentMillisec;
                newTween.keyframeID = this.nextKeyframe;
                newTween.spanPosition = clickPos - newTween.spanWidth;
                newTween.timelineTrack = this;
                this.tweens.push(newTween);

                var animatedProperties = new Array();
                animatedProperties["top"] = this.keyFramePropertyData[0]["top"];
                animatedProperties["left"] = this.keyFramePropertyData[0]["left"];
                this.keyFramePropertyData[this.nextKeyframe] = animatedProperties;

                // update the animation duration
                var animationDuration = Math.round(this.trackDuration / 1000) + "s";
                this.ninjaStylesContoller.setElementStyle(this.animatedElement, "-webkit-animation-duration", animationDuration);

                this.nextKeyframe += 1;
            }
        }
    },

    splitTween:{
        value:function (ev) {
            alert("Splitting an existing span with a new keyframe is not yet supported.")
            //console.log("splitting tween at span offsetX: " + ev.offsetX);
        }
    },

    addAnimationRuleToElement:{
        value:function (tweenEvent) {
            var theElement = this.application.ninja.timeline.arrLayers[this.trackID - 1].element[0];
            this.animatedElement = theElement;

            var initAnimatedProperties = new Array();
            initAnimatedProperties["top"] = theElement.offsetTop;
            initAnimatedProperties["left"] = theElement.offsetLeft;
            this.keyFramePropertyData[0] = initAnimatedProperties;

            var animationDuration = Math.round(this.trackDuration / 1000) + "s";
            //console.log(this.application.ninja.timeline.arrLayers[this.trackID - 1].element[0]);
            //console.log(this.trackID);
            this.animationName = this.application.ninja.timeline.arrLayers[this.trackID - 1].element[0].className + this.trackID;

            this.ninjaStylesContoller.setElementStyle(theElement, "-webkit-animation-name", this.animationName);
            this.ninjaStylesContoller.setElementStyle(theElement, "-webkit-animation-duration", animationDuration);
            this.ninjaStylesContoller.setElementStyle(theElement, "-webkit-animation-iteration-count", "infinite");

            var initRule = "@-webkit-keyframes " + this.animationName + " { 0% {top: " + theElement.offsetTop + "px; left: " + theElement.offsetLeft + "px;} 100% {top: " + theElement.offsetTop + "px; left: " + theElement.offsetLeft + "px;} }";
            this.currentKeyframeRule = this.ninjaStylesContoller.addRule(initRule);

            this.isAnimated = true;

            this.insertTween(tweenEvent.offsetX);
        }
    },

    updateKeyframeRule:{
        value:function () {
            // delete the current rule
            this.ninjaStylesContoller.deleteRule(this.currentKeyframeRule);

            // build the new keyframe string
            var keyframeString = "@-webkit-keyframes " + this.animationName + " {";

            for (var i = 0; i < this.keyFramePropertyData.length; i++) {

                var keyframePercent = Math.round((this.tweens[i].keyFrameMillisec / this.trackDuration) * 100) + "%";

                var keyframePropertyString = " " + keyframePercent + " {";
                keyframePropertyString += "top: " + this.keyFramePropertyData[i]["top"] + "px;";
                keyframePropertyString += " left: " + this.keyFramePropertyData[i]["left"] + "px;";
                keyframePropertyString += "}";
                keyframeString += keyframePropertyString;
            }
            keyframeString += " }";

            // set the keyframe string as the new rule
            this.currentKeyframeRule = this.ninjaStylesContoller.addRule(keyframeString);
        }
    },

    // Init and event handler for layer expand/collapse
    init:{
        value:function () {
            var that = this;

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
            this._mainCollapser.element = this.element;
            this._mainCollapser.isCollapsed = this.isMainCollapsed;
            this._mainCollapser.isAnimated = true;
            this._mainCollapser.labelClickEvent = function () {
                that.isMainCollapsed = that._mainCollapser.isCollapsed;
            }
            this._mainCollapser.needsDraw = true;

            this._positionCollapser = Collapser.create();
            this._positionCollapser.clicker = this.labelPosition;
            this._positionCollapser.myContent = this.contentPosition;
            this._positionCollapser.contentHeight = 60;
            this._positionCollapser.isLabelClickable = true;
            this._positionCollapser.element = this.element;
            this._positionCollapser.isCollapsed = this.isPositionCollapsed;
            this._positionCollapser.isAnimated = true;
            this._positionCollapser.labelClickEvent = function () {
                that.isPositionCollapsed = that._positionCollapser.isCollapsed;
            }
            this._positionCollapser.needsDraw = true;

            this._transformCollapser = Collapser.create();
            this._transformCollapser.clicker = this.labelTransform;
            this._transformCollapser.myContent = this.contentTransform;
            this._transformCollapser.contentHeight = 100;
            this._transformCollapser.isLabelClickable = false;
            this._transformCollapser.element = this.element;
            this._transformCollapser.isCollapsed = this.isTransformCollapsed;
            this._transformCollapser.isAnimated = true;
            this._transformCollapser.labelClickEvent = function () {
                that.isTransformCollapsed = that._transformCollapser.isCollapsed;
            }
            this._transformCollapser.needsDraw = true;

            this._styleCollapser = Collapser.create();
            this._styleCollapser.clicker = this.labelStyles;
            this._styleCollapser.myContent = this.contentStyles;
            this._styleCollapser.contentHeight = 60;
            this._styleCollapser.isLabelClickable = false;
            this._styleCollapser.element = this.element;
            this._styleCollapser.isCollapsed = this.isStyleCollapsed;
            this._styleCollapser.isAnimated = true;
            this._styleCollapser.labelClickEvent = function () {
                that.isStyleCollapsed = that._styleCollapser.isCollapsed;
            }
            this._styleCollapser.needsDraw = true;

            // Register event handler for layer events.
            var that = this;
            defaultEventManager.addEventListener("layerEvent", this, false);

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
            }
        }
    }
});