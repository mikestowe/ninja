/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    ShorthandProps = require("js/panels/CSSPanel/css-shorthand-map");

exports.Declaration = Montage.create(Component, {
    cssText : {
        value: null
    },
    focusDelegate : {
        value: null
    },
    includeEmptyStyle : {
        value: true
    },
    templateDidLoad : {
        value: function() {
            console.log("declaration - template did load");

            if(this.focusDelegate) {
                this.treeController.delegate = this.focusDelegate;
            }
        }
    },
    prepareForDraw : {
        value: function(e) {
            console.log("Declaration :: prepare for draw");
            this._element.addEventListener('drop', this, false);
            this.element.addEventListener('dragenter', this, false);
            this.element.addEventListener('dragleave', this, false);
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
            this._declaration = dec;

            this.cssText = dec.cssText;

            ///// creates data structure to use with tree component
            this.buildStyleTree();

            if(this.includeEmptyStyle) {
                this.styleTree.properties.push({
                    "name": "property",
                    "value" : "value",
                    "isEmpty": true
                });
            }

            this.needsDraw = true;
        }
    },

    update : {
        value: function() {
            if(this.declaration.cssText !== this.cssText) {
                ///// Needs update
                this.treeController.branchControllers[0].content.forEach(function(obj) {
                    this.treeController.branchControllers[0].removeObjects(obj);
                }, this );

                this.buildStyleTree();

                if(this.includeEmptyStyle) {
                    this.styleTree.properties.push({
                        "name": "property",
                        "value" : "value",
                        "isEmpty": true
                    });
                }
//debugger;
                this.needsDraw = true;
            }
        }
    },

    buildStyleTree : {
        value: function() {
            var styles = Array.prototype.slice.call(this._declaration).sort();
            this.styleTree = {
                properties : styles.map(this.styleTreeMapper, this)
            };
        }
    },
    styleTreeMapper : {
        value: function arrayToTreeMapper(property, i, styleArray) {
            var shorthands = ShorthandProps.CSS_SHORTHAND_MAP[property],
                subProps, hasAll;

            ///// Is this a sub property of a shorthand property?
            if(shorthands) {
                //debugger;
                ///// Yes.
                ///// Now, are all sub properties in the declaration?
                subProps = ShorthandProps.CSS_SHORTHAND_TO_SUBPROP_MAP[shorthands[0]];
                hasAll = subProps.every(function(subProp) {
                    return styleArray.indexOf(subProp) !== -1;
                });

                if(hasAll) {
                    ///// It has all sub properties
                    ///// Let's return a tree branch and remove the
                    ///// sub properties from the flat array

                    this._removeItemsFromArray(styleArray, subProps);

                    return {
                        name: shorthands[0],
                        value: this._declaration.getPropertyValue(shorthands[0]),
                        properties: subProps.map(function(p, i, array) {
                            return {
                                name: p,
                                value: this._declaration.getPropertyValue(p)
                            };
                        }, this)
                    };
                }
            }


            return {
                name: property,
                value: this._declaration.getPropertyValue(property)
            };
        }
    },
    _removeItemsFromArray : {
        value: function(array, items) {
            items.forEach(function(item) {
                var index = array.indexOf(item);
                array.splice(index, 1);
            }, this);
        }
    },
    styleTree : {
        value: {
            "properties" : []
        },
        distinct: true
    },

    addNewStyleAfter : {
        value: function(style) {
            style.parentComponent.parentComponent.contentController.addObjects({
                name: 'property',
                value: 'value',
                isEmpty: true,
                treeNodeType: 'leaf'
            });
            style.parentComponent.parentComponent.needsDraw = true;
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

    draw: {
        value: function() {
            if(this._declaration) {

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