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
    Component = require("montage/ui/component").Component;

exports.StyleSheetsView = Montage.create(Component, {

    toolbar: {
        value: null,
        serializable: true
    },

    styleSheetList: {
        value: null,
        serializable: true
    },

    documentLoaded       : { value: false },
    showToolbar          : { value: false },
    stylesController     : { value: null },
    styleSheets          : { value: [] },
    _initView            : { value: false },
    _needsScroll         : { value: false },
    documentNameLabel    : { value: null, serializable: true },
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
                if(sheetComponent) {
                    sheetComponent['default'] = true;
                    if(this._defaultStyleSheet) {
                        oldDefaultSheet = this.styleSheetList.childComponents[this.styleSheets.indexOf(this._defaultStyleSheet)];
                        oldDefaultSheet['default'] = false;
                    }
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
            this.documentName = this.stylesController.currentDocument.name;
            this.styleSheets = this.stylesController.userStyleSheets;

            Object.defineBinding(this, 'activeDocument', {
                'boundObject': this.stylesController,
                'boundObjectPropertyPath': 'currentDocument',
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
