/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.Resizer = Montage.create(Component, {
 
    hasTemplate: {
        value: false
    },
 
    _isInversed: {
        value: false
    },
 
    isInversed: {
        get: function() {
            return this._isInversed;
        },
        set: function(val) {
            this._isInversed = val;
        }
    },
 
    _isVertical: {
        value: null
    },
 
    isVertical: {
        get: function() {
            return this._isVertical;
        },
        set: function(val) {
            this._isVertical = val;
        }
    },

    _isPanel: {
    	value: true
    },
    isPanel: {
    	get: function() {
    		return this._isPanel;
    	},
    	set: function(value) {
    		this._isPanel = value;
    	}
    },
    _panel : {
        value: null
    },
 
    panel : {
        get: function() {
            return this._panel;
        },
        set: function(val) {
            this._panel = val
        }
    },
 
    handleClick: {
        value: function() {
 
        }
    },
 
    handleMousedown: {
        value: function(e) {
            e.preventDefault();
            this.panel.addEventListener("webkitTransitionEnd", this, true);
            if (this.isVertical) {
                //console.log("y: " + e.y + "    startPosition: " + this._startPosition + "  initDimension: " + this._initDimension);
                this._startPosition = e.y;
                this._initDimension = this.panel.offsetHeight;
            }
            else {
                this._startPosition = e.x;
                this._initDimension = this.panel.offsetWidth;
            }
 
            this.panel.classList.add("disableTransition");
            window.addEventListener("mousemove", this, false);
            window.addEventListener("mouseup", this, false);
            NJevent("panelResizedStart", this)
        }
    },
 
    handleDblclick: {
        value : function() {
            this.panel.addEventListener("webkitTransitionEnd", this, true);
            if (this.isVertical) {
                this.panel.style.height = "";
            } else {
                this.panel.style.width = "";
            }
            this.application.ninja.settings.setSetting(this.element.id,"value", "");
        }
    },

    captureWebkitTransitionEnd: {
        value: function() {
            if(this.redrawStage) {
                this.application.ninja.stage.resizeCanvases = true;
            }
            this.panel.removeEventListener("webkitTransitionEnd");
        }
    },
 
    prepareForDraw: {
        value: function() {
            if(this.value != null) {
                if (this.isVertical) {
                    this.panel.style.height = this.value + "px";
                } else {
                    this.panel.style.width = this.value + "px";
                }
            }
            this.element.addEventListener("mousedown", this, false);
            this.element.addEventListener("dblclick", this, false);
        }
    },
 
    draw: {
        value: function() {
 
        }
    },
 
    handleMouseup: {
        value:  function(e) {
            e.preventDefault();
            window.removeEventListener("mousemove", this);
            window.removeEventListener("mouseup", this);
            this.panel.classList.remove("disableTransition");
            if (this.isVertical) {
                this.panel.style.height = this.panel.offsetHeight;
            } else {
                this.panel.style.width = this.panel.offsetWidth;
            }
            this.application.ninja.settings.setSetting(this.element.id,"value", this.value);
            if(this.redrawStage) {
                this.application.ninja.stage.resizeCanvases = true;
            }
            NJevent("panelResizedEnd", this)
        }
    },
 
    handleMousemove: {
        value: function(e) {
            if(this.isVertical) {
                this.value = this._isInversed ? this._initDimension + (this._startPosition - e.y) : this._initDimension + (e.y - this._startPosition);
                //console.log("y: " + e.y + "    startPosition: " + this._startPosition + "  initDimension: " + this._initDimension + "    finalPosition: " + pos);
                this.panel.style.height = this.value + "px";
            }
            else {
            	if (this.isPanel) {
                	this.value = this._initDimension + (this._startPosition - e.x);
            	} else {
            		this.value = this._isInversed ? this._initDimension + (this._startPosition - e.x) : this._initDimension + (e.x - this._startPosition);
            	}
                this.panel.style.width = this.value + "px";
            }
 
            if(this.redrawStage) {
                this.application.ninja.stage.resizeCanvases = true;
            }
 
            NJevent("panelResizing", this);
        }
    },
 
    _value: {
        value: null
    },
 
    redrawStage: {
        value:false
    },
 
    value: {
        get: function() {
            if(this.application.ninja.settings) {
                var gottenValue = this.application.ninja.settings.getSetting(this.id, "value");
                if (this._value == null && gottenValue !=null) {
                    this.value = gottenValue;
                }
            }
            return this._value;
        },
        set: function(val) {
            this._value = val;
        }
    }
});