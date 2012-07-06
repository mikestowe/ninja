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

var cssPropertyNameList      = require("js/panels/CSSPanel/css-property-name-list").CssPropertyNameList,
    cssCompletionMap         = require("js/panels/CSSPanel/css-value-completion-map").CssValueCompletionMap,
    CSS_SHORTHAND_MAP        = require("js/panels/CSSPanel/css-shorthand-map").CSS_SHORTHAND_MAP,
    keyboardModule           = require("js/mediators/keyboard-mediator").Keyboard,
    nj                       = require("js/lib/NJUtils").NJUtils;



var CSSPanel = exports.CSSPanelBase = (require("montage/core/core").Montage).create(require("montage/ui/component").Component, {
    prepareForDraw: {
        value: function() {
            var self = this;

            this.sections = {
                sheets : {
                    container : nj.$('nj-section-stylesheets'),
                    heading   : nj.$('nj-css-sheets-header'),
                    arrow     : nj.$('nj-css-sheets-arrow'),
                    doc       : null,
                    listEl    : nj.$('nj-sheet-list'),
                    docNameEl : nj.$('nj-current-doc-name'),
                    collapsed : false,
                    toolbar   : nj.$('nj-css-stylesheet-toolbar'),
                    addSheetEl: nj.$('nj-css-add-stylesheet')
                },
                styles : {
                    container : nj.$('nj-section-styles'),
                    heading   : nj.$('nj-css-styles-header'),
                    statusMsg : nj.$('nj-status-heading'),
                    arrow     : nj.$('nj-css-styles-arrow'),
                    listEl    : nj.$('nj-css-rule-list'),
                    elNameEl  : nj.$('nj-current-element-name'),
                    collapsed : false,
                    currentEl : null,
                    toolbar   : nj.$('nj-css-styles-toolbar'),
                    addRuleEl : nj.$('nj-css-add-rule'),
                    showComputedEl : nj.$('nj-css-show-computed'),
                    numItemsEl     : nj.$('nj-num-items')
                }
            };

            ///// Set up collapsible sub sections
            ['sheets', 'styles'].forEach(function(section) {
                var s = section;
                self.sections[s].heading.addEventListener('click', function(e) {
                    self.toggleSectionCollapse(s);
                }, false);
            });

            //// Hook into selection manager

            this.eventManager.addEventListener("selectionChange", this, true);
            this.eventManager.addEventListener("elementChange", this, true);

            this.addEventListener('webkitTransitionEnd', this, false);
            ['sheets', 'styles'].forEach(function(section) {
                this.sections[section].container.style.height = 'auto';
                // //console.log('setting height to auto for section "' + section + '".');
            }.bind(this));

            this._setUpStyleEditMode();
            this._setUpToolbars();
        }
    },

    _currentDocument: {
        value : null,
        enumerable : false
    },

    currentDocument : {
        get : function() {
            return this._currentDocument;
        },
        set : function(value) {
            if (value === this._currentDocument) {
                return;
            }

            this._currentDocument = value;

            if(this._currentDocument.currentView === "design") {
                this.populateStyleSheetList();
            }
        }
    },

    handleWebkitTransitionEnd : {
        value: function(e) {
            //console.log('transition end at panel base');
            e.stopPropagation();
        }
    },

    populateStyleSheetList: {
        value: function() {
            this.sections.sheets.doc = this.application.ninja.currentDocument.model.views.design.document;
            var styleTagCount = 0,
                sect          = this.sections.sheets,
                sheetsArray   = nj.toArray(sect.doc.styleSheets),
                listEl        = sect.listEl,
                contEl        = sect.container,
                userDocName   = nj.getFileNameFromPath(sect.doc.defaultView.location.href),
                self          = this;

            ///// Set current document name in Stylesheets section header
            nj.empty(sect.docNameEl).appendChild(nj.textNode(' - ' + userDocName));

            ///// LOOP through stylesheet list
            ///// -------------------------------------------------------
            sheetsArray.forEach(function(sheet, index) {
                var isStageStyleSheet = (sheet.ownerNode.id === this._stageStyleSheetId),
                    isDefaultStyleSheet = (sheet.ownerNode.id === this._defaultStyleSheetId),
                    sheetObj;

                if(!isStageStyleSheet) {
                    sheetObj = new NJStyleSheet(sheet, index);
                    if(isDefaultStyleSheet) {
                        sheetObj.isProtected = sheetObj.isCurrent = true;
                        this.currentStyleSheet = this.defaultStyleSheet = sheetObj;
                    }

                    //// Add Default stylesheet selection
                    sheetObj.sheetNameEl.addEventListener('click', function(e) {
                        //console.log('clicking sheet');
                        e.preventDefault();
                        //e.stopPropagation();
                        self.currentStyleSheet = sheetObj;
                    }, false);

                    sheetObj.deleteEl.addEventListener('click', function(e) {
                        if(sheetObj.isCurrent) {
                            self.defaultStyleSheet.makeCurrent();
                        }
                    }, false);

                    sheetObj.render(listEl);
                }


            }, this);
            ///// ________________________________________________________

            ///// save height of content, and convert height from "auto" to pixels
            //sect.height = contEl.style.height = nj.height(contEl);



            //contEl.style.webkitTransition = 'all 0.15s ease-out';

        }
    },
    clearStyleSheetList : {
        value: function() {
            nj.empty(this.sections.sheets.listEl);
        }
    },
    _preventAdvanceToNext : { // don't advance if there's an error on stop edit
        value: false
    },
    _setUpStyleEditMode: {
        value: function() {
            var self = this;
            ///// Add onchange event to NJCSSStyle
            NJCSSStyle.prototype.onStyleChange.push(function() {
                self._stageUpdate();
            });

            ///// Add some NJEditable functionality
            NJEditable.prototype.onStartEdit.push(function(e) {
                if(this.isSelector && this.el.nodeContent === 'element.style') {
                    return;
                }
                var njStyle = this.el.parentNode.njcssstyle;
                // //console.log('added start edit');
                this.el.parentNode.classList.add('nj-editing');
                if(this.el.nodeName === "DD") {
                    this.el.parentNode.classList.add('nj-editing-val'); // controls wrapping of text
                    if(cssCompletionMap[njStyle.property]) {
                        this.suggestions = cssCompletionMap[njStyle.property];
                    }
                }
            });
            NJEditable.prototype.onStopEdit.push(function(e) {
                var nextEl      = this.el,
                    isAddButton = false,
                    autoSuggestArray = null,
                    nextEditable, sibling, njStyle, isAddBtn;

                this.el.parentNode.classList.remove('nj-editing');
                this.el.parentNode.classList.remove('nj-editing-val');

                if(this.isSelector) {
                    if(e && [9,13].indexOf(e._event.keyCode) !== -1) {
                        // console.log('selector onStopEdit function');
                        var propertyEl = nj.children(this.el.nextSibling.firstChild, function(item){
                            return item.nodeName === 'DT';
                        })[0];
                        if(propertyEl.parentNode.njcssstyle.activate) {
                            ///// still the Add button
                            propertyEl.parentNode.njcssstyle.activate.bind(propertyEl)();
                            delete propertyEl.parentNode.njcssstyle.activate;
                        } else {
                            nextEditable = propertyEl.njedit || new NJEditable(propertyEl, null, self.CSS_PROPERTY_NAMES);
                            nextEditable.startEditable();
                        }

                    }
                    return false;
                }

                ////console.log('NJEditable onStopEdit callback');

                if(e && [9,13,186].indexOf(e._event.keyCode) !== -1) { // if the user is tabbing between styles
                    e.preventDefault();
                    sibling = (e._event.keyCode === 9 && e._event.shiftKey) ? ['previousSibling', 'lastChild'] : ['nextSibling', 'firstChild'];
                    // //console.log('enter pressed - skip to next editable.');
                    // move to the next editable dt/dd elements
                    do {
                        if(nextEl[sibling[0]]) {
                            nextEl = nextEl[sibling[0]];
                        } else {

                            if(!nextEl.parentNode[sibling[0]]) { // no next style element
                                /// get njcssrule and create add button,
                                /// and activate it if the new styles isn't dirtied
                                // //console.log('reached the end');
                                njStyle = nextEl.parentNode.njcssstyle;
                                if(njStyle.isNewStyle) {
                                    njStyle.container.classList.remove('nj-css-no-error');
                                    if(nextEl.njedit) {
                                        nextEl.njedit.onRevert.length = 0;
                                    }
                                }
                                // //console.log('Prototype onStopEdit - creating Add button');
                                addStyleBtn = njStyle.njRule.createAddButton();
                                // bind the element as 'this', emulating the 'click' event's context
                                addStyleBtn.activate.bind(addStyleBtn.propEl)();
                                nextEl = false;
                                break;
                            } else {
                                nextEl = (nextEl.parentNode[sibling[0]]) ?
                                    nextEl.parentNode[sibling[0]][sibling[1]]:
                                    nextEl.parentNode.parentNode[sibling[1]][sibling[1]];
                            }
                        }
                        njStyle = njStyle || nextEl.parentNode.njcssstyle;
                    }
                    while (!isEditableNode(nextEl));

                    if(nextEl) {
                        if(!self._preventAdvanceToNext) {
                            if (nextEl.nodeName === 'DT') {
                                autoSuggestArray =  self.CSS_PROPERTY_NAMES;
                                if(njStyle.activate) { /// if the next style is the Add button
                                    isAddButton = true;
                                }
                            } else if(nextEl.nodeName === 'DD' && cssCompletionMap[njStyle.property]) {
                                autoSuggestArray = cssCompletionMap[njStyle.property];
                            }
                            nextEditable = nextEl.njedit || new NJEditable(nextEl, null, autoSuggestArray);
                            if(isAddButton) {
                                njStyle.activate.bind(nextEl)();
                            } else {
                                nextEditable.startEditable();
                            }
                        } else{
                            self._preventAdvanceToNext = false;
                        }
                    }
                }

                function isEditableNode(n) {
                    return n && n.nodeType === 1 && (n.nodeName === 'DT' || n.nodeName === 'DD');
                }
            });

            NJEditable.prototype.onChange.push(_onEditableChange);

            ///// Event delegation for editable nodes
            this.sections.styles.container.addEventListener('click', function(e) {
                if(!this.njedit && (this.nodeName === 'DT' || this.nodeName === 'DD') && !self._inComputedStyleMode) {
                    if(this.parentNode.className.indexOf('nj-css-style-add') === -1) {
                        // //console.log('set up editable node!');
                        var edit = new NJEditable(this, null,  self.CSS_PROPERTY_NAMES); // TODO: window.propertyKeywords);
                        edit.startEditable();
                    }
                }
            }, false);

            function _onEditableChange(val, oldVal) {
                if(this.isSelector) {
                    ////console.log('selector val = ' + val);
                    return false;
                }

                var parent   = this.el.parentNode,
                    oldValue = oldVal,
                    edit     = this,
                    style, propName, propVal, isNewStyle, modifyCommand;

                ///// Find NJCSSRule corresponding to this NJEditable element
                ///// (the style container has reference to NJCSSStyle object)
                while (!style) {
                    if(parent.njcssstyle) {
                        style = parent.njcssstyle;
                    } else {
                        parent = parent.parentNode;
                    }
                }

                // //console.log("Found style obj!");
                // //console.log(style);

                isNewStyle = style.isNewStyle;

                //// remove semi-colons
                val = val.trim().replace(';','');
                this.val(val);

                ///// set up command for undo/redo
                modifyCommand = Object.create(Object.prototype, {
                    description: { value: "Style Change" },
                    //receiver: { value: receiver },
                    execute: {
                        value: function() {
                            //console.log('updating to property name to ' + val);
                            style.updateProperty(val);
                            return this;
                        }
                    },
                    unexecute: {
                        value: function() {
                            //console.log('Undo property name change back to ' + oldVal);
                            if(isNewStyle) {
                                style.remove(false, true);
                            }
                            style.updateProperty(oldVal);
                        }
                    }
                });

                ///// is this an edit to the prop or val?
                if(this.el.nodeName === 'DT') {
                    //// property name was edited
                    if(val) {
                        modifyCommand.execute();
                        NJevent("sendToUndo", modifyCommand);
                    } else {
                        ///// let the remove method take care of Undo/Redo
                        style.updateProperty(val);
                    }

                } else if (this.el.nodeName === 'DD') {
                    //// property value was edited
                    if(!style.updateValue(val, isNewStyle)) {
                        if(isNewStyle) {
                            //console.log('is new style : true');
                            style.container.classList.remove('nj-css-no-error');
                            this.onRevert.length = 0;
                            style.isNewStyle = false;
                        } else {
                            self._preventAdvanceToNext = true;
                            parent.addEventListener('webkitAnimationEnd', function njShake(e) {
                                this.classList.remove('nj-css-shake');
                                ///// and revert value back to original value
                                edit.revert(null, true);
                                edit.startEditable();
                                this.removeEventListener('webkitAnimationEnd', njShake, false);
                            }, false);
                            parent.classList.add('nj-css-shake');
                        }
                    }

                }
            }
        }
    },
    _stageStyleSheetId : {
        value: 'nj-stage-stylesheet',
        enumerable: false
    },
    _defaultStyleSheetId : {
        value: 'nj-default-stylesheet',
        enumerable: false
    },
    _defaultStyleSheet : {
        value: null,
        enumerable: false
    },
    _userContentContainerId : {
        value: '#UserContent',
        enumarable: false
    },
    _styleTagCount : {
        value: 0
    },
    _setUpToolbars : {
        value: function() {
            var self = this,
                command;

            this.sections.sheets.addSheetEl.addEventListener('click', function(e) {
                var doc = self.sections.sheets.doc,
                    handleRemoval,
                    njSheet;

                handleRemoval = function(njSheet) {
                    if(njSheet.isCurrent) {
                        self.currentStyleSheet = self.defaultStyleSheet;
                    }
                    if(self._currentRuleList) {
                        self._currentRuleList.update();
                    }
                };

                var rec = {
                    addSheet : function() {
                        ////console.log('Add Sheet');
                        njSheet = self.createStyleSheet(new String(++self._styleTagCount));
                        self.scrollTo('bottom', self.sections.sheets.container);
                        //// Add Default stylesheet selection
                        njSheet.sheetNameEl.addEventListener('click', function(e) {
                            //console.log('clicking sheet');
                            e.preventDefault();
                            //e.stopPropagation();
                            self.currentStyleSheet = njSheet;
                        }, false);

                        njSheet.deleteEl.addEventListener('click', function(e) {
                            handleRemoval(njSheet);
                        }, false);

                        self.currentStyleSheet = njSheet;
                    },
                    removeSheet : function() {
                        ////console.log('Remove Sheet');
                        handleRemoval(njSheet);
                        njSheet.remove();
                    }
                };

                command = Object.create(Object.prototype, {
                    description: { value: "Add Stylehsset" },
                    receiver: { value: rec },
                    execute: {
                        value: function() {
                            this.receiver.addSheet();
                            ////console.log('execute');
                            return this;
                        }
                    },
                    unexecute: {
                        value: function() {
                            ////console.log('unexecute');
                            this.receiver.removeSheet();
                        }
                    }
                });
                command.execute();
                NJevent("sendToUndo", command);

            });

            this.sections.styles.addRuleEl.addEventListener('click', function(e) {
                var selectorText, addRuleCommand, newNJRule;

                e.preventDefault();

                selectorText = (self._inMultiSelectMode) ? self._userContentContainerId + ' .newClass' : null;

                addRuleCommand = Object.create(Object.prototype, {
                    description: { value: "Add Rule" },
                    //receiver: { value: rec },
                    execute: {
                        value: function() {
                            newNJRule = self._currentRuleList.initNewRule(self._currentStyleSheet, selectorText);
                            ////console.log('execute');
                            return this;
                        }
                    },
                    unexecute: {
                        value: function() {
                            ////console.log('unexecute');
                            var list = self._currentRuleList,
                                elements = (list.el.length) ? list.el : [list.el];

                            newNJRule.delete();

                            if(list.addedClassName) {
                                elements.forEach(function(el) {
                                    el.classList.remove(list.addedClassName);
                                });
                            }
                        }
                    }
                });

                if(!self._currentStyleSheet) {
                    self.currentStyleSheet = self.createStyleSheet('Temp');
                }

                self._currentStyleSheet.dirty();

                //self._currentRuleList.initNewRule(self._currentStyleSheet, selectorText);
                addRuleCommand.execute();
                NJevent("sendToUndo", addRuleCommand);
            }, false);

            this.sections.styles.showComputedEl.addEventListener('click', function(e) {
                var computedStyleList;
                e.preventDefault();
                self.inComputedStyleMode = !self.inComputedStyleMode;
            });
        }
    },
    captureSelectionChange: {
        value: function(event) {
            //console.log('capture selection change');
            var items = this.application.ninja.selectedElements,
                itemIndex = -1,
                currentEl, currentRuleList, nextEl, nextRuleList, commonRules;

            if(items.length > 1) {
                this.clearCSSRules();
                this._inMultiSelectMode = true;
                this.inComputedStyleMode = false; // No computed styles mode for multiple items

                ///// if multiple items are selected, then show common rules
                var elements = Array.prototype.slice.call(this.application.ninja.selectedElements, 0);

                ///// show toolbar, but hide computed style button
                this.sections.styles.toolbar.style.display = '';
                this.sections.styles.showComputedEl.classList.add('nj-css-panel-hide');// .style.display = 'none';
                this._currentRuleList = new NJCSSRuleList(elements, this);
                this.sections.styles.statusMsg.classList.remove('nj-css-panel-hide');
                nj.empty(this.sections.styles.numItemsEl).appendChild(nj.textNode(items.length));
                this._currentRuleList.render(this.sections.styles.container);

            } else if(items.length === 1) {
                //console.log('Selection change: One element selected');
                this._inMultiSelectMode = false;
                this.sections.styles.statusMsg.classList.add('nj-css-panel-hide');
                this.sections.styles.showComputedEl.classList.remove('nj-css-panel-hide');// .style.display = '';
                this.sections.styles.toolbar.style.display = '';
                this.showStylesForElement(items[0], null);
            } else {
                this.sections.styles.statusMsg.classList.add('nj-css-panel-hide');
                this._inMultiSelectMode = false;
                this.sections.styles.toolbar.style.display = 'none';
                ///// If no elements are selected, clear styles
                this.computedStyleSubPanel.hide();
                this.clearCSSRules();
            }

        }
    },
    captureElementChange:{
        value:function(event){
            if(this._ignoreElementChangeEventOnce) {
                ///// TODO: Change this by having the event object have a custom flag
                ///// for identifying events originating from this panel
                this._ignoreElementChangeEventOnce = false;
                return false;
            }
            //console.log('capture element change');
            var items = this.application.ninja.selectedElements;
            if(items.length === 0 && event._event.eventType === 'style') {
                //// stage style has changed
                if(event._event.item.ownerDocument.styleSheets[0].njStyleSheet) {
                    event._event.item.ownerDocument.styleSheets[0].njStyleSheet.dirty();
                } else {
                    // TODO: Need a way of identifying the changing CSS rule (Stylesheet Manager)
                    ////console.log('could not find njStyleSheet');
                }
            } else if(event._event.eventType === 'style' && items.length === 1) {
                this.showStylesForElement(this.sections.styles.currentEl, event._event.data);
            }
        }
    },
    _ignoreElementChangeEventOnce : {
        value: false,
        enumerable: false
    },
    _currentRuleList : {
        value : null,
        enumerable: false
    },
    _currentComputedStyleList : {
        value : null,
        enumerable: false
    },
    _currentStyleSheet : {
        value: null,
        enumerable: false
    },
    currentStyleSheet : {
        get: function() {
            return this._currentStyleSheet;
        },
        set: function(njStyleSheet) {
            if(this._currentStyleSheet) {
                this._currentStyleSheet.unMakeCurrent();
            }
            njStyleSheet.makeCurrent();
            this._currentStyleSheet = njStyleSheet;
        }
    },
    setDefaultSheet : {
        value: function(njSheet) {
            this._currentStyleSheet = njSheet;
        }
    },
    _inMultiSelectMode : {
        value: false,
        enumerable: false
    },
    _inComputedStyleMode : {
        value: false,
        enumerable: false
    },
    inComputedStyleMode : {
        get : function() {
            return this._inComputedStyleMode;
        },
        set : function(turnOn) {
            var btnOnClass = 'nj-css-computed-on',
                hideClass  = 'nj-css-panel-hide';

            if(turnOn) {
                ///// Turn ON computed style mode
                //console.log('Turning ON computed style mode');
                this.computedStyleSubPanel.declaration = this._currentRuleList.computed;
                this.computedStyleSubPanel.show();
                this.sections.styles.container.classList.add(hideClass);
                this.sections.styles.addRuleEl.classList.add(hideClass);
                this.sections.styles.showComputedEl.parentNode.classList.add(btnOnClass);
            } else {
                ///// Turn OFF computed style mode
                //console.log('Turning OFF computed style mode');
                this.computedStyleSubPanel.hide();
                this.sections.styles.container.classList.remove(hideClass);
                this.sections.styles.addRuleEl.classList.remove(hideClass);
                this.sections.styles.showComputedEl.parentNode.classList.remove(btnOnClass);
            }

            this._inComputedStyleMode = turnOn;
        }
    },
    createStyleSheet : {
        value : function(title) {
            var listEl = this.sections.sheets.listEl,
                sheet, njSheet;

            title = title || '';

            sheet = nj.make('style', {
                type : 'text/css',
                id   : title,
                media : 'screen',
                title : 'Temp'
            });

            this.sections.sheets.doc.head.appendChild(this.sections.sheets.doc.createComment('User-added stylesheet number ' + title));
            this.sections.sheets.doc.head.appendChild(sheet);

            njSheet = new NJStyleSheet(sheet.sheet, title); // TODO: Fix index
            njSheet.render(listEl);

            return njSheet;
        }
    },
    showStylesForElement : {
        value: function(el, updateList, preventUpdate) {
            var sect      = this.sections.styles,
                contEl    = sect.container,
                elNameEl  = sect.elNameEl,
                identifier, njRuleList, computedHeight;

            ///// Save current DOM element to section object
            ///// so that it is retrievable by elementChange
            sect.currentEl = el;

            ///// Show element name in panel header
            identifier = el.nodeName.toLowerCase();
            if(el.id) {
                // use append id if avail
                identifier += '#'+el.id;
            } else if (el.className) {
                // or, use combined class
//                identifier += '.' + el.className.trim().replace(' ', '.');
            }

            this.clearCSSRules(); ///// Clear css styles subsection

            ///// set new element name in header
            //nj.empty(elNameEl);
            elNameEl.appendChild(nj.textNode(' - ' + identifier));

            if(el.njcssrulelist) {
                ///// use the existing NJCSSRuleList object
//                // //console.log('user existing njcssrulelist object');
                this._currentRuleList = njRuleList = el.njcssrulelist;
                if(!preventUpdate) {
                    njRuleList.update(updateList);
                }
                njRuleList.show();
            } else {
                ///// Create list of css rules from selected element
                this._currentRuleList = njRuleList = new NJCSSRuleList(el, this);
                // Render rule list (pass in container)
                njRuleList.render(contEl);
            }

            if(this._inComputedStyleMode) {
                ////console.log('in computed style mode');
                this.computedStyleSubPanel.declaration = el;
                this.computedStyleSubPanel.show();
                return;
            } else {
                this.computedStyleSubPanel.hide();
            }


            ///// set height to "" (empty) to capture computed height and remove transition
            contEl.style.webkitTransition = '';
            contEl.style.height = '';
            computedHeight = nj.height(contEl);

            //// re-apply transition
            sect.height = contEl.style.height = 'auto';
            //contEl.style.webkitTransition = 'all 0.15s ease-out';
        }
    },
    clearCSSRules : {
        value: function(callback) {

            if(this._currentRuleList) {
                this._currentRuleList.hide();
            }
            nj.empty(this.sections.styles.elNameEl);

        }
    },
    _stageUpdate : {
        value: function() {
            this._ignoreElementChangeEventOnce = true;
            //documentControllerModule.DocumentController.DispatchElementChangedEvent(this.application.ninja.selectedElements);
            // TODO: might need to remove this
        }
    },
    toggleSectionCollapse : {
        value: function(section) {
            var isClosed = this.sections[section].collapsed,
                action = (isClosed) ? 'expandSection' : 'collapseSection';

            this[action](section).collapsed = !isClosed;
        }
    },
    collapseSection : { // returns section object literal
        value: function(sect) {
            var section  = this.sections[sect],
                contEl   = section.container,
                arrow    = section.arrow,
                cssClass = 'closed';

            if(sect === 'styles' && this._inComputedStyleMode) {
                contEl = this.computedStyleSubPanel.element;
            }

            contEl.addEventListener('webkitTransitionEnd', function njCollapse(e) {
                e.stopPropagation();
                e.preventDefault();
                this.style.webkitTransition = '';
                this.removeEventListener('webkitTransitionEnd', njCollapse, false);
            }, false);
            section.height = nj.height(contEl);
            contEl.style.webkitTransition = 'height 0.15s ease-out';
            arrow.className  = (arrow.className + ' ' + cssClass).trim();
            contEl.className = (contEl.className + ' ' + cssClass).trim(); // controls non-height transitions
            contEl.style.height = '0px';

            section.toolbar.classList.add('nj-css-panel-hide');

            return section;
        }
    },
    expandSection : { // returns sections object literal
        value: function(sect) {
            var section = this.sections[sect],
                contEl = section.container,
                arrow    = section.arrow,
                cssClass = 'closed';

            contEl.style.webkitTransition = 'height 0.15s ease-out';
            arrow.className  = arrow.className.replace(cssClass, '').trim();
            contEl.className = contEl.className.replace(cssClass, '').trim(); // controls non-height transitions
            //console.log('section height: ' + section.height);
            contEl.style.height = section.height;

            contEl.addEventListener('webkitTransitionEnd', function njExpando(e) {
                e.stopPropagation();
                e.preventDefault();
                this.style.webkitTransition = '';
                this.style.height = 'auto';
                this.removeEventListener('webkitTransitionEnd', njExpando, false);
            }, false);

            section.toolbar.classList.remove('nj-css-panel-hide');

            return section;
        }
    },
    computedStyleSubPanel : {
        value: null
    },
    scrollTo : {
        value: function(x, container) {
            //// Control scroll position of the CSS Panel itself
            //// or the option container
            var panelEl = container || document.getElementById('cssPanelContent');
            if(x === 'bottom') {
                x = panelEl.scrollHeight;
            } else if(x === 'top') {
                x = '0';
            }
            panelEl.scrollTop = x;
        }
    },
    getAllRelatedRules : {
        value: function(element) {
            var rules = [],
                win = element.ownerDocument.defaultView,
                self = this;

            rules = rules.concat(nj.toArray(win.getMatchedCSSRules(element)).filter(function(rule) {
                var sheetId = (rule.parentStyleSheet) ? rule.parentStyleSheet.ownerNode.id : null;
                return sheetId !== self._stageStyleSheetId;
            }));

            return rules;
        }
    },
    CSS_PROPERTY_NAMES : {
        value: cssPropertyNameList,
        enumerable: true
    }
});


