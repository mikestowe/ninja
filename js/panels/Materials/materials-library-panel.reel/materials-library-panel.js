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

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    MaterialsData = require("js/panels/Materials/materials-data.json"),
    Popup = require("montage/ui/popup/popup.reel").Popup,
    MaterialsModel = require("js/models/materials-model").MaterialsModel,
    LeafNode = require("js/components/treeview/ninja-leaf.reel").Leaf;

exports.MaterialsLibraryPanel = Montage.create(Component, {

    deleteButton: {
        value: null
    },

    materialsData: {
        value: null
    },

    materialId: {
        value: null
    },

    selectedMaterialNode: {
        value: null
    },

    customMaterialsBranch: {
        value: null
    },

    customMaterialsCounter: {
        value: 2
    },

    _hasFocus: {
        enumerable: false,
        value: false
    },

    didCreate: {
        value: function() {
            this.materialsData = MaterialsData;
        }
    },

    prepareForDraw: {
        value : function() {
            this.eventManager.addEventListener("showMaterialPopup", this, false);
        }
    },

    handleAction: {
        value:function(event) {
            switch(event._currentTarget.label)
            {
                case "Duplicate":
                    this.duplicateMaterial();
                    break;
                case "Edit":
//                    console.log("Edit selected material");
                    this._showMaterialPopup({ materialId: this.materialId });
                    break;
                case "Delete":
                    this.deleteMaterial();
                    break;
            }
        }
    },

    handleNodeActivation: {
        value: function(obj, event) {
            this.selectedMaterialNode = event.currentTarget;
            this.materialId = obj.id;
            this.deleteButton.enabled = !!obj.canDelete;
        }
    },

    handleDblclick: {
        value:function(obj, event) {
            this.selectedMaterialNode = event.currentTarget;
            this.materialId = obj.id;
            this._showMaterialPopup({ materialId: obj.id });
        }
    },

    handleShowMaterialPopup: {
        enumerable: false,
        value: function (event) {
            this._showMaterialPopup(event.detail);
        }
    },

    _materialPopup: {
        enumerable:true,
        value:null
    },

    _materialInfo: {
        enumerable:true,
        serializable: true
    },

    _showMaterialPopup: {
        enumerable: false,
        value: function (materialObj) {

            if(!this._materialPopup)
            {
                this._materialPopup = Popup.create();
                this._materialInfo.materialsLibraryRef = this;
                this._materialPopup.content = this._materialInfo;
                this._materialPopup.delegate = this;
                this._materialPopup.modal = false;
                this.eventManager.addEventListener("hideMaterialPopup", this, false);
                this._materialPopup.addEventListener("show", this, false);
            }
            this._materialPopup.show();

            this._materialInfo.loadMaterials(materialObj.materialId,  materialObj.useSelection, materialObj.whichMaterial);
        }
    },

    handleHideMaterialPopup: {
        enumerable: false,
        value: function (event) {
            if(this._materialPopup){
//                console.log("hiding material popup");
                this._materialInfo.destroy();
                this._materialPopup.hide();
            }
        }
    },

    duplicateMaterial: {
        enumerable: false,
        value: function (matCopyName) {
//            console.log("Duplicate selected material");
            var mat = MaterialsModel.getMaterial(this.materialId);
            if(mat) {
                var matCopy = mat.dup();
                if(!matCopyName) {
                    matCopyName = this.materialId + "_" + this.customMaterialsCounter++;
    }
                matCopy.setName(matCopyName);
                MaterialsModel.addMaterial(matCopy);

                var leaf = LeafNode.create();
                leaf.id = matCopyName;
                leaf.label = matCopyName;
                leaf.treeNodeType = "leaf";
                leaf.canDelete = true;
                if(!this.customMaterialsBranch) {
                    this.customMaterialsBranch = this.materialsController.branchControllers[2];
                }
                this.customMaterialsBranch.content.push(leaf);
            }
        }
    },

    deleteMaterial: {
        enumerable: false,
        value: function () {
//            console.log("Delete selected material");
            if(!this.customMaterialsBranch) {
                this.customMaterialsBranch = this.materialsController.branchControllers[2];
            }

            var mat = MaterialsModel.getMaterial(this.materialId);
            if(mat) {
                MaterialsModel.removeMaterial(this.materialId);

                var index = this.customMaterialsBranch.selectedIndexes[0];
                this.customMaterialsBranch.content.splice(index, 1);
            }

            this.deleteButton.enabled = false;
        }
    },

    willPositionPopup: {
        value: function(popup, defaultPosition) {
            var content = popup.content.element,
                contentHt = parseFloat(content.style.height) || content.offsetHeight || 0,
                contentWd = parseFloat(content.style.width) || content.offsetWidth || 0,
                pt = webkitConvertPointFromNodeToPage(this.selectedMaterialNode, new WebKitPoint(0, 0));
            return {top: pt.y - contentHt + 10, left: pt.x - contentWd + 10};
        }
    }
});
