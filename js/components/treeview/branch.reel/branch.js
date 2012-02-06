/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    TreeNode = require("js/components/treeview/tree-node").TreeNode;

var Branch = exports.Branch = Montage.create(TreeNode, {
    hasTemplate:{
        value:true
    },
    repetition:{
        value: null
    },
    prepareForDraw : {
        value: function() {
            this.label._element.addEventListener('click', this, false);

            this.treeView.contentController.addBranchController(this.arrayController);
        }
    },
    draw:{
        value: function () {

            if (this.sourceObject[this.labelKey]) {
                this._labelText = this.sourceObject[this.labelKey];
            } else {
                console.log("Label key unknown");
            }

        }
    },
    handleClick : {
        value: function(e) {
            e.preventDefault();
            this.toggleExpand();

        }
    },
    collapseClass : {
        value: 'collapse'
    }


});
