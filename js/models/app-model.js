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
    Component = require("montage/ui/component").Component;

exports.AppModel = Montage.create(Component, {

    _currentDocument: {
        value : null
    },

    currentDocument : {
        get : function() {
            return this._currentDocument;
        },
        set : function(value) {
            if (value === this._currentDocument) {
                return;
            }

            if(this._currentDocument && this._currentDocument.currentView === "design") {
                this._currentDocument.model.draw3DGrid = this.show3dGrid;
            }

            this._currentDocument = value;

            if(this._currentDocument && this._currentDocument.currentView === "design") {
                this.show3dGrid = this._currentDocument.model.draw3DGrid;
            }

        }
    },

    _livePreview: {
        value: false
    },

    livePreview: {
        get: function() {
            return this._livePreview;
        },
        set: function(value) {
            this._livePreview = value;
        }
    },
    _chromePreview: {
        value: false
    },

    chromePreview: {
        get: function() {
            return this._chromePreview;
        },
        set: function(value) {
            this._chromePreview = value;
        }
    },

    _layoutView: {
        value: "layoutAll"
    },

    layoutView: {
        get: function() {
            return this._layoutView;
        },
        set: function(value) {
            this._layoutView = value;
        }
    },

    _layoutAll: {
        value: true
    },

    layoutAll: {
        get: function() {
            return this._layoutAll;
        },
        set: function(value) {

            if(value) {
                this.layoutView = "layoutAll";
                this.layoutItems = false;
                this.layoutOff = false;
            }

            this._layoutAll = value;

        }
    },

    _layoutItems: {
        value: false
    },

    layoutItems: {
        get: function() {
            return this._layoutItems;
        },
        set: function(value) {

            if(value) {
                this.layoutView = "layoutItems";
                this.layoutAll = false;
                this.layoutOff = false;
            }

            this._layoutItems = value;
        }
    },

    _layoutOff: {
        value: false
    },

    layoutOff: {
        get: function() {
            return this._layoutOff;
        },
        set: function(value) {

            if(value) {
                this.layoutView = "layoutOff";
                this.layoutAll = false;
                this.layoutItems = false;
            }

            this._layoutOff = value;
        }
    },

    _snap: {
        value: true
    },

    snap: {
        get: function() {
            return this._snap;
        },
        set: function(value) {
            this._snap = value;
        }
    },

    _snapGrid: {
        value: true
    },

    snapGrid: {
        get: function() {
            return this._snapGrid;
        },
        set: function(value) {
            this._snapGrid = value;
        }
    },

    _snapObjects: {
        value: true
    },

    snapObjects: {
        get: function() {
            return this._snapObjects;
        },
        set: function(value) {
            this._snapObjects = value;
        }
    },

    _snapAlign: {
        value: true
    },

    snapAlign: {
        get: function() {
            return this._snapAlign;
        },
        set: function(value) {
            this._snapAlign = value;
        }
    },

    _show3dGrid: {
        value: false
    },

    show3dGrid: {
        get: function() {
            return this._show3dGrid;
        },
        set: function(value) {
            this._show3dGrid = value;
        }
    },

    _documentStageView: {
        value: "front"
    },

    documentStageView: {
        get: function() {
            return this._documentStageView;
        },
        set: function(value) {
            this._documentStageView = value;
        }
    },

    _frontStageView: {
        value: true
    },

    frontStageView: {
        get: function() {
            return this._frontStageView;
        },
        set: function(value) {
            if(value) {
                this.documentStageView = "front";
                this.topStageView = false;
                this.sideStageView = false;
            }

            this._frontStageView = value;
        }
    },

    _topStageView: {
        value: false
    },

    topStageView: {
        get: function() {
            return this._topStageView;
        },
        set: function(value) {
            if(value) {
                this.documentStageView = "top";
                this.frontStageView = false;
                this.sideStageView = false;
            }

            this._topStageView = value;
        }
    },

    _sideStageView: {
        value: false
    },

    sideStageView: {
        get: function() {
            return this._sideStageView;
        },
        set: function(value) {
            if(value) {
                this.documentStageView = "side";
                this.frontStageView = false;
                this.topStageView = false;
            }

            this._sideStageView = value;
        }
    },

    _debug: {
        value: true
    },

    debug: {
        get: function() {
            return this._debug;
        },
        set: function(value) {
            this._debug = value;
        }
    },

    /**
     * Panels Model Properties
     */
    _propertiesPanel: {
        value: true
    },

    PropertiesPanel: {
        get: function() {
            return this._propertiesPanel;
        },
        set: function(value) {
            this._propertiesPanel = value;
        }
    },

    _projectPanel: {
        value: true
    },

    ProjectPanel: {
        get: function() {
            return this._projectPanel;
        },
        set: function(value) {
            this._projectPanel = value;
        }
    },

    _colorPanel: {
        value: true
    },

    ColorPanel: {
        get: function() {
            return this._colorPanel;
        },
        set: function(value) {
            this._colorPanel = value;
        }
    },

    _componentsPanel: {
        value: true
    },

    ComponentsPanel: {
        get: function() {
            return this._componentsPanel;
        },
        set: function(value) {
            this._componentsPanel = value;
        }
    },

    _CSSPanel: {
        value: true
    },

    CSSPanel: {
        get: function() {
            return this._CSSPanel;
        },
        set: function(value) {
            this._CSSPanel = value;
        }
    },

    _materialsPanel: {
        value: true
    },

    MaterialsPanel: {
        get: function() {
            return this._materialsPanel;
        },
        set: function(value) {
            this._materialsPanel = value;
        }
    },

    _presetsPanel: {
        value: true
    },

    PresetsPanel: {
        get: function() {
            return this._presetsPanel;
        },
        set: function(value) {
            this._presetsPanel = value;
        }
    },

    _materials: {
        value: []
    },

    materials: {
        get: function() {
            return this._materials;
        },
        set: function(value) {
            this._materials = value;
        }
    }

});
