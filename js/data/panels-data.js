/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;

exports.PanelsData = Montage.create(Montage, {

    panels: {
        value: [
        {
            name: "Color",
            height: 200,
            minHeight: 200,
            maxHeight: null,
            flexible: false,
            scrollable: false,
            collapsed: false,
            open: true,
            modulePath: "js/panels/Color/colorpanelbase.reel",
            moduleName: "ColorPanelBase"
        },
        {
            name: "Properties",
            minHeight: 200,
            height: 200,
            maxHeight: null,
            flexible: true,
            scrollable: true,
            collapsed: false,
            open: true,
            modulePath: "js/panels/properties.reel",
            moduleName: "Properties"
        },
        {
            name: "Materials",
            minHeight: 100,
            height: 100,
            maxHeight: null,
            flexible: true,
            collapsed: true,
            scrollable: true,
            open: true,
            modulePath: "js/panels/Materials/materials-library-panel.reel",
            moduleName: "MaterialsLibraryPanel"
        },
        {
            name: "Components",
            minHeight: 100,
            height: 200,
            maxHeight: null,
            flexible: true,
            scrollable: true,
            collapsed: true,
            open: true,
            modulePath: "js/panels/Components/ComponentsPanelBase.reel",
            moduleName: "ComponentsPanelBase"
        },
//        {
//            name: "Project/Assets",
//            minHeight: 250,
//            height: 250,
//            maxHeight: null,
//            flexible: true,
//            scrollable: true,
//            collapsed: false,
//            open: true,
//            modulePath: "js/panels/Project/projectpanelbase.reel",
//            moduleName: "ProjectPanelBase"
//        },
        {
            name: "CSS",
            minHeight: 195,
            height: 195,
            maxHeight: null,
            flexible: true,
            scrollable: true,
            collapsed: true,
            open: true,
            modulePath: "js/panels/CSSPanel/CSSPanelBase.reel",
            moduleName: "CSSPanelBase"
        },
        {
            name: "Presets",
            minHeight: 100,
            height: 100,
            maxHeight: null,
            flexible: true,
            collapsed: true,
            scrollable: true,
            open: true,
            modulePath: "js/panels/presets/content.reel",
            moduleName: "content"
        }
    ]
    }


    /*
    _panelOrder: {
        value: ["Properties","Color","Components","Project/Assets", "CSS","Materials"]
    },

    panelOrder: {
        get: function() {
            return this._panelOrder;
        },
        set: function(val) {
            this._panelOrder = val;
        }
    }
    */

});