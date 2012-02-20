/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.AppModel = Montage.create(Component, {

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