/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.RuleListContainer = Montage.create(Component, {
    focusDelegate: {
        value: null,
        serializable: true
    },

    ruleListComponent: {
        value: null,
        serializable: true
    },

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

            if(list) {
                this.displayedList = list;
                this.update();
            } else {
                list = this.add(selection);
                this.displayedList = list;
            }
        }
    },

    //// Get the element containing list based on selection
    _getListForSelection : {
        value: function(selection) {
            var i, list, matchesAll;

            for(i = 0; i<this.ruleLists.length; i++) {
                list = this.ruleLists[i];

                if(selection.length === list.selection.length) {
                    matchesAll = selection.every(function(element, index, array) {
                        return list.selection.indexOf(element) !== -1;
                    });

                    if(matchesAll) {
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
            instance.rules = rules;

            ruleListLog = {
                selection: selection,
                component : instance
            };

            this.ruleLists.push(ruleListLog);

            this.ruleListsToDraw.push({
                element : container,
                component : instance
            });

            this.needsDraw = true;

            return ruleListLog;
        }
    },

    ruleListsToDraw : {
        value: []
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

    willDraw : {
        value: function() {
            //// hide all rule lists
            this.ruleLists.forEach(function(ruleListDescriptor) {
                ruleListDescriptor.component.hide = true;
            });

            if(this.displayedList) {
                this.displayedList.component.hide = false;
            }
        }
    },

    draw : {
        value: function() {
            this.ruleListsToDraw.forEach(function(ruleListDescriptor) {
                this.element.appendChild(ruleListDescriptor.element);
                ruleListDescriptor.component.element = ruleListDescriptor.element;
                ruleListDescriptor.component.needsDraw = true;
            }, this);
            this.ruleListsToDraw.length = 0;
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