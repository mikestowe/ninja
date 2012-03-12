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
            console.log("styles view container - deserialized");
            this.eventManager.addEventListener('styleSheetsReady', this, false);
        }
    },
    handleStyleSheetsReady: {
        value: function(e) {
            this.eventManager.addEventListener( "selectionChange", this, false);
        }
    },
    handleSelectionChange: {
        value: function() {
            var elements = this.application.ninja.selectedElements,
                type, selection, ruleList;

            if(elements.length === 0) {
                return false;
            } else if(elements.length > 1) {
                type = 'ELEMENTS';
                selection = elements.map(function(obj) {
                    return obj._element;
                });
            } else {
                type = 'ELEMENT';
                selection = elements[0]._element;
            }

            ruleList = this.ruleListContainer._getRuleList({
                selectionType : type,
                selection : selection
            });

            if(ruleList) {
                this.ruleListContainer.displayedList = ruleList;
            } else {
                this.ruleListContainer.add(type, selection);
            }

            this.hasStyles = true;
        }
    },

    _ruleList : {
        value: []
    },
    ruleList : {
        get: function() {
            return this._ruleList;
        },
        set: function(list) {
            if(!list) {
                this._ruleList.length = 0;
                return;
            }

            this._ruleList = list;
            this.needsDraw = true;
        }
    },
    prepareForDraw : {
        value: function() {
            console.log("styles view container - prepare for draw");
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