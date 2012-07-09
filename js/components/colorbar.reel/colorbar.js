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

////////////////////////////////////////////////////////////////////////
//
var Montage =           require("montage/core/core").Montage,
    Component =         require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//Exporting as ColorBar
exports.ColorBar = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //No reel needed since it's just a bar component
    hasTemplate: {
        value: true
    },
    ////////////////////////////////////////////////////////////////////
    //Width of spectrum (not including b/w buttons)
    _colorBarSpectrumWidth: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //Width of spectrum steps (used to calculate size of B/W buttons)
    _colorBarSpectrumWidthSteps: {
        value: 10
    },
    ////////////////////////////////////////////////////////////////////
    //Default value
    _value: {
        value: {h: 0, s: 0, v: 0}
    },
    ////////////////////////////////////////////////////////////////////
    //HSV Value selected from bar
    value: {
        get: function() {return this._value;},
        set: function(value) {
            if (value) {
                //Checking for limits (Max and Min HSV values)
                if (value.h > Math.PI*2) {
                    value.h = Math.PI*2;
                } else if (value.h < 0) {
                    value.h = 0;
                }
                //
                if (value.s > 1) {
                    value.s = 1;
                } else if (value.s < 0) {
                    value.s = 0;
                }
                //
                if (value.v > 1) {
                    value.v = 1;
                } else if (value.v < 0) {
                    value.v = 0;
                }
                //Setting value
                this._value = value;
                //
                if (!this._isMouseDown) {
                    this._dispatchActionEvent('change', true);
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    prepareForDraw: {
        value: function() {
            //Nothing
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Setting up and drawing canvas to object
    willDraw: {
        value: function() {
            //Setting the width and height of the canvas to match container
            this.element.width = parseInt(window.getComputedStyle(this.element, null).width);
            this.element.height = parseInt(window.getComputedStyle(this.element, null).height);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    draw: {
        value: function () {
            //Local variables
            var cb_canvas = this.element, cb_ctx, cb_grdnt, cb_slc, cb_gwidth, PI = Math.PI, i;
            //calculating width of spectrum (remainder is used for B/W buttons)
            cb_gwidth = Math.round(cb_canvas.width - cb_canvas.width/this._colorBarSpectrumWidthSteps);
            //Context and Gradient
            cb_ctx = cb_canvas.getContext('2d');
            cb_grdnt = cb_ctx.createLinearGradient(0, cb_canvas.height, cb_gwidth, cb_canvas.height);
            ////////////////////////////////////////////////////////
            //Looping through set intervals (Creating spectrum)
            for (i=0; i<60; i++) {
                //Calculating slice number
                cb_slc = Math.round(255*i/60);
                //Creating gradient slices (6 colors in color theory)
                cb_grdnt.addColorStop(i/360, 'rgb(255, '+cb_slc+', 0)');
                cb_grdnt.addColorStop((i+60)/360, 'rgb('+(255-cb_slc)+', 255, 0)');
                cb_grdnt.addColorStop((i+120)/360, 'rgb(0, 255, '+cb_slc+')');
                cb_grdnt.addColorStop((i+180)/360, 'rgb(0, '+(255-cb_slc)+', 255)');
                cb_grdnt.addColorStop((i+240)/360, 'rgb('+cb_slc+', 0, 255)');
                cb_grdnt.addColorStop((i+300)/360, 'rgb(255, 0,'+(255-cb_slc)+')');
            }
            //Adding Color Bar to the canvas (Gradients)
            cb_ctx.fillStyle = cb_grdnt;
            cb_ctx.fillRect(0, 0, cb_gwidth, cb_canvas.height);
            ////////////////////////////////////////////////////////
            //White Gradient overlay to simulate L
            cb_grdnt = cb_ctx.createLinearGradient(0, 0, 0, cb_canvas.height);
            cb_grdnt.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
            cb_grdnt.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
            cb_ctx.fillStyle = cb_grdnt;
            cb_ctx.fillRect(0, 0, cb_gwidth, cb_canvas.height);
            //Black Gradient overlay to simulate S
            cb_grdnt = cb_ctx.createLinearGradient(0,0,0,cb_canvas.height);
            cb_grdnt.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
            cb_grdnt.addColorStop(1.0, 'rgba(0, 0, 0, 1)');
            cb_ctx.fillStyle = cb_grdnt;
            cb_ctx.fillRect(0, 0, cb_gwidth, cb_canvas.height);
            //Black "button"
            cb_ctx.fillStyle = "#000";
            cb_ctx.fillRect(cb_gwidth, cb_canvas.height/2, cb_gwidth, cb_canvas.height/2);
            //Black line divider
            cb_ctx.fillStyle = "#000";
            cb_ctx.fillRect(cb_gwidth-1, 0, cb_gwidth+1, cb_canvas.height);
            //White "button"
            cb_ctx.fillStyle = "#FFF";
            cb_ctx.fillRect(cb_gwidth, 0, cb_gwidth, cb_canvas.height/2);
            //Saving
            cb_ctx.restore();
            cb_ctx.save();
            //Cleaning up
            cb_canvas = cb_ctx = cb_grdnt = cb_slc = cb_gwidth = PI = i = null;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Adding ColorBar to the element
    didDraw: {
        value: function() {
            //Adding functionality via events
            this.element.addEventListener("mousedown", this, false);
            this.element.addEventListener("mouseover", this, false);
            this.element.addEventListener("mousemove", this, false);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Mouse Down (adds other events and updates HSV)
    handleMousedown: {
        value: function (e) {
            if (!this._colorBarSpectrumWidth)
                this._colorBarSpectrumWidth = (this.element.width - this.element.width/this._colorBarSpectrumWidthSteps)-1;
            this._isMouseDown = true;
            document.addEventListener("mouseup", this, false);
            this._updateHsv(e);
         }
    },
    ////////////////////////////////////////////////////////////////////
    //Used to check mouse mode and display cursor
    _isMouseDown: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //Mouse Move (updates HSV)
    handleMousemove: {
        value: function (e) {
            //Changing cursors style for appropiate user feedback
            if (e.offsetX > this._colorBarSpectrumWidth) {this.element.style.cursor = 'pointer';}
            else {this.element.style.cursor = 'crosshair';}
            //Checking for mouse down to scan for color
            if (this._isMouseDown) {this._updateHsv(e);}
         }
    },
    ////////////////////////////////////////////////////////////////////
    //Mouse Up (Removes events)
    handleMouseup: {
        value: function (e) {
            this._isMouseDown = false;
            document.removeEventListener("mouseup", this, false);
            this._dispatchActionEvent('change', false);
         }
    },
    ////////////////////////////////////////////////////////////////////
    //Updating HSV values
    _updateHsv: {
        value: function (e) {
            if (e.offsetX > this._colorBarSpectrumWidth) {
                //Faking button functionality - Simple B/W selection
                if (e.offsetY >= this.element.offsetHeight/2) { this.value = {h: this.value.h, s: 1, v: 0};} // White
                else { this.value = {h: this.value.h, s: 0, v: 1};} // Black
            } else {
                //Checking for S or V to be applied (no mixing on bar)
                if (e.offsetY >= this.element.offsetHeight/2) { //Saturation
                    this.value = {h: e.offsetX/this._colorBarSpectrumWidth*Math.PI*2, v: 1-(e.offsetY-this.element.offsetHeight/2)/((this.element.offsetHeight/2-1)), s: 1};
                } else { //Vibrance
                    this.value = {h: e.offsetX/this._colorBarSpectrumWidth*Math.PI*2, v: 1, s: (e.offsetY)/((this.element.offsetHeight/2))};
                }
            }
            //
            this._dispatchActionEvent('changing', false);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Dispatching "Change" event
    _dispatchActionEvent: {
        value: function(type, userInitiated) {
            var actionEvent = document.createEvent("CustomEvent");
            actionEvent.initEvent(type, true, true);
            actionEvent.type = type;
            actionEvent.wasSetByCode = userInitiated;
            actionEvent.hsv = this.value;
            this.dispatchEvent(actionEvent);
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
