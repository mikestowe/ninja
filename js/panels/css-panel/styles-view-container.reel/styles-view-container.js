/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.StylesViewContainer = Montage.create(Component, {
    contentController : {
        value: null
    },
    contentPanel : {
        value: 'rules'
    },
    _hasStyles : {
        value: false
    },
    hasStyles : {
        get: function() {
            return this._hasStyles;
        },
        set: function(hasThem) {
            this._hasStyles = hasThem;
            this.needsDraw = true;
        }
    },
    templateDidLoad : {
        value: function() {
            this.eventManager.addEventListener('styleSheetsReady', this, false);
            this.eventManager.addEventListener('elementChange', this, false);
        }
    },
    handleStyleSheetsReady: {
        value: function(e) {
            this.eventManager.addEventListener( "selectionChange", this, false);
        }
    },
    handleSelectionChange: {
        value: function() {
            var elements = this.application.ninja.selectedElements;

            if(elements.length === 0) { return false; }

            this.ruleListContainer.displayListForSelection(elements);
            this.hasStyles = true;
        }
    },
    handleElementChange : {
        value: function(e) {
            if(e._event.detail.type !== 'cssChange') {
                this.ruleListContainer.displayedList.component.update();
            }
        }
    },

    draw : {
        value: function() {
            if(this.hasStyles) {
                this.element.classList.remove('no-styles');
            } else {
                this.element.classList.add('no-styles');
            }
        }
    }
});