/* --------------------------------------------------------
 * NJCSSRuleList - Object for managing list of NJCSSRules
 * Renders rules to the document
 * If an array of elements is passed, the NJCSSRuleList
 * will find the common rules and render them
 * --------------------------------------------------------*/

function NJCSSRuleList(el, cssPanel) {
    this.el = el;
    this.njRules = [];
    this.cssPanel = cssPanel;
    this.container = nj.make('ul', 'nj-css-rule-list');
    this.computed = null;
    this.commonRules = null;
    this.inlineStyleRule = null;
    this.addedClassName = null;

    var self = this,
        styleAttrRule;

    if(el instanceof Array) {
        this.rules = this.getCommonRules();
    } else {
        styleAttrRule = el.style;

        el.njcssrulelist = this;
        styleAttrRule.isInlineStyle = true;
        this.computed = el.ownerDocument.defaultView.getComputedStyle(el);

        ///// converts CSSRuleList to array
        this.rules = this.cssPanel.getAllRelatedRules(el);
        this.rules.splice(0, 0, {
            selectorText     : 'element.style',
            parentStyleSheet : 'Inline Style',
            style            : styleAttrRule
        });

    }

}

NJCSSRuleList.prototype.getCommonRules = function() {
    var itemIndex = -1,
        currentEl, currentRuleList, nextEl, nextRuleList, commonRules;

    do {
        ///// Get current element's matched rules
        currentEl = this.el[++itemIndex];
        currentRuleList = this.cssPanel.getAllRelatedRules(currentEl);
        //currentRuleList = nj.toArray(currentEl.ownerDocument.defaultView.getMatchedCSSRules(currentEl));

        ///// Get next element's matched rules
        nextEl = this.el[itemIndex+1];
        nextRuleList = this.cssPanel.getAllRelatedRules(nextEl);

        ///// use filter to see if any rules exist in the next set of rules
        commonRules = currentRuleList.filter(function(rule) {
            return nextRuleList.indexOf(rule) !== -1;
        });

    } while (itemIndex+2 < this.el.length && commonRules.length > 0);

    //console.log('Selection change: ' + commonRules.length + ' common rule(s)');
    this.commonRules = commonRules;
    return commonRules;
};

