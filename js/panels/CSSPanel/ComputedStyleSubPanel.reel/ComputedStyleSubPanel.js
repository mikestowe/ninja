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
    Component = require("montage/ui/component").Component,
    nj        = require("js/lib/NJUtils").NJUtils;


exports.ComputedStyleSubPanel = Montage.create(Component, {
    groupDropDown:      { value: null },
    computedListEl:     { value: null },
    searchField:        { value: null },

    templateDidLoad : {
        value : function() {
            ///// Set current filter group
            this._group = this.groupDropDown.value;
            ///// Set up event listeners
            this.groupDropDown.addEventListener('change', this);
            this.searchField.addEventListener('input', this);
        }
    },
    // prepareForDraw : {
    //    value: function() {
    //             
    //    }
    // },
    willDraw : {
        value: function() {
            if(this._declaration) {
            
                var group = this.staticGroupingMap[this._group],
                    matchedInGroup, elementList;
            
                if(this._group === 'all' && !group) {
                    group = this.staticGroupingMap['all'] = nj.toArray(this._declaration).sort();
                }
            
                ///// Filter group to show only the styles that match search filter
                matchedInGroup = group.filter(function(item) {
                    return (item.indexOf(this._filter) > -1);
                }, this);
                
                this._elementList = matchedInGroup.map(function(propName) {
                    var propEl = nj.make('dt'),
                        valEl  = nj.make('dd'),
                        contEl = nj.make('div');

                    propEl.appendChild(nj.textNode(propName));
                    propEl.title = propName;
                    
                    valEl.appendChild(nj.textNode(this._declaration.getPropertyValue(propName)));
                    valEl.title = this._declaration.getPropertyValue(propName);
                    
                    contEl.appendChild(propEl);
                    contEl.appendChild(valEl);
                
                    return contEl;
                }, this);
            
                /*if(matchedInGroup.length) {
                
                } else {
                
                }*/
            }
        }
    },
    // The draw function appends the element list to the dom
    draw: {
        value: function() {
            if(this._elementList) {
                this.clearList();
                ///// Append style elements to the list container
                this._elementList.forEach(function(el) {
                    this.computedListEl.appendChild(el);
                }, this);   
            }
        }
    },
    clearList : {
        value: function() {
            nj.empty(this.computedListEl);
        }
    },
    ///// Drop down has changed values
    handleChange : {
        value: function(e) {
            this._group = this.groupDropDown.value;
            this.needsDraw = true;
        }
    },
    ///// Text input has changed values
    handleInput : {
        value : function(e) {
            this._filter = this.searchField.value.trim();
            this.needsDraw = true;
        }
    },
    // Publicly accessible list of computed styles
    declaration : {
        get: function() {
            return this._declaration;
        },
        ////// Accepts a CSSStyleDeclaration object, or dom element
        set: function(source) {
            var declaration, styles;
            if(source.constructor.name === 'CSSStyleDeclaration') {
                declaration = this._declaration = source;
            } else {
                ///// Get computed style of passed in node
                declaration = this._declaration = source.ownerDocument.defaultView.getComputedStyle(source);
            }
            
            this.needsDraw = true;
        }
    },
    ///// Renders the styles for the current node
    show : {
        value : function() {
            this.element.classList.remove(this._cssClasses.hide);
        }
    },
    hide : {
        value : function() {
            this.element.classList.add(this._cssClasses.hide);
        }
    },
    ///// Private
    //// Stores the current CSSDeclaration object returned by getComputedStyle
    //// which is needed to get property values
    _declaration : {
        enumerable: false,
        value : null
    },
    ///// List of elements to append to style list
    _elementList : {
        value: null
    },
    ///// Group selected in drop down
    _group : {
        enumerable: false,
        value : null
    },
    ///// Filter string entered in search input
    _filter : {
        enumerable: false,
        value : ''
    },
    ///// CSS classes used in component
    _cssClasses : {
        value : {
            hide : 'nj-css-panel-hide'
        }
    },
    ///// List of css properties within specified catagories
    staticGroupingMap : {
        value : {
            'all' : null,
            'background' : [
                'background-color', 'background-image', 'background-repeat', 'background-position',
                'background-attachment'
            ],
            'summary' : [
                'width', 'height', 'color', 'font-family', 'font-size', 'display'
            ],
            'dimensions' : [
                'width', 'height', 'top', 'right', 'bottom', 'left',
                'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 
                'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'
            ],
            'border' : [
                'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
                'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
                'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'
            ],
            'font' : [
                'font-family', 'font-size', 'font-weight', 'font-style', 'color', 'text-transform', 
                'text-decoration', 'letter-spacing', 'word-spacing', 'line-height', 'text-align',
                'vertical-align', 'direction'
            ],
            'layout' : [
                'position', 'display', 'visibility', 'z-index', 'overflow-x', 'overflow-y',
                'white-space', 'clip', 'float', 'clear'
            ]
        }
    }
});
