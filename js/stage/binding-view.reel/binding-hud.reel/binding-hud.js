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
            if (typeof(val) !== "undefined") {
                this._bindingArgs = val;
                this.title = this.bindingArgs.component.identifier;
                this.x = this._bindingArgs.component.element.offsetLeft;
                this.y = this._bindingArgs.component.element.offsetTop;
                this.properties = this._bindingArgs.properties;
                this.needsDraw = true;
                console.log("Binding Args Set", val);
            } else {
                this.properties = [];
            }
        }
    },

    properties: {
        value: [
        ]
    },

    _isResizing: {
        value: null
    },

    _resizedX : {
        value: 0
    },

    _resizedY: {
        value: 0
    },

    handleResizeStart: {
        value:function(e) {
            this.isResizing = true;
            this.x = parseInt(this.x);
            this.y = parseInt(this.y);
            this.needsDraw = true;
            this.parentComponent.parentComponent.needsDraw = true;
        }
    },

    handleResizeMove: {
        value:function(e) {
            this._resizedY = e._event.dY;
            this._resizedX = e._event.dX;
            this.needsDraw = true;
            this.parentComponent.parentComponent.needsDraw = true;
        }
    },

    handleResizeEnd: {
        value: function(e) {
            this.x += this._resizedX;
            this.y += this._resizedY;
            this._resizedX = 0;
            this._resizedY = 0;
            this.isResizing = false;
            this.needsDraw = true;
            this.parentComponent.parentComponent.needsDraw = true;
        }
    },

    _x: {
        value: 20
    },

    _y: {
        value: 100
    },

    x: {
        get: function() {
            return this._x;
        },
        set: function(val) {
            this._x = val;
            this.needsDraw = true;
        }
    },

    y: {
        get: function() {
            return this._y;
        },
        set: function(val) {
            this._y = val;
            this.needsDraw = true;
        }
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
//            var arrProperties = this.application.ninja.objectsController.getEnumerableProperties(this._bindingArgs.sourceObject, true);
//            arrProperties.forEach(function(obj) {
//                var objBound = false;
//                if(this._bindingArgs._boundObjectPropertyPath === obj) {
//                    objBound = true;
//                }
//                this.properties.push({"title":obj, "bound": objBound});
//            }.bind(this));
        }
    },

    draw: {
        value: function() {
            this.titleElement.innerHTML = this.title;

//            if(this.isResizing) {
//                    this.timelineSplitter.collapsed = this.height - this._resizedHeight < 46;
//                    this.panelSplitter.collapsed = this.width - this._resizedWidth < 30;
//                }
            this.element.style.top = (this.y + this._resizedY) + "px";
            this.element.style.left = (this.x + this._resizedX) + "px";
        }
    }
});