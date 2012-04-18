/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component   = require("montage/ui/component").Component;

exports.PiData = Montage.create( Montage, {

    stagePi: {
        value: [
            {
                label: "Style",

                Section: [
                    [
                        {
                            type : "chip",
                            id : "background",
                            prop: "background"
                        }
                    ]
                ]
            }
        ]
    },

    blockPi: {
        value: [
            {
                label: "Style",

                Section: [
                    [
                        {
                            type : "color",
                            id : "colorStroke",
                            prop: "border",
                            label : "Stroke"
                        },
                        {
                            type : "color",
                            id : "colorFill",
                            prop: "background",
                            divider : true
                        }
                    ],
                    [
                        {
                            type : "hottext",
                            id : "borderWidth",
                            prop : "border-width",
                            defaultValue: 0,
                            valueMutator: parseFloat,
                            label : "Border",
                            min :   0,
                            max :   100,
                            unit : "px",
                            acceptableUnits: ["pt", "px"]
                        }
                    ],
                    [
                        {
                            type : "dropdown",
                            id : "borderStyle",
                            prop : "border-style",
                            defaultValue: "none",
                            label : "Style",
                            items : ["none","solid","hidden","dotted","dashed", "double","groove","ridge","inset","outset"],
                            divider : true
                        }
                    ],
                    [
                        {
                            type : "dropdown",
                            id : "overflow",
                            prop : "overflow",
                            defaultValue: "visible",
                            label : "Overflow",
                            items : ["visible","hidden","scroll","auto","inherit"]
                        }
                    ]
                ]
            }
        ]
    },
    imagePi: {
        value: [
            {
                label: "Image Properties",

                Section: [
                    [{
                        type: "file",
                        id: "source",
                        prop: "src",
                        defaultValue: "",
                        label: "Source"
                    }],
                    [{
                        type: "textbox",
                        id: "altText",
                        prop: "alt",
                        defaultValue: "",
                        label: "Alt Text"
                    }]
                ]
            },
            {
                label: "Style",

                Section: [
                    [
                        {
                            type : "color",
                            id : "colorStroke",
                            prop: "border",
                            label : "Stroke"
                        },
                        {
                            type : "color",
                            id : "colorFill",
                            prop: "background",
                            divider : true
                        }
                    ],
                    [
                        {
                            type : "hottext",
                            id : "borderWidth",
                            prop : "border-width",
                            defaultValue: 0,
                            valueMutator: parseFloat,
                            label : "Border",
                            min :   0,
                            max :   100,
                            unit : "px",
                            acceptableUnits: ["pt", "px"]
                        }
                    ],
                    [
                        {
                            type : "dropdown",
                            id : "borderStyle",
                            prop : "border-style",
                            label : "Style",
                            items : ["none","solid","hidden","dotted","dashed", "double","groove","ridge","inset","outset"],
                            divider : true
                        }
                    ]
                ]
            }
        ]
    },
    videoPi: {
        value: [
            {
                label: "Video Properties",

                Section: [
                    [
                        {
                            type: "file",
                            id: "source",
                            prop: "src",
                            defaultValue: "",
                            label: "Source"
                        }
                    ],
                    [
                        {
                            type: "file",
                            id: "poster",
                            prop: "poster",
                            defaultValue: "",
                            label: "Poster",
                            divider: true
                        }
                    ],
                    [
                        {
                            type: "checkbox",
                            id: "autoplay",
                            prop: "autoplay",
                            defaultValue: false,
                            value: "Autoplay",
                            checked: true
                        },
                        {
                            type: "checkbox",
                            id: "preload",
                            prop: "preload",
                            defaultValue: false,
                            value: "Preload",
                            divider: true
                        }
                    ],
                    [
                        {
                            type: "checkbox",
                            id: "controls",
                            prop: "controls",
                            defaultValue: false,
                            value: "Controls",
                            checked: true
                        },
                        {
                            type: "checkbox",
                            id: "loop",
                            prop: "loop",
                            defaultValue: false,
                            value: "Loop",
                            divider: true
                        }
                    ],
                    [
                        {
                            type: "checkbox",
                            id: "muted",
                            prop: "muted",
                            defaultValue: false,
                            value: "Muted",
                            checked: true
                        }
                    ]
                ]
            }
        ]
    },
    canvasPi: {
        value: [
            {
                label: "Style",

                Section: [
                    [
                        {
                            type : "color",
                            id : "colorStroke",
                            prop: "border",
                            label : "Stroke"
                        },
                        {
                            type : "color",
                            id : "colorFill",
                            prop: "background",
                            divider : true
                        }
                    ],
                    [
                        {
                            type : "hottext",
                            id : "borderWidth",
                            prop : "border-width",
                            defaultValue: 0,
                            valueMutator: parseFloat,
                            label : "Border",
                            min :   0,
                            max :   100,
                            unit : "px",
                            acceptableUnits: ["pt", "px"]
                        }
                    ],
                    [
                        {
                            type : "dropdown",
                            id : "borderStyle",
                            prop : "border-style",
                            defaultValue: "none",
                            label : "Style",
                            items : ["none","solid","hidden","dotted","dashed", "double","groove","ridge","inset","outset"],
                            divider : true
                        }
                    ],
                    [
                        {
                            type : "dropdown",
                            id : "overflow",
                            prop : "overflow",
                            defaultValue: "visible",
                            label : "Overflow",
                            items : ["visible","hidden","scroll","auto","inherit"]
                        }
                    ]
                ]
            }
        ]
    },
    RectanglePi: {
        value: [
            {
                label: "Stroke and Fill",

                Section: [
                    [
                        {
                            type : "color",
                            prop: "border",
                            id : "stroke"
                        },
                        {
                            type : "color",
                            prop: "background",
                            id : "fill",
                            divider : true
                        }
                    ],
                    [
                        {
                            type : "hottext",
                            id : "strokeSize",
                            prop : "strokeSize",
                            label : "Stroke",
                            valueMutator: parseFloat,
                            min :   0,
                            max :   100,
                            value : 1,
                            unit : "px",
                            acceptableUnits: ["px", "pt"]
                        }
                    ]
                ]
            },
            {
                label: "Corner Options",

                Section: [
                    [
                        {
                            type: "hottext",
                            id: "tlRadius",
                            prop : "tlRadius",
                            label: "TL",
                            valueMutator: parseFloat,
                            value : 0,
                            min :   0,
                            max :   100,
                            unit : "px",
                            acceptableUnits: ["px", "pt", "%"]
                        },
                        {
                            type : "hottext",
                            id : "trRadius",
                            prop : "trRadius",
                            label : "TR",
                            valueMutator: parseFloat,
                            min :   0,
                            max :   100,
                            unit : "px",
                            acceptableUnits: ["px", "pt", "%"],
                            divider: true
                        }
                    ],
                    [
                        {
                            type : "hottext",
                            id : "blRadius",
                            prop : "blRadius",
                            label : "BL",
                            valueMutator: parseFloat,
                            min :   0,
                            max :   100,
                            unit : "px",
                            acceptableUnits: ["px", "pt", "%"]
                        },
                        {
                            type : "hottext",
                            id : "brRadius",
                            prop : "brRadius",
                            label : "BR",
                            valueMutator: parseFloat,
                            min :   0,
                            max :   100,
                            unit : "px",
                            acceptableUnits: ["px", "pt", "%"]
                        }
                    ]
                ]
            },
            {
                label: "Materials",

                Section: [
                    [
                        {
                            type: "checkbox",
                            id: "useWebGl",
                            prop: "useWebGl",
                            defaultValue: false,
                            value: "Use WebGL",
                            checked: false
                        }
                    ],
                    [
                        {
                            type: "checkbox",
                            id: "animate",
                            prop: "animate",
                            defaultValue: true,
                            value: "Animate",
                            checked: true,
                            enabled: { boundObject: "this.controls", boundProperty: "useWebGl" }
                        }
                    ],
                    [
                        {
                            type: "dropdown",
                            id:   "strokeMaterial",
                            prop:   "strokeMaterial",
                            label: "Stroke",
                            labelField: "_name",
                            dataField: "_name",
                            items : { boundObject: "this.application.ninja.appModel", boundProperty: "materials" },
                            enabled: { boundObject: "this.controls", boundProperty: "useWebGl" },
                            divider : true
                        },
                        {
                            type: "button",
                            id: "editStrokeMaterial",
                            prop: "editStrokeMaterial",
                            label: "Edit",
                            enabled: { boundObject: "this.controls", boundProperty: "useWebGl" }
                        }
                    ],
                    [
                        {
                            type: "dropdown",
                            id:   "fillMaterial",
                            prop:   "fillMaterial",
                            label: "Fill",
                            labelField: "_name",
                            dataField: "_name",
                            items : { boundObject: "this.application.ninja.appModel", boundProperty: "materials" },
                            enabled: { boundObject: "this.controls", boundProperty: "useWebGl" }
                        },
                        {
                            type: "button",
                            id: "editFillMaterial",
                            prop: "editFillMaterial",
                            label: "Edit",
                            enabled: { boundObject: "this.controls", boundProperty: "useWebGl" }
                        }
                    ]
                ]
            }
        ]
    },
    LinePi: {
        value: [
            {
                label: "Stroke",

                Section: [
                    [
                        {
                            type : "color",
                            prop: "border",
                            id : "stroke"
                        },
                        {
                            type : "color",
                            id : "fill",
                            prop: "background",
                            visible : false,
                            divider : true
                        }
                    ],
                    [
                        {
                            type : "hottext",
                            id : "strokeSize",
                            prop : "strokeSize",
                            label : "Stroke",
                            valueMutator: parseFloat,
                            min :   0,
                            max :   100,
                            value : 1,
                            unit : "px",
                            acceptableUnits: ["pt", "px"]
                        }
                    ]
                ]
            },
            {
                label: "Materials",

                Section: [
                    [
                        {
                            type: "checkbox",
                            id: "useWebGl",
                            prop: "useWebGl",
                            defaultValue: false,
                            value: "Use WebGL",
                            checked: false
                        }
                    ],
                    [
                        {
                            type: "checkbox",
                            id: "animate",
                            prop: "animate",
                            defaultValue: true,
                            value: "Animate",
                            checked: true,
                            enabled: { boundObject: "this.controls", boundProperty: "useWebGl" }
                        }
                    ],
                    [
                        {
                            type: "dropdown",
                            id:   "strokeMaterial",
                            prop:   "strokeMaterial",
                            label: "Stroke",
                            labelField: "_name",
                            dataField: "_name",
                            items : { boundObject: "this.application.ninja.appModel", boundProperty: "materials" },
                            enabled: { boundObject: "this.controls", boundProperty: "useWebGl" },
                            divider : true
                        },
                        {
                            type: "button",
                            id: "editStrokeMaterial",
                            prop: "editStrokeMaterial",
                            label: "Edit",
                            enabled: { boundObject: "this.controls", boundProperty: "useWebGl" }
                        }
                    ]
                ]
            }
        ]
    },
    OvalPi: {
        value: [
            {
                label: "Stroke and Fill",

                Section: [
                    [
                        {
                            type : "color",
                            prop: "border",
                            id : "stroke"
                        },
                        {
                            type : "color",
                            prop: "background",
                            id : "fill",
                            divider : true
                        }
                    ],
                    [
                        {
                            type : "hottext",
                            id : "strokeSize",
                            prop : "strokeSize",
                            label : "Stroke",
                            valueMutator: parseFloat,
                            min :   0,
                            max :   100,
                            value : 1,
                            unit : "px",
                            acceptableUnits: ["pt", "px"]
                        }
                    ]
                ]
            },
            {
                label: "Oval Options",

                Section: [
                    [
                        {
                            type: "hottext",
                            id: "innerRadius",
                            prop: "innerRadius",
                            label: "Inner R",
                            valueMutator: parseFloat,
                            value : 0,
                            min :   0,
                            max :   99,
                            unit : "%",
                            acceptableUnits: ["%"]

                        }
                    ]
                ]
            },
            {
                label: "Materials",

                Section: [
                    [
                        {
                            type: "checkbox",
                            id: "useWebGl",
                            prop: "useWebGl",
                            defaultValue: false,
                            value: "Use WebGL",
                            checked: false
                        }
                    ],
                    [
                        {
                            type: "checkbox",
                            id: "animate",
                            prop: "animate",
                            defaultValue: true,
                            value: "Animate",
                            checked: true,
                            enabled: { boundObject: "this.controls", boundProperty: "useWebGl" }
                        }
                    ],
                    [
                        {
                            type: "dropdown",
                            id:   "strokeMaterial",
                            prop:   "strokeMaterial",
                            label: "Stroke",
                            labelField: "_name",
                            dataField: "_name",
                            items : { boundObject: "this.application.ninja.appModel", boundProperty: "materials" },
                            enabled: { boundObject: "this.controls", boundProperty: "useWebGl" },
                            divider : true
                        },
                        {
                            type: "button",
                            id: "editStrokeMaterial",
                            prop: "editStrokeMaterial",
                            label: "Edit",
                            enabled: { boundObject: "this.controls", boundProperty: "useWebGl" }
                        }
                    ],
                    [
                        {
                            type: "dropdown",
                            id:   "fillMaterial",
                            prop:   "fillMaterial",
                            label: "Fill",
                            labelField: "_name",
                            dataField: "_name",
                            items : { boundObject: "this.application.ninja.appModel", boundProperty: "materials" },
                            enabled: { boundObject: "this.controls", boundProperty: "useWebGl" }
                        },
                        {
                            type: "button",
                            id: "editFillMaterial",
                            prop: "editFillMaterial",
                            label: "Edit",
                            enabled: { boundObject: "this.controls", boundProperty: "useWebGl" }
                        }
                    ]
                ]
            }
        ]
    },
    SubpathPi: {
        value: [
            {
                label: "Stroke",

                Section: [
                    [
                        {
                            type : "color",
                            prop: "border",
                            id : "stroke"
                        },
                        {
                            type : "color",
                            id : "fill",
                            prop: "background",
                            divider : true
                        }
                    ],
                    [
                        {
                            type : "hottext",
                            id : "strokeSize",
                            prop : "strokeSize",
                            label : "Stroke",
                            valueMutator: parseFloat,
                            min :   1,
                            max :   100,
                            value : 1,
                            unit : "px",
                            acceptableUnits: ["pt", "px"]
                        }
                    ]
                ]
            }
        ]
    },
    BrushStrokePi: {
        value: [
            {
                label: "Stroke",

                Section: [
                    [
                        {
                            type : "color",
                            prop: "border",
                            id : "stroke"
                        },
                        {
                            type : "color",
                            id : "fill",
                            prop: "background",
                            visible : false,
                            divider : true
                        }
                    ],
                    [
                        {
                            type : "hottext",
                            id : "strokeSize",
                            prop : "strokeSize",
                            label : "Stroke",
                            valueMutator: parseInt,
                            min :   1,
                            max :   100,
                            value : 1,
                            unit : "px",
                            acceptableUnits: ["pt", "px"]
                        },
                        {
                            type : "hottext",
                            id : "strokeHardness",
                            prop : "strokeHardness",
                            label : "Hardness",
                            valueMutator: parseInt,
                            min :   0,
                            max :   100,
                            value : 100,
                            unit : "%",
                            acceptableUnits: ["%"]
                        }
                    ]
                ]
            },
            {
                label: "Smoothing",
                Section: [
                    [
                        {
                            type: "checkbox",
                            id: "doSmoothing",
                            prop: "doSmoothing",
                            defaultValue: false,
                            value: "Y/N",
                            checked: false
                        },
                        {
                            type : "hottext",
                            id : "strokeSmoothing",
                            prop : "strokeSmoothing",
                            label : "Amount",
                            valueMutator: parseFloat,
                            min :   0,
                            max :   100,
                            value : 0
                        }
                    ]
                ]
            },
            {
                label: "Calligraphic",
                Section: [
                    [
                        {
                            type: "checkbox",
                            id: "isCalligraphic",
                            prop: "isCalligraphic",
                            defaultValue: false,
                            value: "Y/N",
                            checked: false,
                            divider : true
                        },
                        {
                            type : "hottext",
                            id : "strokeAngle",
                            prop : "strokeAngle",
                            label : "Angle",
                            valueMutator: parseFloat,
                            min :   -90,
                            max :   90,
                            value : 0,
                            unit : "deg."
                        }
                    ]
                ]
            }
        ] //value: [
    } //BrushStrokePi: {
});



