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

var Montage   = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.TreeNode = Montage.create(Component, {
    _labelText: {
        value: "Default"
    },
    labelText : {
        get: function() { return this._labelText; },
        set: function(text) {
            this._labelText = text;
        }
    },
    treeView : {
        value: null,
        serializable: true
    },
    leafComponent: {
        value: null,
        serializable: true
    },
    branchKey : {
        serializable: true,
        value: null
    },
    labelKey : {
        serializable: true,
        value: null
    },
    _sourceObject : {
        value : null
    },
    sourceObject : {
        get : function() {
            return this._sourceObject;
        },
        set : function(object) {
            if(!object) {
                return;
            }

            if(object[this.branchKey]) {
                this.childNodes.length = 0;
                object[this.branchKey].forEach(function(node) {
                    this.childNodes.push(node);
                }, this);
            }
            this._sourceObject = object;

            if(this.handleSourceObjectSet) {
                this.handleSourceObjectSet();
            }
        }
    },
    childNodes : {
        distinct: true,
        value: []
    },
    isExpanded : {
        distinct: true,
        value: true
    },
    _needsToggle : {
        value: null
    },
    activationEvent : {
        value: null
    },
    toggleExpand : {
        value: function() {
            if(this.isExpanded) {
                this.collapse();
                this.isExpanded = false;
            } else {
                this.expand();
                this.isExpanded = true;
            }
        }
    },
    expand : {
        value: function() {
            if(this.collapseClass) {
                this.branchList.classList.remove(this.collapseClass);
            } else {
                this.branchList.style.display = "block";
            }

        }
    },
    collapse : {
        value: function() {
            if(this.collapseClass) {
                this.branchList.classList.add(this.collapseClass);
            } else {
                this.branchList.style.display = "none";
            }

        }
    }



});
