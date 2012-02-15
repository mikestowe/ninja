/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;

exports.ToolsData = Montage.create(Montage, {

    defaultToolsData: {
        value: [
            {
                "id":           "SelectionTool",
                "properties":   "selectionProperties",
                "spriteSheet":  true,
                "action":       "SelectionTool",
                "toolTip":      "Selection Tool (V)",
                "cursor":       "auto",
                "lastInGroup":  false,
                "container":    false,
                "selected":     true
            },
            {
                "id":           "SubselectionTool",
                "properties":   "subSelectionProperties",
                "spriteSheet":  true,
                "action":       "SubselectionTool",
                "toolTip":      "Subselect Tool",
                "cursor":       "auto",
                "lastInGroup":  false,
                "container":    false,
                "selected":     false
            },
            {
                "id":           "RotateTool3D",
                "properties":   "rotate3DProperties",
                "spriteSheet":  true,
                "action":       "Rotate3DTool",
                "toolTip":      "3D Rotate Object Tool (W)",
                "cursor":       "auto",
                "lastInGroup":  false,
                "container":    false,
                "selected":     false
            },
            {
                "id":           "Translate3D",
                "properties":   "translate3DProperties",
                "spriteSheet":  true,
                "action":       "Translate3DTool",
                "toolTip":      "3D Translate Object Tool (G)",
                "cursor":       "auto",
                "lastInGroup":  true,
                "container":    false,
                "selected":     false
            },
            {
                "id":           "TagTool",
                "properties":   "tagProperties",
                "spriteSheet":  true,
                "action":       "TagTool",
                "toolTip":      "Tag Tool (D)",
                "cursor":       "url('images/cursors/Crosshair.png') 8 8, default",
                "lastInGroup":  false,
                "container":    false,
                "selected":     false
            },
            {
                "id":           "PenTool",
                "properties":   "penProperties",
                "spriteSheet":  true,
                "action":       "PenTool",
                "toolTip":      "Pen Tool",
                "cursor":       "auto",
                "lastInGroup":  false,
                "container":    false,
                "selected":     false
            },
            {
                "id":           "TextTool",
                "properties":   "textProperties",
                "spriteSheet":  true,
                "action":       "TextTool",
                "toolTip":      "Text Tool",
                "cursor":       "text",
                "lastInGroup":  false,
                "container":    false,
                "selected":     false
            },
            {
                "id":           "ShapeContainer",
                "properties":   "shapeProperties",
                "cursor":       "url('images/cursors/Crosshair.png') 8 8, default",
                "lastInGroup":  false,
                "container":    true,
                "subtools":     [{  "id":           "OvalTool",
                                    "properties":   "ovalProperties",
                                    "spriteSheet":  true,
                                    "action":       "OvalTool",
                                    "toolTip":      "Oval Tool (O)",
                                    "lastInGroup":  false,
                                    "container":    false,
                                    "selected":     false
                                },
                                {
                                    "id":           "RectangleTool",
                                    "properties":   "rectProperties",
                                    "spriteSheet":  true,
                                    "action":       "RectTool",
                                    "toolTip":      "Rectangle Tool (R)",
                                    "lastInGroup":  false,
                                    "container":    false,
                                    "selected":     true
                                },
                                {
                                    "id":           "LineTool",
                                    "properties":   "lineProperties",
                                    "spriteSheet":  true,
                                    "action":       "LineTool",
                                    "toolTip":      "Line Tool (L)",
                                    "lastInGroup":  false,
                                    "container":    false,
                                    "selected":     false
                                }],
                "selected":     false
            },
            {
                "id":           "PencilTool",
                "properties":   "pencilProperties",
                "spriteSheet":  true,
                "action":       "PencilTool",
                "toolTip":      "Pencil Tool",
                "cursor":       "auto",
                "lastInGroup":  false,
                "container":    false,
                "selected":     false
            },
            {
                "id":           "BrushTool",
                "properties":   "brushProperties",
                "spriteSheet":  true,
                "action":       "BrushTool",
                "toolTip":      "Brush Tool",
                "cursor":       "url('images/tools/brush_down.png'), default",
                "lastInGroup":  false,
                "container":    false,
                "selected":     false
            },
            {
                "id":           "FillTool",
                "properties":   "fillProperties",
                "spriteSheet":  true,
                "action":       "FillTool",
                "toolTip":      "Fill Tool",
                "cursor":       "url('images/tools/bucket_down.png'), default",
                "lastInGroup":  false,
                "container":    false,
                "selected":     false
            },
//            {
//                "id":           "InkBottleTool",
//                "properties":   "inkbottleProperties",
//                "spriteSheet":  true,
//                "action":       "InkBottleTool",
//                "toolTip":      "Ink Bottle Tool",
//                "cursor":       "url('images/tools/inkbottle_down.png'), default",
//                "lastInGroup":  false,
//                "container":    false,
//                "selected":     false
//            },
//            {
//                "id":           "EyedropperTool",
//                "properties":   "eyedropperProperties",
//                "spriteSheet":  true,
//                "action":       "EyedropperTool",
//                "toolTip":      "Eyedropper Tool",
//                "cursor":       "url('images/tools/eyedropper_down.png'), default",
//                "lastInGroup":  false,
//                "container":    false,
//                "selected":     false
//            },
//            {
//                "id":           "EraserTool",
//                "properties":   "eraserProperties",
//                "spriteSheet":  true,
//                "action":       "EraserTool",
//                "toolTip":      "Eraser Tool",
//                "cursor":       "auto",
//                "lastInGroup":  false,
//                "container":    false,
//                "selected":     false
//            },
            {
                "id":           "RotateStageTool3D",
                "properties":   "rotateStageProperties",
                "spriteSheet":  true,
                "action":       "RotateStageTool3D",
                "toolTip":      "3D Rotate Stage Tool",
                "cursor":       "auto",
                "lastInGroup":  false,
                "container":    false,
                "selected":     false
            },
            {
                "id":           "PanTool",
                "properties":   "panProperties",
                "spriteSheet":  true,
                "action":       "PanTool",
                "toolTip":      "Hand Tool (H)",
                "cursor":       "url('images/tools/hand_down.png'), default",
                "lastInGroup":  false,
                "container":    false,
                "selected":     false
            },
            {
                "id":           "ZoomTool",
                "properties":   "zoomProperties",
                "spriteSheet":  true,
                "action":       "ZoomTool",
                "toolTip":      "Zoom Tool (Z)",
                "cursor":       "url('images/cursors/zoom.png'),default",
                "lastInGroup":  false,
                "container":    false,
                "selected":     false
            }
        ]
    },

    selectedTool : {
        value: null
    },

    selectedSubTool : {
        value: null
    },

    defaultSubToolsData : {
        value: null
    },

    selectedToolInstance : {
        value: null
    }
    
});