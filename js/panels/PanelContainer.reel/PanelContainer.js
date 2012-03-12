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
                this['panel_'+i].disabled = true;

                this.currentPanelState[p.name] = {};
                this.currentPanelState.version = "1.0";

                if(storedData && storedData[p.name]) {
                    this['panel_'+i].collapsed = storedData[p.name].collapsed;
                }

                this.currentPanelState[p.name].collapsed = this['panel_'+i].collapsed;

                // Check if current panel is open when feature is enabled
                this.panels.push(this['panel_'+i]);
            }

            this.application.localStorage.setItem("panels", this.currentPanelState);


            this.eventManager.addEventListener( "onOpenDocument", this, false);
            this.eventManager.addEventListener( "closeDocument", this, false);
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
            this._redrawPanels(null, true);
        }
    },

    handleOnOpenDocument: {
        value: function(){
            this.panels.forEach(function(obj) {
                obj.disabled = false;
            });
        }
    },

    handleCloseDocument: {
        value: function(){
            if(!this.application.ninja.documentController.activeDocument) {
                this.panels.forEach(function(obj) {
                    obj.disabled = true;
                });
            }
        }
    },
 
    handleDropped: {
        value: function(e) {
            var draggedIndex, droppedIndex = 0, len = this.panels.length;

//            console.log(e._event.draggedComponent);
            for(var i = 0; i < len; i++) {
                if(this.panels[i].name === e._event.draggedComponent.name) {
                    draggedIndex = i; // Actual component being dragged
                }

                if(this.panels[i].name === e._target.name) {
                    droppedIndex = i;
                }
            }

            if(draggedIndex !== droppedIndex) {
                // switch panels
                if (droppedIndex === draggedIndex +1) {
                    if(this.panels[droppedIndex].element.nextSibling) {
                        this.panels[droppedIndex].element.parentNode.insertBefore(this.panels[draggedIndex].element, this.panels[droppedIndex].element.nextSibling);
                    } else {
                        return this.appendChild(this.panels[draggedIndex].element);
                    }
                } else {

                    this.panels[droppedIndex].element.parentNode.insertBefore(this.panels[draggedIndex].element, this.panels[droppedIndex].element);
                }
                var panelRemoved = this.panels.splice(draggedIndex, 1);
                this.panels.splice(droppedIndex, 0, panelRemoved[0]);

            }

        }
    },
 
    _setPanelsSizes: {
        value: function(panelActivated) {
            var len = this.panels.length, setLocked = true;

            for(var i = 0; i < len; i++) {
                if(this.panels[i] === panelActivated || panelActivated === null) {
                    setLocked = false;
                }

                this.panels[i].locked = setLocked;
                this.panels[i].needsDraw = true;
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

            var childrensMinHeights = (len * 26);
            if (panelActivated) {
                if (!panelActivated.collapsed) {
                    childrensMinHeights+= panelActivated.minHeight -26;
                }
            }

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

            this.panels.forEach(function(obj) {
                if(afterPanel) {
                    if(obj.flexible && obj.collapsed === false) {
                        unlockPanels = false;
                    }
                }
                if (obj.name === panelName) {
                    afterPanel = true;
                }
            });

            switch(e.target.identifier) {
                case "btnCollapse":
                    this.currentPanelState[e.target.parentComponent.name].collapsed = e.target.parentComponent.collapsed;
                    this.application.localStorage.setItem("panels", this.currentPanelState);
                    //this._setPanelsSizes(e.target.parentComponent);
                    this._redrawPanels(e.target.parentComponent, unlockPanels);
                    break;
                case "btnClose":
                    //this.panelController.removeObjects(obj);
                    this._redrawPanels(e.target.parentComponent, unlockPanels);
                    break;
            }
        }
    }
 
});