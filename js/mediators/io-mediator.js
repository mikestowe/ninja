/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 	require("montage/core/core").Montage,
	Component = require("montage/ui/component").Component,
	FileIo = 	require("js/io/system/fileio").FileIo,
	ProjectIo = require("js/io/system/projectio").ProjectIo;
////////////////////////////////////////////////////////////////////////
//
exports.IoMediator = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
		enumerable: false,
        value: false
    },
	////////////////////////////////////////////////////////////////////
    //
	deserializedFromTemplate: {
		enumerable: false,
		value: function () {
			//
		}
	},
	////////////////////////////////////////////////////////////////////
    //
    fio: {
    	enumerable: false,
    	value: FileIo
    },
    ////////////////////////////////////////////////////////////////////
    //
    pio: {
    	enumerable: false,
    	value: ProjectIo
    },
	////////////////////////////////////////////////////////////////////
    //
    fileNew: {
    	enumerable: false,
    	value: function (file, template, callback) {
    		//Loading template from template URL
    		var xhr = new XMLHttpRequest(), result;
    		xhr.open("GET", template, false);
            xhr.send();
    		if (xhr.readyState === 4) {
    			//Making call to create file, checking for return code
    			switch (this.fio.newFile({uri: file, contents: xhr.response})) {
    				case 201:
    					result = {status: 201, success: true, uri: file};
    					break;
    				case 204:
    					result = {status: 204, success: false, uri: file};
    					break;
    				case 400:
    					result = {status: 400, success: false, uri: file};
    					break;
    				default:
    					result = {status: 500, success: false, uri: file};
    					break;
    			}
    		} else {
    			result = {status: 500, success: false, uri: file};
    		}
    		//Sending result to callback if requested for handling
    		if (callback) callback(result);
    		//Codes
    		//	204: File exists | 400: File exists
		    //	201: File succesfully created | 500: Unknown (Probably cloud API not running)
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    fileOpen: {
    	enumerable: false,
    	value: function (file, callback) {
    		//Reading file (Ninja doesn't really open a file, all in browser memory)
    		var read = this.fio.readFile({uri: file}), result;
    		//Checking for status
    		switch(read.status) {
    			case 204:
    				//Creating and formatting result object for callbak
    				result = read.file.details;
    				result.root = read.file.details.uri.replace(read.file.details.name, "");
    				//Checking for type of content to returns
    				if (result.extension !== 'html' && result.extension !== 'htm') {
    					//Simple string
    					result.content = read.file.content;
    				} else {
    					//Object to be used by Ninja Template
						result.content = this.parseHtmlToNinjaTemplate(read.file.content);
    				}
    				//Status of call
    				result.status = read.status;
    				//Calling back with result
    				if (callback) callback(result);
    				break;
    			case 404:
    				//File does not exists
    				if (callback) callback({status: read.status});
    				break;
    			default:
    				//Unknown
    				if (callback) callback({status: 500});
    				break;
    		}
    		/*
    		////////////////////////////////////////////////////////////
    		////////////////////////////////////////////////////////////
    		//Return Object Description
    		Object.status (Always presents for handling)
    		204: File exists (Success)
    		404: File does not exists (Failure)
    		500: Unknown (Probably cloud API not running)
    		
    		(Below only present if succesfull 204)
    		
    		Object.content
    		Object.extension
    		Object.name
    		Object.uri
    		Object.creationDate
    		Object.modifiedDate
    		Object.readOnly
    		Object.size
    		////////////////////////////////////////////////////////////
    		////////////////////////////////////////////////////////////
    		*/
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    fileSave: {
    	enumerable: false,
    	value: function (file, callback) {
    		//
    		var contents, save;
    		//
    		switch (file.mode) {
    			case 'html':
    				//Copy webGL library if needed
    				if (file.webgl.length > 0) {
    					for (var i in this.application.ninja.coreIoApi.ninjaLibrary.libs) {
		    				//if (this.application.ninja.coreIoApi.ninjaLibrary.libs[i].name === 'Assets' || this.application.ninja.coreIoApi.ninjaLibrary.libs[i].name === 'RDGE') {
		    				if (this.application.ninja.coreIoApi.ninjaLibrary.libs[i].name === 'RDGE') {
    							this.application.ninja.coreIoApi.ninjaLibrary.copyLibToCloud(file.document.root, (this.application.ninja.coreIoApi.ninjaLibrary.libs[i].name+this.application.ninja.coreIoApi.ninjaLibrary.libs[i].version).toLowerCase());
    						}
    					}
    				}
    				//
    				contents = this.parseNinjaTemplateToHtml(file);
    				break;
    			default:
    				contents = file.content;
    				break;
    		}
    		//
    		save = this.fio.saveFile({uri: file.document.uri, contents: contents});
            //
            if (callback) callback(save);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    fileSaveAs: {
    	enumerable: false,
    	value: function (copyTo, copyFrom, callback) {
    		//
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    fileDelete: {
    	enumerable: false,
    	value: function (file, callback) {
    		//
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    parseHtmlToNinjaTemplate: {
    	enumerable: false,
    	value: function (html) {
    		//Creating temp object to mimic HTML
    		var doc = window.document.implementation.createHTMLDocument(), template;
    		//Setting content to temp
    		doc.getElementsByTagName('html')[0].innerHTML = html;
    		//Creating return object
    		return {head: doc.head.innerHTML, body: doc.body.innerHTML, document: doc};
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //TODO: Expand to allow more templates
    parseNinjaTemplateToHtml: {
    	enumerable: false,
    	value: function (template) {
    		//TODO: Clean up variables
    		//Injecting head and body into old document
    		template.document.content.document.body.innerHTML = template.body;
    		template.document.content.document.head.innerHTML = template.head;
    		//Getting all CSS (style or link) tags
    		var styletags = template.document.content.document.getElementsByTagName('style'),
    			linktags = template.document.content.document.getElementsByTagName('link'),
    			url = new RegExp(window.location.protocol+'//'+window.location.host+'/js/document/templates/montage-html/', 'gi');
    		//Looping through link tags and removing file recreated elements
    		for (var j in styletags) {
    			if (styletags[j].getAttribute) {
    				if(styletags[j].getAttribute('ninjauri') !== null) {
    					try {
    						//Checking head first
    						template.document.content.document.head.removeChild(styletags[j]);
    					} catch (e) {
    						try {
    							//Checking body if not in head
    							template.document.content.document.body.removeChild(styletags[j]);
    						} catch (e) {
    							//Error, not found!
    						}
    					}
    					
    				}
    			}
    		}
    		//TODO: Add logic to only enble tags we disabled
    		for (var l in linktags) {
    			if (linktags[l].getAttribute && linktags[l].getAttribute('disabled')) {
    				linktags[l].removeAttribute('disabled');
    			}
    		}
    		//Checking for type of save: styles = <style> only | css = <style> and <link> (all CSS)
    		if (template.styles) {
    			//Getting all style tags
    			var styleCounter = 0,
    				docStyles = template.document.content.document.getElementsByTagName('style');
    			//Looping through all style tags
    			for(var i in template.styles) {
    				if (template.styles[i].ownerNode) {
    					if (template.styles[i].ownerNode.getAttribute) {
    						//Checking for node not to be loaded from file
    						if (template.styles[i].ownerNode.getAttribute('ninjauri') === null) {
    							//Inseting data from rules array into tag as string
    							docStyles[styleCounter].innerHTML = this.getCssFromRules(template.styles[i].cssRules);
    							//Syncing <style> tags count since it might be mixed with <link>
    							styleCounter++;
    						}
    					}
    				}
    			}
    		} else if (template.css) {
    			//Getting all style and link tags
    			var styleCounter = 0,
    				docStyles = template.document.content.document.getElementsByTagName('style'),
    				docLinks = template.document.content.document.getElementsByTagName('link');
    			for(var i in template.css) {
    				if (template.css[i].ownerNode) {
    					if (template.css[i].ownerNode.getAttribute) {
    						if (template.css[i].ownerNode.getAttribute('ninjauri') === null) {
    							//Inseting data from rules array into <style> as string
    							docStyles[styleCounter].innerHTML = this.getCssFromRules(template.css[i].cssRules);
    							styleCounter++;
    						} else {
    							//Saving data from rules array converted to string into <link> file
    							var save = this.fio.saveFile({uri: template.css[i].ownerNode.getAttribute('ninjauri'), contents: this.getCssFromRules(template.css[i].cssRules)});
    						}
    					}
    				}
    			}
    		}
    		//
    		return template.document.content.document.documentElement.outerHTML.replace(url, '');
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //Method to return a string from CSS rules (to be saved to a file)
    getCssFromRules: {
    	enumerable: false,
    	value: function (list) {
    		//Variable to store CSS definitions
    		var i, str, url, css = '';
    		//Looping through list
    		if (list && list.length > 0) {
    			//Adding each list item to string and also adding breaks
    			for (i = 0; list[i]; i++) {
    				str = list[i].cssText+' ';
    				str = str.replace( new RegExp( "{", "gi" ), "{\n\t" );
    				str = str.replace( new RegExp( "}", "gi" ), "}\n" );
    				str = str.replace( new RegExp( ";", "gi" ), ";\n\t" );
    				css += '\n'+str;
    			}
    		}
    		//TODO: Add better logic for creating this string
    		url = new RegExp(window.location.protocol+'//'+window.location.host+'/js/document/templates/montage-html/', 'gi');
    		//Returning the CSS string
    		return css.replace(url, '');
    	}
    }
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////