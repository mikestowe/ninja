/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
     iconsListModule = require("js/components/ui/icon-list-basic/iconsList.reel"),
    treeModule = require("js/components/ui/tree-basic/tree.reel"),
    newFileLocationSelectionModule = require("js/io/workflow/newFileDialog/new-file-workflow-controller"),
    fileUtils = require("js/io/utils/file-utils").FileUtils;

var NewFileOptionsNavigator = exports.NewFileOptionsNavigator = Montage.create(Component, {

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
        value:""
    },
    newFileDirectory:{
        writable:true,
        enumerable:false,
        value:""
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
    willDraw: {
    	enumerable: false,
    	value: function() {}
    },
    draw: {
    	enumerable: false,
    	value: function() {}
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

            this.element.addEventListener("drawTree", function(evt){that.handleNewFileNavDrawTree(evt);}, false);
            this.element.addEventListener("selectedItem", function(evt){that.handleNewFileNavSelectedItem(evt);}, false);//for single selection only
            this.eventManager.addEventListener("newFileDirectorySet", function(evt){that.handleNewFileDirectorySet(evt);}, false);
            this.eventManager.addEventListener("newFileNameSet", function(evt){that.handleNewFileNameSet(evt);}, false);

            if(!!this.newFileModel.defaultProjectType){
                var templates = this.newFileModel.prepareContents(this.newFileModel.defaultProjectType);
                this.templateList = iconsListModule.IconsList.create();
                this.templateList.iconsViewDataObject = templates;
                this.templateList.element = this.templateIcons;
                this.templateList.needsDraw = true;


                this.selectedProjectType = {"uri":this.newFileModel.defaultProjectType, "element":null};
            }
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

                //disable ok
                if(!this.okButton.hasAttribute("disabled")){
                    this.okButton.setAttribute("disabled", "true");
                }

                //save project type selection
                this.selectedProjectType = {"uri":evt.uri, "element":evt.target};

                //render templates
                var templates = this.newFileModel.prepareContents(evt.uri);
                if(this.templatesContainer.querySelectorAll(".list").length > 0){
                    this.templateList.iconsViewDataObject = templates;
                }else{
                    this.templateList = iconsListModule.IconsList.create();
                    this.templateList.iconsViewDataObject = templates;
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
            var selectedProjectTypeID = this.selectedProjectType.uri,
                templateID = this.selectedTemplate.uri,
                projectName = this.newFileLocation.newFileName.value,
                projectDirectory = this.newFileLocation.fileInputField.newFileDirectory.value,
                projectWidth = this.newFileLocation.templateWidth,
                projectHeight = this.newFileLocation.templateHeight,


                selectionlog= "selectedProjectTypeID="+selectedProjectTypeID +"\n"+
                            "templateID="+templateID+ "\n"+
                            "projectName="+projectName+"\n"+
                            "projectDirectory="+projectDirectory+"\n"+
                            "projectWidth="+projectWidth+"\n"+
                            "projectHeight="+projectHeight;

            if(!!this.selectedProjectType && !!this.selectedTemplate
                && this.isValidFileName(projectName) && this.isValidUri(projectDirectory)
                && !this.checkFileExists(projectName, projectDirectory, this.selectedProjectType)
            ){
                this.error.innerHTML="";
                console.log("$$$ new file selections: \n" + selectionlog);
                if(!!this.newFileModel.callback && !!this.newFileModel.callbackScope){//inform document-controller if save successful
                    this.newFileModel.callback.call(this.newFileModel.callbackScope, {"selectedProjectTypeID":selectedProjectTypeID,
                                                                                 "templateID":templateID,
                                                                                 "projectName": projectName,
                                                                                 "projectDirectory":projectDirectory,
                                                                                 "projectWidth":projectWidth,
                                                                                 "projectHeight":projectHeight});//document-controller api
                }else{
                    //send selection event
                    var newFileSelectionEvent = document.createEvent("Events");
                    newFileSelectionEvent.initEvent("createNewFile", false, false);
                    newFileSelectionEvent.newFileOptions = {"selectedProjectTypeID":selectedProjectTypeID,
                                                             "templateID":templateID,
                                                             "projectName": projectName,
                                                             "projectDirectory":projectDirectory,
                                                             "projectWidth":projectWidth,
                                                             "projectHeight":projectHeight};
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
                if(this.error.innerHTML !== ""){
                    this.showError("! Project Template, Name and Directory should be valid.");
                }
                //disable ok
                if(!this.okButton.hasAttribute("disabled")){
                    this.okButton.setAttribute("disabled", "true");
                }
            }
        }
    },

    handleNewFileDirectorySet:{
        value:function(evt){
            if(!!evt._event.newFileDirectory){
                this.newFileDirectory = evt._event.newFileDirectory;
                if(this.isValidUri(this.newFileDirectory)){
                    this.enableOk();
                }
            }
        }
    },

    handleNewFileNameSet:{
        value:function(evt){
            if(!!evt._event.newFileName){
                this.newFileName = evt._event.newFileName;
                if(this.isValidFileName(this.newFileName)){
                    this.enableOk();
                }
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
                && !this.checkFileExists(this.newFileName, this.newFileDirectory, this.selectedProjectType)
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
            this.selectedProjectType = null;
            this.selectedTemplate = null;

            //remove event listeners
            this.element.removeEventListener("drawTree", function(evt){that.handleNewFileNavDrawTree(evt);}, false);
            this.element.removeEventListener("selectedItem", function(evt){that.handleNewFileNavSelectedItem(evt);}, false);//for single selection only
            this.eventManager.removeEventListener("newFileDirectorySet", function(evt){that.handleNewFileDirectorySet(evt);}, false);
            this.eventManager.removeEventListener("newFileNameSet", function(evt){that.handleNewFileNameSet(evt);}, false);
        }
    },

    isValidUri:{
        value: function(uri){
            var status= fileUtils.isValidUri(uri);
            if(uri !== ""){
                if(!status){
                    this.showError("! Invalid directory.");
                }
            }
            return status;
        }
    },
    isValidFileName:{
        value: function(fileName){
            var status = fileUtils.isValidFileName(fileName);
            if(fileName !== ""){
                if(!status){
                    this.showError("! Invalid file name.");
                }
            }
            return status;
        }
    },
    checkFileExists:{
        value: function(fileUri, folderUri, fileType){
            var status= fileUtils.checkFileExists(fileUri, folderUri, fileType);
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
            //disable ok
            if(!this.okButton.hasAttribute("disabled")){
                this.okButton.setAttribute("disabled", "true");
            }
        }
    }

});