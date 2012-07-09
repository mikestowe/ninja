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
    Component =         require("montage/ui/component").Component,
    ColorPanelPopup =   require("js/panels/Color/colorpanelpopup.reel").ColorPanelPopup,
    ColorModel =        require("js/models/color-model").ColorModel;
////////////////////////////////////////////////////////////////////////
//Exporting as ColorPopupManager
exports.ColorPopupManager = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //
    hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    _hasCloseEvents: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    addCloseEvents: {
        value: function () {
            //
            this._hasCloseEvents = true;
            ////////////////////////////////////////////////////////////
            //Closing popups on resize
            window.addEventListener('resize', this, false);
            //Closing popups if outside limits
            document.addEventListener('mousedown', this, false);
            ////////////////////////////////////////////////////////////
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    removeCloseEvents: {
        value: function () {
            //
            this._hasCloseEvents = false;
            ////////////////////////////////////////////////////////////
            //Closing popups on resize
            window.removeEventListener('resize', this, false);
            //Closing popups if outside limits
            document.removeEventListener('mousedown', this, false);
            ////////////////////////////////////////////////////////////
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleMousedown: {
        value: function (e) {
            //
            this.closeAllPopups(e);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleResize: {
        value: function (e) {
            //
            this.hideColorPopup();
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    closeAllPopups: {
        value: function (e) {
            //
            if (this._popupBase && !this._popupChipBase && !this._popupGradientChipBase) {
                if(!this.popupHitCheck(this._popupBase, e)) {
                    this.hideColorPopup();
                }
            } else if (!this._popupBase && this._popupChipBase && !this._popupGradientChipBase) {
                if(!this.popupHitCheck(this._popupChipBase, e)) {
                    this.hideColorChipPopup();
                }
            } else if (this._popupBase && this._popupChipBase && !this._popupGradientChipBase) {
                if(!this.popupHitCheck(this._popupBase, e) && !this.popupHitCheck(this._popupChipBase, e)) {
                    this.hideColorPopup();
                }
            } else if (this._popupBase && this._popupChipBase && this._popupGradientChipBase) {
                if(!this.popupHitCheck(this._popupBase, e) && !this.popupHitCheck(this._popupChipBase, e) && !this.popupHitCheck(this._popupGradientChipBase, e)) {
                    this.hideColorPopup();
                }
            } else if (!this._popupBase && this._popupChipBase && this._popupGradientChipBase) {
                if(!this.popupHitCheck(this._popupChipBase, e) && !this.popupHitCheck(this._popupGradientChipBase, e)) {
                    this.hideColorChipPopup();
                }
            } else if (this._popupBase && !this._popupChipBase && this._popupGradientChipBase) {
                if(!this.popupHitCheck(this._popupBase, e) && !this.popupHitCheck(this._popupGradientChipBase, e)) {
                    this.hideColorPopup();
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    popupHitCheck: {
        value: function (element, e) {
            //Prevent any action for button to handle toggling
            if (e._event.target.inputType || e._event.target.colorMode) return true;
            //Storing limits of popup
            var top, bottom, left, right;
            //Checking for popup to be opened otherwise nothing happens
            if (element && element.opened && element.popup && element.popup.element) {
                //Getting horizontal limits
                left = parseInt(element.popup.element.style.left) + parseInt(element.popup.element.style.marginLeft);
                right = left + parseInt(element.popup.element.offsetWidth);
                //Getting vertical limits
                top = parseInt(element.popup.element.style.top) + parseInt(element.popup.element.style.marginTop);
                bottom = top + parseInt(element.popup.element.offsetHeight);
                //Checking click position in relation to limits
                if ((e._event.clientX < left || e._event.clientX > right) || (e._event.clientY < top || e._event.clientY > bottom)) {
                    //Hides popups since click is outside limits
                    return false;
                } else {
                    //Keeps popup open since click inside area
                    return true;
                }
            } else {
                //Hides popups since element not detected
                return false;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _popupBase: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _popupChipBase: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _popupChipBtn: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _popupGradientChipBase: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _popupGradientChipBtn: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //Storing color manager
    _colorManager: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorManager: {
        get: function() {return this._colorManager;},
        set: function(value) {this._colorManager = value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _colorPopupDrawing: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    _colorChipPopupDrawing: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    _colorGradientPopupDrawing: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //TODO: Remove and use montage's built in component
    showColorPopup: {
        value: function (x, y, side, align) {
            //Check to see if popup is drawing, avoids errors
            if (this._colorPopupDrawing) {
                return;
            }
            //Check for toggling view
            if (this._popupBase && this._popupBase.opened) {
                //Toogles if called and opened
                this.hideColorPopup();
                return;
            } else {
                this._colorPopupDrawing = true;
                ////////////////////////////////////////////////////
                //Initializing events
                if (!this._hasCloseEvents) {
                    this.addCloseEvents();
                }
                ////////////////////////////////////////////////////
                //Creating popup
                var popup = document.createElement('div');
                document.body.appendChild(popup);
                //
                this._popupBase = ColorPanelPopup.create();
                this._popupBase.element = popup;
                this._popupBase.props = {x: x, y: y, side: side, align: align, wheel: true, palette: true, gradient: true, image: true, nocolor: true, history: true, panel: true};
                this._popupBase.colorManager = this.colorManager;
                //
                this._popupBase.addEventListener('change', this, false);
                this._popupBase.addEventListener('changing', this, false);
                //
                this._popupBase.needsDraw = true;
                this._popupBase.addEventListener('firstDraw', this, false);
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    hideColorPopup: {
        value: function () {
            if (this._popupBase && this._popupBase.opened) {
                //
                this._popupBase.popup.removeEventListener('didDraw', this, false);
                //
                this.removeCloseEvents();
                this.hideColorChipPopup();
                this.hideGradientChipPopup();
                //Making sure to return color manager to either stroke or fill (might be a Hack for now)
                if (this.colorManager.input !== 'stroke' && this.colorManager.input !== 'fill' && this.application.ninja.colorController.colorView.previousInput) {
                    this.colorManager.input = this.application.ninja.colorController.colorView.previousInput;
                }
                //
                this.application.ninja.popupManager.removePopup(this._popupBase.popup.element);
                this._popupBase.opened = false;
                //TODO: Fix HACK of removing popup
                this._popupBase.popup.base.destroy();
                this._popupBase.popup = null;
            } else if (this._popupChipBase && this._popupChipBase.opened) {
                this.hideColorChipPopup();
                //Making sure to return color manager to either stroke or fill (might be a Hack for now)
                if (this.colorManager.input !== 'stroke' && this.colorManager.input !== 'fill' && this.application.ninja.colorController.colorView.previousInput) {
                    this.colorManager.input = this.application.ninja.colorController.colorView.previousInput;
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorChipChange: {
        value: function (e) {
            //
            if (!this._popupChipBtn) return;
            //
            var ctx,
                cvs = this._popupChipBtn.getElementsByTagName('canvas')[0],
                rgb = this._popupChipBase.colorManager.rgb,
                hsl = this._popupChipBase.colorManager.hsl,
                alpha = this._popupChipBase.colorManager.alpha.value || this._popupChipBase.colorManager.alpha;
            //
            this._popupChipBase._components.hex.value = this._popupChipBase.colorManager.hex;
            //
            if (cvs) {
                ctx = cvs.getContext('2d');
                ctx.clearRect(0, 0, cvs.width, cvs.height);
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#666";
                ctx.moveTo(0, 0);
                ctx.lineTo(cvs.width, 0);
                ctx.lineTo(cvs.width, cvs.height);
                ctx.lineTo(0, cvs.height);
                ctx.lineTo(0, 0);
                ctx.stroke();
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#333";
                ctx.moveTo(2, 2);
                ctx.lineTo(cvs.width-2, 2);
                ctx.lineTo(cvs.width-2, cvs.height-2);
                ctx.lineTo(2, cvs.height-2);
                ctx.lineTo(2, 1);
                ctx.stroke();
            }
            //
            if (rgb) {
                if (alpha) {
                    this._popupChipBtn.color('rgb', {r: rgb.r, g: rgb.g, b: rgb.b, a: alpha, css: 'rgba('+rgb.r+', '+rgb.g+', '+rgb.b+', '+alpha+')'});
                } else {
                    this._popupChipBtn.color('rgb', {r: rgb.r, g: rgb.g, b: rgb.b, a: 1, css: 'rgba('+rgb.r+', '+rgb.g+', '+rgb.b+', 1)'});
                }
            } else if (!(e._event.mode && e._event.mode === 'nocolor')) {
                if (alpha) {
                    this._popupChipBtn.color('rgb', {r: 255, g: 255, b: 255, a: alpha, css: 'rgba(255, 255, 255, '+alpha+')'});
                } else {
                    this._popupChipBtn.color('rgb', {r: 255, g: 255, b: 255, a: 1, css: 'rgba(255, 255, 255, 1)'});
                }
            } else {
                this._popupChipBtn.color('nocolor', null);
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorGradientChipChange: {
        value: function (e) {
            //
            if (!this._popupGradientChipBtn) return;
            //
            var ctx,
                cvs = this._popupGradientChipBtn.getElementsByTagName('canvas')[0],
                rgb = this._popupGradientChipBase.colorManager.rgb,
                hsl = this._popupGradientChipBase.colorManager.hsl,
                alpha = this._popupGradientChipBase.colorManager.alpha.value || this._popupGradientChipBase.colorManager.alpha;
            //
            this._popupGradientChipBase._components.hex.value = this._popupGradientChipBase.colorManager.hex;
            //
            if (cvs) {
                ctx = cvs.getContext('2d');
                ctx.clearRect(0, 0, cvs.width, cvs.height);
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#666";
                ctx.moveTo(0, 0);
                ctx.lineTo(cvs.width, 0);
                ctx.lineTo(cvs.width, cvs.height);
                ctx.lineTo(0, cvs.height);
                ctx.lineTo(0, 0);
                ctx.stroke();
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#333";
                ctx.moveTo(2, 2);
                ctx.lineTo(cvs.width-2, 2);
                ctx.lineTo(cvs.width-2, cvs.height-2);
                ctx.lineTo(2, cvs.height-2);
                ctx.lineTo(2, 1);
                ctx.stroke();
            }
            //
            if (rgb) {
                if (alpha) {
                    this._popupGradientChipBtn.color('rgb', {r: rgb.r, g: rgb.g, b: rgb.b, a: alpha, css: 'rgba('+rgb.r+', '+rgb.g+', '+rgb.b+', '+alpha+')'});
                } else {
                    this._popupGradientChipBtn.color('rgb', {r: rgb.r, g: rgb.g, b: rgb.b, a: 1, css: 'rgba('+rgb.r+', '+rgb.g+', '+rgb.b+', 1)'});
                }
            } else {
                if (alpha) {
                    this._popupGradientChipBtn.color('rgb', {r: 255, g: 255, b: 255, a: alpha, css: 'rgba(255, 255, 255, '+alpha+')'});
                } else {
                    this._popupGradientChipBtn.color('rgb', {r: 255, g: 255, b: 255, a: 1, css: 'rgba(255, 255, 255, 1)'});
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    showColorChipPopup: {
        value: function (e) {
            if (this._colorChipPopupDrawing) {
                return;
            }
            if (this._popupChipBase && this._popupChipBase.opened && (!this._popupChipBase.props || (this._popupChipBase.props && !this._popupChipBase.props.gradientPopup)) && !e._event.srcElement.props.gradientPopup) {
                //Toogles if called and opened
                this.hideColorChipPopup();
                return;
            } else {
                //
                if (e._event.srcElement.props.gradientPopup) {
                    this.showGradientChipPopup(e);
                    return;
                }
                //Hidding other popup if opened
                if (this._popupBase && this._popupBase.opened) {
                    this.hideColorPopup();
                    return;
                }
                //
                this._popupChipBtn = this.application.ninja.colorController.colorView.currentChip;
                //
                this._colorChipPopupDrawing = true;
                ////////////////////////////////////////////////////
                //Initializing events
                if (!this._hasCloseEvents) {
                    this.addCloseEvents();
                }
                ////////////////////////////////////////////////////
                //Creating popup
                var popup = document.createElement('div');
                document.body.appendChild(popup);
                //
                this._popupChipBase = ColorPanelPopup.create();
                this._popupChipBase.element = popup;
                this._popupChipBase.isPopupChip = true;
                if (e._event.srcElement.props) {
                    this._popupChipBase.props = e._event.srcElement.props;
                } else {
                    this._popupChipBase.props = {side: 'top', align: 'center', wheel: true, palette: true, gradient: false, image: false, nocolor: true, history: false};
                }
                //
                if (this._popupChipBase.props.offset) {
                    this._popupChipBase.props.x = (e._event.clientX - e._event.offsetX + this._popupChipBase.props.offset)+'px';
                    this._popupChipBase.props.y = (e._event.target.clientHeight/2+e._event.clientY - e._event.offsetY)+'px';
                } else {
                    this._popupChipBase.props.x = (e._event.clientX - e._event.offsetX)+'px';
                    this._popupChipBase.props.y = (e._event.target.clientHeight/2+e._event.clientY - e._event.offsetY)+'px';
                }
                //
                this._popupChipBase.props.source = e._event.srcElement;
                //
                this._popupChipBase.colorManager = ColorModel.create();
                this._popupChipBase.colorManager.input = 'chip';
                this._popupChipBase.colorManager.alpha = 1;
                //
                if (e._event.srcElement.colorMode === 'gradient'){
                    this._popupChipBase.colorManager.gradient = {value: e._event.srcElement.colorValue};
                } else {
                    this._popupChipBase.colorManager.gradient = null;
                }
                //
                this._popupChipBase.addEventListener('change', this, false);
                this._popupChipBase.addEventListener('changing', this, false);
                //
                this._popupChipBase.needsDraw = true;
                this._popupChipBase.addEventListener('firstDraw', this, false);
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    hideColorChipPopup: {
        value: function () {
            //
            if (this._popupChipBase && this._popupChipBase.opened) {
                //
                this.removeCloseEvents();
                this.hideGradientChipPopup();
                //
                this._popupChipBase.popup.removeEventListener('didDraw', this, false);
                //Making sure to return color manager to either stroke or fill (might be a Hack for now)
                if (this.colorManager.input !== 'stroke' && this.colorManager.input !== 'fill' && this.application.ninja.colorController.colorView.previousInput) {
                    this.colorManager.input = this.application.ninja.colorController.colorView.previousInput;
                }
                //
                this.application.ninja.popupManager.removePopup(this._popupChipBase.popup.element);
                this._popupChipBase.opened = false;
                //TODO: Fix HACK of removing popup
                this._popupChipBase.popup.base.destroy();
                this._popupChipBase.popup = null;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    showGradientChipPopup: {
        value: function (e) {
            if (this._colorGradientPopupDrawing) {
                return;
            }
            if (this._popupGradientChipBase && this._popupGradientChipBase.opened) {
                //Toogles if called and opened
                this.hideGradientChipPopup();
                return;
            } else {
                //
                this._popupGradientChipBtn = this.application.ninja.colorController.colorView.currentChip;
                //
                this._colorGradientPopupDrawing = true;
                ////////////////////////////////////////////////////
                //Initializing events
                if (!this._hasCloseEvents) {
                    this.addCloseEvents();
                }
                ////////////////////////////////////////////////////
                //Creating popup
                var popup = document.createElement('div');
                document.body.appendChild(popup);
                //
                this._popupGradientChipBase = ColorPanelPopup.create();
                this._popupGradientChipBase.element = popup;
                this._popupGradientChipBase.isPopupChip = true;
                if (e._event.srcElement.props) {
                    this._popupGradientChipBase.props = e._event.srcElement.props;
                } else {
                    this._popupGradientChipBase.props = {side: 'top', align: 'center', wheel: true, palette: true, gradient: false, image: false, nocolor: false, history: false};
                }
                //
                if (this._popupGradientChipBase.props.offset) {
                    this._popupGradientChipBase.props.x = (e._event.clientX - e._event.offsetX + this._popupGradientChipBase.props.offset)+'px';
                    this._popupGradientChipBase.props.y = (e._event.target.clientHeight/2+e._event.clientY - e._event.offsetY)+'px';
                } else {
                    this._popupGradientChipBase.props.x = (e._event.clientX - e._event.offsetX)+'px';
                    this._popupGradientChipBase.props.y = (e._event.target.clientHeight/2+e._event.clientY - e._event.offsetY)+'px';
                }
                //
                this._popupGradientChipBase.props.source = e._event.srcElement;
                //
                this._popupGradientChipBase.colorManager = ColorModel.create();
                this._popupGradientChipBase.colorManager.input = 'chip';
                this._popupGradientChipBase.colorManager.alpha = 1;
                //
                this._popupGradientChipBase.addEventListener('change', this, false);
                this._popupGradientChipBase.addEventListener('changing', this, false);
                //
                this._popupGradientChipBase.needsDraw = true;
                this._popupGradientChipBase.addEventListener('firstDraw', this, false);
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    hideGradientChipPopup: {
        value: function () {
            //
            if (this._popupGradientChipBase && this._popupGradientChipBase.opened) {
                //
                this._popupGradientChipBase.popup.removeEventListener('didDraw', this, false);
                //TODO: Add correct input setback
                if (this.colorManager.input !== 'stroke' && this.colorManager.input !== 'fill' && this.application.ninja.colorController.colorView.previousInput && (!this._popupChipBase || (this._popupChipBase && !this._popupChipBase.opened))) {
                    this.colorManager.input = this.application.ninja.colorController.colorView.previousInput;
                }
                //
                this.application.ninja.popupManager.removePopup(this._popupGradientChipBase.popup.element);
                this._popupGradientChipBase.opened = false;
                //TODO: Fix HACK of removing popup
                this._popupGradientChipBase.popup.base.destroy();
                this._popupGradientChipBase.popup = null;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Reworking logic, firstDraw bubbles up, so target must be checked
    handleFirstDraw: {
        value: function (e) {
            if (e._target._element.className === 'cpp_popup') {
                e._target.removeEventListener('firstDraw', this, false);
                //Creating an instance of the popup and sending in created color popup content
                e._target.popup = this.application.ninja.popupManager.createPopup(e._target.element, {x: e._target.props.x, y: e._target.props.y}, {side: e._target.props.side, align: e._target.props.align});
                //Displaying popup once it's drawn
                e._target.popup.addEventListener('firstDraw', this, false);
                //Hiding popup while it draws
                e._target.popup.element.style.opacity = 0;
                //Storing popup for use when closing
                e._target.popup.base = e._target;
            } else if (e._target._element.className === 'default_popup' && e._target._content.className === 'cpp_popup') {
                if (!e._target.base.isPopupChip) {
                    this._colorPopupDrawing = false;
                } else  if (e._target.base.props && e._target.base.props.gradientPopup) {
                    this._colorGradientPopupDrawing = false;
                } else {
                    this._colorChipPopupDrawing = false;
                }
                //
                e._target.base.popup.removeEventListener('firstDraw', this, false);
                //Fades in with CSS transition
                e._target.base.popup.element.style.opacity = 1;
                //Popup was added, so it's opened
                e._target.base.opened = true;
                //
                if (e._target.base.props && e._target.base.props.source) {
                    //
                    var cbtn = e._target.base.props.source, color, hsv;
                    //
                    if (cbtn.colorMode === 'rgb') {
                        //
                        if (cbtn.colorValue && !isNaN(cbtn.colorValue.r)) {
                            color = cbtn.colorValue;
                        } else if (cbtn.colorValue && cbtn.colorValue.color){
                            color = cbtn.colorValue.color;
                        } else {
                            return;
                        }
                        //
                        hsv = this.colorManager.rgbToHsv(color.r, color.g, color.b);
                    } else if (cbtn.colorMode === 'hsl') {
                        //
                        if (cbtn.colorValue && !isNaN(cbtn.colorValue.h)) {
                            color = cbtn.colorValue;
                        } else if (cbtn.colorValue && cbtn.colorValue.color){
                            color = cbtn.colorValue.color;
                        } else {
                            return;
                        }
                        //
                        color = this.colorManager.hslToRgb(color.h/360, color.s/100, color.l/100);
                        //
                        hsv = this.colorManager.rgbToHsv(color.r, color.g, color.b);
                    }
                    //
                    if (color && color.a && !e._target.base.props.panel) {
                        e._target.base.colorManager.alpha = color.a;
                        e._target.base._components.combo.slider.value = color.a*100;
                    } else if (!e._target.base.props.panel){
                        e._target.base._components.combo.slider.value = 100;
                    }
                    //
                    if (hsv) {
                        hsv.wasSetByCode = false;
                        hsv.type = 'change';
                        e._target.base._components.wheel.value = hsv;
                    } else {
                        e._target.base._components.hex.value = null;
                        e._target.base.colorManager.applyNoColor(false);
                    }
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleChange: {
        value: function (e) {
            if (this._popupChipBase && this._popupChipBase.opened && (!this._popupGradientChipBase || (this._popupGradientChipBase && !this._popupGradientChipBase.opened))) {
                if (e._event.hsv) {
                    this._popupChipBase.colorManager.hsv = {h: e._event.hsv.h, s: e._event.hsv.s, v: e._event.hsv.v, type: e._event.type, wasSetByCode: e._event.wasSetByCode};
                    this.colorChipChange(e);
                } else if (!this._popupBase || (this._popupBase && !this._popupBase.opened)){
                    if (e._event.gradient && !e._event.wasSetByCode) {
                        //
                        this._popupChipBtn.color('gradient', e._event.gradient);
                        this._popupChipBase._components.hex.value = null;
                    } else if (!isNaN(e._target._xStart) && !e._event.wasSetByCode) {
                        if (!isNaN(e._target._numValue)) {
                            this._popupChipBase.colorManager.alpha = {value: e._target._numValue/100, type: 'change', wasSetByCode: false};
                        }
                        this.colorChipChange(e);
                    } else if (!e._event.wasSetByCode && (e._event.mode && e._event.mode === 'nocolor')) {
                        this.colorChipChange(e);
                    } else if (!e._event.wasSetByCode && (e._event.mode && e._event.mode === 'hex')) {
                        this.colorChipChange(e);
                    }
                }
                return;
            } else if (this._popupGradientChipBase && this._popupGradientChipBase.opened) {
                if (e._event.hsv) {
                    this._popupGradientChipBase.colorManager.hsv = {h: e._event.hsv.h, s: e._event.hsv.s, v: e._event.hsv.v, type: e._event.type, wasSetByCode: e._event.wasSetByCode};
                    this.colorGradientChipChange(e);
                } else if (!this._popupBase || (this._popupBase && !this._popupBase.opened)){
                    if (e._event.gradient && !e._event.wasSetByCode) {
                        this._popupChipBtn.color('gradient', e._event.gradient);
                        this._popupChipBase._components.hex.value = null;
                    } else if (!isNaN(e._target._xStart) && !e._event.wasSetByCode) {
                        if (!isNaN(e._target._numValue)) {
                            this._popupGradientChipBase.colorManager.alpha = {value: e._target._numValue/100, type: 'change', wasSetByCode: false};
                        }
                        this.colorGradientChipChange(e);
                    } else if (!e._event.wasSetByCode && (e._event.mode && e._event.mode === 'hex')) {
                        this.colorGradientChipChange(e);
                    }
                } else {
                    if (!isNaN(e._target._xStart) && !e._event.wasSetByCode) {
                        if (!isNaN(e._target._numValue)) {
                            this._popupGradientChipBase.colorManager.alpha = {value: e._target._numValue/100, type: 'change', wasSetByCode: false};
                        }
                        this.colorGradientChipChange(e);
                    } else if (!e._event.wasSetByCode && (e._event.mode && e._event.mode === 'hex')) {
                        this.colorGradientChipChange(e);
                    }
                }
                return;
            }
            //
            if (!e._event.wasSetByCode) {
                if (e._event.hsv) {
                    if(e._target._colorBarCanvas && this.colorManager.input !== 'chip') {
                        this.application.ninja.colorController.colorPopupManager.hideColorPopup();
                    }
                    //
                    if (this.colorManager.input !== 'chip') {
                        this.colorManager.hsv = {h: e._event.hsv.h, s: e._event.hsv.s, v: e._event.hsv.v, type: e._event.type, wasSetByCode: e._event.wasSetByCode};
                    } else {
                        //this.colorChipChange(e);
                    }
                } else if (!isNaN(e._target._xStart) && !isNaN(e._target._numValue) && !e._event.wasSetByCode) {
                    this.colorManager.alpha = {value: e._target._numValue/100, type: 'change', wasSetByCode: false};
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleChanging: {
        value: function (e) {
            if (!this._popupBase || !this._popupBase.opened) return;
            if (e._event.hsv) {
                //
                if(e._target._colorBarCanvas && this.colorManager.input !== 'chip') {
                    this.application.ninja.colorController.colorPopupManager.hideColorPopup();
                }
                //Converting color to RGB to update buttons background colors (affecting only view)
                var color = this.colorManager.hsvToRgb(e._event.hsv.h/(Math.PI*2), e._event.hsv.s, e._event.hsv.v), i, input = this.colorManager.input;

                if (input === 'chip') {
                    var ctx, cvs = this.application.ninja.colorController.colorView.currentChip.getElementsByTagName('canvas')[0];
                    //if (cvs && color) {
                    if (cvs) {
                        ctx = cvs.getContext('2d');
                        ctx.clearRect(0, 0, cvs.width, cvs.height);
                        ctx.beginPath();
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = "#666";
                        ctx.moveTo(0, 0);
                        ctx.lineTo(cvs.width, 0);
                        ctx.lineTo(cvs.width, cvs.height);
                        ctx.lineTo(0, cvs.height);
                        ctx.lineTo(0, 0);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = "#333";
                        ctx.moveTo(2, 2);
                        ctx.lineTo(cvs.width-2, 2);
                        ctx.lineTo(cvs.width-2, cvs.height-2);
                        ctx.lineTo(2, cvs.height-2);
                        ctx.lineTo(2, 1);
                        ctx.stroke();
                    }
                    //Updating background color
                    if (this.colorManager.alpha && this.colorManager.alpha.value) {
                        this.application.ninja.colorController.colorView.currentChip.style.backgroundImage = 'none';
                        this.application.ninja.colorController.colorView.currentChip.style.backgroundColor = 'rgba('+color.r+','+color.g+','+color.b+', '+this.colorManager.alpha.value+')';
                    } else {
                        this.application.ninja.colorController.colorView.currentChip.style.backgroundImage = 'none';
                        this.application.ninja.colorController.colorView.currentChip.style.backgroundColor = 'rgba('+color.r+','+color.g+','+color.b+', '+this.colorManager.alpha+')';
                    }
                    return;
                }
                //Applying color to all buttons in array
                for(i=0; this.application.ninja.colorController.colorView._buttons[input][i]; i++) {
                    //TODO: Remove this and combine to single method for live updating colors
                    //Combines with drawing routing in 'selectInputHighlight'
                    var ctx, cvs = this.application.ninja.colorController.colorView._buttons[input][i].getElementsByTagName('canvas')[0];
                    if (cvs) {
                        ctx = cvs.getContext('2d');
                        ctx.clearRect(0, 0, cvs.width, cvs.height);
                        ctx.beginPath();
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = "#666";
                        ctx.moveTo(0, 0);
                        ctx.lineTo(cvs.width, 0);
                        ctx.lineTo(cvs.width, cvs.height);
                        ctx.lineTo(0, cvs.height);
                        ctx.lineTo(0, 0);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = "#333";
                        ctx.moveTo(2, 2);
                        ctx.lineTo(cvs.width-2, 2);
                        ctx.lineTo(cvs.width-2, cvs.height-2);
                        ctx.lineTo(2, cvs.height-2);
                        ctx.lineTo(2, 1);
                        ctx.stroke();
                    }
                    //Updating background color
                    if (this.colorManager.alpha && this.colorManager.alpha.value) {
                        this.application.ninja.colorController.colorView._buttons[input][i].style.backgroundImage = 'none';
                        this.application.ninja.colorController.colorView._buttons[input][i].style.backgroundColor = 'rgba('+color.r+','+color.g+','+color.b+', '+this.colorManager.alpha.value+')';
                    } else {
                        this.application.ninja.colorController.colorView._buttons[input][i].style.backgroundImage = 'none';
                        this.application.ninja.colorController.colorView._buttons[input][i].style.backgroundColor = 'rgba('+color.r+','+color.g+','+color.b+', '+this.colorManager.alpha+')';
                    }
                }
            }
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
