/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.StyleSheetsView = Montage.create(Component, {
    documentLoaded       : { value: false },
    showToolbar          : { value: false },
    stylesController     : { value: null },
    styleSheets          : { value: [] },
    _initView            : { value: false },
    _needsScroll         : { value: false },
    documentNameLabel    : { value: null },
    noDocumentLabelClass : { value: "no-document" },

    _activeDocument: {
        value: null
    },
    activeDocument : {
        get: function() {
            return this._activeDocument;
        },
        set: function(value) {
            if(value === this._activeDocument) { return;}

            this.documentLoaded = !!value;

            this._activeDocument = value;
        }
    },

    _documentName : { value: null },
    documentName : {
        get: function() {
            return this._documentName;
        },
        set: function(label) {
            if(label === this._documentName) { return false; }
            
            this._documentName = label;
            this.needsDraw = true;
        }
    },
    _defaultStyleSheet: { value: null },
    defaultStyleSheet: {
        get: function() {
            return this._defaultStyleSheet;
        },
        set: function(sheet) {
            if(sheet === this._defaultStyleSheet) { return false; }

            if(sheet === null) {
                this._defaultStyleSheet = null;
                return;
            }

            var sheetComponent, oldDefaultSheet;

            if(this.styleSheetList) {
                sheetComponent = this.styleSheetList.childComponents[this.styleSheets.indexOf(sheet)];
                sheetComponent.default = true;
                if(this._defaultStyleSheet) {
                    oldDefaultSheet = this.styleSheetList.childComponents[this.styleSheets.indexOf(this._defaultStyleSheet)];
                    oldDefaultSheet.default = false;
                }
            }

            this._defaultStyleSheet = sheet;
            this.needsDraw = true;
        }
    },

    _dirtyStyleSheets : { value: null },
    dirtyStyleSheets : {
        get: function() {
            return this._dirtyStyleSheets;
        },
        set: function(value) {
            if(value === this._dirtyStyleSheets) { return false; }

            this._dirtyStyleSheets = value;

            this.needsDraw = true;
        }
    },

    /// Toolbar Button Actions
    /// --------------------------------

    ///// Add rule button action
    handleAddAction : {
        value: function(e) {
            this.stylesController.createStylesheet();
            this.needsDraw = this._needsScroll = true;

        }
    },

    handleDeleteAction : {
        value: function(sheetComponent) {
            this.stylesController.removeStyleSheet(sheetComponent.source);
            this.stylesController._clearCache();
            this._dispatchChange();
        }
    },

    /// App event handlers
    /// --------------------------------
    
    handleStyleSheetsReady : {
        value: function(e) {
            this.documentName = this.stylesController.activeDocument.name;
            this.styleSheets = this.stylesController.userStyleSheets;

            Object.defineBinding(this, 'activeDocument', {
                'boundObject': this.stylesController,
                'boundObjectPropertyPath': 'activeDocument',
                'oneway': true
            });

            Object.defineBinding(this, 'defaultStyleSheet', {
                'boundObject': this.stylesController,
                'boundObjectPropertyPath': 'defaultStylesheet',
                'oneway': false
            });

            Object.defineBinding(this, 'dirtyStyleSheets', {
                'boundObject': this.stylesController,
                'boundObjectPropertyPath': 'dirtyStyleSheets',
                'oneway': true
            });

            this._initView = this.needsDraw = true;
        }
    },

    handleStyleSheetModified : {
        value: function(e) {
            this.needsDraw = true;
        }
    },

    /// Draw cycle
    /// --------------------------------
    
    templateDidLoad : {
        value: function() {
            this.stylesController = this.application.ninja.stylesController;
        }
    },
    prepareForDraw : {
        value: function() {
            this.eventManager.addEventListener("styleSheetsReady", this, false);
            this.eventManager.addEventListener("styleSheetModified", this, false);
        }
    },
    draw : {
        value: function() {
            if(this._initView) {
                this.noDocumentCondition = false;
                this.showToolbar = true;
                this._initView = false;
            }

            if(this.height) {
                this.styleSheetList.element.style.height = (this.height + this._resizedHeight) + "px";
            }
            
            if(this.documentName && this.documentNameLabel) {
                this.documentNameLabel.innerHTML = this.documentName;
                this.documentNameLabel.classList.remove(this.noDocumentLabelClass);
            } else {
                this.documentNameLabel.classList.add(this.noDocumentLabelClass);
            }

            if(this.dirtyStyleSheets) {
                var dirtySheets = this.dirtyStyleSheets.map(function(sheetDescriptor) {
                    return sheetDescriptor.stylesheet;
                });

                this.styleSheetList.childComponents.forEach(function(sheetComponent) {
                    sheetComponent.dirty = dirtySheets.indexOf(sheetComponent.source) !== -1;
                }, this);
            }

            if(this._needsScroll) {

                setTimeout(function() {
                    console.log('setting scroll top to:', this.styleSheetList.element.scrollHeight);
                    //debugger;
                    this.styleSheetList.element.scrollTop = this.styleSheetList.element.scrollHeight;
                }.bind(this), 50);

                this._needsScroll = false;
            }
        }
    },
    didDraw: {
        value: function() {
            if(!this.isResizing) {
                this.height = this.styleSheetList.element.offsetHeight;
            }
        }
    },


    /// Resize properties
    /// --------------------------------

    _resizedHeight : { value: null },
    isResizing     : { value: null },
    _height        : { value: null },
    height: {
        get: function() {
            return this._height;
        },
        set: function(val) {
            if(this._height !== val) {
                this._height = val;
                this.needsDraw = true;
            }
        }
    },
    handleResizeStart: {
        value:function(e) {
            this.isResizing = true;
            this.needsDraw = true;
        }
    },

    handleResizeMove: {
        value:function(e) {
            this._resizedHeight = e._event.dY;
            this.needsDraw = true;
        }
    },

    handleResizeEnd: {
        value: function(e) {
            this.height += this._resizedHeight;
            this._resizedHeight = 0;
            this.isResizing = false;
            this.needsDraw = true;
        }
    },

    ///// Utilities
    //// -------------------------------------

    _dispatchChange : {
        value: function(category, type, data) {
            this.application.ninja.stage.updatedStage = true;

            category = category || 'elementChange';
            type = type || 'styleSheetRemoved';

            NJevent(category, {
                type : type,
                data: data,
                redraw: null
            });
        }
    }
});