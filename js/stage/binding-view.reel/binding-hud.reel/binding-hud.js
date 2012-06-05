/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/**
@requires montage/core/core
@requires montage/ui/component
*/
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.BindingHud = Montage.create(Component, {
    _bindingArgs: {
        value: null
    },

    titleElement: {
        value: null
    },

    bindingArgs: {
        get: function() {
            return this._bindingArgs;
        },
        set: function(val) {
            this._bindingArgs = val;
            this.title = this.bindingArgs.sourceObject.identifier;
            this.x = this._bindingArgs.sourceObject.element.offsetLeft;
            this.y = this._bindingArgs.sourceObject.element.offsetTop;
            this.needsDraw = true;
            console.log("Binding Args Set", val);
        }
    },

    properties: {
        value: [
        ]
    },

    x: {
        value: 20
    },

    y: {
        value: 100
    },

    _title: {
        value: "default"
    },

    title: {
        get: function() {
            return this._title;
        },
        set: function(val) {
            this._title = val;
        }
    },

    prepareForDraw: {
        value: function() {
            var arrProperties = this.application.ninja.objectsController.getEnumerableProperties(this._bindingArgs.sourceObject, true);
            arrProperties.forEach(function(obj) {
                var objBound = false;
                if(this._bindingArgs._boundObjectPropertyPath === obj) {
                    objBound = true;
                }
                this.properties.push({"title":obj, "bound": objBound});
            }.bind(this));
        }
    },

    draw: {
        value: function() {
            this.titleElement.innerHTML = this.title;
            this.element.style.top = this.y + "px";
            this.element.style.left = this.x + "px";
            console.log("hud",this);
        }
    }
});