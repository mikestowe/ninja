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

////////////////////////////////////////////////////////////////////////
//
var Montage =           require("montage/core/core").Montage,
    Component =         require("montage/ui/component").Component,
    Popup =             require("js/components/popup.reel").Popup;
////////////////////////////////////////////////////////////////////////
//Exporting as PopupManager
exports.PopupManager = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //
    deserializedFromTemplate: {
        value: function () {
            //Setting styles to popup container
            this.element.style.zIndex = this._getNextHighestZindex(document.body); // Highest z-index in body
            this.element.style.position = 'absolute';
            this.element.style.top = 0;
            this.element.style.left = 0;
            this.element.style.width = '100%';
            this.element.style.height = '100%';
            //Allowing mouse events to pass through this layer
            this.element.style.pointerEvents = 'none';
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Adding the popup object
    addPopup: {
        enumerable: true,
        value: function (popup, depth, blackout) {
            //Fix to ensure always highest
            this.element.style.zIndex = this._getNextHighestZindex(document.body); // Highest z-index in body
            //TODO: Add blackout background
            //Checking for manual or setting auto to next highest depth
            if (depth) {
                popup.style.zIndex = depth;
            } else {
                popup.style.zIndex = this._getNextHighestZindex(this.element);
            }
            //Adding pointer events (inherits none)
            popup.style.pointerEvents = 'auto';
            this.element.appendChild(popup);
            //TODO: Test further (perhaps defined in CSS)
            popup.style.opacity = 0;
            popup.style.webkitTransitionProperty = 'opacity';
            popup.style.webkitTransitionDuration = '150ms';
            //TODO: Fix animation hack
            if (popup.style.webkitTransitionDuration) {
                setTimeout(function () {popup.style.opacity = 1}.bind(this), parseInt(popup.style.webkitTransitionDuration));
            } else {
                popup.style.opacity = 1;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Removing the popup object
    removePopup: {
        enumerable: true,
        value: function (popup) {
            popup.style.opacity = 0;
            //TODO: Fix animation hack
            if (popup.style && popup.style.webkitTransitionDuration) {
                setTimeout(function () {this.element.removeChild(popup)}.bind(this), parseInt(popup.style.webkitTransitionDuration));
            } else {
                this.element.removeChild(popup);
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Swapping first with second object
    swapPopup: {
        enumerable: true,
        value: function (first, second) {
            var f = first.style.zIndex, s = second.style.zIndex;
            //Setting after storing values
            first.style.zIndex = s;
            second.style.zIndex = f;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Setting Popup to highest z-index
    bringToFrontPopup: {
        enumerable: true,
        value: function (popup) {
            popup.style.zIndex = this._getNextHighestZindex(this.element);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    createPopup: {
        enumerable: true,
        value: function (content, position, tooltip) {
            //Creating container for Popup
            var container = document.createElement('div');
            var pop = Popup.create();
            //Setting container and content
            pop.element = container;
            pop.content = content;
            //Checking for optional parameters
            if (position)
                pop.position = position;
            if (tooltip)
                pop.tooltip = tooltip;
            //Adding Popup to view
            this.addPopup(container);
            pop.needsDraw = true;
            //Returns pop component
            return pop;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Accepts parent to scan for z-index and returns highest children
    _getNextHighestZindex: {
        numerable: false,
        value: function (parent) {
            //CSS specificity in javascript found at http://gbradley.com/2009/10/02/css-specificity-in-javascript used with permission from Graham Bradley
            var high = 0, current = 0, children = [], i;
            //
            if (parent) {
                children = parent.getElementsByTagName('*');
            } else {
                children = document.getElementsByTagName('*');
            }
            //
            for (i=0; children[i]; i++) {
                if (children[i].currentStyle) {
                    current = parseFloat(children[i].currentStyle['zIndex']);
                } else if (window.getComputedStyle) {
                    current = parseFloat(document.defaultView.getComputedStyle(children[i],null).getPropertyValue('z-index'));
                }
                if(!isNaN(current) && current > high){
                    high = current;
                }
            }
            //
            return (high+10);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Dispatching "Change" event
    _dispatchpopupEvent: {
        enumerable: false,
        value: function() {
            var popupEvent = document.createEvent("CustomEvent");
            popupEvent.initEvent("change", true, true);
            popupEvent.type = "change";
            this.dispatchEvent(popupEvent);
        }
    }
    ////////////////////////////////////////////////////////////////////
});
