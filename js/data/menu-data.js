/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;

exports.MenuData = Montage.create( Montage, {
    topLevelMenu: {
        value: [
            {
                "header": "File",
                "entries": [
                    {
                        "displayText" : "New Project",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "action":   "executeNewProject"
                    },
                    {
                        "displayText" : "New File",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "action":   "executeNewFile"
                    },
                    {
                        "displayText" : "Open...",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "action": "executeFileOpen"
                    },
                    {
                        "displayText" : "",
                        "separator":    true
                    },
                    {
                        "displayText" : "Save",
                        "hasSubMenu" : false,
                        "enabled": false
                    },
                    {
                        "displayText" : "Save As",
                        "hasSubMenu" : false,
                        "enabled": false
                    },
                    {
                        "displayText" : "Save All",
                        "hasSubMenu" : false,
                        "enabled": false
                    },
                    {
                        "displayText" : "",
                        "separator":    true
                    },
                    {
                        "displayText" : "Open Project",
                        "hasSubMenu" : false,
                        "enabled": true
                    },
                    {
                        "displayText" : "Open Recent",
                        "hasSubMenu" : false,
                        "enabled": true
                    },
                    {
                        "displayText" : "Close Project",
                        "hasSubMenu" : false,
                        "enabled": false
                    }
                ]
            },
            {
                "header": "Edit",
                "entries": [
                    {
                        "displayText" : "Undo",
                        "hasSubMenu" : false,
                        "enabled": {
                            "value": false,
                            "boundObj": "undocontroller",
                            "boundProperty": "canUndo"
                        },
                        "action":   "executeUndo"
                    },
                    {
                        "displayText" : "Redo",
                        "hasSubMenu" : false,
                        "enabled": {
                            "value": false,
                            "boundObj": "undocontroller",
                            "boundProperty": "canRedo"
                        },
                        "action":   "executeRedo"
                    },
                    {
                        "displayText" : "Cut",
                        "hasSubMenu" : false,
                        "enabled": true
                    },
                    {
                        "displayText" : "Copy",
                        "hasSubMenu" : false,
                        "enabled": true
                    },
                    {
                        "displayText" : "Paste",
                        "hasSubMenu" : false,
                        "enabled": true
                    }
                ]
            },
            {
                "header": "View",
                "entries": [
                    {
                        "displayText" : "Zoom In",
                        "hasSubMenu" : false,
                        "enabled": true
                    },
                    {
                        "displayText" : "Zoom Out",
                        "hasSubMenu" : false,
                        "enabled": true
                    },
                    {
                        "displayText" : "",
                        "separator":    true
                    },
                    {
                        "displayText" : "Live Preview",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "checked": {
                            "value": false,
                            "boundProperty": "livePreview"
                        }
                    },
                    {
                        "displayText" : "Layout View",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "submenu": true,
                        "entries": [
                            {
                                "displayText" : "View All",
                                "hasSubMenu" : false,
                                "radio": true,
                                "enabled": true,
                                "checked": {
                                    "value": true,
                                    "boundProperty": "layoutAll"
                                }
                            },
                            {
                                "displayText" : "View Items Only",
                                "hasSubMenu" : false,
                                "radio": true,
                                "enabled": true,
                                "checked": {
                                    "value": false,
                                    "boundProperty": "layoutItems"
                                }
                            },
                            {
                                "displayText" : "Off",
                                "hasSubMenu" : false,
                                "radio": true,
                                "enabled": true,
                                "checked": {
                                    "value": false,
                                    "boundProperty": "layoutOff"
                                }
                            }
                        ]
                    },
                    {
                        "displayText" : "Snap",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "checked": {
                            "value": true,
                            "boundProperty": "snap"
                        }

                    },
                    {
                        "displayText" : "Snap To",
                        "hasSubMenu" : false,
                        "enabled": {
                            "value": true,
                            "boundObj": "appModel",
                            "boundProperty": "snap"
                        },
                        "submenu": true,
                        "entries": [
                            {
                                "displayText" : "Grid",
                                "hasSubMenu" : false,
                                "enabled": true,
                                "checked": {
                                    "value": true,
                                    "boundProperty": "snapGrid"
                                }
                            },
                            {
                                "displayText" : "Objects",
                                "hasSubMenu" : false,
                                "enabled": true,
                                "checked": {
                                    "value": true,
                                    "boundProperty": "snapObjects"
                                }
                            },
                            {
                                "displayText" : "Snap Align",
                                "hasSubMenu" : false,
                                "enabled": true,
                                "checked": {
                                    "value": true,
                                    "boundProperty": "snapAlign"
                                }
                            }
                        ]
                    },
                    {
                        "displayText" : "Show 3D Grid",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "checked": {
                            "value": false,
                            "boundProperty": "show3dGrid"
                        }
                    },
                    {
                        "displayText" : "",
                        "separator":    true
                    },
                    {
                        "displayText" : "Front View",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "radio": true,
                        "checked": {
                            "value": true,
                            "boundProperty": "frontStageView"
                        }
                    },
                    {
                        "displayText" : "Top View",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "radio": true,
                        "checked": {
                            "value": true,
                            "boundProperty": "topStageView"
                        }
                    },
                    {
                        "displayText" : "Side View",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "radio": true,
                        "checked": {
                            "value": true,
                            "boundProperty": "sideStageView"
                        }
                    },
                    {
                        "displayText" : "",
                        "separator":    true
                    },
                    {
                        "displayText" : "Debug",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "checked": {
                            "value": true,
                            "boundProperty": "debug"
                        }
                    }
                ]
            },
            {
                "header": "Window",
                "entries": [
                    {
                        "displayText" : "Tools",
                        "hasSubMenu" : false,
                        "enabled": true
                    },
                    {
                        "displayText" : "Timeline",
                        "hasSubMenu" : false,
                        "enabled": true
                    },
                    {
                        "displayText" : "Properties",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "checked": {
                            "value": true,
                            "boundProperty": "PropertiesPanel"
                        }
                    },
                    {
                        "displayText" : "Project",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "checked": {
                            "value": true,
                            "boundProperty": "ProjectPanel"
                        }
                    },
                    {
                        "displayText" : "Color",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "checked": {
                            "value": true,
                            "boundProperty": "ColorPanel"
                        }
                    },
                    {
                        "displayText" : "Components",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "checked": {
                            "value": true,
                            "boundProperty": "ComponentsPanel"
                        }
                    },
                    {
                        "displayText" : "CSS",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "checked": {
                            "value": true,
                            "boundProperty": "CSSPanel"
                        }
                    },
                    {
                        "displayText" : "Materials",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "checked": {
                            "value": true,
                            "boundProperty": "MaterialsPanel"
                        }
                    },
                    {
                        "displayText" : "Code",
                        "hasSubMenu" : false,
                        "enabled": true
                    }
                ]
            },
            {
                "header": "Help",
                "entries": [
                    {
                        "displayText" : "Ninja FAQ",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "action":   "executeHelpFAQ"
                    },
                    {
                        "displayText" : "Ninja Forums",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "action":   "executeHelpForums"
                    },
                    {
                        "displayText" : "Help Topics",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "action":   "executeHelpTopics"
                    },
                    {
                        "displayText" : "About Ninja...",
                        "hasSubMenu" : false,
                        "enabled": true,
                        "action":   "executeHelpAbout"
                    }
                ]
            }
        ]
    }
});



