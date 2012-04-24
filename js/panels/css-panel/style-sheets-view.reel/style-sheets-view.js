/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.StyleSheetsView = Montage.create(Component, {
    noDocumentCondition : {
        value: true
    },
    showToolbar : {
        value: false
    },
    _resizedHeight : {
        value: null
    },
    isResizing : {
        value: null
    },
    _height: {
        value: null
    },
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

    styleSheets : {
        value: []
    },
    stylesController : {
        value: null
    },
    deserializedFromTemplate : {
        value: function() {
            console.log("style sheet view - deserialized");

            this.stylesController = this.application.ninja.stylesController;

            this.eventManager.addEventListener("styleSheetsReady", this, false);
            this.eventManager.addEventListener("newStyleSheet", this, false);
        }
    },
    _initView : {
        value: false
    },

    handleStyleSheetsReady : {
        value: function(e) {
            this._initView = this.needsDraw = true;

//            this.noDocumentCondition = false;
//            this.showToolbar = true;
//            this.styleSheets = this.stylesController.userStyleSheets;

        }
    },
    handleNewStyleSheet : {
        value: function(e) {
            this.styleSheets.push(e._event.detail);
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


    prepareForDraw : {
        value: function() {
            console.log("style sheet view - prepare for draw");
        }
    },
    draw : {
        value: function() {
            console.log("styles sheet view - draw");

            if(this._initView) {
                this.noDocumentCondition = false;
                this.showToolbar = true;
                this.styleSheets = this.stylesController.userStyleSheets;
                this._initView = false;
            }

            if(this.height) {
                console.log("StyleSheetsView draw - resizing to", (this.height + this._resizedHeight) + "px");
                this.styleSheetList.element.style.height = (this.height + this._resizedHeight) + "px";
            }
        }
    },
    didDraw: {
        value: function() {
            if(!this.isResizing) {
                this.height = this.styleSheetList.element.offsetHeight;
            }
        }
    }
});