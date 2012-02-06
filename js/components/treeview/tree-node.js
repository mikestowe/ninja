/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
                object[this.branchKey].forEach(function(node) {
                    this.childNodes.push(node);
                }, this);
            }
            this._sourceObject = object;
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
