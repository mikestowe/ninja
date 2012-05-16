/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ModifierToolBase = require("js/tools/modifier-tool-base").ModifierToolBase,
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

exports.FillTool = Montage.create(ModifierToolBase, {
	_canSnap: { value: false },
	_canColor: { value: true },
	_targetedElement: { value: null },

    HandleMouseMove: {
        value : function (event)
		{
            var obj = this.application.ninja.stage.getElement(event, true);
            var cursor = "url('images/cursors/fill.png') 14 14, default";
            var canColor = true;
            if (obj)
            {
                var name = obj.nodeName;
                if ((name !== 'CANVAS') && (name !== 'DIV'))
                {
                    cursor = "url('images/cursors/nofill.png') 14 14, default";
                    canColor = false;
                    if(this._targetedElement)
                    {
                        this._targetedElement.classList.remove("active-element-outline");
                        this._targetedElement = null;
                    }
                }
                else
                {
                    if (obj !== this._targetedElement)
                    {
                        if(this._targetedElement)
                        {
                            this._targetedElement.classList.remove("active-element-outline");
                        }
                    }
                    this._targetedElement = obj;
                    this._targetedElement.classList.add("active-element-outline");
                }
            }
            this.application.ninja.stage.drawingCanvas.style.cursor = cursor;
            this._canColor = canColor;
		}
	},

    HandleLeftButtonUp: {
        value : function () {
            //if(this._isDrawing)
			{
                this.application.ninja.stage.clearDrawingCanvas();
                this._hasDraw = false;
                this._isDrawing = false;
            }
        }
    },

    // Called by modifier tool base's HandleLeftButtonDown after updating selection (if needed)
    startDraw: {
        value: function(event) {
            this.isDrawing = true;

            if(this._canColor && this.application.ninja.selectedElements.length) {

                var color = this.options.fill,
                    colorInfo;
                if(color && color.color)
                {
                    colorInfo = { mode:color.colorMode,
                                       color:color.color
                                    };
                }
                else
                {
                    colorInfo = { mode:"nocolor",
                                       color:color.color
                                    };
                }
                ElementsMediator.setColor(this.application.ninja.selectedElements, colorInfo, true, "Change", "fillTool");
            }
        }
    }
});