/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    TreeNode = require("js/components/treeview/tree-node").TreeNode;

exports.Style = Montage.create(TreeNode, {
    propertyText : {
        value: "property"
    },
    valueText : {
        value: "value"
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
    draw : {
        value : function() {
            //debugger;
            if(this.sourceObject[this.labelKey]) {
                this._labelText = this.sourceObject[this.labelKey];
            } else {
                console.log("Label key unknown");
            }

        }
    }
});