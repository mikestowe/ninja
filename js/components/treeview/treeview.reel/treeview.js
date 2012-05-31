/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage   = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.Treeview = Montage.create(Component, {

    substitution      : { value : null },
    data              : { value : null },
    rootBranch        : { value : null },

    _hasBeenDeserialized: {
        value: false,
        enumerable: false
    },

    branchComponent : {
        value: null,
        serializable: true
    },
    leafComponent : {
        value: null,
        serializable: true
    },

    hasTemplate: {
        value: true
    },
    templateDidLoad : {
        value : function() {
            this._initializeRootBranch();
        }
    },
    _initializeRootBranch : {
        value: function() {
            var rootBranch;

            ///// Get user-defined branch/leaf components or use defaults
            this.branchComponent = this.branchComponent || this.defaultBranchComponent;

            ///// Tell branch component what the label key is (defined in tree controller)
            this.branchComponent.labelKey = this.contentController.labelKey;

            ///// Tell branch component what the branch key is (so it can recursively generate branches)
            this.branchComponent.branchKey = this.contentController.branchKey;

            rootBranch = Montage.create(this.branchComponent);
            rootBranch.hideLabel = !this.showRoot;
            rootBranch.treeView = this;

            this.slot.content = rootBranch;
            rootBranch.sourceObject = this.contentController.root;
            rootBranch.needsDraw = true;
            this.rootBranch = rootBranch;

            this.needsDraw = true;

        }
    },
    showRoot : {
        value: null
    },

    _contentController: {
        enumerable: false,
        value: null
    },

    contentController: {
        enumerable: false,
        get: function() {
            return this._contentController;
        },
        set: function(value) {
            if (this._contentController === value) {
                return;
            }

            if (this._contentController) {
                Object.deleteBinding(this, "selectedIndexes");
            }

            this._contentController = value;

            if (this._contentController) {

//this._initializeRootBranch();

                // And bind what we need from the new contentController
                var selectedIndexesBindingDescriptor;

                selectedIndexesBindingDescriptor = {
                    boundObject: this._contentController,
                    boundObjectPropertyPath: "selectedIndexes"
                };

                if (this._hasBeenDeserialized) {
                    Object.defineBinding(this, "selectedIndexes", selectedIndexesBindingDescriptor);
                } else {
                    // otherwise we need to defer it until later; we haven't been deserialized yet
                    if (!this._controllerBindingsToInstall) {
                        this._controllerBindingsToInstall = {};
                    }
                    this._controllerBindingsToInstall.selectedIndexes = selectedIndexesBindingDescriptor;
                }
            }

        }
    },

    deserializedFromTemplate: {
        value: function() {
            var controllerBindingDescriptorsToInstall = this._controllerBindingsToInstall;

            if (controllerBindingDescriptorsToInstall) {
                for (var key in controllerBindingDescriptorsToInstall) {
                    Object.defineBinding(this, key, controllerBindingDescriptorsToInstall[key]);
                }
                delete this._controllerBindingsToInstall;
            }

            this._hasBeenDeserialized = true;
        }
    },

    selectedIndexes: {
        enumerable: false,
        value: null
    }
});