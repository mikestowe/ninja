/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;

exports.ElementModel = Montage.create(Montage, {
    key:            { value: "_model_"},

    type:           { value: null },                // Tag type that was created
    selection:      { value: null },                // Selection string
    controller:     { value: null },                // Controller Class
    pi:             { value: null },

    id:             { value: "" },
    classList:      { value: null },

    defaultRule:    { value: null },

    top:            { value: null },
    left:           { value: null },
    width:          { value: null },
    height:         { value: null },

    /**
     * Properties 3D
     */
    props3D:        { value: null },

    /**
     * Shape Info
     */
    isShape:        { value: false },
    shapeModel:     { value: null },

    /**
     * SnapManager 2d Snap Cache Info
     */
    isIn2DSnapCache : { value: false },

    /**
     * Color info
     */
    fill:           { value: null },
    stroke:         { value: null },

    getProperty: {
        value: function(property) {
            var key = this.key + property;

            if(!this.hasOwnProperty(key)) {
                this.defineModelProperty(key, null);
            }

            return this[key];
        }
    },

    setProperty: {
        value: function(property, value) {
            var key = this.key + property;

            if(!this.hasOwnProperty(key)) {
                this.defineModelProperty(key, value);
            } else {
                this[key] = value;
            }
        }
    },

    defineModelProperty: {
        value: function(property, value) {
            Montage.defineProperty(this, property, {
                enumarable: true,
                value:value
            });
        }
    }

});