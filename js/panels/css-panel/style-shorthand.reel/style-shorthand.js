/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage").Montage,
    TreeNode = require("js/components/treeview/tree-node").TreeNode;

var styleShorthand = exports.StyleShorthand= Montage.create(TreeNode, {
    repetition: { value: null },
    propertyText : { value: "property" },
    valueText : { value: "value" },

    handleSourceObjectSet: {
        value: function() {
            this.propertyText = this.sourceObject.name;
            this.valueText = this.sourceObject.value;
        }
    },
    prepareForDraw : {
        value: function() {
//            this.styleListDisclosure.addEventListener('click', this, false);
            this.treeView.contentController.addBranchController(this.arrayController);
        }
    },
    templateDidLoad: {
        value: function() {
            this.arrayController.delegate = this.treeView.contentController;

            this.branchCollapser.removeAttribute('id');
            this.branchCollapser.addEventListener('click', this, false);
        }
    },
    willDraw : {
        value: function() {

        }
    },
    draw:{
        value: function () {

console.log("style shorthand - draw");
            shorthand = this;
            if (this.sourceObject[this.labelKey]) {
                this._labelText = this.sourceObject[this.labelKey];
            }

        }
    },

    handleClick : {
        value: function(e) {
            e.preventDefault();
            this.toggleExpand();
        }
    }

});
