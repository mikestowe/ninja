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
            groups: ["default"],
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
            groups: ["default", "ws-binding"],
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
            groups: ["default"],
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
            groups: ["default", "ws-binding"],
            minHeight: 100,
            height: 200,
            maxHeight: null,
            flexible: true,
            scrollable: true,
            collapsed: true,
            open: true,
            modulePath: "js/panels/components-panel.reel",
            moduleName: "ComponentsPanel"
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
            groups: ["default"],
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
            groups: ["default"],
            minHeight: 100,
            height: 100,
            maxHeight: null,
            flexible: true,
            collapsed: true,
            scrollable: true,
            open: true,
            modulePath: "js/panels/presets/content.reel",
            moduleName: "content"
        },
        {
            name: "History",
            groups: ["default"],
            minHeight: 100,
            height: 100,
            maxHeight: null,
            flexible: true,
            collapsed: true,
            scrollable: true,
            open: true,
            modulePath: "js/panels/history-panel/history.reel",
            moduleName: "History"
        },
        {
            name: "Binding",
            groups: ["ws-binding"],
            minHeight: 100,
            height: 100,
            maxHeight: null,
            flexible: true,
            collapsed: true,
            scrollable: true,
            open: true,
            modulePath: "js/panels/binding-panel.reel",
            moduleName: "BindingPanel"
        },
        {
            name: "Objects",
            groups: ["ws-binding"],
            minHeight: 100,
            height: 100,
            maxHeight: null,
            flexible: true,
            collapsed: true,
            scrollable: true,
            open: true,
            modulePath: "js/panels/objects/objects-panel.reel",
            moduleName: "ObjectsPanel"
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