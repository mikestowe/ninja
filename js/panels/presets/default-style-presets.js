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
