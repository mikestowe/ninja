/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */
 
/*
Panel Container - A container for other panels
*/
var Montage         = require("montage/core/core").Montage,
    Component       = require("montage/ui/component").Component;
 
exports.PanelContainer = Montage.create(Component, {

    panelData: {
        value: null
    },

    // This will hold the current loaded panels.
    panels: {
        value: []
    },

    currentPanelState: {
        value: {}
    },

    templateDidLoad: {
        value: function() {

            var pLen, storedData;

            // Loop through the panels to add to the repetition and get the saved state
            pLen = this.panelData.panels.length;

            // Get the saved panel state
            storedData = this.application.localStorage.getItem("panels");

            for(var i = 0; i < pLen; i++) {

                var p = this.panelData.panels[i];

                this['panel_'+i].name = p.name;
                this['panel_'+i].height = p.height;
                this['panel_'+i].minHeight= p.minHeight;
                this['panel_'+i].maxHeight = p.maxHeight;
                this['panel_'+i].flexible = p.flexible;
                this['panel_'+i].modulePath = p.modulePath;
                this['panel_'+i].moduleName = p.moduleName;

                this.currentPanelState[p.name] = {};
                this.currentPanelState.version = "1.0";

                if(storedData && storedData[p.name]) {
                    this['panel_'+i].collapsed = storedData[p.name].collapsed;
                }

                this.currentPanelState[p.name].collapsed = this['panel_'+i].collapsed;

                // Check if current panel is open when feature is enabled
                this.panels.push(p);
            }

            this.application.localStorage.setItem("panels", this.currentPanelState);


        }
    },
 
    prepareForDraw: {
        value: function() {
            window.addEventListener("resize", this, false);
        }
    },
 
    handlePanelResizing: {
        value: function(e) {
            this._setPanelsSizes(e.target);
        }
    },
     
    handleResize: {
         value: function(e) {
            this._setPanelsSizes(null);
        }
    },
 
    handleDropped: {
        value: function(e) {
            var draggedIndex, droppedIndex = 0;
            for(var i = 0; i< this.repeater.childComponents.length; i++ ) {
                if (this.repeater.childComponents[i] === e._event.draggedComponent) {
                    draggedIndex = i;
                }

                if (this.repeater.childComponents[i] === e._event.droppedComponent) {
                    droppedIndex = i;
                }
            }

            var panelRemoved = this.panelController.content.splice(draggedIndex,1);
            this.panelController.content.splice(droppedIndex,0, panelRemoved[0]);
            //console.log(draggedIndex, droppedIndex);
            this._setPanelsSizes(null);
        }
    },
 
    _setPanelsSizes: {
        value: function(panelActivated) {
            var len = this.panels.length, setLocked = true;

            for(var i = 0; i < len; i++) {
                if(this['panel_'+i] === panelActivated || panelActivated === null) {
                    setLocked = false;
                }

                this['panel_'+i].locked = setLocked;
                this['panel_'+i].needsDraw = true;
            }
        }
    },

    _redrawPanels: {
        value: function(panelActivated, unlockPanels) {
            var maxHeight = this.element.offsetHeight, setLocked = true;
            var len = this.panels.length;

            if(unlockPanels === true) {
                setLocked = false;
            }

            var childrensMinHeights = ((len - 1) * 26) + panelActivated.minHeight;

            for(var i = 0; i < len; i++) {
                var obj = this['panel_'+i];

                if(obj === panelActivated) {
                    setLocked = false;
                } else if(obj.collapsed) {
                    //Collapsed Ignore the rest of the code
                } else {
                    if (setLocked) {
                        if((maxHeight - childrensMinHeights) - obj.height > 0 ) {
                            childrensMinHeights += obj.height - 26;
                        } else {
                            this.currentPanelState[obj.name].collapsed = obj.collapsed = true;
                            this.application.localStorage.setItem("panels", this.currentPanelState);
                        }
                    } else {
                        if ((maxHeight - childrensMinHeights) - obj.minHeight > 0 ) {
                            childrensMinHeights += obj.minHeight - 26;
                        } else {
                            this.currentPanelState[obj.name].collapsed = obj.collapsed = true;
                            this.application.localStorage.setItem("panels", this.currentPanelState);
                        }
                    }
                }
                obj.locked = setLocked;
            }
        }
    },
 
    handleAction: {
        value: function(e) {
            var unlockPanels = true;
            var afterPanel = false;
            var panelName = e.target.parentComponent.name;
            switch(e.target.identifier) {
                case "btnCollapse":
                    this.currentPanelState[e.target.parentComponent.name].collapsed = e.target.parentComponent.collapsed;
                    this.application.localStorage.setItem("panels", this.currentPanelState);
                    this._setPanelsSizes(e.target.parentComponent);
                    this._redrawPanels(e.target.parentComponent, unlockPanels);
                    break;
                case "btnClose":
                    this.panelController.content.forEach(function(obj) {
                        if(afterPanel) {
                            if(obj.flexible) {
                                unlockPanels = false;
                            }
                        }
                        if (obj.name === panelName) {
                            afterPanel = true;
                            this.panelController.removeObjects(obj);
                        }
                    });
                    this._redrawPanels(e.target.parentComponent, unlockPanels);
                    break;
            }
        }
    }
 
});