NJCSSRuleList.prototype.update = function(updateList) {
    var deleteRules = [], matchedRules;
    ////console.log('NJCSSRuleList::update');
    if(this.el.length > 1) {
        matchedRules = this.getCommonRules();
    } else {
        matchedRules = this.cssPanel.getAllRelatedRules(this.el)
    }

    this.inlineStyleRule.update(updateList);

    ///// Update NEW and CHANGED rules
    matchedRules.forEach(function(rule, index) {
        var njRule = rule.njcssrule;
        ///// if matched rule is already in list, check to see if it has changed
        if (njRule && this.rules.indexOf(rule) !== -1) {
            ////console.log('NJCSSRuleList::update - found njRule for "' + rule.cssText + '"' );
            njRule.update(updateList);
        } else {
            ////console.log('NJCSSRuleList::update - no njRule found. creating one for "' + rule.cssText + '"');
            njRule = new NJCSSRule(rule, this);
            this.rules.push(rule);
            this.njRules.push(njRule);
            this.container.appendChild(njRule.container);
        }
    }, this);
    ///// For each rule in rulelist, check to see if it exists in matched rules
    ///// if not found, not inline, and not an "unapplied" style, remove it
    this.njRules.forEach(function(rule) {
        if(matchedRules.indexOf(rule.rule) === -1 && !rule.shownAsUnapplied && !rule.rule.style.isInlineStyle) {
            ////console.log("Found rule to delete");
            deleteRules.push(rule);
        }
    }, this);
    deleteRules.forEach(function(rule) {
        rule.delete(true);
    });
};

NJCSSRuleList.prototype.initNewRule = function(njStyleSheet, selectorName) {
    var selectorText = (this.cssPanel._inMultiSelectMode) ? '' : this.el.nodeName.toLowerCase(),
        sheet        = this.cssPanel._currentStyleSheet.sheet,
        index        = sheet.rules.length,
        self         = this,
        rule, njRule, selector, height, padTop, padBot, intervalId, stopKeys;

    //// Derive default selector
    if(selectorName) {
        selectorText = selectorName;
    } else if(this.el.id) {
        selectorText += '#' + this.el.id;
    } else if(this.el.classList.length > 0) {
        selectorText += '.' + this.el.classList[0];
    }

    //// Insert new rule, and create NJCSSRule by passing reference to rule
    sheet.insertRule(selectorText + ' { }', index);
    rule = sheet.rules.item(index);
    njRule = new NJCSSRule(rule, this);
    this.rules.push(rule);
    this.njRules.push(njRule);
    ////console.log('Init rule : pushed rule to rule list:');
    ////console.log(rule);

    njRule.container.classList.add('nj-get-height');
    this.container.appendChild(njRule.container);

    // Slide-in new rule from bottom of viewport
    ///// Calculate height;
    height = nj.height(njRule.container);
    padTop = njRule.container.ownerDocument.defaultView.getComputedStyle(njRule.container).getProperty('paddingTop');
    padBot = njRule.container.ownerDocument.defaultView.getComputedStyle(njRule.container).getProperty('paddingBottom');
    njRule.container.style.paddingTop = '0';
    njRule.container.style.paddingBottom = '0';

    ///// Set height to zero, make visible, and apply transition

    njRule.container.classList.add('nj-pre-slide');
    njRule.container.classList.remove('nj-get-height');

    njRule.container.addEventListener('webkitTransitionEnd', function scroller() {
        //console.log('scroller end');
        clearInterval(intervalId);
        njRule.container.style.height = '';
        //njRule.container.style.webkitTransition = '';
        njRule.container.classList.remove('nj-pre-slide');
        self.cssPanel.scrollTo('bottom', self.container.parentNode);
        this.removeEventListener('webkitTransitionEnd', scroller, false);
    }, false);

    ///// Apply new height;
    njRule.container.style.height = height;
    njRule.container.style.paddingTop = padTop;
    njRule.container.style.paddingBottom = padBot;
    ///// set interval to pin scroll position to bottom
    intervalId = setInterval(function() {
        this.cssPanel.scrollTo('bottom', self.container.parentNode);
    }.bind(this), 5);

    ///// Make selector editable, and attach selector specific event handling
    selector = njRule.selectorEditable;

    ///// Remove ':' from key actions config
    stopKeys = selector.defaults.keyActions.noHint.stop;
    stopKeys.splice(stopKeys.indexOf(186), 1);

    //console.log('NJCSSRuleList::initNewRule - attaching onStepEdit and onChange events');
    /*selector.onStopEdit = [function(e) {
        // TODO: Fix event management, rather than clobbering prototype
        if(e && [9,13].indexOf(e._event.keyCode) !== -1) {
            // //console.log('selector onStopEdit function');
            var propertyEl = nj.children(this.el.nextSibling.firstChild, function(item){
                return item.nodeName === 'DT';
            })[0];
            if(propertyEl.parentNode.njcssstyle.activate) {
                ///// still the Add button
                propertyEl.parentNode.njcssstyle.activate.bind(propertyEl)();
                delete propertyEl.parentNode.njcssstyle.activate;
            } else {
                propertyEl.njedit.startEditable();
            }

        }
    }];*/
    if(this.cssPanel._inMultiSelectMode) {
        selector.onStopEdit.push(function(e) {
            var val = this.val(),
                results = /.*\.([A-Za-z0-9_-]+):?[a-z]*$/.exec(val); //'#UserContent div.myClass:hover'
            ///// if the selector is a class, apply to the elements
            if(results) {
                //console.log('NJCSSRuleList::initNewRule - selector has a classname - ' + results[1]);
                self.addedClassName = results[1];
                self.el.forEach(function(el) {
                    el.classList.add(results[1]);
                });
                self.cssPanel._stageUpdate();
            }
        });
    }
    selector.onChange = [function(val) {
        if(val === '') {
            njRule.delete();
            return;
        }

        var elArray = [], doesApply;
        //console.log('NJCSSRuleList::initNewRule - on change event');
        njRule.rule.selectorText = val;

        if(self.el.length) {
            elArray = self.el;
        } else {
            elArray.push(self.el);
        }

        doesApply = elArray.every(function(item, index, arr) {
            return njRule.appliesToElement(item);
        });

        if(doesApply) {
            ///// Success - selector change applies to element
            if(njRule.shownAsUnapplied) {
                njRule.showAsApplied();
            }
        } else {
            ///// Failed - unapply style for this rule list
            njRule.showAsUnapplied();
        }
        // //console.log('selector text is now: ' + njRule.rule.selectorText);
    }];
    selector.startEditable();

    return njRule;
};

