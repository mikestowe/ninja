var Montage         = require("montage/core/core").Montage,
    Component       = require("montage/ui/component").Component;


exports.BindingPanel = Montage.create(Component, {

    bindings : {
        value: null
    },

    templateDidLoad : {
        value: function() {
            Object.defineBinding(this, 'bindings', {
                boundObject: this.application.ninja.objectsController,
                boundObjectPropertyPath: "currentObjectBindings",
                oneway: true
            });
        }
    },

    prepareForDraw: {
        value: function() {
            console.log("test- objects");
        }
    }
});