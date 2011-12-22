/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

// Needed to change scope of 'this' inside
// event handler function to the actual class
// instead of the object that dispatched the event

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.PanelBase = Montage.create(Component, {

    //Properties
    panelName : {value : 'Generic Panel', writable:true, enumerable:true, configurable:true}, // Initial Panel Name will be used to remember status please be unique with this name
    collapsedHeight: { value:26 }, // When Collapsed = true contentHeight will return this value
    minHeight: { value: 200 }, // Minimum shrink ability for a panel
    maxHeight: { value: null }, // Maximum potential growth for a panel
    isStatic: { value: false }, // Static Value is used when you would like to create a panel that has no grow or shrink capabilities
    isLocked: { value: false }, // Locked Value is used when a panel is temporary disabled to grow and shrink
    defaultHeight: { value: 200 }, // The height set when there is no height saved in the users storage
    content : { value: null }, // Component goes here. This will be connected with the slot in the center of a panel
    _contentHeight: { value: 200 }, // Drawn Height
    _forcedCollapse: { value: false }, // Calculated Collapse when no room exists able to expand when height allows it to
    _collapsed : { value: null }, // collapsed value will set Panels State to collapsed or uncollapsed by its value (boolean)
    _visible: { value:null }, // Visible variable when visible is set to false Panel will hide
    scrollable: { value: true },

    // Getter and Setters
    contentHeight: {
         get: function() {
            if(this._contentHeight == null) {
                if(this.application.ninja.settings.getSetting(this.panelName, "contentHeight")) {
                    this._contentHeight = this.application.ninja.settings.getSetting(this.panelName, "contentHeight");
                } else {
                    this._contentHeight = this.defaultHeight;
                }
            }
             return this._contentHeight;
         },
         set: function(value) {
            if (this.minHeight > value) value = this._minHeight;
            if (this.maxHeight != null) if(this.maxHeight < value) value = this.maxHeight;
             this._contentHeight = value;
            this.application.ninja.settings.setSetting(this.panelName, "contentHeight", value);
         }
     },
    forcedCollapse: {
        get: function() {
            if(this._forcedCollapse == null) {
                if(this.application.Ninja.SettingsManager.getSetting(this.panelName, "isPanelForceCollapsed")) {
                    this._forcedCollapse = this.application.Ninja.SettingsManager.getSetting(this.panelName, "isPanelForceCollapsed");
                } else {
                    this._forcedCollapse = false;
                }
            }
            return this._forcedCollapse;
        },
        set: function(value) {
            this._forcedCollapse = value;
            this.application.Ninja.SettingsManager.setSetting(this.panelName, "isPanelForceCollapsed", value);
        }
    },
    collapsed: {
        get: function() {
            if(this._collapsed == null) {
                if(this.application.ninja.settings.getSetting(this.panelName, "isPanelCollapsed")) {
                    this._collapsed = this.application.ninja.settings.getSetting(this.panelName, "isPanelCollapsed");
                } else {
                    this._collapsed = false;
                }
            }
            return this._collapsed;
        },
        set: function(value) {
            this._collapsed = value;
            this.application.ninja.settings.setSetting(this.panelName, "isPanelCollapsed", value);
        }
    },
    visible: {
        get: function() {

            if(this._visible === null) {
                if(typeof(this.application.ninja.settings.getSetting(this.panelName, "visible")) !== "undefined") {
                    this._visible = this.application.ninja.settings.getSetting(this.panelName, "visible");
                } else {
                    this._visible = true;
                }
            }

            return this._visible;
        },
        set: function(value) {
            this._visible = value;

            this.application.ninja.settings.setSetting(this.panelName, "visible", value);

        }
    }

    // Methods exist in panel.js

});
