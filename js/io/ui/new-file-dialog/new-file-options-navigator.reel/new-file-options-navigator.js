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

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
     iconsListModule = require("js/components/ui/icon-list-basic/iconsList.reel"),
    treeModule = require("js/components/ui/tree-basic/tree.reel"),
    newFileLocationSelectionModule = require("js/io/ui/new-file-dialog/new-file-workflow-controller");

var NewFileOptionsNavigator = exports.NewFileOptionsNavigator = Montage.create(Component, {

    projectTypeTree: {
        value: null,
        serializable: true
    },

    cancelButton: {
        value: null,
        serializable: true
    },

    okButton: {
        value: null,
        serializable: true
    },

    templateIcons: {
        value: null,
        serializable: true
    },

    templatesContainer: {
        value: null,
        serializable: true
    },

    locationSelection: {
        value: null,
        serializable: true
    },

    newFileLocation: {
        value: null,
        serializable: true
    },

    error: {
        value: null,
        serializable: true
    },

    newFileModel: {
        writable: true,
        enumerable:false,
        value:null
    },
    selectedProjectType:{
        writable: true,
        enumerable:false,
        value:null
    },
    selectedTemplate:{
        writable: true,
        enumerable:false,
        value:null
    },
    newFileName:{
        writable:true,
        enumerable:false,
        value:null
    },
    newFileDirectory:{
        writable:true,
        enumerable:false,
        value:null
    },
    templateWidth:{
        writable:true,
        enumerable:false,
        value:"0 px"
    },
    templateHeight:{
        writable:true,
        enumerable:false,
        value:"0 px"
    },

    // Populating the directory input field with the default save location or the last stored location.
    prepareForDraw: {
        value: function() {
            var defaultSaveDirectory;

            // Using session storage location
            if(window.sessionStorage) {
                var storedFolder = window.sessionStorage.getItem("lastOpenedFolderURI_folderSelection");
                if(storedFolder)  defaultSaveDirectory = decodeURI(window.sessionStorage.getItem("lastOpenedFolderURI_folderSelection"));
            }

            // Use default if none found in session storage
            if(!defaultSaveDirectory) {
                var driveData = this.application.ninja.coreIoApi.getDirectoryContents({uri:"", recursive:false, returnType:"all"});
                if(driveData.success){
                    var topLevelDirectories = (JSON.parse(driveData.content)).children;
                    defaultSaveDirectory = topLevelDirectories[0].uri;
                } else {
                    console.log("** Error ** Cannot get directory listing");
                    defaultSaveDirectory = "";
                }
            }

            // Set the input field to the correct directory
            this.newFileLocation.fileInputField.newFileDirectory.value = defaultSaveDirectory;
            this.newFileDirectory = defaultSaveDirectory;
        }
    },

    didDraw: {
        enumerable: false,
        value: function() {
            var that = this;

            this.templateList = null;

            //draw left nav project type tree
            var tree = treeModule.Tree.create();
            tree.showIcons = false;
            tree.expandTreeAfterDraw = true;
            tree.directoryBold = true;
            tree.highlightedUri = this.newFileModel.defaultProjectType;
            tree.treeViewDataObject = this.newFileModel.prepareContents("categories");
            tree.element = this.projectTypeTree;
            tree.needsDraw = true;

            //highlight defaultProjectType

            this.addIdentifiers();

            if(!!this.newFileModel.defaultProjectType){
                var templates = this.newFileModel.prepareContents(this.newFileModel.defaultProjectType);
                this.templateList = iconsListModule.IconsList.create();
                this.templateList.iconsViewDataObject = templates;
                if(templates.length >0){
                    this.templateList.selected = templates[0].uri;
                }
                this.templateList.element = this.templateIcons;
                this.templateList.needsDraw = true;

                this.selectedProjectType = {"uri":this.newFileModel.defaultProjectType, "element":null};
            }

            //update file Extension
            if(!!this.newFileModel.projectTypeData[this.newFileModel.defaultProjectType].fileExtension){
                var fileExtensionEl = this.element.querySelector(".fileExtension");
                if(!!fileExtensionEl){
                    fileExtensionEl.innerHTML = ""+this.newFileModel.projectTypeData[this.newFileModel.defaultProjectType].fileExtension;
                }
            }

            this.element.addEventListener("drawTree", function(evt){that.handleNewFileNavDrawTree(evt);}, false);
            this.element.addEventListener("selectedItem", function(evt){that.handleNewFileNavSelectedItem(evt);}, false);//for single selection only
            this.eventManager.addEventListener("newFileDirectorySet", function(evt){
                that.handleNewFileDirectorySet(evt);
            }, false);
            this.eventManager.addEventListener("newFileNameSet", function(evt){
                that.handleNewFileNameSet(evt);
            }, false);

            this.okButton.addEventListener("click", function(evt){that.handleOkButtonAction(evt);}, false);
            this.cancelButton.addEventListener("click", function(evt){that.handleCancelButtonAction(evt);}, false);

            this.element.addEventListener("keyup", function(evt){
                if(evt.keyCode == 27) {//ESC key
                    if(that.application.ninja.newFileController.newFileOptionsNav !== null){
                        that.handleCancelButtonAction();
                    }
                }else if((evt.keyCode == 13) && !(evt.ctrlKey || evt.metaKey)){//ENTER key
                    if((that.application.ninja.newFileController.newFileOptionsNav !== null)
                        && !that.okButton.hasAttribute("disabled")){

                        that.handleOkButtonAction();
                    }
                }
            }, true);

            this.eventManager.addEventListener("enterKey", this, false);
            this.eventManager.addEventListener("escKey", this, false);

        }

    },

    /**
     * Event Listners
     */

    addIdentifiers:{
        value: function(){
            this.element.identifier = "newFileNav";
        }
    },

    handleNewFileNavDrawTree:{
        value: function(evt){
                //toggle open or close for directory
                if((evt.uriType === "directory") && (!!evt.subTreeContainer)){
                    var tree = treeModule.Tree.create();
                    tree.showIcons = false;
                    tree.highlightedUri = this.newFileModel.defaultProjectType;
                    tree.treeViewDataObject = this.newFileModel.prepareContents(evt.uri);
                    tree.element = evt.subTreeContainer;
                    tree.needsDraw = true;
                }
            }
    },

    handleNewFileNavSelectedItem:{
        value: function(evt){
            var selectionType =  this.newFileModel.projectTypeData[evt.uri].type;
            if(evt.target.classList.contains("atreeItemContent") && (selectionType === "file")){//populate templates for project type selection
                this.highlightSelection(evt.target, "projectType", evt.uri);

                //clear current template selection
                if((!!this.selectedTemplate) && (this.selectedTemplate.element.classList.contains("selected"))){
                    this.selectedTemplate.element.classList.remove("selected");
                }

                //update file Extension
                if(!!this.newFileModel.projectTypeData[evt.uri].fileExtension){
                    var fileExtensionEl = this.element.querySelector(".fileExtension");
                    if(!!fileExtensionEl){
                        fileExtensionEl.innerHTML = ""+this.newFileModel.projectTypeData[evt.uri].fileExtension;
                    }
                }

                //save project type selection
                this.selectedProjectType = {"uri":evt.uri, "element":evt.target};

                //render templates
                var templates = this.newFileModel.prepareContents(evt.uri);
                if(this.templatesContainer.querySelectorAll(".list").length > 0){
                    this.templateList.iconsViewDataObject = templates;
                    if(templates.length >0){
                        this.templateList.selected = templates[0].uri;
                    }
                }else{
                    this.templateList = iconsListModule.IconsList.create();
                    this.templateList.iconsViewDataObject = templates;
                    if(templates.length >0){
                        this.templateList.selected = templates[0].uri;
                    }
                    this.templateList.element = this.templateIcons;
                    this.templateList.needsDraw = true;
                }


            }

            if(evt.target.classList.contains("icon")){
                this.highlightSelection(evt.target, "template", evt.uri);

                //save template selection
                this.selectedTemplate = {"uri":evt.uri, "element":evt.target};

                this.enableOk();

            }
        }
    },

    handleCancelButtonAction :{
        value:function(evt){
                //clean up memory
                this.cleanup();

                if(this.popup){
                    this.popup.hide();
                }

            }
    },

    handleOkButtonAction:{
        value: function(evt){
            var templateData,
                selectedProjectTypeID = this.selectedProjectType.uri,
                templateID = this.selectedTemplate.uri,
                projectName = this.newFileLocation.newFileName.value,
                projectDirectory = this.newFileLocation.fileInputField.newFileDirectory.value,
                projectWidth = this.newFileLocation.templateWidth,
                projectHeight = this.newFileLocation.templateHeight,

                newFilePath = "", fileExtension=this.newFileModel.projectTypeData[selectedProjectTypeID].fileExtension,

                selectionlog= "selectedProjectTypeID="+selectedProjectTypeID +"\n"+
                            "templateID="+templateID+ "\n"+
                            "projectName="+projectName+"\n"+
                            "projectDirectory="+projectDirectory+"\n"+
                            "projectWidth="+projectWidth+"\n"+
                            "projectHeight="+projectHeight;
            ////////////////////////////////////////////////////////////////////
            //Template data must be passed during file creation (lots of confusion data here, should be cleaned up…)
            templateData = {id: templateID, name: this.newFileModel.projectTypeData[selectedProjectTypeID].name, type: this.newFileModel.projectTypeData[selectedProjectTypeID].type};
            ////////////////////////////////////////////////////////////////////

            if(/[^/\\]$/g.test(projectDirectory)){
                projectDirectory = projectDirectory + "/";
            }

            if(!!fileExtension && ((projectName.lastIndexOf(fileExtension) === -1) || (projectName.lastIndexOf(fileExtension) !== (projectName.length - fileExtension.length)))){
                projectName = projectName+fileExtension;//append file extension if file extension is already not present or is actually part of the file name
            }
            newFilePath = "" + projectDirectory + projectName;


            if(!!this.selectedProjectType && !!this.selectedTemplate
                && this.isValidFileName(projectName) && this.isValidUri(projectDirectory)
                && !this.checkFileExists(projectName, projectDirectory, fileExtension)
            ){
                this.error.innerHTML="";
                //console.log("$$$ new file selections: \n" + selectionlog);
                if(!!this.newFileModel.callback){//inform document-controller if save successful
                    this.newFileModel.callback({"fileTemplateUri":selectedProjectTypeID,
                                                 "newFilePath":newFilePath,
                                                  "fileExtension":fileExtension,
                                                   "template":templateData});//document-controller api
                }else{
                    //send selection event
                    var newFileSelectionEvent = document.createEvent("Events");
                    newFileSelectionEvent.initEvent("createNewFile", false, false);
                    newFileSelectionEvent.newFileOptions = {"fileTemplateUri":selectedProjectTypeID, "newFilePath":newFilePath,"fileExtension":fileExtension};
                    this.eventManager.dispatchEvent(newFileSelectionEvent);
                }
                //store last selected project type
                var dataStore = window.sessionStorage;
                try {
                    dataStore.setItem('lastSelectedProjectType',escape(""+selectedProjectTypeID));
                }
                catch(e){
                    if(e.code == 22){
                        dataStore.clear();
                    }
                }

                this.cleanup();//clear up any unnecessary memory

                if(this.popup){
                    this.popup.hide();
                }
            }else{
                if(this.error.innerHTML === ""){
                    this.showError("! Project Template, Name and Directory should be valid.");
                    //disable ok
                    if(!this.okButton.hasAttribute("disabled")){
                        this.okButton.setAttribute("disabled", "true");
                    }
                }else if(!this.selectedProjectType || !this.selectedTemplate){
                    this.showError("! Project Template should be selected.");
                    //disable ok
                    if(!this.okButton.hasAttribute("disabled")){
                        this.okButton.setAttribute("disabled", "true");
                    }
                }
            }
        }
    },

    handleNewFileDirectorySet:{
        value:function(evt){
            this.newFileDirectory = evt._event.newFileDirectory;
            if(this.isValidUri(this.newFileDirectory)){
                this.enableOk();
            }
        }
    },

    handleNewFileNameSet:{
        value:function(evt){
            this.newFileName = evt._event.newFileName;
            if(this.isValidFileName(this.newFileName)){
                this.enableOk();
            }
        }
    },

    handleEnterKey:{
        value: function(evt){
            if((this.application.ninja.newFileController.newFileOptionsNav !== null)
                  && !this.okButton.hasAttribute("disabled")){

                    this.handleOkButtonAction(evt);
              }
        }
    },

    handleEscKey:{
        value: function(evt){
            if(this.application.ninja.newFileController.newFileOptionsNav !== null){
                this.handleCancelButtonAction(evt);
            }
        }
    },

    highlightSelection:{
        value: function(el, selectionType, uri){
            var elem;
            //clear previous selection
            if(selectionType === "projectType"){
                if((!!this.selectedProjectType) && (uri !== this.selectedProjectType.uri)){
                    if(!!this.selectedProjectType.element){
                        this.selectedProjectType.element.classList.remove("selected");
                    }else{
                        //find the selected element
                        elem = document.querySelector(".projectTypeTree").querySelector(".selected");
                        if(!!elem){
                            elem.classList.remove("selected");
                        }
                    }
                    el.classList.add("selected");
                }else if(this.selectedProjectType === null){
                    el.classList.add("selected");
                }
            }else if(selectionType === "template"){
                if((!!this.selectedTemplate) && (uri !== this.selectedTemplate.element)){
                    if(!!this.selectedTemplate.element){this.selectedTemplate.element.classList.remove("selected");}
                    el.classList.add("selected");
                }else if(this.selectedTemplate === null){
                    el.classList.add("selected");
                }
            }

        }
    },

    enableOk:{
        value: function(){
            var status = false;

            if(!!this.selectedProjectType && !!this.selectedTemplate
                && this.isValidFileName(this.newFileName) && this.isValidUri(this.newFileDirectory)
                ){
                status = true;
                this.okButton.removeAttribute("disabled");
                this.error.innerHTML="";
            }
            return status;
        }
    },

    cleanup:{
        value:function(){
            var that = this;

            this.newFileName = "";
            this.newFileDirectory = "";

            //remove event listeners
            this.element.removeEventListener("drawTree", function(evt){that.handleNewFileNavDrawTree(evt);}, false);
            this.element.removeEventListener("selectedItem", function(evt){that.handleNewFileNavSelectedItem(evt);}, false);//for single selection only
            this.eventManager.removeEventListener("newFileDirectorySet", function(evt){that.handleNewFileDirectorySet(evt);}, false);
            this.eventManager.removeEventListener("newFileNameSet", function(evt){that.handleNewFileNameSet(evt);}, false);

            this.application.ninja.newFileController.newFileOptionsNav = null;
        }
    },

    isValidUri:{
        value: function(uri){
            var status= this.application.ninja.coreIoApi.isValidUri(uri);
            if((uri !== null) && !status){
                    this.showError("! Invalid directory.");
                    //disable ok
                    if(!this.okButton.hasAttribute("disabled")){
                        this.okButton.setAttribute("disabled", "true");
                    }
            }
            return status;
        }
    },
    isValidFileName:{
        value: function(fileName){
            var status = this.validateFileName(fileName);
            if((fileName !== null ) && !status){
                    this.showError("! Invalid file name.");
                    //disable ok
                    if(!this.okButton.hasAttribute("disabled")){
                        this.okButton.setAttribute("disabled", "true");
                    }
            }
            return status;
        }
    },
    checkFileExists:{
        value: function(fileName, folderUri, fileType){
            var uri = "", response=null, status=true;
            //prepare absolute uri
            if(/[^/\\]$/g.test(folderUri)){
                folderUri = folderUri + "/";
            }
            if(!!fileType && (fileName.lastIndexOf(fileType) !== (fileName.length - fileType.length))){
                fileName = fileName+fileType;
            }
            uri = ""+folderUri+fileName;
            response= this.application.ninja.coreIoApi.fileExists({"uri":uri});
            if(!!response && response.success && (response.status === 204)){
                status = true;
            }else if(!!response && response.success && (response.status === 404)){
                status = false;
            }else{
                status = false;
            }

            if(status){
                this.showError("! File already exists.");
            }
            return status;
        }
    },
    showError:{
        value:function(errorString){
            this.error.innerHTML = "";
            this.error.innerHTML=errorString;
        }
    },

        /***
         * file name validation
         */
        validateFileName:{
            value: function(fileName){
                var status = false;
                if((fileName !== null) && (fileName !== "")){
                    fileName = fileName.replace(/^\s+|\s+$/g,"");
                    if(fileName === ""){return false;}
                    status = !(/[/\\]/g.test(fileName));
                    if(status && navigator.userAgent.indexOf("Macintosh") != -1){//for Mac files beginning with . are hidden
                        status = !(/^\./g.test(fileName));
                    }
                }
                return status;
            }
        }

});
