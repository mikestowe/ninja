var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

var Span = exports.Span = Montage.create(Component, {

    hasTemplate:{
        value: true
    },

    _spanWidth:{
        value:0
    },

    spanWidth:{
        serializable:true,
        get:function () {
            return this._spanWidth;
        },
        set:function (value) {
            this._spanWidth = value;
        }
    },

    prepareForDraw:{
        value:function(){

        }
    },

    draw:{
        value: function(){
            this.tweenspan.style.width = this.spanWidth + "px";
        }
    }
});
