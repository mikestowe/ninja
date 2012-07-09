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

exports.StylesViewContainer = Montage.create(Component, {

    ruleListContainer: {
        value: null,
        serializable: true
    },

    computedStyleView: {
        value: null,
        serializable: true
    },

    toolbar: {
        value: null,
        serializable: true
    },

    _currentDocument: {
        value : null
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

            if(!value) {
                this.hasStyles = false;
                this.needsDraw = true;
            }
        }
    },

    contentController : {
        value: null
    },
    contentPanel : {
        value: 'rules'
    },
    selectionName: {
        value: null,
        serializable: true
    },
    _selectionNameLabelText : {
        value: null
    },
    selectionNameLabelText : {
        get: function() {
            return this._selectionNameLabelText;
        },
        set: function(value) {
            if(value === this._selectionNameLabelText) { return false; }

            this._selectionNameLabelText = value;

            this.needsDraw = true;
        }
    },
    _prevSelection : {
        value: null
    },
    prevSelection : {
        get: function() {
            return this._prevSelection;
        },
        set: function(value) {
            this._prevSelection = value;
        }
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
            //caller needs to set ndt
            //this.needsDraw = true;
        }
    },

    _getElementLabel : {
        value: function(el) {
            var id = '#'+el.id,
                className = '.'+Array.prototype.slice.call(el.classList).join('.'),
                nodeName = el.nodeName;

            if(id.length > 1) {
                return nodeName + id;
            } else if(className.length > 1) {
                return nodeName + className;
            }

            return nodeName;
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
    _copy : {
        value: function(array) {
            return array.map(function(item) { return item; });
        }
    },
    handleSelectionChange: {
        value: function(e) {
            var elements = this.application.ninja.selectedElements,
                elementsCopy = this._copy(elements);

            ///// Is selection identical? If so, do nothing.
            if(this._isSameArray(elements, this.prevSelection) && this.contentPanel === "rules") {
                return false;
            }

            // TODO: should selection always create new array
            // TODO: pushing to selection array makes prevSelection
            // TODO: invalid
            this.prevSelection = elementsCopy;

            if(elements.length === 0) {
                this.hasStyles = false;
                this.needsDraw = true;
                return false;
            } else if(elements.length === 1) {

                ///// update the selection status label with the label of the element
                this.selectionNameLabelText = this._getElementLabel(elements[0]);

                if(this.contentPanel === "rules") {
                    this.ruleListContainer.displayListForSelection(elementsCopy);
                } else {
                    this.computedStyleView.declaration = elements[0];
                }
                this.toolbar.showButton('computed');
            } else {
                this.toolbar.hideButton('computed');
                this.contentPanel = "rules";
                this.selectionNameLabelText = elements.length + " elements selected.";
                ///// find common rules
                this.ruleListContainer.displayListForSelection(elementsCopy);

            }

            this.hasStyles = true;
        }
    },
    handleElementChange : {
        value: function(e) {
            var elements = this.application.ninja.selectedElements;

            if(elements.length === 0) {
                return false;
            } else if(elements.length === 1) {
                if(this.contentPanel === "rules") {
                    if(e._event.detail.type !== 'cssChange') {
                        this.ruleListContainer.update();
                    }
                } else {
                    this.computedStyleView.declaration = elements[0];
                }
            } else {
                return false;
            }

        }
    },

    draw : {
        value: function() {
            if(this.hasStyles) {
                this.element.classList.remove('no-styles');
                //this.selectionNameLabel.classList.remove('no-styles');
                this.selectionName.element.classList.remove('no-styles');
            } else {
                this.element.classList.add('no-styles');
                //this.selectionNameLabel.classList.add('no-styles');
                this.selectionName.element.classList.add('no-styles');
            }
        }
    },

    _isSameArray : {
        value: function(left, right) {
            if(!left || !right) { return false; }
            if(left.length !== right.length) { return false; }

            return left.every(function(item, i) {
                return item === right[i];
            });
        }
    }
});
