/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */
var Montage =           require("montage/core/core").Montage,
    Component =         require("montage/ui/component").Component,
    Template =          require("montage/ui/template").Template,
    TemplateCreator =   require("tools/template/template-creator").TemplateCreator;


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

                        componentInstance.identifier = data.identifier;
                        componentInstance.addEventListener("firstDraw", self, false);

                        componentInstance.element = element;
                        componentInstance.needsDraw = true;
                        componentInstance.ownerComponent = self;

                        self.componentToInsert = componentInstance;
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
