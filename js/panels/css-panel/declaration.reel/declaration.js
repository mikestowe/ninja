/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    ShorthandProps = require("js/panels/CSSPanel/css-shorthand-map");

exports.Declaration = Montage.create(Component, {
    templateDidLoad : {
        value: function() {
            console.log("declaration - template did load");
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
            console.log('here');
            ///// creates data structure to use with tree component
            this.buildStyleTree();
            console.log('there');
            this.needsDraw = true;
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
    draw: {
        value: function() {
            if(this._declaration) {

            }
        }
    }
});