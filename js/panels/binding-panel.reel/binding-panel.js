var Montage         = require("montage/core/core").Montage,
    Component       = require("montage/ui/component").Component;


exports.BindingPanel = Montage.create(Component, {

    prepareForDraw: {
        value: function() {
            console.log("test- objects");
        }
    }
});