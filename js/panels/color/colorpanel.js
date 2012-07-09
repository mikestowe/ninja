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

////////////////////////////////////////////////////////////////////////
//
var Montage =   require("montage/core/core").Montage,
    PanelBase = require("js/panels/panelbase").PanelBase;
////////////////////////////////////////////////////////////////////////
//Exporting as ColorPanel
exports.ColorPanel = Montage.create(PanelBase, {
    ////////////////////////////////////////////////////////////////////
    //Panel Configuration
    panelName:          {value: "Color",                    writable: true, enumerable: true, configurable: true},
    panelHeaderID:      {value: "colorPanelHeader",         writable: true, enumerable: true, configurable: true},
    disclosureIconID:   {value: "colorPanelDisclosureIcon", writable: true, enumerable: true, configurable: true},
    closeButtonID:      {value: "colorPanelCloseButton",    writable: true, enumerable: true, configurable: true},
    panelContentID:     {value: "colorPanelContent",        writable: true, enumerable: true, configurable: true},
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
        }
    },
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
