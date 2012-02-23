/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;


exports.ToolButton = Montage.create(Component, {

    data:       { value: null },

    _selected:  { value: null },

    selected: {
        get: function() { return this._selected; },
        set: function(value) {
            this._selected = value;
            this.needsDraw = true;
        }
    },

    _subselected: { value: 1 },

    subselected: {
        get: function() { return this._subselected; },
        set: function(value) {

            var len = value.length;
            for(var i=0; i < len; i++) {
                if(value[i]) {
                    this._subselected = i;
                    this.needsDraw = true;
                }
            }
        }
    },

    _currentSubSelected: { value: 0},

    prepareForDraw: {
        enumerable: false,
        value: function() {
            this.element.title = this.data.toolTip;
            this.element.addEventListener("mousedown", this, false);
            this.element.addEventListener("dblclick", this, false);

            Object.defineBinding(this, "selected", {
              boundObject: this.data,
              boundObjectPropertyPath: "selected",
              oneway: false
            });

            if(this.data.container) {
                this.element.title = this.data.subtools[this._subselected].toolTip;
                Object.defineBinding(this, "subselected", {
                    boundObject: this.data.subtools,
                    boundObjectPropertyPath: "selected",
                    oneway: true
                });
            }

            this.element.classList.add(this.data.id)
        }
    },

    draw: {
        enumerable: false,
        value: function() {
            if(this.data.container) {
                this.element.title = this.data.subtools[this._subselected].toolTip;
                this.element.classList.remove(this.data.subtools[this._currentSubSelected].id);
                this.element.classList.add(this.data.subtools[this._subselected].id);
                this._currentSubSelected = this._subselected;
            }

            if(this._selected) {
                this.element.classList.add("active");
            } else {
                this.element.classList.remove("active");
            }
        }
    },

    handleMousedown: {
        value: function(event) {
            if(!this._selected) {
                NJevent("selectTool", this.data);
            }
        }
    },

    handleDblclick: {
        value: function(event) {
            NJevent("toolDoubleClick", this.data);
        }
    }


});