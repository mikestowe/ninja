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

var Montage =   require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.MenuData = Montage.create(Component, {

    _currentDocument: {
            value : null
    },

    currentDocument : {
        get : function() {
            return this._currentDocument;
        },
        set : function(value) {
            if (value === this._currentDocument) {
                return;
            }

            this._currentDocument = value;

            if(!this._currentDocument) {
                this.documentEnabledIndices.forEach(function(index) {
                    index.enabled = false;
                });
            } else {
                this.documentEnabledIndices.forEach(function(index) {
                    index.enabled = true;
                });
            }

        }
    },

    didCreate: {
        value: function() {
            var self = this;

            this.topLevelMenu.forEach(function(item) {
                item.entries.forEach(function(entry) {
                    if(entry.depend && entry.depend === "document") {
                        self.documentEnabledIndices.push(entry);
                    }
                });
            });
        }
    },

    documentEnabledIndices: {
        value: []
    },

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
                            "enabled": false,
                            "depend": "document",
                            "action": "executeFileClose"
                        },
                        {
                            "displayText" : "Close All",
                            "hasSubMenu" : false,
                            "enabled": false,
                            "depend": "document",
                            "action": "executeFileCloseAll"
                        },
                        {
                            "displayText" : "",
                            "separator":    true,
                            "enabled": true
                        },
                        {
                            "displayText" : "Save",
                            "hasSubMenu" : false,
                            "enabled": false,
                            "depend": "document",
                            "action": "executeSave"
                        },
                        {
                            "displayText" : "Save As",
                            "hasSubMenu" : false,
                            "enabled": false,
                            "depend": "document",
                            "action":"executeSaveAs"
                        },
                        {
                            "displayText" : "Save All",
                            "hasSubMenu" : false,
                            "enabled": false,
                            "depend": "document",
                            "action": "executeSaveAll"
                        },
                        {
                            "displayText" : "",
                            "separator":    true,
                            "enabled": true
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
                            "enabled": false,
                            "newenabled": {
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
                            "enabled": false,
                            "newenabled": {
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
                            "enabled": true,
                            "action":   "executeCut"
                        },
                        {
                            "displayText" : "Copy",
                            "hasSubMenu" : false,
                            "enabled": true,
                            "action":   "executeCopy"
                        },
                        {
                            "displayText" : "Paste",
                            "hasSubMenu" : false,
                            "enabled": true,
                            "action":   "executePaste"
                        }
                    ]
                },
                {
                    "header": "View",
                    "entries": [
                        {
                            "displayText" : "Live Preview",
                            "hasSubMenu" : false,
                            "enabled": false,
                            "depend": "document",
                            "newenabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    return (activeDocument !== null) && (activeDocument.currentView === "design");
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
                            "enabled": false,
                            "depend": "document",
                            "newenabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    return (activeDocument !== null) && (activeDocument.currentView === "design");
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
                            "enabled": false,
                            "depend": "document",
                            "newenabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    return (activeDocument !== null) && (activeDocument.currentView === "design");
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
                            "enabled": false,
                            "depend": "document",
                            "newenabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    return (activeDocument !== null) && (activeDocument.currentView === "design");
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
                            "enabled": false,
                            "newenabled": {
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
                            "enabled": false,
                            "depend": "document",
                            "newenabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    return (activeDocument !== null) && (activeDocument.currentView === "design");
                                }
                            },
                            "checked": {
                                "value": false,
                                "boundProperty": "show3dGrid"
                            }
                        },
                        {
                            "displayText" : "",
                            "separator":    true,
                            "enabled": true
                        },
                        {
                            "displayText" : "Front View",
                            "hasSubMenu" : false,
                            "enabled": false,
                            "depend": "document",
                            "newenabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    return (activeDocument !== null) && (activeDocument.currentView === "design");
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
                            "enabled": false,
                            "depend": "document",
                            "newenabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    return (activeDocument !== null) && (activeDocument.currentView === "design");
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
                            "enabled": false,
                            "depend": "document",
                            "newenabled": {
                                "value": false,
                                "boundObj": "documentController",
                                "boundProperty": "activeDocument",
                                "oneway": true,
                                "boundValueMutator": function(activeDocument){
                                    return (activeDocument !== null) && (activeDocument.currentView === "design");
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
                            "separator":    true,
                            "enabled": true
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



