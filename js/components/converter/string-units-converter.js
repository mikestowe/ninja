/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */
var Montage = require("montage").Montage,
    Converter = require("montage/core/converter/converter").Converter,
    NJUtils = require("js/lib/NJUtils").NJUtils;

exports.StringUnitsConverter = Montage.create(Converter, {

    convert: {
        value: function(value) {
            if(value) {
                console.log("convert string to unit ", value);
                var tmp = NJUtils.getValueAndUnits(value);
                return tmp[1];
            }
        }
    },

    revert: {
        value: function(value) {
            console.log("revert string to unit ", value);
            return value;
        }
    }

});
