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

            if(this._currentDocument && this._currentDocument.currentView === "design") {
                this._currentDocument.model.selection = this.application.ninja.selectedElements;
                this._currentDocument.model.selectionContainer = this.application.ninja._currentSelectedContainer;
            }

            this._currentDocument = value;

            /*
            if(!value) {
            } else if(this._currentDocument.currentView === "design") {
            } else {
            }
            */

        }
    },

    _selectedElements: {
        value: null
    },

    selectedElements: {
        get: function() {
            return this._selectedElements;
        },
        set: function(value) {
            if(this.currentDocument && this.currentDocument.currentView === "code") return;

            if(value) {
                this._selectedElements = value;

                this.application.ninja.selectedElements = this._selectedElements;
                this.application.ninja._currentSelectedContainer = this._selectionContainer = this.application.ninja.currentDocument.model.documentRoot;

                if(this._selectedElements.length === 0) {
                    this.executeSelectElement();
                } else {
                    this.executeSelectElement(this._selectedElements);
                }


            }
        }
    },

    // Bound property to the ninja currentSelectedContainer
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
            this.eventManager.addEventListener("elementAdded", this, false);
            this.eventManager.addEventListener("elementsRemoved", this, false);
            this.eventManager.addEventListener("elementReplaced", this, false);
            this.eventManager.addEventListener("selectAll", this, false);
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
            var selected = [], childNodes = [], self = this;

            childNodes = this.application.ninja.currentDocument.model.documentRoot.childNodes;
            childNodes = Array.prototype.slice.call(childNodes, 0);
            childNodes.forEach(function(item) {
                if(self.isNodeTraversable(item)) {
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
                            if(outerElement.nodeName === "BODY") return;
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

    findSelectedElement: {
        value: function(item) {
            // TODO: Remove this function and use the stage selectable. Then only return a match in the array
            //return this.application.ninja.selectedElements.indexOf(item);

            //TODO: Make sure we don't need to loop back to the container element.
            var itemUUID;

            for(var i=0, uuid; this.application.ninja.selectedElements[i];i++) {
                // Check for multiple selection and excluding inner elements
                if(item.parentNode && item.parentNode !== this.application.ninja.currentDocument.model.documentRoot) {
                    var outerElement = item.parentNode;

                    while(outerElement.parentNode && outerElement.parentNode !== this.application.ninja.currentDocument.model.documentRoot) {
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
    },

    isNodeTraversable: {
        value: function( item ) {
            if(item.nodeType !== 1) return false;
            return ((item.nodeName !== "STYLE") && (item.nodeName !== "SCRIPT"));
        }
    }

});
