/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component       = require("montage/ui/component").Component;

exports.LocalStorage = Montage.create( Montage, {

    getItem: {
        value: function(item) {
            var item;

            if (window.localStorage) {
                item  = window.localStorage.getItem(item);
                if(item !== null) return JSON.parse(item)
                return null;
            } else {
                alert("Local Storage is not supported on your browser");
                return null;
            }

            /*
            if (window.localStorage) {
                this.getItem = function(item) {
                    return window.localStorage.getItem(item);
                }(item);
            } else {
                alert("Local Storage is not supported on your browser");

            }
            */
        }
    },

    setItem: {
        value: function(item, value) {
            if (window.localStorage) {
                window.localStorage.setItem(item, JSON.stringify(value));
                return true;
            } else {
                alert("Local Storage is not supported on your browser");
                return false;
            }
        }
    }

});