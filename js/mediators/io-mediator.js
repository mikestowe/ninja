/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 			require("montage/core/core").Montage,
	Component = 		require("montage/ui/component").Component,
	FileIo = 			require("js/io/system/fileio").FileIo,
	ProjectIo = 		require("js/io/system/projectio").ProjectIo,
	TemplateMediator = 	require("js/document/mediators/template").TemplateDocumentMediator;
////////////////////////////////////////////////////////////////////////
//
exports.IoMediator = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //
    hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    deserializedFromTemplate: {
        value: function () {
            //
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    tmplt: {
        value: TemplateMediator
    },
    ////////////////////////////////////////////////////////////////////
    //
    fio: {
        value: FileIo
    },
    ////////////////////////////////////////////////////////////////////
    //
    pio: {
        value: ProjectIo
    },
    ////////////////////////////////////////////////////////////////////
    //
    fileNew: {
        value: function (file, url, callback, template) {
            //Loading template from template URL
            var xhr = new XMLHttpRequest(), result;
            xhr.open("GET", url, false);
            xhr.send();
            if (xhr.readyState === 4) {
                //Making call to create file, checking for return code
                switch (this.fio.newFile({ uri: file, contents: parseTemplate(xhr.response, template) })) {
                    case 201:
                        result = { status: 201, success: true, uri: file };
                        break;
                    case 204:
                        result = { status: 204, success: false, uri: file };
                        break;
                    case 400:
                        result = { status: 400, success: false, uri: file };
                        break;
                    default:
                        result = { status: 500, success: false, uri: file };
                        break;
                }
                //TODO: Improve template data injection
                function parseTemplate (content, template) {
                	//
                	if (template.name.toLowerCase() === 'banner' || template.name.toLowerCase() === 'animation') {
                		//Getting dimensions of banner
                		var dimensions = template.id.split('x');
                		dimensions = {width: String(dimensions[0])+'px', height: String(dimensions[1])+'px'};
                		//
                		content = content.replace(/Dimensions@@@/gi, "Dimensions@@@"+template.id);
                		content = content.replace(/ninja-banner {}/gi, "ninja-banner {overflow: visible; width: "+dimensions.width+"; height: "+dimensions.height+"}");
                		content = content.replace(/ninja-content-wrapper {}/gi, "ninja-content-wrapper {overflow: hidden; width: "+dimensions.width+"; height: "+dimensions.height+"}");
                	}
                	//
                	return content;
                }
            } else {
                result = { status: 500, success: false, uri: file };
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
        value: function (file, callback) {
            //Reading file (Ninja doesn't really open a file, all in browser memory)
            var read = this.fio.readFile({ uri: file }), result;
            //Checking for status
            switch (read.status) {
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
                        result.content = this.tmplt.parseHtmlToNinjaTemplate(read.file.content);
                    }
                    //Status of call
                    result.status = read.status;
                    //Calling back with result
                    if (callback) callback(result);
                    break;
                case 404:
                    //File does not exists
                    if (callback) callback({ status: read.status });
                    break;
                default:
                    //Unknown
                    if (callback) callback({ status: 500 });
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
        value: function (doc, callback) {
            //
            var contents, save;
            //
            switch (doc.mode) {
                case 'html':
                    //Getting content from function to properly handle saving assets (as in external if flagged)
                    if (doc.template && (doc.template.type === 'banner' || doc.template.type === 'animation')) {
                    	contents = this.tmplt.parseNinjaTemplateToHtml(doc, true);
                    } else {
                    	contents = this.tmplt.parseNinjaTemplateToHtml(doc);
                    }
                    break;
                default:
                    contents = doc.content;
                    break;
            }
            //Making call to save file
            save = this.fio.saveFile({ uri: doc.file.uri, contents: contents });
            //Checking for callback
            if (callback) callback(save);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    fileSaveAs: {
        enumerable: false,
        value: function (copyTo, copyFrom, callback) {
            //TODO: Implement Save As functionality
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    fileDelete: {
        enumerable: false,
        value: function (file, callback) {
            //TODO: Implement Delete functionality
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////