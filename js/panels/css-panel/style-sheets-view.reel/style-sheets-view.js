/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.StyleSheetsView = Montage.create(Component, {
    noDocumentCondition  : { value: true },
    showToolbar          : { value: false },
    stylesController     : { value: null },
    styleSheets          : { value: [] },
    _initView            : { value: false },
    documentNameLabel    : { value: null },
    noDocumentLabelClass : { value: "no-document" },

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
    
    /// Toolbar Button Actions
    /// --------------------------------

    ///// Add rule button action
    handleAddAction : {
        value: function(e) {
            this.stylesController.createStylesheet();
        }
    },

    /// App event handlers
    /// --------------------------------
    
    handleStyleSheetsReady : {
        value: function(e) {
            this.documentName = this.stylesController.activeDocument.name;
            this.styleSheets = this.stylesController.userStyleSheets;
            this._initView = this.needsDraw = true;
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
});