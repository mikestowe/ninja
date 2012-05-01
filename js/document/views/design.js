/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 			require("montage/core/core").Montage,
	BaseDocumentView = 	require("js/document/views/base").BaseDocumentView;
////////////////////////////////////////////////////////////////////////
//	
exports.DesignDocumentView = Montage.create(BaseDocumentView, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
	//
    _callback: {
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
	_document: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
	content: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
    document: {
        get: function() {return this._document;},
        set: function(value) {this._document = value;}
    },
    ////////////////////////////////////////////////////////////////////
	//
	initiliaze: {
        value: function (parent) {
        	//
        	this.iframe = document.createElement("iframe");
        	//
        	this.iframe.style.border = "none";
            this.iframe.style.background = "#FFF";
            this.iframe.style.height = "100%";
            this.iframe.style.width = "100%";
            //
            return parent.appendChild(this.iframe);
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
	render: {
        value: function (callback) {
        	//
        	this._callback = callback;
        	this.iframe.addEventListener("load", this.onTemplateLoad.bind(this), true);
        	this.iframe.src = "js/document/templates/montage-web/index.html";
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    onTemplateLoad: {
        value: function (e) {
        	//
        	this.document = this.iframe.contentWindow.document;
        	//
        	
        	
        	
        	
        	//this.document.head.innerHTML += this.content.head;
        	this.document.body.innerHTML = this.content.head + this.content.body;
        	
        	
        	
        	
        	//
        	if (this._callback) this._callback();
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    initCss: {
        value: function () {
        	//
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    initWebGl: {
        value: function () {
        	//
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    initMontage: {
        value: function () {
        	//
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    getElementFromPoint: {
        value: function(x, y) {
            return this.iframe.contentWindow.getElement(x,y);
        }
    },
	////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////