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

exports.animationPresets = {
    "text": "Animation Presets Library",
    "children": [{
        "text": "Border Animations",
        "children": [
            {
                "text": "Border Morph",
                "selectorBase" : "border-morph",
                "rules" : [{
                    "styles" : {
                        "-webkit-animation-name": "border-morph",
                        "-webkit-animation-duration": "2s",
                        "-webkit-animation-iteration-count": "infinite"
                    }
                },
                    {
                        "isKeyFrameRule": true,
                        "keys" : [{
                            "keyText": "0%",
                            "styles": { "border-radius": "0" }
                        }, {
                            "keyText": "50%",
                            "styles": {
                                "border-radius": "100%"
                            }
                        }, {
                            "keyText": "100%",
                            "styles": {
                                "border-radius": "0%"
                            }
                        }]
                    }]
            }]
    }, {
        "text": "2D Animations",
    "children": [
        {
            "text": "Slide Out with Fade",
            "selectorBase": "slide-fade-out",
            "rules" : [{
                "selectorSuffix" : "",
                "styles" : {
                    "-webkit-animation-name": "slide-fade-out",
                    "-webkit-animation-duration": "5s",
                    "-webkit-animation-iteration-count": "infinite",
                    "-webkit-animation-direction": "normal",
                    "-webkit-animation-timing-function": "ease",
                    "-webkit-transform-style": "preserve-3d",
                    "-webkit-animation-delay": "0s"
                }
            },{
                "isKeyFrameRule": true,
                "keys" : [{
                    "keyText": "0%",
                    "styles": {
                        "opacity": "0",
                        "-webkit-transform": "translate3d(0, 0, 0)"
                    }
                }, {
                    "keyText": "10%",
                    "styles": {
                        "opacity": "1",
                        "-webkit-transform": "translate3d(0, 0, 0)"
                    }
                }, {
                    "keyText": "86%",
                    "styles": {
                        "opacity": "1",
                        "-webkit-transform": "translate3d(0, 0, 0)"

                    }
                }, {
                    "keyText": "100%",
                    "styles": {
                        "opacity": "0",
                        "-webkit-transform": "translate3d(540px, 0, 0)"
                    }
                }]
            }]
        }]
    }, {
        "text": "3D Animations",
        "children": [
            {
                "text": "Rotater",
                "selectorBase" : "rotate-with-alpha-keyframes",
                "rules" : [{
                    "styles" : {
                        "-webkit-animation-name": "rotate-with-alpha-keyframes",
                        "-webkit-animation-duration": "5s",
                        "-webkit-animation-iteration-count": "infinite",
                        "-webkit-animation-direction": "normal",
                        "-webkit-animation-timing-function": "ease-out",
                        "-webkit-transform-origin": "100% 50%",
                        "-webkit-transform-style": "preserve-3d",
                        "-webkit-animation-delay": "0s"
                    }
                },{
                    "isKeyFrameRule": true,
                    "keys" : [{
                        "keyText": "0%",
                        "styles": {
                            "opacity": "1",
                            "-webkit-transform": "rotateY(0deg)"
                        }
                    }, {
                        "keyText": "70%",
                        "styles": {
                            "opacity": "1",
                            "-webkit-transform": "rotateY(0deg)"
                        }
                    }, {
                        "keyText": "85%",
                        "styles": {
                            "opacity": "0",
                            "-webkit-transform": "rotateY(95deg)"
                        }
                    }, {
                        "keyText": "86%",
                        "styles": {
                            "opacity": "0",
                            "-webkit-transform": "rotateY(-90deg)"
                        }
                    }, {
                        "keyText": "100%",
                        "styles": {
                            "opacity": "1",
                            "-webkit-transform": "rotateY(0deg)"
                        }
                    }]
                }]
            },
            {
                "text": "Rotate with Fade In",
                "selectorBase" : "rotate-with-fade-in",
                "rules" : [{
                    "selectorSuffix" : "",
                    "styles" : {
                        "-webkit-animation-name": "rotate-with-fade-in",
                        "-webkit-animation-duration": "5s",
                        "-webkit-animation-iteration-count": "infinite",
                        "-webkit-animation-direction": "normal",
                        "-webkit-animation-timing-function": "ease-out",
                        "-webkit-transform-origin": "100% 50%",
                        "-webkit-transform-style": "preserve-3d",
                        "-webkit-animation-delay": "0s"
                    }
                },{
                    "isKeyFrameRule": true,
                    "keys" : [{
                        "keyText": "0%",
                        "styles": {
                            "opacity": "0",
                            "-webkit-transform": "rotateY(-90deg)"
                        }
                    }, {
                        "keyText": "15%",
                        "styles": {
                            "opacity": "1",
                            "-webkit-transform": "rotateY(0deg)"
                        }
                    }, {
                        "keyText": "85%",
                        "styles": {
                            "opacity": "1",
                            "-webkit-transform": "rotateY(0deg)"
                        }
                    }, {
                        "keyText": "100%",
                        "styles": {
                            "opacity": "0",
                            "-webkit-transform": "rotateY(95deg)"
                        }
                    }]
                }]
            }]
    }]
};
