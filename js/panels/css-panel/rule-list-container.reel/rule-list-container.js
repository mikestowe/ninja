/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
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
