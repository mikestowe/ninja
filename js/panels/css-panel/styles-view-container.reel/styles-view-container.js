/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.StylesViewContainer = Montage.create(Component, {
    noStylesCondition : {
        value: true
    },
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
            } else if(elements.length >= 1) {
                type = 'ELEMENTS';
                selection = elements;
            } else {
                type = 'ELEMENTS';
                selection = elements[0]
            }

            ruleList = this._getRuleList({
                selectionType : type,
                selection : selection
            });

            if(ruleList) {
                this.displayedList = ruleList;
            }
        }
    },
    _lastDisplayedList : {
        value: null
    },
    _displayedList : {
        value: null
    },
    displayedList : {
        get: function() {
            return this._displayedList;
        },
        set: function(list) {
            this._hasStyles = true;
            this._lastDisplayedList = this._displayedList;
            this._displayedList = list;
            this.needsDraw = true;
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
            debugger;
            console.log("styles view container - prepare for draw");
        }
    },
    draw : {
        value: function() {
            console.log("styles view container - draw");
console.log("has style = " + this._hasStyles);
            if(this.hasStyles) {
                this.element.classList.remove('no-styles');
            } else {
                this.element.classList.add('no-styles');
            }

            if(this._lastDisplayedList) {
                //this._lastDisplayedList.style.display = 'none';
            }

            //this._displayedList.style.display = '';
        }
    },
    _getRuleList : {
        value: function(s) {
            var ruleListsOfType, i, list, matchesAll;
            
            ruleListsOfType = this.ruleLists.filter(function(list) {
                return list.selectionType = s.selectionType;
            });

            for(i = 0; i<this.ruleLists.length; i++) {
                list = this.ruleLists[i];
                
                if(s.selectionType === 'elements') {
                    matchesAll = list.selection.every(function(element, index, array) {
                        return array.indexOf(element) !== 0;
                    });

                    if(matchesAll) {
                        break;
                    }
                } else {
                    ///// Selection (single element or stylesheet) is the same,
                    ///// Use the existing rule list
                    if(list.selection === s.selection) {
                        break;
                    }
                }
            }

            return list;

        }
    },
    ruleLists : {
        value: []
    }
});