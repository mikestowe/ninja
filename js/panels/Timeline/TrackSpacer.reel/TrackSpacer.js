var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

var TrackSpacer = exports.TrackSpacer = Montage.create(Component, {

    hasTemplate:{
        value: true
    },

    prepareForDraw:{
        value:function(){

        }
    }
});
