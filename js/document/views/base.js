/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 	require("montage/core/core").Montage,
	Component = require("montage/ui/component").Component,
	UrlParser = require("js/document/helpers/url-parser").UrlParser;
////////////////////////////////////////////////////////////////////////
//	
exports.BaseDocumentView = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
	//
	urlParser: {
        value: UrlParser
    },
	////////////////////////////////////////////////////////////////////
	//
	_iframe: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//TODO: This should be renamed to better illustrate it's a container (iframe for design, div for code view)
	iframe: {
		get: function() {return this._iframe;},
        set: function(value) {this._iframe= value;}
    },
   	////////////////////////////////////////////////////////////////////
	//
	show: {
        value: function (callback) {
        	if (this.iframe) {
        		this.iframe.style.display = 'block';
                this.iframe.style.opacity = 1;
                this.toggleWebGlAnimation(true);
        	} else {
        		console.log('Error: View has no iframe to show!');
        	}
        	//
        	if (callback) callback();
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
	hide: {
        value: function (callback) {
        	if (this.iframe) {
        		this.iframe.style.display = 'none';
                this.iframe.style.opacity = 0;
                this.pauseVideos();
                this.toggleWebGlAnimation(false);
        	} else {
        		console.log('Error: View has no iframe to hide!');
        	}
        	//
        	if (callback) callback();
        }
    }
	////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////