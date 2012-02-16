/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;


exports.ToolButton = Montage.create(Component, {

    button:     { value: null },

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
        }
    },

    draw: {
        enumerable: false,
        value: function() {
            var buttonid;

            if(this.data.container) {
                buttonid = this.data.subtools[this._subselected].id;
                this.element.title = this.data.subtools[this._subselected].toolTip;
                this.button.classList.remove( this.data.subtools[this._currentSubSelected].id + "Unpressed" );
                this.button.classList.remove( this.data.subtools[this._currentSubSelected].id + "Pressed" );
                this._currentSubSelected = this._subselected;
            } else {
                buttonid = this.data.id;
            }

            if(this._selected) {
                this.element.classList.add( "buttonSelected" );
                this.button.classList.remove( buttonid + "Unpressed" );
                this.button.classList.add( buttonid + "Pressed" );
            } else {
                this.element.classList.remove( "buttonSelected" );
                this.button.classList.remove( buttonid + "Pressed" );
                this.button.classList.add( buttonid + "Unpressed" );
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