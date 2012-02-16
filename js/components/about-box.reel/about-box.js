/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
Component = require("montage/ui/component").Component,
Popup = require("montage/ui/popup/popup.reel").Popup;

var AboutBox = exports.AboutBox = Montage.create(Component, {
    _ninjaVersionString: {
        enumerable: false,
        value: null
    },

    _popup: {
        enumerable: false,
        value: null
    },

    captureMouseup: {
        value: function(event) {
            document.removeEventListener("mouseup", this, true);
            this._popup.hide();
        }
    },

    captureMousedown: {
        value: function(event) {
            // ignore clicks on our links to the license, credits or project page
            if(event._event.srcElement.className !== 'aboutBoxAnchor') {
                document.addEventListener("mouseup", this, true);
                document.removeEventListener("mousedown", this, true);
            }
        }
    },

    prepareForDraw: {
        value: function() {
            if(this._ninjaVersionString == null) {
                this._ninjaVersionString = this.application.ninja.ninjaVersion;
            }

            if(this._ninjaVersionString) {
                var verNum = document.getElementById("aboutBoxVersionNumber");
                if(verNum) {
                     verNum.innerHTML = this._ninjaVersionString;
                 }
            }
        }
    },
    draw: {
        enumerable: false,
        value: function() {
        }
    },

    show: {
        value: function() {
            document.addEventListener("mousedown", this, true);
            var popup = this.application._alertPopup, about;
            if(!popup) {
                popup = Popup.create();
                this._popup = popup;

                popup.modal = true;
                this.application._alertPopup = popup;

                about = AboutBox.create();
                popup.content = about;
            }
            popup.show();
        }
    }
});
