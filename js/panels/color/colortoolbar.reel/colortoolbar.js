/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 			require("montage/core/core").Montage,
	Component = 		require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//
exports.ColorToolbar = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
        value: true
    },
    ////////////////////////////////////////////////////////////////////
    //Storing stroke (stores color in mode use to select color)
    _stroke: {
        enumerable: false,
        value: {colorMode: 'rgb', color: {r: 0, g: 0, b: 0, a: 1, css: 'rgb(0,0,0)', mode:'rgb', wasSetByCode: true, type: 'change'}, webGlColor: [0, 0, 0, 1]}
    },
    ////////////////////////////////////////////////////////////////////
    //
    stroke: {
    	enumerable: true,
        get: function() {
            return this._stroke;
        },
        set: function(value) {
        	if (value !== this._stroke) {
        		this._stroke = value;
        	}
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Storing fill (stores color in mode use to select color)
    _fill: {
        enumerable: false,
        value: {colorMode: 'rgb', color: {r: 255, g: 255, b: 255, a: 1, css: 'rgb(255,255,255)', mode:'rgb', wasSetByCode: true, type: 'change'}, webGlColor: [1, 1, 1, 1]}
    },
    ////////////////////////////////////////////////////////////////////
    //
    fill: {
    	enumerable: true,
        get: function() {
            return this._fill;
        },
        set: function(value) {
        	if (value !== this._fill) {
        		this._fill = value;
        	}
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    prepareForDraw: {
    	enumerable: false,
    	value: function () {
    		//
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    willDraw: {
    	enumerable: false,
    	value: function() {
    		//
    		var buttons = this.element.getElementsByTagName('button');
    		//
    		this.fill_btn = buttons [1];
    		this.stroke_btn = buttons[0];
    		//
    		this.fill_btn.props = {side: 'left', align: 'top', wheel: true, palette: true, gradient: false, image: false, nocolor: true, offset: 20};
    		this.stroke_btn.props = {side: 'left', align: 'top', wheel: true, palette: true, gradient: false, image: false, nocolor: true, offset: 20};
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    draw: {
    	enumerable: false,
    	value: function() {
    		//
    		this.application.ninja.colorController.addButton('chip', this.fill_btn);
            this.application.ninja.colorController.addButton('chip', this.stroke_btn);
            //
            this.fill_btn.color('rgb', {wasSetByCode: true, type: 'change', color: {r: 255, g: 255, b: 255}, css: 'rgb(255,255,255)'});
            this.stroke_btn.color('rgb', {wasSetByCode: true, type: 'change', color: {r: 0, g: 0, b: 0}, css: 'rgb(0,0,0)'});
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    didDraw: {
    	enumerable: false,
    	value: function() {

    		this.fill_btn.addEventListener('change', function (e) {
                this.fill = e._event;
                this.fill.webGlColor = this.application.ninja.colorController.colorModel.colorToWebGl(e._event.color);
            	this.application.ninja.colorController.colorModel.input = 'fill';

                var color = e._event.color;
            	if (e._event.colorMode !== 'nocolor' && color) {
            		color.wasSetByCode = false;
	            	color.type = 'change';
	            	color.mode = e._event.colorMode;
            		this.application.ninja.colorController.colorModel[e._event.colorMode] = color;
            	} else {
            		this.application.ninja.colorController.colorModel.applyNoColor(false);
            	}
            	this.application.ninja.colorController.colorModel.input = 'chip';
       		}.bind(this));

            this.stroke_btn.addEventListener('change', function (e) {
            	this.stroke = e._event;
                this.stroke.webGlColor = this.application.ninja.colorController.colorModel.colorToWebGl(e._event.color);
            	this.application.ninja.colorController.colorModel.input = 'stroke';

            	var color = e._event.color;
            	if (e._event.colorMode !== 'nocolor' && color) {
            		color.wasSetByCode = false;
            		color.type = 'change';
                    color.mode = e._event.colorMode;
            		this.application.ninja.colorController.colorModel[e._event.colorMode] = color;
           		} else {
           			this.application.ninja.colorController.colorModel.applyNoColor(false);
           		}
            	this.application.ninja.colorController.colorModel.input = 'chip';
            }.bind(this));
    	}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////