NJCSSRuleList.prototype.getChangedRules = function() {
    return this.njRules.filter(function(rule) {
        return rule.hasChanged();
    });
};

NJCSSRuleList.prototype.render = function(parent) {
    if(this.njRules.length) {
        // //console.log('NJCSSRuleList has rules already');
    } else {
        this.rules.forEach(function(rule) {
            var njcssrule = new NJCSSRule(rule, this);
            this.njRules.push(njcssrule);

            if(rule.style.isInlineStyle) {
                this.inlineStyleRule = njcssrule;
            }

            this.container.appendChild(njcssrule.container);
        }, this);

        //// append list to parent container
        parent.appendChild(this.container);
    }
};

NJCSSRuleList.prototype.hide = function() {
    this.container.style.display = 'none';
};

NJCSSRuleList.prototype.show = function() {
    this.container.style.display = '';
};

/* --------------------------------------------------------
 * NJCSSRule - Object for to represent CSSRule in CSSPanel
 * Responsible for rendering html in the following format:
<li>
    <a class="nj-sheet-link" href="#">myCSS.css</a>
    <span class="nj-css-selector">#mySelector</span>
    <dl>
        <div><input type="checkbox"><dt>background-color</dt><dd>black</dd></div>
        <div><input type="checkbox"><dt>color</dt><dd>white</dd></div>
    </dl>
    <button type="button">Add style</button>
</li>
 * --------------------------------------------------------*/

function NJCSSRule(rule, njRuleList) {
    var els  = this.defaults.elements,
        self = this;

    this.rule             = rule;
    this.njRuleList       = njRuleList;
    this.declaration      = rule.style;
    this.styleSheet       = rule.parentStyleSheet;
    this.njStyleSheet     = (rule.parentStyleSheet) ? rule.parentStyleSheet.njStyleSheet : null;
    this.cssText          = rule.cssText;
    this.styles           = {};
    this.unappliedStyles  = [];
    this.shownAsUnapplied = false;
    this.addButton        = null;
    this.selectorEditable = null;

    ///// Create selector, link, and containers
    ['container', 'sheetLink', 'selector', 'listContainer'].forEach(function(el) {
        self[el] = nj.make(els[el].tag, els[el].attr);
    });

    ///// Add reference to CSSRule to container element
    this.container.rule = rule;

    ///// Add reference of self to host CSSRule object
    rule.njcssrule = this;

    ///// Populate selector, sheetLink elements
    this.selector.appendChild(nj.textNode(rule.selectorText));
    if(this.njStyleSheet) {
        this.sheetLink.appendChild(nj.textNode(this.njStyleSheet.name));
    }

    if(!this.declaration.isInlineStyle) {
        ///// Make selector an NJEditable object
        this.selectorEditable = new NJEditable(this.selector);
        this.selectorEditable.isSelector = true;
        this.selectorEditable.onChange = [function(val) {
            if(val === '') {
                self.delete();
                return;
            }

            var elArray = [], doesApply;
            self.rule.selectorText = val;

            if(self.njRuleList.el.length) {
                elArray = self.njRuleList.el;
            } else {
                elArray.push(self.njRuleList.el);
            }

            doesApply = elArray.every(function(item, index, arr) {
                return self.appliesToElement(item);
            });

            if(doesApply) {
                ///// Success - selector change applies to element
                if(self.shownAsUnapplied) {
                    self.showAsApplied();
                }
            } else {
                ///// Failed - unapply style for this rule list
                self.showAsUnapplied();
            }
            // console.log('selector text is now: ' + njRule.rule.selectorText);
        }];
    }
    this.createStyles();

    ///// sort list and render sorted list to page
    Object.keys(this.styles).sort().forEach(function(style) {
        // //console.log('Style property: ' + style);
        self.styles[style].render(self.listContainer);
    });
    ////console.log('NJCSSRule::constructor - creating Add button');
    this.createAddButton();

    ///// Add elements to container
    ['sheetLink', 'selector', 'listContainer'].forEach(function(el) {
        self.container.appendChild(self[el]);
    });
}

NJCSSRule.prototype.createStyles = function() {
    var self = this;

    nj.toArray(this.declaration).forEach(function(prop, index) {
        var style = new NJCSSStyle(self, index);
        self.styles[style.property] = style;
    });
};

NJCSSRule.prototype.createAddButton = function() {
    if(this.addButton) {
        removeAddButtonBehavior(this.addButton);
    }
    var btn = this.addButton = new NJCSSStyle(this),
        self = this,
        propEditable, valuEditable;

    ///// Create "Add" style btn
    btn.defaults.elements.itemWrapper.attr = 'nj-css-add-style nj-css-no-checkbox nj-css-no-error'; // classes to be added to the style container
    //btn.skipValueUpdateOnce = true; // don't show error until the user has tried to input value
    btn.render(this.listContainer);
    delete btn.defaults.elements.itemWrapper.attr;

    btn.propEl.addEventListener('click', addButtonClickHandler, false);
    btn.propEl.addEventListener('focus', addButtonClickHandler, false);

    propEditable = new NJEditable(btn.propEl, null, self.njRuleList.cssPanel.CSS_PROPERTY_NAMES);
    valuEditable = new NJEditable(btn.valEl);

    function removeAddButtonBehavior(btn) {
        //console.log('removing add button behavior');
        var propEdit = btn.propEl.njedit,
            valEdit  = btn.valEl.njedit;

        [propEdit, valEdit].forEach(function(edit) {
            edit.onBlur.length = 0;
            edit.onRevert.length = 0;
        });

        btn.container.classList.remove('nj-css-no-checkbox');
        btn.isNewStyle = false;

        if(!propEdit.isDirty || !valEdit.isDirty) {
            btn.container.classList.add('nj-css-error');
        }

        delete btn.activate;

    }

    function addButtonClickHandler(e) {
        var propEl       = this,
            valuEl       = valuEditable.el,
            container    = propEl.parentNode,
            propOnRevertIndex, valuOnRevertIndex;

        if(e) { // event is undefined if calling this programmatically
            e.stopPropagation();
            e.preventDefault();
        }

        // //console.log('Add btn click event');
        propEl.removeEventListener('click', addButtonClickHandler, false);
        propEl.removeEventListener('focus', addButtonClickHandler, false);

        if(propEditable.onBlur.length === 0) { /// TODO: check for existance of onblur method, instead
            propEditable.onBlur.push(function(e) {
                //console.log('NJCSSRule::createAddButton - onblur for propEditable. this node name : ' + propEditable.el.nodeName);
                ///// if not selecting value element, recreate button
                if(e.target != valuEl) {
                    propEditable.onBlur.length = 0;
                    if(propEditable.isDirty || valuEditable.isDirty) {
                        //console.log('propEditable onblue - creating add button');
                        self.createAddButton();
                        /// remove error indicator hiding class
                        container.classList.remove('nj-css-no-error');
                    } else {
                        ///// render new Add button
                        reCreateAddBtn();
                    }
                }
            });
        }

        // //console.log('CreateAddButton:: adding onblur event to value field w/ namename: ' + valuEditable.el.nodeName);
        if(valuEditable.onBlur.length === 0) { /// TODO: check for existance of onblur method, instead
            valuEditable.onBlur.push(function(e) {
                //console.log('NJCSSRule::createAddButton - onblur for valuEditable. this node name : ' + valuEditable.el.nodeName);
                ///// if not selecting value element, recreate button
                if(e.target != propEl) {
                    valuEditable.onBlur.length = 0;
                    ///// render new Add button
                    if(propEditable.isDirty || valuEditable.isDirty) {
                        //console.log('valEditable onblue - creating add button');
                        self.createAddButton();
                        /// remove error indicator hiding class
                        container.classList.remove('nj-css-no-error');
                        valuEditable.onRevert.length = 0;
                    } else {
                        reCreateAddBtn();
                    }
                }
            });
        }

        propEditable.onRevert.push(reCreateAddBtn);
        valuEditable.onRevert.push(reCreateAddBtn);

        function reCreateAddBtn() {
            ////console.log('recreating button');
            ///// assign "Add" btn css class
            container.classList.add('nj-css-add-style');
            ///// Remove error class (if there)
            container.classList.remove('nj-css-error');
            ///// Re-bind event listener to property el (aka the "Add" btn)
            propEl.addEventListener('click', addButtonClickHandler, false);
            ///// Revert property element's "Add" btn text
            propEditable.val('Add');
        }

        propEditable.startEditable(null, true);
        propEditable.val('');
        // //console.log('adding transition event listener before adding transition class');
        propEl.addEventListener('webkitTransitionEnd', function trans(e) {
            e.stopPropagation();
            ///// remove button/transition classes
            propEl.parentNode.classList.remove('trans');
            propEl.parentNode.classList.remove('nj-css-add-style');

            ///// Add "clean" (not dirty) state to newly transformed editable objects

            propEl.classList.add('nj-css-clean');
            propEditable.val('property');
            propEditable.onDirty.push(function() {
                this.el.classList.remove('nj-css-clean');
            });

            valuEl.classList.add('nj-css-clean');
            valuEditable.onDirty.push(function() {
                this.el.classList.remove('nj-css-clean');
            });

            propEditable.selectAll();
            this.removeEventListener('webkitTransitionEnd', trans, false);
            // //console.log('button transition end');
        }, false);

        setTimeout(function() {
            propEl.parentNode.classList.add('trans');
        }, 10);

    }
    // add non-event-based hook (used for programmatically transforming to new style)
    btn.activate = addButtonClickHandler;
    return btn;
};

