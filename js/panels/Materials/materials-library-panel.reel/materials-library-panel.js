/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Tree = require("js/components/tree.reel").Tree,
    MaterialsPopup = require("js/panels/Materials/materials-popup.reel").MaterialsPopup,
    PopupMananger =		require("js/components/popup-manager.reel").PopupMananger,
    Popup = require("montage/ui/popup/popup.reel").Popup;

exports.MaterialsLibraryPanel = (require("montage/core/core").Montage).create(require("montage/ui/component").Component, {

    _hasFocus: {
    	enumerable: false,
    	value: false
    },
    
    prepareForDraw: {
    	enumerable: false,
    	value: function() {
            var treeHolderDiv = document.getElementById("materials_library_tree");
            var materialsTree = Tree.create();
            materialsTree.element = treeHolderDiv;
            materialsTree.dataProvider = this._loadXMLDoc("js/panels/Materials/Materials.xml");
            materialsTree.needsDraw = true;

            materialsTree.addEventListener("change", this, true);
    	}
    },

    willDraw: {
    	enumerable: false,
    	value: function() {

    	}
    },
    
    draw: {
    	enumerable: false,
    	value: function() {

    	}
    },

    _loadXMLDoc: {
        value:function(dname) {
            if (window.XMLHttpRequest) {
                xhttp = new XMLHttpRequest();
            }
            xhttp.open("GET", dname, false);
            xhttp.send();
            return xhttp.responseXML;
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

    captureChange: {
        value:function(e) {
            var tNode = e._event.treeNode;
            this._showMaterialPopup(tNode.id);
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