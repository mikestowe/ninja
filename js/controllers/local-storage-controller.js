/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component       = require("montage/ui/component").Component;

exports.LocalStorage = Montage.create( Component, {

    canStore: {
        value: null
    },

    deserializedFromTemplate: {
        value: function() {
            this.canStore = window.localStorage;
            this.application.localStorage = this;

            // Redefine setItem and getItem if local storage is not available.
            if(!this.canStore) {
                this.getItem = function() {
                    console.log("Local Storage is not supported on your browser");
                    return "";
                };

                this.setItem = function() {
                    console.log("Local Storage is not supported on your browser");
                    return false;
                }
            }

            // Temporary clear the local storage if we find the version key
            if(window.localStorage.version) {
                window.localStorage.clear();
            }
        }
    },

    getItem: {
        value: function(key) {
            var value = window.localStorage.getItem("ninja-" + key);
            if(value !== null) value = JSON.parse(value);

            return value;
        }
    },

    setItem: {
        value: function(key, value) {
            window.localStorage.setItem("ninja-" + key, JSON.stringify(value));

            return value;
        }
    }
});