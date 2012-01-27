/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

// Adding to the String Prototype little utility function to capitalize the first Char of a String.
String.prototype.capitalizeFirstChar = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

exports.utils = Object.create(Object.prototype, {

    getValueAndUnits: {
        value: function(str)
        {
            var numberValue = parseFloat(str);
            // Ignore all whitespace, digits, negative sign and "." when looking for units label
            // The units must come after one or more digits
            var objRegExp = /(\-*\d+\.*\d*)(\s*)(\w*\%*)/;
            var unitsString = str.replace(objRegExp, "$3");
            if(unitsString)
            {
                var noSpaces = /(\s*)(\S*)(\s*)/;
                // strip out spaces and convert to lower case
                var match = (unitsString.replace(noSpaces, "$2")).toLowerCase();
            }

            return [numberValue, match];
        }
    }

});