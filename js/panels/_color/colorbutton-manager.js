/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */
 
////////////////////////////////////////////////////////////////////////
//
var Montage =			require("montage/core/core").Montage,
	Component =			require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//Exporting as ColorPopupManager
exports.ColorButtonManager = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //
    hasTemplate: {
    	value: false
    },
    ////////////////////////////////////////////////////////////////////
    //Storing color manager
    _colorManager: {
        enumerable: false,
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    colorManager: {
    	enumerable: true,
        get: function() {
            return this._colorManager;
        },
        set: function(value) {
        	this._colorManager = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _buttons: {
    	enumerable: false,
    	value: {chip: [], fill: [], stroke: [], current: [], previous: [], rgbmode: [], hslmode: [], hexinput: [], nocolor: [], reset: [], swap: [], mlabel1: [], mlabel2: [], mlabel3: []}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});