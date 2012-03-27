/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    MaterialsData = require("js/panels/Materials/materials-data.json"),
    Popup = require("montage/ui/popup/popup.reel").Popup;

exports.MaterialsLibraryPanel = Montage.create(Component, {

    materialsData: {
        value: null
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
                case "Add":
                    console.log("Add new material");
                    break;
                case "Copy":
                    console.log("Copy selected material");
                    break;
                case "Delete":
                    console.log("Delete selected material");
                    break;
            }
        }
    },

    handleNodeActivation: {
        value:function(obj) {
            this._showMaterialPopup(obj.id);
        }
    },

    handleShowMaterialPopup: {
        enumerable: false,
        value: function (event) {
            this._showMaterialPopup(event.detail.materialId);
        }
    },

    _materialPopup: {
        enumerable:true,
        value:null
    },

    _materialInfo: {
        enumerable:true
    },
    
    _showMaterialPopup: {
    	enumerable: false,
    	value: function (materialID) {

            if(!this._materialPopup)
            {
                this._materialPopup = Popup.create();
                this._materialPopup.content = this._materialInfo;
                this._materialPopup.modal = false;
                this.eventManager.addEventListener("hideMaterialPopup", this, false);
                this._materialPopup.addEventListener("show", this, false);
            }
            this._materialPopup.show();
            this._materialInfo.loadMaterials(materialID);
    	}
    },

    handleHideMaterialPopup: {
    	enumerable: false,
    	value: function (event) {
            if(this._materialPopup){
                this._materialPopup.hide();
            }
    	}
    }
});