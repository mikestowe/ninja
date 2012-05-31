/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 	require("montage/core/core").Montage,
	Component = require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//	
exports.UrlParser = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
	//
	parseStyleUrls: {
        value: function (css, href, local) {
        	//
        	if (local) {
        		var fileCouldDirUrl = href.split(href.split('/')[href.split('/').length-1])[0];
        	} else {
        		//TODO: Add logic for external URLs
        	}
        	//TODO: Clean up functions
        	css = css.replace(/url\(()(.+?)\1\)/g, parseToNinjaUrl.bind(this));
			//
			function parseToNinjaUrl (prop) {
				//
				return prop.replace(/[^()\\""\\'']+/g, prefixWithNinjaUrl.bind(this));
			}
			//
			function prefixWithNinjaUrl (url) {
				//
				if (url !== 'url' && !url.match(/(\b(?:(?:https?|ftp|file|[A-Za-z]+):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))/gi)) {
					url = fileCouldDirUrl+url;
				}
				//
				return url;
			}
			//
			return css;
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
	loadLocalStyleSheet: {
        value: function (href) {
        	//Getting file URI (not URL since we must load through I/O API)
			var css = {}, file;
			css.cssUrl =  href.split(this.application.ninja.coreIoApi.rootUrl)[1];
			css.fileUri = this.application.ninja.coreIoApi.cloudData.root + css.cssUrl;
			//Loading data from CSS file
			file = this.application.ninja.coreIoApi.readFile({uri: css.fileUri});
			//Checking for file to be writable on disk
			css.writable = JSON.parse(this.application.ninja.coreIoApi.isFileWritable({uri: css.fileUri}).content).readOnly;
			//Returning loaded file
			if (file && file.content) {
				//Getting file contents
				css.content = this.parseStyleUrls(file.content, href, true);
				//Returning CSS object
				return css;
			} else {
				return false;
			}
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
	loadExternalStyleSheet: {
        value: function (href) {
        	//Loading external file
        	var file = this.application.ninja.coreIoApi.readExternalFile({url: href, binary: false});
        	//Returning file
        	return file;
        }
    }
	////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////