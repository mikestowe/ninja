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
    templateDidLoad : {
        value: function() {
            console.log("style - template did load");
        }
    },
    prepareForDraw : {
        value: function() {
            console.log("style's prepare for draw");
            this.element.addEventListener('dragstart', this, false);
            this.element.addEventListener('drag', this, false);
//            this.element.addEventListener('dragenter', this, false);
//            this.element.addEventListener('dragleave', this, false);
            this.element.addEventListener('dragend', this, false);
            this.element.addEventListener('drop', this, false);
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

            if(this._enabled) {
                this.element.classList.remove(this.disabledClass);
            } else {
                this.element.classList.add(this.disabledClass);
            }

        }
    }
});