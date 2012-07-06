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

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.CssStyle = Montage.create(Component, {
    declaration: {
        value: null
    },

    addStyleButton: {
        value: null,
        serializable: true
    },

    propertyField: {
        value: null
    },

    valueField: {
        value: null
    },

    propertyNames: {
        value: null
    },

    delegate          : { value: null },
    disabledClass     : { value: 'style-item-disabled' },
    editingStyleClass : { value: 'edit-style-item' },
    editNewEmptyClass : { value: 'edit-empty-style' },
    invalidStyleClass : { value: "style-item-invalid" },
    emptyStyleClass   : { value: "empty-css-style" },
    source            : { value: null },
    units             : { value: null },

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
            /// TODO: Figure out why montage is trying to set this to undefined
            /// TODO: when the style object is removed from the repetition
            if(text === null || text === undefined) { return; }

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
            var declarationComponent = this.parentComponent.parentComponent.parentComponent
            return declarationComponent.rule;
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
                rule        = this.getRule(),
                units;

            ///// Auto-fill units if not provided and units
            ///// not previously stored
            units = this.getUnits(value);
            if(this.units && units === null && parseInt(value)) {
                value += this.units;
            } else if (value !== '0') {
                this.units = units;
            }

            this.valueField.value = value;

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
                //this.element.draggable = false;
                this.element.classList.add(this.emptyStyleClass);
                if(!this.addStyleButton.parentNode) {
                    this.element.appendChild(this.addStyleButton);
                    this.addStyleButton.addEventListener('click', this, false);
                }
            } else {
                //this.element.draggable = true;
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
