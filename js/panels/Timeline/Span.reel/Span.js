/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
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

var Span = exports.Span = Montage.create(Component, {

    hasTemplate:{
        value: true
    },

    // BEGIN: Models
    _spanWidth:{
        value:0
    },
    spanWidth:{
        serializable:true,
        get:function () {
            return this._spanWidth;
        },
        set:function (value) {
            this._spanWidth = value;
            this.needsDraw = true;
        }
    },

    _isHighlighted: {
        value: false
    },
    isHighlighted: {
        get: function() {
            return this._isHighlighted;
        },
        set: function(newVal) {
            if (newVal !== this._isHighlighted) {
                this._isHighlighted = newVal;
                this.needsDraw = true;
            }
        }
    },

    _areChoicesVisible: {
        value: false
    },
    areChoicesVisible: {
        get: function() {
            return this._areChoicesVisible;
        },
        set: function(newVal) {
            if (newVal !== this._areChoicesVisible) {
                this._areChoicesVisible = newVal;
                this.needsDraw = true;
            }
        }
    },

    _easing: {
        value: "none"
    },
    easing: {
        get: function() {
            return this._easing;
        },
        set: function(newVal) {
            if (newVal !== this._easing) {
                if (typeof(newVal) === "undefined") {
                    newVal = "none";
                }
                this._easing = newVal;
                this.parentComponent.easing = this.easing;
                this.parentComponent.tweenData.easing = this.easing;
                this.parentComponent.setKeyframeEase(newVal);
                this.needsDraw = true;
            }
        }
    },

    // BEGIN: draw cycle
    prepareForDraw: {
        value: function() {
            this.init();
        }
    },

    draw:{
        value: function(){
            this.element.style.width = this.spanWidth + "px";

            if ((this.spanWidth <= 70) && (this.spanWidth >0)) {
                var containerWidth = this.spanWidth -18,
                    choiceWidth;
                if (containerWidth < 0) {
                    containerWidth = 0;
                }
                choiceWidth = containerWidth -3;
                if (choiceWidth < 0) {
                    choiceWidth = 0;
                }
                this.container_easing.style.width = containerWidth + "px";
                this.easing_choice.style.width = choiceWidth + "px";
                this.easing_choice.style.overflow = "hidden";
            }
            if (this.spanWidth > 70) {
                this.container_easing.setAttribute("style", "");
                this.easing_choice.setAttribute("style", "");
            }

            // Highlight the span?
            if (this.isHighlighted === true) {
                this.element.classList.add("spanHighlight");
            } else {
                this.element.classList.remove("spanHighlight");
            }

            /*
            // Hide or show the choices menu?
            if (this.areChoicesVisible === true) {
                this.easing_choices.style.display = "block";
            } else {
                this.easing_choices.style.display = "none";
            }
            */

            // Change easing?
            if (this.easing_choice.innerText !== this.easing) {
                this.easing_choice.innerText = this.easing;
            }

        }
    },

    // BEGIN: Controllers
    init: {
        value: function() {
            this.easing_choice.addEventListener("click", this.handleEasingChoiceClick.bind(this), false);
            //this.easing_choices.addEventListener("click", this.handleEasingChoicesClick.bind(this), false);

        }
    },

    highlightSpan:{
        value: function(){
            // Class add/remove should only be done in draw cycle.
            // this.element.classList.add("spanHighlight");
            this.isHighlighted = true;
        }
    },

    handleEasingChoiceClick: {
        value: function(event) {
            event.stopPropagation();
            //this.areChoicesVisible = true;
            this.application.ninja.timeline.easingMenu.anchor = this.easing_choice;
            this.application.ninja.timeline.easingMenu.currentChoice = event.currentTarget.innerText;

            function findPos(obj) {
                var objReturn = {};
                objReturn.top = 0;
                objReturn.left = 0;

                if (obj.offsetParent) {

                    do {
                        objReturn.left += obj.offsetLeft;
                        objReturn.top += obj.offsetTop;

                    } while (obj = obj.offsetParent);
                }
                return objReturn;
            }
            var objPos = findPos(event.target);
            this.application.ninja.timeline.easingMenu.top = objPos.top +38 - (this.application.ninja.timeline.layout_tracks.scrollTop);
            this.application.ninja.timeline.easingMenu.left = objPos.left+18 - (this.application.ninja.timeline.layout_tracks.scrollLeft);
            this.application.ninja.timeline.easingMenu.show();
            this.application.ninja.timeline.easingMenu.callingComponent = this;
        }
    },
    handleEasingChoicesClick: {
        value: function(event) {
            event.stopPropagation();

            // Remove the pointer to ourselves
            //this.application.ninja.timeline.currentOpenSpanMenu = false;

            // Un-highlight the old choice and highlight the new choice
            this.application.ninja.timeline.easingMenu.popup.contentEl.querySelector(".easing-selected").classList.remove("easing-selected");
            event.target.classList.add("easing-selected");

            // Set the easing
            this.easing = event.target.dataset.ninjaEase;
            this.parentComponent.easing = this.easing;
            this.parentComponent.tweenData.easing = this.easing;

            // Unbind the event handler
            this.application.ninja.timeline.easingMenu.popup.contentEl.removeEventListener("click");

            // Hide the menu.
            this.hideEasingMenu();
        }
    },
    hideEasingMenu: {
        value: function() {
            //this.areChoicesVisible = false;
            this.application.ninja.timeline.easingMenu.hide();
        }
    }
});
