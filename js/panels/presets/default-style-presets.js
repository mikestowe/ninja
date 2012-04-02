/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

exports.stylePresets = {
    "text": "Style Presets Library",
    "children": [{
        "text": "Box Styles",
        "children": [
            {
                "text": "Border-Radius",
                "id": "njBorderRadius",
                "selectorBase" : "border-radius-preset",
                "rules" : [{
                    "styles" : {
                        "border-radius": "100px",
                        "border" : "1px solid #333"
                    }
                }]
            },
            {
                "text": "Drop Shadow",
                "id": "njDropShadow",
                "selectorBase" : "drop-shadow",
                "rules" : [{
                    "styles" : {
                        "box-shadow": "2px 2px 50px rgba(0,0,0,0.5)",
                        "border" : "1px solid #CCC"
                    }
                }]
            },
            {
                "text": "Fancy Box",
                "id": "njFancyBox",
                "selectorBase" : "fancy-box",
                "rules" : [{
                    "selectorSuffix": "",
                    "styles" : {
                        "box-shadow": "inset 0 0 0 1px #666, inset 0 0 0 2px rgba(225, 225, 225, 0.4), 0 0 20px -10px #333",
                        "border" : "1px solid #FFF",
                        "border-radius": "30px",
                        "background-color": "#7db9e8",
                        "background-image": "-webkit-linear-gradient(top, rgba(255,255,255,0.74) 0%,rgba(255,255,255,0) 100%)"
                    }
                }]
            }]
    }, {
        "text": "Font Styles",
        "children": [
            {
                "text": "Italic",
                "id": "njItalic",
                "selectorBase" : "italicize",
                "rules" : [{
                    "styles" : {
                        "font-style": "italic"
                    }
                }]
            },
            {
                "text": "Text Shadow",
                "id": "njTextShadow",
                "selectorBase" : "italicize",
                "rules" : [{
                    "styles" : {
                        "text-shadow": "1px 1px 3px #333"
                    }
                }]
            },
            {
                "text": "White Sans-Serif",
                "selectorBase" : "white-sans-serif",
                "rules" : [{
                    "selectorSuffix" : "",
                    "styles" : {
                        "color": "#FFFFFF",
                        "font-family": "helvetica,arial,sans-serif"
                    }
                },
                {
                    "selectorSuffix" : " h2",
                    "styles" : {
                        "color": "#C1C1C1",
                        "font-family": "helvetica,arial,sans-serif"
                    }
                }]
            }]
    }]
};