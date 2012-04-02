/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage =   require("montage/core/core").Montage;

exports.MenuData = Montage.create( Montage, {
    topLevelMenu: {
        value: [
                {
                    "header": "File",
                    "entries": [
                        {
                            "displayText" : "New Project",
                            "hasSubMenu" : false,
                            "enabled": false,
                            "action":   "executeNewProject"
                        },
                        {
                            "displayText" : "New File",
                            "hasSubMenu" : false,
                            "enabled": true,
                            "action":   "executeNewFile"
                        },
                        {
                            "displayText" : "Open File",
                            "hasSubMenu" : false,
                            "enabled": true,
                            "action": "executeFileOpen"
                        },
                        {
                            "displayText" : "Close File",
                            "hasSubMenu" : false,
                            "enabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    if(activeDocument !== null){return true;}
                                    else{return false;}
                                }
                            },
                            "action": "executeFileClose"
                        },
                        {
                            "displayText" : "Close All",
                            "hasSubMenu" : false,
                            "enabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    if(activeDocument !== null){return true;}
                                    else{return false;}
                                }
                            },
                            "action": "executeFileCloseAll"
                        },
                        {
                            "displayText" : "",
                            "separator":    true
                        },
                        {
                            "displayText" : "Save",
                            "hasSubMenu" : false,
                            "enabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "canSave",
                                "oneway": true
                            },
                            "action": "executeSave"
                        },
                        {
                            "displayText" : "Save As",
                            "hasSubMenu" : false,
                            "enabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    if(activeDocument !== null){return true;}
                                    else{return false;}
                                }
                            },
                            "action":"executeSaveAs"
                        },
                        {
                            "displayText" : "Save All",
                            "hasSubMenu" : false,
                            "enabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "canSaveAll",
                                "oneway": true,
                                "boundValueMutator": function(canSaveAll){
                                    if(canSaveAll === true){return true;}
                                    else{return false;}
                                }
                            },
                            "action": "executeSaveAll"
                        },
                        {
                            "displayText" : "",
                            "separator":    true
                        },
                        {
                            "displayText" : "Open Project",
                            "hasSubMenu" : false,
                            "enabled": false
                        },
                        {
                            "displayText" : "Open Recent",
                            "hasSubMenu" : false,
                            "enabled": false
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
                                "boundProperty": "canUndo",
                                "oneway": true
                            },
                            "action":   "executeUndo"
                        },
                        {
                            "displayText" : "Redo",
                            "hasSubMenu" : false,
                            "enabled": {
                                "value": false,
                                "boundObj": "undocontroller",
                                "boundProperty": "canRedo",
                                "oneway": true
                            },
                            "action":   "executeRedo"
                        },
                        {
                            "displayText" : "Cut",
                            "hasSubMenu" : false,
                            "enabled": false
                        },
                        {
                            "displayText" : "Copy",
                            "hasSubMenu" : false,
                            "enabled": false
                        },
                        {
                            "displayText" : "Paste",
                            "hasSubMenu" : false,
                            "enabled": false
                        }
                    ]
                },
                {
                    "header": "View",
                    "entries": [
                        {
                            "displayText" : "Live Preview",
                            "hasSubMenu" : false,
                            "enabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    if((activeDocument !== null) && (activeDocument.currentView === "design")){return true;}
                                    else{return false;}
                                }
                            },
                            "checked": {
                                "value": false,
                                "boundProperty": "livePreview"
                            }
                        },
                        {
                            "displayText" : "Chrome Preview",
                            "hasSubMenu" : false,
                            "enabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    if((activeDocument !== null) && (activeDocument.currentView === "design")){return true;}
                                    else{return false;}
                                }
                            },
                            "checked": {
                                "value": false,
                                "boundProperty": "chromePreview"
                            }
                        },
                        {
                            "displayText" : "Layout View",
                            "hasSubMenu" : false,
                            "enabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    if((activeDocument !== null) && (activeDocument.currentView === "design")){return true;}
                                    else{return false;}
                                }
                            },
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
                            "enabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    if((activeDocument !== null) && (activeDocument.currentView === "design")){return true;}
                                    else{return false;}
                                }
                            },
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
                                "boundProperty": "snap",
                                "oneway": true
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
                            "enabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    if((activeDocument !== null) && (activeDocument.currentView === "design")){return true;}
                                    else{return false;}
                                }
                            },
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
                            "enabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    if((activeDocument !== null) && (activeDocument.currentView === "design")){return true;}
                                    else{return false;}
                                }
                            },
                            "radio": true,
                            "checked": {
                                "value": true,
                                "boundProperty": "frontStageView"
                            }
                        },
                        {
                            "displayText" : "Top View",
                            "hasSubMenu" : false,
                            "enabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    if((activeDocument !== null) && (activeDocument.currentView === "design")){return true;}
                                    else{return false;}
                                }
                            },
                            "radio": true,
                            "checked": {
                                "value": true,
                                "boundProperty": "topStageView"
                            }
                        },
                        {
                            "displayText" : "Side View",
                            "hasSubMenu" : false,
                            "enabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    if((activeDocument !== null) && (activeDocument.currentView === "design")){return true;}
                                    else{return false;}
                                }
                            },
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
                            "enabled": false,
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
                            "displayText" : "Presets",
                            "hasSubMenu" : false,
                            "enabled": true,
                            "checked": {
                                "value": true,
                                "boundProperty": "PresetsPanel"
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



