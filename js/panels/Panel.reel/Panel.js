/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.Panel = Montage.create(Component, {

    name: {
        value: "Panel"
    },

    _collapsed: {
        value: false
    },

    _height: {
        value: 200
    },

    minHeight: {
        value: 200
    },

    maxHeight: {
        value: null
    },

    flexible: {
        value: true
    },

    _locked: {
        value: false
    },

    isResizing: {
        value: false
    },

    _resizedHeight: {
        value: 0
    },

    resizer: {
        value: null
    },

    modulePath: {
        value: null
    },

    moduleName: {
        value: null
    },

    disabled: {
        value:false
    },

    collapsed: {
        get: function() {
            return this._collapsed;
        },
        set: function(val) {
            if (this._collapsed !== val) {
                this._collapsed = val;
                this.needsDraw = true;
            }
        }
    },

    height: {
        get: function() {
            if (this._height < this.minHeight) {
                this._height = this.minHeight;
            }
            return this._height;
        },
        set: function(val) {
            if(this._height !== val) {
                this._height = val;
                this.needsDraw = true;
            }
        }
    },

    locked: {
        get: function() {
            return this._locked;
        },
        set: function(val) {
            if (this.flexible) {
                this._locked = val;
                this.needsDraw = true;
            }
        }
    },

    handleBtnCollapseAction: {
        value: function() {
            this.collapsed = !this.collapsed;
            this.needsDraw = true;
        }
    },

    handleBtnCloseAction: {
        value: function() {
            this.panelContent.content = null;
        }
    },

    prepareForDraw: {
        value: function() {
            if(this.name === "Color") {
                this.application.ninja.colorController.colorView = this.application.ninja.colorController.colorPanelBase.create();
            }

            if(this.modulePath && this.moduleName) {
                // Load the slot content
                var that = this;
                require.async(this.modulePath)
                    .then(function(panelContent) {
                        var componentRequire = panelContent[that.moduleName];
                        var componentInstance = componentRequire.create();

                        componentInstance.ownerComponent = that.ownerComponent;
                        that.panelContent.content = componentInstance;
                    })
                    .end();
            }
        }
    },

    handleResizeStart: {
        value:function(e) {
            this.isResizing = true;
            this.needsDraw = true;
        }
    },

    handleResizeMove: {
        value:function(e) {
            this._resizedHeight = e._event.dY;
            this.needsDraw = true;
        }
    },

    handleResizeEnd: {
        value: function(e) {
            this.height += this._resizedHeight;
            this._resizedHeight = 0;
            this.isResizing = false;
            this.needsDraw = true;
        }
    },

    draw: {
        value: function() {
            if(this.isResizing) {
                this.element.style.webkitBoxFlex = "0.1";
            } else if (this.locked) {
                this.element.style.webkitBoxFlex = "0";
            } else {
                this.element.style.webkitBoxFlex = null;
            }

            if (this.collapsed) {
                this.element.classList.add("collapsed");
            } else if (!this.flexible) {
                this.resizer.enabled = false;
                this.element.classList.remove("collapsed");
                this.element.style.minHeight = this.height + "px";
                this.element.style.maxHeight = this.height + "px";
                this.element.style.height = this.height + "px";
                this.panelContent.element.style.overflowY = "hidden";
            } else {
                this.panelContent.element.style.overflowY = "auto";
                this.resizer.enabled = true;
                this.element.classList.remove("collapsed");
                this.element.style.minHeight = this.minHeight + "px";
                this.element.style.height = (this.height + this._resizedHeight) + "px";
                if (this.maxHeight !== null) {
                    this.element.style.maxHeight = this.maxHeight  + "px";
                } else {
                    this.element.style.maxHeight = null;
                }
            }
        }
    },

    didDraw: {
        value: function() {
            if(this.flexible && !this.isResizing) {
                this.height = this.element.offsetHeight;
            }

            if (this.isResizing) {
                var actionEvent = document.createEvent("CustomEvent");
                actionEvent.initCustomEvent("panelResizing", true, true, null);
                actionEvent.type = "panelResizing";
                this.dispatchEvent(actionEvent);
            }
        }
    }
});