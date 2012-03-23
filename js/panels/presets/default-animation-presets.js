/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
                    "selectorSuffix" : "",
                    "styles" : {
                        "-webkit-animation": "border-morph 2s infinite"
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
        "text": "3D Animations",
        "children": [
            {
                "text": "Rotater",
                "selectorBase" : "rotate-with-alpha-keyframes",
                "rules" : [{
                    "selectorSuffix" : "",
                    "styles" : {
                        "-webkit-animation-name": "rotate-with-alpha-keyframes",
                        "-webkit-animation-duration": "5s",
                        "-webkit-animation-iteration-count": "infinite",
                        "-webkit-animation-direction": "normal",
                        "-webkit-animation-timing-function": "ease-out",
                        "-webkit-transform-origin": "200% 50%",
                        "-webkit-transform-style": "preserve-3d",
                        "-webkit-transform": "perspective(1000)",
                        "-webkit-animation-delay": "0s"
                    }
                },{
                    "isKeyFrameRule": true,
                    "keys" : [{
                        "keyText": "0%",
                        "styles": {
                            "opacity": "1",
                            "-webkit-transform": "perspective(1000) rotateY(0deg)"
                        }
                    }, {
                        "keyText": "70%",
                        "styles": {
                            "opacity": "1",
                            "-webkit-transform": "perspective(1000) rotateY(0deg)"
                        }
                    }, {
                        "keyText": "85%",
                        "styles": {
                            "opacity": "0",
                            "-webkit-transform": "perspective(1000) rotateY(95deg)"
                        }
                    }, {
                        "keyText": "86%",
                        "styles": {
                            "opacity": "0",
                            "-webkit-transform": "perspective(1000) rotateY(-90deg)"
                        }
                    }, {
                        "keyText": "100%",
                        "styles": {
                            "opacity": "1",
                            "-webkit-transform": "perspective(1000) rotateY(0deg)"
                        }
                    }]
                }]
            }]
    }]
};