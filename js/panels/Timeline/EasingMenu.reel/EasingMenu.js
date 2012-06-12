/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
	Component = require("montage/ui/component").Component,
	Popup = require("montage/ui/popup/popup.reel").Popup;

var EasingMenu = exports.EasingMenu = Montage.create(Component, {

    hasTemplate:{
        value: true
    },
    
    draw: {
    	value: function() {
    		console.log("EasingMenu.draw")
    	}
    },
    
	show: {
		value: function() {
            var popup, easingMenu;
            popup = Popup.create();
            this._popup = popup;

            popup.modal = false;

            easingMenu = EasingMenu.create();
            popup.content = easingMenu;

            popup.show();
		}
    }
    
});
