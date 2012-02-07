/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage   = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;
    TreeNode = require("js/components/treeview/tree-node").TreeNode;

exports.Leaf = Montage.create(TreeNode, {
    hasTemplate: {
        value: true
    },
    deserializedFromTemplate : {
        value: function() {
            //console.log('Leaf deserialized.');
        }
    },
    templateDidLoad : {
        value: function() {
            //debugger;
            console.log('Leaf\'s template did load.');
            this.needsDraw = true;
        }
    },
    prepareForDraw: {
        value : function() {
            console.log('Leafs prepare for draw.', this.labelKey);
        }
    },
    draw : {
        value : function() {
            if(this.sourceObject[this.labelKey]) {
                this._labelText = this.sourceObject[this.labelKey];
            } else {
                console.log("Label key unknown");
            }

        }
    }


});
