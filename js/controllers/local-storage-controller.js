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
                this._getItem = function() {
                    console.log("Local Storage is not supported on your browser");
                    return "";
                };

                this._setItem = function() {
                    console.log("Local Storage is not supported on your browser");
                    return false;
                }
            }
        }
    },

    _getItem: {
        value: function(key) {
            var value = window.localStorage.getItem("ninja-" + key);
            if(value !== null) value = JSON.parse(value);

            return value;
        }
    },

    _setItem: {
        value: function(key, value) {
            window.localStorage.setItem("ninja-" + key, JSON.stringify(value));
        }
    },

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