/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

/* /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
NOTES:

    For newFile, only the 'uri' is required, if contents is empty, such
    empty file will be created. 'contents' should be a string to be saved
    as the file. 'contentType' is the mime type of the file.

    Core API reference in NINJA: this.application.ninja.coreIoApi

////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////// */
//
var Montage =   require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//Exporting as File I/O
exports.FileIo = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //Creating new file
    newFile: {
        enumerable: true,
        value: function(file) {
            //Checking for API to be available
            if (!this.application.ninja.coreIoApi.cloudAvailable()) {
                //API not available, no IO action taken
                return null;
            }
            //Peforming check for file to exist
            var check = this.application.ninja.coreIoApi.fileExists({uri: file.uri}), status, create;
            //Upon successful check, handling results
            if (check.success) {
                //Handling status of check
                switch (check.status) {
                    case 204:
                        //Storing status to be returned (for UI handling)
                        status = check.status;
                        break;
                    case 404:
                        //File does not exists, ready to be created
                        create = this.application.ninja.coreIoApi.createFile(file);
                        status = create.status;
                        break;
                    default:
                        //Unknown Error
                        status = 500;
                        break;
                }
            } else {
                //Unknown Error
                status = 500;
            }
            //Returning resulting code
            return status;
            //  204: File exists (not created) | 400: File exists | 404: File does not exists
            //  201: File succesfully created | 500: Unknown
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Reading contents from file
    readFile: {
        enumerable: true,
        value: function(file) {
            //Checking for API to be available
            if (!this.application.ninja.coreIoApi.cloudAvailable()) {
                //API not available, no IO action taken
                return null;
            }
            //Peforming check for file to exist
            var check = this.application.ninja.coreIoApi.fileExists({uri: file.uri}), status, create, result;
            //Upon successful check, handling results
            if (check.success) {
                //Handling status of check
                switch (check.status) {
                    case 204:
                        //File exists
                        result = {};
                        result.content = this.application.ninja.coreIoApi.readFile(file).content;
                        result.details = this.infoFile(file);
                        status = check.status;
                        break;
                    case 404:
                        //File does not exists
                        status = check.status;
                        break;
                    default:
                        //Unknown Error
                        status = 500;
                        break;
                }
            } else {
                //Unknown Error
                status = 500;
            }
            //Returning status and result (null if none)
            return {status: status, file: result};
            //Status Codes
            //  204: File exists | 404: File does not exists | 500: Unknown
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Saving file (existing file or creates and saves if none exists)
    saveFile: {
        enumerable: true,
        value: function(file) {
            //Checking for API to be available
            if (!this.application.ninja.coreIoApi.cloudAvailable()) {
                //API not available, no IO action taken
                return null;
            }
            //Peforming check for file to exist
            var check = this.application.ninja.coreIoApi.fileExists({uri: file.uri}), status, result;
            //Upon successful check, handling results
            if (check.success) {
                //Handling status of check
                switch (check.status) {
                    case 204:
                        //File exists
                        result = this.application.ninja.coreIoApi.updateFile(file);
                        status = 204;
                        break;
                    case 404:
                        //File does not exists, ready to be created
                        result = this.application.ninja.coreIoApi.createFile(file);
                        status = 404;
                        break;
                    default:
                        //Unknown Error
                        status = 500;
                        break;
                }
            } else {
                //Unknown Error
                status = 500;
            }
            //Returning status and result (null if none)
            return {status: status, result: result};
            //Status Codes
            //  204: File exists | 404: File does not exists | 500: Unknown
        }
    },
    ////////////////////////////////////////////////////////////////////
    //TODO: Add functionality
    deleteFile: {
        enumerable: true,
        value: function() {
            //Checking for API to be available
            if (!this.application.ninja.coreIoApi.cloudAvailable()) {
                //API not available, no IO action taken
                return null;
            }
            //
        }
    },
    ////////////////////////////////////////////////////////////////////
    //TODO: Add functionality
    copyFile: {
        enumerable: true,
        value: function() {
            //Checking for API to be available
            if (!this.application.ninja.coreIoApi.cloudAvailable()) {
                //API not available, no IO action taken
                return null;
            }
            //
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    infoFile: {
        enumerable: true,
        value: function(file) {
            //Checking for API to be available
            if (!this.application.ninja.coreIoApi.cloudAvailable()) {
                //API not available, no IO action taken
                return null;
            }
            //
            var check = this.application.ninja.coreIoApi.fileExists({uri: file.uri}), details;
            //
            if (check.success) {
                //Handling status of check
                switch (check.status) {
                    case 204:
                        //File exists
                        details = JSON.parse(this.application.ninja.coreIoApi.isFileWritable(file).content);
                        details.uri = file.uri;
                        details.name = this.getFileNameFromPath(file.uri);
                        details.extension = details.name.split('.')[details.name.split('.').length-1];
                        details.status = 204;
                        break;
                    case 404:
                        //File does not exists, ready to be created
                        details = {status: 404, uri: file.uri, name: this.getFileNameFromPath(file.uri)};
                        break;
                    default:
                        //Unknown Error
                        details = {status: 500, uri: file.uri, name: this.getFileNameFromPath(file.uri)};
                        break;
                }
            } else {
                //Unknown Error
                details = {status: 500, uri: file.uri, name: this.getFileNameFromPath(file.uri)};
            }
            return details;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    getFileNameFromPath : {
        value: function(path) {
            path = path.replace(/[/\\]$/g,"");
            path = path.replace(/\\/g,"/");
            return path.substr(path.lastIndexOf('/') + 1);
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
