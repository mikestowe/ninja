/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;

var	PanelBase = require("js/panels/PanelBase").PanelBase;
var ComponentsPanelBase = require("js/panels/Components/ComponentsPanelBase.reel").ComponentsPanelBase;

exports.ComponentsPanel = Montage.create(PanelBase, {
    id : {value : "componentsPanel", writable:true, enumerable:true, configurable:true},
    panelName : {value : "Components", writable:true, enumerable:true, configurable:true},
    panelHeaderID : {value : "componentsPanelHeader", writable:true, enumerable:true, configurable:true},
    disclosureIconID : {value : "componentsPanelDisclosureIcon", writable:true, enumerable:true, configurable:true},
    closeButtonID : {value : "componentsPanelCloseButton", writable:true, enumerable:true, configurable:true},
    panelContentID : {value : "componentsPanelContent", writable:true, enumerable:true, configurable:true},

    init : {
        value : function()
        {
            this.contentHeight = 200;
            this.minHeight = 100;
            this.defaultHeight = 200;

            /* OLD WAY -- Removing the temporary div
            // TODO: Remove this comment once this is tested.
            var panelContainer = document.createElement("div");
            this._componentsPanelBase = ComponentsPanelBase.create();
            this._componentsPanelBase.element = panelContainer;

            this.content = this._componentsPanelBase;
            this._componentsPanelBase.needsDraw = true;
            */

            this.content = ComponentsPanelBase.create();
        }
    },

    _componentsPanelBase:{
        enumerable: true,
        value: null,
        writable:true
    }

});