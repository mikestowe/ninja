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
    templateDidLoad : {
        value: function() {
            this.needsDraw = true;
        }
    },
    prepareForDraw: {
        value : function() {
            this.activationEvent = this.activationEvent || 'click';
            this.label._element.addEventListener(this.activationEvent, this.handleNodeActivation.bind(this), false);
        }
    },
    handleNodeActivation: {
        value: function(e) {
            console.log(this.sourceObject);
            this.treeView.contentController.delegate.applyPresetSelection(this.sourceObject);
        }
    },
    draw : {
        value : function() {
            if(this.sourceObject[this.labelKey]) {
                this._labelText = this.sourceObject[this.labelKey];
            }
        }
    }


});