///// Update Rules if they have changed
///// Use optional parameter to specify rules to update
///// The styles object should be an array of objects
///// that look like this: { "style":"....", "value":"...." }

NJCSSRule.prototype.update = function(updateList) {
    if(this.hasChanged()) {
        var self = this,
            allStyles = nj.toArray(this.rule.style),
            //iterateList = (updateList) ? updateList : allStyles,
            iterateList = allStyles, /// remove
            removedStyles = [],
            useUpdateList = false,
            shorthand, index;


        /// Only use update list if left and/or top, for now.
        if(updateList) {
            useUpdateList = updateList.every(function(obj) {
                return (obj.style === 'left' || obj.style === 'top');
            }, this);
        }

        if(useUpdateList) {
            iterateList = updateList;
        }

        //// loop through styles in host rule object or provided style array
        iterateList.forEach(function(prop, index) {
            var currentValue, oldValue, newStyle, propName;

            if(updateList && useUpdateList) {
                currentValue = prop.value;
                propName = prop.style;
                ///// index needs to be re-calculated to make sense within rule
                ///// for njcssstyle object creation
                index = allStyles.indexOf(propName);
            } else {
                currentValue = NJCSSStyle.roundUnits(this.rule.style.getPropertyValue(prop));
                propName = prop;
            }

            if(this.styles.hasOwnProperty(propName)) { ///// if the property was already defined
                oldValue = this.styles[propName].value;
                ///// if the value doesn't match saved value, update text
                if(currentValue !== oldValue) {
                    //console.log('Prop: ' + prop + '. val: ' + currentValue + '. oldVal: ' + oldValue);
                    this.styles[propName].setValueText(currentValue);
                    if(this.styles[propName].disabled) {
                        this.styles[propName].enable();
                    }
                }
            } else { // else, create a new style object and render to page
                if(index !== -1) {
                    ////console.log('creating style with index : ' + index);
                    shorthand = this.getShorthandStylePresent(propName);
                    /// Does shorthand property exist in list? If not, render this style property
                    if(!shorthand) {
                        newStyle = new NJCSSStyle(this, index);
                        this.styles[newStyle.property] = newStyle;

                        ///// find index of new style (listed alphabetically)
                        index = Object.keys(this.styles).sort().indexOf(newStyle.property);
                        ///// pass the index to insert style in right spot (uses insertBefore)
                        newStyle.render(this.listContainer, index);
                    } else {
                        shorthand.update();
                    }
                } else {
                    // //console.log('index not foudn');
                }
            }

        }, this);

        if(!updateList) {
            ///// Remove styles that are no longer defined in rule
            Object.keys(self.styles).forEach(function(style) {
                if(allStyles.indexOf(style) === -1 && !self.styles[style].unapplied) { // not found
                    self.styles[style].remove(true);
                }
            });
        }

    }
};

NJCSSRule.prototype.getShorthandStylePresent = function(property) {
    ///// Get list of shorthand properties for this property name
    var shorthands = CSS_SHORTHAND_MAP[property], i, shorthand;

    ///// If the list does not exist, then there is no shorthand for this
    if(!shorthands) {
        return false;
    }

    ///// There may be multiple shorthands, for example:
    ///// (background-position-x has background-position, and background)
    ///// If any match an existing style in our list of styles, return true
    for(i = 0; i<shorthands.length; i++) {
        shorthand = shorthands[i];
        if(this.styles[shorthand]) {
            //console.log('NJCSSRule::isShorthandStylePresent - shorthand found');
            return this.styles[shorthand];
        }
    }

    return false;
};
NJCSSRule.prototype.areAllRulesDisabled = function() {
    var allProperties = Object.keys(this.styles);

    return allProperties.every(function(name) {
        //// check to see if style object is disabled
        return this.styles[name].disabled;
    }, this);
};

NJCSSRule.prototype.delete = function(UICleanUp) {
    if(UICleanUp && this.areAllRulesDisabled()) {
        //// prevent delete if the rule update is trying to delete this
        //// rule because all rules are disabled
        //console.log('Delete prevented - all rules are disabled');
        return false;
    }

    var ruleList = this.njRuleList,
        cssText = this.rule.cssText,
        self = this,
        parent = this.container.parentNode,
        receiver, i, deleteCommand, index;

    //console.log('NJCSSRule::delete');

    for(i = 0; i < this.njRuleList.njRules.length; i++) {
        if(ruleList.njRules[i] === this) { break; }
    }

    index = this.getRuleIndex();

    receiver = {
        doDelete : function() {
            parent.removeChild(self.container);

            if(!UICleanUp) {
                ///// Rule has been removed by other code
                self.njStyleSheet.sheet.deleteRule(index);
            }

            ruleList.njRules.splice(i, 1);
            self.njRuleList.rules.splice(i, 1);
            CSSPanel._stageUpdate();
        },
        undoDelete : function() {
            var recreatedRule;

            ///// Re-insert rule at index
            self.njStyleSheet.sheet.insertRule(this.selectorText + '{' + this.cssText + '}', index);
            recreatedRule = self.njStyleSheet.sheet.rules[index];
            self.rule = recreatedRule;

            ///// Add reference to NJCSSRule object to rule
            recreatedRule.njcssrule = self;

            ruleList.njRules.splice(i, 1, self);
            self.njRuleList.rules.splice(i, 1, recreatedRule);

            nj.empty(self.selector);
            self.selector.appendChild(nj.textNode(this.selectorText));
            parent.appendChild(self.container);
            CSSPanel._stageUpdate();
        },
        selectorText : self.rule.selectorText,
        cssText : self.rule.style.cssText
    };

    deleteCommand = Object.create(Object.prototype, {
        description: { value: "Delete Rule" },
        receiver : { value: receiver },
        execute: {
            value: function() {
                this.receiver.doDelete();
                return this;
            }
        },
        unexecute: {
            value: function() {
                this.receiver.undoDelete();
            }
        }
    });

    if(UICleanUp) {
        receiver.doDelete();
    } else {
        deleteCommand.execute();
        NJevent("sendToUndo", deleteCommand);
    }


};

NJCSSRule.prototype.appliesToElement = function(el) {
    var matchedRules = CSSPanel.getAllRelatedRules(el);
    return matchedRules.indexOf(this.rule) !== -1;
};

NJCSSRule.prototype.hasChanged = function() {
    // //console.log('NJCSSRule::hasChanged? - ' + (this.cssText !== this.rule.cssText).toString());
    //     //console.log('Saved text: ' + this.cssText);
    //     //console.log('Rule text: ' + this.rule.cssText);
    return this.cssText !== this.rule.cssText;
};

/// returns the last index of the matching CSS Rule in the stylesheet rule list
NJCSSRule.prototype.getRuleIndex = function() {
    var rules = this.rule.parentStyleSheet.rules,
        i;

    //// start at the end, so we match the last rule
    for(i = rules.length-1; i >= 0; i--) {
        r = rules[i];
        if(r.selectorText === this.rule.selectorText && r === this.rule) {
            return i;
        }
    }

    return -1;
};

NJCSSRule.prototype.showAsUnapplied = function() {
    this.shownAsUnapplied = true;
    this.selector.title = 'This rule does not apply to selected element(s).';
    this.container.classList.add('nj-css-rule-unapplied');
};

NJCSSRule.prototype.showAsApplied = function() {
    this.shownAsUnapplied = false;
    this.selector.title = '';
    this.container.classList.remove('nj-css-rule-unapplied');
};

NJCSSRule.prototype.hide = function() {
    this.container.style.display = 'none';
};

NJCSSRule.prototype.show = function() {
    this.container.style.display = 'none';
};

NJCSSRule.prototype.defaults = {
    elements: {
        container     : { tag: 'li' },
        selector      : { tag: 'span', attr: 'nj-css-selector' },
        listContainer : { tag: 'dl', attr: 'nj-css-style-list' },
        sheetLink     : { tag: 'a', attr: { href: "#", className: 'nj-sheet-link' } }
    }
};

function NJCSSStyle(njrule, index) {
    this.index        = index;
    this.njRule       = njrule;
    this.property     = null;
    this.value        = null;
    this.browserValue = null;
    this.priority     = null;
    this.units        = null;
    this.listCont     = null;
    this.container    = null;
    this.propEl       = null;
    this.valEl        = null;
    this.toggleEl     = null;
    this.unapplied    = false;
    this.disabled     = false;
    this.isNewStyle   = false;

    if(index >= 0) {
        this.property  = this.njRule.declaration.item(index);
        this.browserValue = this.njRule.declaration.getPropertyValue(this.property)
        this.value     = NJCSSStyle.roundUnits(this.browserValue);
        this.priority  = this.njRule.declaration.getPropertyPriority(this.property);
        this.units     = this.getUnits(this.value);
    } else {
        this.unapplied  = true;
        this.isNewStyle = true;
        this.property   = this.defaults.placeholderText.property;
        this.value      = this.defaults.placeholderText.value;
    }

}

NJCSSStyle.roundUnits = function(cssValue) {
    return cssValue.split(/\s/).map(function(v) {
        var m = /^(\d+[.]\d+)(\w+)/.exec(v);
        if(m) {
            return parseFloat(m[1],10).toFixed(1) + m[2];
        }
        return v;
    }).join(' ');
};

NJCSSStyle.prototype.onStyleChange = [];
NJCSSStyle.prototype.onShowError = [];

NJCSSStyle.prototype.styleChange = function() {
    var self = this;
    this.onStyleChange.forEach(function(f) {
        f.bind(self)();
    });
};

NJCSSStyle.prototype.getUnits = function(val) {
    if(val.split(/\s/).length > 1) {
        return false;
    } else if(/(px|em|pt|in|cm|mm|ex|pc|%)$/.test(val)) {
        return val.replace(/^.*(px|em|pt|in|cm|mm|ex|pc|%).*/, '$1');
    }
    return null;
};

NJCSSStyle.prototype.render = function(cont, index) {
    var els      = this.defaults.elements,
        self     = this,
        priority = '';

    if(this.priority) {
        priority = ' !important';
    }
    this.listCont  = cont;
    this.propEl    = nj.make(els.styleProperty.tag, els.styleProperty.attr);            /// create property el
    this.valEl     = nj.make(els.styleValue.tag, els.styleValue.attr + priority);    /// create value el
    this.toggleEl  = nj.make(els.toggler.tag, els.toggler.attr);
    this.container = nj.make(els.itemWrapper.tag, els.itemWrapper.attr);

    ///// Add text to elements
    this.propEl.appendChild(nj.textNode(this.property));
    this.propEl.title = this.property;
    this.valEl.appendChild(nj.textNode(this.value));
    this.valEl.title = this.value;

    //// disable style if checkbox is clicked
    this.toggleEl.addEventListener('click', function(e) {
        var action     = 'Disable',
            undoAction = 'Enable',
            toggleEl   = this, toggleCommand;

        if(this.checked) {
            action     = 'Enable';
            undoAction = 'Disable';
        }

        toggleCommand = Object.create(Object.prototype, {
            description: { value: action+" Style" },
            execute: {
                value: function() {
                    self[action.toLowerCase()]();
                    return this;
                }
            },
            unexecute: {
                value: function() {
                    self[undoAction.toLowerCase()]();
                }
            }
        });

        toggleCommand.execute();
        NJevent("sendToUndo", toggleCommand);
    }, false);

    ///// Append prop, val to style list
    [this.toggleEl, this.propEl, this.valEl].forEach(function(el) {
        self.container.appendChild(el);
    });

    this.container.njcssstyle = this; // attach reference to object

    ///// if index is specified, insertBefore index
    if(typeof index === 'number') {
        cont.insertBefore(this.container, nj.toArray(cont.childNodes).filter(function(el) {
            return (el.nodeName && el.nodeName === 'DIV');
        })[index]);
    } else {
        cont.appendChild(this.container);
    }

};

