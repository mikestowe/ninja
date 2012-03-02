/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/*
Panel Container - A container for other panels
*/
var Montage         = require("montage/core/core").Montage;
var Component       = require("montage/ui/component").Component;
var PropertiesPanel = require("js/panels/Properties/properties-panel").PropertiesPanel;
var ColorPanel      = require("js/panels/Color/ColorPanel").ColorPanel;
var CSSPanel        = require("js/panels/CSSPanel/CSSPanel").CSSPanel;
var ComponentsPanel = require("js/panels/Components/ComponentsPanel").ComponentsPanel;
var ProjectPanel    = require("js/panels/Project/ProjectPanel").ProjectPanel;
var MaterialsPanel  = require("js/panels/Materials/MaterialsPanel").MaterialsPanel;
var PresetsPanel    = require("js/panels/presets/presets-panel").PresetsPanel;
var CSSPanelNew    = require("js/panels/css-panel/css-panel-container").CSSPanelContainer;

exports.PanelContainer = Montage.create(Component, {
    lastOffset: {
        value:null
    },
    _collapsedHeight: {
        value: 26
    },
    _isFirstAdjustableNonCollapsed: {
        value:true
    },
    _spaceAvailable: {
        value:null
    },
    _panelSelected : {
        value: null
    },
    _isFirstDraw: {
        value: false
    },
    _panels: {
        value: []
    },

    skipPanelIndex: {
        value: null
    },

    initPanelOrder: {
        value: ['CSSPanelNew','PropertiesPanel','ColorPanel','ComponentsPanel','ProjectPanel','CSSPanel','MaterialsPanel','PresetsPanel']
    },

    panelOrder: {
        value: []
    },

    deserializedFromTemplate : {
        value: function() {
           this.eventManager.addEventListener( "appLoaded", this, false);

        }
    },

    handleAppLoaded: {
        value: function() {
            //Panels Loading
            this.lastOffset = this.element.offsetHeight;

            /* Old Settings
            if( this.application.ninja.settings.getSetting(this.element.id, "panelOrder") != null) {
                this.initPanelOrder = this.application.ninja.settings.getSetting(this.element.id, "panelOrder")
            }
            */

            // if Panels already loaded no need to load again.
            for(var i = 0; i < this.initPanelOrder.length; i++) {
                this.addPanel(eval(this.initPanelOrder[i]));
                this.panelOrder.push(this.initPanelOrder[i]);

//              this.application.ninja.settings.setSetting(this.element.id, "panelOrder", this.panelOrder);
            }

            var hideSplitter = true;

            var that = this;
            this._panels.forEach(function(obj) {

                var panelMenuName = obj.panelName.substring(0,  obj.panelName.indexOf('/') !== -1 ?  obj.panelName.indexOf('/'):  obj.panelName.length) + "Panel";

                that.application.ninja.appModel[panelMenuName] = obj.visible;

                if (obj.visible) {
                    hideSplitter = false;
                }
            });

            if (hideSplitter) {
                this.panelSplitter.toggle();
                this.panelSplitter.disabled = true;
            }

//            this.needsDraw = true;

            this.addEventListener("change@appModel.PropertiesPanel", this, false);
            this.addEventListener("change@appModel.ProjectPanel", this, false);
            this.addEventListener("change@appModel.ColorPanel", this, false);
            this.addEventListener("change@appModel.ComponentsPanel", this, false);
            this.addEventListener("change@appModel.CSSPanel", this, false);
            this.addEventListener("change@appModel.MaterialsPanel", this, false);
            this.addEventListener("change@appModel.PresetsPanel", this, false);
            this.addEventListener("change@appModel.CSSPanelNew", this, false);
        }
    },

    handleEvent: {
        value: function(e) {
            this.togglePanel(e.propertyName);
        }
    },
    
    addPanel: {
        value: function(panel) {
            if (panel.init) {
                panel.init();
            }
            this._panels.push(panel);
            if (this.panelSplitter.disabled) {
                this.panelSplitter.disabled = false;
                this.panelSplitter.toggle();
            }
        }
    },
    handlePanelCollapsed: {
         value: function(e) {

            for(var i=0; i < this._panels.length; i++) {
                if (e._event.detail.panelBase._uuid == this._panels[i]._uuid) {
                    this.skipPanelIndex = i;
                    this.handlePanelResized(i, true);
                }
            }
        }
    },

    handlePanelResizedStart : {
        value: function(e) {
            for (var i = 0; i < this._panels.length; i++) {
                if ( e._event.detail.element.parentNode.uuid == this.repeater.childComponents[i].element.uuid) {
                    this.handlePanelResized(i);
                }
            }
        }
    },

    handlePanelResizedEnd : {
        value: function(e) {
            for (var i = 0; i < this._panels.length; i++) {
                if ( e._event.detail.element.parentNode.uuid == this.repeater.childComponents[i].element.uuid) {
                    this.handlePanelResized();
                }
            }
        }
    },

    handlePanelResizing: {
        value:function(e) {
            this.resizedRedraw();
        }
    },

    canFlex: {
        value: function(panel) {
            if (panel.isStatic) {
                return false;
            }

            return !(panel.collapsed || panel.forcedCollapse);

        }
    },

    handlePanelResized: {
        value: function(selectedPanelIndex, collapsing) {
            minHeights = 0;
            needsLocks = true;

            if (collapsing) {
                if (this._panels.length -1 == selectedPanelIndex) {
                    needsLocks = false;
                } else {
                    needsLocks = false;
                    for (var i = 0; i < this._panels.length; i++) {
                        if ( i > selectedPanelIndex) {
                            if (this.canFlex(this._panels[i])) {
                                needsLocks = true;
                            }
                        }
                    }
                }
            }
            for (var i = 0; i < this._panels.length; i++) {
                if (this._panels[i].collapsed || this._panels[i].forcedCollapse) {
                    minHeights += this._collapsedHeight;
                } else {
                        if (i < selectedPanelIndex && needsLocks) {
                            this._panels[i].isLocked = true;
                            this.repeater.childComponents[i].needsDraw = true;
                            minHeights += this.repeater.childComponents[i].element.offsetHeight;
                        } else {
                            this._panels[i].isLocked = false;
                            if(this.repeater.childComponents[i]) this.repeater.childComponents[i].needsDraw = true;
                            minHeights += this._panels[i].minHeight;
                        }
                }
            }
            // Theres got to be a better way to do this. Look into initiating a redraw when flex box is done redrawing its element sizes. Set them as offset height
            // Look into new css possibilities as flex box gets better integrated.

            setTimeout(this.resizedRedraw.bind(this), 300);
            while( minHeights > this.element.children[0].offsetHeight) {
                var panelCount = this._panels.length;
                var lastPanel = null;
                for( var i = 0; i < panelCount; i++ ) {
                    if (i != this.skipPanelIndex) {
                        if (!this._panels[i].forcedCollapse && !this._panels[i].collapsed) {
                            lastPanel = i;
                        }
                    }
                }
                minHeights -= this._panels[lastPanel].minHeight - this._collapsedHeight;
                this._panels[lastPanel].collapsed = true;
                //this.repeater.childComponents[lastPanel].needsDraw = true;


            }
            this.skipPanelIndex = null;
        }
    },

    resizedRedrawTimer: {
        value: null
    },

    resizedRedraw: {
        value:function() {
            for (var i = 0; i < this._panels.length; i++) {
                var rptEl = this.repeater.childComponents[i].element;
                var offset = rptEl.offsetHeight;
                this._panels[i].contentHeight = offset;
                rptEl.style.height = offset;
                this.repeater.childComponents[i].needsDraw = true;
            }
        }
    },

    togglePanel: {
        value: function(e) {
            var panelName = e._event ? e._event.detail : e;
            for(var i=0; i < this.panelOrder.length; i++) {
                if (this.panelOrder[i] == panelName) {
                    if(this._panels[i].visible) {
                        this.hidePanel(i);
                    } else {
                        this._panels[i].visible = true;
                        this.repeater.childComponents[i].needsDraw = true;
//                        NJevent("panelAdded",this._panels[i]);
                        if (this.panelSplitter.disabled) {
                            this.panelSplitter.disabled = false;
                            this.panelSplitter.toggle();
                        }
                    }
                }
            }
            this.handlePanelResized();
        }
    },

    handlePanelSelected: {
        value: function(e) {
            this._panelSelected = e._event.detail;
        }
    },

    handlePanelClose: {
        value:function(e) {
            if( e._event.detail != null) {
                for(var i=0; i < this._panels.length; i++) {
                    if (e._event.detail._panelBase._uuid == this._panels[i]._uuid) {
                        var panelMenuName = this._panels[i].panelName.substring(0,  this._panels[i].panelName.indexOf('/') !== -1 ?  this._panels[i].panelName.indexOf('/'):  this._panels[i].panelName.length) + "Panel";
                        this.application.ninja.appModel[panelMenuName] = false;
                        this.hidePanel(i);
                    }
                }
            }
        }
    },

    hidePanel: {
        value: function(panelIndex) {
            var panel = this._panels[panelIndex];
            distHeight = 0;
            if (panel.collapsed || panel.forcedCollapse) distHeight = this._collapsedHeight;
            else distHeight = panel.contentHeight;
            this._spaceAvailable += distHeight;
//            NJevent("panelClosed", panel.panelName);
            panel.visible = false;
            this.repeater.childComponents[panelIndex].needsDraw = true;

            //Validate all panels are closed
            var hideSplitter = true;
            this._panels.forEach(function(obj) {
                if (obj.visible) {
                    hideSplitter = false;
                }
            })
            if (hideSplitter) {
                this.panelSplitter.toggle();
                this.panelSplitter.disabled = true;
            }
        }
    },

    handlePanelOrderChanged: {
        value:function(e) {
            overed = null;
            selected = null;
            for(var i=0; i < this._panels.length; i++) {
                if (e._event.detail.panelBase._uuid == this._panels[i]._uuid) {
                    overed = i;
                }
                if (this._panelSelected.panelBase._uuid == this._panels[i]._uuid) {
                    selected = i;
                }
            }
            if (overed != selected) {
                var panelRemoved = this._panels.splice(selected,1);
                this._panels.splice(overed,0, panelRemoved[0]);
                var panelOrderRemoved = this.panelOrder.splice(selected,1);
                this.panelOrder.splice(overed,0, panelOrderRemoved[0]);

                //this.application.ninja.settings.setSetting(this.element.id, "panelOrder", this.panelOrder);
            }
        }
    },

    prepareForDraw: {
        value: function() {
            //console.log("drawing:" + this._panels.length);
            if (!this._isFirstDraw) {
                this._isFirstDraw = true;
                this.eventManager.addEventListener("panelOrderChanged", this, false);
                this.eventManager.addEventListener("panelClose", this, false);
                this.eventManager.addEventListener("panelCollapsed", this, false);
                this.eventManager.addEventListener("panelSelected", this, false);

                this.eventManager.addEventListener("panelResizing", this, false);
                this.eventManager.addEventListener("panelResizedStart", this, false);
                this.eventManager.addEventListener("panelResizedEnd", this, false);
                window.addEventListener("resize", this.handlePanelResized.bind(this), false);
            }
        }
    },

    didDraw: {
        value: function() {
            this.handlePanelResized();
        }
    },
    //External Objects
    _repeater: {
        value:null
    },
    repeater: {
        get: function() {
            return this._repeater;
        },
        set: function(val) {
            this._repeater = val;
        }
    },
    _panelSplitter: {
        value:null
    },
    panelSplitter: {
        get: function() {
            return this._panelSplitter;
        },
        set: function(val) {
            this._panelSplitter = val;
        }
    }

});