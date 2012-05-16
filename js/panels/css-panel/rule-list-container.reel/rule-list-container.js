/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.RuleListContainer = Montage.create(Component, {
    _instanceToAdd     : { value: null },
    _appendElement     : { value: null },
    _lastDisplayedList : { value: null },
    ruleListDrawn      : { value: null },

    _displayedList     : { value: null },
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

    displayListForSelection : {
        value: function(selection) {
            var list = this._getListForSelection(selection);

            if(!list) {
                list = this.add(selection);
            }

            this.displayedList = list;
        }
    },

    //// Get the element containing list based on selection
    _getListForSelection : {
        value: function(selection) {
            var i, list, matchesAll;

            for(i = 0; i<this.ruleLists.length; i++) {
                list = this.ruleLists[i];

                if(selection.length > 1) {
                    matchesAll = list.selection.every(function(element, index, array) {
                        return array.indexOf(element) !== 0;
                    });

                    if(matchesAll) {
                        break;
                    }
                } else {
                    ///// Selection (single element or stylesheet) is the same,
                    ///// Use the existing rule list
                    if(list.selection[0] === selection[0]) {
                        break;
                    }
                }

                list = null;
            }

            return list;

        }
    },

    //// Creates a new rule list to be added to the container
    add : {
        value: function(selection) {
            var stylesController = this.application.ninja.stylesController,
                instance = Montage.create(this.ruleListComponent),
                container = document.createElement('div'),
                rules, ruleListLog;

            rules = this.getRulesForSelection(selection);

            this._instanceToAdd = instance;
            instance.rules = rules;

            ruleListLog = {
                selection: selection,
                component : instance
            };

            this.ruleLists.push(ruleListLog);
            this._appendElement = container;
            this.needsDraw = true;

            return ruleListLog;
        }
    },

    getRulesForSelection : {
        value: function(selection) {
            var rules;

            if(selection.length > 1) {
                rules = this.stylesController.getCommonRules(selection);
            } else if(selection.length === 1) {
                rules = this.stylesController.getMatchingRules(selection[0]);

                ///// Add inline style to rule list
                rules.splice(0, 0, {
                    type             : 'inline',
                    selectorText     : 'element.style',
                    parentStyleSheet : 'Inline Style',
                    style            : selection[0].style
                });

            }

            return rules;
        }
    },

    update : {
        value: function() {
            this.displayedList.component.rules = this.getRulesForSelection(this.displayedList.selection);
        }
    },

    //// Array of lists that have been added to the container
    //// Lists include selection type (element/stylesheet), and
    //// the selection itself
    ruleLists : {
        value: [],
        distinct: true
    },

    templateDidLoad : {
        value: function() {
            if(this.focusDelegate) {
                this.ruleListComponent.focusDelegate = this.focusDelegate;
            }
            this.stylesController = this.application.ninja.stylesController;
        }
    },

    draw : {
        value: function() {
            if(this._appendElement) {
                this.element.appendChild(this._appendElement);
                this._instanceToAdd.element = this._appendElement;
                this._appendElement = null;
                this.needsDraw = true;
                return;
            }

            if(this._lastDisplayedList) {
                this._lastDisplayedList.component.element.style.display = 'none';
                if(this._displayedList.component.element) {
                    this._displayedList.component.element.style.display = null;
                }
            }
        }
        
    },
    
    didDraw: {
        value: function() {
            if(this.ruleListDrawn === true) {
                var stylesView = this.parentComponent.parentComponent;
                stylesView.needsDraw = stylesView.hasStyles = true;
            }

        }
    }
});