NJCSSStyle.prototype.updateValue = function(newValue, bypassUndo) {
    if(!newValue) {
        this.remove();
        this.styleChange();
        return true;
    }

    var IMPORTANT_FLAG = ' !important',
        dec = this.njRule.declaration,
        acceptAsValid = false,
        self = this,
        newUnits,
        browserVal,
        receiver;

    ///// remove whitespace before unit substrings (e.g. "200 px")
    newValue = newValue.replace(/\s*(px|em|pt|in|cm|mm|ex|pc)/, "$1");

    ///// re-append units if omitted
    newUnits = this.getUnits(newValue);
    if(this.units && parseInt(newValue) && newUnits === null) { // if units previously defined and could not derive new units
        newValue += this.units;   // apply previously defined units
    } else if(newValue !== '0') { // ignore if '0'
        this.units = newUnits;    // else, apply derived (or null) units
    }

    ///// Did the user specify style priority?
    if(newValue.indexOf(IMPORTANT_FLAG) !== -1) {
        this.priority = 'important';
        newValue = newValue.replace(IMPORTANT_FLAG, '');
        //console.log('NJCSSStyle::updateValue - important flag found');
    } else {
        this.priority = null;
    }

    ///// Remove property for passive validation (sets it to null)
    dec.removeProperty(this.property);

    ///// Use CSS declaration's setProperty()
    ///// method to apply/test the new value
    dec.setProperty(this.property, newValue, this.priority);

    ///// Check to see if property was successfully set
    ///// by comparing to value after browser validation
    browserVal = dec.getPropertyValue(this.property);

    //console.log('updating "' + this.property + '" to ' + newValue +
    //            '. Browser returns ' + browserVal +
    //            ' with priority : ' + dec.getPropertyPriority(this.property));

    ////// TODO: find new place for this logic
    if(newValue === '0' && browserVal === '0px') {
        browserVal = '0';
    }

    if (this.browserValidationExclusions[this.property]) {
        acceptAsValid = this.browserValidationExclusions[this.property](newValue, dec);
    }

    receiver = {
        update : function(withValue) {
            var newVal = withValue || newValue;
            dec.setProperty(self.property, newVal, self.priority);
            self.value = newVal; //// update values in Style object
            self.njRule.cssText = self.njRule.rule.cssText; //// update NJRule's copy of the css text
            self.njRule.styles[self.property] = self;

            if(self.priority) {
                newVal += IMPORTANT_FLAG;
            }
            self.setValueText(newVal);

            if(self.disabled) {
                self.enable();
            }
            ///// Show modified stylesheet
            if(self.njRule.njStyleSheet) {
                self.njRule.njStyleSheet.dirty();
            }

            if(self.unapplied) {
                self.removeUnappliedStyle();
                self.removeError();
            }
            self.styleChange();

        },
        revertUpdate : function() {
            this.update(this.previousValue);
        },
        previousValue : self.value
    };

    var modifyCommand = Object.create(Object.prototype, {
        description: { value: "Style Change" },
        receiver: { value: receiver },
        execute: {
            value: function() {
                //console.log('execute');
                this.receiver.update();
                return this;
            }
        },
        unexecute: {
            value: function() {
                //console.log('Undo to prev val of ' + this.receiver.previousValue);
                dec.setProperty(self.property, this.receiver.previousValue, self.priority);
                this.receiver.revertUpdate();
            }
        }
    });

    if(browserVal !== null || acceptAsValid) {
        if(bypassUndo) {
            receiver.update();
        } else {
            modifyCommand.execute();
            NJevent("sendToUndo", modifyCommand);
        }

        return true;
    } else {
        ///// re-apply previous style property
        //console.log('Update failed. Re-applying previous value "' + this.value + '"');
        dec.setProperty(this.property, this.value);
        return false;
    }
};

NJCSSStyle.prototype.browserValidationExclusions = {
    'border-radius' : function(val, declaration) {
        return declaration.getPropertyValue('border-bottom-left-radius') !== null;
    }
};

NJCSSStyle.prototype.updateProperty = function(newProperty) {
    if(!newProperty) {
        this.remove();
        this.styleChange();
        return true;
    }

    var dec = this.njRule.declaration, receiver;

    dec.removeProperty(this.property);
    delete this.njRule.styles[this.property];

    this.units = null;
    this.property = newProperty;
    this.propEl.title = newProperty;
    this.setPropertyText(newProperty);

    //// update NJRule's copy of the css text
    this.njRule.cssText = this.njRule.rule.cssText;

    if(this.updateValue(this.value, true)) {
        // //console.log('Updating property and value - worked!');
        this.njRule.styles[this.property] = this;
    } else {
        // //console.log('Updating property and value - did not work!');
        this.addUnappliedStyle();
        this.showError();
    }

    if(!this.container.parentNode) {
        this.reInsertStyleToDocument();
    }

    /// TODO: if the value did change, update props
    //if(this.rule.style.getProp)
};

NJCSSStyle.prototype.update = function() {
    var browserVal = this.njRule.declaration.getPropertyValue(this.property);

    this.njRule.cssText = this.njRule.rule.cssText;
    this.setValueText(browserVal);

};

NJCSSStyle.prototype.setPropertyText = function(text) {
    nj.empty(this.propEl);
    this.property = text;
    this.propEl.title = text;
    this.propEl.appendChild(nj.textNode(text));
};

NJCSSStyle.prototype.setValueText = function(text) {
    nj.empty(this.valEl);
    this.value = text;
    this.valEl.title = text;
    this.valEl.appendChild(nj.textNode(text));
};

NJCSSStyle.prototype.reInsertStyleToDocument = function() {
    /// Find style's index alphabetically
    var index = Object.keys(this.njRule.styles).sort().indexOf(this.property);

    this.setPropertyText(this.property);
    this.setValueText(this.value);

    this.listCont.insertBefore(this.container, nj.toArray(this.listCont.childNodes).filter(function(el) {
        return (el.nodeName && el.nodeName === 'DIV');
    })[index]);
    this.container.classList.remove('nj-css-panel-hide');

};

NJCSSStyle.prototype.addUnappliedStyle = function() {
    this.unapplied = true;
    this.njRule.unappliedStyles.push(this);
};

NJCSSStyle.prototype.removeUnappliedStyle = function() {
    var i = this.njRule.unappliedStyles.indexOf(this);
    this.unapplied = false;
    this.njRule.unappliedStyles.splice(i, 1);
};


NJCSSStyle.prototype.showError = function() {
    var self = this;
    this.onShowError.forEach(function(handler) {
        handler.bind(self)();
    });
    this.container.classList.add(this.defaults.classes.error);
};

NJCSSStyle.prototype.removeError = function() {
    this.container.classList.remove(this.defaults.classes.error);
};

NJCSSStyle.prototype.disable = function() {
    this.disabled = true;
    // //console.log('disabling style');
    this.container.classList.add('nj-css-disabled');
    this.addUnappliedStyle();
    this.njRule.declaration.removeProperty(this.property);

    //// update NJRule's copy of the css text
    this.njRule.cssText = this.njRule.rule.cssText;

    ///// Show modified stylesheet
    if(this.njRule.njStyleSheet) {
        this.njRule.njStyleSheet.dirty();
    }
    this.styleChange();
    this.toggleEl.checked = false;
    this.toggleEl.title = 'Enable';
};

NJCSSStyle.prototype.enable = function() {
    this.disabled = false;
    // //console.log('enabling style');
    this.container.classList.remove('nj-css-disabled');
    this.removeUnappliedStyle();
    this.njRule.declaration.setProperty(this.property, this.value);

    //// update NJRule's copy of the css text
    this.njRule.cssText = this.njRule.rule.cssText;

    ///// Show modified stylesheet
    this.njRule.njStyleSheet.unDirty();
    this.styleChange();
    this.toggleEl.checked = true;
    this.toggleEl.title = 'Disable';
};

NJCSSStyle.prototype.remove = function(preserveInDeclaration, bypassUndo) {
    var self = this,

        receiver = {
            doRemove : function() {
                //console.log('Delete Style');
                delete self.njRule.styles[self.property];
                self.container.classList.add('nj-css-panel-hide');
                setTimeout(function() {
                    self.container.parentNode.removeChild(self.container);
                }.bind(self), 100);
                if(!preserveInDeclaration) {
                    return self.njRule.declaration.removeProperty(self.property);
                }
            },
            undoRemove : function() {
                self.updateValue(self.value, true);
                self.reInsertStyleToDocument();
            }
        },

        removeCommand = Object.create(Object.prototype, {
            description: { value: "Delete Style" },
            receiver : { value: receiver },
            execute: {
                value: function() {
                    this.receiver.doRemove();
                    return this;
                }
            },
            unexecute: {
                value: function() {
                    //console.log('Undo to Delete Style');
                    this.receiver.undoRemove();
                }
            }
        });

    if(bypassUndo) {
        receiver.doRemove();
    } else {
        removeCommand.execute();
        NJevent("sendToUndo", removeCommand);
    }

    return;
};

NJCSSStyle.prototype.defaults = {
    elements: {
        itemWrapper   : { tag: 'div'},
        toggler       : { tag: 'input', attr: { type: 'checkbox', checked: 'checked', title: 'Disable' }},
        styleProperty : { tag: 'dt' },
        styleValue    : { tag: 'dd' }
    },
    classes : {
        error : 'nj-css-error'
    },
    placeholderText : {
        property : 'Add',
        value    : 'value'
    }
};

function checkForUndoRedo(evt) {
    // Check if cmd+z/ctrl+z for Undo (Windows/Mac)
    if((evt.keyCode == keyboardModule.Z) && (evt.ctrlKey || evt.metaKey) && !evt.shiftKey) {
        NJevent("executeUndo");
        return true;
    }
    // Check if ctrl+y for Redo (Windows)
    if((evt.keyCode == keyboardModule.Y) && evt.ctrlKey) {
        NJevent("executeRedo");
        return true;
    }
    // Check if cmd+shift+z for Redo (Mac)
    if((evt.keyCode == keyboardModule.Z) && evt.metaKey && evt.shiftKey) {
        NJevent("executeRedo");
        return true;
    }
    return false;
}

/* --------------------------------------------------------
 * NJEditable - Object for making elements editable
 * and providing AutoSuggest features
 * --------------------------------------------------------*/
