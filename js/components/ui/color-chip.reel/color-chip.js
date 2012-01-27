/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

var ColorChip = exports.ColorChip = Montage.create(Component, {

    hasIcon: {
        value: true
    },

    mode: {
        value: "stroke"
    },

    prepareForDraw: {
        value: function() {
//            this.colorButton.props = {side: 'right', align: 'bottom', wheel: true, palette: true, gradient: true, image: true, offset: 20};
//            this.application.ninja.colorController.addButton('chip', this.colorButton);


            this.addEventListener("firstDraw", this, false);
        }
    },

    draw: {
        value: function() {

            if(this.hasIcon) this.application.ninja.colorController.addButton(this.mode + 'Icon', this.icon);

//            this.application.ninja.colorController.addButton(this.mode, this.chipBtn);
            this.chipBtn.props = {side: 'right', align: 'top', wheel: true, palette: true, gradient: true, image: true, offset: 20};
            this.application.ninja.colorController.addButton(this.mode, this.chipBtn);
        }
    }

});
