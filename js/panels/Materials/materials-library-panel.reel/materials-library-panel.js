/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Tree = require("js/components/tree.reel").Tree,
    Button = require("js/components/button.reel").Button,
    MaterialsPopup = require("js/panels/Materials/materials-popup.reel").MaterialsPopup,
    PopupMananger =		require("js/components/popup-manager.reel").PopupMananger;

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

            var addButton = Button.create();
            addButton.element = document.getElementById("ml_add_btn");
            addButton.label = "Add";
            addButton.needsDraw = true;
            addButton.addEventListener("action", this, true);

            var copyButton = Button.create();
            copyButton.element = document.getElementById("ml_copy_btn");
            copyButton.label = "Copy";
            copyButton.needsDraw = true;
            copyButton.addEventListener("action", this, true);

            var deleteButton = Button.create();
            deleteButton.element = document.getElementById("ml_delete_btn");
            deleteButton.label = "Delete";
            deleteButton.needsDraw = true;
            deleteButton.addEventListener("action", this, true);
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

    captureAction: {
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
            var left, top;
            //TODO: Figure out if this is the best way to detect where user clicked
            var mouseEvent = e._event.mouseEvent;
    		if (mouseEvent.clientX && mouseEvent.clientY) {
    			if (mouseEvent.clientX > (parseInt(document.width)/2)) {
                    left = mouseEvent.clientX - mouseEvent.offsetX-2;
                    top = mouseEvent.currentTarget.clientHeight/2+mouseEvent.clientY - mouseEvent.offsetY;
    			} else {
                    left = mouseEvent.clientX - mouseEvent.offsetX+parseInt(mouseEvent.currentTarget.clientWidth);
                    top = mouseEvent.clientY - mouseEvent.offsetY;
    			}
    		}
            
            this._showMaterialPopup(left + 'px', top + 'px', 'right', 'top', tNode.id);
        }
    },

    _materialPopup: {
        enumerable:true,
        value:null
    },
    
    _showMaterialPopup: {
    	enumerable: false,
    	value: function (x, y, side, align, materialID) {
    		if (this._materialPopup && this._materialPopup.opened) {
    			if (this._materialPopup.popup.position.x === x && this._materialPopup.popup.position.y === y) {
					this._hideMaterialPopup();
    			} else {
    				this._materialPopup.popup.position = {x: x, y: y};
    				this._materialPopup.popup.tooltip = {side: side, align: align};
                    this._materialPopup.popup.base.loadMaterials(materialID);
    				//TODO: Tooltip needs to be fixed to allow aligning to change on fly
    				//this._materialPopup.popup.drawTooltip();
    			}
    		} else {
    			////////////////////////////////////////////////////
    			//Creating popup from m-js component
    			var popup = document.createElement('div');
    			var content = document.createElement('div');
    			var popupBase = MaterialsPopup.create();


    			//TODO: Check to see if this HACK is needed
    			//(elements needs to be on DOM to be drawn)
    			document.body.appendChild(popup);
    			popupBase.element = popup;
   				popupBase.needsDraw = true;
   				document.body.removeChild(popup);
    			//Adding drawn element to container
    			content.appendChild(popupBase.element);

    			//Creating an instance of the popup and sending in created material popup content
                this._materialPopup = {};
	        	this._materialPopup.popup = PopupMananger.createPopup(content, {x: x, y: y}, {side: side, align: align});
				this._materialPopup.popup.element.style.opacity = 0;
                this._materialPopup.popup.base = popupBase;
				popupBase._material = MaterialsLibrary.getMaterial( materialID );
				popupBase._materialName = materialID;
				//TODO: Fix this animation/draw HACK (Move to didDraw callback)
				setTimeout(function () {
					this._materialPopup.popup.element.style.opacity = 1;
                    this._materialPopup.popup.base.loadMaterials(materialID);
				}.bind(this), 150);



	        	//Popup was added, so it's opened
	        	this._materialPopup.opened = true;
	        	//TODO: Fix this HACK, it listens to this canvas to be clicked to close popup
	        	document.getElementById('stageAndScenesContainer').addEventListener('click', this, false);
        	}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    handleClick: {
    	enumerable: true,
    	value: function (e) {
    		//TODO: Fix this HACK
    		if (e._event.target.id === 'stageCanvas' && this._materialPopup.opened) {
    			this._handleDocumentClick(e);
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _handleDocumentClick: {
    	enumerable: false,
    	value: function (e) {
    		this._hideMaterialPopup();
    		//TODO: Fix this HACK
			document.getElementById('stageAndScenesContainer').removeEventListener ('click', this, false);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _hideMaterialPopup: {
    	enumerable: false,
    	value: function () {
    		if (this._materialPopup.opened) {
    			//
	    		PopupMananger.removePopup(this._materialPopup.popup.element);
	    		this._materialPopup.opened = false;
	    		//TODO: Fix HACK of removing popup
	    		this._materialPopup.popup.base.destroy();
	    		this._materialPopup.popup = null;
	    	}
    	}
    }
});