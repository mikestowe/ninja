/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
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
