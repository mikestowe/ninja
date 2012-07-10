/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage = require("montage/core/core").Montage,
    PanelBase =         require("js/panels/PanelBase").PanelBase,
    ProjectPanelBase =  require("js/panels/Project/ProjectPanelBase.reel").ProjectPanelBase;

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
