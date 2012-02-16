/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.Splitter = Montage.create(Component, {

    hasTemplate: {
        value: false
    },

    _panel: {
        value: null,
        enumerable:true
    },

    panel: {
        get: function() {
            return this._panel;
        },
        set: function(value) {
            this._panel = value;
        }
    },

    _resizeBar: {
        value: null
    },

    resizeBar: {
        get: function() {
            return this._resizeBar;
        },
        set: function(val) {
            this._resizeBar = val;
        }
    },

    _collapsed : {
        value: false,
        enumerable:true
    },

    collapsed: {
        get: function() {
            return this._collapsed;
        },
        set: function(value)
        {
            this._collapsed = value;
            this.application.ninja.settings.setSetting(this.element.id, "collapsed", this.collapsed);
        }
    },

    prepareForDraw: {
        value: function() {
            //Get Setting from SettingManager
            this.application.ninja.settings.getSetting(this.element.id, "collapsed");
            lapsed = false;
            if (lapsed != null) this._collapsed = lapsed;
            this.element.addEventListener("click", this, false);
        }
    },

    draw: {
        value: function() {
            if(this.collapsed) {
                
                if(this.panel.element) this.panel.element.classList.add("collapsed");
                else this.panel.classList.add("collapsed");
                this.element.classList.add("collapsed");
                if(this._resizeBar != null) this.resizeBar.classList.add("collapsed");
            }
            else {
                if(this.panel.element) this.panel.element.classList.remove("collapsed");
                else this.panel.classList.remove("collapsed");
                this.element.classList.remove("collapsed");
                if(this._resizeBar != null) this.resizeBar.classList.remove("collapsed");
            }
        }
    },

    handleClick : {
        value: function() {
            if (!this.disabled) {
                this.panel.addEventListener("webkitTransitionEnd", this, false);
                this.collapsed = !this.collapsed;
                this.needsDraw = true;
            }
        }
    },

    handleWebkitTransitionEnd: {
        value: function() {
            this.panel.removeEventListener("webkitTransitionEnd", this, false);
            this.application.ninja.stage.resizeCanvases = true;
        }
    },

    _disabled: {
        value: null
    },

    disabled: {
        get: function() {
            return this._disabled;
        },
        set: function(val) {
            if (val && !this.element.classList.contains("disabled")) {
                this.element.classList.add("disabled");
            } else {
                this.element.classList.remove("disabled");
            }
            this._disabled = val;
        }
    },

    toggle: {
        value: function() {
            this.handleClick();
        }
    }
});
