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
var Montage =   require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//Exporting as ColorWheel
exports.GradientPicker = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //
    hasTemplate: {
        value: true
    },
    ////////////////////////////////////////////////////////////////////
    //
    _updating: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    _value: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    value: {
        get: function() {return this._value;},
        set: function(value) {this._value = value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _mode: {
        value: 'linear'
    },
    ////////////////////////////////////////////////////////////////////
    //
    mode: {
        get: function() {return this._mode;},
        set: function(value) {
            //
            this.application.ninja.colorController.colorPopupManager.hideGradientChipPopup();
            //
            this._mode = value;
            //
            this._dispatchEvent('change', false);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _trackData: {
        value: {width: 0, x: 0, y: 0}
    },
    ////////////////////////////////////////////////////////////////////
    //
    prepareForDraw: {
        value: function() {
            //
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    willDraw: {
        value: function() {
            //Getting component views from layout
            this._trackData.width = parseInt(getComputedStyle(this.trackChips).getPropertyCSSValue('width').cssText);
            //TODO: Fix events and remove this hack
            this.trackCover.addEventListener('mouseover', function () {
                if (!this._updating) {
                    this.trackCover.style.display = 'none';
                }
            }.bind(this), true);
            //
            this.radioLinear.addEventListener('change', function (e){
                this.mode = 'linear';
            }.bind(this), true);
            //
            this.radioRadial.addEventListener('change', function (e){
                this.mode = 'radial';
            }.bind(this), true);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    draw: {
        value: function() {
            //Checking for mode to assign radio value
            if (this.mode === 'linear') {
                this.radioLinear.checked = 'true';
            } else if (this.mode === 'radial') {
                this.radioRadial.checked = 'true';
            }
            //Checkign for value to initialize stops
            if (!this.value) {
                this.addDefaultStops();
            } else {
                //Adding stops from preset value
                for (var i=0, stops = this.value; stops[i]; i++) {
                    this.addStop({color: {mode: stops[i].mode, value: stops[i].value}, percent:stops[i].position}, true);
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    didDraw: {
        value: function() {
            //Adding event listener for stops
            this.trackMain.addEventListener('click', this, false);
            //Getting position of track
            var point = webkitConvertPointFromNodeToPage(this.trackMain, new WebKitPoint(0, 0));
            //Setting position of track to calculate movement
            this._trackData.x = point.x;
            this._trackData.y = point.y;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Default stops funtion (reset)
    addDefaultStops: {
        value: function() {
            this.addStop({color: {mode: 'rgb', value: {r: 255, g: 255, b: 255, a: 1, css: 'rgb(255, 255, 255)'}}, percent: 0}, true);
            this.addStop({color: {mode: 'rgb', value: {r: 0, g: 0, b: 0, a: 1, css: 'rgb(0, 0, 0)'}}, percent: 100}, true);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    addStop: {
        value: function(data, silent) {
            if (this.application.ninja.colorController.colorPopupManager) {
                //Hiding any open popups (of gradient buttons)
                this.application.ninja.colorController.colorPopupManager.hideGradientChipPopup();
                //Creating stop elements
                var stop = document.createElement('div'),
                    holder = document.createElement('div'),
                    tooltip = document.createElement('span'),
                    button = document.createElement('button');
                //Setting up elements
                stop.appendChild(tooltip);
                stop.appendChild(holder);
                holder.appendChild(button);
                //Adding events to the stops
                stop.addEventListener('mousedown', this, false);
                stop.addEventListener('mouseup', this, false);
                //Storing refereces to buttons and actual stop container
                button.stop = stop;
                tooltip.stop = stop;
				holder.stop = stop;
                stop.button = button;
                //Adding stop to container
                this.trackChips.appendChild(stop);
                //Checking for bounds to add stop
                if (data.percent >= 0 && data.percent <= 100) {
                    this.positionStop(stop, data.percent);
                    button.stopPosition = data.percent;
                }
                //Creating an instance of input chip
                this.application.ninja.colorController.addButton('chip', button);
                //Initialing button with color data
                button.color(data.color.mode, data.color.value);
                //Button popup data
                button.props = {side: 'top', align: 'center', nocolor: false, wheel: true, palette: false, gradient: false, image: false, offset: -84, gradientPopup: true, history: false};
                //Listening for color events from button
                button.addEventListener('change', this, false);
                //Dispatching event depending on type of mode
                if (!silent) {
                    this._dispatchEvent('change', false);
                } else {
                    this._dispatchEvent('change', true);
                }
                //
            } else {
                    //Handle Error
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    removeStop: {
        value: function(stop) {
            var i, buttons = this.trackChips.getElementsByTagName('button');
            //
            if (buttons.length > 2) {
                //Removing stops
                this.trackChips.removeChild(stop);
                //Stopping events related to this current stop
                this.removeStopMoving();
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    removeStopMoving: {
        value: function() {
            this._updating = false;
            this.trackCover.style.display = 'none';
            this._dispatchEvent('change', false);
            document.removeEventListener('mousemove', this, false);
            document.removeEventListener('mouseup', this, false);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    positionStop: {
        value: function(stop, percent) {
            try {
                if (percent<0) {
                    percent = 0;
                } else if (percent>100) {
                    percent = 100;
                }
                //
                var adj = (parseInt(getComputedStyle(stop).getPropertyCSSValue('width').cssText)*percent/100)/this._trackData.width;
                stop.style.left = Math.round(percent-Math.round(adj*100))+'%';
                stop.button.stopPosition = percent;
            } catch (e) {
                //TEMP
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //TODO: Add color detection canvas to get actual color
    handleClick: {
        value: function(e) {
            //Logic to get color from canvas data would go here
            var data = {};
            data.mode = 'rgb';
            data.value = {r: 100, g: 100, b: 100, a: 1, css: 'rgb(100, 100, 100)'};
            //
            this.addStop({color: data, percent: Math.round(100*(e._event.offsetX/e._event.target.offsetWidth))});
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleMouseup: {
        value: function(e) {
            this.removeStopMoving();
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleMousedown: {
        value: function(e) {
            //
            var i, buttons = this.trackChips.getElementsByTagName('button');
            this.currentStop = e._event.target.stop;
            //Looping through other stops to swap depths
            for (i=0; buttons[i]; i++) {
                buttons[i].stop.style.zIndex = 1;
            }
            //Setting the depth of the current button to the highest
            this.currentStop.style.zIndex = buttons.length+1;
            //Adding events for actions while moving
            document.addEventListener('mousemove', this, false);
            document.addEventListener('mouseup', this, false);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleMousemove: {
        value: function(e) {
            //
            this._updating = true;
            //
            this.application.ninja.colorController.colorPopupManager.hideGradientChipPopup();
            //
            if (e._event.y > this._trackData.y+70 || e._event.y < this._trackData.y) {
                this.removeStop(this.currentStop);
            }
            //
            if (this.currentStop.button.stopPosition !== Math.round((e._event.x-this._trackData.x)/this._trackData.width*100)) {
                this.trackCover.style.display = 'block';
            }
            //
            this.positionStop(this.currentStop, Math.round((e._event.x-this._trackData.x)/this._trackData.width*100));
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleChange: {
        value: function(e) {
            this.application.ninja.colorController.colorView.colorManager.input = this.application.ninja.colorController.colorView.previousInput;
            this._dispatchEvent('change', false);
            this.application.ninja.colorController.colorView.colorManager.input = 'chip';
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Dispatching custom event
    _dispatchEvent: {
        value: function(type, userInitiated) {
            //
            var actionEvent = document.createEvent("CustomEvent"), buttons = this.trackChips.getElementsByTagName('button'), stops = [], css, previewCss = '-webkit-gradient(linear, left top, right top';
            //Preventing an events of less than 2 stops since there'll be a reset
            if (buttons.length < 2) {
                return;
            }
            //Initializing CSS string
            if (this.mode === 'radial') {
                css = '-webkit-radial-gradient(center, ellipse cover';
            } else {
                css = '-webkit-gradient(linear, left top, right top';
            }
            //Creating stops array
            for (var i=0; i < buttons.length; i++) {
                stops.push({value: buttons[i].colorValue, mode: buttons[i].colorMode, position: buttons[i].stopPosition});
            }
            //Sorting array (must be sorted for radial gradients, at least in Chrome
            stops.sort(function(a,b){return a.position - b.position});
            //Looping through stops in gradient to create CSS (actual and preview)
            for (var i=0; i < stops.length; i++) {
                //Addint to CSS String
                if (this.mode === 'radial' && stops[i].value) {
                    css += ', '+stops[i].value.css+' '+stops[i].position+'% ';
                    //The CSS string for the preview bar is always linear
                    previewCss += ', color-stop('+stops[i].position+'%,'+stops[i].value.css+')';
                } else if (stops[i].value){
                    css += ', color-stop('+stops[i].position+'%,'+stops[i].value.css+')';
                    //The CSS string for the preview bar is always linear
                    previewCss += ', color-stop('+stops[i].position+'%,'+stops[i].value.css+')';
                } else {
                    //
                }
            }
            //Closing the CSS strings
            css += ')';
            previewCss += ')';
            //console.log(previewCss);
            //Setting the preview track background
            this.trackMain.style.background = previewCss;
            //Storing the stops
            this.value = stops;
            //Initializing and storing data for event
            actionEvent.initEvent(type, true, true);
            actionEvent.type = type;
            actionEvent.wasSetByCode = userInitiated;
            actionEvent.gradient = {stops: this.value, mode: this.mode, gradientMode: this.mode, css: css};
            this.dispatchEvent(actionEvent);
        }
    }
    ////////////////////////////////////////////////////////////////////
});
