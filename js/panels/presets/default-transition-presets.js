/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
                    "selectorSuffix": "",
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
                    "selectorSuffix": "",
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
                    "selectorSuffix": "",
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
                    "selectorSuffix": "",
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
                    "selectorSuffix" : "",
                    "styles" : {
                        "-webkit-transition": "all 0.4s ease-in"
                    }
                }, {
                    "selectorSuffix" : ":hover",
                    "styles" : {
                        "-webkit-transform": "rotate(180deg)"
                    }
                }]
            },
            {
                "text": "Scale Up",
                "selectorBase" : "scale-up",
                "rules" : [{
                    "selectorSuffix" : "",
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
                    "selectorSuffix" : "",
                    "styles" : {
                        "-webkit-transition": "-webkit-transform 0.4s ease-in"
                    }
                }, {
                    "selectorSuffix" : ":hover",
                    "styles" : {
                        "-webkit-transform": "scale(.5)"
                    }
                }]
            }]
    }]
};