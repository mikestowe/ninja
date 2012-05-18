/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.CssStyle = Montage.create(Component, {
    delegate          : { value: null },
    disabledClass     : { value: 'style-item-disabled' },
    editingStyleClass : { value: 'edit-style-item' },
    editNewEmptyClass : { value: 'edit-empty-style' },
    invalidStyleClass : { value: "style-item-invalid" },
    emptyStyleClass   : { value: "empty-css-style" },

    propertyText : {
        value: "property",
        distinct: true
    },

    _valueText : {
        value: "value",
        distinct: true
    },
    valueText : {
        get: function() {
            return this._valueText;
        },
        set: function(text) {
            this._valueText = this.browserValue = text;
            this.units = this.getUnits(text);
        }
    },
    browserValue: {
        value: null
    },
    _priority: { value: "", distinct: true },
    priority: {
        get: function() {
            return this._priority;
        },
        set: function(value) {
            this._priority = value;
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
            this.delegate.handleStyleToggle(this.getRule(), this._enabled, this);
            this.needsDraw = true;
        }
    },

    _empty : { value: null },
    empty : {
        get: function() {
            return this._empty;
        },
        set: function(isEmpty) {
            if(this._empty === isEmpty) { return false; }
            this._empty = isEmpty;
            this.needsDraw = true;
        }
    },

    dirty : {
        get: function() {
            return this.propertyField.isDirty || this.valueField.isDirty;
        },
        set: function(value) {
            return false;
        }
    },

    _invalid: { value: null },
    invalid : {
        get: function() { return this._invalid; },
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
            if(this._editing === value) { return false; }

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
            if(this._editingNewStyle === value) {
                return false;
            }

            this._editingNewStyle = value;
            this.needsDraw = true;
        }
    },

    remove : {
        value: function() {
            var branchController = this.parentComponent.parentComponent.contentController;

            ///// Remove style property from declaration
            this.treeView.parentComponent.declaration.removeProperty(this.propertyField._preEditValue);

            ///// Remove data from branch controller and update UI
            branchController.removeObjects(this.sourceObject);
        }
    },

    getRule : {
        value: function() {
            //var declarationComponent = this.treeView.parentComponent,
            var declarationComponent = this.parentComponent.parentComponent.parentComponent,
                rule;

            if(declarationComponent.type === 'inline') {
                rule = { style : declarationComponent.declaration }
            } else {
                rule = this.parentComponent.parentComponent.parentComponent.declaration.parentRule;
            }

            return rule;
        }
    },

    getSiblingStyle : {
        value: function(which) {
            var styles = this.parentComponent.childComponents,
                index = styles.indexOf(this);

            switch (which) {
                case "first":
                    return styles[0];
                case "last":
                    return styles[styles.length-1];
                case "next":
                    return (index+1 < styles.length) ? styles[index+1] : null;
                case "prev":
                    return (index-1 >= 0) ? styles[index-1] : null;
            }
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

    handleWebkitTransitionEnd : {
        value: function(e) {
            console.log("trans end");
        }
    },
    handleClick : {
        value: function(e) {
            this.buttonClicked = true;
            this.propertyField.start();
        }
    },

    handleStart : {
        value: function(e) {
            this.editing = true;

            if(this.empty) {
                this.editingNewStyle = true;
            }
        }
    },

    //// Handler for both hintable components
    handlePropertyStop : {
        value: function(e) {
            var event = e;
            ///// Function to determine if an empty (new) style should return
            ///// to showing the add button, i.e. the fields were not clicked
            function fieldsClicked() {
                var clicked;
                if(e._event.detail.originalEventType === 'mousedown') {
                    clicked = e._event.detail.originalEvent.target;
                    return clicked === this.propertyField.element || clicked === this.valueField.element;
                }
                return false;
            }

            this.editing = false;

            if(this.empty && !this.dirty && !fieldsClicked.bind(this)()) {
                ///// Show add button
                this.editingNewStyle = false;
            }

            this.delegate.handlePropertyStop(e, this);
        }
    },
    //// Handler for both hintable components
    handleValueStop : {
        value: function(e) {
            var event = e;
            ///// Function to determine if an empty (new) style should return
            ///// to showing the add button, i.e. the fields were not clicked
            function fieldsClicked() {
                var clicked;
                if(e._event.detail.originalEventType === 'mousedown') {
                    clicked = e._event.detail.originalEvent.target;
                    return clicked === this.propertyField.element || clicked === this.valueField.element;
                }
                return false;
            }

            this.editing = false;

            if(this.empty && !this.dirty && !fieldsClicked.bind(this)()) {
                ///// Show add button
                this.editingNewStyle = false;
            }

            this.delegate.handleValueStop(e, this);
        }
    },

    handlePropertyChange : {
        value: function(e) {
            var property    = this.propertyField.value,
                oldProperty = this.propertyField._preEditValue,
                value       = this.valueField.value,
                rule        = this.getRule();

            this.propertyText = property;

            this.delegate.handlePropertyChange(rule, property, value, oldProperty, this);
        }
    },
    handleValueChange : {
        value: function(e) {
            var property    = this.propertyField.value,
                value       = this.valueField.value,
                rule        = this.getRule();

            this.valueText = value;

            this.delegate.handleValueChange(rule, property, value, this);
        }
    },

    handlePropertyDirty : {
        value: function(e) {
            this.empty = false;
        }
    },

    handleValueDirty : {
        value: function(e) {
            this.empty = false;
        }
    },

    templateDidLoad : {
        value: function() {
            this.propertyField.hints = this.propertyNames;
        }
    },

    prepareForDraw : {
        value: function() {
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
            this.propertyField.addEventListener('dirty', this, false);
            this.valueField.addEventListener('dirty', this, false);
//            this.propertyField.addEventListener('change', this, false);
//            this.valueField.addEventListener('change', this, false);
            this.propertyField.addEventListener('paste', this, false);
            this.valueField.addEventListener('paste', this, false);

        }
    },

    handlePaste: {
        value: function(e) {
            this.delegate.handlePaste(e);
        }
    },

    setToolTips : {
        value: function() {
            this.propertyField.element.title = this.propertyField.value;
            this.valueField.element.title = this.valueField.value;
        }
    },

    willDraw : {
        value: function() {
            if(this.invalid) {
                this._element.title = "Unrecognized Style";
            } else {
                this._element.removeAttribute('title');
            }

            if(this.empty) {
                this.addStyleButton.addEventListener('click', this, false);
            } else {
                this.addStyleButton.removeEventListener('click', this, false);
            }

            this.setToolTips();
        }
    },

    draw : {
        value : function() {
            if(this.empty) {
                this.element.draggable = false;
                this.element.classList.add(this.emptyStyleClass);
                if(!this.addStyleButton.parentNode) {
                    this.element.appendChild(this.addStyleButton);
                    this.addStyleButton.addEventListener('click', this, false);
                }
            } else {
                this.element.draggable = true;
                this.element.classList.remove(this.emptyStyleClass);
                if(this.addStyleButton.parentNode) {
                    this.element.removeChild(this.addStyleButton);
                }
            }

            if(this._enabled) {
                this.element.classList.remove(this.disabledClass);
            } else {
                this.element.classList.add(this.disabledClass);
            }

            if(this._editingNewStyle) {
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