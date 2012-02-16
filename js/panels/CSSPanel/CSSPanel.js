/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
	PanelBase = require("js/panels/PanelBase").PanelBase;

var CSSPanelBase = require("js/panels/CSSPanel/CSSPanelBase.reel").CSSPanelBase;

exports.CSSPanel = Montage.create(PanelBase, {
    id : {value : "cssPanel", writable:true, enumerable:true, configurable:true},
    panelName : {value : "CSS", writable:true, enumerable:true, configurable:true},
    panelHeaderID : {value : "cssPanelHeader", writable:true, enumerable:true, configurable:true},
    disclosureIconID : {value : "cssPanelDisclosureIcon", writable:true, enumerable:true, configurable:true},
    closeButtonID : {value : "cssPanelCloseButton", writable:true, enumerable:true, configurable:true},
    panelContentID : {value : "cssPanelContent", writable:true, enumerable:true, configurable:true},

    init : {
        enumerable:true,
        value : function (){
            this.minHeight = 195;
            this.contentHeight = 195;
            this.defaultHeight= 195;

            /* OLD WAY -- Removing the temporary div
            // TODO: Remove this comment once this is tested.

            var panelContainer = document.createElement("div");
            this._cssPanelBase = CSSPanelBase.create();
            this._cssPanelBase.element = panelContainer;

            this.content = this._cssPanelBase;
            this._cssPanelBase.needsDraw = true;
             */
            //debugger;
            this.content = CSSPanelBase.create();
        }
    },
    reinit : {
        value : function() {
            this._cssPanelBase.clearStyleSheetList();
            this._cssPanelBase.clearCSSRules();
            this._cssPanelBase.populateStyleSheetList();
        }
    },
    _cssPanelBase : {
        enumerable: true,
        value: null,
        writable:true
    }
}); 