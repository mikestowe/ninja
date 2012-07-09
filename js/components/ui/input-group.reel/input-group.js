/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
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
