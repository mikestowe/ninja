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

exports.Treeview = Montage.create(Component, {

    substitution      : { value : null },
    data              : { value : null },
    rootBranch        : { value : null },

    activationEvent: {
        value: null
//        serializable: true
    },

    _hasBeenDeserialized: {
        value: false
//        enumerable: false
    },

    branchComponent : {
        value: null
//        serializable: true
    },
    leafComponent : {
        value: null
//        serializable: true
    },

    defaultBranchComponent: {
        value: null
//        serializable: true
    },

    defaultLeafComponent: {
        value: null
//        serializable: true
    },

    scrollview: {
        value: null
//        serializable: true
    },

    slot: {
        value: null
//        serializable: true
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
//        serializable: true
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
//        serializable: true
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
