/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    TreeNode = require("js/components/treeview/tree-node").TreeNode;

exports.Style = Montage.create(TreeNode, {
    disabledClass : {
        value: 'style-item-disabled'
    },
    editNewEmptyClass : {
        value: 'edit-empty-style'
    },
    propertyText : {
        value: "property"
    },
    valueText : {
        value: "value"
    },

    _enabled : { value: true, distinct: true },
    enabled : {
        get: function() {
            return this._enabled;
        },
        set: function(value) {
            this._enabled = value;
            this.needsDraw = true;
        }
    },


    dirty : {
        get: function() {
            return this.propertyField.isDirty || this.valueField.isDirty;
        },
        set: function(value) {

        }
    },

    _editingNewStyle : {
        value: null
    },
    editingNewStyle : {
        get: function() {
            return this._editingNewStyle;
        },
        set: function(value) {
            this._editingNewStyle = value;
            this.needsDraw = true;
        }
    },

    handleEvent : {
        value: function(e) {
            console.log(e);
        }
    },

    handleDragstart : {
        value: function(e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('Text', 'my styles, baby!');
            this.element.classList.add("dragged");
        }
    },

    handleDragend : {
        value: function(e) {
            this.element.classList.remove("dragging");
            this.element.classList.remove("dragged");
        }
    },
    handleDrag : {
        value: function(e) {
            this.element.classList.add("dragging");
        }
    },
    handleDrop : {
        value: function(e) {
            this.element.classList.remove("drag-enter");
        }
    },
    handleSourceObjectSet: {
        value: function() {
            //debugger;
            this.propertyText = this.sourceObject.name;
            this.valueText = this.sourceObject.value;
        }
    },
    handleWebkitTransitionEnd : {
        value: function(e) {
            console.log("trans end");
        }
    },
    handleClick : {
        value: function(e) {
            console.log("handleAction");
            this.editingNewStyle = true;
        }
    },

    //// Handler for both hintable components
    handleStop : {
        value: function(e) {
            var event = e;
            ///// Function to determine if an empty (new) style should return
            ///// to showing the add button, i.e. the fields were not clicked
            function shouldStopEditing() {
                var clicked;
                if(e._event.detail.originalEventType === 'mousedown') {
                    clicked = e._event.detail.originalEvent.target;
                    return clicked !== this.propertyField.element && clicked !== this.valueField.element;
                }
                return
            }

            if(this.sourceObject.isEmpty && !this.dirty && shouldStopEditing.bind(this)()) {

                this.editingNewStyle = false;
            }
        }
    },
    prepareForDraw : {
        value: function() {
            console.log("style's prepare for draw");
            this.element.addEventListener('dragstart', this, false);
            this.element.addEventListener('drag', this, false);
            this.element.addEventListener('dragend', this, false);
            this.element.addEventListener('drop', this, false);
            this.element.addEventListener('webkitTransitionEnd', this, false);

            if(this.sourceObject.isEmpty) {
                this.element.draggable = false;
                this.addStyleButton.addEventListener('click', this, false);
                this.propertyField.addEventListener('stop', this, false);
                this.valueField.addEventListener('stop', this, false);
            } else {
                this.element.removeChild(this.addStyleButton);
                delete this.addStyleButton;
            }
        }
    },

    draw : {
        value : function() {
            //debugger;
            if(this.sourceObject[this.labelKey]) {
                this._labelText = this.sourceObject[this.labelKey];
            } else {
                console.log("Label key unknown");
            }

            if(this.sourceObject.isEmpty) {
                this.element.classList.add('empty-css-style');
            } else {
                this.element.classList.remove('empty-css-style');
            }

            if(this._enabled) {
                this.element.classList.remove(this.disabledClass);
            } else {
                this.element.classList.add(this.disabledClass);
            }

            if(this._editingNewStyle) {
                this.propertyField.start();
                this.element.classList.add(this.editNewEmptyClass);
            } else {
                this.element.classList.remove(this.editNewEmptyClass);
            }
        }
    }
});