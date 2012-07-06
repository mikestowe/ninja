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
            scrollable: false,
            collapsed: false,
            open: true,
            modulePath: "js/panels/css-panel/css-panel.reel",
            moduleName: "CssPanel"
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
        }
//            ,
//        {
//            name: "Objects",
//            groups: ["ws-binding"],
//            minHeight: 100,
//            height: 100,
//            maxHeight: null,
//            flexible: true,
//            collapsed: true,
//            scrollable: true,
//            open: true,
//            modulePath: "js/panels/objects/objects-panel.reel",
//            moduleName: "ObjectsPanel"
//        }
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
