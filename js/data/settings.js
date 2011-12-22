/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component       = require("montage/ui/component").Component,
    LocalStorage    = require("js/controllers/local-storage-controller").LocalStorage;

exports.Settings = Montage.create( Component, {

    version: {
        value: "11.1213"
    },

    _settings: {
        value: null
    },

    settings: {
        get: function() { return this._settings; },
        set: function(value) { this._settings = value; }
    },

    getSetting: {
        value: function(objName, fieldName, namespace) {
            try {
                objName = objName.replace(/-/gi, "_").replace(/\//gi, "zzSlash");
                return this.settings[objName][fieldName];
            } catch(e) {
                return null;
            }
        }
    },

    setSetting: {
        value: function(objName, fieldName, value, namespace) {
            try {
                objName = objName.replace(/-/gi, "_").replace(/\//gi, "zzSlash");

                if(this.settings === null) {
                    this.settings = {};
                }

                if (this.settings[objName] == null) {
                    this.settings[objName] = {};
                }

                this.settings[objName][fieldName] = value;

                LocalStorage.setItem("settings", this.settings);
            } catch(e) {
                return null;
            }
        }
    },
    
    deserializedFromSerialization: {
        value: function() {

            if (LocalStorage.getItem("version") != this.version) {
                this.settings = {}
                LocalStorage.setItem("version",this.version);
            } else {
                this.settings = LocalStorage.getItem("settings");
            }

        }
    }
});