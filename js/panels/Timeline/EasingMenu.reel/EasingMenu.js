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
    Component = require("montage/ui/component").Component,
    Popup = require("montage/ui/popup/popup.reel").Popup;

var EasingMenu = exports.EasingMenu = Montage.create(Component, {

    hasTemplate:{
        value: true
    },

    /* Begin: Models */

    // popup: the initialized component.
    _popup: {
        value: null
    },
    popup: {
        get: function() {
            return this._popup;
        },
        set: function(newVal) {
            this._popup = newVal
        }
    },

    // callingComponent: pointer to the span that called for the menu
    _callingComponent: {
        value: null
    },
    callingComponent: {
        get: function() {
            return this._callingComponent;
        },
        set: function(newVal) {
            this._callingComponent = newVal;
        }
    },

    // anchor: pointer to the anchoring element
    _anchor: {
        value: null
    },
    anchor: {
        get: function() {
            return this._anchor;
        },
        set: function(newVal) {
            this._anchor = newVal;
        }
    },


    _top: {
        value: null
    },
    top: {
        get: function() {
            return this._top;
        },
        set: function(newVal) {
            this._top = newVal;
        }
    },
    _left: {
        value: null
    },
    left: {
        get: function() {
            return this._left;
        },
        set: function(newVal) {
            this._left = newVal;
        }
    },

    // currentChoice: The data attribute of the current choice
    _currentChoice: {
        value: "none"
    },
    currentChoice: {
        get: function() {
            return this._currentChoice;
        },
        set: function(newVal) {
            this._currentChoice = newVal;
        }
    },

    _isShown: {
        value: false
    },

    /* End: Models */

    /* Begin: Draw Cycle */
    willDraw: {
        value: function() {
            this.element.addEventListener("click", this.handleEasingChoicesClick.bind(this), false);
            document.addEventListener("scroll", this.handleDocumentScroll.bind(this), false);
        }
    },

    draw: {
        value: function() {
            // Update the selection classes.
            var easingSelected = this.element.querySelector(".easing-selected");
            if (easingSelected !== null) {
                easingSelected.classList.remove("easing-selected");
            }
            var dataEl = this.element.querySelector('[data-ninja-ease="'+this.currentChoice+'"]');
            if (dataEl !== null) {
                dataEl.classList.add("easing-selected");
            }
        }
    },
    didDraw: {
        value: function() {
        }
    },
    /* End Draw Cycle */

    /* Begin: Controllers */
    show: {
        value: function() {
            // Initialize the popup if it hasn't already been done
            if (this.popup == null) {
                this.popup = Popup.create();
                this.popup.modal = false;
                this.popup.content = EasingMenu.create();
            }

            // Show the popup
            this.popup.anchor = this.anchor;
            var position = {};
            position.top = this.top;
            position.left = this.left;
            this.popup.position = position;
            this.popup.show();
            this._isShow = true;

            // Redraw the content (needed to reflect probable changes in selection from the last time we showed it)
            this.popup.content.needsDraw = true;
        }
    },
    handleEasingChoicesClick: {
        value: function(event) {
            event.stopPropagation();

            // Un-highlight the old choice and highlight the new choice
            var easingSelected = this.element.querySelector(".easing-selected");
            if (easingSelected !== null) {
                easingSelected.classList.remove("easing-selected");
            }
            event.target.classList.add("easing-selected");

            // Set the easing in the span that called us
            this.callingComponent.easing = event.target.dataset.ninjaEase;

            // Hide the menu.
            this.popup.hide();
            this._isShow = false;
        }
   },
    handleDocumentScroll: {
        value: function(event) {
            if (this._isShow = true) {
                this.popup.hide();
            }
        }
    }

    /* End: Controllers */

});
