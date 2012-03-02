/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */
 
/*
Panel Container - A container for other panels
*/
var Montage         = require("montage/core/core").Montage;
var Component       = require("montage/ui/component").Component;
 
exports.PanelContainer = Montage.create(Component, {

    panelData: {
        value: null
    },

    panels: {
        value: []
    },

    panelController: {
        value: null
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

                this.currentPanelState[p.name] = {};
                this.currentPanelState.version = "1.0";

                if(storedData && storedData[p.name]) {
                    p.collapsed = storedData[p.name].collapsed;
                }

                this.currentPanelState[p.name].collapsed = p.collapsed;

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
            var setLocked = true;
            this.repeater.childComponents.forEach(function(obj) {
                if (obj === panelActivated || panelActivated === null) {
                    setLocked = false;
                }

                obj.locked = setLocked;
                obj.needsDraw = true;
            });
        }
    },

    _redrawPanels: {
        value: function(panelActivated, unlockPanels) {
            var maxHeight = this.element.offsetHeight;
            var setLocked = true;
            if(unlockPanels === true) {
                setLocked = false;
            }

            var childrensMinHeights = ((this.repeater.childComponents.length - 1) * 26) + panelActivated.minHeight;

            this.repeater.childComponents.forEach(function(obj) {
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
            }, this);
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