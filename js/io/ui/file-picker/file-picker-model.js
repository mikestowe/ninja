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

var filePickerControllerModule = require("js/io/ui/file-picker/file-picker-controller");

//this is per file picker instance
exports.FilePickerModel = (require("montage/core/core").Montage).create(require("montage/ui/component").Component, {

    fatalError:{
         writable:true,
         enumerable:true,
         value:null
    },

    _fileFilters:{
            writable:true,
            enumerable:false,
            value:null
        },
        fileFilters:{
            get:function(){
                return this._fileFilters;
            },
            set:function(value){
                this._fileFilters = value;
            }
        },
        _currentFilter:{
            writable:true,
            enumerable:false,
            value:null
        },
        currentFilter:{
            get:function(){
                return this._currentFilter;
            },
            set:function(value){
                this._currentFilter = value;
            }
        },

        /**
         * true -> file selection mode
         * false -> directory selection mode
         */
        inFileMode:{
            writable:true,
            enumerable:false,
            value:null
        },

    /**
     * pickerMode: ["read", "write"] : specifies if the file picker is opened to read a file/folder or to save a file
     */
        pickerMode:{
            writable:true,
            enumerable:false,
            value:null
        },

        topLevelDirectories:{
            writable:true,
            enumerable:true,
            value:[]
        },

        currentRoot:{
            writable:true,
            enumerable:true,
            value:""
        },

        currentLogicalDrive:{
            writable:true,
            enumerable:true,
            value:""
        },

        callback:{
            writable:true,
            enumerable:true,
            value:null
        },

        callbackScope:{
            writable:true,
            enumerable:true,
            value:null
        },

        /**
         * stores the previously viewed directory uris in an array [FILO] per file picker instance
         */
        _history:{
            writable:true,
            enumerable:true,
            value:[]//array of visited URIs for the back/forward arrows
        },

    /**
     * store history of folders navigated if it was already not visited last
     */
        storeHistory:{
            writable:false,
            enumerable:true,
            value:function(uri){
                //remove redundant / at end
//                uri = new String(uri);
//                if((uri.charAt(uri.length - 1) === "/") || (uri.charAt(uri.length - 1) === "\\")){
//                    uri = uri.substring(0, (uri.length - 1));
//                }
                //console.log("storeHistory: "+uri);
                if(uri && (uri !== this._history[this._history.length -1]) && (!!filePickerControllerModule.FilePickerController._directoryContentCache[uri]) && (filePickerControllerModule.FilePickerController._directoryContentCache[uri].type === "directory")){
                    //remove history after current pointer
                    if(this._history.length >0){
                        this._history.splice((this.currentHistoryPointer+1), (this._history.length - this.currentHistoryPointer - 1));
                    }
                    //now add the new state
                    this._history.push(uri);
                    this.currentHistoryPointer = this._history.length -1;
                    //console.log("### stored: "+uri+" : pointer="+this.currentHistoryPointer);
                }
            }
        },

        currentHistoryPointer:{
            writable:true,
            enumerable:true,
            value:-1
        }
});
