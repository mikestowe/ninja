/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage   = require("montage/core/core").Montage,
    TreeNode = require("js/components/treeview/tree-node").TreeNode;

exports.Leaf = Montage.create(TreeNode, {
    hasTemplate: {
        value: true
    },
    templateDidLoad : {
        value: function() {
            var event = this.treeView.activationEvent;

            ///// Re-set the activation event
            if(event && event !== this.activationEvent) {
                this.delegateEventMap[event] = this.delegateEventMap[this.activationEvent];
                delete this.delegateEventMap[this.activationEvent];
                this.activationEvent = this.treeView.activationEvent;
            }
        }
    },
    prepareForDraw: {
        value : function() {
            var el = this.label._element;

            Object.keys(this.delegateEventMap).forEach(function(event) {
                el.addEventListener(event, this, false);
            }, this);

        }
    },
    handleEvent : {
        value: function(e) {
            var delegateMethod = this.delegateEventMap[e._event.type];
            this.callDelegateMethod(delegateMethod, e);
        }
    },
    callDelegateMethod : {
        value: function(methodName, evt) {
            var delegate = this.treeView.contentController.delegate;
            if(delegate && typeof delegate[methodName] === 'function') {
                delegate[methodName](this.sourceObject, evt);
            }
        }
    },
    draw : {
        value : function() {
            if(this.sourceObject[this.labelKey]) {
                this._labelText = this.sourceObject[this.labelKey];
            }
        }
    },
    activationEvent : {
        value : 'click'
    },
    delegateEventMap : {
        value: {
            'click'     : 'handleNodeActivation',
            'dblclick'  : 'handleDblclick',
            'dragstart' : 'handleDragStart',
            'dragend'   : 'handleDragEnd'
        }
    }


});
