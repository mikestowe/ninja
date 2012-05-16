/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */
var Montage = 			require("montage/core/core").Montage,
    Component = 		require("montage/ui/component").Component,
    Template =			require("montage/ui/template").Template,
    TemplateCreator =	require("tools/template/template-creator").TemplateCreator;

exports.Main = Montage.create(Component, {

    hasTemplate: {
        value: false
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

                component = require.async(data.path)
                    .then(function(component) {
                        var componentRequire = component[data.name];
                        var componentInstance = componentRequire.create();

                        componentInstance.element = element;

                        componentInstance.needsDraw = true;
                        componentInstance.ownerComponent = self;

                        callback(componentInstance, element);
                    })
                    .end();

            };
            //
            window.mjsTemplateCreator = TemplateCreator.create();
            //
			window.mjsTemplate = Template.create();
			
			
            // Dispatch event when this template has loaded.
            /*
            var newEvent = document.createEvent( "CustomEvent" );
            newEvent.initCustomEvent( "userTemplateDidLoad", false, true );
            document.body.dispatchEvent( newEvent );
            */

        }
    }
});