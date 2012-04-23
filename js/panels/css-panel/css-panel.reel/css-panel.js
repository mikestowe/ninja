/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.CSSPanelNew = Montage.create(Component, {
    _resizedHeight : {
        value: null
    },
    isResizing : {
        value: null
    },
    _height: {
        value: null
    },
    height: {
        get: function() {
            return this._height;
        },
        set: function(val) {
            if(this._height !== val) {
                this._height = val;
                this.needsDraw = true;
            }
        }
    },


    prepareForDraw : {
        value: function() {
            console.log("css panel : prepare for draw");
        }
    },
    draw : {
        value: function() {
            console.log("css panel : draw. height: ", this.height);

//            if(this.height) {
//                console.log("CSS Panel draw - resizing to", (this.height + this._resizedHeight) + "px");
//                this.styleSheetsView.element.style.height = (this.height + this._resizedHeight) + "px";
//            }
        }
    },
    didDraw: {
        value: function() {
            if(!this.isResizing) {
                //this.height = this.element.offsetHeight;
            }
        }
    }
});
