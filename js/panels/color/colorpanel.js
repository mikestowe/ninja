/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage =	require("montage/core/core").Montage,
    PanelBase =	require("js/panels/panelbase").PanelBase;
////////////////////////////////////////////////////////////////////////
//Exporting as ColorPanel
exports.ColorPanel = Montage.create(PanelBase, {
    ////////////////////////////////////////////////////////////////////
    //Panel Configuration
    panelName: 			{value: "Color", 					writable: true, enumerable: true, configurable: true},
    panelHeaderID: 		{value: "colorPanelHeader", 		writable: true, enumerable: true, configurable: true},
    disclosureIconID: 	{value: "colorPanelDisclosureIcon",	writable: true, enumerable: true, configurable: true},
    closeButtonID: 		{value: "colorPanelCloseButton", 	writable: true, enumerable: true, configurable: true},
    panelContentID: 	{value: "colorPanelContent", 		writable: true, enumerable: true, configurable: true},
    ////////////////////////////////////////////////////////////////////
    //Creating panel from base view class
    init: {
        enumerable: true,
        value: function() {
            //Initializing Wrapper
            this.minHeight = 200;
            this.maxHeight = 200;
            this.contentHeight = 200;
            this.isStatic = true;
            this.scrollable = false;
            //Getting view from base in controller
            this.content = this.application.ninja.colorController.colorView = this.application.ninja.colorController.colorPanelBase.create();
            //Checking for first draw to apply default colors
            this.content.addEventListener('firstDraw', this, false);


            ////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////
            //TODO: Remove and add via toolbar draw loop

            ////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////


        }
    },
    ////////////////////////////////////////////////////////////////////
    //Applying default colors only on first draw

    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});