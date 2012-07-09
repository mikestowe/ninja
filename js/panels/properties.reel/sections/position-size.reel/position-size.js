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

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.PositionSize = Montage.create(Component, {

    position: {
        value: null,
        serializable: true
    },

    leftLabel: {
        value: null,
        serializable: true
    },

    leftControl: {
        value: null,
        serializable: true
    },

    topLabel: {
        value: null,
        serializable: true
    },

    topControl: {
        value: null,
        serializable: true
    },

    heightControl: {
        value: null,
        serializable: true
    },

    widthControl: {
        value: null,
        serializable: true
    },

    bindButton: {
        value: null,
        serializable: true
    },

    leftPosition: {
        value: 0
    },

    leftUnits: {
        value: "px"
    },

    topPosition: {
        value: 0
    },

    topUnits: {
        value: "px"
    },

    heightSize: {
        value: 0
    },

    heightUnits: {
        value: "px"
    },

    widthSize: {
        value: 0
    },

    widthUnits: {
        value: "px"
    },
/*
    widthSize: {
        get: function() { return this._widthSize;},
        set: function(value) {
            this._widthSize = parseInt(value);
            this.widthUnit = value;
        }
    },

    widthUnit: {
        value: "px"
    },
*/
    savedPosition: {
        value: null
    },

    aspectRatioWidth: {
        value: null
    },

    aspectRatioHeight: {
        value: null
    },

    _disablePosition: {
        value: true
    },

    disablePosition: {
        get: function () {
            return this._disablePosition;
        },
        set: function (value) {
            if(value !== this._disablePosition) {
                this._disablePosition  = value;
                this.needsDraw = true;
            }
        }
    },

    prepareForDraw: {
        value: function() {
            this.leftControl.identifier = "left";
            this.leftControl.addEventListener("change", this, false);
            this.leftControl.addEventListener("changing", this, false);

            this.topControl.identifier = "top";
            this.topControl.addEventListener("change", this, false);
            this.topControl.addEventListener("changing", this, false);

            this.heightControl.identifier = "height";
            this.heightControl.addEventListener("change", this, false);
            this.heightControl.addEventListener("changing", this, false);

            this.widthControl.identifier = "width";
            this.widthControl.addEventListener("change", this, false);
            this.widthControl.addEventListener("changing", this, false);

            this.bindButton.identifier = "ratio";
            this.bindButton.addEventListener("action", this, false);

        }
    },

    draw: {
        value: function() {
            if(this._disablePosition) {
                this.leftPosition = 0;
                this.leftControl.enabled = false;
                this.topPosition = 0;
                this.topControl.enabled = false;
                this.leftLabel.classList.add("disabled");
                this.topLabel.classList.add("disabled");
            } else {
                this.leftControl.enabled = true;
                this.topControl.enabled = true;
                this.leftLabel.classList.remove("disabled");
                this.topLabel.classList.remove("disabled");
            }
        }
    },

    /**
     * Calculate the current aspect ration when the bind button is pressed.
     * If one of the values is 0, then use 1:1 as the ratio;
     */
    handleRatioAction: {
        value: function() {
            if(this.bindButton.pressed) {
                this.aspectRatioWidth = this.heightControl.value / this.widthControl.value;
                if(isNaN(this.aspectRatioWidth) || !isFinite(this.aspectRatioWidth) || this.aspectRatioWidth === 0) this.aspectRatioWidth = 1;

                this.aspectRatioHeight = this.widthControl.value / this.heightControl.value;
                if(isNaN(this.aspectRatioHeight) || !isFinite(this.aspectRatioHeight) || this.aspectRatioHeight === 0) this.aspectRatioHeight = 1;
            } else {
                this.aspectRatioWidth = 1;
                this.aspectRatioHeight = 1;
            }
        }
    },

    handleLeftChange: {
        value: function(event) {
            var prevPosition;

            if(!event.wasSetByCode) {
                if(this.savedPosition) prevPosition = [this.savedPosition + "px"];

                this.application.ninja.elementMediator.setProperty(this.application.ninja.selectedElements, "left", [this.leftControl.value + this.leftControl.units] , "Change", "pi", prevPosition);
                this.savedPosition = null;
            }
        }
    },

    handleTopChange: {
        value: function(event) {
            var prevPosition;

            if(!event.wasSetByCode) {
                if(this.savedPosition) prevPosition = [this.savedPosition + "px"];

                this.application.ninja.elementMediator.setProperty(this.application.ninja.selectedElements, "top", [this.topControl.value + this.topControl.units] , "Change", "pi", prevPosition);
                this.savedPosition = null;
            }
        }
    },

    handleHeightChange: {
        value: function(event) {
            var prevPosition, items;

            if(!event.wasSetByCode) {
                if(this.savedPosition) prevPosition = [this.savedPosition];

                this.application.ninja.selectedElements.length ? items = this.application.ninja.selectedElements : items = [this.application.ninja.currentDocument.model.documentRoot];

                if(this.bindButton.pressed) {

                    var newWidth = Math.round(this.aspectRatioHeight * this.heightControl.value);

                    if(!isFinite(newWidth)) newWidth = this.heightControl.value;

                    this.widthControl.value = newWidth;
                    this.application.ninja.elementMediator.setProperty(items, "width", [newWidth + "px"] , "Change", "pi");
                }

                this.application.ninja.elementMediator.setProperty(items, "height", [this.heightControl.value + this.heightControl.units] , "Change", "pi", prevPosition);
                this.savedPosition = null;
            }
        }
    },

    handleWidthChange: {
        value: function(event) {
            var prevPosition, items;

            if(!event.wasSetByCode) {
                if(this.savedPosition) prevPosition = [this.savedPosition];

                this.application.ninja.selectedElements.length ? items = this.application.ninja.selectedElements : items = [this.application.ninja.currentDocument.model.documentRoot];

                if(this.bindButton.pressed) {

                    var newHeight = Math.round(this.aspectRatioWidth * this.widthControl.value);

                    if(!isFinite(newHeight)) newHeight = this.widthControl.value;

                    this.heightControl.value = newHeight;
                    this.application.ninja.elementMediator.setProperty(items, "height", [newHeight + "px"] , "Change", "pi");

                }

                this.application.ninja.elementMediator.setProperty(items, "width", [this.widthControl.value + this.widthControl.units] , "Change", "pi", prevPosition);
                this.savedPosition = null;

            }

        }
    },

    handleLeftChanging: {
        value: function(event) {
            if(!event.wasSetByCode) {
                if(!this.savedPosition) this.savedPosition = this.leftPosition;
                this.application.ninja.elementMediator.setProperty(this.application.ninja.selectedElements, "left", [this.leftControl.value + this.leftControl.units] , "Changing", "pi");
            }

        }
    },

    handleTopChanging: {
        value: function(event) {
            if(!event.wasSetByCode) {
                if(!this.savedPosition) this.savedPosition = this.topPosition;
                this.application.ninja.elementMediator.setProperty(this.application.ninja.selectedElements, "top", [this.topControl.value + this.topControl.units] , "Changing", "pi");
            }

        }
    },

    handleHeightChanging: {
        value: function(event) {
            var items;
            if(!event.wasSetByCode) {

                if(!this.savedPosition) this.savedPosition = this.heightSize + " " + this.heightUnits;

                this.application.ninja.selectedElements.length ? items = this.application.ninja.selectedElements : items = [this.application.ninja.currentDocument.model.documentRoot];

                if(this.bindButton.pressed) {

                    var newWidth = Math.round(this.aspectRatioHeight * this.heightControl.value);

                    if(!isFinite(newWidth)) newWidth = this.heightControl.value;

                    this.widthControl.value = newWidth;
                    this.application.ninja.elementMediator.setProperty(items, "width", [newWidth + "px"] , "Changing", "pi");
                }

                this.application.ninja.elementMediator.setProperty(items, "height", [this.heightSize + this.heightUnits] , "Changing", "pi");

            }
        }
    },

    handleWidthChanging: {
        value: function(event) {
            var items;
            if(!event.wasSetByCode) {

                if(!this.savedPosition) this.savedPosition = this.widthSize + " " + this.widthUnits;

                this.application.ninja.selectedElements.length ? items = this.application.ninja.selectedElements : items = [this.application.ninja.currentDocument.model.documentRoot];

                if(this.bindButton.pressed) {
                    var newHeight = Math.round(this.aspectRatioWidth * this.widthControl.value);

                    if(!isFinite(newHeight)) newHeight = this.widthControl.value;

                    this.heightControl.value = newHeight;
                    this.application.ninja.elementMediator.setProperty(items, "height", [newHeight + "px"] , "Changing", "pi");
                }

                this.application.ninja.elementMediator.setProperty(items, "width", [this.widthSize + this.widthUnits] , "Changing", "pi");
            }
        }
    }


});
