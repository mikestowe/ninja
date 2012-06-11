/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */
var Montage = 			require("montage/core/core").Montage,
    Component = 		require("montage/ui/component").Component,
    Template =			require("montage/ui/template").Template,
    TemplateCreator =	require("tools/template/template-creator").TemplateCreator;


//var njmodelGet = function njmodelGet() {
//    return (this.hasOwnProperty("_model") ? this._model: document.modelGenerator.call(this));
//};
//
//Object.defineProperty(Object.prototype, "_model", {
//    enumerable: false,
//    value: null,
//    writable: true
//});
//
//Object.defineProperty(Object.prototype, "elementModel", {
//    configurable: true,
//    get: njmodelGet,
//    set: function() {
//    }
//});

exports.Main = Montage.create(Component, {

    hasTemplate: {
        value: false
    },

    componentToInsert: {
        value: null
    },

    firstDrawCallback: {
        value: null
    },

    /**
     * Adding window hooks to callback into this object from Ninja.
     */
    templateDidLoad: {
        value: function(){
            var self = this;
            //
            window.addComponent = function(element, data, callback) {
                var component;

                if(!self.firstDrawCallback) {
                    self.firstDrawCallback = {};
                    self.firstDrawCallback.callback = data.firstDraw.cb;
                    self.firstDrawCallback.context = data.firstDraw.ctx;
                }

                component = require.async(data.path)
                    .then(function(component) {
                        var componentRequire = component[data.name];
                        var componentInstance = componentRequire.create();

                        componentInstance._montage_metadata.label = componentInstance.identifier = data.name;
                        componentInstance.element = element;

                        componentInstance.needsDraw = true;
                        componentInstance.ownerComponent = self;

                        self.componentToInsert = componentInstance;
                        componentInstance.addEventListener("firstDraw", self, false);

                        callback(componentInstance, element);
                    })
                    .end();

            };
            //
            window.mjsTemplateCreator = TemplateCreator;
            //
            window.mjsTemplate = Template;
            //
            var templateEvent = document.createEvent("CustomEvent");
            templateEvent.initCustomEvent("mjsTemplateReady", false, true);
            document.body.dispatchEvent(templateEvent);
        }
    },

    handleFirstDraw: {
        value: function() {
            this.firstDrawCallback.callback.call(this.firstDrawCallback.context, this.componentToInsert);

            this.componentToInsert.removeEventListener("firstDraw", this, false);
            this.componentToInsert = null;
        }
    }
});