/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
	PanelBase = require("js/panels/PanelBase").PanelBase,
    MaterialsLibraryPanel =	require("js/panels/Materials/materials-library-panel.reel").MaterialsLibraryPanel;

exports.MaterialsPanel = Montage.create(PanelBase, {
    id : {value : "materialsPanel", writable:true, enumerable:true, configurable:true},
    panelName : {value : "Materials", writable:true, enumerable:true, configurable:true},
    panelHeaderID : {value : "materialsPanelHeader", writable:true, enumerable:true, configurable:true},
    disclosureIconID : {value : "materialsPanelDisclosureIcon", writable:true, enumerable:true, configurable:true},
    closeButtonID : {value : "materialsPanelCloseButton", writable:true, enumerable:true, configurable:true},
    panelContentID : {value : "materialsPanelContent", writable:true, enumerable:true, configurable:true},

    _materialsLibraryPanel : {
        enumerable: true,
        value: null,
        writable:true
    },

    init : {
        enumerable:true,
        value : function (){
            /* OLD WAY -- Removing the temporary div
            // TODO: Remove this comment once this is tested.
            var panelContainer = document.createElement("div");

            panelContainer.setAttribute("id", "materialsLibraryPanel");
            this._materialsLibraryPanel = MaterialsLibraryPanel.create();
            this._materialsLibraryPanel.element = panelContainer;
            //Adding container to the parent

            this.content = this._materialsLibraryPanel;
            this._materialsLibraryPanel.needsDraw = true;
            */
            this.content = MaterialsLibraryPanel.create();
        }
    }

});