/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.SelectionController = Montage.create(Component, {

    _isDocument: {
        value: true
    },

    isDocument: {
        get: function() {
            return this._isDocument;
        }
    },

    /*
     * Bound property to the ninja currentSelectedContainer
     */
    _selectionContainer: {
        value: null
    },

    selectionContainer: {
        get: function() {
            return this._selectionContainer
        },
        set: function(value) {
            if(this._selectionContainer && this._selectionContainer !== value) {
                this.executeSelectElement();
            }

            this._selectionContainer = value;
        }
    },

    deserializedFromTemplate: {
        value: function() {
            this.eventManager.addEventListener("openDocument", this, false);
            this.eventManager.addEventListener("elementAdded", this, false);
            this.eventManager.addEventListener("elementsRemoved", this, false);
            this.eventManager.addEventListener("elementReplaced", this, false);
            this.eventManager.addEventListener("selectAll", this, false);
            this.eventManager.addEventListener("switchDocument", this, false);
            this.eventManager.addEventListener("closeDocument", this, false);
        }
    },

    /**
     * Get the current document selection array. If nothing is selected the currentSelectionArray should be null
     */
    handleOpenDocument: {
        value: function() {
            // Handle initializing the selection array here.
            this.initWithDocument([]);
        }
    },
    
    initWithDocument: {
        value: function(currentSelectionArray) {
            this._isDocument = true;

            if(currentSelectionArray) {
                if(currentSelectionArray.length >= 1) {
                    this._isDocument = false;

                    this.application.ninja.selectedElements = currentSelectionArray;
                    NJevent("selectionChange", {"elements": this.application.ninja.selectedElements, "isDocument": this._isDocument});
                }
            }

            this._selectionContainer = this.application.ninja.currentSelectedContainer;
        }
    },

    handleSwitchDocument: {
        value: function() {
            if(this.application.ninja.documentController.activeDocument.currentView === "design"){
                this._isDocument = this.application.ninja.selectedElements.length === 0;
                NJevent("selectionChange", {"elements": this.application.ninja.selectedElements, "isDocument": this._isDocument} );
            }
        }
    },

    handleElementAdded: {
        value: function(event) {
            this.executeSelectElement(event.detail);
        }
    },

    handleElementsRemoved: {
        value: function(event) {
            if(!this._isDocument) {
                this.application.ninja.selectedElements = [];
                this._isDocument = true;
                NJevent("selectionChange", {"elements": this.application.ninja.selectedElements, "isDocument": this._isDocument});
            }
        }
    },

    handleElementReplaced: {
        value: function(event) {
            this.application.ninja.selectedElements[this.application.ninja.selectedElements.indexOf(event.detail.data.oldChild)] = event.detail.data.newChild;
        }
    },

    handleSelectAll: {
        value: function(event) {
            var selected = [], childNodes = [];

            childNodes = this.application.ninja.currentDocument.documentRoot.childNodes;
            childNodes = Array.prototype.slice.call(childNodes, 0);
            childNodes.forEach(function(item) {
                if(item.nodeType == 1) {
                    selected.push(item);
                }
            });

            this.selectElements(selected);
        }
    },

    /**
     * Select Element. This function will not check that element, it will simply add it to the selection array.
     */
    executeSelectElement: {
        value: function(element) {
            this.application.ninja.selectedElements = [];

            if(element) {
                if(Array.isArray(element)) {
                    this.application.ninja.selectedElements = Array.prototype.slice.call(element, 0);
                } else {
                    this.application.ninja.selectedElements.push(element);
                }
                this._isDocument = false;
            } else {
                this._isDocument = true;
            }

            NJevent("selectionChange", {"elements": this.application.ninja.selectedElements, "isDocument": this._isDocument} );

        }

    },

    selectElement: {
        value: function(element) {
            if(this.findSelectedElement(element) === -1) {

                if(this.application.ninja.currentDocument.inExclusion(element) !== -1){
                    if(this.isDocument) return;     // If the stage is already selected do nothing.
                    this.executeSelectElement();    // Else execute selection with no element
                } else {
                    if(element.parentNode.uuid === this.selectionContainer.uuid) {
                        this.executeSelectElement(element);
                    } else {
                        var outerElement = element.parentNode;

                        while(outerElement.parentNode && outerElement.parentNode.uuid !== this.selectionContainer.uuid) {
                            // If element is higher up than current container then return
                            if(outerElement.id === "UserContent") return;
                            // else keep going up the chain
                            outerElement = outerElement.parentNode;
                        }

                        this.executeSelectElement(outerElement);
                    }
                }
            }
        }
    },

    selectElements: {
        value: function(elements) {
            if(elements && elements.length > 0) {
                var that = this;
                this.application.ninja.selectedElements = [];

                elements.forEach(function(element) {
                    that.application.ninja.selectedElements.push(element);
                    that._isDocument = false;
                });

                NJevent("selectionChange", {"elements": this.application.ninja.selectedElements, "isDocument": this._isDocument} );
            }
        }
    },

    shiftSelectElement: {
        value: function(element) {
            if(this.application.ninja.currentDocument.inExclusion(element) !== -1) return;

            (this.findSelectedElement(element) !== -1 ) ? this.removeElement(element) : this.insertElement(element);
        }
    },

    insertElement: {
        value: function(element) {
            if(element) {
                if(this._isDocument) {
                    this.application.ninja.selectedElements = [];
                    this._isDocument = false;
                }

                this.application.ninja.selectedElements.push(element);

                NJevent("selectionChange", {"elements": this.application.ninja.selectedElements, "isDocument": this._isDocument} );
            }
        }
    },

    removeElement: {
        value: function(item) {
            if(item){
                try{
                    if(this.application.ninja.selectedElements.length > 1) {
                        var idx = this.findSelectedElement(item);
                        if(idx != -1){
                            this.application.ninja.selectedElements.splice(idx, 1);
                        }
                    } else {
                        this.application.ninja.selectedElements = [];
                        this._isDocument = true;
                    }

                    NJevent("selectionChange", {"elements": this.application.ninja.selectedElements, "isDocument": this._isDocument} );

                } catch (err) {
                    console.log("Fault: " + err);
                }
            }

        }
    },

	isObjectSelected: {
		value: function( elt ) {
			return this.findSelectedElement(elt) > -1;
		}
	},

    /**
     * Looks into the selectionObject for the item to be found using it's id
     *
     * @return: Item index in the selectionObject if found
     *          -1 if not found
     */
    findSelectedElement: {
        value: function(item) {
            // TODO do the loop check in the select element and only use the index here
            // return this.application.ninja.selectedElements.indexOf(item);

            var itemUUID;

            for(var i=0, uuid; this.application.ninja.selectedElements[i];i++) {
                // Check for multiple selection and excluding inner elements
                if(item.parentNode && item.parentNode.id !== "UserContent") {
                    var outerElement = item.parentNode;

                    while(outerElement.parentNode && outerElement.parentNode.id !== "UserContent") {
                        outerElement = outerElement.parentNode;
                    }

                    itemUUID = outerElement.uuid;
                } else {
                    itemUUID = item.uuid;
                }

                if(this.application.ninja.selectedElements[i].uuid === itemUUID) {
                    return i;
                }
            }

            return -1;
        }
    }

});
