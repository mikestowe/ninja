/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    ShorthandProps = require("js/panels/CSSPanel/css-shorthand-map");

exports.StyleDeclaration = Montage.create(Component, {
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

            ///// Alphabetic sort based on property name
            if (styleA.name < styleB.name) {
                return -1;
            } else if (styleA.name > styleB.name) {
                return 1;
            } else {
                return 0;
            }
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

            stylesArray = Array.prototype.slice.call(dec);

            stylesArray.forEach(function(prop, index) {
                this.styles.push({
                    name: prop,
                    value: dec.getPropertyValue(prop)
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

    styleShorthander : {
        value: function(styles) {
            var shorthandsToAdd = [],
                subProps, hasAll;

            styles.forEach(function(property, index, styleArray) {
                var shorthands = ShorthandProps.CSS_SHORTHAND_MAP[property];

                if(!shorthands) { return false; }

                var subProps = ShorthandProps.CSS_SHORTHAND_TO_SUBPROP_MAP[shorthands[0]],
                    stylesArray = styleArray;

                hasAll = subProps.every(function(subProp) {
                    return stylesArray.indexOf(subProp) !== -1;
                });

                if(hasAll) {
                    subProps.forEach(function(subProp) {
                        stylesArray.splice(stylesArray.indexOf(subProp), 1);
                    }, this);
                    shorthandsToAdd.push(shorthands[0]);
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
                    var i = styleToIndexMap[prop];

                    ///// Style component exists for property
                    ///// Update its value
                    if(i) {
                        this.styles[i].value = this.declaration.getPropertyValue(prop);
                        usedIndices.push(i);
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
                                    shorthandUpdated = true;
                                }
                            }, this);
                        }

                        if(!shorthandUpdated) {
                            this.addStyle(prop, this.declaration.getPropertyValue(prop));
                        }
                    }
                }, this);

                ///// Keep copy of cssText to know when we need to
                ///// update the view
                this.cssText = this.declaration.cssText;
                this.needsDraw = true;
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
        value: function() {
            this.addStyle('property', 'value', {
                isEmpty : true
            });
        }
    },
    addStyle : {
        value: function(property, value, data) {
            var styleDescriptor = {
                name : property,
                value : value
            }, prop;

            for(prop in data) {
                if(data.hasOwnProperty(prop)) {
                    styleDescriptor[prop] = data[prop];
                }
            }

            this.styles.push(styleDescriptor);
            this.arrayController.organizeObjects();
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
                this.arrayController.organizeObjects();
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