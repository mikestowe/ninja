/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 			require("montage/core/core").Montage,
	Component = 		require("montage/ui/component").Component,
	Popup = 			require("js/components/popup.reel").Popup,
	Slider = 			require("js/components/slider.reel").Slider,
	HotText = 			require("js/components/hottext.reel").HotText,
	ColorBar = 			require("js/components/colorbar.reel").ColorBar;
////////////////////////////////////////////////////////////////////////
//Exporting as ColorPanelBase
exports.ColorPanelBase = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //
    hasTemplate: {
        value: true
    },
    ////////////////////////////////////////////////////////////////////
    //Storing ColorPanel sliders mode
    _panelMode: {
	    value: 'rgb'
    },
    ////////////////////////////////////////////////////////////////////
    //Storing ColorPanel sliders mode
    panelMode: {
        get: function () {return this._panelMode;},
        set: function (value) {if (value !== this._panelMode)this._panelMode = value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _colorBar: {
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
        get: function () {return this._colorManager;},
        set: function (value) {
            if (value !== this._colorManager) {
                this._colorManager = value;
                //Updating input buttons
                this._colorManager.addEventListener('change', this._update.bind(this));
                this._colorManager.addEventListener('changing', this._update.bind(this));
                //Updating history buttons once color is set
                this._colorManager.addEventListener('change', this._updateHistoryButtons.bind(this));
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Color Panel Container
    _container: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _combo: {
        value: [{ slider: null, hottext: null }, { slider: null, hottext: null }, { slider: null, hottext: null }, { slider: null, hottext: null}]
    },
    ////////////////////////////////////////////////////////////////////
    //
    _buttons: {
        value: { chip: [], fill: [], stroke: [], current: [], previous: [], rgbmode: [], hslmode: [], hexinput: [], nocolor: [], reset: [], swap: [], mlabel1: [], mlabel2: [], mlabel3: [] }
    },
    ////////////////////////////////////////////////////////////////////
    //
    historyCache: {
        value: { current: null, previous: null }
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorChipProps: {
        value: { side: 'top', align: 'center', wheel: true, palette: true, gradient: true, image: true, panel: false }
    },
    ////////////////////////////////////////////////////////////////////
    //
    currentChip: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    previousInput: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleFirstDraw: {
        value: function (e) {
            //
            this.applyDefaultColors();
            this.removeEventListener('firstDraw', this, false);

            // Workaround for delaying subtool colorchip creation until the color panel is initialized.
            // This can be removed and the subtools must be updated once we create a new view for color buttons
            // and they no longer rely on the view of the color panel.
            this.application.ninja.colorController.colorPanelDrawn = true;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Setting up elements/components
    prepareForDraw: {
        value: function () {
            //TODO: Remove temporary hack, color history should be initilized
            this.addEventListener('firstDraw', this, false);
            this.application.ninja.colorController.colorView = this;
            this.colorManager.colorHistory.fill = [{ m: 'nocolor', c: {}, a: 1}];
            this.colorManager.colorHistory.stroke = [{ m: 'nocolor', c: {}, a: 1}];
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Assigning values and binding
    willDraw: {
        value: function () {
            ////////////////////////////////////////////////////////////
            //Creating slider/hottext components
            createCombo(this._combo[0], this.slider1, this.hottext1, true);
            createCombo(this._combo[1], this.slider2, this.hottext2, true);
            createCombo(this._combo[2], this.slider3, this.hottext3, true);
            createCombo(this._combo[3], this.slider4, this.hottext4, false);
            ////////////////////////////////////////////////////////////
            //Function to create slider/hottext combination
            function createCombo(c, sldr, htxt, color) {
                //Only creating, not drawing
                c.slider = Slider.create();
                c.hottext = HotText.create();
                c.slider.element = sldr;
                c.hottext.element = htxt;
                c.slider.changesColor = c.hottext.changesColor = color;
                c.slider.cInputType = 'slider';
                c.slider.cInputType = 'hottext';
                //Binding Hottext to Slider
                Object.defineBinding(c.hottext, "value", {
                    boundObject: c.slider,
                    boundObjectPropertyPath: "value", //TODO: Check if needed
                    oneway: false,
                    boundValueMutator: function (value) {
                        return Math.round(value);
                    }
                });
                //Binding Slider to Hottext
                Object.defineBinding(c.slider, "value", {
                    boundObject: c.hottext,
                    boundObjectPropertyPath: "value",
                    oneway: false,
                    boundValueMutator: function (value) {
                        return Math.round(value);
                    }
                });
            }
            ////////////////////////////////////////////////////////////
            //Creating ColorBar and sending color manager
            this._colorBar = ColorBar.create();
            this._colorBar.element = this.spectrum;
            ////////////////////////////////////////////////////////////
            //Adding/Initializing buttons
            this.addButton('fill', this.btnFill);
            this.addButton('fillicon', this.btnFillIcon);
            this.addButton('stroke', this.btnStroke);
            this.addButton('strokeicon', this.btnStrokeIcon);
            //
            this.addButton('current', this.btnCurrent);
            this.addButton('previous', this.btnPrevious);
            //
            this.addButton('hexinput', this.hextext, this.colorManager);
            this.addButton('reset', this.btnDefault);
            this.addButton('nocolor', this.btnNoColor);
            this.addButton('swap', this.btnSwap);
            //TODO: Add HSL mode when Chrome can pass proper mode in color, also add in CSS button states
            //this.addButton('hslmode', this.btnHslMode);
            this.addButton('rgbmode', this.btnRgbMode);
            //
            this.addButton('mlabel1', this.label1);
            this.addButton('mlabel2', this.label2);
            this.addButton('mlabel3', this.label3);
            //Initialing values of sliders according to current mode
            if (this._panelMode === 'rgb') {
                this._combo[0].slider.maxValue = this._combo[0].hottext.maxValue = 255;
                this._combo[1].slider.maxValue = this._combo[1].hottext.maxValue = 255;
                this._combo[2].slider.maxValue = this._combo[2].hottext.maxValue = 255;
            } else if (this._panelMode === 'hsl') {
                this._combo[0].slider.maxValue = this._combo[0].hottext.maxValue = 360;
                this._combo[1].slider.maxValue = this._combo[1].hottext.maxValue = 100;
                this._combo[2].slider.maxValue = this._combo[2].hottext.maxValue = 100;
            }
            //Alpha slider/hottext is indepenent of color panel mode
            this._combo[3].slider.maxValue = this._combo[3].hottext.maxValue = 100;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Drawing elements/components
    draw: {
        value: function () {
            ////////////////////////////////////////////////////////////
            //Drawing slider/hottext combinations
            for (var i = 0; i < this._combo.length; i++) {
                this._combo[i].slider.needsDraw = true;
                this._combo[i].hottext.needsDraw = true;
            }
            //Drawing Color Bar
            this._colorBar.needsDraw = true;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    didDraw: {
        value: function () {
            //Drawing color bar after layout has been drawn since width/height are needed
            this._colorBar.needsDraw = true;
            //Adding events to color bar component
            this._colorBar.addEventListener('change', this, false);
            this._colorBar.addEventListener('changing', this, false);
            //Custom background drawing function per individual slider
            this._combo[0].slider.customBackground = this._slider0Background.bind(this);
            this._combo[1].slider.customBackground = this._slider1Background.bind(this);
            this._combo[2].slider.customBackground = this._slider2Background.bind(this);
            this._combo[3].slider.customBackground = this._slider3Background.bind(this);
            //Listening for change events to update sliders
            this._combo[0].slider.addEventListener("change", this._updateSliders.bind(this));
            this._combo[1].slider.addEventListener("change", this._updateSliders.bind(this));
            this._combo[2].slider.addEventListener("change", this._updateSliders.bind(this));
            this._combo[3].slider.addEventListener("change", this._updateSliders.bind(this));
            //
            this._combo[0].slider.addEventListener("change", this._updateValueFromSH.bind(this));
            this._combo[1].slider.addEventListener("change", this._updateValueFromSH.bind(this));
            this._combo[2].slider.addEventListener("change", this._updateValueFromSH.bind(this));
            this._combo[3].slider.addEventListener("change", this._updateValueFromSH.bind(this));
            //
            this._combo[0].hottext.addEventListener("change", this._updateValueFromSH.bind(this));
            this._combo[1].hottext.addEventListener("change", this._updateValueFromSH.bind(this));
            this._combo[2].hottext.addEventListener("change", this._updateValueFromSH.bind(this));
            this._combo[3].hottext.addEventListener("change", this._updateValueFromSH.bind(this));
            //
            this._combo[0].slider.addEventListener("changing", this._updateSliders.bind(this));
            this._combo[1].slider.addEventListener("changing", this._updateSliders.bind(this));
            this._combo[2].slider.addEventListener("changing", this._updateSliders.bind(this));
            this._combo[3].slider.addEventListener("changing", this._updateSliders.bind(this));
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Color Updating from Mananger
    _update: {
        value: function (e) {
            //Local variables
            var i, bgcolor, bgimg, input = this.colorManager.input.toLocaleLowerCase(), other;
            //Setting help variable (opposite type)
            if (input === 'stroke') {
                other = 'fill';
            } else if (input === 'fill') {
                other = 'stroke';
            } else {
                return;
            }
            //Checking for event mode to be color change (NOT PANEL MODE RELATED)
            if (e._event.mode === 'hsv' || e._event.mode === 'hsl' || e._event.mode === 'rgb' || e._event.mode === 'hex' || e._event.mode === 'nocolor' || e._event.mode === 'gradient' || e._event.mode === 'alpha') {
                //Checking for panel color mode (RGB or HSL) to assign correct slider values
                if (this.panelMode === 'rgb' && e._event.rgba) {
                    this._combo[0].slider.value = e._event.rgba.r;
                    this._combo[1].slider.value = e._event.rgba.g;
                    this._combo[2].slider.value = e._event.rgba.b;
                    this._combo[3].slider.value = Math.round(100 * e._event.rgba.a);
                    bgcolor = 'rgba(' + e._event.rgba.r + ', ' + e._event.rgba.g + ', ' + e._event.rgba.b + ', ' + e._event.rgba.a + ')';
                } else if (this.panelMode === 'hsl' && e._event.hsla) {
                    this._combo[0].slider.value = e._event.hsla.h;
                    this._combo[1].slider.value = e._event.hsla.s;
                    this._combo[2].slider.value = e._event.hsla.l;
                    this._combo[3].slider.value = Math.round(100 * e._event.hsla.a);
                    bgcolor = 'hsla(' + e._event.hsla.h + ', ' + e._event.hsla.s + '%, ' + e._event.hsla.l + '%, ' + e._event.hsla.a + ')';
                }
                if (e._event.mode === 'gradient') {
                    bgimg = e._event.value.value.css;
                }
                //Checking for background string to use
                if (bgcolor || bgimg) {
                    //Looping through all input buttons
                    for (i = 0; this._buttons[input][i]; i++) {
                        this._buttons[input][i].style.background = 'none';
                        this._buttons[input][i].style.backgroundColor = 'none';
                        this._buttons[input][i].style.backgroundImage = 'none';
                        //Setting background color
                        if (bgimg) {
                            this._buttons[input][i].style.backgroundImage = bgimg;
                        } else if (this._buttons[input][i].style.backgroundImage) {
                            this._buttons[input][i].style.backgroundImage = 'none';
                        }
                        if (bgcolor) {
                            this._buttons[input][i].style.backgroundColor = bgcolor;
                        }
                        //Checking for type history
                        if (this.colorManager.colorHistory[input].length) {
                            //Check for 'nocolor' to apply proper highlight
                            if (this.colorManager.colorHistory[other][this.colorManager.colorHistory[other].length - 1].m === 'nocolor') {
                                this.selectInputHighlight(this._buttons[input], this._buttons[other], false, true);
                            } else {
                                this.selectInputHighlight(this._buttons[input], this._buttons[other], false, false);
                            }
                        }
                    }
                } else {
                    //Checking for type history
                    if (this.colorManager.colorHistory[other].length) {
                        //Check for 'nocolor' to apply proper highlight
                        if (this.colorManager.colorHistory[other][this.colorManager.colorHistory[other].length - 1].m === 'nocolor') {
                            this.selectInputHighlight(this._buttons[input], this._buttons[other], true, true);
                        } else {
                            this.selectInputHighlight(this._buttons[input], this._buttons[other], true, false);
                        }
                    }
                }
            }
            //Updating all hex input areas
            for (i = 0; this._buttons.hexinput[i]; i++) {
                this._buttons.hexinput[i]._valueSyncedWithInputField = false;
                this._buttons.hexinput[i].needsDraw = true;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Updating history buttons (individually kept per input type)
    _updateHistoryButtons: {
        value: function (e) {
            //Locals
            var bg = 'none', img, i, input = this.colorManager.input.toLowerCase(), color, hsv, mode = e._event.mode, prev, alpha, ctx, cvs;
            if (input === 'chip') {
                return;
            }
            //Creating background color string according to panel mode (not input color mode)
            if (mode === 'hsv' || mode === 'hsl' || mode === 'rgb' || mode === 'hex' || mode === 'alpha') {
                if (this.panelMode === 'rgb' && e._event.rgba) {
                    color = e._event.rgba;
                    bg = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + color.a + ')';
                } else if (this.panelMode === 'hsl' && e._event.hsla) {
                    color = e._event.hsla;
                    bg = 'hsla(' + color.h + ', ' + color.s + '%, ' + color.l + '%, ' + color.a + ')';
                } else {
                    bg = 'nocolor';
                }
                color = null;
                for (i = 0; this._buttons.current[i]; i++) {
                    cvs = this._buttons.current[i].getElementsByTagName('canvas')[0];
                    ctx = cvs.getContext('2d');
                    ctx.clearRect(0, 0, cvs.width, cvs.height);
                    this._buttons.current[i].style.backgroundColor = bg;
                    this._buttons.current[i].style.backgroundImage = 'none';
                }
            } else if (mode === 'gradient') {
                //
                color = e._event.value;
                bg = e._event.value.value.css;
                for (i = 0; this._buttons.current[i]; i++) {
                    cvs = this._buttons.current[i].getElementsByTagName('canvas')[0];
                    ctx = cvs.getContext('2d');
                    ctx.clearRect(0, 0, cvs.width, cvs.height);
                    this._buttons.current[i].style.background = 'none';
                    this._buttons.current[i].style.backgroundColor = 'none';
                    this._buttons.current[i].style.backgroundImage = bg;
                }
            } else {
                //
                bg = 'nocolor';
                for (i = 0; this._buttons.current[i]; i++) {
                    //TODO: combine no color into one reusable funtion
                    cvs = this._buttons.current[i].getElementsByTagName('canvas')[0];
                    ctx = cvs.getContext('2d');
                    ctx.clearRect(0, 0, cvs.width, cvs.height);
                    ctx.beginPath();
                    ctx.moveTo(0, cvs.height);
                    ctx.lineTo(cvs.width, 0);
                    ctx.lineWidth = 16;
                    ctx.strokeStyle = "#FF0000";
                    ctx.stroke();
                    this._buttons.current[i].style.backgroundColor = 'white';
                    this._buttons.current[i].style.backgroundImage = 'none';
                }
            }
            this.historyCache.current = bg;
            //Using history of input type to set colors of 'previous' buttons
            for (i = 0; this._buttons.previous[i]; i++) {
                //
                if (this.colorManager.colorHistory[input].length > 1) {
                    //
                    prev = this.colorManager.colorHistory[input][this.colorManager.colorHistory[input].length - 2];
                    alpha = prev.a;
                    //
                    cvs = this._buttons.previous[i].getElementsByTagName('canvas')[0];
                    ctx = cvs.getContext('2d');
                    ctx.clearRect(0, 0, cvs.width, cvs.height);
                    //
                    this._buttons.previous[i].style.background = 'none';
                    this._buttons.previous[i].style.backgroundImage = 'none';
                    this._buttons.previous[i].style.backgroundColor = 'none';
                    //
                    switch (prev.m) {
                        case 'hsv':
                            hsv = prev.c;
                            color = this.colorManager.hsvToRgb(hsv.h / (Math.PI * 2), hsv.s, hsv.v);
                            this._buttons.previous[i].style.backgroundColor = this.historyCache.previous = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + alpha + ')';
                            break;
                        case 'hsl':
                            color = prev.c;
                            this._buttons.previous[i].style.backgroundColor = this.historyCache.previous = 'hsla(' + color.h + ', ' + color.s + '%, ' + color.l + '%, ' + alpha + ')';
                            break;
                        case 'rgb':
                            color = prev.c;
                            this._buttons.previous[i].style.backgroundColor = this.historyCache.previous = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + alpha + ')';
                            break;
                        case 'hex':
                            this._buttons.previous[i].style.backgroundColor = this.historyCache.previous = prev.c.hex;
                            break;
                        case 'gradient':
                            this._buttons.previous[i].style.backgroundImage = this.historyCache.previous = prev.c.value.css;
                            break;
                        case 'nocolor':
                            ctx.beginPath();
                            ctx.moveTo(0, cvs.height);
                            ctx.lineTo(cvs.width, 0);
                            ctx.lineWidth = 16;
                            ctx.strokeStyle = "#FF0000";
                            ctx.stroke();
                            this._buttons.previous[i].style.backgroundColor = 'white';
                            this.historyCache.previous = 'nocolor';
                            break;
                        default:
                            this._buttons.previous[i].style.backgroundColor = this.historyCache.previous = 'transparent';
                            this._buttons.previous[i].style.backgroundImage = this.historyCache.previous = 'transparent';
                            break;
                    }
                } else {
                    this._buttons.previous[i].style.backgroundColor = this.historyCache.previous = 'transparent';
                    this._buttons.previous[i].style.backgroundImage = this.historyCache.previous = 'transparent';
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Draws no color icon on button's canvas
    drawButtonNoColor: {
        value: function (btn, cvs) {
            //
            var ctx = cvs.getContext('2d');
            ctx.clearRect(0, 0, cvs.width, cvs.height);
            //
            ctx.beginPath();
            ctx.moveTo(0, cvs.height);
            ctx.lineTo(cvs.width, 0);
            ctx.lineWidth = Math.round(cvs.width / 18);
            ctx.strokeStyle = "#FF0000";
            ctx.stroke();
            btn.style.backgroundColor = 'white';
            btn.style.backgroundImage = 'none';
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    addButton: {
        value: function (type, button, manager) {
            //
            switch (type.toLocaleLowerCase()) {
                case 'chip':
                    //
                    var cvs = document.createElement('canvas');
                    cvs.style.width = '100%';
                    cvs.style.height = '100%';
                    cvs.style.pointerEvents = 'none';
                    cvs.style.float = 'left';
                    //
                    this._buttons.chip.push(button);
                    button.style.cursor = 'pointer';
                    button.color = function (m, c) {
                        if (this.colorValue && c && this.colorValue.css === c.css) {
                            return;
                        }
                        if (c && c.css) {
                            this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
                            if (m === 'gradient') {
                            	this.style.backgroundImage = c.css;
                            	this.style.backgroundColor = 'transparent';
                            } else {
	                            this.style.backgroundColor = c.css;
	                            this.style.backgroundImage = 'none';
                            }
                        } else {
                            this.drawNoColor(this, this.cvs);
                        }
                        this.colorValue = c;
                        this.colorMode = m;
                        this.otherInput = false;
                        //
                        var actionEvent = document.createEvent("CustomEvent");
                        actionEvent.initEvent('change', true, true);
                        actionEvent.color = c;
                        actionEvent.colorMode = m;
                        actionEvent.input = 'chip';
                        this.dispatchEvent(actionEvent);
                    };
                    button.drawNoColor = this.drawButtonNoColor;
                    button.addEventListener('click', this.selectColorWithChip.bind(this));
                    button.cvs = cvs;
                    button.ctx = cvs.getContext('2d');
                    button.appendChild(cvs);
                    break;
                case 'fill':
                    this._buttons.fill.push(button);
                    button.style.cursor = 'pointer';
                    button.inputType = 'fill';
                    button.title = 'Fill';
                    button.popup = true;
                    button.addEventListener('click', this.selectInputType.bind(this));
                    button.innerHTML = "";
                    var cvs = document.createElement('canvas');
                    cvs.style.width = '100%';
                    cvs.style.height = '100%';
                    cvs.style.pointerEvents = 'none';
                    cvs.style.float = 'left';
                    button.appendChild(cvs);
                    //
                    if (this.application.ninja.colorController.fill && this.application.ninja.colorController.fill.css !== 'none') {
                        button.style.background = 'none';
                        if (this.application.ninja.colorController.fill.css.indexOf('-webkit') >= 0) {
                            button.style.backgroundColor = 'none';
                            button.style.backgroundImage = this.application.ninja.colorController.fill.css;
                        } else {
                            button.style.backgroundColor = this.application.ninja.colorController.fill.css;
                            button.style.backgroundImage = 'none';
                        }
                    } else {
                        this.drawButtonNoColor(button, button.getElementsByTagName('canvas')[0]);
                    }
                    break;
                //////////////////////////////////////////////////////// 
                case 'fillicon':
                    button.innerHTML = '';
                    this._buttons.fill.push(button);
                    button.style.cursor = 'pointer';
                    button.inputType = 'fill';
                    button.title = 'Fill';
                    button.addEventListener('click', this.selectInputType.bind(this));
                    button.className = button.className + ' cpe_fill_icon';
                    if (this.colorManager.input === 'fill') {
                        button.className = button.className + ' selected';
                    }
                    break;
                //////////////////////////////////////////////////////// 
                case 'stroke':
                    this._buttons.stroke.push(button);
                    button.style.cursor = 'pointer';
                    button.inputType = 'stroke';
                    button.popup = true;
                    button.title = 'Stroke';
                    button.addEventListener('click', this.selectInputType.bind(this));
                    button.innerHTML = "";
                    var cvs = document.createElement('canvas');
                    cvs.style.width = '100%';
                    cvs.style.height = '100%';
                    cvs.style.pointerEvents = 'none';
                    cvs.style.float = 'left';
                    button.appendChild(cvs);
                    //
                    if (this.application.ninja.colorController.stroke && this.application.ninja.colorController.stroke.css !== 'none') {
                        button.style.background = 'none';
                        if (this.application.ninja.colorController.stroke.css.indexOf('-webkit') >= 0) {
                            button.style.backgroundColor = 'none';
                            button.style.backgroundImage = this.application.ninja.colorController.stroke.css;
                        } else {
                            button.style.backgroundColor = this.application.ninja.colorController.stroke.css;
                            button.style.backgroundImage = 'none';
                        }
                    } else {
                        this.drawButtonNoColor(button, button.getElementsByTagName('canvas')[0]);
                        //this.selectInputHighlight(this._buttons['stroke'], this._buttons['fill'], false, true);
                    }
                    break;
                //////////////////////////////////////////////////////// 
                case 'strokeicon':
                    button.innerHTML = '';
                    this._buttons.stroke.push(button);
                    button.style.cursor = 'pointer';
                    button.title = 'Stroke';
                    button.inputType = 'stroke';
                    button.addEventListener('click', this.selectInputType.bind(this));
                    button.className = button.className + ' cpe_stroke_icon';
                    if (this.colorManager.input === 'stroke') {
                        button.className = button.className + ' selected';
                    }
                    break;
                //////////////////////////////////////////////////////// 
                case 'current':
                    this._buttons.current.push(button);
                    button.style.cursor = 'default';
                    button.innerHTML = "";
                    button.title = 'Current Color'
                    var cvs = document.createElement('canvas');
                    cvs.style.width = '100%';
                    cvs.style.height = '100%';
                    cvs.style.pointerEvents = 'none';
                    cvs.style.float = 'left';
                    button.appendChild(cvs);
                    if (this.historyCache.current) {
                        //TODO:Remove hack
                        if (this.historyCache.current === 'nocolor') {
                            this.drawButtonNoColor(button, cvs);
                        } else {
                            button.style.backgroundColor = this.historyCache.current;
                        }
                    }
                    break;
                //////////////////////////////////////////////////////// 
                case 'previous':
                    this._buttons.previous.push(button);
                    button.addEventListener('click', this.setPreviousColor.bind(this));
                    button.style.cursor = 'pointer';
                    button.innerHTML = "";
                    button.title = 'Previous Color';
                    var cvs = document.createElement('canvas');
                    cvs.style.width = '100%';
                    cvs.style.height = '100%';
                    cvs.style.pointerEvents = 'none';
                    cvs.style.float = 'left';
                    button.appendChild(cvs);
                    if (this.historyCache.previous) {
                        if (this.historyCache.previous === 'nocolor') {
                            this.drawButtonNoColor(button, cvs);
                        } else {
                            button.style.backgroundColor = this.historyCache.previous;
                        }
                    }
                    break;
                //////////////////////////////////////////////////////// 
                case 'mlabel1':
                    this._buttons.mlabel1.push(button);
                    break;
                //////////////////////////////////////////////////////// 
                case 'mlabel2':
                    this._buttons.mlabel2.push(button);
                    break;
                //////////////////////////////////////////////////////// 
                case 'mlabel3':
                    this._buttons.mlabel3.push(button);
                    break;
                //////////////////////////////////////////////////////// 
                case 'rgbmode':
                    this._buttons.rgbmode.push(button);
                    button.title = 'Color Mode: RGB';
                    button.addEventListener('click', this.rgbMode.bind(this));
                    break;
                //////////////////////////////////////////////////////// 
                case 'hslmode':
                    this._buttons.hslmode.push(button);
                    button.title = 'Color Mode: HSL';
                    button.addEventListener('click', this.hslMode.bind(this));
                    break;
                //////////////////////////////////////////////////////// 
                case 'reset':
                    this._buttons.reset.push(button);
                    button.title = 'Default Colors';
                    button.addEventListener('click', this.applyDefaultColors.bind(this));
                    break;
                //////////////////////////////////////////////////////// 
                case 'nocolor':
                    this._buttons.nocolor.push(button);
                    button.title = 'No Color';
                    button.addEventListener('click', function () {this.setNoColor(false)}.bind(this));
                    break;
                //////////////////////////////////////////////////////// 
                case 'swap':
                    this._buttons.swap.push(button);
                    button.title = 'Swap Colors';
                    button.addEventListener('click', this.swapColors.bind(this));
                    break;
                //////////////////////////////////////////////////////// 
                case 'hexinput':
                    var hexinp = HotText.create();
                    hexinp.element = button;
                    hexinp.labelFunction = this._updateHexValue.bind(manager);
                    hexinp.inputFunction = this._hottextHexInput.bind(manager);
                    hexinp.needsDraw = true;
                    this._buttons.hexinput.push(hexinp);
                    return hexinp;
                    break;
                //////////////////////////////////////////////////////// 
                default:
                    console.log("ERROR: An error occured, the button '" + button + "' has an invalid type of " + type + ".");
                    break;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    removeButton: {
        value: function (type, button) {
            //Checking for type array to exists before removing item
            if (this._buttons[type.toLocaleLowerCase()]) {
                this._buttons[type.toLocaleLowerCase()].pop(button);
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    setPreviousColor: {
        value: function (e) {
            //
            this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            //
            if (this.colorManager.colorHistory[this.colorManager.input].length > 1) {
                var prev = this.colorManager.colorHistory[this.colorManager.input][this.colorManager.colorHistory[this.colorManager.input].length - 2], color, alpha;
                //
                color = prev.c;
                alpha = prev.a;
                color.wasSetByCode = false;
                //
                if (prev.m === 'nocolor') {
                    this.setNoColor(false);
                } else {
                    this.colorManager.alpha = { value: alpha, wasSetByCode: true, type: 'change' };
                    this.colorManager[prev.m] = color;
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    rgbMode: {
        value: function (e) {
            //
            //this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            //
            this.panelMode = this.colorManager.mode = 'rgb';
            this._combo[0].slider.maxValue = this._combo[0].hottext.maxValue = 255;
            this._combo[1].slider.maxValue = this._combo[1].hottext.maxValue = 255;
            this._combo[2].slider.maxValue = this._combo[2].hottext.maxValue = 255;
            //
            this._combo[0].slider.value = this.colorManager.rgb.r;
            this._combo[1].slider.value = this.colorManager.rgb.g;
            this._combo[2].slider.value = this.colorManager.rgb.b;
            //
            this._updateSliders(e);
            for (i = 0; this._buttons.rgbmode[i]; i++) {
                this._buttons.rgbmode[i].className = 'cp_rgb_mode selected';
                //this._buttons.rgbmode[i].classList.add('selected'); 
            }
            for (i = 0; this._buttons.hslmode[i]; i++) {
                this._buttons.hslmode[i].className = 'cp_hsl_mode';
                ///this._buttons.hslmode[i].classList.remove('selected');
            }
            for (i = 0; this._buttons.mlabel1[i]; i++) {
                this._buttons.mlabel1[i].innerHTML = 'R';
            }
            for (i = 0; this._buttons.mlabel2[i]; i++) {
                this._buttons.mlabel2[i].innerHTML = 'G';
            }
            for (i = 0; this._buttons.mlabel3[i]; i++) {
                this._buttons.mlabel3[i].innerHTML = 'B';
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    hslMode: {
        value: function (e) {
            //
            //this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            //
            this.panelMode = this.colorManager.mode = 'hsl';
            this._combo[0].slider.maxValue = this._combo[0].hottext.maxValue = 360;
            this._combo[1].slider.maxValue = this._combo[1].hottext.maxValue = 100;
            this._combo[2].slider.maxValue = this._combo[2].hottext.maxValue = 100;
            //
            this._combo[0].slider.value = this.colorManager.hsl.h;
            this._combo[1].slider.value = this.colorManager.hsl.s;
            this._combo[2].slider.value = this.colorManager.hsl.l;
            //
            this._updateSliders(e);
            for (i = 0; this._buttons.rgbmode[i]; i++) {
                this._buttons.rgbmode[i].className = 'cp_rgb_mode';
                //this._buttons.rgbmode[i].classList.remove('selected');
            }
            for (i = 0; this._buttons.hslmode[i]; i++) {
                this._buttons.hslmode[i].className = 'cp_hsl_mode selected';
                //this._buttons.hslmode[i].classList.add('selected'); 
            }
            for (i = 0; this._buttons.mlabel1[i]; i++) {
                this._buttons.mlabel1[i].innerHTML = 'H';
            }
            for (i = 0; this._buttons.mlabel2[i]; i++) {
                this._buttons.mlabel2[i].innerHTML = 'S';
            }
            for (i = 0; this._buttons.mlabel3[i]; i++) {
                this._buttons.mlabel3[i].innerHTML = 'L';
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //TODO: Add set by code property
    setNoColor: {
        value: function (wasSetByCode) {
            //
            this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            //
            this.colorManager.applyNoColor(wasSetByCode);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    swapColors: {
        value: function (e) {
            //TODO: Take into account current select input type
            this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            //
            var stroke = this.colorManager.colorHistory.fill[this.colorManager.colorHistory.fill.length - 1],
    			fill = this.colorManager.colorHistory.stroke[this.colorManager.colorHistory.stroke.length - 1];
            stroke.c.wasSetByCode = fill.c.wasSetByCode = false;
            stroke.c.type = fill.c.type = 'change';
            ////////////////////////////////////////////////////////////
            //
            this.colorManager.input = 'stroke';
            this.colorManager.alpha = { value: stroke.a, type: 'change', wasSetByCode: false };
            //
            switch (stroke.m) {
                //////////////////////////////////////////////////////// 
                case 'rgb':
                    this.colorManager.rgb = stroke.c;
                    break;
                //////////////////////////////////////////////////////// 
                case 'hsv':
                    this.colorManager.hsv = stroke.c;
                    break;
                //////////////////////////////////////////////////////// 
                case 'hsl':
                    this.colorManager.hsl = stroke.c;
                    break;
                //////////////////////////////////////////////////////// 
                case 'hex':
                    this.colorManager.hex = stroke.c;
                    break;
                //////////////////////////////////////////////////////// 
                case 'gradient':
                    this.colorManager.gradient = stroke.c;
                    break;
                //////////////////////////////////////////////////////// 
                default:
                    this.setNoColor(false);
                    break;
                //////////////////////////////////////////////////////// 
            }
            ////////////////////////////////////////////////////////////
            //
            this.colorManager.input = 'fill';
            this.colorManager.alpha = { value: fill.a, type: 'change', wasSetByCode: false };
            //
            switch (fill.m) {
                //////////////////////////////////////////////////////// 
                case 'rgb':
                    this.colorManager.rgb = fill.c;
                    break;
                //////////////////////////////////////////////////////// 
                case 'hsv':
                    this.colorManager.hsv = fill.c;
                    break;
                //////////////////////////////////////////////////////// 
                case 'hsl':
                    this.colorManager.hsl = fill.c;
                    break;
                //////////////////////////////////////////////////////// 
                case 'hex':
                    this.colorManager.hex = fill.c;
                    break;
                //////////////////////////////////////////////////////// 
                case 'gradient':
                    this.colorManager.gradient = fill.c;
                    break;
                //////////////////////////////////////////////////////// 
                default:
                    this.setNoColor(false);
                    break;
                //////////////////////////////////////////////////////// 
            }
            //
            //Updating all hex input areas
            for (i = 0; this._buttons.hexinput[i]; i++) {
                this._buttons.hexinput[i]._valueSyncedWithInputField = false;
                this._buttons.hexinput[i].needsDraw = true;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Applying default colors to stroke and fill
    applyDefaultColors: {
        value: function () {
            //TODO: Take into account current select input type
            this.application.ninja.colorController.colorPopupManager.hideColorPopup();
            //
            var mode, max1, max2, max3, color, fColor, sColor;
            if (this.panelMode === 'hsl') {
                mode = 'hsl',
    			max1 = 360,
    			max2 = 100,
    			max3 = 100,
    			fColor = { h: 0, s: 0, l: 100 },
    			sColor = { h: 0, s: 0, l: 0 };
            } else {
                mode = 'rgb',
    			max1 = 255,
    			max2 = 255,
    			max3 = 255,
    			sColor = { r: 0, g: 0, b: 0 },
    			fColor = { r: 255, g: 255, b: 255 };
            }
            //
            sColor.wasSetByCode = false;
            fColor.wasSetByCode = false;
            sColor.type = 'change';
            fColor.type = 'change';
            //
            this.panelMode = this.colorManager.mode = mode;
            this._combo[0].slider.maxValue = this._combo[0].hottext.maxValue = max1;
            this._combo[1].slider.maxValue = this._combo[1].hottext.maxValue = max2;
            this._combo[2].slider.maxValue = this._combo[2].hottext.maxValue = max3;
            this.colorManager.input = 'stroke';
            this.colorManager.alpha = { value: 1, type: 'changing', wasSetByCode: true };
            if (mode === 'hsl') {
                this.colorManager.hsl = sColor;
            } else {
                this.colorManager.rgb = sColor;
            }

            this.colorManager.input = 'fill';
            this.colorManager.alpha = { value: 1, type: 'changing', wasSetByCode: true };
            if (mode === 'hsl') {
                this.colorManager.hsl = fColor;
            } else {
                this.colorManager.rgb = fColor;
            }

            //TODO: hack
            if (mode === 'hsl') {
                for (i = 0; this._buttons.rgbmode[i]; i++) {
                    this._buttons.rgbmode[i].className = '';
                }
                for (i = 0; this._buttons.hslmode[i]; i++) {
                    this._buttons.hslmode[i].className = 'selected';
                }
            } else {
                for (i = 0; this._buttons.rgbmode[i]; i++) {
                    this._buttons.rgbmode[i].className = 'selected';
                }
                for (i = 0; this._buttons.hslmode[i]; i++) {
                    this._buttons.hslmode[i].className = '';
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    selectColorWithChip: {
        value: function (e) {
            //
            this.currentChip = e._event.srcElement;
            //
            if (this.colorManager.input === 'stroke' || this.colorManager.input === 'fill') {
                this.previousInput = this.colorManager.input;
            }
            this.colorManager.input = 'chip';
            this.colorManager.addEventListener('change', this, false);
            //
            if (this.otherInput) {
                this.selectInputType(null);
            }
            //
            this.application.ninja.colorController.colorPopupManager.showColorChipPopup(e);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _updateValueFromSH: {
        value: function (e) {
            //
            var update, type;
            //
            if (!e._event.wasSetByCode) {
            	//
            	if (!e.target.cInputType) {
	            	type = 'hottext';  
                } else {
	               	type = 'slider'
	            }
	            //
                if (e.target.changesColor) {
                    //
                    if (this.panelMode === 'rgb') {
                        //
                        if (this.colorManager.rgb && Math.round(this._combo[0][type].value) === this.colorManager.rgb.r && Math.round(this._combo[1][type].value) === this.colorManager.rgb.g && Math.round(this._combo[2][type].value) === this.colorManager.rgb.b) {
                        	return;
                        }
                        //
                        update = { r: Math.round(this._combo[0][type].value), g: Math.round(this._combo[1][type].value), b: Math.round(this._combo[2][type].value) };
                        //
                        update.wasSetByCode = false;
                        update.type = 'change';
                        this.colorManager.rgb = update;
                    } else if (this.panelMode === 'hsl') {
                        //
                        if (this.colorManager.hsl && Math.round(this._combo[0][type].value) === this.colorManager.hsl.h && Math.round(this._combo[1][type].value) === this.colorManager.hsl.s && Math.round(this._combo[2][type].value) === this.colorManager.hsl.l) {
                        	return;
                        }
                        //
                        update = { h: Math.round(this._combo[0][type].value), s: Math.round(this._combo[1][type].value), l: Math.round(this._combo[2][type].value) };
                        //
                        update.wasSetByCode = false;
                        update.type = 'change';
                        this.colorManager.hsl = update;
                    }
                } else {
                	//
                	update = { value: this._combo[3][type].value/100, wasSetByCode: false, type: 'change' };
                	//
                    this.colorManager.alpha = update;
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _updateSliders: {
        value: function (e) {
            var color, input = this.colorManager.input, i, other;
            if (input === 'fill') {
                other = 'stroke';
            } else if (input === 'stroke') {
                other = 'fill';
            } else if (input === 'chip') {
                var ctx, cvs = this.currentChip.getElementsByTagName('canvas')[0];
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
                    ctx.lineTo(cvs.width - 2, 2);
                    ctx.lineTo(cvs.width - 2, cvs.height - 2);
                    ctx.lineTo(2, cvs.height - 2);
                    ctx.lineTo(2, 1);
                    ctx.stroke();
                }

                if (this.colorManager.rgb)
                    this.currentChip.style.backgroundColor = 'rgba(' + this.colorManager.rgb.r + ', ' + this.colorManager.rgb.g + ', ' + this.colorManager.rgb.b + ', ' + this._combo[3].slider.value / 100 + ')';

                return;
            }
            if (this.panelMode === 'rgb' && this.colorManager.rgb) {
                color = 'rgba(' + this._combo[0].slider.value + ', ' + this._combo[1].slider.value + ', ' + this._combo[2].slider.value + ', ' + this._combo[3].slider.value / 100 + ')';
            } else if (this.panelMode === 'hsl' && this.colorManager.hsl) {
                color = 'hsla(' + this._combo[0].slider.value + ', ' + this._combo[1].slider.value + '%, ' + this._combo[2].slider.value + '%, ' + this._combo[3].slider.value / 100 + ')';
            }
            ////////////////////////////////////////////////////////////
            //Drawing slider/hottext combinations
            for (var i = 0; i < this._combo.length; i++) {
                if (this._combo[i] && this._combo[i].slider != this) {
                    this._combo[i].slider.needsDraw = true;
                    this._combo[i].hottext.needsDraw = true;
                }
            }
            //
            for (i = 0; this._buttons[input][i]; i++) {
                //TODO: Remove this and combine to single method for live updating colors
                //Combines with drawing routing in 'selectInputHighlight'
                var ctx, cvs = this._buttons[input][i].getElementsByTagName('canvas')[0];
                if (cvs && color) {
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
                    ctx.lineTo(cvs.width - 2, 2);
                    ctx.lineTo(cvs.width - 2, cvs.height - 2);
                    ctx.lineTo(2, cvs.height - 2);
                    ctx.lineTo(2, 1);
                    ctx.stroke();
                }


                //Updating background color
                this._buttons[input][i].style.backgroundColor = color;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _slider0Background: {
        value: function (c) {
            //
            var grdnt, cb_slc;
            //TODO: Clear up why can't use 'this' instead using ColorPanelBase
            if (this._panelMode === 'rgb') {
                //
                grdnt = c.getContext("2d").createLinearGradient(c.width, 0, 0, 0);
                grdnt.addColorStop(0, 'rgba(255, ' + Math.round(this._combo[1].slider.value) + ', ' + Math.round(this._combo[2].slider.value) + ', 1)');
                grdnt.addColorStop(1, 'rgba(0, ' + Math.round(this._combo[1].slider.value) + ', ' + Math.round(this._combo[2].slider.value) + ', 1)');
            } else if (this._panelMode === 'hsl') {
                grdnt = c.getContext("2d").createLinearGradient(0, 0, c.width, 0);
                ////////////////////////////////////////////////////////////////
                //Looping through set intervals
                for (var i = 0; i < 60; i++) {
                    //Calculating slice number
                    cb_slc = Math.round(255 * i / 60);
                    //Drawing 6 slices (6 colors in color theory)
                    addColorStop(i, 255, cb_slc, 0);
                    addColorStop(i + 60, 255 - cb_slc, 255, 0);
                    addColorStop(i + 120, 0, 255, cb_slc);
                    addColorStop(i + 180, 0, 255 - cb_slc, 255);
                    addColorStop(i + 240, cb_slc, 0, 255);
                    addColorStop(i + 300, 255, 0, 255 - cb_slc);
                }
                //Creating gradient via stops
                function addColorStop(deg, r, g, b) {
                    grdnt.addColorStop(deg / 360, 'rgb(' + r + ',' + g + ',' + b + ')');
                }
            }
            //Redrawing gradient background
            if (grdnt)
                this._drawSliderBackground(c, grdnt);
        }

    },
    ////////////////////////////////////////////////////////////////////
    //
    _slider1Background: {
        value: function (c) {
            //
            var grdnt;
            if (this._panelMode === 'rgb') {
                grdnt = c.getContext("2d").createLinearGradient(c.width, 0, 0, 0);
                grdnt.addColorStop(0, 'rgba(' + Math.round(this._combo[0].slider.value) + ', 255, ' + Math.round(this._combo[2].slider.value) + ' ,1)');
                grdnt.addColorStop(1, 'rgba(' + Math.round(this._combo[0].slider.value) + ', 0, ' + Math.round(this._combo[2].slider.value) + ', 1)');
            } else if (this._panelMode === 'hsl') {
                grdnt = c.getContext("2d").createLinearGradient(c.width, 0, 0, 0);
                grdnt.addColorStop(0, 'hsla(' + Math.round(this._combo[0].slider.value) + ', 100%, ' + Math.round(this._combo[2].slider.value) + '%, 1)');
                grdnt.addColorStop(1, 'hsla(' + Math.round(this._combo[0].slider.value) + ', 0%, ' + Math.round(this._combo[2].slider.value) + '%, 1)');
            }
            //
            if (grdnt)
                this._drawSliderBackground(c, grdnt);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _slider2Background: {
        value: function (c) {
            //
            var grdnt;
            if (this._panelMode === 'rgb') {
                grdnt = c.getContext("2d").createLinearGradient(c.width, 0, 0, 0);
                grdnt.addColorStop(0, 'rgba(' + Math.round(this._combo[0].slider.value) + ',' + Math.round(this._combo[1].slider.value) + ', 255, 1)');
                grdnt.addColorStop(1, 'rgba(' + Math.round(this._combo[0].slider.value) + ',' + Math.round(this._combo[1].slider.value) + ', 0, 1)');
            } else if (this._panelMode === 'hsl') {
                grdnt = c.getContext("2d").createLinearGradient(c.width, 0, 0, 0);
                grdnt.addColorStop(0, 'hsla(' + Math.round(this._combo[0].slider.value) + ',' + Math.round(this._combo[1].slider.value) + '%, 100%, 1)');
                grdnt.addColorStop(1, 'hsla(' + Math.round(this._combo[0].slider.value) + ',' + Math.round(this._combo[1].slider.value) + '%, 0%, 1)');
            }
            //
            if (grdnt)
                this._drawSliderBackground(c, grdnt);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _slider3Background: {
        value: function (c) {
            //
            var grdnt;
            grdnt = c.getContext("2d").createLinearGradient(c.width, 0, 0, 0);
            grdnt.addColorStop(1, 'rgba(0,0,0, 0)');
            grdnt.addColorStop(0, 'rgba(0,0,0, 1)');
            this._drawSliderBackground(c, grdnt);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _drawSliderBackground: {
        value: function (c, g) {
            var ctx = c.getContext("2d");
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.fillStyle = g;
            ctx.fillRect(0, 4, c.width, 4);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = .5;
            ctx.strokeRect(0, 4, c.width, 4);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _hottextHexInput: {
        value: function (color) {
            //If invalid input, no color will be applied
            var update, rgb;
            //Allowing multiple hex mode inputs (3 and 6 characters)
            switch (color.length) {
                case 3:
                    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
                    break;
                case 6:
                    //Nothing
                    break;
                default:
                    //this._colorManager.applyNoColor();
                    return;
                    break;
            }
            //Checking for panel mode and converting the color to the panel mode
            if (this._panelMode === 'hsl') {
                rgb = this.hexToRgb(color);
                if (rgb) {
                    update = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
                    update.wasSetByCode = false;
                    update.type = 'change';
                    this.hsl = update;
                } else {
                    this.applyNoColor(false);
                }
            } else {
                update = this.hexToRgb(color);
                if (update) {
                    update.wasSetByCode = false;
                    update.type = 'change';
                    this.rgb = update;
                } else {
                    this.applyNoColor(false);
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _updateHexValue: {
        value: function (v) {
            return this.hex;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleChange: {
        value: function (e) {
            if (e._event.input && e._event.input === 'chip' && e._event.mode !== 'gradient') {
                this.application.ninja.colorController.colorPopupManager.colorChipChange(e);
                return;
            }
            //
            if (!e._event.wasSetByCode) {
                if (e._event.hsv) {
                    if (e._target._colorBarCanvas && this.colorManager.input !== 'chip') {
                        this.application.ninja.colorController.colorPopupManager.hideColorPopup();
                    }
                    //
                    if (this.colorManager.input !== 'chip') {
                        this.colorManager.hsv = { h: e._event.hsv.h, s: e._event.hsv.s, v: e._event.hsv.v, type: e._event.type, wasSetByCode: e._event.wasSetByCode };
                    } else {
                        //this.colorChipChange(e);
                    }
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleChanging: {
        value: function (e) {
            if (e._event.hsv) {
                //
                if (e._target._colorBarCanvas && this.colorManager.input !== 'chip') {
                    this.application.ninja.colorController.colorPopupManager.hideColorPopup();
                }
                //Converting color to RGB to update buttons background colors (affecting only view)
                var color = this.colorManager.hsvToRgb(e._event.hsv.h / (Math.PI * 2), e._event.hsv.s, e._event.hsv.v), i, input = this.colorManager.input;

                if (input === 'chip') {
                    var ctx, cvs = this.currentChip.getElementsByTagName('canvas')[0];
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
                        ctx.lineTo(cvs.width - 2, 2);
                        ctx.lineTo(cvs.width - 2, cvs.height - 2);
                        ctx.lineTo(2, cvs.height - 2);
                        ctx.lineTo(2, 1);
                        ctx.stroke();
                    }
                    //Updating background color
                    if (this.colorManager.alpha && this.colorManager.alpha.value) {
                        this.currentChip.style.backgroundImage = 'none';
                        this.currentChip.style.backgroundColor = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ', ' + this.colorManager.alpha.value + ')';
                    } else {
                        this.currentChip.style.backgroundImage = 'none';
                        this.currentChip.style.backgroundColor = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ', ' + this.colorManager.alpha + ')';
                    }
                    return;
                }


                //Applying color to all buttons in array
                for (i = 0; this._buttons[input][i]; i++) {
                    //TODO: Remove this and combine to single method for live updating colors
                    //Combines with drawing routing in 'selectInputHighlight'
                    var ctx, cvs = this._buttons[input][i].getElementsByTagName('canvas')[0];
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
                        ctx.lineTo(cvs.width - 2, 2);
                        ctx.lineTo(cvs.width - 2, cvs.height - 2);
                        ctx.lineTo(2, cvs.height - 2);
                        ctx.lineTo(2, 1);
                        ctx.stroke();
                    }
                    //Updating background color
                    if (this.colorManager.alpha && this.colorManager.alpha.value) {
                        this._buttons[input][i].style.backgroundImage = 'none';
                        this._buttons[input][i].style.backgroundColor = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ', ' + this.colorManager.alpha.value + ')';
                    } else {
                        this._buttons[input][i].style.backgroundImage = 'none';
                        this._buttons[input][i].style.backgroundColor = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ', ' + this.colorManager.alpha + ')';
                    }
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleResize: {
        value: function (e) {this._killPopup(e);}
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleScroll: {
        value: function (e) {this._killPopup(e);}
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleClick: {
        value: function (e) {
            //TODO: Fix this HACK
            if (this._popupPanel.opened || this._popupChip.opened) {
                this._killPopup(e);
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _killPopup: {
        value: function (e) {
            this.application.ninja.colorController.colorPopupManager.hideColorPopup();
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    selectInputType: {
        value: function (type) {
        	if (this.colorManager.input === 'chip') {
            	this.application.ninja.colorController.colorPopupManager.hideColorPopup();
           		return;
           	}
            //Checking for the type to be formatted as expected, otherwise we unselected all buttons
            try {
                type._event.srcElement.inputType;
            } catch (err) {
                if (this.colorManager.colorHistory['stroke'].length) {
                    if (this.colorManager.colorHistory['stroke'][this.colorManager.colorHistory['stroke'].length - 1].m === 'nocolor') {
                        iColor = true;
                    } else {
                        iColor = false;
                    }
                }
                this.selectInputHighlight(null, this._buttons['stroke'], false, iColor);
                if (this.colorManager.colorHistory['fill'].length) {
                    if (this.colorManager.colorHistory['fill'][this.colorManager.colorHistory['fill'].length - 1].m === 'nocolor') {
                        oColor = true;
                    } else {
                        oColor = false;
                    }
                }
                //
                this.selectInputHighlight(null, this._buttons['fill'], false, oColor);
                return;
            }
            //
            var color, iColor, oColor, other, input = type._event.srcElement.inputType.toLowerCase();
            //Setting help variable (opposite type)
            if (input === 'stroke') {
                other = 'fill';
            } else if (input === 'fill') {
                other = 'stroke';
            }
            //TODO: Change popup to use montage's built in popup
            if (this.colorManager.input === input) {
                //
                if (type._event.srcElement.popup) {
                    //
                    if (type._event.clientX && type._event.clientY) {
                        //
                        //if (type._event.clientX > (parseInt(document.width)/2)) {
                        //TODO: Fix offset hack
                        this.application.ninja.colorController.colorPopupManager.showColorPopup((type._event.clientX - type._event.offsetX) + 'px', (type._event.target.clientHeight / 2 + type._event.clientY - type._event.offsetY) + 'px', 'right', 'top');
                        //} else {
                        //
                        //	this.application.ninja.colorController.colorPopupManager.showColorPopup((type._event.clientX - type._event.offsetX)+parseInt(type._event.target.offsetWidth)+'px', (type._event.target.offsetHeight/2+type._event.clientY - type._event.offsetY)+'px', 'left', 'top');
                        //}
                    }
                }
            } else {
                //TODO: Change popup to use montage's built in popup
                this.application.ninja.colorController.colorPopupManager.hideColorPopup();
                //
                this.colorManager.input = input;
                color = this.colorManager.colorHistory[input][this.colorManager.colorHistory[input].length - 1];
                color.c.wasSetByCode = true;
                color.c.type = 'change';
                switch (color.m) {
                    case 'rgb':
                        this.colorManager.alpha = { value: color.a, wasSetByCode: true, type: 'change' };
                        this.colorManager.rgb = color.c;
                        break;
                    case 'hsl':
                        this.colorManager.alpha = { value: color.a, wasSetByCode: true, type: 'change' };
                        this.colorManager.hsl = color.c;
                        break;
                    case 'hex':
                        //TODO: Check if anything needed here
                        break;
                    case 'gradient':
                        this.colorManager.gradient = color.c;
                        break;
                    case 'hsv':
                        this.colorManager.alpha = { value: color.a, wasSetByCode: true, type: 'change' };
                        this.colorManager.hsv = color.c;
                        break;
                    default:
                        this.colorManager.applyNoColor(true);
                        break;
                }
                //

            }
            if (this.colorManager.colorHistory[input].length) {
                if (this.colorManager.colorHistory[input][this.colorManager.colorHistory[input].length - 1].m === 'nocolor') {
                    iColor = true;
                } else {
                    iColor = false;
                }
            }
            if (this.colorManager.colorHistory[other].length) {
                if (this.colorManager.colorHistory[other][this.colorManager.colorHistory[other].length - 1].m === 'nocolor') {
                    oColor = true;
                } else {
                    oColor = false;
                }
            }
            //
            this.selectInputHighlight(this._buttons[input], this._buttons[other], iColor, oColor);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Creating button highlight via drawing on inner canvas
    selectInputHighlight: {
        value: function (selected, unselected, selNoColor, unselNoColor) {
            var cvs, ctx;
            //Looping through canvases of selected buttons
            for (i = 0; selected && selected[i]; i++) {
                cvs = selected[i].hasChildNodes();
                //Checking for button to have canvas to draw
                if (cvs) {
                    cvs = selected[i].getElementsByTagName('canvas')[0];
                    ctx = cvs.getContext('2d');
                    ctx.clearRect(0, 0, cvs.width, cvs.height);
                    cvs.width = parseInt(window.getComputedStyle(selected[i]).width);
                    cvs.height = parseInt(window.getComputedStyle(selected[i]).height);
                    if (selNoColor) {
                        //this.drawButtonNoColor(selected[i], cvs);
                        ctx.beginPath();
                        ctx.moveTo(2, cvs.height - 2);
                        ctx.lineTo(cvs.width - 2, 2);
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = "#FF0000";
                        ctx.stroke();
                        selected[i].style.backgroundColor = 'white';
                        selected[i].style.backgroundImage = 'none';
                    }
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
                    ctx.lineTo(cvs.width - 2, 2);
                    ctx.lineTo(cvs.width - 2, cvs.height - 2);
                    ctx.lineTo(2, cvs.height - 2);
                    ctx.lineTo(2, 1);
                    ctx.stroke();
                } else {
                    //Adding class to buttons with no canvas						
                    selected[i].className = selected[i].className + ' selected';
                }
            }
            //Looping through unselected buttons
            for (i = 0; unselected && unselected[i]; i++) {
                cvs = unselected[i].hasChildNodes();
                if (cvs) {
                    cvs = unselected[i].getElementsByTagName('canvas')[0];
                    ctx = cvs.getContext('2d');
                    ctx.clearRect(0, 0, cvs.width, cvs.height);
                } else {
                    unselected[i].className = unselected[i].className.replace(/(selected)/gm, "");
                }
                if (unselNoColor && cvs && unselected[i]) {
                    //this.drawButtonNoColor(unselected[i], cvs);
                    ctx.beginPath();
                    ctx.moveTo(0, cvs.height);
                    ctx.lineTo(cvs.width, 0);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "#FF0000";
                    ctx.stroke();
                    unselected[i].style.backgroundColor = 'white';
                    unselected[i].style.backgroundImage = 'none';
                }
            }
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////