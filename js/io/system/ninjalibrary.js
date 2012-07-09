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
var Montage = require("montage/core/core").Montage;
////////////////////////////////////////////////////////////////////////
//
exports.NinjaLibrary = Montage.create(Object.prototype, {
    ////////////////////////////////////////////////////////////////////
    //
    _chromeApi: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    chromeApi: {
        get: function() {return this._chromeApi;},
        set: function(value) {this._chromeApi = value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _coreApi: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    coreApi: {
        get: function() {return this._coreApi;},
        set: function(value) {this._coreApi = value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _libs: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    libs: {
        get: function() {return this._libs;},
        set: function(value) {this._libs = value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _libsToSync: {
        value: 0
    },
    ////////////////////////////////////////////////////////////////////
    //
    _syncedLibs: {
        value: 0
    },
    ////////////////////////////////////////////////////////////////////
    //
    copyLibToCloud: {
        value: function (path, libName, callback) {
            var libCheck = this.coreApi.directoryExists({uri: path+libName});
            //Checking for library to exists
            if(libCheck.status === 404) {
                //Getting contents to begin copying
                this.chromeApi.directoryContents(this.chromeApi.fileSystem.root, function (contents) {
                    for (var i in contents) {
                        if (libName === contents[i].name) {
                            //Getting contents of library to be copied
                            this.chromeApi.directoryContents(contents[i], function (lib) {
                                //Copying to cloud
                                if (callback) {
                                    this.copyDirectoryToCloud(path, contents[i], path, {total: 0, copied: 0, callback: callback.bind(this)});
                                } else {
                                    this.copyDirectoryToCloud(path, contents[i], path, {total: 0, copied: 0});
                                }
                            }.bind(this));
                            break;
                        }
                    }
                }.bind(this));
            } else if (libCheck.status === 204){
                //Already present, so sending success
                if (callback) callback(true);
            } else {
                if (callback) callback(false);
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    copyDirectoryToCloud: {
        value: function(root, folder, fileRoot, tracking) {
            //Setting up directory name
            if (folder.name) {
                var dir;
                if (root) {
                    dir = root+'/'+folder.name;
                } else {
                    dir = folder.name;
                }
                //Creating directory
                if (!this.coreApi.createDirectory({uri: dir.replace(/\/\//gi, '/')})) {
                    //Error occured while creating folders
                    return; //TODO: Add error handling
                }
            }
            //Checking for directory
            if (folder.isDirectory) {
                //Using Chrome API to get directory contents
                this.chromeApi.directoryContents(folder, function (contents) {
                    //Looping through children of directory to copy
                    for (var i in contents) {
                        //Checking for file or directory
                        if (contents[i].isDirectory) {
                            //Recursive call if directory
                            this.copyDirectoryToCloud(dir, contents[i], fileRoot, tracking);
                        } else if (contents[i].isFile){
                            //
                            tracking.total++;
                            //Copying file
                            this.chromeApi.fileContent(contents[i].fullPath, function (result) {
                                //Using binary when copying files to allow images and such to work
                                var file = this.coreApi.createFile({uri: (fileRoot+result.file.fullPath).replace(/\/\//gi, '/'), contents: result.content});
                                //Checking for file copy success
                                if (file.status === 201) {
                                    tracking.copied++;
                                } else {
                                    //Error
                                    tracking.callback(false);
                                }
                                //Checking for all files to be copied to make callback
                                if (tracking.copied === tracking.total && tracking.callback) {
                                    tracking.callback(true);
                                }
                            }.bind(this));
                        }
                    }
                }.bind(this));
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    synchronize: {
        value: function(chromeLibs, chrome) {
            //TODO: Remove
            window.wipeLibrary = this.deleteLibraries.bind(this);
            //Getting instance of browser file API
            this.chromeApi = chrome;
            //Local variables
            var i, l, libs, libjson, xhr = new XMLHttpRequest(), tocopylibs = [];
            //Getting known json list of libraries to copy to chrome (will be on a CDN later)
            xhr.open("GET", '/js/io/system/ninjalibrary.json', false);
            xhr.send();
            //Checkng for correct reponse
            if (xhr.readyState === 4) {
                //Parsing json libraries
                libs = JSON.parse(xhr.response);
                //Storing JSON data
                this.libs = libs.libraries;
                //Checking for preview libraries to avoid duplicates
                if (chromeLibs.length > 0) {
                    //Looping through libraries on browser file system
                    for (i=0; chromeLibs[i]; i++) {
                        for (var j in libs.libraries) {
                            //Checking for matching names (directories are libraries names)
                            if (String(libs.libraries[j].name+libs.libraries[j].version).toLowerCase() !== chromeLibs[i]) {
                                //Checking for library to be single file (special case)
                                 if (libs.libraries[j].file) {
                                    tocopylibs.push({name: String(libs.libraries[j].name+libs.libraries[j].version).toLowerCase(), path: libs.libraries[j].path, file: libs.libraries[j].file});
                                } else {
                                    tocopylibs.push({name: String(libs.libraries[j].name+libs.libraries[j].version).toLowerCase(), path: libs.libraries[j].path});
                                }
                            }
                        }
                    }

                } else {
                    //No library is present, must copy all
                    for (var j in libs.libraries) {
                        //name:     used to folder container contents
                        //path:     url of descriptor json or single file to load (descriptor has list of files)
                        //singular: indicates the path is the file to be loaded into folder
                        if (libs.libraries[j].file) {
                            tocopylibs.push({name: String(libs.libraries[j].name+libs.libraries[j].version).toLowerCase(), path: libs.libraries[j].path, file: libs.libraries[j].file});
                        } else {
                            tocopylibs.push({name: String(libs.libraries[j].name+libs.libraries[j].version).toLowerCase(), path: libs.libraries[j].path});
                        }
                    }
                }
                //Storing list of libraries to copy
                this._libsToSync = tocopylibs.length;
                //Check to see if libraries are needed to be copied
                if (tocopylibs.length > 0) {
                    for (i=0; tocopylibs[i]; i++) {
                        //Checking for library to be single file
                        if (tocopylibs[i].file) {
                            //Creating root folder
                            this.chromeApi.directoryNew('/'+tocopylibs[i].name);
                            //Getting file contents
                            xhr = new XMLHttpRequest();
                            xhr.open("GET", tocopylibs[i].path, false);
                            xhr.responseType = "arraybuffer";
                            xhr.send();
                            //Checking for status
                            if (xhr.readyState === 4) {
                                //Creating new file from loaded content
                                this.chromeApi.fileNew('/'+tocopylibs[i].name+'/'+tocopylibs[i].file, xhr.response, function (status) {if(status) this.libraryCopied()}.bind(this));
                            } else {
                                //TODO: Add error handling
                            }
                        } else {
                            //Creating root folder
                            this.chromeApi.directoryNew('/'+tocopylibs[i].name);
                            //Getting file contents
                            xhr = new XMLHttpRequest();
                            xhr.open("GET", tocopylibs[i].path, false);
                            xhr.send();
                            //Checking for status
                            if (xhr.readyState === 4) {
                                //Parsing JSON data of files to copy
                                libjson = JSON.parse(xhr.response);
                                //Looping through list
                                for (l=0; libjson.directories[l]; l++) {
                                    //Initializing defaults
                                    libjson.dirsToCreate = libjson.directories.length;
                                    libjson.dirsCreated = 0;
                                    libjson.filesToCreate = libjson.files.length;
                                    libjson.filesCreated = 0;
                                    libjson.local = tocopylibs[i].name;
                                    libjson.main = this;
                                    //Looping through list and creating directories first
                                    this.createDirectory(tocopylibs[i].name, libjson.directories[l], function (status) {
                                        //Checking for success on directories created
                                        if (status) {
                                            this.dirsCreated++;
                                        }
                                        //All directories created
                                        if (this.dirsCreated === this.dirsToCreate) {
                                            var xhr, i;
                                            //Looping through files to copy now that directories are ready
                                            for (i=0; this.files[i]; i++) {
                                                xhr = new XMLHttpRequest();
                                                xhr.open("GET", this.root+this.files[i], false);
                                                xhr.responseType = "arraybuffer";
                                                xhr.send();
                                                //Checking for status
                                                if (xhr.readyState === 4) {
                                                    this.main.chromeApi.fileNew(this.local+'/'+this.files[i], xhr.response, function (status) {
                                                        if (status) {
                                                            this.filesCreated++;
                                                        }
                                                        if (this.filesCreated === this.filesToCreate) {
                                                            this.main.libraryCopied();
                                                        }
                                                    }.bind(this));
                                                }
                                            }
                                        }
                                    }.bind(libjson));
                                }
                            } else {
                                //TODO: Add error handling
                            }
                        }
                    }
                } else {
                    //Dispatching ready event since nothing to copy
                    this._dispatchEvent();
                }
            } else {
                //TODO: Add error handling
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Creating a directory on the file system (and sub directories if nested)
    createDirectory: {
        value: function(root, folder, callback) {
            //Checking for name, establishing format
            if (folder.name) {
                if (root) {
                    dir = root+'/'+folder.name;
                } else {
                    dir = folder.name;
                }
                //Creating directory
                this.chromeApi.directoryNew(dir, function (status) {if (callback)callback(status)});
            }
            //Checking for children and making recursive calls if needed
            if (folder.children) {
                for (var j in folder.children) {
                    if (root) {
                        this.createDirectory(root+'/'+folder.name, folder.children[j]);
                    } else {
                        this.createDirectory(folder.name, folder.children[j]);
                    }
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Callback to keep track of copied libraries during sync
    libraryCopied: {
        value: function() {
            this._syncedLibs++;
            if (this._syncedLibs === this._libsToSync) {
                this._dispatchEvent();
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Method to remove libraries copied into browser file system (ALL)
    deleteLibraries: {
        value: function () {
            //Used by file system API to callback
            function parseLibrary (contents) {
                //Looping through contents to delete
                for(var i=0; contents[i]; i++) {
                    //Deleting entire directies (no single files are copied outside)
                    if (contents[i].isDirectory) {
                        this.chromeApi.directoryDelete(contents[i].name);
                    } else {
                        //TODO: Handle single files
                    }
                }
            };
            //Making call to file system API to get all libraries (files) on file system
            this.chromeApi.directoryContents(this.chromeApi.fileSystem.root, parseLibrary.bind(this));
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _dispatchEvent: {
        value: function () {
            var syncEvent = document.createEvent("CustomEvent");
            syncEvent.initEvent('sync', true, true);
            this.dispatchEvent(syncEvent);
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
