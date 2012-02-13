/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator,

    toolBase = require("js/tools/ToolBase").toolBase;

exports.EyedropperTool = Montage.create(toolBase, {

    _isMouseDown: { value: false },
    _previousColor: { value: null},
    _color: { value: null},

    Configure: {
        value: function ( doActivate )
		{
			if (doActivate)
			{
                NJevent("enableStageMove");
			}
			else
			{
                NJevent("disableStageMove");
			}
        }
    },

    HandleLeftButtonDown: {
        value : function ( event ) {
            this._isMouseDown = true;
            this._previousColor =
                this.application.ninja.colorController[this.application.ninja.colorController.colorModel.input].css;

            this._updateColorFromPoint(event);
       }
    },

    HandleMouseMove: {
        value : function (event)
		{
            if(this._escape)
            {
                this._isMouseDown = false;
                this._escape = false;
            }
            if(this._isMouseDown)
            {
                this._updateColorFromPoint(event);
            }
		}
	},

    HandleLeftButtonUp: {
        value : function (event) {
			{
                this._isMouseDown = false;

                if(this._escape)
                {
                    this._escape = false;
                }

                this._updateColor(this._color);

                this._color = null;
            }
        }
    },

    HandleEscape: {
        value: function(event) {
            if(this._color && this._color.value)
            {
                var color = this.application.ninja.colorController.getColorObjFromCss(this._previousColor);

                if (color && color.value) {
                    color.value.wasSetByCode = true;
                    color.value.type = 'change';
                    if (color.value.a) {
                        this.application.ninja.colorController.colorModel.alpha = {value: color.value.a,
                                                                                    wasSetByCode: true,
                                                                                    type: 'change'};
                    }
                    this.application.ninja.colorController.colorModel[color.mode] = color.value;
                    this._color = null;
                }
            }
            this._escape = true;
        }
    },

    _updateColorFromPoint: {
        value : function (event) {
            var obj = this.application.ninja.stage.GetElement(event);
            if (obj)
            {
                // TODO - figure out if user clicked on a border - for now, just get fill
                var c = ElementsMediator.getColor(obj, true);
                if(c)
                {
                    var color = this.application.ninja.colorController.getColorObjFromCss(c.color.css);
                    if (color && color.value) {
                        color.value.wasSetByCode = true;
                        color.value.type = 'changing';
                        if (color.value.a) {
                            this.application.ninja.colorController.colorModel.alpha = {value: color.value.a,
                                                                                        wasSetByCode: true,
                                                                                        type: 'changing'};
                        }
                        this.application.ninja.colorController.colorModel[color.mode] = color.value;
                        this._color = color;
                    }
                }
            }
        }
    },

    _updateColor: {
        value: function(color) {
            if (color && color.value) {
                var input = this.application.ninja.colorController.colorModel.input;

                if(input === "fill")
                {
                    this.application.ninja.colorController.colorToolbar.fill_btn.color(color.mode, color.value);
                }
                else
                {
                    this.application.ninja.colorController.colorToolbar.stroke_btn.color(color.mode, color.value);
                }

                // Updating color chips will set the input type to "chip", so set it back here.
                this.application.ninja.colorController.colorModel.input = input;

                color.value.wasSetByCode = true;
                color.value.type = 'change';
                if (color.value.a) {
                    this.application.ninja.colorController.colorModel.alpha = {value: color.value.a,
                                                                                wasSetByCode: true,
                                                                                type: 'change'};
                }
                this.application.ninja.colorController.colorModel[color.mode] = color.value;
                this._previousColor = color.value.css;
            }
        }
    }

});