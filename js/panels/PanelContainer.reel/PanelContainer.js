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

/*
Panel Container - A container for other panels
*/
var Montage         = require("montage/core/core").Montage,
    Component       = require("montage/ui/component").Component;

exports.PanelContainer = Montage.create(Component, {

    panelSplitter: {
        value: null,
        serializable: true
    },

    appModel: {
        value: null,
        serializable: true
    },

    panelData: {
        value: null,
        serializable: true
    },

    panel_0: {
        value: null,
        serializable: true
    },

    panel_1: {
        value: null,
        serializable: true
    },

    panel_2: {
        value: null,
        serializable: true
    },

    panel_3: {
        value: null,
        serializable: true
    },

    panel_4: {
        value: null,
        serializable: true
    },

    panel_5: {
        value: null,
        serializable: true
    },

    panel_6: {
        value: null,
        serializable: true
    },

    _currentDocument: {
        value : null,
        enumerable : false
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
        }
    },

    panels: {
        value: []
    },

    panelsAvailable: {
        value: function() {
            var pAvail = [];
            this.panels.forEach(function(obj) {
                if (window.getComputedStyle(obj.element).display !== "none") {
                    pAvail.push(obj);
                }
            });
            return pAvail;
        }
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
                this['panel_'+i].collapsed = p.collapsed;
                this['panel_'+i].modulePath = p.modulePath;
                this['panel_'+i].moduleName = p.moduleName;
                this['panel_'+i].disabled = true;
                this['panel_'+i].groups = p.groups;


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
            var availablePanels = this.panelsAvailable();
            var len = availablePanels.length;
            var setLocked = true;

            for(var i = 0; i < len; i++) {
                if(availablePanels[i] === panelActivated || panelActivated === null) {
                    setLocked = false;
                }

                availablePanels[i].locked = setLocked;
                availablePanels[i].needsDraw = true;
            }
        }
    },

    _redrawPanels: {
        value: function(panelActivated, unlockPanels) {
            var maxHeight = this.element.offsetHeight, setLocked = true;
            var availablePanels = this.panelsAvailable();
            var len = availablePanels.length;

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
                var obj = availablePanels[i];

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
