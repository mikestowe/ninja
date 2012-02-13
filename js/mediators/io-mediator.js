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
    				file.document.content.document.body.innerHTML = file.body;
    				file.document.content.document.head.innerHTML = file.head;
    				contents = file.document.content.document.documentElement.outerHTML;
    				break;
    			default:
    				break;
    		}
    		//
    		save = this.fio.saveFile({uri: file.document.uri, contents: contents})
    		console.log(save);
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
    }
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////