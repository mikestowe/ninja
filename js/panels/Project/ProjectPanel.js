/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
	PanelBase = 		require("js/panels/PanelBase").PanelBase,
	ProjectPanelBase =	require("js/panels/Project/ProjectPanelBase.reel").ProjectPanelBase;

exports.ProjectPanel = Montage.create(PanelBase, {
   
	id: {value: "projectPanel", writable: true, enumerable: true, configurable: true},
    panelName: {value: "Project/Assets", writable: true, enumerable: true, configurable: true},
    panelHeaderID: {value: "projectPanelHeader", writable: true, enumerable: true, configurable: true},
    disclosureIconID: {value: "projectPanelDisclosureIcon", writable: true, enumerable: true, configurable: true},
    closeButtonID: {value: "projectPanelCloseButton", writable: true, enumerable: true, configurable: true},
    panelContentID: {value: "projectPanelContent", writable: true, enumerable: true, configurable: true},

    init: {
    	enumerable: true,
    	value: function() {
			//Creating panel container and panel
            this.minHeight = 350;
            this.defaultHeight = 350;
            this.contentHeight = 395;

            /* OLD WAY -- Removing the temporary div
            // TODO: Remove this comment once this is tested.
            var ppContainer = document.createElement("div");
            ppContainer.setAttribute("id", "pp-container");
            this._projectPanelBase = ProjectPanelBase.create();
            this._projectPanelBase.element = ppContainer;
            //Adding container to the parent
            this.content = this._projectPanelBase;
           	//Drawing panel
            this._projectPanelBase.needsDraw = true;
            */

            this.content = ProjectPanelBase.create();
        }
    }
});
