/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;
var ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.PenProperties = Montage.create(ToolProperties, {
    reset:      { value: null },
    
    _subPrepare: {
        value: function() {
            this.reset.addEventListener("click", this, false);
        }
    },

    handleClick: {
        value: function(event) {
            var newEvent = document.createEvent( "CustomEvent" );
            newEvent.initCustomEvent( "resetPenTool", false, true );
            defaultEventManager.dispatchEvent( newEvent );
        }
    }
});