/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

//BaseDocument Object for all files types and base class for HTML documents.

var Montage = require("montage/core/core").Montage;

var BaseDocument = exports.BaseDocument = Montage.create(Montage, {
    /** Private Members **/
    _name: { value: null, enumerable: false },
    _uri: { value: null, enumerable: false },
    _documentType: { value: null, enumerable: false },
    _container: {value: null, enumerable: false },
    _uuid: { value: null, enumerable: false },
    _isActive: { value: true, enumerable: false },
    _dirtyFlag: { value: false, enumerable: false },
    _callback: { value: null, enumerable: false },
    _currentView: { value: null, enumerable: false},

    /** Getters/Setters **/
    name: {
        get: function() { return this._name; },
        set: function(value) { this._name = value; }
    },

    uri: {
        get: function() { return this._uri; },
        set: function(value) { this._uri = value; }
    },

    documentType: {
        get: function() { return this._documentType; },
        set: function(value) { this._documentType = value;  }
    },

    container: {
        get: function() { return this._container; },
        set: function(value) { this._container = value; }
    },

    uuid: {
        get: function() { return this._uuid; },
        set: function(value) { this._uuid = value; }
    },

    isActive: {
        get: function() { return this._isActive; },
        set: function(value) { this._isActive = value; }
    },

    dirtyFlag: {
        get: function() { return this._dirtyFlag; },
        set: function(value) { this._dirtyFlag = value; }
    },

    callback: {
        get: function() { return this._callback; },
        set: function(value) { this._callback = value; }
    },

    currentView: {
        get: function() { return this._currentView; },
        set: function(value) { this._currentView = value }
    },

    /** Base Methods **/
    init: {
        value: function(name, uri, type, container, uuid, callback) {
            this.name = name;
            this.uri = uri;
            this.documentType = type;
            this.container = container;
            this.uuid = uuid;
            this.callback = callback;
        }
    },

    loadDocument: {
        value: function() {
            // Have the XHR here?
        }
    }


});