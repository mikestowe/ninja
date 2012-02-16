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

    HandleMouseMove: {
        value : function (event)
		{
            var obj = this.application.ninja.stage.GetElement(event);
            var cursor = "url('images/cursors/fill.png') 17 12, default";
            var canColor = true;
            if (obj)
            {
                var name = obj.nodeName;
                if ((name !== 'CANVAS') && (name !== 'DIV'))
                {
                    cursor = "url('images/cursors/nofill.png') 17 12, default";
                    canColor = false;
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

            if(this._canColor && this.application.ninja.selectedElements.length)
            {
                var color = this.application.ninja.colorController.colorToolbar.fill,
                    colorInfo;
                if(color && color.color)
                {
                    colorInfo = { mode:color.colorMode,
                                       color:color.color
                                    };
                    ElementsMediator.setColor(this.application.ninja.selectedElements, colorInfo, true, "Change", "fillTool");
                }
                else
                {
                    colorInfo = { mode:"nocolor",
                                       color:color.color
                                    };
                    ElementsMediator.setColor(this.application.ninja.selectedElements, colorInfo, true, "Change", "fillTool");
                }
            }
        }
    }

});