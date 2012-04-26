/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    TreeNode = require("js/components/treeview/tree-node").TreeNode;

exports.Style = Montage.create(TreeNode, {
    delegate : {
        value: null
    },
    disabledClass : {
        value: 'style-item-disabled'
    },
    editingStyleClass : {
        value: 'edit-style-item'
    },
    editNewEmptyClass : {
        value: 'edit-empty-style'
    },
    invalidStyleClass : {
        value: "style-item-invalid"
    },
    propertyText : {
        value: "property"
    },
    _valueText : {
        value: "value"
    },
    valueText : {
        get: function() {
            return this._valueText;
        },
        set: function(text) {
            this._valueText = text;
            this.units = this.getUnits(text);
        }
    },

    getUnits : {
        value: function(val) {
            if(val.split(/\s/).length > 1) {
                return false;
            } else if(/(px|em|pt|in|cm|mm|ex|pc|%)$/.test(val)) {
                return val.replace(/^.*(px|em|pt|in|cm|mm|ex|pc|%).*/, '$1');
            }
            return null;
        }
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

    _invalid: { value: null },
    invalid : {
        get: function() {
            return this._invalid;
        },
        set: function(value) {
            this._invalid = value;
            this.needsDraw = true;
        }
    },

    _editing : { value : null },
    editing : {
        get: function() {
            return this._editing;
        },
        set: function(value) {
            this._editing = value;
            this.needsDraw = true;
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
            this.editingNewStyle = this.editing = true;
        }
    },

    handleStart : {
        value: function(e) {
            this.editing = true;
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
                return;
            }

            if(this.sourceObject.isEmpty && !this.dirty && shouldStopEditing.bind(this)()) {

                this.editingNewStyle = false;
            }

            this.treeView.contentController.delegate.handleStyleStop(e);
            //this.editing = false;

        }
    },

    handlePropertyChange : {
        value: function(e) {
            var property    = this.propertyField.value,
                oldProperty = this.propertyField._preEditValue,
                value       = this.valueField.value,
                rule        = this.treeView.parentComponent.declaration.parentRule,
                delegate    = this.treeView.contentController.delegate;

            delegate.handlePropertyChange(rule, property, value, oldProperty, this);
        }
    },
    handleValueChange : {
        value: function(e) {
            var property    = this.propertyField.value,
                value       = this.valueField.value,
                rule        = this.treeView.parentComponent.declaration.parentRule,
                delegate    = this.treeView.contentController.delegate;

            delegate.handleValueChange(rule, property, value, this);
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

            ///// Add listeners to the value/property fields
            this.propertyField.addEventListener('start', this, false);
            this.valueField.addEventListener('start', this, false);
            this.propertyField.addEventListener('stop', this, false);
            this.valueField.addEventListener('stop', this, false);
//            this.propertyField.addEventListener('change', this, false);
//            this.valueField.addEventListener('change', this, false);

            if(this.sourceObject.isEmpty) {
                this.element.draggable = false;
                this.addStyleButton.addEventListener('click', this, false);
            } else {
                this.element.removeChild(this.addStyleButton);
                delete this.addStyleButton;
            }
        }
    },

    willDraw : {
        value: function() {
            if(this.invalid) {
                this._element.title = "Unrecognized Style";
            } else {
                this._element.removeAttribute('title');
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
                if(!this.propertyField.isEditable) {
                    this.propertyField.start();
                }
                this.element.classList.add(this.editNewEmptyClass);
            } else {
                this.element.classList.remove(this.editNewEmptyClass);
            }

            if(this._invalid) {
                this._element.classList.add(this.invalidStyleClass);
            } else {
                this._element.classList.remove(this.invalidStyleClass);
            }

            if(this.editing) {
                this._element.classList.add(this.editingStyleClass);
            } else {
                this._element.classList.remove(this.editingStyleClass);
            }
        }
    }
});