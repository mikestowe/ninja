/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

var InputGroup = exports.InputGroup = Montage.create(Component, {

    forwardEvent:
    {
        value: function(event)
        {
            if(event.type === "propertyChanging")
            {
                this._handlePropertyChanging(event);
            }
            else
            {
                this._handlePropertyChange(event);
            }
        }
    },

    _handlePropertyChanging:
    {
        value: function(event)
        {
            this._dispatchPropEvent(event);
        }
    },

    _handlePropertyChange:
    {
        value: function(event)
        {
            this._dispatchPropEvent(event);
        }
    },

    _dispatchPropEvent: {
        value: function(event) {
            var propEvent = document.createEvent("CustomEvent");
            if(event.type === "propertyChanging")
            {
                propEvent.initEvent("changing", true, true);
                propEvent.type = "changing";
            }
            else
            {
                propEvent.initEvent("change", true, true);
                propEvent.type = "change";
            }
            propEvent.propertyLabel = event.propertyLabel;
            propEvent.propertyValue = event.propertyValue;
            propEvent.propertyEvent = event;

            this.dispatchEvent(propEvent);
        }
    },
            
    value: {
        enumerable: true,
        serializable: true,
        get: function () {
            var retObject = {};
            for(var i=0, len=this.controlsList.childComponents.length; i< len; i++)
            {
                var childControl = this.controlsList.childComponents[i];
                retObject[childControl.label] = childControl._control[childControl._prop];
            }
            return retObject;
            
        }
    },

    controlsList: {
        enumerable: true,
        serializable: true,
        value: null
    }

});
