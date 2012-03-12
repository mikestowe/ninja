/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.RuleListContainer = Montage.create(Component, {
    ruleListComponent : {
        value: null
    },
    templateDidLoad: {
        value: function() {
            console.log('rule list container - tempalte did load');
        }
    },
    _getRuleList : {
        value: function(s) {
            var ruleListsOfType, i, list, matchesAll;

            ruleListsOfType = this.ruleLists.filter(function(list) {
                return list.selectionType = s.selectionType;
            });

            for(i = 0; i<ruleListsOfType.length; i++) {
                list = ruleListsOfType[i];

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
    },
    add : {
        value: function(type, selection) {
            console.log("Rule List Container : add()");

            var stylesController = this.application.ninja.stylesController,
                listInstance = Montage.create(this.ruleListComponent),
                container = document.createElement('div'),
                rules;
//debugger;
            if(type === 'ELEMENT') {
                rules = stylesController.getMatchingRules(selection);
            }

            //listInstance.element = container;
            this._instanceToAdd = listInstance;
            listInstance.rules = rules;

            this.appendElement = container;
        }
    },
    _instanceToAdd : {
        value: null
    },
    _appendElement : {
        value: null
    },
    appendElement : {
        get: function() {
            return this._appendElement;
        },
        set: function(el) {
            this._appendElement = el;
            this.needsDraw = true;
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
            this._lastDisplayedList = this._displayedList;
            this._displayedList = list;
            this.needsDraw = true;
        }
    },
    draw : {
        value: function() {
            if(this._lastDisplayedList) {
                this._lastDisplayedList.style.display = 'none';

                if(this._displayedList.element) {
                    this._displayedList.style.display = null;
                }
            }

            if(this._appendElement) {
                this.element.appendChild(this._appendElement);
                this._instanceToAdd.element = this._appendElement;
                this._appendElement = null;
            }

        }
    }
});