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
    Component = require("montage/ui/component").Component,
    ShorthandProps = require("js/panels/CSSPanel/css-shorthand-map");

exports.StyleDeclaration = Montage.create(Component, {
    arrayController: {
        value: null
    },

    styleComponent: {
        value: null
    },

    repetition: {
        value: null
    },

    cssText : { value: null },
    focusDelegate : { value: null },
    needsSort : { value: null },

    includeEmptyStyle : {
        value: true,
        distinct: true
    },
    styles : {
        value: [],
        distinct: true
    },

    _styleSortFunction : {
        value: function(styleA, styleB) {
            ///// If the style is an empty style (with Add button)
            ///// push to end of declaration
            if(styleA.isEmpty) {
                return 1;
            } else if (styleB.isEmpty) {
                return -1;
            }

            return 0;
            ///// Alphabetic sort based on property name
//            if (styleA.name < styleB.name) {
//                return -1;
//            } else if (styleA.name > styleB.name) {
//                return 1;
//            } else {
//                return 0;
//            }
        }
    },
    _styleFilterFunction: {
        value: function(style, styleArray) {
            var shorthands = ShorthandProps.CSS_SHORTHAND_MAP[style.name];

            ///// No shorthands, return true to include style
            if(!shorthands) { return true; }

            var subProps = ShorthandProps.CSS_SHORTHAND_TO_SUBPROP_MAP[shorthands[0]],
                stylesArray = styleArray,
                hasAll;

            debugger;
            hasAll = subProps.every(function(subProp) {
                debugger;
                return this.declaration[subProp];
            }, this);

            if(hasAll) {
                return false;
            }
        }
    },

    _declaration: {
        value: null
    },
    declaration: {
        get: function() {
            return this._declaration;
        },
        set: function(dec) {
            var stylesArray;

            if(this._declaration) {
                this.styles = null;
                this.styles = [];
            }

            ///// Take snapshot of declaration
            this.cssText = dec.cssText;

            stylesArray = this.filterShorthands(Array.prototype.slice.call(dec));
            stylesArray.forEach(function(prop, index) {
                this.styles.push({
                    name: prop,
                    value: dec.getPropertyValue(prop),
                    isEmpty: false
                });
            }, this);

            if(this.includeEmptyStyle) {
                this.styles.push({
                    name    : "property",
                    value   : "value",
                    isEmpty : true
                });
            }

            this._declaration = dec;
            this.needsDraw = this.needsSort = true;
        }
    },

    filterShorthands : {
        value: function(styles) {
            var shorthandsToAdd = [],
                subProps, hasAll;

            var stylesCopy = styles.map(function(style) {
                return style;
            });

            stylesCopy.forEach(function(property, index) {
                var shorthands = ShorthandProps.CSS_SHORTHAND_MAP[property];
                if(shorthands) {
                    subProps = ShorthandProps.CSS_SHORTHAND_TO_SUBPROP_MAP[shorthands[0]];

                    hasAll = subProps.every(function(subProp) {
                        return styles.indexOf(subProp) !== -1;
                    });

                    if(hasAll) {
                        for(var i = subProps.length-1; i>=0; i--) {
                            styles.splice(styles.indexOf(subProps[i]), 1);
                        }
                        shorthandsToAdd.push(shorthands[0]);
                    }

                    return true;
                }
            }, this);

            return styles.concat(shorthandsToAdd);
        }
    },

    _getStyleToIndexMap : {
        value: function() {
            var map = {};

            for(var i = 0; i<this.styles.length; i++) {
                map[this.styles[i].name] = i;
            }

            return map;
        }
    },

    update : {
        value: function() {
            if(this.declaration.cssText !== this.cssText) {
                var usedIndices = [],
                    styleToIndexMap = this._getStyleToIndexMap();

                Array.prototype.slice.call(this.declaration).forEach(function(prop, index) {
                    var styleObjectIndex = styleToIndexMap[prop];

                    ///// Style component exists for property
                    ///// Update its value
                    if(styleObjectIndex !== undefined) {
                        this.styles[styleObjectIndex].value = this.declaration.getPropertyValue(prop);
                        usedIndices.push(styleObjectIndex);
                    } else {
                        //// styles doesn't exist, does shorthand?
                        var shorthands = ShorthandProps.CSS_SHORTHAND_MAP[prop],
                            shorthandUpdated = false;

                        if(shorthands) {
                            shorthands.forEach(function(shorthand) {
                                var shorthandIndex = styleToIndexMap[shorthand];
                                if(shorthandIndex) {
                                    //// if shorthand exists in list of rendered styles
                                    //// update it
                                    this.styles[shorthandIndex].value = this.declaration.getPropertyValue(shorthand);
                                    usedIndices.push(shorthandIndex);
                                    shorthandUpdated = true;
                                }
                            }, this);
                        }

                        if(!shorthandUpdated) {
                            //// push to usedIndices so we don't remove styles we just added
                            usedIndices.push(this.styles.length);
                            this.addStyle(prop, this.declaration.getPropertyValue(prop));
                        }
                    }
                }, this);

                for(var i = this.styles.length-1; i>=0; i--) {
                    if(usedIndices.indexOf(i) === -1) {
                        if(!this.styles[i].isEmpty) {
                            ///// index not used, remove style
                            this.removeStyle(this.styles[i]);
                        }
                    }
                }

                ///// Keep copy of cssText to know when we need to
                ///// update the view
                this.cssText = this.declaration.cssText;
                this.needsDraw = this.needsSort = true;
            }
        }
    },

    styleTree : {
        value: {
            "properties" : []
        },
        distinct: true
    },

    addNewStyle : {
        value: function(preventAnimation) {
            if(preventAnimation) {
                this.element.classList.add('css-animation-prevent');

                setTimeout(function() {
                    this.element.classList.remove('css-animation-prevent');
                }.bind(this), 1000);
            }

            this.addStyle('property', 'value', {
                isEmpty : true
            });
        }
    },
    addStyle : {
        value: function(property, value, data) {
            var styleDescriptor = {
                name : property,
                value : value,
                isEmpty: false
            }, prop;

            for(prop in data) {
                if(data.hasOwnProperty(prop)) {
                    styleDescriptor[prop] = data[prop];
                }
            }

            //this.styles.push(styleDescriptor);
            this.arrayController.addObjects(styleDescriptor);

            this.needsSort = this.needsDraw = true;
        }
    },
    removeStyle : {
        value: function(styleDescriptor) {
            var styleDescriptorIndex = this.styles.indexOf(styleDescriptor);
            //this.styles.splice(styleDescriptorIndex, 1);
            this.arrayController.removeObjects(styleDescriptor);

            //this.needsDraw = true;
        }
    },

    /* drag/drop events */
    handleDrop : {
        value: function(e) {
            console.log('dropped');
        }
    },
    handleDragenter : {
        value: function(e) {
            console.log("dec - drag enter");
            this.element.classList.add("drag-over");
        }
    },
    handleDragleave : {
        value: function(e) {
            if(this.element === e._event.toElement || this._containsElement(e._event.toElement)) {
                //// Dragged-over element is inside of component element
                //// I.e. it's not really a "drag leave"
                e.stopPropagation();
                e.preventDefault();
                return false;
            }

            console.log("DECLARATION - ELEMENT NOT IN DEC", e._event.toElement);

            //console.log("dec - drag leave");
            this.element.classList.remove("drag-over");
        }
    },

    templateDidLoad : {
        value: function() {
            if(this.focusDelegate) {
                this.styleComponent.delegate = this.focusDelegate;
            }
            this.arrayController.sortFunction = this._styleSortFunction;
        }
    },

    prepareForDraw : {
        value: function(e) {
            this._element.addEventListener('drop', this, false);
            this.element.addEventListener('dragenter', this, false);
            this.element.addEventListener('dragleave', this, false);
        }
    },

    willDraw : {
        value: function() {
            if(this.needsSort) {
                //this.arrayController.organizeObjects();
                this.needsSort = false;
            }
        }
    },

    _containsElement : {
        value: function(innerElement) {
            var isInComponent = false,
                parent = innerElement.parentNode;

            while (parent !== document) {
                if(parent === this.element) {
                    isInComponent = true;
                    break;
                }
                parent = parent.parentNode;
            }

            return isInComponent;
        }
    }
});
