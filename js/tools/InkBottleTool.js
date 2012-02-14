/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ModifierToolBase = require("js/tools/modifier-tool-base").ModifierToolBase,
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

exports.InkBottleTool = Montage.create(ModifierToolBase, {
	_canSnap: { value: false },
	_canColor: { value: true },

    HandleMouseMove: {
        value : function (event)
		{
            var obj = this.application.ninja.stage.GetElement(event);
            var cursor = "url('images/cursors/ink.png') 17 12, default";
            var canColor = true;
            if (obj)
            {
                var name = obj.nodeName;
                if ((name !== 'CANVAS') && (name !== 'DIV'))
                {
                    cursor = "url('images/cursors/ink_no.png') 17 12, default";
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

            if(this._canColor)
            {
//                var color = this.application.ninja.colorController.colorToolbar.stroke;
//                ElementsMediator.setColor(this.application.ninja.selectedElements, color, false, "Change", "inkBottleTool");

                var strokeInfo = {  borderStyle:this.options._borderStyle.value,
                                    borderWidth:this.options._borderWidth.value,
                                    borderUnits:this.options._borderWidth.units,
                                    strokeSize:this.options._strokeSize.value,
                                    strokeUnits:this.options._strokeSize.units,
                                    color:this.application.ninja.colorController.colorToolbar.stroke
                                 };

                ElementsMediator.setStroke(this.application.ninja.selectedElements, strokeInfo, "Change", "inkBottleTool");
            }
        }
    }

});