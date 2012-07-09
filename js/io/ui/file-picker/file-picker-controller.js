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


var Montage = require("montage/core/core").Montage,
    pickerNavigatorReel = require("js/io/ui/file-picker/picker-navigator.reel").PickerNavigator,
    filePickerModelModule = require("js/io/ui/file-picker/file-picker-model"),
    Popup = require("montage/ui/popup/popup.reel").Popup;

//singleton with functions to create a new file picker instance and utilities to format or filter the model data
var FilePickerController = exports.FilePickerController = Montage.create(require("montage/ui/component").Component, {
    /**
     * Register a listener for file open event
     */
    deserializedFromTemplate:{
        writable:false,
        enumerable:true,
        value:function(){
            this.eventManager.addEventListener("openFilePicker", this, false);
        }
    },

    pickerNavChoices:{
        enumerable: true,
        value: null
    },

    filePickerPopupType:{
        enumerable: false,
        value: "filePicker"
    },

    handleOpenFilePicker: {
        value: function(evt) {
            this.showFilePicker(evt.detail);
        }
    },

    /**
     *this function is used to create an instance of a file picker
     *
     * parameters:
     * settings is an object containing :
     *      callback [optional]: the call back function which will be used to send the selected URIs back. If undefined then an event is fired with the selected uri
     *      callbackScope : required if callback is set
     *      pickerMode [optional]: ["read", "write"] : specifies if the file picker is opened to read a file/folder or to save a file
     *      currentFilter [optional]: if a current filter needs to be applied [ex: .psd]
     *      allFileFilters [optional]: list of filters that user can use to filter the view
     *      inFileMode [optional]: true => allow file selection , false => allow directory selection
     *      allowNewFileCreation [optional]:  flag to specify whether or not it should return URI(s) to item(s) that do not exist. i.e. a user can type a filename to a new file that doesn't yet exist in the file system.
     *      allowMultipleSelections [optional]: allowMultipleSelections
     *      pickerName: name for montage custom popup
     *
     * return: none
     */

    showFilePicker:{
        writable:false,
        enumerable:true,
        value:function(settings){
            var callback, callbackScope, pickerMode, currentFilter, allFileFilters, inFileMode, allowNewFileCreation, allowMultipleSelections, pickerName;
            if(!!settings){
                if(typeof settings.callback !== "undefined"){callback = settings.callback;}
                if(typeof settings.pickerMode !== "undefined"){pickerMode = settings.pickerMode;}
                if(typeof settings.currentFilter !== "undefined"){currentFilter = settings.currentFilter;}
                if(typeof settings.allFileFilters !== "undefined"){allFileFilters = settings.allFileFilters;}
                if(typeof settings.inFileMode !== "undefined"){inFileMode = settings.inFileMode;}
                if(typeof settings.allowNewFileCreation !== "undefined"){allowNewFileCreation = settings.allowNewFileCreation;}
                if(typeof settings.allowMultipleSelections !== "undefined"){allowMultipleSelections = settings.allowMultipleSelections;}
                if(typeof settings.pickerName !== "undefined"){this.filePickerPopupType = settings.pickerName;}
            }

            if(settings.pickerName === "saveAsDirectoryPicker"){//need to set the picker mode in a better way
                pickerMode = "write";
            }else{
                pickerMode = "read";
            }

            var aModel = filePickerModelModule.FilePickerModel.create();

            var topLevelDirectories = null;
            var driveData = this.application.ninja.coreIoApi.getDirectoryContents({uri:"", recursive:false, returnType:"all"});
            if(driveData.success){
                topLevelDirectories = (JSON.parse(driveData.content)).children;
            }else{
                var errorCause = "";
                if(driveData.status === null){
                    errorCause = "Service Unavailable"
                }else{
                    errorCause = driveData.status;
                }
                aModel.fatalError = " ** Unable to get files [Error: "+ errorCause +"]";
            }

            //dummy data - TODO:remove after testing
            //aModel.currentFilter = "*.html, *.png";
            //aModel.currentFilter = "*.jpg";
            aModel.currentFilter = "*.*";
            aModel.inFileMode = true;
            aModel.fileFilters = [".html, .htm", ".jpg, .jpeg, .png, .gif", ".js, .json", ".css", ".txt, .rtf", ".doc, .docx", ".pdf", ".avi, .mov, .mpeg, .ogg, .webm", "*.*"];
            //-end - dummy data

            if(!!currentFilter){aModel.currentFilter = currentFilter;}
            if(typeof inFileMode !== "undefined"){aModel.inFileMode = inFileMode;}

            aModel.topLevelDirectories = topLevelDirectories;

            if(!!topLevelDirectories && !!topLevelDirectories[0]){
                aModel.currentRoot = aModel.currentLogicalDrive = topLevelDirectories[0].uri;
            }

            //populate the last opened folder first, if none then populate default root
            var storedUri = null;
            var sessionStorage = window.sessionStorage;
            try{
                if(pickerMode === "write"){
                    storedUri = sessionStorage.getItem("lastSavedFolderURI");
                }else if(inFileMode === true){
                    storedUri = sessionStorage.getItem("lastOpenedFolderURI_fileSelection");
                }else if(inFileMode === false){
                    storedUri = sessionStorage.getItem("lastOpenedFolderURI_folderSelection");
                }
            }catch(e){
                if(e.code == 22){
                    sessionStorage.clear();
                }
            }

            if(!!storedUri){
                aModel.currentRoot = decodeURI(storedUri);
            }

            if(!!allFileFilters){aModel.fileFilters = allFileFilters;}
            if(!!callback){aModel.callback = callback;}
            if(!!callbackScope){aModel.callbackScope = callbackScope;}
            if(typeof pickerMode !== "undefined"){aModel.pickerMode = pickerMode;}


            //logic: get file content data onDemand from the REST api for the default or last opened root. Cache the data in page [in local cache ? dirty fs? ]. Filter on client side to reduce network calls.
            this.openFilePickerAsModal(callback, aModel);


            //to open this on another modal dialog, make it a popup instead above the modal dialog container layer

        }
    },

    openFilePickerAsModal:{
          writable:false,
        enumerable:true,
        value:function(callback, aModel){
            var pickerNavChoices = this.pickerNavChoices = Montage.create(pickerNavigatorReel);
            var initUri = aModel.currentRoot;

            //remove extra / at the end
            if((initUri.length > 1) && (initUri.charAt(initUri.length - 1) === "/")){
                initUri = initUri.substring(0, (initUri.length - 1));
            }

            pickerNavChoices.mainContentData = this.prepareContentList(initUri, aModel);
            pickerNavChoices.pickerModel = aModel;

            var popup = Popup.create();
            popup.content = pickerNavChoices;
            popup.modal = true;
            popup.type = this.filePickerPopupType;//should be set always to not default to the single custom popup layer
            popup.show();
            pickerNavChoices.popup = popup;//handle to be used for hiding the popup
        }
    },
    openFilePickerAsPopup:{
          writable:false,
        enumerable:true,
        value:function(){}
    },

    expandDirectory:{
        writable:false,
        enumerable:true,
        value: function(root, currentFilter, inFileMode){
            //populate children in dom
        }
    },

    refreshDirectoryCache:{
        writable:false,
        enumerable:true,
        value:function(directoryUri){
            if(directoryContentCache[directoryUri] !== null){
                directoryContentCache[directoryUri] = null; //invalidate the cached content
                //fetch fresh content
            }
        }
    },

    /**
     * queries the cache to build contents array. If not found queries the file system
     *
     * parameters:
     * folderUri
     * aModel: model instance per picker instance, containing
     */

    prepareContentList:{
        writable: false,
        enumerable:true,
        value:function(folderUri, aModel, fromCache, checkStaleness){
            var contentList = [],
                childrenArray = [];

            var folderContent = null;
            // query filesystem and populate cache
            if(((typeof fromCache !== "undefined") && (fromCache === false))
                || !this._directoryContentCache[folderUri]
                || !this._directoryContentCache[folderUri].children){
                //get data using IO api
                try{
                    var iodata = this.application.ninja.coreIoApi.getDirectoryContents({uri:folderUri, recursive:false, returnType:"all"});
                    //console.log("IO:getDirectoryContents:Response:\n"+"uri="+folderUri+"\n status="+iodata.status+"\n content= "+iodata.content);
                    if(iodata.success && (iodata.status === 200) && (iodata.content !== null)){
                        folderContent = JSON.parse(iodata.content);
                    }
                }catch(e){
                    console.error("Error to IO uri: "+folderUri+"\n"+e.message);
                }

                if(!!folderContent){
                    //contentList = folderContent.children;//need to apply filters and mode
                    this.cacheContentForRandomAccess(folderUri, folderContent);
                }
            }
            //now from cache - apply filters and mode
            if((!!this._directoryContentCache[folderUri])
                    && (this._directoryContentCache[folderUri].type === "directory")
                    && (typeof this._directoryContentCache[folderUri].children !== "undefined")
                    && (this._directoryContentCache[folderUri].children !== null)){

                //console.log("$$$ this._directoryContentCache");
                //console.log(this._directoryContentCache);

                //check for directory staleness.... if stale query filesystem
                if((typeof checkStaleness === "undefined") || (checkStaleness === true)){
                    this.checkIfStale(folderUri);
                }

                childrenArray = this._directoryContentCache[folderUri].children;

                //prepare content array for folder uri
                childrenArray.forEach(function(item){
                    if(this._directoryContentCache[item]){
                        //apply mode and filtering here
                        if(aModel.inFileMode){// if in file selection mode, do filtering
                            if((this._directoryContentCache[item].type === "directory") || !aModel.currentFilter){//no filetering
                                contentList.push(this._directoryContentCache[item]);
                            }
                            else if(aModel.currentFilter){
                                if(this.applyFilter(this._directoryContentCache[item].name, aModel.currentFilter)){
                                    contentList.push(this._directoryContentCache[item]);
                                }
                            }
                        }else{// if in folder selection mode
                            if(this._directoryContentCache[item].type === "directory"){
                                contentList.push(this._directoryContentCache[item]);
                            }
                        }
                    }
                }, this);
            }
            else if((typeof this._directoryContentCache[folderUri] !== 'undefined') && (this._directoryContentCache[folderUri].type === "file")){//if the uri is for a file

                //check for directory staleness.... if stale query filesystem
                if((typeof checkStaleness === "undefined") || (checkStaleness === true)){
                    this.checkIfStale(folderUri);
                }

                contentList.push(this._directoryContentCache[folderUri]);
            }
            //end - from cache

            return contentList;
        }
    },

    /**
     * populates/updates cache for a uri
     */
    cacheContentForRandomAccess:{
            writable:false,
            enumerable:true,
            value: function(directoryUri, directoryContents){

                var that = this;
                //assumption: directoryContents will have only its direct files and subfolders
                //uri is the unique identifier


                //check if the directoryUri exists in cache
                //if not add uri content object, prepare children's uri array,then add/update objects for children
                if(!this._directoryContentCache[directoryUri]){//uri not in cache... so add it
                    //add uri content object
                    this._directoryContentCache[directoryUri] = {"type":directoryContents.type,"name":directoryContents.name,"uri":directoryUri};
                    if(!!directoryContents.size){
                        this._directoryContentCache[directoryUri].size = directoryContents.size;
                    }
                    if(!!directoryContents.creationDate){
                        this._directoryContentCache[directoryUri].creationDate = directoryContents.creationDate;
                    }
                    if(!!directoryContents.modifiedDate){
                        this._directoryContentCache[directoryUri].modifiedDate = directoryContents.modifiedDate;
                    }

                    //store the current queried time for refreshing cache logic
                    this._directoryContentCache[directoryUri].queriedTimeStamp = (new Date()).getTime();

                    if(!!directoryContents.children && directoryContents.children.length > 0){
                        this._directoryContentCache[directoryUri].children = [];

                        //add the uri to this._directoryContentCache[directoryUri].children, and add the child's description objects
                        directoryContents.children.forEach(function(obj){
                            //add uri to parent's children list
                            that._directoryContentCache[directoryUri].children.push(obj.uri);
                            //add the child object
                            that._directoryContentCache[obj.uri] = obj;

                            //store the current queried time for refreshing cache logic
                            that._directoryContentCache[obj.uri].queriedTimeStamp = (new Date()).getTime();

                        } ,this);
                    }
                }else{//uri in cache... so update it AND its children
                    this._directoryContentCache[directoryUri].type = directoryContents.type;
                    this._directoryContentCache[directoryUri].name = directoryContents.name;
                    if(!!directoryContents.size){
                        this._directoryContentCache[directoryUri].size = directoryContents.size;
                    }
                    if(!!directoryContents.creationDate){
                        this._directoryContentCache[directoryUri].creationDate = directoryContents.creationDate;
                    }
                    if(!!directoryContents.modifiedDate){
                        this._directoryContentCache[directoryUri].modifiedDate = directoryContents.modifiedDate;
                    }

                    //store the current queried time for refreshing cache logic
                    this._directoryContentCache[directoryUri].queriedTimeStamp = (new Date()).getTime();

                    if(!!directoryContents.children && directoryContents.children.length > 0){

                        // logic to clear off objects from cache if they no longer exist in the filesystem
                        //better logic - use isUpdatedFlag for a folder .. then compare modified date

                        //hack for now - clear up the old children and add new ones
                        var tempArr = this._directoryContentCache[directoryUri].children;
                        if( !!tempArr && Array.isArray(tempArr) && tempArr.length>0){
                           tempArr.forEach(function(uriString){
                               if(!!that._directoryContentCache[uriString]){
                                    delete that._directoryContentCache[uriString];
                               }
                           });
                        }

                        this._directoryContentCache[directoryUri].children = [];

                        //add the uri to this._directoryContentCache[directoryUri].children, and add the child's description objects
                        directoryContents.children.forEach(function(obj){
                            //add uri to parent's children list
                            that._directoryContentCache[directoryUri].children.push(obj.uri);
                            //add the child object
                            that._directoryContentCache[obj.uri] = obj;
                            //store the current queried time for refreshing cache logic
                            that._directoryContentCache[obj.uri].queriedTimeStamp = (new Date()).getTime();
                        } ,this);
                    }else{
                        this._directoryContentCache[directoryUri].children = [];
                    }
                }

                //console.log("$$$ "+directoryUri+" modifiedDate = "+this._directoryContentCache[directoryUri].modifiedDate);
                //console.log("$$$ "+directoryUri+" queriedTimeStamp = "+this._directoryContentCache[directoryUri].queriedTimeStamp);
            }
    },

    applyFilter:{
        writable: false,
        enumerable:true,
        value:function(fileName , filters){

            if(filters.indexOf("*.*") !== -1){return true;}

            //console.log(""+fileName);
            var filtersArr = filters.split(",");
            var passed = false;
            for(var i=0; i< filtersArr.length; i++){
                filtersArr[i] = filtersArr[i].trim();
                //console.log(filtersArr[i]);
                var fileType = filtersArr[i].substring(filtersArr[i].indexOf(".") );
                //console.log(""+fileType);

                //ignore uppercase
                fileName = fileName.toLowerCase();
                fileType = fileType.toLowerCase();

                if(fileName.indexOf(fileType, fileName.length - fileType.length) !== -1){//ends with file type
                    passed = true;
                    break;
                }
            }
            return passed;
        }
    },

    /**
     * Stale Time (ms) for each resource
     * Logic: the last queried time for a resource is compared to stale time. If stale, then file system is queried
     */
    cacheStaleTime:{
        writable: false,
        enumerable: false,
        value: 5000
    },

    checkIfStale: {
        writable: false,
        enumerable: true,
        value: function(folderUri){
            var wasStale = false;
            var folderContent = null;
            //check for directory staleness.... if stale query filesystem
            if((new Date()).getTime() > (this._directoryContentCache[folderUri].queriedTimeStamp + this.cacheStaleTime)){
                try{
                    var ifModifiedResponse = this.application.ninja.coreIoApi.isDirectoryModified({uri:folderUri, recursive:false, returnType:"all"}, this._directoryContentCache[folderUri].queriedTimeStamp);
                    //console.log("ifModifiedResponse");
                    //console.log(ifModifiedResponse);
                }catch(e){
                    console.error("Error to IO uri with isDirectoryModified: "+folderUri+"\n"+e.message);
                }
                if(ifModifiedResponse && ifModifiedResponse.status === 304){
                    //do nothing since the uri has not changed
                }else if(ifModifiedResponse && (ifModifiedResponse.status === 200)){
                    wasStale = true;
                    //uri has changed. so update cache
                    try{
                        var iodata = this.application.ninja.coreIoApi.getDirectoryContents({uri:folderUri, recursive:false, returnType:"all"});
                        //console.log("IO:getDirectoryContents:Response:\n"+"uri="+folderUri+"\n status="+iodata.status+"\n content= "+iodata.content);
                        if(iodata.success && (iodata.status === 200) && (iodata.content !== null)){
                            folderContent = JSON.parse(iodata.content);
                        }
                    }catch(e){
                        console.error("Error to IO uri: "+folderUri+"\n"+e.message);
                    }

                    if(!!folderContent){
                        this.cacheContentForRandomAccess(folderUri, folderContent);
                    }
                }
            }

            return wasStale;
        }
    },

    /**
     * This will store the directory content per session
     * check session storage for this
     */
    _directoryContentCache:{
        writable:true,
        enumerable:false,
        value:{}
    },

    clearCache:{
        writable:false,
        enumerable: true,
        value: function(){
            this._directoryContentCache = {};
        }
    }
});
