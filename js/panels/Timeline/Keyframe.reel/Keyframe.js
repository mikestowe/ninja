var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

var Keyframe = exports.Keyframe = Montage.create(Component, {

    hasTemplate:{
        value: true
    },

    _position:{
        value:0
    },

    position:{
        serializable:true,
        get:function(){
            return this._position;
        },
        set:function(value){
            this._position = value;
        }
    },

    _id:{
        value:0
    },

    id:{
        serializable:true,
        get:function () {
            return this._id;
        },
        set:function (value) {
            this._id = value;
        }
    },

    _timelinePosition:{
        value:0
    },

    timelinePosition:{
        serializable:true,
        get:function () {
            return this._timelinePosition;
        },
        set:function (value) {
            this._timelinePosition = value;
        }
    },

    _containingTrack:{
        value:{}
    },

    containingTrack:{
        serializable:true,
        get:function () {
            return this._containingTrack;
        },
        set:function (value) {
            this._containingTrack = value;
        }
    },

    _animatedProperties:{
        value:[]
    },

    animatedProperties:{
        serializable:true,
        get:function () {
            return this._animatedProperties;
        },
        set:function (value) {
            this._animatedProperties = value;
        }
    },

    prepareForDraw:{
        value:function(){
            this.tweenkeyframe.addEventListener("click", this, false);
            this.animatedProperties = new Array();

            // should element mediator be used here?
            this.animatedProperties["top"] = this.containingTrack.animatedElement.offsetTop;
            this.animatedProperties["left"] = this.containingTrack.animatedElement.offsetLeft;
        }
    },

    draw:{
        value:function(){
            this.tweenkeyframe.style.left = (this.position - 2) + "px";
        }
    },

    handleElementChange:{
        value:function (event) {

            if(event.detail.source && event.detail.source !== "keyframe") {

                var items = this.application.ninja.selectedElements;

                // update this keyframe's animated properties from the item[0] element props
                this.animatedProperties["top"] = items[0]._element.offsetTop;
                this.animatedProperties["left"] = items[0]._element.offsetLeft;
                this.containingTrack.keyFramePropertyData[this.id] = this.animatedProperties;

                this.containingTrack.updateKeyframeRule();
            }


        }
    },

    deselect:{
        value:function(){
            this.tweenkeyframe.classList.remove("keyframeSelected");

            this.eventManager.removeEventListener("elementChange", this, false);
        }
    },

    select:{
        value:function(){
            this.application.ninja.timeline.deselectKeyframes();
            this.tweenkeyframe.classList.add("keyframeSelected");
            this.application.ninja.timeline.playhead.style.left = (this.timelinePosition - 2) + "px";
            this.application.ninja.timeline.playheadmarker.style.left = this.timelinePosition + "px";
            this.application.ninja.timeline.selectedKeyframes.push(this);

            var currentTop = this.animatedProperties["top"] + "px";
            var currentLeft = this.animatedProperties["left"] + "px";

            ElementsMediator.setProperty([this.containingTrack.animatedElement], "top", [currentTop], "Change", "keyframe");
            ElementsMediator.setProperty([this.containingTrack.animatedElement], "left", [currentLeft], "Change", "keyframe");

            // turn on element change event listener
            this.eventManager.addEventListener("elementChange", this, false);
        }
    },

    handleClick:{
        value:function(ev){
            this.select();
        }
    }
});
