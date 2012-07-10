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
var Montage =               require("montage/core/core").Montage,
    Component =             require("montage/ui/component").Component,
    ColorModel =            require("js/models/color-model").ColorModel,
    ColorPanelBase =        require("js/panels/Color/colorpanelbase.reel").ColorPanelBase,
    ElementsMediator =      require("js/mediators/element-mediator").ElementMediator,
    ColorPopupManager =     require("js/panels/Color/colorpopup-manager").ColorPopupManager,
    ColorButtonManager =    require("js/panels/Color/colorbutton-manager").ColorButtonManager;
////////////////////////////////////////////////////////////////////////
//Exporting as ColorController
exports.ColorController = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //
    hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    deserializedFromTemplate: {
        value: function () {
            //Setting up colorManager in other classes
            this.colorPanelBase.colorManager = this.colorModel;
            this.colorPopupManager.colorManager = this.colorModel;
            this.colorButtonManager.colorManager = this.colorModel;
            //Listening for color changes
            this.colorModel.addEventListener('change', this, false);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorModel: {
        value: ColorModel
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorPanelBase: {
        value: ColorPanelBase
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorPopupManager: {
        value: ColorPopupManager
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorButtonManager: {
        value: ColorPopupManager
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorView: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorToolbar: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _popupTab: {
        value: 'wheel'
    },
    ////////////////////////////////////////////////////////////////////
    //
    popupTab: {
        get: function() {return this._popupTab;},
        set: function(value) {this._popupTab = value.toLowerCase();}
    },
    ////////////////////////////////////////////////////////////////////
    //
    addButton: {
        value: function (type, button) {
            if (this.colorView) {
                this.colorView.addButton(type, button);
                return true;
            } else if (this.ColorPanelBase) {
                this.ColorPanelBase.addButton(type, button);
                return true;
            } else {
                return false;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    removeButton: {
        value: function (type, button) {
            if (this.colorView) {
                this.colorView.removeButton(type, button);
                return true;
            } else if (this.ColorPanelBase) {
                this.ColorPanelBase.removeButton(type, button);
                return true;
            } else {
                return false;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _fill: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    fill: {
        get: function() {return this._fill;},
        set: function(value) {this._fill = value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _stroke: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    stroke: {
        get: function() {return this._stroke;},
        set: function(value) {this._stroke = value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    getBackground: {
        value: function (element) {
            //TODO: Return object with all background properties
            console.log(ElementsMediator.getProperty(element, 'background-color'));
            console.log(ElementsMediator.getProperty(element, 'background-image'));
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    getBorder: {
        value: function (element) {

        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    setColor: {
        value: function (mode, color, isFill, selection) {
            var elements;
            //The selection is optional, if none, it asks for the currently selected elements
            if (selection) {
                elements = selection;
            } else {
                elements = this.application.ninja.selectedElements;
            }
            if (elements && elements.length) {
                var colorInfo = { mode:mode,
                               color:color
                             };
                ElementsMediator.setColor(elements, colorInfo, isFill, "Change", "color-controller");
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleChange: {
        value: function (e) {
            //
            var color, input = e._event.input, panelMode, mode = e._event.mode;
            if (this.colorView) {
                panelMode = this.colorView.panelMode;
            }
            //
            if (mode === 'nocolor') {
                color = {value: null, css: 'none'};
            } else if (panelMode === 'rgb' && e._event.rgba && mode !== 'gradient') {
                color = e._event.rgba;
                color.webGlColor = e._event.webGlColor;
            } else if (panelMode === 'hsl' && e._event.hsla && mode !== 'gradient') {
                color = e._event.hsla;
                color.webGlColor = e._event.webGlColor;
            } else if (mode !== 'gradient'){
                color = {value: e._event.hex, css: '#'+e._event.hex};
            } else if (mode === 'gradient'){
                color = e._event.value.value;
            }
            color.mode = panelMode;
            color.wasSetByCode = true;
            color.type = "change";
            ////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////
            //
            if (input === 'fill') {
                //
                this.fill = color;
                //
                if(e._event.wasSetByCode) return;
                //
                this.setColor(mode, color, true);
            } else if (input === 'stroke') {
                //
                this.stroke = color;
                //
                if(e._event.wasSetByCode) return;

                this.setColor(mode, color, false);
            }
            ////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Converts CSS to a color object to be used by the color model
    getColorObjFromCss: {
        value: function (css) {
            //
            var color, arr, i, j, temp, c, gradient;
            //console.log(css.indexOf('-webkit'), css);
            if (css && css.indexOf('-webkit') >= 0) {
                //
                gradient = {mode: null, stops: null};
                //Checking for gradient type
                if (css.indexOf('-webkit-radial-gradient') >= 0) {
                    //Radial gradient
                    gradient.stops = [];
                    gradient.mode = 'radial';
                    gradient.gradientMode = 'radial';
                    gradient.css = css;
                    //
                    arr = css.split('%,');
                    //
                    for (j=1; arr[j]; j++) {
                        //TODO: Add HSL support
                        if (arr[j].indexOf('rgb') >= 0 && arr[j].indexOf('rgba') < 0) {
                            temp = arr[j].split('rgb');
                            temp = temp[1].replace(/\(/i, "");
                            temp = temp.split(')');
                            c = this.parseCssToColor('rgb('+temp[0]+')');
                            gradient.stops.push({css: c.css, value: c.value, mode: c.mode, position: parseInt(temp[1].replace(/\%/i, ""))});
                        } else if (css.indexOf('rgba') >= 0) {

                            temp = arr[j].split('rgba');
                            temp = temp[1].replace(/\(/i, "");
                            temp = temp.split(')');
                            c = this.parseCssToColor('rgba('+temp[0]+')');
                            gradient.stops.push({css: c.css, value: c.value, mode: c.mode, position: parseInt(temp[1].replace(/\%/i, ""))});
                        }
                    }
                } else if (css.indexOf('-webkit-gradient') >= 0) {
                    //Linear gradient
                    gradient.stops = [];
                    gradient.mode = 'linear';
                    gradient.gradientMode = 'linear';
                    gradient.css = css;
                    //
                    arr = css.split('from(');
                    //
                    if (arr.length > 1) {
                        arr = arr[1].split('),');
                    } else {
                        arr = (css.split(css.split('color-stop(')[0])[1]).split('),');
                    }
                    //
                    for (i=0; arr[i]; i++) {
                        arr[i] = arr[i].replace(/ color-stop\(/i, "");
                        //
                        if (arr[i].indexOf('to(') >= 0) {
                            arr[i] = arr[i].replace(/ to\(/i, "");
                            arr[i] = arr[i].replace(/\)\)/i, "");
                        }
                        //
                        if (i === 0 && arr[i].indexOf('color-stop') === -1) {
                            arr[i] = {css: arr[i], percent: 0};
                        } else if (i === arr.length-1) {
                            temp = arr[i].split(', rgb');
                            if (temp.length > 1) {
                                arr[i] = {css: 'rgb'+temp[1].replace(/\)\)/i, ""), percent: Math.round(parseFloat(temp[0])*100)};
                            } else {
                                arr[i] = {css: arr[i], percent: 100};
                            }
                        } else {
                            //
                            if (arr[i].indexOf('rgb') >= 0 && arr[i].indexOf('rgba') < 0) {
                                temp = arr[i].split(', rgb');
                                temp[0] = temp[0].replace(/color\-stop\(/gi, '');
                                arr[i] = {css: 'rgb'+temp[1], percent: Math.round(parseFloat(temp[0])*100)};
                            } else if (arr[i].indexOf('rgba') >= 0) {
                                temp = arr[i].split(', rgba');
                                arr[i] = {css: 'rgba'+temp[1], percent: Math.round(parseFloat(temp[0])*100)};
                            }
                        }
                        //
                        c = this.parseCssToColor(arr[i].css);
                        gradient.stops.push({css: c.css, value: c.value, mode: c.mode, position: arr[i].percent});
                    }
                }
                //Creating gradient object
                color = {mode: 'gradient', value: {stops: gradient.stops, mode: gradient.mode, gradientMode: gradient.gradientMode, css: css}};
            } else if (css){
                //Simple solid color
                color = this.parseCssToColor(css);
            }
            // TODO - Hack for inconsistent color object -- some workflows set color.color and some color.value
            if(color)
            {
                if(color.value && !color.color)
                {
                    color.color = color.value;
                }
                else if(color.color && !color.value)
                {
                    color.value = color.color;
                }
            }
            //Returning color object (or null if none)
            return color;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Parses simple solid CSS string into color object
    parseCssToColor: {
        value: function (css) {
            var color, r, p;
            //Parsing string and converting into color object
            if (css.indexOf('#') >= 0) {
                color = {mode: 'hex', css: css, value: css.split('#')[1]};
            } else if (css.indexOf('rgb') >= 0 && css.indexOf('rgba') < 0) {
                r = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
                p = css.match(r);
                color = {mode: 'rgb', css: css, value: {css: css, r: parseInt(p[1]), g: parseInt(p[2]), b: parseInt(p[3]), a: 1}};
            } else if (css.indexOf('rgba') >= 0) {
                r = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d+)\)$/;
                p = css.match(r);
                color = {mode: 'rgb', css: css, value: {css: css, r: parseInt(p[1]), g: parseInt(p[2]), b: parseInt(p[3]), a: parseFloat(p[4])}};
            } else if (css.indexOf('hsl') >= 0 && css.indexOf('hsla') < 0) {
                r = /^hsl\((\d+),\s*(\d+),\s*(\d+)\)$/;
                p = css.match(r);
                color = {mode: 'hsl', css: css, value: {css: css, h: parseInt(p[1]), s: parseInt(p[2]), l: parseInt(p[3]), a: 1}};
            } if (css.indexOf('hsla') >= 0) {
                r = /^hsla\((\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d+)\)$/;
                p = css.match(r);
                color = {mode: 'hsl', css: css, value: {css: css, h: parseInt(p[1]), s: parseInt(p[2]), l: parseInt(p[3]), a: parseFloat(p[4])}};
            }
            //Must be a valid CSS or null will be returned
            return color;
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