function NJEditable(element, text, autoSuggests, suppressDropDown) {
    var self = this;
    this.el = element || document.createElement('div');
    this.focusClass      = 'nj-editable-focus';
    this.isEditable      = false;
    this.isDirty         = false;
    this.suggestions     = autoSuggests;
    this.suggestClass    = 'nj-editable-suggest';
    this.suggestSpan     = null;
    this.matches         = null; /// array of matches for autoSuggest
    this.matchIndex      = 0;
    this.hint            = null;
    this.prevEditValue   = null; /// value set when el becomes editable
    this.onRevert        = [];
    this.onDirty         = [];
    this.onBlur          = [];
    element.njedit       = this;
    this.handleMouseDown = function() {};

    // //console.log('NJEditable - making ' + element.nodeName + ' editable.');

    if(text) { /// create text node from provided text
        this.elTextNode = document.createTextNode(text);
        this.el.appendChild(this.elTextNode);
    } else {   /// or, get the original content of the element
        this.elTextNode = this.getFirstTextNode();
    }

    this.defaults = {
        keyActions : {
            hint : {
                accept : [9,13,186], // accept hint
                stop   : [27,186],   // stop editing
                next   : [40],       // cycle to next hint
                prev   : [38],       // cycle to prev hint
                revert : [27],       // revert value
                backsp : [8]         // backspace hit
            },
            noHint : {
                stop   : [27,9,13,186],
                next   : [40],
                prev   : [38],
                revert : [27],
                backsp : [8]
            }
        }
    };

    var events;
    events = {
        mousedown : function(e) {
            if(self.isEditable && self.hint) {
                self.accept(null, true);
            }
        },
        click   : function(e) {
            // //console.log('NJEditable clicked');
            if(!self.isEditable) {
                self.startEditable();
            }
        },
        /*blur : function(e) {
            // //console.log('blurred');
            self.stopEditable();
        },*/
        keydown : function(e) {
            var k = e.keyCode,
                a = self.defaults.keyActions,
                isCaretAtBeg, isCaretAtEnd, selection, text;

            e.stopPropagation();
            ////console.log('keydown: ' + e.keyCode);

            ///// Handle Undo
            if(checkForUndoRedo(e)) {
                return false;
            }

            if(k === 39) {
                selection = window.getSelection();
                text = selection.baseNode.textContent;
                isCaretAtEnd = (selection.anchorOffset === text.length);
            }

            ///// Required to prevent browser crash
            ///// (not sure why it can't handle the default behavior)
            if(isCaretAtEnd || isCaretAtBeg) {
                e.preventDefault();
            }

            if(self.hint) {
                if(isCaretAtEnd) {
                    ///// Advance the cursor
                    self.hint = text + self.hint.substr(text.length,1);
                    self.accept(null, true);
                    events.input();
                }
                if( a.hint.revert.indexOf(k) !== -1 ) { self.revert(e); }
                if( a.hint.accept.indexOf(k) !== -1 ) { self.accept(e); }
                if( a.hint.stop.indexOf(k) !== -1 )   { self.stopEditable(e); }
                if( a.hint.next.indexOf(k) !== -1 )   { self.suggestNext(e); }
                if( a.hint.prev.indexOf(k) !== -1 )   { self.suggestPrev(e); }
                if( a.hint.backsp.indexOf(k) !== -1 )   { self.backspace(e); }
            } else {
                if(a.noHint.revert.indexOf(k) !== -1) { self.revert(e); }
                if(a.noHint.stop.indexOf(k) !== -1)   { self.stopEditable(e); }
                //if( a.hint.next.indexOf(k) !== -1 )   { self.handleDown(e); }
                //if( a.hint.prev.indexOf(k) !== -1 )   { self.handleUp(e); }
                if( a.hint.backsp.indexOf(k) !== -1 )   { self.backspace(e); }
            }

        },
        input : function(e) {
            ////console.log('oninput event. val = ' + self.val());
            var val = self.val(),
                 matches;

             if(!self.isDirty) {
                 self.isDirty = true;
                 self.onDirty.forEach(function(handler) {
                     handler.bind(this)();
                 }.bind(self));
             }

            //// Handle auto-suggest if configured
            if(self.suggestions instanceof Array) {

                if(val.length > 0) { // content is not empty

                    self.matches = matches = self.suggestions.filter(function(item) {
                        return item.indexOf(val) === 0;
                    }).sort();

                    if(matches.length) { // match(es) found
                        // //console.log('Match(es) found. Length: ' + matches.length);
                        self.hint = matches[0];
                        if(self.hint !== val) {
                            // Suggest the matched hint, subtracting the typed-in string
                            // Only if the hint is not was the user has typed already
                            self.suggest(self.hint);
                        } else {
                            self.clearSuggest();
                        }
                    } else { // no matches found
                        // //console.log('No matches');
                        self.hint = null;
                        self.clearSuggest();
                    }

                } else { // no suggestion for empty string
                    //console.log('Empty string');
                    //e.preventDefault();
                    self.hint = null;
                    self.clearSuggest();
                }

            }
        },
        paste : function(e) {
            //// prevent default action (i.e., prevent extraneous markup from being pasted)
            //// sanitize the content, then paste via execCommand('insertHTML')
            e.preventDefault();
            document.execCommand('insertHTML', null, e._event.clipboardData.getData("Text"));
        }

    };

    for(var event in events) {
        if(events.hasOwnProperty(event)) {
            self.el.addEventListener(event, events[event], false);
        }
    }
};

NJEditable.prototype.simBlur = function simBlur(event) {
    var doc = this.el.ownerDocument,
        el  = event.target,
        didFindElement = false;

    while(!didFindElement && el !== document) {
        didFindElement = (el === this.el);
        el = el.parentNode;
    }

    if(!didFindElement) {
        //console.log('NJEditable :: Simulated blur');

        if(this.hint) {
            this.accept();
        }

        this.onBlur.forEach(function(handler) {
            handler.bind(this)(event);
        }.bind(this));

        this.stopEditable();
    }
};

NJEditable.prototype.onChange    = [];
NJEditable.prototype.onStartEdit = [];
NJEditable.prototype.onStopEdit  = [];

//(function() {
    NJEditable.prototype.startEditable = function(e, preventSelectAll) {
        if(this.isEditable) {
            //console.log('NJEditable::startEditable - Already Editable. Returning false.');
            return false;
        }

        var self = this;

        this.el.contentEditable = this.isEditable = true;
        // //console.log('in startEditable()');
        ///// save pre-edit value
        this.preEditValue = this.val();

        ///// add CSS class to indicate editability
        this.el.classList.add(this.focusClass);

        this.handleMouseDown = function handleMouseDown(e) {
            self.simBlur(e);
            this.removeEventListener('mousedown', handleMouseDown, false);
        };

        ///// TODO: FIX THIS TO USE BLUR (BUT NOT WORKING CURRENTLY)
        ////console.log('NJEditable::startEditable - Adding mousedown listener to ' + this.el.nodeName);
        this.el.ownerDocument.body.addEventListener('mousedown', this.handleMouseDown, false);

        if(!preventSelectAll) {
            this.selectAll();
        }

        ///// call onStartEdit event methods
        this.onStartEdit.forEach(function(handler) {
            handler.bind(this)(e);
        }.bind(this));

        return this;
    };

    NJEditable.prototype.stopEditable = function(e) {
        var value;
        ////console.log('NJEditable::stopEditable - Removing mousedown listener to ' + this.el.nodeName);
        this.el.ownerDocument.body.removeEventListener('mousedown', this.handleMouseDown, false);

        if(!this.isEditable) {
            //console.log('NJEditable::stopEditable - Not editable (no need to stop)');
            return false;
        }

        value = this.getFirstTextNode().wholeText;

        this.el.contentEditable = this.isEditable = false;

        // //console.log('Stopping Editable');

        ///// if value is different than pre-edit val, call onchange method
        if(this.preEditValue && this.preEditValue != value) {
            // //console.log('NJEditable: value changed! calling onchange handler');
            this.onChange.forEach(function(handler) {
                handler.bind(this)(value, this.preEditValue);
            }.bind(this));
        }

        this.el.classList.remove(this.focusClass);

        ///// call onStopEdit event methods
        this.onStopEdit.forEach(function(handler) {
            handler.bind(this)(e);
        }.bind(this));

        if(e) {
            e.preventDefault();
        }

        ///// TODO: Remove this when blur is working
        //this.el.ownerDocument.body.removeEventListener('mousedown', simBlur, false);

        return this;
    };

///// NJEditable: val( [value] )
///// Get the content of the editable text (not suggestion)
///// or set the value by passing in string
NJEditable.prototype.val = function(value) {
    var tn   = this.elTextNode = this.getFirstTextNode(),
        text = '';

    if(tn) {
        if(value) { //// value specified, set it
            tn.textContent = text = value;
        } else {
            text = tn.textContent;
        }
    } else {
        this.el.appendChild(nj.textNode('')); // consider moving to getFirstTextNode();
    }

    //// //console.log('val() returns: ' + text);
    return text;

};
NJEditable.prototype.suggest = function(hint) {
    var self = this,
        hintDiff;

    ///// if no hint argument passed, clear suggestions
    if(!hint) {
        this.clearSuggest();
        return false;
    }

    // Get difference between typed-in string, and hint
    hintDiff = hint.substr(this.val().length);

    // //console.log('hint difference: ' + hintDiff);

    // append span with suggested hint
    if(this.suggestEl) {
        this.clearSuggest();
        //this.suggestEl.appendChild(document.createTextNode(hintDiff));
        this.getFirstTextNode(this.suggestEl).textContent = hintDiff;

        ///// if suggestEl was removed from the DOM, the object still
        ///// exists, so it needs to be re-appended
        if(this.suggestEl.parentNode === null) {
            this.el.appendChild(this.suggestEl);
        }
    } else {
        /// Remove the phantom "<BR>" element that is generated when
        /// content editable element is empty
        nj.children(this.el, function(item) {
            return item.nodeName === 'BR';
        }).forEach(function(item) {
            // //console.log('removing br');
            self.el.removeChild(item)
        });

        this.suggestEl = document.createElement('span');
        this.suggestEl.className = this.suggestClass;
        this.suggestEl.appendChild(document.createTextNode(hintDiff));
        this.el.appendChild(this.suggestEl);
    }

    this.hint = hint;
};
NJEditable.prototype.suggestNext = function(e) {
    e.preventDefault();
    if(this.matchIndex < this.matches.length-1) {
        // //console.log('next');
        this.clearSuggest();
        this.hint = this.matches[++this.matchIndex];
        this.suggest(this.hint);
    }
};
NJEditable.prototype.suggestPrev = function(e) {
    e.preventDefault();
    if(this.matchIndex != 0) {
        // //console.log('prev');
        this.clearSuggest();
        this.hint = this.matches[--this.matchIndex];
        this.suggest(this.hint);
    }
};
NJEditable.prototype.clearSuggest = function() {
    var el = this.suggestEl;
    if(el) {
        ////console.log('Has suggestion element, with ' + this.suggestEl.childNodes.length + ' children.');
        this.hint = null;
        //// empty suggest element
        this.getFirstTextNode(this.suggestEl).textContent = '';
    }
};

NJEditable.prototype.handleUp = function(e) {
    e.preventDefault();
    var word = getWordAtCaret();

};

NJEditable.prototype.handleDown = function(e) {
    e.preventDefault();
    var word = getWordAtCaret();
};

