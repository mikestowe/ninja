/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage   = require("montage/core/core").Montage,
    TreeNode = require("js/components/treeview/tree-node").TreeNode;

exports.Leaf = Montage.create(TreeNode, {

    label: {
        value: null,
        serializable: true
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
        },
        distinct: true
    }


});
