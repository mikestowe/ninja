/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

exports.transitionPresets = {
    "text": "Transition Presets Library",
    "children": [{
        "text": "Opacity Transitions",
        "children": [
            {
                "text": "Fade In",
                "selectorBase" : "fade-in",
                "rules" : [{
                    "styles" : {
                        "opacity": "0.25",
                        "-webkit-transition": "all 0.4s ease-in"
                    }
                }, {
                    "selectorSuffix" : ":hover",
                    "styles" : {
                        "opacity": "1"
                    }
                }]
            },
            {
                "text": "Fade Out",
                "selectorBase" : "fade-out",
                "rules" : [{
                    "styles" : {
                        "opacity": "1",
                        "-webkit-transition": "all 0.4s ease-in"
                    }
                }, {
                    "selectorSuffix" : ":hover",
                    "styles" : {
                        "opacity": "0"
                    }
                }]
            }]
    }, {
        "text": "Transform Transitions",
        "children": [
            {
                "text": "Slide Right",
                "selectorBase" : "slide-right",
                "rules" : [{
                    "styles" : {
                        "-webkit-transition": "all 0.4s ease-in"
                    }
                }, {
                    "selectorSuffix": ":hover",
                    "styles" : {
                        "-webkit-transform": "translateX(300px)"
                    }
                }]
            },
            {
                "text": "Slide Left",
                "selectorBase" : "slide-left",
                "rules" : [{
                    "styles" : {
                        "-webkit-transition": "all 0.4s ease-in"
                    }
                }, {
                    "selectorSuffix" : ":hover",
                    "styles" : {
                        "-webkit-transform": "translateX(-300px)"
                    }
                }]
            },
            {
                "text": "Rotate",
                "selectorBase" : "rotate",
                "rules" : [{
                    "styles" : {
                        "-webkit-transition": "all 0.4s ease-in"
                    }
                }, {
                    "selectorSuffix" : ":hover",
                    "styles" : {
                        "-webkit-transform": "rotate(180deg)"
                    }
                }]
            },{
                "text": "Scale Up",
                "selectorBase" : "scale-up",
                "rules" : [{
                    "styles" : {
                        "-webkit-transition": "-webkit-transform 0.4s ease-in"
                    }
                }, {
                    "selectorSuffix" : ":hover",
                    "styles" : {
                        "-webkit-transform": "scale(1.4)"
                    }
                }]
            },
            {
                "text": "Scale Down",
                "selectorBase" : "scale-down",
                "rules" : [{
                    "styles" : {
                        "-webkit-transition": "-webkit-transform 0.4s ease-in"
                    }
                }, {
                    "selectorSuffix" : ":hover",
                    "styles" : {
                        "-webkit-transform": "scale(.5)"
                    }
                }]
            },
            {
                "text": "Remove 3D",
                "selectorBase" : "remove-3d",
                "rules" : [{
                    "styles" : {
                        "-webkit-transition": "all 0.4s ease-in"
                    }
                },
                    {
                    "selectorSuffix" : ":hover",
                    "styles" : {
                        "-webkit-transform": "rotateX(0deg)",
                        "opacity": "1"
                    }
                }]
            }]
    }]
};