function getWordAtCaret() {
    var selection    = window.getSelection(),
        text         = selection.baseNode.textContent,
        position     = selection.anchorOffset
        tokens       = text.split(/\s/),
        runningLength= 0, i;

    for(i = 0; i<tokens.length; i++) {
        runningLength += tokens[i].length;
        if(runningLength > position){
            break;
        }
    }

    //console.log('getWordAtCaret : word at caret = "' + tokens[i] +'"');
        //first        = text.substring(0,position).replace(/(\b.*)(?=$)/, '$1'),
        //second       = text.substring(position).replace(/^(.*)\b/, '$1');

    ////console.log('getWordAtCaret : word at caret = "' + first+'|'+second +'"');
    //return first+second;

};

NJEditable.prototype.setCursor = function(position) {
    var index = position,
        range, node, sel;
    ///// argument can be "end" or an index
    if(typeof position === 'string' && position === 'end') {
        index = this.val().length;
    }

    sel = window.getSelection();
    sel.removeAllRanges();

    node = this.getFirstTextNode();
    range = document.createRange();
    range.setStart(node, index);
    range.setEnd(node, index);
    sel.addRange(range);
};

NJEditable.prototype.accept = function(e, preserveCaretPosition) {
    var el = this.el;

    if(e) {
        e.preventDefault();
    }

    //console.log('NJEditable::accept - Accepting hint');

    this.elTextNode = this.getFirstTextNode();
    this.elTextNode.textContent = this.hint;
    //// empty suggest element
    this.clearSuggest();
    if(!preserveCaretPosition) {
        this.setCursor('end');
    }
};

///// if force=true, it will revert even though the node is not currently editable
NJEditable.prototype.revert = function(e, forceRevert) {
    this.clearSuggest();
    if(this.isEditable || forceRevert) {
        /// revert to old value
        this.val(this.preEditValue);
        //console.log('reverting');
        this.onRevert.forEach(function(handler) {
            handler();
        });
    }
};
NJEditable.prototype.getFirstTextNode = function(el) {
    var e = el || this.el; // optional el argument specified container element
    var nodes = e.childNodes, node;
    if(nodes.length) {
        for(var i=0; i<nodes.length; i++) {
            node = nodes[i];
            if(node.nodeType === 3) {
                ///// found the first text node
                ////console.log('getFirstTextNode - found it');
                return node;
            }
        }
    } else {
        ////console.log('getFirstTextNode - did NOT find it. creating one');
        node = nj.textNode('');
        e.appendChild(node);
        return node;
    }

};
NJEditable.prototype.backspace = function(e) {
    var sel = window.getSelection(),
        isCaretAtBeginning = (sel.anchorOffset === 0 && sel.isCollapsed);
    if(isCaretAtBeginning || !this.isEditable) {
        e.preventDefault();
    }
};
NJEditable.prototype.selectAll = function() {
    var range = document.createRange(),
        sel   = window.getSelection();
    sel.removeAllRanges();
    ////console.log('NJEditable::selectAll - selecting node contents');
    range.selectNodeContents(this.el);
    sel.addRange(range);
};

function NJStyleSheet(cssStyleSheet, index) {
    this.sheet       = cssStyleSheet;
    this.ownerNode   = cssStyleSheet.ownerNode;
    this.container   = null;
    this.el          = nj.make('li');
    this.sheetNameEl = nj.make('a', { href: '#', 'className' : 'nj-css-sheetname'});
    this.toggleEl    = nj.make('input', { type:'checkbox', 'checked': 'checked', title: 'Disable', 'className': 'nj-skinned' });
    this.inputLabel  = nj.make('label');
    this.mediaInput  = nj.make('input', { type: 'text', 'className': 'nj-skinned' });
    this.deleteEl    = nj.make('a', { href: '#', 'className': 'nj-sheet-delete', title : 'Delete' });
    this.name        = 'Style tag';
    this.id          = null;
    this.isDisabled  = false;
    this.isDirty     = false;
    this.dirtyMarker = nj.make('span', 'nj-css-dirty-marker');
    this.isProtected = false;
    this.isCurrent = false;
    this.ruleCache = null;

    var self = this;

    ///// keep hidden until dirtied
    this.dirtyMarker.appendChild(nj.textNode('*'));

    //// add toggleEl disabling fuctionality
    this.toggleEl.addEventListener('click', function(e) {
        var action     = 'Disable',
            undoAction = 'Enable',
            toggleEl   = this, toggleCommand;

        if(this.checked) {
            action     = 'Enable';
            undoAction = 'Disable';
        }

        toggleCommand = Object.create(Object.prototype, {
            description: { value: action+" Stylesheet" },
            execute: {
                value: function() {
                    self[action.toLowerCase()]();
                    return this;
                }
            },
            unexecute: {
                value: function() {
                    self[undoAction.toLowerCase()]();
                }
            }
        });

        toggleCommand.execute();
        NJevent("sendToUndo", toggleCommand);

    }, false);

    var countStr;

    ///// Determine stylesheet name to use in list
    if (this.sheet.href) {
        this.name = nj.getFileNameFromPath(this.sheet.href);
        this.id   = this.sheet.href;
    } else {
        countStr = (index !== 1) ? ' (' + index + ')': '';
        this.name += countStr;
        this.id  = this.name;
    }

    this.inputLabel.appendChild(nj.textNode('Media:'));

    if(cssStyleSheet.media.length) {
        this.mediaInput.value = nj.toArray(cssStyleSheet.media).reduce(function(prevVal, val) {
            return prevVal + ', ' + val;
        });
        this.mediaInput.title = this.mediaInput.value;
    }

    ///// Set up media attribute switcher
    this.mediaInput.addEventListener('change', function(e) {
        var mediaListObj  = self.sheet.media,
            userMediaList = this.value.split(/\s*[,]\s*/),
            el = this;
        //console.log('onchange event');

        this.title = this.value;

        el.style.webkitTransition = '';
        this.style.backgroundColor = '#A0A0A0';

        setTimeout(function() {
            el.style.webkitTransition = 'background-color .12s ease-in';
            el.style.backgroundColor = '#474747';
        }, 10);

        this.addEventListener('webkitTransitionEnd', function njGlow(e) {
            e.stopPropagation();
            this.style.backgroundColor = '';
            this.removeEventListener('webkitTransitionEnd', njGlow, false);
        }, false);

        //// clear media list
        nj.toArray(mediaListObj).forEach(function(medium) {
            this.deleteMedium(medium);
        }, mediaListObj);

        //// add the user's media
        userMediaList.forEach(function(medium) {
            this.appendMedium(medium);
        }, mediaListObj);

        //console.log(mediaListObj);
    }, false);

    // rec = {
    //         deleteSheet : function() {},
    //         reAddSheet  : function() {}
    //     };

    var deleteCommand = Object.create(Object.prototype, {
        description: { value: "Delete Stylesheet" },
        //receiver: { value: rec },
        execute: {
            value: function() {
                self.cacheRules();
                self.remove();
                //console.log(self.ruleCache);
                return this;
            }
        },
        unexecute: {
            value: function() {
                var doc = self.ownerNode.ownerDocument;
                doc.head.appendChild(self.ownerNode);
                self.appendCachedRules();
                self.sheet = doc.styleSheets[doc.styleSheets.length-1];
                self.sheet.njStyleSheet = self;
                self.render(self.container);
                documentControllerModule.DocumentController.DispatchElementChangedEvent(CSSPanel.application.ninja.selectedElements);
            }
        }
    });

    ///// Add Delete functionality
    this.deleteEl.addEventListener('click', function(e) {
        //console.log('click delete');
        deleteCommand.execute();
        NJevent("sendToUndo", deleteCommand);
        //self.remove();
    }, false);

    ///// Attach NJSTylesheet object to host stylesheet object
    this.sheet.njStyleSheet = this;
}

NJStyleSheet.prototype.cacheRules = function() {
    this.ruleCache = nj.toArray(this.sheet.rules).map(function(rule) {
        return rule.cssText;
    }, this);
};

NJStyleSheet.prototype.appendCachedRules = function() {
    var allCSS = this.ruleCache.join(' ');
    this.ownerNode.innerHTML = allCSS;
    //console.log('All CSS' + allCSS);
};

NJStyleSheet.prototype.render = function(cont) {
    var h, intervalId;

    this.container = cont;
    ///// Attach NJStyleSheet object to the list item for later access
    cont.njStyleSheet = this;

    this.el.appendChild(this.toggleEl);
    this.el.appendChild(this.dirtyMarker);

    nj.empty(this.sheetNameEl);
    this.sheetNameEl.appendChild(nj.textNode(this.name));
    this.sheetNameEl.title = this.name;

    this.el.appendChild(this.sheetNameEl);
    this.el.appendChild(this.deleteEl);
    this.el.appendChild(this.mediaInput);
    this.el.appendChild(this.inputLabel);

    if(this.isProtected) {
        this.el.classList.add('nj-css-protected-sheet');
    }

    this.el.classList.add('nj-get-height');

    cont.appendChild(this.el);

    h = nj.height(this.el);

    this.el.classList.add('nj-pre-slide');
    this.el.classList.remove('nj-get-height');

    this.el.addEventListener('webkitTransitionEnd', function njSlide(e) {
        e.stopPropagation();
        clearInterval(intervalId)
        this.el.classList.remove('nj-pre-slide');
        CSSPanel.scrollTo('bottom', this.container.parentNode);
    }.bind(this), false);
    //this.el.style.height = '0px';
    //this.el.style.overflow = 'hidden';
    this.el.style.height = h;

    intervalId = setInterval(function() {
        CSSPanel.scrollTo('bottom', this.container.parentNode);
    }.bind(this), 5);
    // this.el.style.webkitTransition = 'all 3s ease-out';
    // this.el.style.height = '22px';
};

NJStyleSheet.prototype.dirty = function() {
    // //console.log('Dirtying sheet with name ' + this.name);
    if(!this.isDirty) {
        this.isDirty = true;
        ///// Add marker in UI to show styleshseet is modified
        this.dirtyMarker.classList.add('nj-css-dirty');
    }
};
NJStyleSheet.prototype.unDirty = function() {
    this.isDirty = false;
    this.dirtyMarker.classList.remove('nj-css-dirty');
};

NJStyleSheet.prototype.disable = function() {
    this.toggleEl.checked = false;
    this.sheet.disabled = true;
    this.el.classList.add('nj-css-disabled');
};

NJStyleSheet.prototype.enable = function() {
    this.toggleEl.checked = true;
    this.sheet.disabled = false;
    this.el.classList.remove('nj-css-disabled');
};

NJStyleSheet.prototype.makeCurrent = function() {
    this.isCurrent = true;
    this.el.classList.add('nj-css-default-sheet');
};

NJStyleSheet.prototype.unMakeCurrent = function() {
    this.isCurrent = false;
    this.el.classList.remove('nj-css-default-sheet');
};

NJStyleSheet.prototype.remove = function() {
    if(!this.isProtected) {
        var njRules = [];
        //console.log('Removing stylesheet');

        ///// Remove event listeners
        this.sheetNameEl.onclick = null;
        this.deleteEl.onclick = null;
        this.toggleEl.onclick = null;
        this.mediaInput.onchange = null;

        ///// Remove all njRules from Rule List
        njRules = nj.toArray(this.sheet.rules).forEach(function(rule) {
            if(rule.njcssrule) {
                rule.njcssrule.delete();
            }
        });
        this.ownerNode.parentNode.removeChild(this.ownerNode);
        this.container.removeChild(this.el);
    }
};
