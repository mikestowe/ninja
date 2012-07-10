/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage =           require("montage/core/core").Montage,
    Component =         require("montage/ui/component").Component,
    FileIo =            require("js/io/system/fileio").FileIo,
    ProjectIo =         require("js/io/system/projectio").ProjectIo,
    TemplateMediator =  require("js/document/mediators/template").TemplateDocumentMediator;
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
    parseToTemplate: {
        value: function(content, template) {
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
                switch (this.fio.newFile({ uri: file, contents: this.parseToTemplate(xhr.response, template) })) {
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
            } else {
                result = { status: 500, success: false, uri: file };
            }
            //Sending result to callback if requested for handling
            if (callback) callback(result);
            //Codes
            //  204: File exists | 400: File exists
            //  201: File succesfully created | 500: Unknown (Probably cloud API not running)
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
    //TODO: Optimize
    fileSave: {
        value: function (doc, callback, libCopyCallback) {
            //
            var content, parsedDoc, save;
            //
            switch (doc.mode) {
                case 'html':
                    //Getting content from function to properly handle saving assets (as in external if flagged)
                    if (doc.template && (doc.template.type === 'banner' || doc.template.type === 'animation')) {
                        parsedDoc = this.tmplt.parseNinjaTemplateToHtml(true, doc, true, libCopyCallback);
                    } else {
                        parsedDoc = this.tmplt.parseNinjaTemplateToHtml(true, doc, false, libCopyCallback);
                    }
                    break;
                default:
                    content = doc.content;
                    break;
            }
            if (parsedDoc) {
                //Making call to save file
                save = this.fio.saveFile({uri: doc.file.uri, contents: parsedDoc.content});
                //Checking for callback
                if (callback) callback(save);
                //Checking for libraries, making callback if specified
                if (!parsedDoc.libs && libCopyCallback) libCopyCallback(true);
                //
                return {montageId: parsedDoc.montageId, canvasId: parsedDoc.canvasId};
            } else {
                //Making call to save file
                save = this.fio.saveFile({uri: doc.file.uri, contents: content});
                //Checking for callback
                if (callback) callback(save);
                //
                return null;
            }
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
    },
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    createFileFromBinary:{
        enumerable: false,
        value: function(blob, callback){
            var reader = new FileReader(), file = reader.readAsArrayBuffer(blob), url, uri, dir, save, counter, tempName, element, rules, fileName, fileNameOverride,
                rootUrl = this.application.ninja.coreIoApi.rootUrl+escape((this.application.ninja.documentController.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1])),
                rootUri = this.application.ninja.documentController.documentHackReference.root;

            reader.fileName = blob.name, reader.fileType = blob.type, reader.rootUrl = rootUrl, reader.rootUri = rootUri;
            if(callback && callback.position){reader.filePosition = callback.position;}

            reader.onload = function (e) {
                if(e.currentTarget.fileType.indexOf('image') !== -1 ){
                    if (this.application.ninja.coreIoApi.directoryExists({uri: e.currentTarget.rootUri+'images'}).status === 204) {
                        uri = e.currentTarget.rootUri+'images';
                        url = e.currentTarget.rootUrl+'images';
                    } else if (this.application.ninja.coreIoApi.directoryExists({uri: e.currentTarget.rootUri+'img'}).status === 204) {
                        uri = e.currentTarget.rootUri+'img';
                        url = e.currentTarget.rootUrl+'img';
                    } else {
                        dir = this.application.ninja.coreIoApi.createDirectory({uri: e.currentTarget.rootUri+'images'});
                        if (dir.success && dir.status === 201) {
                            uri = e.currentTarget.rootUri+'images';
                            url = e.currentTarget.rootUrl+'images';
                        } else {
                            //TODO: HANDLE ERROR ON CREATING FOLDER
                        }
                    }
                    //fileName is undefined while pasting image from clipboard
                    fileNameOverride = e.currentTarget.fileName ? e.currentTarget.fileName : ("image." + e.currentTarget.fileType.substring((e.currentTarget.fileType.indexOf("/")+1), e.currentTarget.fileType.length));//like image.png

                    if (this.application.ninja.coreIoApi.fileExists({uri: uri+'/'+fileNameOverride}).status === 404) {
                        save = this.application.ninja.coreIoApi.createFile({uri: uri+'/'+fileNameOverride, contents: e.currentTarget.result, contentType: e.currentTarget.fileType});
                        fileName = fileNameOverride;
                    } else {
                        counter = 1;
                        tempName = fileNameOverride.split('.'+(fileNameOverride.split('.')[fileNameOverride.split('.').length-1]))[0];
                        tempName += '_'+counter+'.'+(fileNameOverride.split('.')[fileNameOverride.split('.').length-1]);
                        while (this.application.ninja.coreIoApi.fileExists({uri: uri+'/'+tempName}).status !== 404) {
                            counter++;
                            tempName = fileNameOverride.split('.'+(fileNameOverride.split('.')[fileNameOverride.split('.').length-1]))[0];
                            tempName += '_'+counter+'.'+(fileNameOverride.split('.')[fileNameOverride.split('.').length-1]);
                        }
                        save = this.application.ninja.coreIoApi.createFile({uri: uri+'/'+tempName, contents: e.currentTarget.result, contentType: e.currentTarget.fileType});
                        fileName = tempName;
                    }

                    if(callback && callback.addFileToStage && (typeof callback.addFileToStage === "function")){
                        callback.addFileToStage({"save": save, "url": url, "filename":  fileName, "filePosition": e.currentTarget.filePosition, "fileType":e.currentTarget.fileType});
                    }

                }else{
                    //TODO: HANDLE NOT AN IMAGE
                }
            }.bind(this);

        }
    }
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
