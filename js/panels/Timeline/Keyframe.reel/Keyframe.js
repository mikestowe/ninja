var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

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
            this.needsDraw = true;
        }
    },

    prepareForDraw:{
        value:function(){
            this.element.addEventListener("click", this, false);
        }
    },

    draw:{
        value:function(){
            this.element.style.left = (this.position - 3) + "px";
        }
    },

    deselectKeyframe:{
        value:function(){
            this.element.classList.remove("keyframeSelected");
        }
    },

    selectKeyframe:{
        value:function(){
            this.element.classList.add("keyframeSelected");
            this.parentComponent.selectTween();
        }
    },

    handleClick:{
        value:function(ev){
            this.selectKeyframe();
        }
    }
});
